import React, { useState } from 'react';
import type { Asset } from '../types/market';
import { executeSimulatedTrade } from '../services/api';
import {
  Webhook,
  Bot,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCode,
} from 'lucide-react';

interface WebhookGuideProps {
  assets: Asset[];
  onTradeExecuted: () => void;
}

export const WebhookGuide: React.FC<WebhookGuideProps> = ({ assets, onTradeExecuted }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Webhook Test Playground
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || 'EUR_USD_OTC');
  const [direction, setDirection] = useState<'CALL' | 'PUT'>('CALL');
  const [amount, setAmount] = useState<number>(100);
  const [duration, setDuration] = useState<number>(60);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestWebhook = async () => {
    setIsSending(true);
    try {
      const res = await executeSimulatedTrade(selectedAssetId, direction, amount, duration);
      setWebhookResult(
        JSON.stringify(
          {
            status: 'TRADE_EXECUTED_VIA_WEBHOOK',
            strikePrice: res.strikePrice,
            payoutRate: `${res.payoutRate}%`,
            potentialProfit: `$${res.potentialProfit}`,
            expiryTime: new Date(res.expiryTime).toISOString(),
            orderId: res.id,
          },
          null,
          2
        )
      );
      onTradeExecuted();
    } catch (err: any) {
      setWebhookResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  const pythonBotCode = `# Quotex Algorithmic Streaming Trading Bot
# Listens to real-time tick stream and executes simulated binary deals

import json
import requests
import sseclient  # pip install sseclient-py

API_BASE = "https://your-quotex-api-host.com"

def listen_to_ticks():
    url = f"{API_BASE}/api/v1/stream?assets=EUR_USD_OTC,BTC_USD"
    response = requests.get(url, stream=True)
    client = sseclient.SSEClient(response)

    print("Connected to Quotex Live Tick Stream...")

    for event in client.events():
        if event.event == "ticks":
            ticks = json.loads(event.data)
            for tick in ticks:
                asset_id = tick["assetId"]
                price = tick["price"]
                print(f"[{asset_id}] Tick Price: {price}")
                
                # Example Strategy Trigger:
                # If momentum triggers, place binary option trade
                if should_trade(asset_id, price):
                    place_order(asset_id, "CALL", 100, 60)

def place_order(asset_id, direction, amount, duration_seconds):
    order_url = f"{API_BASE}/api/v1/orders/simulate"
    payload = {
        "assetId": asset_id,
        "direction": direction,
        "investment": amount,
        "durationSeconds": duration_seconds
    }
    res = requests.post(order_url, json=payload)
    print("Executed Order:", res.json())

def should_trade(asset_id, price):
    # Insert custom indicators or machine learning logic here
    return False

if __name__ == "__main__":
    listen_to_ticks()
`;

  const tradingViewAlertPayload = `{
  "secret_token": "qtx_sec_9918231920",
  "asset": "EUR_USD_OTC",
  "action": "{{strategy.order.action}}",
  "direction": "CALL",
  "amount": 100,
  "duration": 60,
  "timestamp": "{{timenow}}"
}`;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-y-auto bg-[#0a0e16] p-4 lg:p-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Bot size={22} className="text-emerald-400" />
          <h1 className="text-xl font-bold text-slate-100">
            Webhooks &amp; Trading Bot Integration
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Integrate automated trading alerts from TradingView, Python scripts, Telegram signals, or
          quantitative backtesting engines with Quotex live asset feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Interactive Webhook Dispatcher */}
        <div className="p-5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c2738] pb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Live Webhook Dispatcher Simulator</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">POST /orders/simulate</span>
          </div>

          <p className="text-xs text-slate-400">
            Simulate an incoming webhook signal from TradingView or an external bot. When executed,
            the trade strike line will immediately appear on the terminal live chart.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-[#16202f] border border-[#24334a] rounded px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.symbol} (Payout {a.payout}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Signal Direction
                </label>
                <div className="grid grid-cols-2 gap-1 bg-[#16202f] p-1 rounded border border-[#24334a]">
                  <button
                    onClick={() => setDirection('CALL')}
                    className={`py-1 text-xs font-bold rounded ${
                      direction === 'CALL'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    CALL (UP)
                  </button>
                  <button
                    onClick={() => setDirection('PUT')}
                    className={`py-1 text-xs font-bold rounded ${
                      direction === 'PUT'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PUT (DOWN)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 60)}
                  className="w-full bg-[#16202f] border border-[#24334a] rounded px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Simulated Investment ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 100)}
                className="w-full bg-[#16202f] border border-[#24334a] rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>

            <button
              onClick={handleTestWebhook}
              disabled={isSending}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <Send size={14} />
              <span>{isSending ? 'Dispatching Webhook...' : 'Dispatch Signal to Terminal'}</span>
            </button>

            {webhookResult && (
              <div className="mt-3 bg-[#0a0f17] border border-[#1d2737] rounded-lg p-3">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">
                  Webhook Execution Response:
                </span>
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                  {webhookResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: TradingView Webhook Configuration */}
        <div className="p-5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c2738] pb-3">
            <div className="flex items-center gap-2">
              <Webhook size={16} className="text-sky-400" />
              <h2 className="text-sm font-bold text-slate-100">TradingView Alert Webhook Format</h2>
            </div>
            <button
              onClick={() => copyText('tv', tradingViewAlertPayload)}
              className="p-1 text-slate-400 hover:text-white"
            >
              {copiedSection === 'tv' ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Paste this JSON payload into your TradingView Alert "Webhook URL" message box.
          </p>

          <div className="bg-[#090d14] border border-[#182333] rounded-lg p-3 font-mono text-xs text-slate-300">
            <pre className="leading-relaxed select-all">{tradingViewAlertPayload}</pre>
          </div>

          <div className="p-3 bg-[#16202f] rounded-lg border border-[#233146] space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Authentication &amp; Security</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pass your generated secret token in the JSON payload or via HTTP Header:{' '}
              <code className="text-emerald-400 font-mono">Authorization: Bearer qtx_sec_...</code>
            </p>
          </div>
        </div>
      </div>

      {/* Full-Width Python Trading Bot Script */}
      <div className="p-5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2738] pb-3">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Production Python Trading Bot Starter (SSE + REST)
            </h2>
          </div>
          <button
            onClick={() => copyText('bot', pythonBotCode)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#182333] hover:bg-[#202e42] text-slate-200 rounded border border-[#26354b] transition-colors"
          >
            {copiedSection === 'bot' ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
            <span>{copiedSection === 'bot' ? 'Copied' : 'Copy Python Bot'}</span>
          </button>
        </div>

        <div className="bg-[#090d14] border border-[#182333] rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="leading-relaxed select-all">{pythonBotCode}</pre>
        </div>
      </div>
    </div>
  );
};
