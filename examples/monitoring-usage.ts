import { MonitoringSystem } from '../src/monitoring/MonitoringSystem';
import { PerformanceMetrics, PortfolioAnalysis } from '../src/types';

async function main() {
  // Initialize monitoring system with custom thresholds
  const monitoring = new MonitoringSystem({
    cpuUsage: 70,        // Alert at 70% CPU usage
    memoryUsage: 75,     // Alert at 75% memory usage
    apiLatency: 800,     // Alert at 800ms latency
    errorRate: 3,        // Alert at 3% error rate
    drawdown: 15         // Alert at 15% drawdown
  });

  // Simulate updating metrics
  const performance: PerformanceMetrics = {
    totalReturn: 12.5,
    winRate: 65,
    sharpeRatio: 1.8,
    maxDrawdown: 8.2,
    trades: []
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

  const systemHealth = {
    cpuUsage: 45,
    memoryUsage: 60,
    apiLatency: 150,
    errorRate: 1.2
  };

  const tradingMetrics = {
    activeTrades: 3,
    pendingOrders: 2,
    executionTime: 250,
    successRate: 75
  };

  // Update metrics
  monitoring.updateMetrics(performance, portfolio, systemHealth, tradingMetrics);

  // Simulate a high CPU usage scenario
  monitoring.updateMetrics(
    performance,
    { ...portfolio, timestamp: Date.now() },
    { ...systemHealth, cpuUsage: 85 },
    tradingMetrics
  );

  // Get all alerts
  const alerts = monitoring.getAlerts();
  console.log('Alerts:', alerts);

  // Get warning level alerts
  const warnings = monitoring.getAlerts('warning');
  console.log('Warnings:', warnings);

  // Get alert statistics
  const alertStats = monitoring.getAlertStatistics();
  console.log('Alert Statistics:', alertStats);

  // Get metric statistics for CPU usage
  const cpuStats = monitoring.getMetricStatistics('cpuUsage');
  console.log('CPU Usage Statistics:', cpuStats);

  // Get system health
  const health = monitoring.getSystemHealth();
  console.log('Current System Health:', health);

  // Get trading metrics
  const trading = monitoring.getTradingMetrics();
  console.log('Current Trading Metrics:', trading);

  // Get performance metrics
  const perf = monitoring.getPerformanceMetrics();
  console.log('Current Performance Metrics:', perf);

  // Get system uptime
  const uptime = monitoring.getUptime();
  console.log('System Uptime (ms):', uptime);

  // Update alert thresholds
  monitoring.updateAlertThresholds({
    cpuUsage: 90,    // Increase CPU threshold
    errorRate: 2     // Decrease error rate threshold
  });

  // Clear alerts
  monitoring.clearAlerts();
  console.log('Alerts after clearing:', monitoring.getAlerts());
}

main().catch(console.error); 