class XRate {
    constructor(coinId, coinCode, fiatCode, rate, timestamp) {
        this.coinId = coinId
        this.coinCode = coinCode
        this.fiatCode = fiatCode
        this.rate = rate
        this.timestamp = timestamp
    }
}

export default XRate
