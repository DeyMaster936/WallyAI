import { MarketAnalysisProfile, MarketInsight, MarketData } from '../types';
import { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, calculateStochastic } from '../utils/indicators';

export class MarketAnalyzer {
  private analysisProfile: MarketAnalysisProfile;
  private marketData: Map<string, MarketData[]>;

  constructor(analysisProfile: MarketAnalysisProfile) {
    this.analysisProfile = analysisProfile;
    this.marketData = new Map();
  }

  updateMarketData(asset: string, data: MarketData[]): void {
    this.marketData.set(asset, data);
  }

  analyzeMarket(asset: string): MarketInsight {
    const data = this.marketData.get(asset);
    if (!data) {
      throw new Error(`No market data available for ${asset}`);
    }

    const technicalAnalysis = this.performTechnicalAnalysis(data);
    const fundamentalAnalysis = this.performFundamentalAnalysis(data);
    const sentimentAnalysis = this.performSentimentAnalysis(data);

    return this.generateMarketInsight(technicalAnalysis, fundamentalAnalysis, sentimentAnalysis);
  }

  private performTechnicalAnalysis(data: MarketData[]): any {
    const analysis: any = {};

    // Calculate technical indicators based on preferred timeframes
    for (const timeframe of this.analysisProfile.preferredTimeframes) {
      const timeframeData = this.filterDataByTimeframe(data, timeframe);
      
      analysis[timeframe] = {
        sma: calculateSMA(timeframeData, 20),
        rsi: calculateRSI(timeframeData, 14),
        macd: calculateMACD(timeframeData),
        bollingerBands: calculateBollingerBands(timeframeData, 20, 2),
        stochastic: calculateStochastic(timeframeData, 14, 3)
      };
    }

    return analysis;
  }

  private performFundamentalAnalysis(data: MarketData[]): any {
    const analysis: any = {};

    for (const factor of this.analysisProfile.fundamentalFactors) {
      switch (factor) {
        case 'volume':
          analysis.volume = this.analyzeVolume(data);
          break;
        case 'volatility':
          analysis.volatility = this.analyzeVolatility(data);
          break;
        case 'liquidity':
          analysis.liquidity = this.analyzeLiquidity(data);
          break;
        case 'market_cap':
          analysis.marketCap = this.analyzeMarketCap(data);
          break;
      }
    }

    return analysis;
  }

  private performSentimentAnalysis(data: MarketData[]): any {
    const analysis: any = {};

    if (this.analysisProfile.sentimentAnalysis) {
      analysis.news = this.analyzeNewsSentiment(data);
      analysis.social = this.analyzeSocialSentiment(data);
      analysis.market = this.analyzeMarketSentiment(data);
    }

    return analysis;
  }

  private generateMarketInsight(
    technicalAnalysis: any,
    fundamentalAnalysis: any,
    sentimentAnalysis: any
  ): MarketInsight {
    const trend = this.determineTrend(technicalAnalysis);
    const confidence = this.calculateConfidence(technicalAnalysis, fundamentalAnalysis, sentimentAnalysis);
    const recommendation = this.generateRecommendation(trend, confidence);

    return {
      trend,
      confidence,
      recommendation,
      technicalAnalysis,
      fundamentalAnalysis,
      sentimentAnalysis
    };
  }

  private determineTrend(technicalAnalysis: any): string {
    const primaryTimeframe = this.analysisProfile.preferredTimeframes[0];
    const analysis = technicalAnalysis[primaryTimeframe];

    const sma20 = analysis.sma[analysis.sma.length - 1];
    const sma50 = calculateSMA(analysis.sma, 50)[analysis.sma.length - 1];
    const rsi = analysis.rsi[analysis.rsi.length - 1];
    const macd = analysis.macd[analysis.macd.length - 1];

    if (sma20 > sma50 && rsi > 50 && macd > 0) {
      return 'bullish';
    } else if (sma20 < sma50 && rsi < 50 && macd < 0) {
      return 'bearish';
    } else {
      return 'neutral';
    }
  }

  private calculateConfidence(
    technicalAnalysis: any,
    fundamentalAnalysis: any,
    sentimentAnalysis: any
  ): number {
    let confidence = 0;
    let totalWeight = 0;

    // Technical analysis confidence
    const technicalConfidence = this.calculateTechnicalConfidence(technicalAnalysis);
    confidence += technicalConfidence * 0.4;
    totalWeight += 0.4;

    // Fundamental analysis confidence
    const fundamentalConfidence = this.calculateFundamentalConfidence(fundamentalAnalysis);
    confidence += fundamentalConfidence * 0.3;
    totalWeight += 0.3;

    // Sentiment analysis confidence
    if (this.analysisProfile.sentimentAnalysis) {
      const sentimentConfidence = this.calculateSentimentConfidence(sentimentAnalysis);
      confidence += sentimentConfidence * 0.3;
      totalWeight += 0.3;
    }

    return confidence / totalWeight;
  }

  private calculateTechnicalConfidence(technicalAnalysis: any): number {
    let confidence = 0;
    let indicators = 0;

    for (const timeframe of this.analysisProfile.preferredTimeframes) {
      const analysis = technicalAnalysis[timeframe];
      
      // RSI confidence
      const rsi = analysis.rsi[analysis.rsi.length - 1];
      if (rsi > 70 || rsi < 30) {
        confidence += 1;
      } else if (rsi > 60 || rsi < 40) {
        confidence += 0.5;
      }
      indicators++;

      // MACD confidence
      const macd = analysis.macd[analysis.macd.length - 1];
      if (Math.abs(macd) > 0.5) {
        confidence += 1;
      } else if (Math.abs(macd) > 0.2) {
        confidence += 0.5;
      }
      indicators++;
    }

    return confidence / indicators;
  }

  private calculateFundamentalConfidence(fundamentalAnalysis: any): number {
    let confidence = 0;
    let factors = 0;

    for (const factor of this.analysisProfile.fundamentalFactors) {
      const analysis = fundamentalAnalysis[factor];
      if (analysis) {
        confidence += this.evaluateFundamentalFactor(analysis);
        factors++;
      }
    }

    return factors > 0 ? confidence / factors : 0;
  }

  private calculateSentimentConfidence(sentimentAnalysis: any): number {
    let confidence = 0;
    let sources = 0;

    if (sentimentAnalysis.news) {
      confidence += this.evaluateNewsSentiment(sentimentAnalysis.news);
      sources++;
    }

    if (sentimentAnalysis.social) {
      confidence += this.evaluateSocialSentiment(sentimentAnalysis.social);
      sources++;
    }

    if (sentimentAnalysis.market) {
      confidence += this.evaluateMarketSentiment(sentimentAnalysis.market);
      sources++;
    }

    return sources > 0 ? confidence / sources : 0;
  }

  private generateRecommendation(trend: string, confidence: number): string {
    if (confidence < 0.3) {
      return 'hold';
    }

    switch (trend) {
      case 'bullish':
        return confidence > 0.7 ? 'strong_buy' : 'buy';
      case 'bearish':
        return confidence > 0.7 ? 'strong_sell' : 'sell';
      default:
        return 'hold';
    }
  }

  private filterDataByTimeframe(data: MarketData[], timeframe: string): MarketData[] {
    // Implement timeframe filtering logic
    return data;
  }

  private analyzeVolume(data: MarketData[]): any {
    // Implement volume analysis
    return {};
  }

  private analyzeVolatility(data: MarketData[]): any {
    // Implement volatility analysis
    return {};
  }

  private analyzeLiquidity(data: MarketData[]): any {
    // Implement liquidity analysis
    return {};
  }

  private analyzeMarketCap(data: MarketData[]): any {
    // Implement market cap analysis
    return {};
  }

  private analyzeNewsSentiment(data: MarketData[]): any {
    // Implement news sentiment analysis
    return {};
  }

  private analyzeSocialSentiment(data: MarketData[]): any {
    // Implement social sentiment analysis
    return {};
  }

  private analyzeMarketSentiment(data: MarketData[]): any {
    // Implement market sentiment analysis
    return {};
  }

  private evaluateFundamentalFactor(analysis: any): number {
    // Implement fundamental factor evaluation
    return 0;
  }

  private evaluateNewsSentiment(sentiment: any): number {
    // Implement news sentiment evaluation
    return 0;
  }

  private evaluateSocialSentiment(sentiment: any): number {
    // Implement social sentiment evaluation
    return 0;
  }

  private evaluateMarketSentiment(sentiment: any): number {
    // Implement market sentiment evaluation
    return 0;
  }
} 