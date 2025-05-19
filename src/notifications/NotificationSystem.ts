import { Alert } from '../types';

export interface NotificationChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'telegram' | 'discord';
  config: {
    [key: string]: any;
  };
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  channel: string;
}

export class NotificationSystem {
  private channels: Map<string, NotificationChannel>;
  private templates: Map<string, NotificationTemplate>;
  private notificationQueue: Alert[];
  private isProcessing: boolean;

  constructor() {
    this.channels = new Map();
    this.templates = new Map();
    this.notificationQueue = [];
    this.isProcessing = false;
  }

  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.name, channel);
  }

  removeChannel(channelName: string): void {
    this.channels.delete(channelName);
  }

  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  removeTemplate(templateId: string): void {
    this.templates.delete(templateId);
  }

  async sendNotification(alert: Alert, channelName?: string): Promise<void> {
    if (channelName) {
      const channel = this.channels.get(channelName);
      if (channel && channel.enabled) {
        await this.sendToChannel(alert, channel);
      }
    } else {
      // Send to all enabled channels
      for (const channel of this.channels.values()) {
        if (channel.enabled) {
          await this.sendToChannel(alert, channel);
        }
      }
    }
  }

  private async sendToChannel(alert: Alert, channel: NotificationChannel): Promise<void> {
    const template = this.findMatchingTemplate(alert, channel.name);
    if (!template) return;

    const message = this.formatMessage(alert, template);

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmail(channel.config, message);
          break;
        case 'slack':
          await this.sendSlackMessage(channel.config, message);
          break;
        case 'webhook':
          await this.sendWebhook(channel.config, message);
          break;
        case 'telegram':
          await this.sendTelegramMessage(channel.config, message);
          break;
        case 'discord':
          await this.sendDiscordMessage(channel.config, message);
          break;
      }
    } catch (error) {
      console.error(`Failed to send notification to ${channel.name}:`, error);
      this.notificationQueue.push(alert);
    }
  }

  private findMatchingTemplate(alert: Alert, channelName: string): NotificationTemplate | undefined {
    return Array.from(this.templates.values()).find(
      template => template.channel === channelName && this.templateMatchesAlert(template, alert)
    );
  }

  private templateMatchesAlert(template: NotificationTemplate, alert: Alert): boolean {
    return template.variables.every(variable => alert[variable as keyof Alert] !== undefined);
  }

  private formatMessage(alert: Alert, template: NotificationTemplate): string {
    let message = template.body;
    for (const variable of template.variables) {
      const value = alert[variable as keyof Alert];
      message = message.replace(`{{${variable}}}`, String(value));
    }
    return message;
  }

  private async sendEmail(config: any, message: any): Promise<void> {
    // Implement email sending logic
    console.log('Sending email:', message);
  }

  private async sendSlackMessage(config: any, message: any): Promise<void> {
    // Implement Slack message sending logic
    console.log('Sending Slack message:', message);
  }

  private async sendWebhook(config: any, message: any): Promise<void> {
    // Implement webhook sending logic
    console.log('Sending webhook:', message);
  }

  private async sendTelegramMessage(config: any, message: any): Promise<void> {
    // Implement Telegram message sending logic
    console.log('Sending Telegram message:', message);
  }

  private async sendDiscordMessage(config: any, message: any): Promise<void> {
    // Implement Discord message sending logic
    console.log('Sending Discord message:', message);
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) return;

    this.isProcessing = true;
    try {
      while (this.notificationQueue.length > 0) {
        const alert = this.notificationQueue.shift();
        if (alert) {
          await this.sendNotification(alert);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getChannelStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    for (const [name, channel] of this.channels.entries()) {
      status[name] = channel.enabled;
    }
    return status;
  }

  getTemplateCount(): number {
    return this.templates.size;
  }

  getQueueLength(): number {
    return this.notificationQueue.length;
  }
} 