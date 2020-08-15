/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable max-len */

import cronТrend from 'node-cron';
import MacdIndicator from './indicators/macd.indicator';
import EmaIndicator from './indicators/ema.indicator';
import RsiIndicator from './indicators/rsi.indicator';
import Trend from '../models/trend.model';
import TrendTerm from '../models/trend.term.model';
import TrendState from '../models/trend.state.state';
import Utils from '../utils/utils'

const CRON_DAILY_12AM = '0 10 0 * * *' // every day at 12:10 AM
const CRON_EVERY_4H = '0 0 */4 * * *' // every 4 hours

const EMOJI_GRAPH_UP = '\u{1F4C8}'
const EMOJI_GRAPH_DOWN = '\u{1F4C9}'

class TrendingAnalysisService {
    constructor(logger, appConfig, coinsConfig, messagingProvider, dataCollectorService) {
        this.logger = logger;
        this.appConfig = appConfig;
        this.coinsConfig = coinsConfig;
        this.supportedCoins = coinsConfig.coins
        this.supportedCoinCodes = this.supportedCoins.map(coin => coin.code)
        this.baseCurrency = coinsConfig.base_currency

        this.previousTrendResults = []

        this.messagingProvider = messagingProvider
        this.dataCollectorService = dataCollectorService

        this.TREND_SHORT_TERM = new TrendTerm(TrendState.SHORT)
        this.TREND_LONG_TERM = new TrendTerm(TrendState.LONG)

        this.rsiIndicator = new RsiIndicator(this.logger, this.data)
        this.emaIndicator = new EmaIndicator(this.logger, this.data)
        this.macdIndicator = new MacdIndicator(this.logger, this.data)
    }

    async start() {
        cronТrend.schedule(CRON_DAILY_12AM, () => {
            this.checkTrendingChanges(this.TREND_LONG_TERM)
        });

        cronТrend.schedule(CRON_EVERY_4H, () => {
            this.checkTrendingChanges(this.TREND_SHORT_TERM)
        });

        await this.checkTrendingChanges(this.TREND_SHORT_TERM)
        this.checkTrendingChanges(this.TREND_LONG_TERM)
    }

    async checkTrendingChanges(trendTerm) {
        this.logger.info(`{TrendChange} Started checking TrendingChanges" with Term:${trendTerm.trendState}`)

        const currentTime = Math.floor(new Date() / 1000)

        for (const coin of this.supportedCoins) {
            const result = await this.dataCollectorService.getHistoricalXRates(
                coin.code,
                this.baseCurrency,
                trendTerm.timePeriod,
                trendTerm.aggregate,
                trendTerm.candleCount,
                currentTime
            )

            const trend = this.calculateTrend(result)
            const latestTrendData = { coinCode: coin.code, term: trendTerm.trendState, trend }

            const foundIndex = this.previousTrendResults.findIndex(
                data => data.coinCode === latestTrendData.coinCode
                && data.term === latestTrendData.term
            )

            if (foundIndex !== -1) {
                const foundTrendData = this.previousTrendResults[foundIndex]

                if (foundTrendData.trend !== latestTrendData.trend && trend !== Trend.NEUTRAL) {
                    this.logger.info(`{TrendChange} Coin: ${coin.code}, Term:${trendTerm.trendState}, Prev-Trend:${foundTrendData.trend}, Latest-Trend:${trend}`)
                    this.sendTrendChangeDataMessage(coin.code, trendTerm.trendState, trend)
                }
                this.previousTrendResults[foundIndex] = latestTrendData
            } else {
                this.previousTrendResults.push(latestTrendData)
            }

            // -------Wait for limitations ---------------
            await new Promise(r => setTimeout(r, 10));
            // -------------------------------------------
        }
    }

    calculateTrend(result) {
        if (result && result.length > 0) {
            const closeValues = result.map(e => e.rate)

            if (closeValues && closeValues.length > 0) {
                const trends = [
                    this.rsiIndicator.calculateTrend(closeValues),
                    this.macdIndicator.calculateTrend(closeValues),
                    this.emaIndicator.calculateTrend(closeValues)
                ]

                const trend = Utils.getDublicateElements(trends)
                if (trend.length > 0) {
                    return trend[0]
                }
            }
        }

        return Trend.NEUTRAL
    }

    async sendTrendChangeNotification(coinCode, trendState, trend) {
        const channelName = `${coinCode}_${trendState}term_trend_change`
        const coinFound = this.supportedCoins.find(coin => coin.code === coinCode)
        const trendDirection = trend.toLowerCase()
        const body = `${coinCode}_trend_${trendState}term_${trendDirection}`

        this.logger.info(`{TrendChange}  Send TrendChange Notif:  Coin:${coinCode}, State:${trendState}, Trend:${trendDirection}`)
        this.messagingProvider.sendNotificationToChannel(channelName, coinFound.title, body)
    }

    async sendTrendChangeDataMessage(coinCode, trendState, trend) {
        const channelName = `${coinCode}_${trendState}term_trend_change`
        const coinFound = this.supportedCoins.find(coin => coin.code === coinCode)
        const emojiCode = trend === Trend.UP ? EMOJI_GRAPH_UP : EMOJI_GRAPH_DOWN
        const trendDirection = trend.toLowerCase()
        const args = [coinCode, emojiCode]
        const data = {
            'title-loc-key': coinFound.title,
            'loc-key': `trend_${trendState}term_${trendDirection}`,
            'loc-args': args
        };

        this.logger.info(`{TrendChange}  Send Notif: Coin:${coinCode}, State:${trendState}, Trend:${trendDirection}`)
        const status = await this.messagingProvider.sendDataMessageToChannel(channelName, data)

        return status
    }
}

export default TrendingAnalysisService
