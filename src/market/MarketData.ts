import axios from 'axios';
import { MarketConfig } from '../types';

export class MarketData {
  private config: MarketConfig;
  private dataCache: Map<string, any>;
  private lastUpdate: number;

  constructor(config: MarketConfig) {
    this.config = config;
    this.dataCache = new Map();
    this.lastUpdate = 0;
  }

  async initialize(): Promise<void> {
    // Initialize connections to data providers
    await this.updateMarketData();
  }

  async getMarketData(): Promise<any> {
    if (this.shouldUpdate()) {
      await this.updateMarketData();
    }
    return this.getCachedData('market');
  }

  async getAssetData(asset: string): Promise<any> {
    if (this.shouldUpdate()) {
      await this.updateMarketData();
    }
    return this.getCachedData(`asset_${asset}`);
  }

  async getPortfolioData(): Promise<Record<string, number>> {
    if (this.shouldUpdate()) {
      await this.updateMarketData();
    }
    return this.getCachedData('portfolio');
  }

  private async updateMarketData(): Promise<void> {
    const promises = this.config.dataProviders.map(provider =>
      this.fetchDataFromProvider(provider)
    );

    const results = await Promise.all(promises);
    this.updateCache(results);
    this.lastUpdate = Date.now();
  }

  private async fetchDataFromProvider(provider: string): Promise<any> {
    try {
      const response = await axios.get(provider);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${provider}:`, error);
      return null;
    }
  }

  private updateCache(data: any[]): void {
    // Process and store data in cache
    this.dataCache.set('market', this.processMarketData(data));
    
    // Process individual asset data
    this.config.supportedAssets.forEach(asset => {
      this.dataCache.set(`asset_${asset}`, this.processAssetData(data, asset));
    });
  }

  private processMarketData(data: any[]): any {
    // Implement market data processing logic
    return {
      timestamp: Date.now(),
      assets: this.config.supportedAssets,
      prices: {},
      volumes: {},
      trends: {},
    };
  }

  private processAssetData(data: any[], asset: string): any {
    // Implement asset-specific data processing
    return {
      timestamp: Date.now(),
      price: 0,
      volume: 0,
      indicators: {},
    };
  }

  private shouldUpdate(): boolean {
    return Date.now() - this.lastUpdate > this.config.updateInterval;
  }

  private getCachedData(key: string): any {
    return this.dataCache.get(key) || null;
  }
} 