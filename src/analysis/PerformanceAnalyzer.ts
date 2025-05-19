import { Trade, PerformanceMetrics, PortfolioAnalysis } from '../types';

export class PerformanceAnalyzer {
  private trades: Trade[];
  private portfolioHistory: PortfolioAnalysis[];
  private startTime: number;
  private initialPortfolioValue: number;

  constructor(initialPortfolio: PortfolioAnalysis) {
    this.trades = [];
    this.portfolioHistory = [initialPortfolio];
    this.startTime = Date.now();
    this.initialPortfolioValue = initialPortfolio.totalValue;
  }

  addTrade(trade: Trade): void {
    this.trades.push(trade);
  }

  updatePortfolio(portfolio: PortfolioAnalysis): void {
    this.portfolioHistory.push(portfolio);
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      totalReturn: this.calculateTotalReturn(),
      winRate: this.calculateWinRate(),
      sharpeRatio: this.calculateSharpeRatio(),
      maxDrawdown: this.calculateMaxDrawdown(),
      trades: this.trades
    };
  }

  private calculateTotalReturn(): number {
    const currentValue = this.portfolioHistory[this.portfolioHistory.length - 1].totalValue;
    return (currentValue - this.initialPortfolioValue) / this.initialPortfolioValue;
  }

  private calculateWinRate(): number {
    if (this.trades.length === 0) return 0;

    let winningTrades = 0;
    for (let i = 1; i < this.trades.length; i++) {
      const currentTrade = this.trades[i];
      const previousTrade = this.trades[i - 1];

      if (currentTrade.asset === previousTrade.asset) {
        const profit = this.calculateTradeProfit(previousTrade, currentTrade);
        if (profit > 0) {
          winningTrades++;
        }
      }
    }

    return winningTrades / this.trades.length;
  }

  private calculateSharpeRatio(): number {
    const returns = this.calculateDailyReturns();
    if (returns.length === 0) return 0;

    const averageReturn = returns.reduce((acc, curr) => acc + curr, 0) / returns.length;
    const riskFreeRate = 0.02 / 365; // Assuming 2% annual risk-free rate
    const excessReturns = returns.map(r => r - riskFreeRate);
    
    const standardDeviation = this.calculateStandardDeviation(returns);
    if (standardDeviation === 0) return 0;

    return (averageReturn - riskFreeRate) / standardDeviation;
  }

  private calculateMaxDrawdown(): number {
    let maxDrawdown = 0;
    let peak = this.portfolioHistory[0].totalValue;

    for (const portfolio of this.portfolioHistory) {
      if (portfolio.totalValue > peak) {
        peak = portfolio.totalValue;
      }

      const drawdown = (peak - portfolio.totalValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  private calculateDailyReturns(): number[] {
    const returns: number[] = [];
    const dailyValues = this.aggregateDailyPortfolioValues();

    for (let i = 1; i < dailyValues.length; i++) {
      const dailyReturn = (dailyValues[i] - dailyValues[i - 1]) / dailyValues[i - 1];
      returns.push(dailyReturn);
    }

    return returns;
  }

  private aggregateDailyPortfolioValues(): number[] {
    const dailyValues: number[] = [];
    let currentDay = new Date(this.startTime).setHours(0, 0, 0, 0);
    let lastValue = this.initialPortfolioValue;

    for (const portfolio of this.portfolioHistory) {
      const portfolioDay = new Date(portfolio.timestamp).setHours(0, 0, 0, 0);
      
      if (portfolioDay > currentDay) {
        dailyValues.push(lastValue);
        currentDay = portfolioDay;
      }
      
      lastValue = portfolio.totalValue;
    }

    dailyValues.push(lastValue);
    return dailyValues;
  }

  private calculateTradeProfit(entry: Trade, exit: Trade): number {
    if (entry.type === 'buy' && exit.type === 'sell') {
      return (exit.price - entry.price) * entry.amount;
    } else if (entry.type === 'sell' && exit.type === 'buy') {
      return (entry.price - exit.price) * entry.amount;
    }
    return 0;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((acc, curr) => acc + curr, 0) / values.length;
    const squareDiffs = values.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    
    const avgSquareDiff = squareDiffs.reduce((acc, curr) => acc + curr, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  getDetailedAnalysis(): any {
    return {
      performance: this.getPerformanceMetrics(),
      tradeAnalysis: this.analyzeTrades(),
      portfolioAnalysis: this.analyzePortfolio(),
      riskMetrics: this.calculateRiskMetrics()
    };
  }

  private analyzeTrades(): any {
    const analysis: any = {
      totalTrades: this.trades.length,
      averageTradeSize: this.calculateAverageTradeSize(),
      tradeFrequency: this.calculateTradeFrequency(),
      assetDistribution: this.calculateAssetDistribution(),
      strategyPerformance: this.calculateStrategyPerformance()
    };

    return analysis;
  }

  private analyzePortfolio(): any {
    const latestPortfolio = this.portfolioHistory[this.portfolioHistory.length - 1];
    return {
      currentAllocation: latestPortfolio.assetAllocation,
      diversificationScore: this.calculateDiversificationScore(),
      portfolioVolatility: this.calculatePortfolioVolatility(),
      rebalancingHistory: this.analyzeRebalancingHistory()
    };
  }

  private calculateRiskMetrics(): any {
    return {
      valueAtRisk: this.calculateValueAtRisk(),
      expectedShortfall: this.calculateExpectedShortfall(),
      beta: this.calculateBeta(),
      correlationMatrix: this.calculateCorrelationMatrix()
    };
  }

  private calculateAverageTradeSize(): number {
    if (this.trades.length === 0) return 0;
    const totalSize = this.trades.reduce((acc, trade) => acc + (trade.amount * trade.price), 0);
    return totalSize / this.trades.length;
  }

  private calculateTradeFrequency(): number {
    const duration = (Date.now() - this.startTime) / (1000 * 60 * 60 * 24); // in days
    return this.trades.length / duration;
  }

  private calculateAssetDistribution(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    let totalTrades = 0;

    for (const trade of this.trades) {
      distribution[trade.asset] = (distribution[trade.asset] || 0) + 1;
      totalTrades++;
    }

    for (const asset in distribution) {
      distribution[asset] = distribution[asset] / totalTrades;
    }

    return distribution;
  }

  private calculateStrategyPerformance(): { [key: string]: number } {
    const performance: { [key: string]: number } = {};
    const strategyTrades: { [key: string]: Trade[] } = {};

    // Group trades by strategy
    for (const trade of this.trades) {
      const strategy = trade.metadata.strategy;
      if (!strategyTrades[strategy]) {
        strategyTrades[strategy] = [];
      }
      strategyTrades[strategy].push(trade);
    }

    // Calculate performance for each strategy
    for (const [strategy, trades] of Object.entries(strategyTrades)) {
      let totalProfit = 0;
      for (let i = 1; i < trades.length; i++) {
        totalProfit += this.calculateTradeProfit(trades[i - 1], trades[i]);
      }
      performance[strategy] = totalProfit;
    }

    return performance;
  }

  private calculateDiversificationScore(): number {
    const latestPortfolio = this.portfolioHistory[this.portfolioHistory.length - 1];
    const weights = Object.values(latestPortfolio.assetAllocation);
    const sumSquaredWeights = weights.reduce((acc, weight) => acc + weight * weight, 0);
    return 1 - sumSquaredWeights;
  }

  private calculatePortfolioVolatility(): number {
    const returns = this.calculateDailyReturns();
    return this.calculateStandardDeviation(returns);
  }

  private analyzeRebalancingHistory(): any {
    const rebalancingEvents: any[] = [];
    let lastAllocation = this.portfolioHistory[0].assetAllocation;

    for (let i = 1; i < this.portfolioHistory.length; i++) {
      const currentAllocation = this.portfolioHistory[i].assetAllocation;
      const changes = this.calculateAllocationChanges(lastAllocation, currentAllocation);
      
      if (Object.keys(changes).length > 0) {
        rebalancingEvents.push({
          timestamp: this.portfolioHistory[i].timestamp,
          changes
        });
      }
      
      lastAllocation = currentAllocation;
    }

    return rebalancingEvents;
  }

  private calculateAllocationChanges(previous: { [key: string]: number }, current: { [key: string]: number }): { [key: string]: number } {
    const changes: { [key: string]: number } = {};
    
    for (const asset in current) {
      const previousWeight = previous[asset] || 0;
      const currentWeight = current[asset];
      const change = currentWeight - previousWeight;
      
      if (Math.abs(change) > 0.01) { // Only include significant changes
        changes[asset] = change;
      }
    }

    return changes;
  }

  private calculateValueAtRisk(confidenceLevel: number = 0.95): number {
    const returns = this.calculateDailyReturns();
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(returns.length * (1 - confidenceLevel));
    return -sortedReturns[index];
  }

  private calculateExpectedShortfall(confidenceLevel: number = 0.95): number {
    const returns = this.calculateDailyReturns();
    const varValue = this.calculateValueAtRisk(confidenceLevel);
    const tailReturns = returns.filter(r => r < -varValue);
    return -tailReturns.reduce((acc, curr) => acc + curr, 0) / tailReturns.length;
  }

  private calculateBeta(): number {
    // In a real implementation, this would compare portfolio returns to market returns
    return 1.0;
  }

  private calculateCorrelationMatrix(): { [key: string]: { [key: string]: number } } {
    const assets = new Set<string>();
    const returns: { [key: string]: number[] } = {};

    // Collect all assets and their returns
    for (const portfolio of this.portfolioHistory) {
      for (const asset in portfolio.assetAllocation) {
        assets.add(asset);
        if (!returns[asset]) {
          returns[asset] = [];
        }
        returns[asset].push(portfolio.assetAllocation[asset]);
      }
    }

    // Calculate correlation matrix
    const matrix: { [key: string]: { [key: string]: number } } = {};
    for (const asset1 of assets) {
      matrix[asset1] = {};
      for (const asset2 of assets) {
        matrix[asset1][asset2] = this.calculateCorrelation(returns[asset1], returns[asset2]);
      }
    }

    return matrix;
  }

  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length !== returns2.length || returns1.length === 0) return 0;

    const mean1 = returns1.reduce((acc, curr) => acc + curr, 0) / returns1.length;
    const mean2 = returns2.reduce((acc, curr) => acc + curr, 0) / returns2.length;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    if (denominator1 === 0 || denominator2 === 0) return 0;
    return numerator / Math.sqrt(denominator1 * denominator2);
  }
} 