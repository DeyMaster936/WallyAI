import { PortfolioAnalysis, MarketInsight, Trade } from '../types';

export class PortfolioOptimizer {
  private portfolio: PortfolioAnalysis;
  private marketInsights: Map<string, MarketInsight>;
  private targetAllocation: { [key: string]: number };
  private rebalanceThreshold: number;

  constructor(
    initialPortfolio: PortfolioAnalysis,
    targetAllocation: { [key: string]: number },
    rebalanceThreshold: number = 0.1
  ) {
    this.portfolio = initialPortfolio;
    this.marketInsights = new Map();
    this.targetAllocation = targetAllocation;
    this.rebalanceThreshold = rebalanceThreshold;
  }

  updatePortfolio(portfolio: PortfolioAnalysis): void {
    this.portfolio = portfolio;
  }

  updateMarketInsight(asset: string, insight: MarketInsight): void {
    this.marketInsights.set(asset, insight);
  }

  optimizePortfolio(): Trade[] {
    const trades: Trade[] = [];
    const currentAllocation = this.portfolio.assetAllocation;
    const totalValue = this.portfolio.totalValue;

    // Calculate target values and deviations
    const targetValues: { [key: string]: number } = {};
    const deviations: { [key: string]: number } = {};

    for (const [asset, targetWeight] of Object.entries(this.targetAllocation)) {
      const targetValue = totalValue * targetWeight;
      targetValues[asset] = targetValue;
      
      const currentValue = currentAllocation[asset] || 0;
      const deviation = (currentValue - targetValue) / targetValue;
      deviations[asset] = deviation;
    }

    // Generate rebalancing trades
    for (const [asset, deviation] of Object.entries(deviations)) {
      if (Math.abs(deviation) > this.rebalanceThreshold) {
        const currentValue = currentAllocation[asset] || 0;
        const targetValue = targetValues[asset];
        const valueDifference = targetValue - currentValue;

        if (valueDifference !== 0) {
          const marketInsight = this.marketInsights.get(asset);
          const price = this.estimatePrice(asset, marketInsight);
          const amount = valueDifference / price;

          trades.push({
            id: this.generateTradeId(),
            asset,
            type: valueDifference > 0 ? 'buy' : 'sell',
            amount: Math.abs(amount),
            price,
            timestamp: Date.now(),
            metadata: {
              strategy: 'portfolio_optimization',
              execution: 'rebalancing'
            }
          });
        }
      }
    }

    return this.optimizeTradeSequence(trades);
  }

  private optimizeTradeSequence(trades: Trade[]): Trade[] {
    // Sort trades by priority based on deviation size and market conditions
    return trades.sort((a, b) => {
      const aDeviation = Math.abs(this.calculateDeviation(a.asset));
      const bDeviation = Math.abs(this.calculateDeviation(b.asset));
      
      const aInsight = this.marketInsights.get(a.asset);
      const bInsight = this.marketInsights.get(b.asset);
      
      const aPriority = this.calculateTradePriority(aDeviation, aInsight);
      const bPriority = this.calculateTradePriority(bDeviation, bInsight);
      
      return bPriority - aPriority;
    });
  }

  private calculateDeviation(asset: string): number {
    const currentValue = this.portfolio.assetAllocation[asset] || 0;
    const targetValue = this.portfolio.totalValue * this.targetAllocation[asset];
    return (currentValue - targetValue) / targetValue;
  }

  private calculateTradePriority(deviation: number, insight?: MarketInsight): number {
    let priority = deviation;

    if (insight) {
      // Adjust priority based on market conditions
      switch (insight.trend) {
        case 'bullish':
          priority *= insight.confidence;
          break;
        case 'bearish':
          priority *= (1 - insight.confidence);
          break;
        default:
          priority *= 0.5;
      }
    }

    return priority;
  }

  private estimatePrice(asset: string, insight?: MarketInsight): number {
    // In a real implementation, this would use actual market data
    // For now, we'll use a placeholder value
    return 1.0;
  }

  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getOptimizationMetrics(): any {
    return {
      currentDeviation: this.calculatePortfolioDeviation(),
      rebalanceNeeded: this.isRebalanceNeeded(),
      optimizationScore: this.calculateOptimizationScore()
    };
  }

  private calculatePortfolioDeviation(): number {
    let totalDeviation = 0;
    let assetCount = 0;

    for (const [asset, targetWeight] of Object.entries(this.targetAllocation)) {
      const currentWeight = (this.portfolio.assetAllocation[asset] || 0) / this.portfolio.totalValue;
      const deviation = Math.abs(currentWeight - targetWeight);
      totalDeviation += deviation;
      assetCount++;
    }

    return assetCount > 0 ? totalDeviation / assetCount : 0;
  }

  private isRebalanceNeeded(): boolean {
    return this.calculatePortfolioDeviation() > this.rebalanceThreshold;
  }

  private calculateOptimizationScore(): number {
    const deviation = this.calculatePortfolioDeviation();
    const riskScore = this.portfolio.riskScore;
    
    // Combine deviation and risk score into an optimization score
    // Lower score is better
    return (deviation * 0.7) + (riskScore * 0.3);
  }
} 