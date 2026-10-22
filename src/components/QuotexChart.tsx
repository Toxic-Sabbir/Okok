import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Asset, Candle, ChartType, IndicatorSettings, ActiveTrade, NextCandleSignal } from '../types/market';
import { calculateSMA, calculateBollingerBands, calculateRSI, calculateHeikinAshi } from '../utils/indicators';
import { Camera, Sparkles, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface QuotexChartProps {
  asset: Asset;
  candles: Candle[];
  chartType: ChartType;
  indicators: IndicatorSettings;
  candleRemainingSeconds: number;
  activeTrades: ActiveTrade[];
  nextCandleSignal?: NextCandleSignal | null;
}

export const QuotexChart: React.FC<QuotexChartProps> = ({
  asset,
  candles,
  chartType,
  indicators,
  candleRemainingSeconds,
  activeTrades,
  nextCandleSignal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedShot, setCopiedShot] = useState(false);

  // Viewport / zoom / pan state
  const [visibleCount, setVisibleCount] = useState<number>(60);
  const [offsetRight, setOffsetRight] = useState<number>(0);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; candle: Candle | null } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);

  // Capture Screenshot of Canvas + Annotations
  const handleTakeScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Draw original chart
    expCtx.drawImage(canvas, 0, 0);

    // Overlay Branding & Next Candle Signal Badge on screenshot
    const dpr = window.devicePixelRatio || 1;
    const bannerW = 340 * dpr;
    const bannerH = 75 * dpr;
    const bannerX = 20 * dpr;
    const bannerY = 20 * dpr;

    expCtx.fillStyle = 'rgba(12, 16, 23, 0.92)';
    expCtx.strokeStyle = '#273549';
    expCtx.lineWidth = 1.5 * dpr;
    expCtx.beginPath();
    expCtx.roundRect(bannerX, bannerY, bannerW, bannerH, 8 * dpr);
    expCtx.fill();
    expCtx.stroke();

    // Signal text
    const isCall = nextCandleSignal?.direction === 'CALL';
    const sigColor = isCall ? '#10b981' : '#f43f5e';
    expCtx.fillStyle = '#ffffff';
    expCtx.font = `bold ${13 * dpr}px 'Plus Jakarta Sans', sans-serif`;
    expCtx.textAlign = 'left';
    expCtx.fillText(`${asset.symbol} - Worldwide Forex Live`, bannerX + 14 * dpr, bannerY + 24 * dpr);

    expCtx.fillStyle = sigColor;
    expCtx.font = `bold ${12 * dpr}px 'JetBrains Mono', monospace`;
    expCtx.fillText(
      `NEXT CANDLE: ${nextCandleSignal?.direction || 'ANALYZING'} (${nextCandleSignal?.confidence || 88}% Confidence)`,
      bannerX + 14 * dpr,
      bannerY + 44 * dpr
    );

    expCtx.fillStyle = '#94a3b8';
    expCtx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;
    expCtx.fillText(
      `Price: ${asset.price.toFixed(asset.precision)} · Pattern: ${nextCandleSignal?.patternDetected || 'Momentum'}`,
      bannerX + 14 * dpr,
      bannerY + 62 * dpr
    );

    // Watermark
    expCtx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    expCtx.font = `bold ${11 * dpr}px 'Plus Jakarta Sans', sans-serif`;
    expCtx.textAlign = 'right';
    expCtx.fillText('Quotex Worldwide Forex Signal API', canvas.width - 20 * dpr, canvas.height - 15 * dpr);

    // Download image
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `quotex_forex_signal_${asset.id}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setCopiedShot(true);
    setTimeout(() => setCopiedShot(false), 2500);
  };

  // Compute display candles based on chartType
  const processedCandles = React.useMemo(() => {
    if (chartType === 'heikin-ashi') {
      return calculateHeikinAshi(candles);
    }
    return candles;
  }, [candles, chartType]);

  // Compute indicators
  const smaValues = React.useMemo(() => {
    if (!indicators.showSma) return [];
    return calculateSMA(candles, indicators.smaPeriod);
  }, [candles, indicators.showSma, indicators.smaPeriod]);

  const bbValues = React.useMemo(() => {
    if (!indicators.showBollinger) return null;
    return calculateBollingerBands(candles, indicators.bollingerPeriod, indicators.bollingerStdDev);
  }, [candles, indicators.showBollinger, indicators.bollingerPeriod, indicators.bollingerStdDev]);

  const rsiValues = React.useMemo(() => {
    if (!indicators.showRsi) return [];
    return calculateRSI(candles, indicators.rsiPeriod);
  }, [candles, indicators.showRsi, indicators.rsiPeriod]);

  // Active trades for this asset
  const relevantTrades = React.useMemo(() => {
    return activeTrades.filter((t) => t.assetId === asset.id && t.status === 'ACTIVE');
  }, [activeTrades, asset.id]);

  // Render chart function
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Clear background
    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, width, height);

    if (processedCandles.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = `${14 * dpr}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Loading Quotex Market Stream...', width / 2, height / 2);
      return;
    }

    // Determine sub-chart height if RSI is shown
    const hasSubChart = indicators.showRsi;
    const subChartHeight = hasSubChart ? Math.min(height * 0.22, 120 * dpr) : 0;
    const mainChartHeight = height - subChartHeight;

    // Layout bounds
    const paddingRight = 75 * dpr; // Price scale area
    const paddingBottom = 26 * dpr; // Time scale area
    const plotWidth = width - paddingRight;
    const plotHeight = mainChartHeight - paddingBottom;

    // Slice visible candles
    const totalCount = processedCandles.length;
    const count = Math.min(visibleCount, totalCount);
    const endIndex = Math.max(0, totalCount - offsetRight);
    const startIndex = Math.max(0, endIndex - count);
    const visibleCandles = processedCandles.slice(startIndex, endIndex);

    if (visibleCandles.length === 0) return;

    // Determine min and max prices in visible window
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const c of visibleCandles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    // Include indicators in scale if visible
    if (indicators.showBollinger && bbValues) {
      for (let i = startIndex; i < endIndex; i++) {
        const u = bbValues.upper[i];
        const l = bbValues.lower[i];
        if (u !== null && u > maxPrice) maxPrice = u;
        if (l !== null && l < minPrice) minPrice = l;
      }
    }

    // Add 8% vertical padding
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.08;
    maxPrice += priceRange * 0.08;
    const adjustedRange = maxPrice - minPrice;

    // Coordinate converters
    const candleWidth = plotWidth / count;
    const candleSpacing = Math.max(1, candleWidth * 0.22);
    const bodyWidth = Math.max(2 * dpr, candleWidth - candleSpacing);

    const priceToY = (price: number) => {
      return plotHeight - ((price - minPrice) / adjustedRange) * plotHeight;
    };

    const yToPrice = (y: number) => {
      return maxPrice - (y / plotHeight) * adjustedRange;
    };

    // Draw Subtle Grid
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = '#151c28';

    // Horizontal price grid lines
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const y = (plotHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotWidth, y);
      ctx.stroke();

      // Right axis price label
      const price = yToPrice(y);
      ctx.fillStyle = '#475569';
      ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(price.toFixed(asset.precision), plotWidth + 8 * dpr, y);
    }

    // Vertical time grid lines
    const timeStep = Math.max(1, Math.floor(count / 6));
    for (let i = 0; i < visibleCandles.length; i += timeStep) {
      const c = visibleCandles[i];
      const x = i * candleWidth + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, plotHeight);
      ctx.stroke();

      // Time label on bottom axis
      const date = new Date(c.time * 1000);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      ctx.fillStyle = '#475569';
      ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(timeStr, x, plotHeight + 6 * dpr);
    }

    // Draw Bollinger Bands Channel if enabled
    if (indicators.showBollinger && bbValues) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < visibleCandles.length; i++) {
        const actualIdx = startIndex + i;
        const u = bbValues.upper[actualIdx];
        if (u !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(u);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const actualIdx = startIndex + i;
        const l = bbValues.lower[actualIdx];
        if (l !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Draw upper and lower lines
      const drawBand = (values: (number | null)[], color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < visibleCandles.length; i++) {
          const actualIdx = startIndex + i;
          const val = values[actualIdx];
          if (val !== null) {
            const x = i * candleWidth + candleWidth / 2;
            const y = priceToY(val);
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      };

      drawBand(bbValues.upper, '#38bdf8');
      drawBand(bbValues.middle, '#0ea5e9');
      drawBand(bbValues.lower, '#38bdf8');
    }

    // Draw SMA if enabled
    if (indicators.showSma && smaValues.length > 0) {
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const actualIdx = startIndex + i;
        const sma = smaValues[actualIdx];
        if (sma !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(sma);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    // Render Candles or Area Chart
    if (chartType === 'area') {
      // Area / Line Chart with gradient fill
      const areaGrad = ctx.createLinearGradient(0, 0, 0, plotHeight);
      areaGrad.addColorStop(0, 'rgba(0, 230, 118, 0.28)');
      areaGrad.addColorStop(0.5, 'rgba(0, 230, 118, 0.08)');
      areaGrad.addColorStop(1, 'rgba(0, 230, 118, 0.0)');

      ctx.beginPath();
      ctx.moveTo(candleWidth / 2, plotHeight);
      for (let i = 0; i < visibleCandles.length; i++) {
        const c = visibleCandles[i];
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(c.close);
        ctx.lineTo(x, y);
      }
      const lastX = (visibleCandles.length - 1) * candleWidth + candleWidth / 2;
      ctx.lineTo(lastX, plotHeight);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Main line stroke
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const c = visibleCandles[i];
        const x = i * candleWidth + candleWidth / 2;
        const y = priceToY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();
    } else if (chartType === 'bars') {
      // Bar Chart (OHLC bars)
      for (let i = 0; i < visibleCandles.length; i++) {
        const c = visibleCandles[i];
        const isUp = c.close >= c.open;
        const color = isUp ? '#00e676' : '#ff3344';
        const x = i * candleWidth + candleWidth / 2;

        const yHigh = priceToY(c.high);
        const yLow = priceToY(c.low);
        const yOpen = priceToY(c.open);
        const yClose = priceToY(c.close);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 * dpr;

        // Vertical bar from High to Low
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Left tick for Open
        ctx.beginPath();
        ctx.moveTo(x - bodyWidth / 2, yOpen);
        ctx.lineTo(x, yOpen);
        ctx.stroke();

        // Right tick for Close
        ctx.beginPath();
        ctx.moveTo(x, yClose);
        ctx.lineTo(x + bodyWidth / 2, yClose);
        ctx.stroke();
      }
    } else {
      // Standard Candlestick & Heikin-Ashi
      for (let i = 0; i < visibleCandles.length; i++) {
        const c = visibleCandles[i];
        const isUp = c.close >= c.open;
        const color = isUp ? '#00e676' : '#ff3344';
        const x = i * candleWidth + candleWidth / 2;

        const yHigh = priceToY(c.high);
        const yLow = priceToY(c.low);
        const yOpen = priceToY(c.open);
        const yClose = priceToY(c.close);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Candle Body
        const topY = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(1.5 * dpr, Math.abs(yClose - yOpen));

        ctx.fillStyle = color;
        ctx.fillRect(x - bodyWidth / 2, topY, bodyWidth, bodyHeight);
      }
    }

    // Latest Current Price Line across the chart
    const currentPrice = asset.price;
    const currentPriceY = priceToY(currentPrice);

    if (currentPriceY >= 0 && currentPriceY <= plotHeight) {
      // Horizontal dashed line
      ctx.save();
      ctx.setLineDash([4 * dpr, 3 * dpr]);
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, currentPriceY);
      ctx.lineTo(plotWidth, currentPriceY);
      ctx.stroke();
      ctx.restore();

      // Pulsing Current Price badge on the right axis
      const badgeHeight = 20 * dpr;
      const badgeWidth = paddingRight - 8 * dpr;
      const badgeX = plotWidth + 4 * dpr;
      const badgeY = currentPriceY - badgeHeight / 2;

      ctx.fillStyle = '#00e676';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 3 * dpr);
      ctx.fill();

      ctx.fillStyle = '#0a1017';
      ctx.font = `bold ${10 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentPrice.toFixed(asset.precision), badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

      // Latest forming candle countdown pill (Quotex signature!)
      if (visibleCandles.length > 0 && offsetRight < 10) {
        const lastCandleX = (visibleCandles.length - 1) * candleWidth + candleWidth / 2;
        const pillText = `00:${candleRemainingSeconds < 10 ? '0' : ''}${candleRemainingSeconds}`;
        const pillWidth = 46 * dpr;
        const pillHeight = 18 * dpr;
        const pillX = Math.min(plotWidth - pillWidth - 10 * dpr, lastCandleX + 10 * dpr);
        const pillY = Math.max(10 * dpr, Math.min(plotHeight - pillHeight - 10 * dpr, currentPriceY - pillHeight / 2));

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 3 * dpr);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pillText, pillX + pillWidth / 2, pillY + pillHeight / 2);
      }
    }

    // Draw Active Trades strike lines and countdown
    for (const trade of relevantTrades) {
      const strikeY = priceToY(trade.strikePrice);
      if (strikeY >= 0 && strikeY <= plotHeight) {
        const isCall = trade.direction === 'CALL';
        const inTheMoney = isCall ? currentPrice > trade.strikePrice : currentPrice < trade.strikePrice;
        const strikeColor = isCall ? '#00e676' : '#ff3344';

        // Dashed strike line
        ctx.save();
        ctx.setLineDash([6 * dpr, 3 * dpr]);
        ctx.strokeStyle = strikeColor;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(0, strikeY);
        ctx.lineTo(plotWidth, strikeY);
        ctx.stroke();
        ctx.restore();

        // Flag on strike line
        const flagText = `${trade.direction} $${trade.investment} (${inTheMoney ? '+$' + trade.potentialProfit : '-$' + trade.investment})`;
        ctx.font = `bold ${9 * dpr}px 'Plus Jakarta Sans', sans-serif`;
        const textMetrics = ctx.measureText(flagText);
        const flagW = textMetrics.width + 16 * dpr;
        const flagH = 20 * dpr;
        const flagX = 20 * dpr;
        const flagY = strikeY - flagH / 2;

        ctx.fillStyle = strikeColor;
        ctx.beginPath();
        ctx.roundRect(flagX, flagY, flagW, flagH, 3 * dpr);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(flagText, flagX + flagW / 2, flagY + flagH / 2);
      }
    }

    // Sub-Chart (RSI) if enabled
    if (hasSubChart) {
      const subPlotY = mainChartHeight;
      const subPlotHeight = subChartHeight - paddingBottom;

      // Sub-chart border separator
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, subPlotY);
      ctx.lineTo(width, subPlotY);
      ctx.stroke();

      // Sub-chart title
      ctx.fillStyle = '#64748b';
      ctx.font = `${10 * dpr}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`RSI (${indicators.rsiPeriod})`, 12 * dpr, subPlotY + 6 * dpr);

      // Overbought 70 and Oversold 30 levels
      const rsiToY = (val: number) => {
        return subPlotY + subPlotHeight - (val / 100) * subPlotHeight;
      };

      const y70 = rsiToY(70);
      const y30 = rsiToY(30);

      // Shaded 30-70 corridor
      ctx.fillStyle = 'rgba(147, 51, 234, 0.04)';
      ctx.fillRect(0, y70, plotWidth, y30 - y70);

      ctx.save();
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1 * dpr;

      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(plotWidth, y70);
      ctx.moveTo(0, y30);
      ctx.lineTo(plotWidth, y30);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#64748b';
      ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('70', plotWidth + 8 * dpr, y70);
      ctx.fillText('30', plotWidth + 8 * dpr, y30);

      // Draw RSI line
      ctx.strokeStyle = '#a855f7'; // Purple
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      let started = false;
      let lastRsiVal: number | null = null;

      for (let i = 0; i < visibleCandles.length; i++) {
        const actualIdx = startIndex + i;
        const val = rsiValues[actualIdx];
        if (val !== null && !isNaN(val)) {
          lastRsiVal = val;
          const x = i * candleWidth + candleWidth / 2;
          const y = rsiToY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      if (lastRsiVal !== null) {
        ctx.fillStyle = '#c084fc';
        ctx.fillText(lastRsiVal.toFixed(1), 75 * dpr, subPlotY + 6 * dpr);
      }
    }

    // Crosshair rendering
    if (crosshair && crosshair.x >= 0 && crosshair.x <= plotWidth && crosshair.y >= 0 && crosshair.y <= plotHeight) {
      ctx.save();
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1 * dpr;

      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(crosshair.x, 0);
      ctx.lineTo(crosshair.x, height);
      ctx.stroke();

      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(plotWidth, crosshair.y);
      ctx.stroke();
      ctx.restore();

      // Crosshair Price Tag on Right Axis
      const hoverPrice = yToPrice(crosshair.y);
      const chHeight = 18 * dpr;
      const chWidth = paddingRight - 8 * dpr;
      const chX = plotWidth + 4 * dpr;
      const chY = crosshair.y - chHeight / 2;

      ctx.fillStyle = '#334155';
      ctx.fillRect(chX, chY, chWidth, chHeight);
      ctx.fillStyle = '#f8fafc';
      ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hoverPrice.toFixed(asset.precision), chX + chWidth / 2, chY + chHeight / 2);

      // Crosshair Time Tag on bottom
      if (crosshair.candle) {
        const cDate = new Date(crosshair.candle.time * 1000);
        const cTimeStr = cDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const tw = 65 * dpr;
        const th = 18 * dpr;
        ctx.fillStyle = '#334155';
        ctx.fillRect(crosshair.x - tw / 2, plotHeight + 2 * dpr, tw, th);
        ctx.fillStyle = '#f8fafc';
        ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cTimeStr, crosshair.x, plotHeight + 2 * dpr + th / 2);
      }
    }
  }, [
    processedCandles,
    visibleCount,
    offsetRight,
    chartType,
    indicators,
    candleRemainingSeconds,
    activeTrades,
    asset,
    crosshair,
    smaValues,
    bbValues,
    rsiValues,
    relevantTrades,
  ]);

  // Handle Resize & Canvas scaling
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      renderChart();
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [renderChart]);

  // Re-render when dependencies change
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Mouse event handlers for Crosshair, Pan, and Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mouseX = (e.clientX - rect.left) * dpr;
    const mouseY = (e.clientY - rect.top) * dpr;

    if (isDraggingRef.current) {
      const deltaX = (e.clientX - dragStartXRef.current);
      const plotWidth = canvas.width - 75 * dpr;
      const candlesMoved = Math.round((deltaX / plotWidth) * visibleCount);
      const newOffset = Math.max(0, Math.min(processedCandles.length - visibleCount, startOffsetRef.current + candlesMoved));
      setOffsetRight(newOffset);
    } else {
      // Find hovered candle
      const plotWidth = canvas.width - 75 * dpr;
      const candleWidth = plotWidth / Math.min(visibleCount, processedCandles.length);
      const totalCount = processedCandles.length;
      const count = Math.min(visibleCount, totalCount);
      const endIndex = Math.max(0, totalCount - offsetRight);
      const startIndex = Math.max(0, endIndex - count);

      const candleIdx = Math.floor(mouseX / candleWidth);
      const actualCandle = processedCandles[startIndex + candleIdx] || null;

      setCrosshair({ x: mouseX, y: mouseY, candle: actualCandle });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    startOffsetRef.current = offsetRight;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setCrosshair(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom In
      setVisibleCount((prev) => Math.max(20, prev - 5));
    } else {
      // Zoom Out
      setVisibleCount((prev) => Math.min(180, prev + 5));
    }
  };

  const latestCandle = processedCandles[processedCandles.length - 1];

  return (
    <div ref={containerRef} className="relative w-full h-full select-none bg-[#0c1017] overflow-hidden">
      {/* Top Floating Quote & OHLC HUD */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-4 text-xs font-mono pointer-events-none bg-[#121824]/90 backdrop-blur-sm px-3 py-1.5 rounded border border-[#1e293b]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-100">{asset.symbol}</span>
          <span className={asset.change24h >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {asset.price.toFixed(asset.precision)}
          </span>
          <span className={asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
          </span>
        </div>

        {/* OHLC Bar Inspector */}
        {latestCandle && (
          <div className="hidden sm:flex items-center gap-3 text-slate-400 border-l border-slate-700/60 pl-3">
            <span>O: <span className="text-slate-200">{latestCandle.open.toFixed(asset.precision)}</span></span>
            <span>H: <span className="text-slate-200">{latestCandle.high.toFixed(asset.precision)}</span></span>
            <span>L: <span className="text-slate-200">{latestCandle.low.toFixed(asset.precision)}</span></span>
            <span>C: <span className="text-slate-200">{latestCandle.close.toFixed(asset.precision)}</span></span>
          </div>
        )}
      </div>

      {/* Top-Right Next Candle Signal Badge & Screenshot Button */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
        {nextCandleSignal && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono backdrop-blur-md shadow-lg ${
              nextCandleSignal.direction === 'CALL'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className={nextCandleSignal.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'} />
              <span className="font-bold">NEXT CANDLE:</span>
              <span className="font-extrabold px-1.5 py-0.5 rounded text-[11px] bg-black/40">
                {nextCandleSignal.direction === 'CALL' ? 'CALL (GREEN)' : 'PUT (RED)'}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="font-bold text-slate-100 hidden sm:inline">
              {nextCandleSignal.confidence}% Win Prob
            </span>
          </div>
        )}

        {/* Screenshot Button */}
        <button
          onClick={handleTakeScreenshot}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141b26]/90 hover:bg-[#1e2738] border border-[#233146] text-slate-200 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors shadow-lg"
          title="Download Chart Screenshot with Signal Overlay"
        >
          {copiedShot ? <Check size={13} className="text-emerald-400" /> : <Camera size={13} />}
          <span className="hidden sm:inline">{copiedShot ? 'Saved' : 'Screenshot'}</span>
        </button>
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute bottom-9 left-4 z-10 flex items-center gap-1 bg-[#121824]/90 backdrop-blur-sm p-1 rounded border border-[#1e293b]">
        <button
          onClick={() => setVisibleCount((prev) => Math.max(20, prev - 10))}
          className="px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setVisibleCount((prev) => Math.min(180, prev + 10))}
          className="px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            setOffsetRight(0);
            setVisibleCount(60);
          }}
          className="px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Reset to Real-Time"
        >
          Reset
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />
    </div>
  );
};
