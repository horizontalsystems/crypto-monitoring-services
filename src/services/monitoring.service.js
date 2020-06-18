import XRatesProvider from './providers/xrates/xrates.provider';
import MessagingServiceProvider from './providers/messaging/messaging.provider';

class MonitoringService {
    constructor(appConfig, coinsConfig, logger) {
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.logger = logger;

        this.xratesProvider = new XRatesProvider(
            appConfig,
            coinsConfig,
            logger
        );

        this.messagingProvider = new MessagingServiceProvider(
            appConfig.service_providers.horsys_messaging_services,
            logger
        );
    }

    start() {
        this.logger.info('App started monitoring events');
    }

    startXRatesMonitoringJob() {
        // Start Scheduler JOB to get XRates
    }
}

export default MonitoringService;
