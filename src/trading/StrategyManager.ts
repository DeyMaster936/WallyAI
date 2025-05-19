import { TradingStrategy, MarketInsight, Trade } from '../types';
import { SMA, RSI, MACD, BollingerBands, Stochastic } from 'technicalindicators';

export class StrategyManager {
  private strategies: Map<string, TradingStrategy>;
  private activeStrategy: string;
  private historicalTrades: Trade[];

  constructor() {
    this.strategies = new Map();
    this.historicalTrades = [];
  }

  registerStrategy(strategy: TradingStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  setActiveStrategy(strategyName: string): void {
    if (!this.strategies.has(strategyName)) {
      throw new Error(`Strategy ${strategyName} not found`);
    }
    this.activeStrategy = strategyName;
  }

  async analyzeMarket(data: any, strategyName?: string): Promise<MarketInsight> {
    const strategy = this.strategies.get(strategyName || this.activeStrategy);
    if (!strategy) {
      throw new Error('No active strategy');
    }

    const indicators = await this.calculateIndicators(data, strategy.indicators);
    return this.generateMarketInsight(indicators, strategy);
  }

  async executeStrategy(data: any, strategyName?: string): Promise<Trade | null> {
    const strategy = this.strategies.get(strategyName || this.activeStrategy);
    if (!strategy) {
      throw new Error('No active strategy');
    }

    const insight = await this.analyzeMarket(data, strategy.name);
    if (this.shouldExecuteTrade(insight, strategy)) {
      const trade = this.generateTrade(insight, strategy);
      this.historicalTrades.push(trade);
      return trade;
    }

    return null;
  }

  private async calculateIndicators(data: any, indicators: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const prices = data.prices;

    for (const indicator of indicators) {
      switch (indicator) {
        case 'SMA':
          result.SMA = SMA.calculate({ period: 20, values: prices });
          break;
        case 'RSI':
          result.RSI = RSI.calculate({ period: 14, values: prices });
          break;
        case 'MACD':
          result.MACD = MACD.calculate({
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            values: prices
          });
          break;
        case 'Bollinger Bands':
          result.BB = BollingerBands.calculate({
            period: 20,
            values: prices,
            stdDev: 2
          });
          break;
        case 'Stochastic':
          result.Stochastic = Stochastic.calculate({
            high: data.high,
            low: data.low,
            close: prices,
            period: 14,
            signalPeriod: 3
          });
          break;
      }
    }

    return result;
  }

  private generateMarketInsight(indicators: Record<string, any>, strategy: TradingStrategy): MarketInsight {
    const insight: MarketInsight = {
      trend: 'neutral',
      confidence: 0.5,
      supportingFactors: [],
      recommendedActions: [],
      advancedAnalysis: {
        technicalIndicators: {},
        sentimentScore: 0,
        volatilityMetrics: {},
        correlationMatrix: {}
      }
    };

    // Analyze RSI
    if (indicators.RSI) {
      const lastRSI = indicators.RSI[indicators.RSI.length - 1];
      if (lastRSI > 70) {
        insight.trend = 'bearish';
        insight.supportingFactors.push('RSI indicates overbought conditions');
      } else if (lastRSI < 30) {
        insight.trend = 'bullish';
        insight.supportingFactors.push('RSI indicates oversold conditions');
      }
    }

    // Analyze MACD
    if (indicators.MACD) {
      const lastMACD = indicators.MACD[indicators.MACD.length - 1];
      if (lastMACD.MACD > lastMACD.signal) {
        insight.trend = 'bullish';
        insight.supportingFactors.push('MACD shows bullish momentum');
      } else {
        insight.trend = 'bearish';
        insight.supportingFactors.push('MACD shows bearish momentum');
      }
    }

    // Calculate confidence based on indicator agreement
    const agreeingIndicators = insight.supportingFactors.length;
    insight.confidence = agreeingIndicators / strategy.indicators.length;

    return insight;
  }

  private shouldExecuteTrade(insight: MarketInsight, strategy: TradingStrategy): boolean {
    if (strategy.riskLevel === 'low') {
      return insight.confidence > 0.8;
    } else if (strategy.riskLevel === 'moderate') {
      return insight.confidence > 0.6;
    } else {
      return insight.confidence > 0.4;
    }
  }

  private generateTrade(insight: MarketInsight, strategy: TradingStrategy): Trade {
    return {
      timestamp: Date.now(),
      asset: 'BTC', // This should be determined by the strategy
      type: insight.trend === 'bullish' ? 'buy' : 'sell',
      amount: 0.1, // This should be calculated based on position sizing
      price: 0, // This should be fetched from market data
      metadata: {
        strategy: strategy.name,
        indicators: insight.advancedAnalysis?.technicalIndicators || {},
        executionTime: 0,
        slippage: 0,
        fees: 0
      }
    };
  }

  getStrategyPerformance(strategyName: string): any {
    const strategyTrades = this.historicalTrades.filter(trade => 
      trade.metadata?.strategy === strategyName
    );

    return {
      totalTrades: strategyTrades.length,
      winRate: this.calculateWinRate(strategyTrades),
      averageProfit: this.calculateAverageProfit(strategyTrades),
      maxDrawdown: this.calculateMaxDrawdown(strategyTrades)
    };
  }

  private calculateWinRate(trades: Trade[]): number {
    const winningTrades = trades.filter(trade => (trade.profitLoss || 0) > 0);
    return winningTrades.length / trades.length;
  }

  private calculateAverageProfit(trades: Trade[]): number {
    return trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0) / trades.length;
  }

  private calculateMaxDrawdown(trades: Trade[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let currentValue = 0;

    for (const trade of trades) {
      currentValue += (trade.profitLoss || 0);
      if (currentValue > peak) {
        peak = currentValue;
      }
      const drawdown = (peak - currentValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }
} 