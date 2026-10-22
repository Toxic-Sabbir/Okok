import React, { useState, useEffect } from 'react';
import type {
  Asset,
  Candle,
  TimeframeKey,
  ChartType,
  IndicatorSettings,
  ActiveTrade,
  LiveTick,
  NextCandleSignal,
} from '../types/market';
import { QuotexChart } from './QuotexChart';
import { AssetModal } from './AssetModal';
import { IndicatorModal } from './IndicatorModal';
import {
  getCandles,
  executeSimulatedTrade,
  getSimulatedTrades,
  getNextCandleSignal,
  getPairNewsImpact,
} from '../services/api';
import {
  ChevronDown,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sliders,
  BarChart2,
  Activity,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface TradingTerminalProps {
  assets: Asset[];
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  demoBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  liveTicks: LiveTick[];
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  demoBalance,
  onUpdateBalance,
  liveTicks,
}) => {
  // Chart configurations
  const [timeframe, setTimeframe] = useState<TimeframeKey>('1m');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showSma: true,
    smaPeriod: 14,
    showBollinger: false,
    bollingerPeriod: 20,
    bollingerStdDev: 2,
    showRsi: false,
    rsiPeriod: 14,
    showMacd: false,
  });

  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);

  // Candles & Countdown
  const [candles, setCandles] = useState<Candle[]>([]);
  const [candleRemaining, setCandleRemaining] = useState<number>(60);
  const [nextCandleSignal, setNextCandleSignal] = useState<NextCandleSignal | null>(null);
  const [pairNews, setPairNews] = useState<any[]>([]);

  // Trading Dock state
  const [investment, setInvestment] = useState<number>(100);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [recentNotification, setRecentNotification] = useState<{
    message: string;
    type: 'win' | 'loss';
  } | null>(null);

  // Load next candle signal and pair news
  useEffect(() => {
    getNextCandleSignal(selectedAsset.id, timeframe).then((sig) => setNextCandleSignal(sig)).catch(() => {});
    getPairNewsImpact(selectedAsset.id).then((news) => setPairNews(news)).catch(() => {});
  }, [selectedAsset.id, timeframe]);

  // Load initial candles on asset or timeframe change
  useEffect(() => {
    let isMounted = true;
    async function loadCandles() {
      try {
        const result = await getCandles(selectedAsset.id, timeframe, 120);
        if (isMounted) {
          setCandles(result.candles);
          setCandleRemaining(result.candleRemainingSeconds);
        }
      } catch (err) {
        console.error('Failed to load candles', err);
      }
    }
    loadCandles();
    return () => {
      isMounted = false;
    };
  }, [selectedAsset.id, timeframe]);

  // Sync with live ticks from SSE stream
  useEffect(() => {
    if (liveTicks.length === 0) return;
    const latest = liveTicks.find((t) => t.assetId === selectedAsset.id);
    if (!latest) return;

    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.close = latest.price;
      if (latest.price > last.high) last.high = latest.price;
      if (latest.price < last.low) last.low = latest.price;
      last.volume += 1;
      updated[updated.length - 1] = last;
      return updated;
    });
  }, [liveTicks, selectedAsset.id]);

  // Candle countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCandleRemaining((prev) => {
        if (prev <= 1) {
          // Re-fetch candles when candle closes
          getCandles(selectedAsset.id, timeframe, 120).then((res) => {
            setCandles(res.candles);
          });
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedAsset.id, timeframe]);

  // Load active and recent trades
  useEffect(() => {
    getSimulatedTrades().then((trades) => {
      setActiveTrades(trades);
    });
  }, []);

  // Poll trades to handle settlements & notifications
  useEffect(() => {
    const tradeInterval = setInterval(async () => {
      try {
        const trades = await getSimulatedTrades();
        // Check if any active trade just settled
        for (const t of trades) {
          const existing = activeTrades.find((at) => at.id === t.id);
          if (existing && existing.status === 'ACTIVE' && t.status !== 'ACTIVE') {
            if (t.status === 'WON') {
              const profit = t.potentialProfit;
              onUpdateBalance(demoBalance + t.investment + profit);
              setRecentNotification({
                message: `Won trade on ${t.symbol}! +$${profit.toFixed(2)}`,
                type: 'win',
              });
            } else if (t.status === 'LOST') {
              setRecentNotification({
                message: `Expired out of money on ${t.symbol} (-$${t.investment})`,
                type: 'loss',
              });
            }
            setTimeout(() => setRecentNotification(null), 4000);
          }
        }
        setActiveTrades(trades);
      } catch (e) {
        // quiet
      }
    }, 1000);
    return () => clearInterval(tradeInterval);
  }, [activeTrades, demoBalance, onUpdateBalance]);

  // Place simulated trade
  const handleTrade = async (direction: 'CALL' | 'PUT') => {
    if (investment > demoBalance) {
      alert('Insufficient demo funds! Please reset demo balance in top bar.');
      return;
    }

    try {
      // Deduct investment initially
      onUpdateBalance(demoBalance - investment);
      const newTrade = await executeSimulatedTrade(
        selectedAsset.id,
        direction,
        investment,
        durationSeconds
      );
      setActiveTrades((prev) => [newTrade, ...prev]);
    } catch (err) {
      console.error('Trade error', err);
    }
  };

  const potentialProfit = Number((investment * (selectedAsset.payout / 100)).toFixed(2));
  const activeOrders = activeTrades.filter((t) => t.status === 'ACTIVE');
  const closedOrders = activeTrades.filter((t) => t.status !== 'ACTIVE').slice(0, 10);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden bg-[#0a0e16]">
      {/* Chart Section */}
      <div className="flex-1 flex flex-col h-full border-r border-[#1a2332] min-w-0">
        {/* Chart Sub-header Toolbar */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a2332] bg-[#0d131d] shrink-0 text-xs">
          {/* Asset Selector Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAssetModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#151c27] hover:bg-[#1c2636] border border-[#232f42] rounded-lg transition-colors text-slate-100 font-semibold"
            >
              <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                {selectedAsset.symbol.slice(0, 2)}
              </div>
              <span className="text-sm font-bold">{selectedAsset.symbol}</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                {selectedAsset.payout}%
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Quick 24h stats */}
            <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono">
              <span>
                24h High:{' '}
                <span className="text-slate-200">
                  {selectedAsset.high24h.toFixed(selectedAsset.precision)}
                </span>
              </span>
              <span>
                24h Low:{' '}
                <span className="text-slate-200">
                  {selectedAsset.low24h.toFixed(selectedAsset.precision)}
                </span>
              </span>
            </div>
          </div>

          {/* Chart Controls (Timeframe, Chart Style, Indicators) */}
          <div className="flex items-center gap-2">
            {/* Timeframe selector */}
            <div className="hidden sm:flex items-center bg-[#141b26] p-0.5 rounded-lg border border-[#202c3e]">
              {(['5s', '15s', '30s', '1m', '5m', '15m', '1h'] as TimeframeKey[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    timeframe === tf
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type Dropdown */}
            <div className="relative">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                aria-label="Select Chart Type"
                className="bg-[#141b26] border border-[#202c3e] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="candlestick">Candles</option>
                <option value="area">Area</option>
                <option value="heikin-ashi">Heikin-Ashi</option>
                <option value="bars">Bars</option>
              </select>
            </div>

            {/* Indicators button */}
            <button
              onClick={() => setIsIndicatorModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141b26] hover:bg-[#1e2838] border border-[#202c3e] rounded-lg text-slate-200 transition-colors"
              title="Add Technical Indicators"
            >
              <Sliders size={13} className="text-emerald-400" />
              <span className="hidden md:inline">Indicators</span>
              {(indicators.showSma || indicators.showBollinger || indicators.showRsi) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="flex-1 relative min-h-[360px]">
          <QuotexChart
            asset={selectedAsset}
            candles={candles}
            chartType={chartType}
            indicators={indicators}
            candleRemainingSeconds={candleRemaining}
            activeTrades={activeTrades}
            nextCandleSignal={nextCandleSignal}
          />

          {/* Win / Loss Notification Toast */}
          {recentNotification && (
            <div
              className={`absolute top-16 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl border text-sm font-medium animate-bounce ${
                recentNotification.type === 'win'
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                  : 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              }`}
            >
              {recentNotification.type === 'win' ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <XCircle size={18} className="text-rose-400" />
              )}
              <span>{recentNotification.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Quotex Trading Dock */}
      <div className="w-full lg:w-80 bg-[#0d131e] flex flex-col shrink-0 border-t lg:border-t-0 border-[#1a2332] overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* NEXT CANDLE SIGNAL ANALYZER CARD */}
          {nextCandleSignal && (
            <div
              className={`p-3.5 rounded-xl border space-y-3 transition-all ${
                nextCandleSignal.direction === 'CALL'
                  ? 'bg-gradient-to-br from-emerald-950/40 to-[#101722] border-emerald-500/40'
                  : 'bg-gradient-to-br from-rose-950/40 to-[#101722] border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles
                    size={14}
                    className={nextCandleSignal.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}
                  />
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Next Candle Signal
                  </span>
                </div>
                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-black/40 text-emerald-400">
                  {nextCandleSignal.confidence}% Confidence
                </span>
              </div>

              {/* Direction & Target */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div
                    className={`text-base font-extrabold ${
                      nextCandleSignal.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {nextCandleSignal.direction === 'CALL' ? 'CALL (GREEN CANDLE)' : 'PUT (RED CANDLE)'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Pattern: {nextCandleSignal.patternDetected}
                  </div>
                </div>

                <button
                  onClick={() => handleTrade(nextCandleSignal.direction === 'CALL' ? 'CALL' : 'PUT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md transition-all ${
                    nextCandleSignal.direction === 'CALL'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Trade Signal
                </button>
              </div>

              {/* Confluence Checklist */}
              <div className="space-y-1 pt-2 border-t border-[#1c2738] text-[11px]">
                {nextCandleSignal.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-400">
                    <span className="truncate max-w-[170px]">{item.rule}</span>
                    <span
                      className={`font-mono font-bold ${
                        item.status === 'BULLISH'
                          ? 'text-emerald-400'
                          : item.status === 'BEARISH'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forex Factory Pair News Impact Banner */}
          {pairNews.length > 0 && (
            <div className="p-3 bg-[#111722] border border-[#212f42] rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Flame size={13} />
                  <span>Forex Factory Impact</span>
                </div>
                <span className="font-mono text-slate-400">{pairNews[0].newsTime}</span>
              </div>
              <div className="font-bold text-slate-200">{pairNews[0].newsTitle}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Expected bias: <strong className="text-emerald-400">{pairNews[0].direction}</strong> ({pairNews[0].expectedPips} pips) - {pairNews[0].reason}
              </p>
            </div>
          )}

          {/* Investment & Expiration Settings Card */}
          <div className="p-4 bg-[#131b26] border border-[#202b3d] rounded-xl space-y-4">
            {/* Expiration Time */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  Time Expiration
                </span>
                <span className="font-mono text-slate-200">{durationSeconds}s</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '30s', val: 30 },
                  { label: '1m', val: 60 },
                  { label: '2m', val: 120 },
                  { label: '5m', val: 300 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setDurationSeconds(item.val)}
                    className={`py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                      durationSeconds === item.val
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-[#182333] text-slate-300 hover:bg-[#202e42]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Investment Amount */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={13} />
                  Investment Amount
                </span>
                <span className="font-mono text-slate-200">${investment}</span>
              </div>

              {/* Stepper Input */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvestment((prev) => Math.max(10, prev - 10))}
                  className="w-9 h-9 flex items-center justify-center bg-[#1a2434] hover:bg-[#243248] text-slate-300 rounded-lg transition-colors"
                >
                  <Minus size={15} />
                </button>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value) || 10)}
                    className="w-full bg-[#182333] border border-[#26354b] rounded-lg pl-7 pr-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setInvestment((prev) => prev + 10)}
                  className="w-9 h-9 flex items-center justify-center bg-[#1a2434] hover:bg-[#243248] text-slate-300 rounded-lg transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Quick Investment Presets */}
              <div className="flex items-center gap-1.5 mt-2">
                {[25, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setInvestment(amt)}
                    className="flex-1 py-1 text-[11px] font-mono bg-[#182333] hover:bg-[#223046] text-slate-300 rounded transition-colors"
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout & Return Calculation Strip */}
            <div className="pt-3 border-t border-[#1c2738] flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Payout</span>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  +{selectedAsset.payout}%
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Profit On Win</span>
                <div className="text-base font-bold text-slate-100 font-mono">
                  +${potentialProfit}
                </div>
              </div>
            </div>
          </div>

          {/* Quotex Signature Big Action Buttons (UP & DOWN) */}
          <div className="space-y-2.5">
            {/* CALL / HIGHER Button */}
            <button
              onClick={() => handleTrade('CALL')}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl flex items-center justify-between transition-all shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 flex items-center justify-center">
                  <TrendingUp size={18} className="text-slate-950" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold uppercase tracking-wide">UP (CALL)</div>
                  <div className="text-[11px] font-medium opacity-85">Higher than strike</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-extrabold">+${potentialProfit}</div>
                <div className="text-[10px] opacity-75">{selectedAsset.payout}%</div>
              </div>
            </button>

            {/* PUT / LOWER Button */}
            <button
              onClick={() => handleTrade('PUT')}
              className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-400 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-between transition-all shadow-lg shadow-rose-500/20"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600/30 flex items-center justify-center">
                  <TrendingDown size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold uppercase tracking-wide">DOWN (PUT)</div>
                  <div className="text-[11px] font-medium opacity-85">Lower than strike</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-extrabold">+${potentialProfit}</div>
                <div className="text-[10px] opacity-75">{selectedAsset.payout}%</div>
              </div>
            </button>
          </div>

          {/* Active Trades & Positions Widget */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Activity size={13} className="text-emerald-400" />
                Active Positions ({activeOrders.length})
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#111823] border border-[#1d2736] text-center text-xs text-slate-500">
                No active positions. Execute UP or DOWN above.
              </div>
            ) : (
              <div className="space-y-2">
                {activeOrders.map((trade) => {
                  const now = Date.now();
                  const remainingSec = Math.max(0, Math.floor((trade.expiryTime - now) / 1000));
                  const isCall = trade.direction === 'CALL';
                  const inTheMoney = isCall
                    ? selectedAsset.price > trade.strikePrice
                    : selectedAsset.price < trade.strikePrice;

                  return (
                    <div
                      key={trade.id}
                      className="p-3 bg-[#131b26] border border-[#202b3d] rounded-lg text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={isCall ? 'text-emerald-400' : 'text-rose-400'}
                          >
                            {trade.direction}
                          </span>
                          <span className="text-slate-200">{trade.symbol}</span>
                        </div>
                        <span className="font-mono text-slate-300">
                          {remainingSec}s left
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                        <span>Strike: {trade.strikePrice.toFixed(selectedAsset.precision)}</span>
                        <span>Invest: ${trade.investment}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#1c2738]">
                        <span className={inTheMoney ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {inTheMoney ? 'IN THE MONEY' : 'OUT OF MONEY'}
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {inTheMoney ? `+$${trade.potentialProfit}` : `-$${trade.investment}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Closed Trades History Strip */}
          {closedOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#1a2332]">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <History size={13} />
                  Recent Trades
                </span>
              </div>
              <div className="space-y-1.5">
                {closedOrders.slice(0, 4).map((trade) => {
                  const isWon = trade.status === 'WON';
                  return (
                    <div
                      key={trade.id}
                      className="p-2 bg-[#101722] border border-[#1c2738] rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={trade.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}>
                          {trade.direction}
                        </span>
                        <span className="text-slate-300">{trade.symbol}</span>
                      </div>
                      <div className="font-mono font-bold">
                        {isWon ? (
                          <span className="text-emerald-400">+${trade.potentialProfit}</span>
                        ) : (
                          <span className="text-rose-400">-${trade.investment}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        assets={assets}
        selectedAsset={selectedAsset}
        onSelectAsset={onSelectAsset}
      />

      <IndicatorModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        indicators={indicators}
        onChange={setIndicators}
      />
    </div>
  );
};
