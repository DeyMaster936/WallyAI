import { WallyPersonality, TradingStrategy } from '../types';

export interface PersonalityTemplate extends WallyPersonality {
  tradingStrategies: TradingStrategy[];
  riskManagement: RiskManagementProfile;
  marketAnalysis: MarketAnalysisProfile;
  communication: CommunicationProfile;
  learningStyle: LearningProfile;
}

interface RiskManagementProfile {
  maxPositionSize: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDrawdown: number;
  diversificationRules: string[];
  riskAdjustmentSpeed: number; // 0-1
}

interface MarketAnalysisProfile {
  preferredTimeframes: string[];
  technicalIndicators: string[];
  fundamentalFactors: string[];
  sentimentAnalysis: boolean;
  newsImpactWeight: number;
  socialMediaWeight: number;
}

interface CommunicationProfile {
  responseStyle: 'concise' | 'detailed' | 'educational';
  emojiUsage: boolean;
  technicalDepth: 'basic' | 'intermediate' | 'advanced';
  explanationStyle: 'analytical' | 'narrative' | 'comparative';
  notificationPreferences: {
    trades: boolean;
    analysis: boolean;
    marketUpdates: boolean;
    portfolioChanges: boolean;
  };
}

interface LearningProfile {
  adaptationSpeed: number; // 0-1
  strategyEvolution: boolean;
  historicalAnalysisWeight: number;
  patternRecognition: boolean;
  feedbackIntegration: boolean;
}

export const PERSONALITY_TEMPLATES: Record<string, PersonalityTemplate> = {
  COUNTER: {
    name: 'Counter',
    tradingStyle: 'moderate',
    riskTolerance: 0.6,
    preferredAssets: ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'],
    communicationStyle: 'professional',
    tradingStrategies: [
      {
        name: 'Trend Following',
        description: 'Follows market trends with technical analysis',
        indicators: ['MACD', 'RSI', 'Bollinger Bands'],
        timeframes: ['4h', '1d'],
        riskLevel: 'moderate'
      },
      {
        name: 'Mean Reversion',
        description: 'Trades based on price returning to historical averages',
        indicators: ['RSI', 'Stochastic', 'Bollinger Bands'],
        timeframes: ['1h', '4h'],
        riskLevel: 'moderate'
      }
    ],
    riskManagement: {
      maxPositionSize: 0.1,
      stopLossPercentage: 5,
      takeProfitPercentage: 15,
      maxDrawdown: 20,
      diversificationRules: [
        'Maximum 30% in any single asset',
        'Minimum 3 different assets',
        'Maximum 60% in high-risk assets'
      ],
      riskAdjustmentSpeed: 0.7
    },
    marketAnalysis: {
      preferredTimeframes: ['1h', '4h', '1d'],
      technicalIndicators: ['MACD', 'RSI', 'Bollinger Bands', 'Volume Profile'],
      fundamentalFactors: ['Market Cap', 'Volume', 'Developer Activity'],
      sentimentAnalysis: true,
      newsImpactWeight: 0.6,
      socialMediaWeight: 0.4
    },
    communication: {
      responseStyle: 'detailed',
      emojiUsage: true,
      technicalDepth: 'intermediate',
      explanationStyle: 'analytical',
      notificationPreferences: {
        trades: true,
        analysis: true,
        marketUpdates: true,
        portfolioChanges: true
      }
    },
    learningStyle: {
      adaptationSpeed: 0.7,
      strategyEvolution: true,
      historicalAnalysisWeight: 0.8,
      patternRecognition: true,
      feedbackIntegration: true
    }
  },

  YOLO: {
    name: 'YOLO',
    tradingStyle: 'aggressive',
    riskTolerance: 0.9,
    preferredAssets: ['BTC', 'ETH', 'SOL', 'DOGE', 'SHIB'],
    communicationStyle: 'casual',
    tradingStrategies: [
      {
        name: 'Momentum Trading',
        description: 'Rides strong market momentum with high leverage',
        indicators: ['Volume', 'RSI', 'MACD'],
        timeframes: ['15m', '1h'],
        riskLevel: 'high'
      },
      {
        name: 'Breakout Trading',
        description: 'Trades breakouts with high conviction',
        indicators: ['Bollinger Bands', 'ATR', 'Volume'],
        timeframes: ['1h', '4h'],
        riskLevel: 'high'
      }
    ],
    riskManagement: {
      maxPositionSize: 0.3,
      stopLossPercentage: 10,
      takeProfitPercentage: 30,
      maxDrawdown: 40,
      diversificationRules: [
        'Maximum 50% in any single asset',
        'Minimum 2 different assets',
        'No maximum on high-risk assets'
      ],
      riskAdjustmentSpeed: 0.9
    },
    marketAnalysis: {
      preferredTimeframes: ['15m', '1h', '4h'],
      technicalIndicators: ['RSI', 'MACD', 'Volume', 'ATR'],
      fundamentalFactors: ['Social Media Trends', 'Whale Movements'],
      sentimentAnalysis: true,
      newsImpactWeight: 0.8,
      socialMediaWeight: 0.8
    },
    communication: {
      responseStyle: 'concise',
      emojiUsage: true,
      technicalDepth: 'basic',
      explanationStyle: 'narrative',
      notificationPreferences: {
        trades: true,
        analysis: false,
        marketUpdates: true,
        portfolioChanges: true
      }
    },
    learningStyle: {
      adaptationSpeed: 0.9,
      strategyEvolution: true,
      historicalAnalysisWeight: 0.4,
      patternRecognition: true,
      feedbackIntegration: false
    }
  },

  QUICK: {
    name: 'Quick',
    tradingStyle: 'conservative',
    riskTolerance: 0.3,
    preferredAssets: ['BTC', 'ETH', 'USDT', 'USDC', 'DAI'],
    communicationStyle: 'professional',
    tradingStrategies: [
      {
        name: 'Scalping',
        description: 'Quick trades with small profits',
        indicators: ['Order Book', 'Volume', 'RSI'],
        timeframes: ['1m', '5m'],
        riskLevel: 'low'
      },
      {
        name: 'Arbitrage',
        description: 'Exploits price differences across exchanges',
        indicators: ['Price Spread', 'Volume', 'Liquidity'],
        timeframes: ['1m', '5m'],
        riskLevel: 'low'
      }
    ],
    riskManagement: {
      maxPositionSize: 0.05,
      stopLossPercentage: 2,
      takeProfitPercentage: 5,
      maxDrawdown: 10,
      diversificationRules: [
        'Maximum 20% in any single asset',
        'Minimum 5 different assets',
        'Maximum 30% in high-risk assets'
      ],
      riskAdjustmentSpeed: 0.3
    },
    marketAnalysis: {
      preferredTimeframes: ['1m', '5m', '15m'],
      technicalIndicators: ['Order Book', 'Volume', 'RSI', 'VWAP'],
      fundamentalFactors: ['Liquidity', 'Spread', 'Volume'],
      sentimentAnalysis: false,
      newsImpactWeight: 0.2,
      socialMediaWeight: 0.1
    },
    communication: {
      responseStyle: 'concise',
      emojiUsage: false,
      technicalDepth: 'advanced',
      explanationStyle: 'analytical',
      notificationPreferences: {
        trades: true,
        analysis: true,
        marketUpdates: false,
        portfolioChanges: true
      }
    },
    learningStyle: {
      adaptationSpeed: 0.5,
      strategyEvolution: true,
      historicalAnalysisWeight: 0.9,
      patternRecognition: true,
      feedbackIntegration: true
    }
  }
}; 