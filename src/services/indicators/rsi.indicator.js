/* eslint-disable class-methods-use-this */
const { RSI } = require('technicalindicators');

const RSI_PERIOD = 14

class RsiIndicator {
    constructor(logger) {
        this.logger = logger;
    }

    calculate(values, period) {
        const inputRSI = {
            values,
            period: period || RSI_PERIOD
        };

        return RSI.calculate(inputRSI)
    }
}

export default RsiIndicator
