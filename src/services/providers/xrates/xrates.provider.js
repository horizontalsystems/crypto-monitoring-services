import CryptoCompareProvider from './crypto-compare.provider'

class XRatesProvider {
    constructor(appConfig, coinsConfig, logger) {
        this.logger = logger
        this.appConfig = appConfig
        this.coinsConfig = coinsConfig
        this.defaultProvider = new CryptoCompareProvider(appConfig.service_providers.crypto_compare)
    }

    getXRate(coinCode, fiatCodes) {
        return this.defaultProvider.getXRate(coinCode, fiatCodes)
    }
}

export default XRatesProvider;
