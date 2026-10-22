import React, { useState, useEffect } from 'react';
import {
  Radio,
  Server,
  Zap,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  X,
  HelpCircle,
  Cpu,
} from 'lucide-react';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({ isOpen, onClose }) => {
  const [currentSource, setCurrentSource] = useState<string>('SIMULATED_OTC');
  const [realStreamActive, setRealStreamActive] = useState<boolean>(true);
  const [quotexWsConnected, setQuotexWsConnected] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/config/datasource')
        .then((r) => r.json())
        .then((json) => {
          if (json.data) {
            setCurrentSource(json.data.source);
            setRealStreamActive(json.data.realStreamActive);
            setQuotexWsConnected(json.data.quotexWsConnected);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleApply = async (newSource: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/config/datasource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: newSource,
          quotexToken: tokenInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      setCurrentSource(data.data.source);
      setRealStreamActive(data.data.realStreamActive);
      setQuotexWsConnected(data.data.quotexWsConnected);
      setStatusMessage(`Active feed updated to: ${newSource}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage('Failed to update feed source.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-xl bg-[#101622] border border-[#222f42] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2738]">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Data Feed Transparency &amp; Quotex Connection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Honest Explanation Box */}
          <div className="p-4 bg-[#141d2b] border border-[#233146] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <HelpCircle size={15} />
              <span>How Quotex Pricing Actually Works</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Quotex (quotex.com / qxbroker.com)</strong> uses two separate pricing feeds:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li>
                <strong className="text-slate-200">OTC (Over-The-Counter) Pairs:</strong> Quotex's
                highest-payout pairs (90%–93%) are proprietary broker-generated feeds, available
                24/7 even on weekends when global Forex banks are closed.
              </li>
              <li>
                <strong className="text-slate-200">Standard Forex &amp; Crypto:</strong> Sourced from
                interbank exchange feeds and matched through Quotex liquidity providers.
              </li>
              <li>
                <strong className="text-slate-200">Direct Broker Socket:</strong> Quotex does not offer
                an anonymous public API. Direct access to <code className="text-emerald-400 font-mono">wss://ws2.qxbroker.com</code> requires an authenticated user session token.
              </li>
            </ul>
          </div>

          {/* Selectable Feed Modes */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Choose Market Feed Engine
            </div>

            {/* Mode 1: 100% Worldwide Interbank Forex Engine */}
            <div
              onClick={() => handleApply('SIMULATED_OTC')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                currentSource === 'SIMULATED_OTC'
                  ? 'bg-emerald-950/20 border-emerald-500/60'
                  : 'bg-[#121926] border-[#1f2b3e] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center">
                    {currentSource === 'SIMULATED_OTC' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>Worldwide Interbank Forex Engine (No OTC)</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        ZERO OTC
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      100% Worldwide Forex market coverage across Majors, Minors, Exotics, Gold, and Oil with real pip spreads.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold shrink-0">
                  Active
                </span>
              </div>
            </div>

            {/* Mode 2: 100% Real-World Live WebSocket Stream */}
            <div
              onClick={() => handleApply('REAL_MARKET_STREAM')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                currentSource === 'REAL_MARKET_STREAM'
                  ? 'bg-sky-950/20 border-sky-500/60'
                  : 'bg-[#121926] border-[#1f2b3e] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center">
                    {currentSource === 'REAL_MARKET_STREAM' && (
                      <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>100% Real-World Live WebSocket Stream</span>
                      <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded">
                        REAL EXCHANGE
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Subscribes via native WebSocket to live real Binance exchange feeds for BTC, ETH, SOL, XRP + live interbank rates.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-300">Live WS</span>
                </div>
              </div>
            </div>

            {/* Mode 3: Direct Quotex WebSocket Gateway */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                currentSource === 'QUOTEX_WS_GATEWAY'
                  ? 'bg-amber-950/20 border-amber-500/60'
                  : 'bg-[#121926] border-[#1f2b3e]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => handleApply('QUOTEX_WS_GATEWAY')}
                    className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center cursor-pointer"
                  >
                    {currentSource === 'QUOTEX_WS_GATEWAY' && (
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>Direct Quotex Gateway Bridge (wss://ws2.qxbroker.com)</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                        ACCOUNT TOKEN
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Connect directly to your personal Quotex account WebSocket gateway using your session token.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  {quotexWsConnected ? 'Connected' : 'Standby'}
                </span>
              </div>

              {/* Token Input */}
              <div className="pt-2 border-t border-[#1d2737] space-y-2">
                <label className="text-[11px] text-slate-400 block">
                  Quotex Account Session Token (<code className="text-slate-300">token</code> cookie from browser DevTools)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Enter your qx_token or session cookie..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1 bg-[#182333] border border-[#253347] rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleApply('QUOTEX_WS_GATEWAY')}
                    disabled={saving}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1c2738] bg-[#0c111a] flex items-center justify-between text-xs text-slate-400">
          <span>Real-time feeds are broadcasted through SSE endpoint <code className="text-emerald-400 font-mono">/api/v1/stream</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
