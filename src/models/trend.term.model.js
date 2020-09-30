import TrendState from './trend.state.state'
import TimePeriod from './time.period.model'

class TrendTerm {
    constructor(trendState) {
        this.trendStateValue = trendState

        if (trendState === TrendState.SHORT) {
            this.aggregateValue = 4
            this.candleCountValue = 50
            this.timePeriodValue = TimePeriod.HOUR
        } else if (trendState === TrendState.LONG) {
            this.aggregate = 1
            this.candleCountValue = 50
            this.timePeriodValue = TimePeriod.DAY
        }
    }

    get timePeriod() {
        return this.timePeriodValue
    }

    set timePeriod(newValue) {
        this.timePeriodValue = newValue;
    }

    get trendState() {
        return this.trendStateValue
    }

    set trendState(newValue) {
        this.trendStateValue = newValue;
    }

    get aggregate() {
        return this.aggregateValue
    }

    set aggregate(newValue) {
        this.aggregateValue = newValue;
    }

    get candleCount() {
        return this.candleCountValue
    }

    set candleCount(newValue) {
        this.candleCountValue = newValue;
    }
}

export default TrendTerm;
