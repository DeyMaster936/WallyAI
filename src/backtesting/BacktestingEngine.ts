import { MarketData, Trade, PortfolioAnalysis, PerformanceMetrics } from '../types';
import { PerformanceAnalyzer } from '../analysis/PerformanceAnalyzer';
import { MarketAnalyzer } from '../market/MarketAnalyzer';
import { RiskManager } from '../trading/RiskManager';

export class BacktestingEngine {
  private historicalData: Map<string, MarketData[]>;
  private marketAnalyzer: MarketAnalyzer;
  private riskManager: RiskManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  private initialPortfolio: PortfolioAnalysis;
  private currentPortfolio: PortfolioAnalysis;
  private trades: Trade[];
  private currentTimeIndex: number;

  constructor(
    historicalData: Map<string, MarketData[]>,
    marketAnalyzer: MarketAnalyzer,
    riskManager: RiskManager,
    initialPortfolio: PortfolioAnalysis
  ) {
    this.historicalData = historicalData;
    this.marketAnalyzer = marketAnalyzer;
    this.riskManager = riskManager;
    this.initialPortfolio = initialPortfolio;
    this.currentPortfolio = { ...initialPortfolio };
    this.trades = [];
    this.currentTimeIndex = 0;
    this.performanceAnalyzer = new PerformanceAnalyzer(initialPortfolio);
  }

  runBacktest(startDate: number, endDate: number): PerformanceMetrics {
    this.reset();
    const timeRange = this.getTimeRange(startDate, endDate);

    for (let i = 0; i < timeRange.length; i++) {
      this.currentTimeIndex = i;
      const currentTime = timeRange[i];

      // Update market data for all assets
      for (const [asset, data] of this.historicalData.entries()) {
        const currentData = this.getDataUpToTime(data, currentTime);
        this.marketAnalyzer.updateMarketData(asset, currentData);
      }

      // Analyze market and generate insights
      const marketInsights = this.analyzeMarkets();

      // Update risk management
      this.updateRiskManagement(marketInsights);

      // Generate and execute trades
      const newTrades = this.generateTrades(marketInsights);
      this.executeTrades(newTrades);

      // Update portfolio
      this.updatePortfolio(currentTime);
    }

    return this.performanceAnalyzer.getPerformanceMetrics();
  }

  private reset(): void {
    this.currentPortfolio = { ...this.initialPortfolio };
    this.trades = [];
    this.currentTimeIndex = 0;
    this.performanceAnalyzer = new PerformanceAnalyzer(this.initialPortfolio);
  }

  private getTimeRange(startDate: number, endDate: number): number[] {
    const timeRange: number[] = [];
    const allAssets = Array.from(this.historicalData.values());
    
    if (allAssets.length === 0) return timeRange;

    // Get all unique timestamps from all assets
    const timestamps = new Set<number>();
    for (const assetData of allAssets) {
      for (const data of assetData) {
        if (data.timestamp >= startDate && data.timestamp <= endDate) {
          timestamps.add(data.timestamp);
        }
      }
    }

    return Array.from(timestamps).sort((a, b) => a - b);
  }

  private getDataUpToTime(data: MarketData[], time: number): MarketData[] {
    return data.filter(d => d.timestamp <= time);
  }

  private analyzeMarkets(): Map<string, any> {
    const insights = new Map<string, any>();
    
    for (const asset of this.historicalData.keys()) {
      try {
        const insight = this.marketAnalyzer.analyzeMarket(asset);
        insights.set(asset, insight);
      } catch (error) {
        console.warn(`Failed to analyze market for ${asset}:`, error);
      }
    }

    return insights;
  }

  private updateRiskManagement(marketInsights: Map<string, any>): void {
    // Update risk management based on market insights
    for (const [asset, insight] of marketInsights.entries()) {
      this.riskManager.updatePortfolio(this.currentPortfolio);
    }
  }

  private generateTrades(marketInsights: Map<string, any>): Trade[] {
    const trades: Trade[] = [];

    for (const [asset, insight] of marketInsights.entries()) {
      const currentData = this.getCurrentData(asset);
      if (!currentData) continue;

      const price = currentData.close;
      const amount = this.calculateTradeAmount(asset, insight, price);

      if (amount !== 0) {
        trades.push({
          id: this.generateTradeId(),
          asset,
          type: amount > 0 ? 'buy' : 'sell',
          amount: Math.abs(amount),
          price,
          timestamp: currentData.timestamp,
          metadata: {
            strategy: 'backtest',
            execution: 'simulated'
          }
        });
      }
    }

    return trades;
  }

  private executeTrades(trades: Trade[]): void {
    for (const trade of trades) {
      if (this.riskManager.canOpenPosition(trade.asset, trade.amount, trade.price)) {
        this.trades.push(trade);
        this.performanceAnalyzer.addTrade(trade);
      }
    }
  }

  private updatePortfolio(currentTime: number): void {
    const updatedPortfolio: PortfolioAnalysis = {
      timestamp: currentTime,
      totalValue: this.calculateTotalValue(),
      assetAllocation: this.calculateAssetAllocation(),
      riskScore: this.calculateRiskScore(),
      recommendations: this.generateRecommendations()
    };

    this.currentPortfolio = updatedPortfolio;
    this.performanceAnalyzer.updatePortfolio(updatedPortfolio);
  }

  private getCurrentData(asset: string): MarketData | undefined {
    const data = this.historicalData.get(asset);
    if (!data) return undefined;

    const timeRange = this.getTimeRange(0, Date.now());
    const currentTime = timeRange[this.currentTimeIndex];
    
    return data.find(d => d.timestamp === currentTime);
  }

  private calculateTradeAmount(asset: string, insight: any, price: number): number {
    // Implement trade amount calculation based on strategy and risk management
    return 0;
  }

  private calculateTotalValue(): number {
    let totalValue = 0;

    for (const [asset, allocation] of Object.entries(this.currentPortfolio.assetAllocation)) {
      const currentData = this.getCurrentData(asset);
      if (currentData) {
        totalValue += allocation * currentData.close;
      }
    }

    return totalValue;
  }

  private calculateAssetAllocation(): { [key: string]: number } {
    const allocation: { [key: string]: number } = {};
    const totalValue = this.calculateTotalValue();

    for (const [asset, value] of Object.entries(this.currentPortfolio.assetAllocation)) {
      const currentData = this.getCurrentData(asset);
      if (currentData) {
        allocation[asset] = (value * currentData.close) / totalValue;
      }
    }

    return allocation;
  }

  private calculateRiskScore(): number {
    // Implement risk score calculation
    return 0;
  }

  private generateRecommendations(): string[] {
    // Implement recommendation generation
    return [];
  }

  private generateTradeId(): string {
    return `backtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDetailedResults(): any {
    return {
      performance: this.performanceAnalyzer.getDetailedAnalysis(),
      trades: this.trades,
      portfolioHistory: this.performanceAnalyzer.getPerformanceMetrics(),
      riskMetrics: this.calculateRiskMetrics()
    };
  }

  private calculateRiskMetrics(): any {
    return {
      maxDrawdown: this.performanceAnalyzer.getPerformanceMetrics().maxDrawdown,
      sharpeRatio: this.performanceAnalyzer.getPerformanceMetrics().sharpeRatio,
      winRate: this.performanceAnalyzer.getPerformanceMetrics().winRate,
      totalReturn: this.performanceAnalyzer.getPerformanceMetrics().totalReturn
    };
  }
} 