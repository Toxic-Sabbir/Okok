export type ForexCategory = 'major' | 'minor' | 'exotic' | 'commodity';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: ForexCategory;
  baseCurrency: string;
  quoteCurrency: string;
  payout: number;
  price: number;
  precision: number;
  pipSize: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  spreadPips: number;
  volatility: number;
  updatedAt: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeframeKey = '5s' | '15s' | '30s' | '1m' | '2m' | '5m' | '15m' | '1h' | '1d';

export type ChartType = 'candlestick' | 'area' | 'heikin-ashi' | 'bars';

export interface IndicatorSettings {
  showSma: boolean;
  smaPeriod: number;
  showBollinger: boolean;
  bollingerPeriod: number;
  bollingerStdDev: number;
  showRsi: boolean;
  rsiPeriod: number;
  showMacd: boolean;
}

export interface ForexNewsItem {
  id: string;
  date: string;
  time: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  forecast: string;
  previous: string;
  actual: string;
  status: 'UPCOMING' | 'RELEASED';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  affectedPairs: {
    symbol: string;
    assetId: string;
    direction: 'BUY' | 'SELL';
    expectedPips: number;
    reason: string;
  }[];
}

export interface NextCandleSignal {
  assetId: string;
  symbol: string;
  timeframe: string;
  direction: 'CALL' | 'PUT' | 'NEUTRAL';
  color: 'GREEN' | 'RED' | 'GRAY';
  action: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  invalidationPrice: number;
  expectedPipMove: number;
  patternDetected: string;
  candleCloseRemainingSeconds: number;
  checklist: {
    rule: string;
    status: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    passed: boolean;
    detail: string;
  }[];
  generatedAt: number;
}

export interface ScannedPairItem {
  assetId: string;
  symbol: string;
  category: ForexCategory;
  price: number;
  change24h: number;
  payout: number;
  signal: 'CALL' | 'PUT' | 'NEUTRAL';
  action: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  pattern: string;
  targetPrice: number;
  expectedPips: number;
}

export interface ActiveTrade {
  id: string;
  assetId: string;
  symbol: string;
  direction: 'CALL' | 'PUT';
  investment: number;
  payoutRate: number;
  potentialProfit: number;
  strikePrice: number;
  entryTime: number;
  expiryTime: number;
  durationSeconds: number;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'DRAW';
  settledPrice?: number;
  pnl?: number;
}

export interface LiveTick {
  assetId: string;
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}
