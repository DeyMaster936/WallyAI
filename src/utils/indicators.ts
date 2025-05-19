interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function calculateSMA(data: MarketData[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
    sma.push(sum / period);
  }
  return sma;
}

export function calculateRSI(data: MarketData[], period: number): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((acc, curr) => acc + curr, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((acc, curr) => acc + curr, 0) / period;

  // Calculate RSI
  for (let i = period; i < data.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;

    const rs = avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }

  return rsi;
}

export function calculateMACD(data: MarketData[]): number[] {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd: number[] = [];

  for (let i = 0; i < ema12.length; i++) {
    macd.push(ema12[i] - ema26[i]);
  }

  return macd;
}

export function calculateBollingerBands(data: MarketData[], period: number, multiplier: number): any {
  const sma = calculateSMA(data, period);
  const bands: any = {
    upper: [],
    middle: sma,
    lower: []
  };

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const standardDeviation = calculateStandardDeviation(slice.map(d => d.close), sma[i - period + 1]);
    
    bands.upper.push(sma[i - period + 1] + (multiplier * standardDeviation));
    bands.lower.push(sma[i - period + 1] - (multiplier * standardDeviation));
  }

  return bands;
}

export function calculateStochastic(data: MarketData[], period: number, smoothK: number): any {
  const stochastic: any = {
    k: [],
    d: []
  };

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const highestHigh = Math.max(...slice.map(d => d.high));
    const lowestLow = Math.min(...slice.map(d => d.low));
    const currentClose = slice[slice.length - 1].close;

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    stochastic.k.push(k);
  }

  // Calculate smoothed %K
  const smoothedK = calculateSMA(stochastic.k.map((k: number) => ({ close: k })), smoothK);
  stochastic.k = smoothedK;

  // Calculate %D (3-period SMA of %K)
  stochastic.d = calculateSMA(stochastic.k.map((k: number) => ({ close: k })), 3);

  return stochastic;
}

function calculateEMA(data: MarketData[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA
  let emaValue = data.slice(0, period).reduce((acc, curr) => acc + curr.close, 0) / period;
  ema.push(emaValue);

  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i].close - emaValue) * multiplier + emaValue;
    ema.push(emaValue);
  }

  return ema;
}

function calculateStandardDeviation(values: number[], mean: number): number {
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((acc, curr) => acc + curr, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
} 