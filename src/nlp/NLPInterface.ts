import natural from 'natural';
import { AIModel } from '../ai/AIModel';
import { TradingIntent } from '../types';

export class NLPInterface {
  private aiModel: AIModel;
  private tokenizer: natural.WordTokenizer;
  private classifier: natural.BayesClassifier;

  constructor(aiModel: AIModel) {
    this.aiModel = aiModel;
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.initializeClassifier();
  }

  private initializeClassifier(): void {
    // Train the classifier with common trading commands
    this.classifier.addDocument('buy', 'buy');
    this.classifier.addDocument('purchase', 'buy');
    this.classifier.addDocument('get', 'buy');
    this.classifier.addDocument('sell', 'sell');
    this.classifier.addDocument('trade', 'sell');
    this.classifier.addDocument('dump', 'sell');
    this.classifier.addDocument('analyze', 'analyze');
    this.classifier.addDocument('check', 'analyze');
    this.classifier.addDocument('review', 'analyze');
    this.classifier.addDocument('optimize', 'optimize');
    this.classifier.addDocument('rebalance', 'optimize');
    this.classifier.addDocument('adjust', 'optimize');
    
    this.classifier.train();
  }

  async parseCommand(command: string): Promise<TradingIntent> {
    const tokens = this.tokenizer.tokenize(command.toLowerCase());
    const action = this.classifier.classify(command);
    
    // Extract asset and amount using regex patterns
    const assetMatch = command.match(/\b(BTC|ETH|SOL|USDT|USDC)\b/i);
    const amountMatch = command.match(/\b(\d+(?:\.\d+)?)\b/);

    return {
      action: action as 'buy' | 'sell' | 'analyze' | 'optimize',
      asset: assetMatch ? assetMatch[0].toUpperCase() : undefined,
      amount: amountMatch ? parseFloat(amountMatch[0]) : undefined,
    };
  }

  async generateResponse(intent: TradingIntent, result: any): Promise<string> {
    const prompt = this.generateResponsePrompt(intent, result);
    return this.aiModel.generateResponse(prompt, {
      name: 'Wally',
      tradingStyle: 'moderate',
      riskTolerance: 0.5,
      preferredAssets: ['BTC', 'ETH', 'SOL'],
      communicationStyle: 'friendly',
    });
  }

  private generateResponsePrompt(intent: TradingIntent, result: any): string {
    return `Generate a response for the following trading action:
    Action: ${intent.action}
    Asset: ${intent.asset || 'N/A'}
    Amount: ${intent.amount || 'N/A'}
    Result: ${JSON.stringify(result)}`;
  }
} 