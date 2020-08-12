/* eslint-disable class-methods-use-this */
const { EMA } = require('technicalindicators');

const EMA_FAST_PERIOD = 25;
const EMA_SLOW_PERIOD = 50;

class EmaIndicator {
    constructor(logger) {
        this.logger = logger;
    }

    calculate(values, period) {
        const inputEMA = {
            values,
            period: period || EMA_SLOW_PERIOD
        };

        return EMA.calculate(inputEMA);
    }
}

export default EmaIndicator;
