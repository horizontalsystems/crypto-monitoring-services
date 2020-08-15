/* eslint-disable class-methods-use-this */
import Trend from '../../models/trend.model'

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

    calculateTrend(values) {
        const macdResults = this.calculate(values)
        // this.logger.info(`MACD Results: ${macdResults}`)

        if (macdResults && macdResults.length > 0) {
            const lastValue = macdResults.slice(-1)

            if (lastValue[0]) {
                if (lastValue[0].histogram > 0) {
                    return Trend.UP
                }
                if (lastValue[0].histogram < 0) {
                    return Trend.DOWN
                }
            }
        }

        return Trend.NEUTRAL
    }
}

export default MacdIndicator;
