/* eslint-disable class-methods-use-this */
import Trend from '../../models/trend'

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
            period
        };

        return EMA.calculate(inputEMA);
    }

    calculateTrend(values) {
        const fastEMAResults = this.calculate(values, EMA_FAST_PERIOD)
        const slowEMAResults = this.calculate(values, EMA_SLOW_PERIOD)

        // this.logger.info(`EMA Fast Results: ${fastEMAResults}`)
        // this.logger.info(`EMA Slow Results: ${slowEMAResults}`)

        if (fastEMAResults && fastEMAResults.length > 0
            && slowEMAResults && slowEMAResults.length > 0) {
            const lastEMAFastValue = fastEMAResults.slice(-1)
            const lastEMASlowValue = slowEMAResults.slice(-1)

            if (lastEMAFastValue > lastEMASlowValue) {
                return Trend.UP
            }
            if (lastEMAFastValue < lastEMASlowValue) {
                return Trend.DOWN
            }
        }

        return Trend.NEUTRAL
    }
}

export default EmaIndicator;
