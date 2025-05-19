import { NotificationSystem, NotificationChannel, NotificationTemplate } from '../src/notifications/NotificationSystem';
import { WebhookSystem, WebhookConfig } from '../src/integrations/WebhookSystem';
import { Alert, Trade, PortfolioAnalysis, MarketInsight, PerformanceMetrics } from '../src/types';

async function main() {
  // Initialize notification system
  const notificationSystem = new NotificationSystem();

  // Add notification channels
  const slackChannel: NotificationChannel = {
    name: 'slack-alerts',
    type: 'slack',
    config: {
      webhookUrl: 'https://hooks.slack.com/services/your-webhook-url',
      channel: '#trading-alerts'
    },
    enabled: true
  };

  const emailChannel: NotificationChannel = {
    name: 'email-alerts',
    type: 'email',
    config: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      username: 'your-email@example.com',
      password: 'your-password'
    },
    enabled: true
  };

  notificationSystem.addChannel(slackChannel);
  notificationSystem.addChannel(emailChannel);

  // Add notification templates
  const alertTemplate: NotificationTemplate = {
    id: 'alert-template',
    name: 'Alert Notification',
    subject: 'Trading Alert: {{level}}',
    body: `
      Alert Level: {{level}}
      Message: {{message}}
      Metric: {{metric}}
      Value: {{value}}
      Threshold: {{threshold}}
      Time: {{timestamp}}
    `,
    variables: ['level', 'message', 'metric', 'value', 'threshold', 'timestamp'],
    channel: 'slack-alerts'
  };

  notificationSystem.addTemplate(alertTemplate);

  // Initialize webhook system
  const webhookSystem = new WebhookSystem();

  // Register webhooks
  const tradingWebhook: WebhookConfig = {
    url: 'https://your-api.com/webhooks/trading',
    secret: 'your-webhook-secret',
    events: ['trade', 'portfolio_update'],
    headers: {
      'X-Custom-Header': 'trading-webhook'
    },
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000
    }
  };

  const analyticsWebhook: WebhookConfig = {
    url: 'https://your-api.com/webhooks/analytics',
    secret: 'your-analytics-secret',
    events: ['market_insight', 'performance_update'],
    retryConfig: {
      maxRetries: 5,
      retryDelay: 2000
    }
  };

  webhookSystem.registerWebhook('trading', tradingWebhook);
  webhookSystem.registerWebhook('analytics', analyticsWebhook);

  // Simulate sending notifications
  const alert: Alert = {
    id: 'alert_1',
    timestamp: Date.now(),
    level: 'warning',
    message: 'High CPU usage detected',
    metric: 'cpuUsage',
    value: 85,
    threshold: 80
  };

  await notificationSystem.sendNotification(alert);

  // Simulate webhook events
  const trade: Trade = {
    id: 'trade_1',
    asset: 'BTC',
    type: 'buy',
    amount: 0.1,
    price: 50000,
    timestamp: Date.now(),
    metadata: {
      strategy: 'trend_following',
      execution: 'market'
    }
  };

  const portfolio: PortfolioAnalysis = {
    timestamp: Date.now(),
    totalValue: 100000,
    assetAllocation: {
      BTC: 40,
      ETH: 30,
      USDT: 30
    },
    riskScore: 0.65,
    recommendations: []
  };

  const insight: MarketInsight = {
    trend: 'bullish',
    confidence: 0.8,
    recommendation: 'buy',
    technicalAnalysis: {},
    fundamentalAnalysis: {},
    sentimentAnalysis: {}
  };

  const performance: PerformanceMetrics = {
    totalReturn: 12.5,
    winRate: 65,
    sharpeRatio: 1.8,
    maxDrawdown: 8.2,
    trades: []
  };

  // Send webhook events
  await webhookSystem.notifyTrade(trade);
  await webhookSystem.notifyPortfolioUpdate(portfolio);
  await webhookSystem.notifyMarketInsight(insight);
  await webhookSystem.notifyPerformanceUpdate(performance);

  // Process any queued notifications and webhooks
  await notificationSystem.processQueue();
  await webhookSystem.processQueue();

  // Get system status
  console.log('Notification System Status:');
  console.log('Channels:', notificationSystem.getChannelStatus());
  console.log('Templates:', notificationSystem.getTemplateCount());
  console.log('Queue Length:', notificationSystem.getQueueLength());

  console.log('\nWebhook System Status:');
  console.log('Webhook Count:', webhookSystem.getWebhookCount());
  console.log('Queue Length:', webhookSystem.getQueueLength());
  console.log('Registered Events:', webhookSystem.getRegisteredEvents());
}

main().catch(console.error); 