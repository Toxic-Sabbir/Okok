import React, { useState, useEffect } from 'react';
import type { Asset, ForexNewsItem } from '../types/market';
import { getForexNews } from '../services/api';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Flame,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
} from 'lucide-react';

interface ForexFactoryNewsProps {
  assets: Asset[];
  onSelectPairToTrade: (assetId: string) => void;
}

export const ForexFactoryNews: React.FC<ForexFactoryNewsProps> = ({
  assets,
  onSelectPairToTrade,
}) => {
  const [newsList, setNewsList] = useState<ForexNewsItem[]>([]);
  const [impactFilter, setImpactFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<ForexNewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getForexNews(impactFilter, currencyFilter)
      .then((data) => {
        setNewsList(data);
        if (data.length > 0 && !selectedNews) {
          setSelectedNews(data[0]);
        }
      })
      .finally(() => setIsLoading(false));
  }, [impactFilter, currencyFilter]);

  const currencies = ['all', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF'];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-[#0a0e16]">
      {/* Top Bar Header */}
      <div className="p-4 lg:px-6 py-4 bg-[#0d131d] border-b border-[#1a2332] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400" />
            <h1 className="text-base font-bold text-slate-100">
              Forex Factory Economic Calendar &amp; Pair Direction Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time macroeconomic news with direct mapping to Forex pairs and expected price direction.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {/* Impact Filter */}
          <div className="flex items-center bg-[#131b26] p-0.5 rounded-lg border border-[#212f42]">
            {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setImpactFilter(imp)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  impactFilter === imp
                    ? imp === 'HIGH'
                      ? 'bg-rose-600 text-white'
                      : imp === 'MEDIUM'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {imp === 'HIGH' && <Flame size={12} className="text-rose-300" />}
                <span>{imp === 'all' ? 'All Impacts' : imp}</span>
              </button>
            ))}
          </div>

          {/* Currency Filter */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-[#131b26] border border-[#212f42] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Currencies' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Body: Left Calendar List & Right "Which Pair Which Direction" Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Forex Factory Calendar List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#17202e] border-r border-[#1a2332]">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading Forex Factory economic releases...
            </div>
          ) : newsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No economic news found for selected filters.
            </div>
          ) : (
            newsList.map((item) => {
              const isSelected = selectedNews?.id === item.id;
              const isHigh = item.impact === 'HIGH';
              const isMedium = item.impact === 'MEDIUM';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                    isSelected ? 'bg-[#141d2a]' : 'hover:bg-[#111722]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Impact Folder Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isHigh
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : isMedium
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      <Flame size={16} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-100 px-1.5 py-0.5 rounded bg-slate-800">
                          {item.currency}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.date} · {item.time}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            item.status === 'RELEASED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-sky-500/10 text-sky-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-slate-100 mt-1">{item.title}</div>

                      {/* Actual / Forecast / Previous strip */}
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                        <span>
                          Actual:{' '}
                          <strong
                            className={
                              item.sentiment === 'BULLISH'
                                ? 'text-emerald-400'
                                : item.sentiment === 'BEARISH'
                                ? 'text-rose-400'
                                : 'text-slate-200'
                            }
                          >
                            {item.actual}
                          </strong>
                        </span>
                        <span>Forecast: <strong className="text-slate-300">{item.forecast}</strong></span>
                        <span>Previous: <strong className="text-slate-300">{item.previous}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary Count */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-[#1c2838] text-slate-300">
                      {item.affectedPairs.length} Pairs Mapped
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: "Which Pair Which Direction" Decision Dashboard */}
        <div className="w-full lg:w-[460px] bg-[#0c111a] flex flex-col shrink-0 overflow-y-auto p-5 space-y-5">
          {selectedNews ? (
            <>
              {/* Selected Event Card */}
              <div className="p-4 bg-[#121926] border border-[#1e2a3b] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-200">
                    {selectedNews.currency} Event
                  </span>
                  <span
                    className={`font-bold ${
                      selectedNews.impact === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {selectedNews.impact} IMPACT
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-100">{selectedNews.title}</h2>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Market sentiment:{' '}
                  <span
                    className={`font-bold ${
                      selectedNews.sentiment === 'BULLISH'
                        ? 'text-emerald-400'
                        : selectedNews.sentiment === 'BEARISH'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {selectedNews.sentiment} on {selectedNews.currency}
                  </span>
                </div>
              </div>

              {/* WHICH PAIR WHICH DIRECTION CARD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span>Which Pair Which Direction</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Real-time Trading Matrix</span>
                </div>

                <div className="space-y-2.5">
                  {selectedNews.affectedPairs.map((pair) => {
                    const isBuy = pair.direction === 'BUY';

                    return (
                      <div
                        key={pair.symbol}
                        className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                          isBuy
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        {/* Header: Pair + Direction Tag + Expected Pips */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{pair.symbol}</span>
                            <div
                              className={`flex items-center gap-1 font-extrabold px-2 py-0.5 rounded text-[11px] ${
                                isBuy
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {isBuy ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                              <span>{isBuy ? 'BUY (CALL / UP)' : 'SELL (PUT / DOWN)'}</span>
                            </div>
                          </div>

                          <span className="font-mono font-bold text-slate-300">
                            ~{pair.expectedPips} pips
                          </span>
                        </div>

                        {/* Rationale */}
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {pair.reason}
                        </p>

                        {/* Quick Trade CTA */}
                        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end">
                          <button
                            onClick={() => onSelectPairToTrade(pair.assetId)}
                            className="px-3 py-1 bg-[#1a2536] hover:bg-emerald-600 hover:text-white text-slate-200 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                          >
                            <Play size={11} />
                            <span>Load {pair.symbol} in Chart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-500">
              Select any event on the left to view the affected Forex pairs and trade directions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
