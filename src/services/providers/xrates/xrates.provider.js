import CryptoCompareProvider from './crypto-compare.provider'

class XRatesProvider {
    constructor(appConfig, coinsConfig, logger) {
        this.logger = logger
        this.appConfig = appConfig
        this.coinsConfig = coinsConfig

        this.defaultProvider = new CryptoCompareProvider(appConfig.service_providers.crypto_compare)
    }

    async getXRate(coinCode, fiatCode) {
        try {
            const result = await this.defaultProvider.getXRate(coinCode, fiatCode)
            this.logger.info(result)

            if (result) {
                return result
            }
        } catch (e) {
            this.logger.info(e)
        }

        return {}
    }

    async getXRates(coinCodes, fiatCodes) {
        try {
            const result = await this.defaultProvider.getXRates(coinCodes, fiatCodes)

            if (result) {
                return result
            }
        } catch (e) {
            this.logger.info(e)
        }

        return {}
    }
}

export default XRatesProvider;
