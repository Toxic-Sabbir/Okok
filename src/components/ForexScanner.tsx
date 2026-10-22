import React, { useState, useEffect } from 'react';
import type { Asset, ScannedPairItem } from '../types/market';
import { getForexScanner } from '../services/api';
import {
  Radar,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ForexScannerProps {
  onSelectPairToAnalyze: (assetId: string) => void;
}

export const ForexScanner: React.FC<ForexScannerProps> = ({ onSelectPairToAnalyze }) => {
  const [scannedData, setScannedData] = useState<{
    topBuy?: ScannedPairItem;
    topSell?: ScannedPairItem;
    data: ScannedPairItem[];
  }>({ data: [] });
  const [timeframe, setTimeframe] = useState<string>('1m');
  const [filterAction, setFilterAction] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchScanner = () => {
    setIsLoading(true);
    getForexScanner(timeframe)
      .then((res) => {
        setScannedData(res);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchScanner();
    const interval = setInterval(fetchScanner, 5000); // Auto-scan every 5 seconds
    return () => clearInterval(interval);
  }, [timeframe]);

  const filteredList = scannedData.data.filter((item) => {
    if (filterAction === 'all') return true;
    return item.action === filterAction;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-y-auto bg-[#0a0e16] p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar size={20} className="text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h1 className="text-lg font-bold text-slate-100">
              Automatic Worldwide Forex Market Scanner
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-indicator algorithm scanning all worldwide forex pairs and ranking next candle signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-[#131b26] p-0.5 rounded-lg border border-[#212f42] text-xs">
            {['1m', '5m', '15m', '1h'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded font-mono font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={fetchScanner}
            disabled={isLoading}
            className="p-2 bg-[#131b26] hover:bg-[#1a2536] border border-[#212f42] rounded-lg text-slate-300 transition-colors"
            title="Scan Now"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Top 2 AI Picked Setups (Top BUY & Top SELL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top BUY */}
        {scannedData.topBuy && (
          <div className="p-5 bg-gradient-to-br from-emerald-950/30 to-[#0e1420] border border-emerald-500/40 rounded-xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                  Top Recommended BUY
                </span>
                <span className="text-xs font-mono text-slate-400">Timeframe: {timeframe}</span>
              </div>
              <span className="font-mono text-sm font-extrabold text-emerald-400">
                {scannedData.topBuy.confidence}% Win Prob
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold text-slate-100">
                  {scannedData.topBuy.symbol}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Price: {scannedData.topBuy.price} · Payout: {scannedData.topBuy.payout}%
                </div>
              </div>
              <button
                onClick={() => onSelectPairToAnalyze(scannedData.topBuy!.assetId)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Play size={13} />
                <span>Trade CALL (BUY)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#1a2638] flex items-center justify-between text-xs text-slate-300">
              <span className="truncate max-w-[280px]">Pattern: {scannedData.topBuy.pattern}</span>
              <span className="font-mono text-emerald-400 font-semibold">
                Target: {scannedData.topBuy.targetPrice}
              </span>
            </div>
          </div>
        )}

        {/* Top SELL */}
        {scannedData.topSell && (
          <div className="p-5 bg-gradient-to-br from-rose-950/30 to-[#0e1420] border border-rose-500/40 rounded-xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase bg-rose-500/20 px-2 py-0.5 rounded">
                  Top Recommended SELL
                </span>
                <span className="text-xs font-mono text-slate-400">Timeframe: {timeframe}</span>
              </div>
              <span className="font-mono text-sm font-extrabold text-rose-400">
                {scannedData.topSell.confidence}% Win Prob
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold text-slate-100">
                  {scannedData.topSell.symbol}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Price: {scannedData.topSell.price} · Payout: {scannedData.topSell.payout}%
                </div>
              </div>
              <button
                onClick={() => onSelectPairToAnalyze(scannedData.topSell!.assetId)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20"
              >
                <Play size={13} />
                <span>Trade PUT (SELL)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#1a2638] flex items-center justify-between text-xs text-slate-300">
              <span className="truncate max-w-[280px]">Pattern: {scannedData.topSell.pattern}</span>
              <span className="font-mono text-rose-400 font-semibold">
                Target: {scannedData.topSell.targetPrice}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & All Assets List */}
      <div className="bg-[#0e1420] border border-[#1b2535] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#121927] border-b border-[#1b2535] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">
              All Worldwide Pairs ({filteredList.length})
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterAction('all')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterAction === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterAction('BUY')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterAction === 'BUY'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BUY Only
            </button>
            <button
              onClick={() => setFilterAction('SELL')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterAction === 'SELL'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SELL Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d121c] border-b border-[#1b2535] text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Forex Pair</th>
                <th className="py-3 px-4 font-semibold text-right">Live Price</th>
                <th className="py-3 px-4 font-semibold text-center">Next Candle Signal</th>
                <th className="py-3 px-4 font-semibold text-center">Confidence</th>
                <th className="py-3 px-4 font-semibold">Pattern / Confluence</th>
                <th className="py-3 px-4 font-semibold text-right">Target Price</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172130]">
              {filteredList.map((item) => {
                const isBuy = item.action === 'BUY';
                return (
                  <tr key={item.assetId} className="hover:bg-[#131b26] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {item.category}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                      {item.price}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {item.signal === 'CALL' ? 'CALL (GREEN)' : 'PUT (RED)'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={item.confidence >= 85 ? 'text-emerald-400' : 'text-slate-200'}>
                        {item.confidence}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-[200px] truncate">
                      {item.pattern}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {item.targetPrice}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectPairToAnalyze(item.assetId)}
                        className="px-3 py-1 bg-[#1a2536] hover:bg-emerald-600 hover:text-white text-slate-200 rounded font-semibold text-xs transition-colors"
                      >
                        Analyze &amp; Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
