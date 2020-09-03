import cryptoCompareApi from 'cryptocompare'
import XRate from '../../../models/xrate.model'
import TimePeriod from '../../../models/time.period.model'

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
        const results = [];
        const maxLength = MAX_COINS_PER_REQUEST

        if (coinCodes.length > maxLength) {
            for (let i = 0; i <= coinCodes.length - 1; i += maxLength) {
                const coinsSplitted = coinCodes.slice(i, i + maxLength)
                const lastResult = this.ccApi.priceMulti(coinsSplitted, fiatCodes)

                results.push(lastResult)
            }
        } else {
            results.push(this.ccApi.priceMulti(coinCodes, fiatCodes))
        }

        return CryptoCompareProvider.convertPriceResponse(await Promise.all(results))
    }

    async getHistoricalXRates(coinCode, fiatCode, timePeriod, aggregate, limit, toTimestamp) {
        let histoMethod;
        const options = {
            toTs: toTimestamp,
            aggregate,
            limit
        }

        if (timePeriod === TimePeriod.HOUR) {
            histoMethod = this.ccApi.histoHour
        } else if (timePeriod === TimePeriod.DAY) {
            histoMethod = this.ccApi.histoDay
        } else {
            histoMethod = this.ccApi.histoMinute
        }

        const result = await histoMethod(coinCode, fiatCode, options)
        return CryptoCompareProvider.convertHistoPriceResponse(coinCode, fiatCode, result)
    }

    static convertHistoPriceResponse(coinCode, fiatCode, result) {
        if (result) {
            const xrates = []
            result.forEach(element => {
                xrates.push(new XRate(coinCode, coinCode, fiatCode, element.close, element.time))
            })

            return xrates;
        }
        return []
    }

    static convertPriceResponse(result) {
        if (result) {
            const xRates = Object.entries(result).map(
                resultData => {
                    const asdf = Object.entries(resultData[1]).map(
                        coinData => Object.entries(coinData[1]).map(
                            fiatData => new XRate(coinData[0], coinData[0], fiatData[0], fiatData[1])
                        )
                    )
                    return [].concat(...asdf)
                }
            )

            return [].concat(...xRates);
        }
        return {}
    }
}

export default CryptoCompareProvider;
