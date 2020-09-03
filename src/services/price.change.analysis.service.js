/* eslint-disable max-len */
import cron from 'node-cron';
import XRate from '../models/xrate.model';

const CRON_DAILY_12AM = '0 5 0 * * *' // every day at 12:05 AM
const CRON_EVERY_20M = '0 */20 * * * *' // every 20 minutes

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
    }

    start() {
        this.getDailyOpeningXRates()

        cron.schedule(CRON_DAILY_12AM, () => {
            this.sentNotifications = []
            this.getDailyOpeningXRates()
        });

        cron.schedule(CRON_EVERY_20M, () => {
            this.checkXRateChanges(CHANGE_24H)
        });
    }

    addAdditionalCoin(coinId, coinCode, xrates) {
        const xrate = xrates.find(e => e.coinCode === coinCode)
        if (xrate) {
            xrates.push(new XRate(coinId, coinCode, this.baseCurrency, xrate.rate))
        }
    }

    async getDailyOpeningXRates() {
        this.dailyOpeningXRates = []
        this.dailyOpeningXRates = await this.dataCollectorService.getDailyOpeningXRates(
            this.supportedCoinCodes,
            this.baseCurrency
        )
        if (this.dailyOpeningXRates) {
            this.addAdditionalCoin('BNB-ERC20', 'BNB', this.dailyOpeningXRates)
            this.logger.info('[PriceChange] Daily opening xrates" data collected')
        }
    }

    async checkXRateChanges(period) {
        const latestXRates = await this.dataCollectorService.getLatestXRates(
            this.supportedCoinCodes,
            this.baseCurrency
        )

        if (this.dailyOpeningXRates && latestXRates) {
            this.addAdditionalCoin('BNB-ERC20', 'BNB', latestXRates)
            this.logger.info(`[PriceChange] Checking ${period} price changes.`)

            Object.values(this.dailyOpeningXRates).forEach(dailyOpeningXRate => {
                const latestXRate = latestXRates.find(xrate => xrate.coinId === dailyOpeningXRate.coinId)
                if (latestXRate) {
                    const changePercentage = PriceChangeAnalysisService.calculateXRateChangePercentage(
                        dailyOpeningXRate.rate,
                        latestXRate.rate
                    )

                    Object.values(XRATES_CHANGE_PERCENTAGES).forEach(percentage => {
                        if (percentage <= Math.abs(changePercentage)) {
                            this.logger.info(`[PriceChange] Coin: ${dailyOpeningXRate.coinId}, Opening rate:${dailyOpeningXRate.rate}, Latest Rate:${latestXRate.rate}`)

                            if (!this.isNotificationAlreadySent(dailyOpeningXRate.coinId, percentage)) {
                                this.sendXRateChangeDataMessage(
                                    dailyOpeningXRate.coinId,
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
        const changePercentage = (diff * 100) / rateSource

        return Math.round(changePercentage * 10) / 10
    }

    isNotificationAlreadySent(coinId, changePercentage) {
        const notified = this.sentNotifications.find(
            notifData => coinId === notifData.coinId && notifData.changePercentage === changePercentage
        )

        if (notified) {
            this.logger.info(`[PriceChange] Coin:${coinId}, for change%:${changePercentage} already notified`)
            return true
        }

        this.sentNotifications.push({ coinId, changePercentage })

        return false
    }

    async sendXRateChangeNotification(coinId, alertPercentage, changePercentage) {
        const channelName = `${coinId}_24hour_${alertPercentage}percent`
        const title = coinId
        const body = changePercentage

        this.logger.info(`[PriceChange] Send Notif: Coin:${coinId}, Alert %:${alertPercentage}, Change %:${changePercentage}`)
        this.messagingProvider.sendNotificationToChannel(channelName, title, body)
    }

    async sendXRateChangeDataMessage(coinId, change, alertPercentage, changePercentage) {
        const channelName = `${coinId}_24hour_${alertPercentage}percent`
        const coinFound = this.supportedCoins.find(coin => coin.id === coinId)
        const emojiCode = changePercentage > 0 ? EMOJI_ARROW_UP : EMOJI_ARROW_DOWN
        const changeDirection = changePercentage > 0 ? 'up' : 'down'
        const args = [coinFound.code, changePercentage.toString(), emojiCode]
        const data = {
            'title-loc-key': coinFound.title,
            'loc-key': `${change}_${changeDirection}`,
            'loc-args': args
        };

        this.logger.info(`[PriceChange] Send Notif: Coin:${coinId}, Alert %:${alertPercentage}, Change %:${changePercentage}`)
        const status = await this.messagingProvider.sendDataMessageToChannel(channelName, data)
        this.logger.info(`[PriceChange] Response status: ${status}`)

        return 0
    }
}

export default PriceChangeAnalysisService
