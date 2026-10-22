import React from 'react';
import type { IndicatorSettings } from '../types/market';
import { X, Sliders } from 'lucide-react';

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: IndicatorSettings;
  onChange: (indicators: IndicatorSettings) => void;
}

export const IndicatorModal: React.FC<IndicatorModalProps> = ({
  isOpen,
  onClose,
  indicators,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#101622] border border-[#222f42] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2738]">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Chart Indicators</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Moving Average */}
          <div className="p-3 bg-[#151c28] border border-[#233044] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-slate-200">Moving Average (SMA)</div>
                <div className="text-xs text-slate-400">Smooth price trend baseline</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={indicators.showSma}
                  onChange={(e) => onChange({ ...indicators, showSma: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {indicators.showSma && (
              <div className="flex items-center justify-between pt-2 border-t border-[#1c2738] text-xs">
                <span className="text-slate-400">Period</span>
                <div className="flex items-center gap-2">
                  {[7, 14, 21, 50].map((p) => (
                    <button
                      key={p}
                      onClick={() => onChange({ ...indicators, smaPeriod: p })}
                      className={`px-2 py-1 rounded font-mono ${
                        indicators.smaPeriod === p
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bollinger Bands */}
          <div className="p-3 bg-[#151c28] border border-[#233044] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-slate-200">Bollinger Bands</div>
                <div className="text-xs text-slate-400">Volatility envelope & dynamic channel</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={indicators.showBollinger}
                  onChange={(e) => onChange({ ...indicators, showBollinger: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {indicators.showBollinger && (
              <div className="flex items-center justify-between pt-2 border-t border-[#1c2738] text-xs">
                <span className="text-slate-400">Period / StdDev</span>
                <span className="font-mono text-sky-400">20 / 2.0</span>
              </div>
            )}
          </div>

          {/* RSI */}
          <div className="p-3 bg-[#151c28] border border-[#233044] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-slate-200">Relative Strength Index (RSI)</div>
                <div className="text-xs text-slate-400">Momentum oscillator (70 / 30 zones)</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={indicators.showRsi}
                  onChange={(e) => onChange({ ...indicators, showRsi: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {indicators.showRsi && (
              <div className="flex items-center justify-between pt-2 border-t border-[#1c2738] text-xs">
                <span className="text-slate-400">Period</span>
                <span className="font-mono text-purple-400">14</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#1c2738] bg-[#0c111a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
          >
            Apply to Chart
          </button>
        </div>
      </div>
    </div>
  );
};
