import cron from 'node-cron';
import XRatesProvider from './providers/xrates/xrates.provider';
import MessagingServiceProvider from './providers/messaging/messaging.provider';

const CRON_DAILY_12AM = '0 0 0 * * *' // every day at 12:00 AM
const CRON_EVERY_15M = '0 */3 * * * *' // every 10 minutes
const XRATES_CHANGE_PERCENTAGES = [2, 5, 10]

class MonitoringService {
    constructor(appConfig, coinsConfig, logger) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency
        this.xratesProvider = new XRatesProvider(
            appConfig,
            coinsConfig,
            logger
        );

        this.messagingProvider = new MessagingServiceProvider(
            appConfig.service_providers.horsys_messaging_services,
            logger
        );

        this.setDailyOpeningXRates()
    }

    start() {
        this.startXRatesMonitoringTask()
    }

    startXRatesMonitoringTask() {
        cron.schedule(CRON_DAILY_12AM, () => {
            this.setDailyOpeningXRates()
        });

        cron.schedule(CRON_EVERY_15M, () => {
            this.checkXRatesChanges()
        });
    }

    async setDailyOpeningXRates() {
        this.dailyOpeningXRates = await this.xratesProvider.getXRates(this.supportedCoins, this.baseCurrency)
        this.logger.info('"Daily opening xrates" data collected')
        //this.checkXRateChanges()
    }

    async checkXRateChanges() {
        const latestXRates = await this.xratesProvider.getXRates(this.supportedCoins, this.baseCurrency)

        if (this.dailyOpeningXRates && latestXRates) {
            Object.values(this.dailyOpeningXRates).forEach(dailyOpeningXRate => {
                const latestXRate = latestXRates.find(xrate => xrate.coinCode === dailyOpeningXRate.coinCode)
                if (latestXRate) {
                    const changePercentage = MonitoringService.calculateXRateChangePercentage(
                        dailyOpeningXRate.rate,
                        latestXRate.rate
                    )

                    Object.values(XRATES_CHANGE_PERCENTAGES).forEach(percentage => {
                        if (percentage <= Math.abs(changePercentage)) {
                            this.sendXRateChangeNotification(
                                dailyOpeningXRate.coinCode,
                                percentage,
                                changePercentage
                            )
                        }
                    });
                }
            });
        }
    }

    static calculateXRateChangePercentage(rateSource, rateTarget) {
        const diff = rateSource - rateTarget
        const changePercentage = parseFloat((diff * 100) / rateSource)

        return Math.round(changePercentage * 10) / 10
    }

    async sendXRateChangeNotification(coinCode, alertPercentage, changePercentage) {
        this.logger.info(`Send Notification\nCoin:${coinCode},Alert %:${alertPercentage}, Change %:${changePercentage}`)
    }
}

export default MonitoringService;
