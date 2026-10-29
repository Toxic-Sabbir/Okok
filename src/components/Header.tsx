import React, { useState, useEffect } from 'react';
import { Activity, RotateCcw, Wallet, Clock } from 'lucide-react';

export type NavTab = 'terminal' | 'scanner' | 'news' | 'api' | 'assets' | 'webhooks';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  demoBalance: number;
  onResetBalance: () => void;
  onOpenDataSourceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  demoBalance,
  onResetBalance,
  onOpenDataSourceModal,
}) => {
  const [utc6Time, setUtc6Time] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // UTC+6 exact offset
      const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const hh = String(utc6.getUTCHours()).padStart(2, '0');
      const mm = String(utc6.getUTCMinutes()).padStart(2, '0');
      const ss = String(utc6.getUTCSeconds()).padStart(2, '0');
      setUtc6Time(`${hh}:${mm}:${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="h-[65px] px-6 bg-[#0c1017] border-b border-[#1b2535] flex items-center justify-between gap-8 shrink-0 select-none">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Activity size={18} />
        </div>
        <span className="text-base font-extrabold tracking-tight text-white">
          WORLDWIDE <span className="text-emerald-400 font-semibold text-xs ml-1 font-mono">FOREX API</span>
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onTabChange('terminal')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'terminal' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Live Terminal &amp; Signal
        </button>
        <button
          onClick={() => onTabChange('scanner')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'scanner' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          <span>Auto Scanner</span>
        </button>
        <button
          onClick={() => onTabChange('news')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'news' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          <span>Forex Factory News</span>
        </button>
        <button
          onClick={() => onTabChange('api')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'api' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          <span>API &amp; ST-BOT</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
            CMDs
          </span>
        </button>
        <button
          onClick={() => onTabChange('assets')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'assets' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Forex Pairs
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Real-Time & UTC+6 Clock Badge */}
        <div 
          onClick={onOpenDataSourceModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#101723] hover:bg-[#151f2e] border border-emerald-500/30 rounded-lg cursor-pointer transition-colors"
          title="Market Data: Real-time Worldwide Interbank Spot (UTC+6)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono font-bold text-emerald-400">REALTIME</span>
          <div className="h-3.5 w-[1px] bg-slate-700"></div>
          <Clock size={12} className="text-sky-400" />
          <span className="text-[11px] font-mono font-semibold text-slate-300">UTC+6</span>
          <span className="text-xs font-mono font-bold text-sky-300">{utc6Time || '--:--:--'}</span>
        </div>

        {/* Feed Status Indicator */}
        <button
          onClick={onOpenDataSourceModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131b26] hover:bg-[#1a2536] border border-[#212f42] rounded-lg text-xs transition-colors"
          title="Inspect Market Feed & Quotex Connection"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono text-slate-300">Interbank Feed</span>
        </button>

        {/* Demo Balance Strip */}
        <div className="flex items-center bg-[#131b26] border border-[#212f42] rounded-lg p-1">
          <div className="px-3 py-1 flex items-center gap-2">
            <Wallet size={14} className="text-emerald-400" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-medium leading-none">DEMO BALANCE</span>
              <span className="text-xs font-bold font-mono text-emerald-400">
                ${demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <button
            onClick={onResetBalance}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset Demo Balance to $10,000"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
