import TrendState from './trend.state'

class TrendTerm {
    constructor(trendState) {
        this.trendStateValue = trendState

        if (trendState === TrendState.SHORT) {
            this.aggregateValue = 4
            this.periodValue = 50
        } else if (trendState === TrendState.LONG) {
            this.aggregate = 1
            this.periodValue = 90
        }
    }

    get trendState() {
        return this.trendStateValue
    }

    set trendState(newState) {
        this.trendStateValue = newState;
    }

    get aggregate() {
        return this.aggregateValue
    }

    set aggregate(newAggregate) {
        this.aggregateValue = newAggregate;
    }

    get period() {
        return this.periodValue
    }

    set period(newPeriod) {
        this.periodValue = newPeriod;
    }
}

export default TrendTerm;
