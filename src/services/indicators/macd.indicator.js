/* eslint-disable class-methods-use-this */
const { MACD } = require('technicalindicators');

const MACD_FAST_PERIOD = 12;
const MACD_SLOW_PERIOD = 26;
const MACD_SIGNAL_PERIOD = 9;

class MacdIndicator {
    constructor(logger) {
        this.logger = logger;
    }

    calculate(values, fastPeriod, slowPeriod, signalPeriod) {
        const macdInput = {
            values,
            fastPeriod: fastPeriod || MACD_FAST_PERIOD,
            slowPeriod: slowPeriod || MACD_SLOW_PERIOD,
            signalPeriod: signalPeriod || MACD_SIGNAL_PERIOD,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        };

        return MACD.calculate(macdInput);
    }
}

export default MacdIndicator;
