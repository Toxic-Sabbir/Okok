import React, { useState, useMemo } from 'react';
import type { Asset, ForexCategory } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, Globe } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  assets,
  selectedAsset,
  onSelectAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | ForexCategory>('all');
  const [search, setSearch] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = activeTab === 'all' || asset.category === activeTab;
      const matchesSearch =
        asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.id.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [assets, activeTab, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[#101622] border border-[#222f42] rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2738]">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Worldwide Forex Market Pairs</h2>
            <span className="text-xs text-slate-400">({assets.length} interbank pairs)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="px-6 pt-4 pb-3 space-y-3 border-b border-[#1c2738] bg-[#0c111a]">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search EUR/USD, GBP/JPY, Gold (XAU/USD)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151c28] border border-[#233044] rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              All Forex
            </button>
            <button
              onClick={() => setActiveTab('major')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'major'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Majors (EUR/USD, GBP/USD, USD/JPY...)
            </button>
            <button
              onClick={() => setActiveTab('minor')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'minor'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Crosses &amp; Minors (EUR/GBP, GBP/JPY...)
            </button>
            <button
              onClick={() => setActiveTab('exotic')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'exotic'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Exotics (USD/SGD, USD/ZAR...)
            </button>
            <button
              onClick={() => setActiveTab('commodity')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'commodity'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Metals &amp; Oil (Gold, Silver, WTI)
            </button>
          </div>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#17202e] px-2 py-1">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No assets found matching "{search}"
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = asset.id === selectedAsset.id;
              const isUp = asset.change24h >= 0;

              return (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-emerald-950/30 border border-emerald-500/40'
                      : 'hover:bg-[#151c27]'
                  }`}
                >
                  {/* Left: Symbol & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#192333] flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{asset.symbol}</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Live Price & 24h change */}
                  <div className="text-right font-mono">
                    <div className="text-sm font-semibold text-slate-100">
                      {asset.price.toFixed(asset.precision)}
                    </div>
                    <div
                      className={`text-xs flex items-center justify-end gap-1 ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>
                        {isUp ? '+' : ''}
                        {asset.change24h}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Quotex Payout Badge */}
                  <div className="ml-4 pl-4 border-l border-[#202b3d] flex flex-col items-end min-w-[70px]">
                    <span className="text-[10px] text-slate-400 uppercase">Payout</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {asset.payout}%
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#1c2738] bg-[#0c111a] flex items-center justify-between text-xs text-slate-400">
          <span>Click any asset to switch the live chart</span>
          <span className="font-mono text-emerald-400">High payout rate up to 93%</span>
        </div>
      </div>
    </div>
  );
};
