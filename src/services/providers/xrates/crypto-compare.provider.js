import cryptoCompareApi from 'cryptocompare'

global.fetch = require('node-fetch')

class CryptoCompareProvider {
    constructor(config) {
        this.ccApi = cryptoCompareApi
        this.ccApi.setApiKey(config.api_key)
    }

    getXRate(coinCode, fiatCodes) {
        return this.ccApi.price(coinCode, fiatCodes)
    }
}

export default CryptoCompareProvider;
