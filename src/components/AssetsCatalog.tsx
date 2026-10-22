import React, { useState, useMemo } from 'react';
import type { Asset, ForexCategory } from '../types/market';
import { Search, Globe, TrendingUp, TrendingDown, ArrowUpDown, Play, Code2 } from 'lucide-react';

interface AssetsCatalogProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onOpenApi: (asset: Asset) => void;
}

export const AssetsCatalog: React.FC<AssetsCatalogProps> = ({
  assets,
  onSelectAsset,
  onOpenApi,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | ForexCategory>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'payout' | 'change' | 'volume' | 'symbol'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAssets = useMemo(() => {
    let result = assets.filter((a) => {
      const matchCat = activeCategory === 'all' || a.category === activeCategory;
      const matchSearch =
        a.symbol.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'payout') {
        comparison = a.payout - b.payout;
      } else if (sortBy === 'change') {
        comparison = a.change24h - b.change24h;
      } else if (sortBy === 'volume') {
        comparison = a.volume24h - b.volume24h;
      } else if (sortBy === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [assets, activeCategory, search, sortBy, sortOrder]);

  const toggleSort = (field: 'payout' | 'change' | 'volume' | 'symbol') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-y-auto bg-[#0a0e16] p-4 lg:p-8 space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Worldwide Forex Market Pairs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real interbank foreign exchange pairs, spreads in pips, and real-time live candlestick feeds.
          </p>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="flex items-center gap-4 text-xs font-mono bg-[#111722] p-2.5 rounded-lg border border-[#1e2a3b]">
          <div>
            <span className="text-slate-400">Total Pairs: </span>
            <span className="font-bold text-slate-200">{assets.length}</span>
          </div>
          <div>
            <span className="text-slate-400">Majors: </span>
            <span className="font-bold text-emerald-400">
              {assets.filter((a) => a.category === 'major').length}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Crosses &amp; Minors: </span>
            <span className="font-bold text-sky-400">
              {assets.filter((a) => a.category === 'minor').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d131d] p-3 rounded-xl border border-[#1a2332]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Forex ({assets.length})
          </button>
          <button
            onClick={() => setActiveCategory('major')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === 'major'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Majors (EUR/USD, GBP/USD...)
          </button>
          <button
            onClick={() => setActiveCategory('minor')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === 'minor'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Crosses &amp; Minors
          </button>
          <button
            onClick={() => setActiveCategory('exotic')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === 'exotic'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Exotics
          </button>
          <button
            onClick={() => setActiveCategory('commodity')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeCategory === 'commodity'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Metals &amp; Oil (Gold, Silver, WTI)
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search asset symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131b26] border border-[#202b3d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Assets Data Table */}
      <div className="bg-[#0e1420] border border-[#1b2535] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#121927] border-b border-[#1b2535] text-[11px] uppercase tracking-wider text-slate-400 select-none">
              <tr>
                <th
                  onClick={() => toggleSort('symbol')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Asset</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Live Price</th>
                <th
                  onClick={() => toggleSort('change')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Change</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right hidden md:table-cell">
                  24h Range
                </th>
                <th
                  onClick={() => toggleSort('payout')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Quotex Payout</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172130]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isUp = asset.change24h >= 0;
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#131b26]/70 transition-colors"
                    >
                      {/* Asset */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#172232] text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center">
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{asset.symbol}</span>
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                                {asset.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">{asset.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono uppercase text-[11px] text-slate-400">
                        {asset.category}
                      </td>

                      {/* Live Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        {asset.price.toFixed(asset.precision)}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div
                          className={`flex items-center justify-end gap-1 font-semibold ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>
                            {isUp ? '+' : ''}
                            {asset.change24h}%
                          </span>
                        </div>
                      </td>

                      {/* 24h Range */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400 hidden md:table-cell">
                        {asset.low24h.toFixed(asset.precision)} -{' '}
                        {asset.high24h.toFixed(asset.precision)}
                      </td>

                      {/* Payout */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          {asset.payout}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onSelectAsset(asset)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-1"
                            title="Trade on live chart"
                          >
                            <Play size={11} />
                            <span>Trade</span>
                          </button>
                          <button
                            onClick={() => onOpenApi(asset)}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#1a2536] hover:bg-[#233148] text-slate-300 rounded transition-colors flex items-center gap-1"
                            title="Inspect API response"
                          >
                            <Code2 size={11} />
                            <span>API</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
