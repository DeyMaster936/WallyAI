import { Configuration, OpenAIApi } from 'openai';
import { AIConfig, WallyPersonality, MarketInsight, PortfolioAnalysis } from '../types';

export class AIModel {
  private config: AIConfig;
  private openai: OpenAIApi;
  private personality: WallyPersonality;

  constructor(config: AIConfig) {
    this.config = config;
    const configuration = new Configuration({
      apiKey: config.apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async initialize(personality: WallyPersonality): Promise<void> {
    this.personality = personality;
  }

  async analyzeMarket(data: any): Promise<MarketInsight> {
    const prompt = this.generateMarketAnalysisPrompt(data);
    const response = await this.openai.createCompletion({
      model: this.config.model,
      prompt,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return this.parseMarketInsight(response.data.choices[0].text);
  }

  async analyzePortfolio(portfolio: Record<string, number>): Promise<PortfolioAnalysis> {
    const prompt = this.generatePortfolioAnalysisPrompt(portfolio);
    const response = await this.openai.createCompletion({
      model: this.config.model,
      prompt,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return this.parsePortfolioAnalysis(response.data.choices[0].text);
  }

  async generateResponse(data: any, personality: WallyPersonality): Promise<string> {
    const prompt = this.generateResponsePrompt(data, personality);
    const response = await this.openai.createCompletion({
      model: this.config.model,
      prompt,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response.data.choices[0].text;
  }

  private generateMarketAnalysisPrompt(data: any): string {
    return `Analyze the following market data and provide insights:
    ${JSON.stringify(data)}
    Consider the trading style: ${this.personality.tradingStyle}
    Risk tolerance: ${this.personality.riskTolerance}`;
  }

  private generatePortfolioAnalysisPrompt(portfolio: Record<string, number>): string {
    return `Analyze the following portfolio and provide recommendations:
    ${JSON.stringify(portfolio)}
    Consider the trading style: ${this.personality.tradingStyle}
    Risk tolerance: ${this.personality.riskTolerance}`;
  }

  private generateResponsePrompt(data: any, personality: WallyPersonality): string {
    return `Generate a response in a ${personality.communicationStyle} tone:
    Data: ${JSON.stringify(data)}
    Personality: ${JSON.stringify(personality)}`;
  }

  private parseMarketInsight(text: string): MarketInsight {
    // Implementation to parse AI response into MarketInsight
    return {
      trend: 'neutral',
      confidence: 0.5,
      supportingFactors: [],
      recommendedActions: [],
    };
  }

  private parsePortfolioAnalysis(text: string): PortfolioAnalysis {
    // Implementation to parse AI response into PortfolioAnalysis
    return {
      totalValue: 0,
      assetAllocation: {},
      riskScore: 0,
      recommendations: [],
    };
  }
} 