import MessagingServiceProvider from './providers/messaging/messaging.provider';
import DataCollectorService from './data.collector.service';
import PriceChangeAnalysisService from './price.change.analysis.service';
import TrendingAnalysisService from './trending.analysis.service';
import StorageService from './storage.service';

class MonitoringService {
    constructor(logger, appConfig, coinsConfig) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins
        this.supportedCoinCodes = this.supportedCoins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency

        this.storageService = new StorageService(
            this.logger,
            this.appConfig.db
        );

        this.messagingProvider = new MessagingServiceProvider(
            this.logger,
            this.appConfig.service_providers.push_notification_provider
        );

        this.dataCollectorService = new DataCollectorService(
            this.logger,
            this.appConfig
        );

        this.priceChangeAnalysisService = new PriceChangeAnalysisService(
            this.logger,
            this.appConfig,
            this.coinsConfig,
            this.messagingProvider,
            this.dataCollectorService,
            this.storageService
        );

        this.trendingAnalysisService = new TrendingAnalysisService(
            this.logger,
            this.appConfig,
            this.coinsConfig,
            this.messagingProvider,
            this.dataCollectorService,
            this.storageService
        );
    }

    async start() {
        this.startAnalysisServices()
    }

    async startAnalysisServices() {
        await new Promise(r => setTimeout(r, 2000));
        this.priceChangeAnalysisService.start()

        await new Promise(r => setTimeout(r, 3000));
        this.trendingAnalysisService.start()
    }

    async getTrendInfo(coinCode, dateParam) {
        let dateFrom
        let dateTo

        if (dateParam) {
            const dateObj = new Date(dateParam)
            dateObj.setUTCHours(0, 1);
            dateFrom = Math.floor(dateObj.getTime() / 1000)

            dateObj.setUTCHours(23, 59)
            dateTo = Math.floor(dateObj.getTime() / 1000)
        } else {
            const currentDate = new Date()
            currentDate.setUTCHours(0, 1)
            dateFrom = Math.floor(currentDate.getTime() / 1000)

            currentDate.setUTCHours(23, 59)
            dateTo = Math.floor(currentDate.getTime() / 1000)
        }

        return this.storageService.getTrendInfo(coinCode, dateFrom, dateTo)
    }
}

export default MonitoringService;
