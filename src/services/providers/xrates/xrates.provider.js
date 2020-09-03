import CryptoCompareProvider from './crypto-compare.provider'

class XRatesProvider {
    constructor(logger, appConfig) {
        this.logger = logger
        this.appConfig = appConfig

        this.defaultProvider = new CryptoCompareProvider(this.appConfig.service_providers.crypto_compare)
    }

    async getXRate(coinCode, fiatCode) {
        try {
            const result = await this.defaultProvider.getXRate(coinCode, fiatCode)
            this.logger.info(result)

            if (result) {
                return result
            }
        } catch (e) {
            this.logger.error(`Error getting XRate coinCode:${coinCode}: ${e}`)
        }

        return {}
    }

    async getHistoricalXRates(coinCode, fiatCode, timePeriod, aggregate, limit, toTimestamp) {
        try {
            const result = await this.defaultProvider.getHistoricalXRates(
                coinCode,
                fiatCode,
                timePeriod,
                aggregate,
                limit,
                toTimestamp
            )

            if (result) {
                return result
            }
        } catch (e) {
            this.logger.error(`Error getting HistoRates coinCode:${coinCode}: ${e}`)
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
            this.logger.error(`Error getting XRates coinCodes: ${coinCodes}: ${e}`)
        }

        return {}
    }
}

export default XRatesProvider;
