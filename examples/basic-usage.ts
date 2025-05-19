import { Wally } from '../src/core/Wally';
import { WallyConfig } from '../src/types';

async function main() {
  // Configure Wally
  const config: WallyConfig = {
    personality: {
      name: 'Alex',
      tradingStyle: 'moderate',
      riskTolerance: 0.5,
      preferredAssets: ['BTC', 'ETH', 'SOL'],
      communicationStyle: 'friendly'
    },
    walletConfig: {
      provider: 'ethereum',
      network: 'mainnet'
    },
    marketConfig: {
      dataProviders: ['https://api.coingecko.com/v3'],
      updateInterval: 60000,
      supportedAssets: ['BTC', 'ETH', 'SOL', 'USDT', 'USDC']
    },
    aiConfig: {
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0.7,
      maxTokens: 1000
    }
  };

  // Initialize Wally
  const wally = new Wally(config);
  await wally.initialize();

  // Example 1: Process a trading command
  console.log('Processing trading command...');
  const response = await wally.processCommand('Buy 0.1 BTC');
  console.log('Response:', response);

  // Example 2: Analyze portfolio
  console.log('\nAnalyzing portfolio...');
  const analysis = await wally.analyzePortfolio();
  console.log('Portfolio Analysis:', analysis);

  // Example 3: Get market insights
  console.log('\nGetting market insights...');
  const insights = await wally.getMarketInsights();
  console.log('Market Insights:', insights);

  // Example 4: Optimize portfolio
  console.log('\nOptimizing portfolio...');
  const optimization = await wally.optimizePortfolio();
  console.log('Portfolio Optimization:', optimization);

  // Example 5: Get performance metrics
  console.log('\nGetting performance metrics...');
  const metrics = await wally.getPerformanceMetrics();
  console.log('Performance Metrics:', metrics);
}

main().catch(console.error); 