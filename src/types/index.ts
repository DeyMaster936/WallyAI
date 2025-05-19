export interface WallyConfig {
  personality: WallyPersonality;
  wallet: WalletConfig;
  market: MarketConfig;
  ai: AIConfig;
  advancedConfig?: AdvancedConfig;
}

export interface WallyPersonality {
  name: string;
  tradingStyle: string;
  riskTolerance: number;
  preferredAssets: string[];
  communicationStyle: string;
}

export interface TradingStrategy {
  name: string;
  description: string;
  indicators: string[];
  timeframes: string[];
  riskLevel: number;
}

export interface WalletConfig {
  provider: string;
  network: string;
  apiKey: string;
  advancedOptions?: {
    gasOptimization: boolean;
    slippageTolerance: number;
  };
}

export interface MarketConfig {
  dataProviders: string[];
  updateInterval: number;
  supportedAssets: string[];
  advancedOptions?: {
    useWebsocket: boolean;
    rateLimit: number;
  };
}

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  advancedOptions?: {
    fineTuning: boolean;
    responseFormat: string;
  };
}

export interface AdvancedConfig {
  monitoring: {
    enabled: boolean;
    metrics: string[];
  };
  backtesting: {
    enabled: boolean;
    timeframe: string;
  };
  optimization: {
    enabled: boolean;
    method: string;
  };
  security: {
    encryption: boolean;
    rateLimit: number;
  };
}

export interface TradingIntent {
  action: 'buy' | 'sell' | 'hold';
  asset: string;
  amount: number;
  leverage?: number;
  stopLoss?: number;
}

export interface PortfolioAnalysis {
  timestamp: number;
  totalValue: number;
  assetAllocation: { [key: string]: number };
  riskScore: number;
  recommendations: string[];
}

export interface MarketInsight {
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  recommendation: 'buy' | 'sell' | 'hold' | 'strong_buy' | 'strong_sell';
  technicalAnalysis: any;
  fundamentalAnalysis: any;
  sentimentAnalysis: any;
}

export interface PerformanceMetrics {
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  trades: Trade[];
}

export interface Trade {
  id: string;
  asset: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  metadata: {
    strategy: string;
    execution: string;
  };
}

export interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAnalysisProfile {
  preferredTimeframes: string[];
  technicalIndicators: string[];
  fundamentalFactors: string[];
  sentimentAnalysis: boolean;
  newsWeight: number;
  socialWeight: number;
}

export interface RiskManagementProfile {
  maxPositionSize: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDrawdown: number;
  diversificationRules: string[];
  riskAdjustmentSpeed: number;
}

export interface Alert {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
} 