import cron from 'node-cron';
import XRatesProvider from './providers/xrates/xrates.provider';
import MessagingServiceProvider from './providers/messaging/messaging.provider';

const CRON_DAILY_12AM = '0 0 0 * * *' // every day at 12:00 AM
const CRON_EVERY_15M = '0 */18 * * * *' // every 10 minutes
const XRATES_CHANGE_PERCENTAGES = [2, 5, 10]
const CHANGE_24H = 'change_24hour'
const EMOJI_ARROW_UP = '\u2B06'
const EMOJI_ARROW_DOWN = '\u2B07'

class MonitoringService {
    constructor(appConfig, coinsConfig, logger) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins
        this.supportedCoinCodes = this.supportedCoins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency
        this.xratesProvider = new XRatesProvider(
            this.appConfig,
            this.coinsConfig,
            this.logger
        );

        this.messagingProvider = new MessagingServiceProvider(
            this.appConfig.service_providers.push_notification_provider,
            this.logger
        );

        this.sentNotifications = []
        this.setDailyOpeningXRates()
    }

    start() {
        this.startXRatesMonitoringTask()
    }

    startXRatesMonitoringTask() {
        cron.schedule(CRON_DAILY_12AM, () => {
            this.sentNotifications = []
            this.setDailyOpeningXRates()
        });

        cron.schedule(CRON_EVERY_15M, () => {
            this.checkXRateChanges24h()
        });
    }

    async setDailyOpeningXRates() {
        await new Promise(r => setTimeout(r, 2500));
        this.dailyOpeningXRates = await this.xratesProvider.getXRates(this.supportedCoinCodes, this.baseCurrency)
        this.logger.info('"Daily opening xrates" data collected')
    }

    async checkXRateChanges24h() {
        const latestXRates = await this.xratesProvider.getXRates(this.supportedCoinCodes, this.baseCurrency)
        this.logger.info('Checking 24hour price changes.')

        if (this.dailyOpeningXRates && latestXRates) {
            Object.values(this.dailyOpeningXRates).forEach(dailyOpeningXRate => {
                const latestXRate = latestXRates.find(xrate => xrate[0].coinCode === dailyOpeningXRate[0].coinCode)
                if (latestXRate) {
                    const changePercentage = MonitoringService.calculateXRateChangePercentage(
                        dailyOpeningXRate[0].rate,
                        latestXRate[0].rate
                    )

                    Object.values(XRATES_CHANGE_PERCENTAGES).forEach(percentage => {
                        if (percentage <= Math.abs(changePercentage)) {
                            this.logger.info(`Coin: ${dailyOpeningXRate[0].coinCode}, Opening rate:${dailyOpeningXRate[0].rate}, Latest Rate:${latestXRate[0].rate}`)

                            if (!this.isNotificationAlreadySent(dailyOpeningXRate[0].coinCode, percentage)) {
                                this.sendXRateChangeDataMessage(
                                    dailyOpeningXRate[0].coinCode,
                                    CHANGE_24H,
                                    percentage,
                                    changePercentage
                                )
                            }
                        }
                    });
                }
            });
        }
    }

    static calculateXRateChangePercentage(rateSource, rateTarget) {
        const diff = rateTarget - rateSource
        const changePercentage = parseFloat((diff * 100) / Math.max(rateSource, rateTarget))

        return Math.round(changePercentage * 10) / 10
    }

    async isNotificationAlreadySent(coinCode, changePercentage) {
        const notified = this.sentNotifications.find(
            notifData => coinCode === notifData.coinCode && notifData.changePercentage === changePercentage
        )

        if (notified) {
            this.logger(`CoinCode:${coinCode}, for change%:${changePercentage} already notified`)
            return true
        }

        this.sentNotifications.push({ coinCode, changePercentage })

        return false
    }

    async sendXRateChangeNotification(coinCode, alertPercentage, changePercentage) {
        const channelName = `${coinCode}_24hour_${alertPercentage}percent`
        const title = coinCode
        const body = changePercentage

        this.logger.info(`Send Notification Coin:${coinCode}, Alert %:${alertPercentage}, Change %:${changePercentage}`)
        this.messagingProvider.sendNotificationToChannel(channelName, title, body)
    }

    async sendXRateChangeDataMessage(coinCode, change, alertPercentage, changePercentage) {
        const channelName = `${coinCode}_24hour_${alertPercentage}percent`
        const coinFound = this.supportedCoins.find(coin => coin.code === coinCode)
        const emojiCode = changePercentage > 0 ? EMOJI_ARROW_UP : EMOJI_ARROW_DOWN
        const changeDirection = changePercentage > 0 ? 'up' : 'down'
        const args = [coinCode, changePercentage, emojiCode]
        const data = {
            'title-loc-key': coinFound.title,
            'loc-key': `${change}_${changeDirection}`,
            'loc-args': args
        };

        this.logger.info(`Send Notification Coin:${coinCode}, Alert %:${alertPercentage}, Change %:${changePercentage}`)
        this.messagingProvider.sendDataMessageToChannel(channelName, data)
    }
}

export default MonitoringService;
