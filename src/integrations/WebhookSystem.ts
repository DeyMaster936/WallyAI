import { Trade, PortfolioAnalysis, MarketInsight, PerformanceMetrics } from '../types';

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  headers?: { [key: string]: string };
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface WebhookPayload {
  event: string;
  timestamp: number;
  data: any;
  signature?: string;
}

export class WebhookSystem {
  private webhooks: Map<string, WebhookConfig>;
  private eventQueue: WebhookPayload[];
  private isProcessing: boolean;

  constructor() {
    this.webhooks = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  registerWebhook(id: string, config: WebhookConfig): void {
    this.webhooks.set(id, config);
  }

  unregisterWebhook(id: string): void {
    this.webhooks.delete(id);
  }

  async triggerEvent(event: string, data: any): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      data
    };

    for (const [id, config] of this.webhooks.entries()) {
      if (config.events.includes(event)) {
        await this.sendWebhook(id, config, payload);
      }
    }
  }

  private async sendWebhook(id: string, config: WebhookConfig, payload: WebhookPayload): Promise<void> {
    const maxRetries = config.retryConfig?.maxRetries || 3;
    const retryDelay = config.retryConfig?.retryDelay || 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': this.generateSignature(payload, config.secret),
            ...config.headers
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          console.error(`Failed to send webhook ${id} after ${maxRetries} attempts:`, error);
          this.eventQueue.push(payload);
        } else {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = require('crypto').createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    try {
      while (this.eventQueue.length > 0) {
        const payload = this.eventQueue.shift();
        if (payload) {
          await this.retryFailedWebhooks(payload);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async retryFailedWebhooks(payload: WebhookPayload): Promise<void> {
    for (const [id, config] of this.webhooks.entries()) {
      if (config.events.includes(payload.event)) {
        await this.sendWebhook(id, config, payload);
      }
    }
  }

  // Convenience methods for common events
  async notifyTrade(trade: Trade): Promise<void> {
    await this.triggerEvent('trade', trade);
  }

  async notifyPortfolioUpdate(portfolio: PortfolioAnalysis): Promise<void> {
    await this.triggerEvent('portfolio_update', portfolio);
  }

  async notifyMarketInsight(insight: MarketInsight): Promise<void> {
    await this.triggerEvent('market_insight', insight);
  }

  async notifyPerformanceUpdate(performance: PerformanceMetrics): Promise<void> {
    await this.triggerEvent('performance_update', performance);
  }

  getWebhookCount(): number {
    return this.webhooks.size;
  }

  getQueueLength(): number {
    return this.eventQueue.length;
  }

  getWebhookStatus(id: string): boolean {
    return this.webhooks.has(id);
  }

  getRegisteredEvents(): string[] {
    const events = new Set<string>();
    for (const config of this.webhooks.values()) {
      config.events.forEach(event => events.add(event));
    }
    return Array.from(events);
  }
} 