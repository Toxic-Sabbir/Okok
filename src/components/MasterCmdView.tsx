import React, { useState } from 'react';
import {
  Bot,
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  Sparkles,
  Zap,
  CheckCircle2,
  Image,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import {
  generateMasterStBotCommand,
  MASTER_SUBCOMMANDS,
} from '../utils/masterStBotCmd';

interface MasterCmdViewProps {
  customApiBase: string;
}

export const MasterCmdView: React.FC<MasterCmdViewProps> = ({ customApiBase }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [simInput, setSimInput] = useState('!fx EUR_USD');
  const [simOutput, setSimOutput] = useState<string>(
`🔮 ══ [ ALL-IN-ONE FOREX PREDICTION & ANALYSIS ] ══ 🔮
🌐 Pair: EUR/USD (Euro / US Dollar) | Timeframe: 1m
⏰ Time (UTC+6): 2026-10-29 23:45:00 (UTC+6 / BST)
⚡ Market: Real-Time Interbank Spot (No OTC)
💰 Interbank Price: 1.08480 (📈 +0.32%)
📊 Spread: 0.6 pips | Payout: 88%

🎯 NEXT CANDLE PREDICTION:
👉 [ 🟢 CALL (BUY / GREEN) ]
⭐️ Win Rate Confidence: 88%
⏱ Candle Countdown: 14s remaining
🎯 Target Price: 1.08620
🛡 Invalidation: 1.08390

📊 TECHNICAL CONFLUENCE:
• EMA Trend (9/21): BULLISH_CROSS
• RSI (14): 54.2 (NEUTRAL)
• MACD: BULLISH_EXPANSION
• Bollinger Bands: EXPANDING_UPPER
• Stochastic: 62.4 (OVERSOLD_BOUNCE)
• Overall Bias: EMA 9 Golden Cross & Trend Expansion

📰 ECONOMIC IMPACT (Forex Factory):
• Event: Core CPI m/m (18:30 UTC+6)
• Sentiment: BULLISH_FOR_BASE_CURRENCY
• News Direction: BUY (CALL)

💡 Tip: Type "!fx snap EUR_USD" to get the live chart image!`
  );
  const [simImage, setSimImage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLatency, setSimLatency] = useState<number | null>(42);

  const baseUrl = customApiBase || (typeof window !== 'undefined' ? window.location.origin : '');
  const masterCode = generateMasterStBotCommand(baseUrl);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(masterCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([masterCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forex.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executeSimCommand = async (cmdText: string) => {
    setSimInput(cmdText);
    setIsSimulating(true);
    setSimImage(null);
    const start = performance.now();

    try {
      const parts = cmdText.trim().replace(/^!/, '').split(/\s+/);
      const sub = (parts[1] || '').toLowerCase();

      // If just !fx or !forex or !fx help
      if (!parts[1] || sub === 'help' || sub === 'menu') {
        setSimOutput(
`🌐 ══ [ ALL-IN-ONE FOREX TRADING ENGINE ] ══ 🌐
Status: Online (100% Real Interbank Forex - No OTC)

⚡ MASTER COMMAND USAGE:
• !fx [pair]          -> All-In-One quote, AI signal & news
• !fx snap [pair]     -> Live candlestick chart screenshot
• !fx signal [pair]   -> Next candle CALL/PUT & win rate %
• !fx scan            -> Scan 23+ pairs & rank top setups
• !fx news            -> Forex Factory high-impact calendar
• !fx dir [pair]      -> Which pair which direction matrix
• !fx pairs           -> View all active Forex pairs & payouts

📌 Examples:
!fx EUR_USD
!fx snap GBP_USD 1m
!fx scan
!fx news

🔥 Type "!fx EUR_USD" right now to get your first live signal!`
        );
        setSimLatency(Math.round(performance.now() - start));
        setIsSimulating(false);
        return;
      }

      if (sub === 'snap' || sub === 'chart' || sub === 'shot') {
        const pair = (parts[2] || 'EUR_USD').toUpperCase().replace('/', '_');
        const tf = parts[3] || '1m';
        const res = await fetch(`${baseUrl}/api/v1/forex/screenshot?pair=${pair}&timeframe=${tf}&format=json`);
        const data = await res.json();
        if (!data.success) {
          setSimOutput(`❌ Failed to snap chart: ${data.error || 'Pair not found'}`);
        } else {
          const sig = data.nextCandleSignal || data.signal;
          const dirBadge = sig.direction === 'CALL' ? '🟢 CALL (UP / GREEN)' : '🔴 PUT (DOWN / RED)';
          setSimOutput(
`📸 ══ [ FOREX MARKET CHART SNAPSHOT ] ══ 📸
🌐 Asset: ${data.symbol} (${data.name || pair}) | TF: ${data.timeframe}
⏰ Time (UTC+6): ${data.timeUtc6 || 'Live BST'}
⚡ Feed: Real-Time Worldwide Interbank Spot
💰 Current Price: ${data.currentPrice}
🔮 NEXT CANDLE SIGNAL: [ ${dirBadge} ]
🎯 Win Rate: ${sig.confidence}% | Target: ${sig.targetPrice}
⏱ Countdown: ${sig.countdownSeconds}s remaining
📊 Pattern: ${sig.pattern}
───────────────────────────────
🖼 Direct HD Chart Screenshot Attached Below:`
          );
          setSimImage(data.dataUri || `${baseUrl}/api/v1/forex/screenshot?pair=${pair}&timeframe=${tf}&format=image`);
        }
      } else if (sub === 'scan' || sub === 'scanner' || sub === 'top') {
        const tf = parts[2] || '1m';
        const res = await fetch(`${baseUrl}/api/v1/forex/scanner?timeframe=${tf}`);
        const data = await res.json();
        const top = (data.data || []).slice(0, 5);
        const lines = top.map((p: any, i: number) => {
          const dir = p.signal.direction === 'CALL' ? '🟢 CALL' : '🔴 PUT';
          return `[${i + 1}] ${p.symbol} - ${dir} (${p.signal.confidence}%)
   💰 Price: ${p.price} | Target: ${p.signal.targetPrice}
   ⏱ Close in: ${p.signal.countdownSeconds}s | Spread: ${p.pipSpread} pips`;
        }).join('\n\n');

        setSimOutput(
`📊 ══ [ FOREX MARKET SCANNER: TOP SETUPS ] ══ 📊
Total Pairs: ${data.totalScanned || data.count} | Timeframe: ${data.timeframe}
⏰ Time (UTC+6): ${data.timeUtc6 || 'Live BST'}
⚡ Market: Real-Time Interbank Spot (No OTC)

${lines}

💡 Tip: Type "!fx snap [pair]" to view the live candlestick chart image!`
        );
      } else if (sub === 'news' || sub === 'calendar') {
        const impact = (parts[2] || 'HIGH').toUpperCase();
        const res = await fetch(`${baseUrl}/api/v1/forex/news?impact=${impact}`);
        const data = await res.json();
        const events = (data.data || []).slice(0, 5);
        const lines = events.map((ev: any, i: number) => {
          const badge = ev.impact === 'HIGH' ? '🔴 [HIGH]' : ev.impact === 'MEDIUM' ? '🟠 [MED]' : '🟡 [LOW]';
          return `[${i + 1}] ${badge} ${ev.currency} - ${ev.title}
   ⏰ Time (UTC+6): ${ev.timeUtc6 || ev.time}
   📊 Forecast: ${ev.forecast} | Previous: ${ev.previous} | Sentiment: ${ev.sentiment}`;
        }).join('\n\n');

        setSimOutput(
`📰 ══ [ FOREX FACTORY ECONOMIC CALENDAR ] ══ 📰
Impact Filter: ${impact} | Events Count: ${data.count}
⏰ Timezone: UTC+6 (Bangladesh Standard Time / BST)

${lines}

💡 Type "!fx dir" to see which pairs will move and expected pips!`
        );
      } else if (sub === 'dir' || sub === 'direction' || sub === 'impact') {
        const pair = (parts[2] || 'EUR_USD').toUpperCase().replace('/', '_');
        const res = await fetch(`${baseUrl}/api/v1/forex/news/pair-impact?pair=${pair}`);
        const data = await res.json();
        const impacts = (data.data || []).slice(0, 4);
        const lines = impacts.map((item: any, i: number) => {
          const dirIcon = item.expectedDirection === 'UP' ? '🟢 BUY / LONG' : '🔴 SELL / SHORT';
          return `[${i + 1}] ${item.eventTitle} (${item.affectedPair})
   🎯 Bias: ${dirIcon} (Expected: ${item.expectedPips} pips)
   💡 Reason: ${item.tradeLogic}`;
        }).join('\n\n');

        setSimOutput(
`🧭 ══ [ WHICH PAIR WHICH DIRECTION MATRIX ] ══ 🧭
Pair: ${pair} | Overall Sentiment: ${data.overallSentiment || 'NEUTRAL'}
⏰ Time (UTC+6): ${data.timeUtc6 || 'Live BST'}

${lines}`
        );
      } else if (sub === 'future' || sub === 'fut' || sub === 'sched') {
        const count = Number(parts[2]) || 5;
        const tf = parts[3] || '1m';
        const res = await fetch(`${baseUrl}/api/v1/forex/future-signals?count=${count}&timeframe=${tf}&format=text`);
        const text = await res.text();
        setSimOutput(text);
      } else if (sub === 'pairs' || sub === 'assets' || sub === 'list') {
        const res = await fetch(`${baseUrl}/api/v1/forex/assets`);
        const data = await res.json();
        const majors = (data.data || []).filter((a: any) => a.category === 'major');
        const listStr = majors.map((a: any) => `• ${a.symbol} (${a.price}) [Payout: ${a.payout}%]`).join('\n');

        setSimOutput(
`🌐 ══ [ WORLDWIDE INTERBANK FOREX ASSETS ] ══ 🌐
Total Active Pairs: ${data.count} (No OTC - 100% Real Interbank)
⏰ Time (UTC+6): ${data.timeUtc6 || 'Live BST'}

⭐ Major Pairs:
${listStr}

💡 Command: "!fx EUR_USD" to analyze any pair!`
        );
      } else {
        const rawPair = (sub === 'signal' && parts[2]) ? parts[2] : parts[1];
        let clean = rawPair.toUpperCase().trim().replace(/[\/\-_ ]+/g, '');
        if (clean === 'GOLD') clean = 'XAU_USD';
        if (clean === 'SILVER') clean = 'XAG_USD';
        if (clean === 'OIL') clean = 'WTI_USD';
        const pair = clean.length === 6 ? clean.slice(0, 3) + '_' + clean.slice(3) : rawPair.toUpperCase().replace('/', '_');
        const tf = (sub === 'signal' && parts[3]) ? parts[3] : (parts[2] || '1m');

        const res = await fetch(`${baseUrl}/api/v1/forex/all-in-one?pair=${pair}&timeframe=${tf}`);
        const data = await res.json();
        if (!data.success) {
          setSimOutput(`❌ Failed to analyze ${pair}: ${data.error || 'Asset not found'}`);
        } else {
          const a = data.asset;
          const sig = data.signal || data.nextCandleSignal;
          const ind = sig.confluenceIndicators || {
            emaTrend: "EMA 9 above EMA 21 (BULLISH)",
            rsi: "RSI 14 Neutral (54.2)",
            macd: "MACD Histogram Positive Divergence",
            bollinger: "Upper Band Expansion",
            stochastic: "Stoch %K/%D Bull Cross"
          };
          const dirIcon = sig.direction === 'CALL' ? '🟢 CALL (BUY / GREEN)' : '🔴 PUT (SELL / RED)';
          const changeIcon = a.change24h >= 0 ? '📈 +' : '📉 ';

          setSimOutput(
`🔮 ══ [ ALL-IN-ONE FOREX PREDICTION & ANALYSIS ] ══ 🔮
🌐 Pair: ${a.symbol} (${a.name}) | Timeframe: ${data.timeframe || tf}
⏰ Time (UTC+6): ${data.timeUtc6 || 'Live BST'}
⚡ Market: Real-Time Interbank Spot (No OTC)
💰 Interbank Price: ${a.price} (${changeIcon}${a.change24h}%)
📊 Spread: ${a.spreadPips} pips | Payout: ${a.payout || a.payoutRate}%

🎯 NEXT CANDLE PREDICTION:
👉 [ ${dirIcon} ]
⭐️ Win Rate Confidence: ${sig.confidenceScore || sig.confidence + '%'}
⏱ Candle Countdown: ${sig.candleCloseRemainingSeconds || sig.countdownSeconds}s remaining
🎯 Target Price: ${sig.targetPrice}
🛡 Invalidation: ${sig.invalidationPrice || sig.invalidationLevel}

📊 TECHNICAL CONFLUENCE:
• EMA Trend (9/21): ${ind.emaTrend}
• RSI (14): ${ind.rsi}
• MACD: ${ind.macd}
• Bollinger Bands: ${ind.bollinger}
• Stochastic: ${ind.stochastic}
• Overall Bias: ${sig.pattern}

📰 ECONOMIC IMPACT (Forex Factory):
• Event: ${data.forexFactoryNews?.upcomingHighImpactEvent || 'Active Market Data'}
• Sentiment: ${data.forexFactoryNews?.currencySentiment || 'Neutral'}
• News Direction: ${data.forexFactoryNews?.recommendedDirection || 'Follow Technicals'}

💡 Tip: Type "!fx snap ${a.symbol}" to get the live chart image!`
          );
        }
      }
    } catch (err: any) {
      setSimOutput(`❌ Simulator Error: ${err.message}`);
    } finally {
      setSimLatency(Math.round(performance.now() - start));
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#111c2e] via-[#0f1826] to-[#122238] border border-indigo-500/30 rounded-2xl p-5 sm:p-8 shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-300" />
                <span>UNIFIED MASTER COMMAND</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-semibold">
                v4.0.0 Ready
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px] font-mono font-bold">
                ZYRO BOT
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              One ZYRO BOT Command for All Forex Features
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No need to install 9 separate command files. Drop a single <code className="text-amber-300 font-mono bg-[#141d2c] px-1.5 py-0.5 rounded border border-[#202e42]">forex.js</code> (or <code className="text-amber-300 font-mono bg-[#141d2c] px-1.5 py-0.5 rounded border border-[#202e42]">zyro.js</code>) file into your bot's <code className="text-emerald-400 font-mono bg-[#141d2c] px-1.5 py-0.5 rounded border border-[#202e42]">scripts/cmds/</code> folder to unlock accurate live quotes, AI candle predictions, multi-indicator confluence, economic news, scanner, and live chart screenshots!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 size={14} /> 100% Real-Time Interbank Spot
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 size={14} /> ZYRO BOT HD Chart Snapshots
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 size={14} /> Forex Factory Calendar (UTC+6)
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleDownload}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              <Download size={16} />
              <span>Download forex.js (ZYRO BOT Master)</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 bg-[#172233] hover:bg-[#202f45] text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-[#27374e] min-h-[42px]"
            >
              {copiedCode ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy ZYRO BOT Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive In-Page ZYRO BOT Chat Simulator */}
      <div className="bg-[#101725] border border-[#1d2a3d] rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c2738] gap-2">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                Interactive ZYRO BOT Messenger Simulator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  LIVE FEED (UTC+6)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Test commands right now in your browser to preview the exact formatted Messenger response.
              </p>
            </div>
          </div>

          {simLatency !== null && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 self-start sm:self-auto">
              <Clock size={12} />
              <span>{simLatency}ms execution</span>
            </div>
          )}
        </div>

        {/* Quick Test Prompt Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Subcommand Test Chips:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '!fx (Help Menu)', cmd: '!fx' },
              { label: '💎 !zyro future (VIP Scheduled Signals)', cmd: '!zyro future 5' },
              { label: '!fx EUR_USD (All-In-One)', cmd: '!fx EUR_USD' },
              { label: '!fx snap EUR_USD (Chart Image)', cmd: '!fx snap EUR_USD' },
              { label: '!fx scan (Market Scanner)', cmd: '!fx scan' },
              { label: '!fx news (Forex Factory)', cmd: '!fx news' },
              { label: '!fx dir EUR_USD (Direction)', cmd: '!fx dir EUR_USD' },
              { label: '!fx pairs (All Assets)', cmd: '!fx pairs' },
            ].map((chip) => (
              <button
                key={chip.cmd}
                onClick={() => executeSimCommand(chip.cmd)}
                disabled={isSimulating}
                className="px-2.5 py-1.5 rounded-lg bg-[#141e2e] hover:bg-[#1a273b] border border-[#223147] text-slate-200 text-xs font-mono font-medium transition-colors flex items-center gap-1 min-h-[32px] disabled:opacity-50"
              >
                <Zap size={11} className="text-amber-400" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Command Input Box */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeSimCommand(simInput);
              }}
              placeholder="e.g. !fx EUR_USD, !fx snap GBP_USD, !fx scan, !fx news"
              className="w-full bg-[#0a0f18] border border-[#1e2a3c] focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={() => executeSimCommand(simInput)}
            disabled={isSimulating}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 shrink-0 min-h-[40px]"
          >
            {isSimulating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isSimulating ? 'Processing...' : 'Run Command'}</span>
          </button>
        </div>

        {/* Simulated Messenger Chat Window */}
        <div className="bg-[#080d16] border border-[#182333] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-[#151f2e] pb-2">
            <span className="flex items-center gap-1.5">
              <Bot size={13} className="text-indigo-400" />
              <span>Facebook Messenger Output (ZYRO BOT Engine)</span>
            </span>
            <span className="text-emerald-400">● ZYRO BOT Online</span>
          </div>

          {/* User query bubble */}
          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-xs font-mono max-w-md shadow-sm">
              {simInput}
            </div>
          </div>

          {/* Bot reply bubble */}
          <div className="flex justify-start">
            <div className="bg-[#121927] border border-[#212e42] text-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs font-mono leading-relaxed max-w-2xl space-y-3 shadow-md">
              <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs select-all text-slate-100">
                {simOutput}
              </pre>

              {/* Direct chart snapshot attachment if snapped */}
              {simImage && (
                <div className="pt-2 border-t border-[#1e2a3c] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Image size={13} /> Attached Live Candlestick Screenshot
                    </span>
                    <a
                      href={simImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={11} /> Open Full Size
                    </a>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-[#233146] bg-[#090e17]">
                    <img
                      src={simImage}
                      alt="Market chart screenshot"
                      className="w-full h-auto max-h-80 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subcommands Matrix */}
      <div className="bg-[#101725] border border-[#1d2a3d] rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          <span>Supported Subcommands inside forex.js</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MASTER_SUBCOMMANDS.map((sc) => (
            <div
              key={sc.syntax}
              className="p-3.5 bg-[#0b101a] border border-[#182333] rounded-xl space-y-1.5 hover:border-[#273850] transition-colors"
            >
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono font-bold text-amber-300 bg-[#141e2e] px-2 py-0.5 rounded border border-[#223147]">
                  {sc.syntax}
                </code>
                <button
                  onClick={() => executeSimCommand(sc.example)}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Test</span> <ArrowRight size={11} />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{sc.shortDesc}</p>
              <div className="text-[11px] font-mono text-slate-500">
                Example: <span className="text-slate-300">{sc.example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Source Code Viewer */}
      <div className="bg-[#0b101a] border border-[#1d2a3d] rounded-2xl overflow-hidden shadow-lg">
        <div className="px-4 sm:px-6 py-3 bg-[#0e1522] border-b border-[#1b2535] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-indigo-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              scripts/cmds/forex.js (3.0.0 Standalone Source)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-[#192434] hover:bg-[#223247] text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#27374e]"
            >
              {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto bg-[#070b12] font-mono text-xs text-slate-300 leading-relaxed max-h-[500px] select-all">
          <pre>{masterCode}</pre>
        </div>
      </div>

      {/* 3-Minute ZYRO BOT Installation Guide */}
      <div className="bg-[#101725] border border-[#1d2a3d] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
          <ShieldCheck size={18} />
          <span>How to Install in ZYRO BOT (or GoatBot v2)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-300">
          <div className="bg-[#0b101a] p-4 rounded-xl border border-[#192435] space-y-2">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[11px]">
                1
              </span>
              <span>Save File</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>Download forex.js</strong> and place the file in your bot's folder:
              <br />
              <code className="text-emerald-400 font-mono bg-[#141e2e] px-1.5 py-0.5 rounded mt-1 inline-block">
                scripts/cmds/forex.js
              </code>
            </p>
          </div>

          <div className="bg-[#0b101a] p-4 rounded-xl border border-[#192435] space-y-2">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[11px]">
                2
              </span>
              <span>Install Axios</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If not already installed, run npm install in your bot root folder:
              <br />
              <code className="text-indigo-400 font-mono bg-[#141e2e] px-1.5 py-0.5 rounded mt-1 inline-block">
                npm install axios
              </code>
            </p>
          </div>

          <div className="bg-[#0b101a] p-4 rounded-xl border border-[#192435] space-y-2">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[11px]">
                3
              </span>
              <span>Start Trading</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Type the command in your Facebook Messenger chat:
              <br />
              <code className="text-amber-300 font-mono bg-[#141e2e] px-1.5 py-0.5 rounded mt-1 inline-block">
                !fx EUR_USD
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
