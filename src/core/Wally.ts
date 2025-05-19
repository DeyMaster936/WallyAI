import { Wallet } from '../wallet/Wallet';
import { TradingEngine } from '../trading/TradingEngine';
import { AIModel } from '../ai/AIModel';
import { MarketData } from '../market/MarketData';
import { NLPInterface } from '../nlp/NLPInterface';
import { WallyConfig, WallyPersonality } from '../types';

export class Wally {
  private wallet: Wallet;
  private tradingEngine: TradingEngine;
  private aiModel: AIModel;
  private marketData: MarketData;
  private nlpInterface: NLPInterface;
  private personality: WallyPersonality;

  constructor(config: WallyConfig) {
    this.personality = config.personality;
    this.wallet = new Wallet(config.walletConfig);
    this.marketData = new MarketData(config.marketConfig);
    this.aiModel = new AIModel(config.aiConfig);
    this.tradingEngine = new TradingEngine(this.aiModel, this.marketData);
    this.nlpInterface = new NLPInterface(this.aiModel);
  }

  async initialize(): Promise<void> {
    await this.wallet.connect();
    await this.marketData.initialize();
    await this.aiModel.initialize(this.personality);
  }

  async processCommand(command: string): Promise<string> {
    const intent = await this.nlpInterface.parseCommand(command);
    const response = await this.tradingEngine.executeIntent(intent);
    return this.aiModel.generateResponse(response, this.personality);
  }

  async analyzePortfolio(): Promise<any> {
    const portfolio = await this.wallet.getPortfolio();
    return this.tradingEngine.analyzePortfolio(portfolio);
  }

  async optimizePortfolio(): Promise<any> {
    const portfolio = await this.wallet.getPortfolio();
    const optimization = await this.tradingEngine.optimizePortfolio(portfolio);
    return this.wallet.executeOptimization(optimization);
  }

  async getMarketInsights(): Promise<any> {
    return this.tradingEngine.getMarketInsights();
  }

  async setTradingStrategy(strategy: string): Promise<void> {
    await this.tradingEngine.setStrategy(strategy);
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.tradingEngine.getPerformanceMetrics();
  }
} 