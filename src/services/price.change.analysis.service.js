/* eslint-disable max-len */
import cron from 'node-cron';

const CRON_DAILY_12AM = '0 0 0 * * *' // every day at 12:00 AM
const CRON_EVERY_20M = '0 */2 * * * *' // every 20 minutes

const XRATES_CHANGE_PERCENTAGES = [2, 5, 10]
const CHANGE_24H = 'change_24hour'
const EMOJI_ARROW_UP = '\u2B06'
const EMOJI_ARROW_DOWN = '\u2B07'

class PriceChangeAnalysisService {
    constructor(logger, appConfig, coinsConfig, messagingProvider, dataCollectorService) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins
        this.supportedCoinCodes = this.supportedCoins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency

        this.messagingProvider = messagingProvider
        this.dataCollectorService = dataCollectorService

        this.sentNotifications = []
        this.getDailyOpeningXRates()
    }

    start() {
        cron.schedule(CRON_DAILY_12AM, () => {
            this.sentNotifications = []
            this.getDailyOpeningXRates()
        });

        cron.schedule(CRON_EVERY_20M, () => {
            this.checkXRateChanges(CHANGE_24H)
        });
    }

    async getDailyOpeningXRates() {
        this.dailyOpeningXRates = await this.dataCollectorService.getDailyOpeningXRates(
            this.supportedCoinCodes,
            this.baseCurrency
        )
        this.logger.info('"Daily opening xrates" data collected')
    }

    async checkXRateChanges(period) {
        const latestXRates = await this.dataCollectorService.getLatestXRates(
            this.supportedCoinCodes,
            this.baseCurrency
        )

        this.logger.info(`Checking ${period} price changes.`)

        if (this.dailyOpeningXRates && latestXRates) {
            Object.values(this.dailyOpeningXRates).forEach(dailyOpeningXRate => {
                const latestXRate = latestXRates.find(xrate => xrate[0].coinCode === dailyOpeningXRate[0].coinCode)
                if (latestXRate) {
                    const changePercentage = PriceChangeAnalysisService.calculateXRateChangePercentage(
                        dailyOpeningXRate[0].rate,
                        latestXRate[0].rate
                    )

                    Object.values(XRATES_CHANGE_PERCENTAGES).forEach(percentage => {
                        if (percentage <= Math.abs(changePercentage)) {
                            this.logger.info(`Coin: ${dailyOpeningXRate[0].coinCode}, Opening rate:${dailyOpeningXRate[0].rate}, Latest Rate:${latestXRate[0].rate}`)

                            if (!this.isNotificationAlreadySent(dailyOpeningXRate[0].coinCode, percentage)) {
                                this.sendXRateChangeDataMessage(
                                    dailyOpeningXRate[0].coinCode,
                                    period,
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
        const changePercentage = parseFloat((diff * 100) / rateSource)

        return Math.round(changePercentage * 10) / 10
    }

    isNotificationAlreadySent(coinCode, changePercentage) {
        const notified = this.sentNotifications.find(
            notifData => coinCode === notifData.coinCode && notifData.changePercentage === changePercentage
        )

        if (notified) {
            this.logger.info(`CoinCode:${coinCode}, for change%:${changePercentage} already notified`)
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
        const status = await this.messagingProvider.sendDataMessageToChannel(channelName, data)
        this.logger.info(`Response status: ${status}`)

        return status
    }
}

export default PriceChangeAnalysisService
