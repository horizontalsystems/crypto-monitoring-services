import XRatesProvider from './providers/xrates/xrates.provider';

class DataCollectorService {
    constructor(logger, appConfig) {
        this.logger = logger;
        this.appConfig = appConfig;

        this.xratesProvider = new XRatesProvider(
            this.logger,
            this.appConfig
        );
    }

    async getLatestXRates(supportedCoinCodes, baseCurrency) {
        return this.xratesProvider.getXRates(supportedCoinCodes, baseCurrency)
    }

    async getDailyOpeningXRates(supportedCoinCodes, baseCurrency) {
        return this.xratesProvider.getXRates(supportedCoinCodes, baseCurrency)
    }
}

export default DataCollectorService
