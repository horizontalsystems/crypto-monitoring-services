/* eslint-disable class-methods-use-this */
import Trend from '../../models/trend'

const { RSI } = require('technicalindicators');

const RSI_PERIOD = 14
const RSI_MAX_VALUE = 70
const RSI_MIN_VALUE = 30

class RsiIndicator {
    constructor(logger) {
        this.logger = logger;
    }

    calculate(values, period) {
        const inputRSI = {
            values,
            period
        };

        return RSI.calculate(inputRSI)
    }

    calculateTrend(values, period) {
        const rsiResults = this.calculate(values, period || RSI_PERIOD)
        // this.logger.info(`RSI Results: ${rsiResults}`)

        if (rsiResults && rsiResults.length > 0) {
            const lastValue = rsiResults.slice(-1)

            if (lastValue > RSI_MAX_VALUE) {
                return Trend.UP
            }
            if (lastValue < RSI_MIN_VALUE) {
                return Trend.DOWN
            }
        }

        return Trend.NEUTRAL
    }
}

export default RsiIndicator
