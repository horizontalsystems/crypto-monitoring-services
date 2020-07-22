import cryptoCompareApi from 'cryptocompare'
import XRate from '../../../models/xrate.model'

global.fetch = require('node-fetch')

const MAX_COINS_PER_REQUEST = 50
class CryptoCompareProvider {
    constructor(config) {
        this.ccApi = cryptoCompareApi
        this.ccApi.setApiKey(config.api_key)
    }

    async getXRate(coinCode, fiatCodes) {
        const result = await this.ccApi.price(coinCode, fiatCodes)
        return this.convertPriceResponse(result)
    }

    async getXRates(coinCodes, fiatCodes) {
        let results = [];
        const maxLength = MAX_COINS_PER_REQUEST

        if (coinCodes.length > maxLength) {
            for (let i = 0; i <= coinCodes.length - 1; i += maxLength) {
                const coinsSplitted = coinCodes.slice(i, i + maxLength)
                const lastResult = this.ccApi.priceMulti(coinsSplitted, fiatCodes)

                results.push(lastResult)
            }
        } else {
            results = this.ccApi.priceMulti(coinCodes, fiatCodes)
        }

        return CryptoCompareProvider.convertPriceResponse(await Promise.all(results))
    }

    static convertPriceResponse(result) {
        if (result) {
            const xRates = Object.entries(result).map(
                resultData => Object.entries(resultData[1]).map(
                    coinData => Object.entries(coinData[1]).map(
                        fiatData => new XRate(coinData[0], fiatData[0], fiatData[1])
                    )
                )
            )

            return [].concat(...xRates);
        }
        return {}
    }
}

export default CryptoCompareProvider;
