import MacdIndicator from './indicators/macd.indicator';
import EmaIndicator from './indicators/ema.indicator';
import RsiIndicator from './indicators/rsi.indicator';

class TrendingAnalysisService {
    constructor(logger, appConfig, coinsConfig, messagingProvider, dataCollectorService) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins
        this.supportedCoinCodes = this.supportedCoins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency

        this.messagingProvider = messagingProvider
        this.dataCollectorService = dataCollectorService

        this.rsiIndicator = new RsiIndicator(this.logger, this.data)
        this.emaIndicator = new EmaIndicator(this.logger, this.data)
        this.macdIndicator = new MacdIndicator(this.logger, this.data)
    }

    start() {
        const values = []

        this.rsiIndicator.calculate(values)
        this.emaIndicator.calculate(values)
        this.macdIndicator.calculate(values)
    }
}

export default TrendingAnalysisService
