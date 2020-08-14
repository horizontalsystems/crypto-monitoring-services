import MessagingServiceProvider from './providers/messaging/messaging.provider';
import DataCollectorService from './data.collector.service';
import PriceChangeAnalysisService from './price.change.analysis.service';
import TrendingAnalysisService from './trending.analysis.service';

class MonitoringService {
    constructor(logger, appConfig, coinsConfig) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins
        this.supportedCoinCodes = this.supportedCoins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency

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
            this.dataCollectorService
        );

        this.trendingAnalysisService = new TrendingAnalysisService(
            this.logger,
            this.appConfig,
            this.coinsConfig,
            this.messagingProvider,
            this.dataCollectorService
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
}

export default MonitoringService;
