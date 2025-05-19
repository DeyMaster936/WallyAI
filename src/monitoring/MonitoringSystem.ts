import { PerformanceMetrics, PortfolioAnalysis, Trade } from '../types';

interface MonitoringMetrics {
  timestamp: number;
  performance: PerformanceMetrics;
  portfolio: PortfolioAnalysis;
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    apiLatency: number;
    errorRate: number;
  };
  tradingMetrics: {
    activeTrades: number;
    pendingOrders: number;
    executionTime: number;
    successRate: number;
  };
}

interface Alert {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

export class MonitoringSystem {
  private metrics: MonitoringMetrics[];
  private alerts: Alert[];
  private alertThresholds: { [key: string]: number };
  private startTime: number;

  constructor(alertThresholds: { [key: string]: number } = {}) {
    this.metrics = [];
    this.alerts = [];
    this.alertThresholds = {
      cpuUsage: 80,
      memoryUsage: 80,
      apiLatency: 1000,
      errorRate: 5,
      drawdown: 20,
      ...alertThresholds
    };
    this.startTime = Date.now();
  }

  updateMetrics(
    performance: PerformanceMetrics,
    portfolio: PortfolioAnalysis,
    systemHealth: MonitoringMetrics['systemHealth'],
    tradingMetrics: MonitoringMetrics['tradingMetrics']
  ): void {
    const metrics: MonitoringMetrics = {
      timestamp: Date.now(),
      performance,
      portfolio,
      systemHealth,
      tradingMetrics
    };

    this.metrics.push(metrics);
    this.checkAlerts(metrics);
  }

  private checkAlerts(metrics: MonitoringMetrics): void {
    // Check system health alerts
    this.checkSystemHealthAlerts(metrics.systemHealth);

    // Check performance alerts
    this.checkPerformanceAlerts(metrics.performance);

    // Check trading metrics alerts
    this.checkTradingMetricsAlerts(metrics.tradingMetrics);
  }

  private checkSystemHealthAlerts(health: MonitoringMetrics['systemHealth']): void {
    if (health.cpuUsage > this.alertThresholds.cpuUsage) {
      this.createAlert(
        'warning',
        `High CPU usage: ${health.cpuUsage}%`,
        'cpuUsage',
        health.cpuUsage,
        this.alertThresholds.cpuUsage
      );
    }

    if (health.memoryUsage > this.alertThresholds.memoryUsage) {
      this.createAlert(
        'warning',
        `High memory usage: ${health.memoryUsage}%`,
        'memoryUsage',
        health.memoryUsage,
        this.alertThresholds.memoryUsage
      );
    }

    if (health.apiLatency > this.alertThresholds.apiLatency) {
      this.createAlert(
        'warning',
        `High API latency: ${health.apiLatency}ms`,
        'apiLatency',
        health.apiLatency,
        this.alertThresholds.apiLatency
      );
    }

    if (health.errorRate > this.alertThresholds.errorRate) {
      this.createAlert(
        'error',
        `High error rate: ${health.errorRate}%`,
        'errorRate',
        health.errorRate,
        this.alertThresholds.errorRate
      );
    }
  }

  private checkPerformanceAlerts(performance: PerformanceMetrics): void {
    if (performance.maxDrawdown > this.alertThresholds.drawdown) {
      this.createAlert(
        'critical',
        `High drawdown: ${performance.maxDrawdown}%`,
        'drawdown',
        performance.maxDrawdown,
        this.alertThresholds.drawdown
      );
    }
  }

  private checkTradingMetricsAlerts(metrics: MonitoringMetrics['tradingMetrics']): void {
    if (metrics.successRate < 50) {
      this.createAlert(
        'error',
        `Low trading success rate: ${metrics.successRate}%`,
        'successRate',
        metrics.successRate,
        50
      );
    }

    if (metrics.executionTime > 1000) {
      this.createAlert(
        'warning',
        `Slow trade execution: ${metrics.executionTime}ms`,
        'executionTime',
        metrics.executionTime,
        1000
      );
    }
  }

  private createAlert(
    level: Alert['level'],
    message: string,
    metric: string,
    value: number,
    threshold: number
  ): void {
    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: Date.now(),
      level,
      message,
      metric,
      value,
      threshold
    };

    this.alerts.push(alert);
    this.notifyAlert(alert);
  }

  private notifyAlert(alert: Alert): void {
    // Implement alert notification logic (e.g., email, Slack, etc.)
    console.log(`[${alert.level.toUpperCase()}] ${alert.message}`);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(timeRange?: { start: number; end: number }): MonitoringMetrics[] {
    if (!timeRange) {
      return this.metrics;
    }

    return this.metrics.filter(
      metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  getAlerts(level?: Alert['level']): Alert[] {
    if (!level) {
      return this.alerts;
    }

    return this.alerts.filter(alert => alert.level === level);
  }

  getSystemHealth(): MonitoringMetrics['systemHealth'] {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    return latestMetrics ? latestMetrics.systemHealth : {
      cpuUsage: 0,
      memoryUsage: 0,
      apiLatency: 0,
      errorRate: 0
    };
  }

  getTradingMetrics(): MonitoringMetrics['tradingMetrics'] {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    return latestMetrics ? latestMetrics.tradingMetrics : {
      activeTrades: 0,
      pendingOrders: 0,
      executionTime: 0,
      successRate: 0
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    return latestMetrics ? latestMetrics.performance : {
      totalReturn: 0,
      winRate: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      trades: []
    };
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getAlertStatistics(): { [key: string]: number } {
    const statistics: { [key: string]: number } = {
      total: this.alerts.length,
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    };

    for (const alert of this.alerts) {
      statistics[alert.level]++;
    }

    return statistics;
  }

  getMetricStatistics(metric: string): { [key: string]: number } {
    const values = this.metrics.map(m => m[metric as keyof MonitoringMetrics] as number);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((acc, curr) => acc + curr, 0) / values.length,
      latest: values[values.length - 1]
    };
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  updateAlertThresholds(thresholds: { [key: string]: number }): void {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...thresholds
    };
  }
} 