import type {
  Asset,
  Candle,
  TimeframeKey,
  ActiveTrade,
  LiveTick,
  NextCandleSignal,
  ForexNewsItem,
  ScannedPairItem,
} from '../types/market';

export async function getAssets(category?: string, search?: string): Promise<Asset[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`/api/v1/forex/assets?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load forex assets: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

export async function getAssetById(id: string): Promise<Asset> {
  const res = await fetch(`/api/v1/forex/assets/${id}`);
  if (!res.ok) throw new Error(`Forex asset not found: ${id}`);
  const json = await res.json();
  return json.data;
}

export async function getCandles(
  assetId: string,
  timeframe: TimeframeKey = '1m',
  limit: number = 100
): Promise<{ candles: Candle[]; candleRemainingSeconds: number }> {
  const res = await fetch(`/api/v1/forex/candles?pair=${assetId}&timeframe=${timeframe}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to load candles: ${res.statusText}`);
  const json = await res.json();
  return {
    candles: json.data || [],
    candleRemainingSeconds: json.candleRemainingSeconds || 0,
  };
}

export async function getNextCandleSignal(
  pairId: string,
  timeframe: string = '1m'
): Promise<NextCandleSignal> {
  const res = await fetch(`/api/v1/forex/analyze?pair=${pairId}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Failed to analyze pair: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

export async function getForexScanner(
  timeframe: string = '1m'
): Promise<{ topBuy?: ScannedPairItem; topSell?: ScannedPairItem; data: ScannedPairItem[] }> {
  const res = await fetch(`/api/v1/forex/scanner?timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`Scanner error: ${res.statusText}`);
  const json = await res.json();
  return {
    topBuy: json.topBuy,
    topSell: json.topSell,
    data: json.data || [],
  };
}

export async function getForexNews(
  impact?: string,
  currency?: string
): Promise<ForexNewsItem[]> {
  const params = new URLSearchParams();
  if (impact && impact !== 'all') params.append('impact', impact);
  if (currency && currency !== 'all') params.append('currency', currency);

  const res = await fetch(`/api/v1/forex/news?${params.toString()}`);
  if (!res.ok) throw new Error(`News error: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

export async function getPairNewsImpact(pairId?: string) {
  const params = pairId ? `?pair=${pairId}` : '';
  const res = await fetch(`/api/v1/forex/news/pair-impact${params}`);
  if (!res.ok) throw new Error(`Pair impact error: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

export async function getAllInOneData(pairId: string, timeframe: string = '1m') {
  const res = await fetch(`/api/v1/forex/all-in-one?pair=${pairId}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`All-In-One API error: ${res.statusText}`);
  return await res.json();
}

export async function executeSimulatedTrade(
  assetId: string,
  direction: 'CALL' | 'PUT',
  investment: number,
  durationSeconds: number
): Promise<ActiveTrade> {
  const res = await fetch('/api/v1/orders/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId, direction, investment, durationSeconds }),
  });
  if (!res.ok) throw new Error(`Trade execution failed: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

export async function getSimulatedTrades(): Promise<ActiveTrade[]> {
  const res = await fetch('/api/v1/orders/simulate');
  if (!res.ok) throw new Error('Failed to fetch simulated trades');
  const json = await res.json();
  return json.data || [];
}

export function subscribeToLiveTicks(
  assetFilter: string[] = [],
  onTicks: (ticks: LiveTick[]) => void,
  onError?: (err: Event) => void
): () => void {
  const url = assetFilter.length > 0 ? `/api/v1/stream?pairs=${assetFilter.join(',')}` : '/api/v1/stream';
  const eventSource = new EventSource(url);

  eventSource.addEventListener('ticks', (event) => {
    try {
      const data = JSON.parse(event.data);
      onTicks(data);
    } catch (e) {
      console.error('Error parsing SSE ticks', e);
    }
  });

  if (onError) {
    eventSource.onerror = onError;
  }

  return () => {
    eventSource.close();
  };
}
