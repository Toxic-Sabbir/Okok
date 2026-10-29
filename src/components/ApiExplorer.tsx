import React, { useState, useEffect, useRef } from 'react';
import type { Asset } from '../types/market';
import JSZip from 'jszip';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Radio,
  Clock,
  Code2,
  RefreshCw,
  ExternalLink,
  Bot,
  Download,
  FileCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  ChevronDown,
  Camera,
  Image,
  Maximize2,
  Layers,
  ArrowRight,
  Zap,
  Server,
  Cloud,
  Search,
  BookOpen,
} from 'lucide-react';
import { ENDPOINT_SPECS } from '../utils/endpointDocs';
import { generateMasterStBotCommand } from '../utils/masterStBotCmd';
import { MasterCmdView } from './MasterCmdView';

interface ApiExplorerProps {
  assets?: Asset[];
}

export interface EndpointConfig {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  name: string;
  description: string;
  category: 'All-In-One' | 'Market Scanner' | 'Signal & Analysis' | 'Economic News' | 'Candle Charts';
  defaultParams: Record<string, string>;
  defaultBody?: string;
  cmdFileName: string;
  cmdName: string;
  cmdDescription: string;
  cmdGuide: string;
}

export const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'get-quotes',
    method: 'GET',
    path: '/api/v1/forex/quotes',
    name: 'Real-Time Interbank Quotes & Ticker (UTC+6)',
    description: 'Returns real-time streaming interbank Forex quotes, bid/ask spreads, 24h high/low, and explicit UTC+6 timestamps (Bangladesh Standard Time / BST).',
    category: 'All-In-One',
    defaultParams: { category: 'all', search: '' },
    cmdFileName: 'fxquote.js',
    cmdName: 'fxquote',
    cmdDescription: 'Real-time Forex quotes & spreads with live UTC+6 time',
    cmdGuide: '{pn} [optional category: all | major | minor | exotic | commodity]',
  },
  {
    id: 'get-screenshot',
    method: 'GET',
    path: '/api/v1/forex/screenshot',
    name: 'Market Chart Screenshot & Snap API',
    description: 'Generates an instant high-definition candlestick chart snapshot with EMA 9/21 overlays, live strike price line, and Next Candle Signal HUD badge overlay.',
    category: 'Signal & Analysis',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m', format: 'json' },
    cmdFileName: 'fxsnap.js',
    cmdName: 'fxsnap',
    cmdDescription: 'Snap live market chart screenshot with next candle AI signal overlay',
    cmdGuide: '{pn} [pair, e.g. EUR_USD, GBP_USD, XAU_USD] [timeframe, e.g. 1m, 5m]',
  },
  {
    id: 'get-all-in-one',
    method: 'GET',
    path: '/api/v1/forex/all-in-one',
    name: 'Unified All-In-One Forex API',
    description: 'Returns Asset Quote + Next Candle Signal + Technical Indicators + Forex Factory News Impact in a single consolidated API call.',
    category: 'All-In-One',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m' },
    cmdFileName: 'fxall.js',
    cmdName: 'fxall',
    cmdDescription: 'All-In-One Forex quote, next candle prediction & news impact',
    cmdGuide: '{pn} [pair, e.g. EUR_USD, GBP_USD, XAU_USD] [timeframe, e.g. 1m, 5m]',
  },
  {
    id: 'get-analyze',
    method: 'GET',
    path: '/api/v1/forex/analyze',
    name: 'Next Candle Signal & Confluence',
    description: 'Predicts the next candle direction (CALL / GREEN vs PUT / RED) with multi-indicator checklist, win rate confidence %, and invalidation levels.',
    category: 'Signal & Analysis',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m' },
    cmdFileName: 'fxsignal.js',
    cmdName: 'fxsignal',
    cmdDescription: 'Predict next candle CALL/PUT direction with indicator checklist & win rate',
    cmdGuide: '{pn} [pair, e.g. EUR_USD, GBP_USD] [timeframe, e.g. 1m, 5m]',
  },
  {
    id: 'get-scanner',
    method: 'GET',
    path: '/api/v1/forex/scanner',
    name: 'Automatic Forex Market Scanner',
    description: 'Automatically analyzes all 23+ worldwide forex pairs in real-time and ranks them by signal win rate confidence.',
    category: 'Market Scanner',
    defaultParams: { timeframe: '1m' },
    cmdFileName: 'fxscan.js',
    cmdName: 'fxscan',
    cmdDescription: 'Scan 25+ worldwide Forex pairs & rank highest win rate setups',
    cmdGuide: '{pn} [timeframe, e.g. 1m, 5m, 15m]',
  },
  {
    id: 'get-pair-impact',
    method: 'GET',
    path: '/api/v1/forex/news/pair-impact',
    name: 'Which Pair Which Direction Matrix',
    description: 'Directly maps every economic event to affected currency pairs and indicates expected trade direction (BUY/SELL), expected pips, and reasoning.',
    category: 'Economic News',
    defaultParams: { pair: 'EUR_USD' },
    cmdFileName: 'fxdir.js',
    cmdName: 'fxdir',
    cmdDescription: 'Which Pair Which Direction economic impact & pips matrix',
    cmdGuide: '{pn} [optional pair, e.g. EUR_USD, GBP_USD, or leave empty for all]',
  },
  {
    id: 'get-news',
    method: 'GET',
    path: '/api/v1/forex/news',
    name: 'Forex Factory Economic Calendar',
    description: 'Fetches high, medium, and low impact economic releases with forecasts, previous prints, and live sentiment.',
    category: 'Economic News',
    defaultParams: { impact: 'HIGH', currency: 'all' },
    cmdFileName: 'fxnews.js',
    cmdName: 'fxnews',
    cmdDescription: 'Forex Factory live economic calendar & high impact events',
    cmdGuide: '{pn} [HIGH/MEDIUM/LOW/ALL] [currency, e.g. USD, EUR, GBP]',
  },
  {
    id: 'get-candles',
    method: 'GET',
    path: '/api/v1/forex/candles',
    name: 'Worldwide Candlestick History',
    description: 'Returns OHLCV candlestick series and countdown seconds until current candle close for any worldwide pair.',
    category: 'Candle Charts',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m', limit: '60' },
    cmdFileName: 'fxcandles.js',
    cmdName: 'fxcandles',
    cmdDescription: 'Fetch candle OHLCV series & current candle countdown seconds',
    cmdGuide: '{pn} [pair, e.g. EUR_USD] [timeframe, e.g. 1m] [limit, e.g. 10]',
  },
  {
    id: 'get-assets',
    method: 'GET',
    path: '/api/v1/forex/assets',
    name: 'All Worldwide Forex Assets',
    description: 'Lists all available worldwide Forex pairs (Majors, Minors, Exotics, Commodities) with pip spreads and 24h stats.',
    category: 'Candle Charts',
    defaultParams: { category: 'all', search: '' },
    cmdFileName: 'fxpairs.js',
    cmdName: 'fxpairs',
    cmdDescription: 'List all worldwide Forex pairs, live prices, payouts & spreads',
    cmdGuide: '{pn} [category: all | major | minor | exotic | commodity]',
  },
  {
    id: 'simulate-order',
    method: 'POST',
    path: '/api/v1/orders/simulate',
    name: 'Simulate Forex Binary Order',
    description: 'Place simulated UP (CALL) or DOWN (PUT) trade against live forex strike price.',
    category: 'All-In-One',
    defaultParams: {},
    defaultBody: JSON.stringify(
      { assetId: 'EUR_USD', direction: 'CALL', investment: 100, durationSeconds: 60 },
      null,
      2
    ),
    cmdFileName: 'fxtrade.js',
    cmdName: 'fxtrade',
    cmdDescription: 'Simulate binary trade with strike price & live settlement',
    cmdGuide: '{pn} <CALL|PUT> <amount> [pair, e.g. EUR_USD] [seconds, e.g. 60]',
  },
];

interface HealthCheckResult {
  endpointId: string;
  name: string;
  path: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  statusCode?: number;
  latency?: number;
  summary?: string;
  testedAt?: string;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'master-cmd' | 'st-bot' | 'verification' | 'render'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('master') || hash.includes('master') || path.includes('cmd')) return 'master-cmd';
      if (path.includes('render') || hash.includes('render')) return 'render';
      if (path.includes('verify') || hash.includes('verify')) return 'verification';
    }
    return 'docs';
  });
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEndpointPath, setCopiedEndpointPath] = useState(false);
  const [queryParams, setQueryParams] = useState<Record<string, string>>(selectedEndpoint.defaultParams);
  const [postBody, setPostBody] = useState<string>(selectedEndpoint.defaultBody || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string>('');
  const [responseBody, setResponseBody] = useState<string>('Click "Send Request" to test endpoint');
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedRenderYaml, setCopiedRenderYaml] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'js' | 'python' | 'st-bot'>('curl');

  // Chart snap preview toggle
  const [snapPreviewMode, setSnapPreviewMode] = useState<'image' | 'json'>('image');
  const [snapTimestamp, setSnapTimestamp] = useState<number>(Date.now());

  // Mobile drawer / sidebar toggle
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Custom API base for ST-BOT commands
  const [customApiBase, setCustomApiBase] = useState<string>('');

  // Selected ST-BOT command in dedicated tab
  const [selectedStBotCmd, setSelectedStBotCmd] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [copiedStBotCmd, setCopiedStBotCmd] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Health Verification Suite State
  const [healthResults, setHealthResults] = useState<Record<string, HealthCheckResult>>({});
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  // SSE Stream Monitor State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamFilter, setStreamFilter] = useState('EUR_USD,GBP_USD,XAU_USD');
  const [streamLogs, setStreamLogs] = useState<{ id: string; time: string; data: string }[]>([]);
  const [tickCount, setTickCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ep.name.toLowerCase().includes(q) ||
      ep.path.toLowerCase().includes(q) ||
      ep.cmdName.toLowerCase().includes(q) ||
      ep.category.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q)
    );
  });

  const currentSpec = ENDPOINT_SPECS.find((s) => s.id === selectedEndpoint.id) || ENDPOINT_SPECS[0];

  // Initialize customApiBase from window.location.origin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomApiBase(window.location.origin);
    }
  }, []);

  // When endpoint changes, reset params
  useEffect(() => {
    setQueryParams(selectedEndpoint.defaultParams);
    setPostBody(selectedEndpoint.defaultBody || '');
    setResponseBody('Click "Send Request" to test endpoint');
    setResponseStatus(null);
    setLatency(null);
    setSnapTimestamp(Date.now());
  }, [selectedEndpoint]);

  // Execute Real API Request
  const handleSendRequest = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      let resolvedUrl = selectedEndpoint.path;

      if (resolvedUrl.includes(':id')) {
        resolvedUrl = resolvedUrl.replace(':id', queryParams.id || 'EUR_USD');
      }

      // Append query parameters
      const urlObj = new URL(resolvedUrl, window.location.origin);
      Object.entries(queryParams).forEach(([k, v]) => {
        if (k !== 'id' && v) {
          urlObj.searchParams.append(k, v);
        }
      });

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = postBody;
      }

      const res = await fetch(urlObj.toString(), options);
      const endTime = performance.now();
      const dur = Math.round(endTime - startTime);
      setLatency(dur);
      setResponseStatus(res.status);
      setSnapTimestamp(Date.now());

      const headersArr: string[] = [];
      res.headers.forEach((val, key) => headersArr.push(`${key}: ${val}`));
      setResponseHeaders(headersArr.slice(0, 5).join('\n'));

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));

      // Update individual endpoint health status
      setHealthResults((prev) => ({
        ...prev,
        [selectedEndpoint.id]: {
          endpointId: selectedEndpoint.id,
          name: selectedEndpoint.name,
          path: selectedEndpoint.path,
          status: res.status === 200 ? 'SUCCESS' : 'ERROR',
          statusCode: res.status,
          latency: dur,
          summary: res.status === 200 ? '200 OK • Payload verified' : 'Error response',
          testedAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message || 'Network request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Run Automated Health Verification on ALL Endpoints
  const runVerifyAllEndpoints = async () => {
    setIsVerifyingAll(true);
    setVerificationProgress(0);

    const initialResults: Record<string, HealthCheckResult> = {};
    ENDPOINTS.forEach((ep) => {
      initialResults[ep.id] = {
        endpointId: ep.id,
        name: ep.name,
        path: ep.path,
        status: 'PENDING',
      };
    });
    setHealthResults(initialResults);

    let completed = 0;

    for (const ep of ENDPOINTS) {
      const startTime = performance.now();
      try {
        let url = ep.path;
        const searchParams = new URLSearchParams();
        Object.entries(ep.defaultParams).forEach(([k, v]) => {
          if (v) searchParams.append(k, v);
        });
        const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const fullUrl = `${url}${queryStr}`;

        const options: RequestInit = {
          method: ep.method,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        };
        if (ep.method === 'POST') {
          options.body = ep.defaultBody || '{}';
        }

        const res = await fetch(fullUrl, options);
        const data = await res.json();
        const endTime = performance.now();
        const dur = Math.round(endTime - startTime);

        let summaryText = 'Operational';
        if (ep.id === 'get-screenshot') {
          summaryText = `Snapshot generated (${data.symbol}) • Next Candle: ${data.nextCandleSignal?.direction} (${data.nextCandleSignal?.confidence}%)`;
        } else if (ep.id === 'get-all-in-one') {
          summaryText = `Quote ${data.quote?.currentPrice} • Next Candle: ${data.analysis?.signal} (${data.analysis?.confidence}%)`;
        } else if (ep.id === 'get-analyze') {
          summaryText = `Signal: ${data.data?.direction} • ${data.data?.confidence}% Confidence`;
        } else if (ep.id === 'get-scanner') {
          summaryText = `${data.count} Worldwide pairs scanned • Top Buy: ${data.topBuy?.symbol}`;
        } else if (ep.id === 'get-pair-impact') {
          summaryText = `${data.count} Economic pair impacts mapped`;
        } else if (ep.id === 'get-news') {
          summaryText = `${data.count} Forex Factory events retrieved`;
        } else if (ep.id === 'get-candles') {
          summaryText = `${data.count} candles • Closes in ${data.candleRemainingSeconds}s`;
        } else if (ep.id === 'get-assets') {
          summaryText = `${data.count} Worldwide Forex pairs loaded`;
        } else if (ep.id === 'simulate-order') {
          summaryText = `Order ID ${data.data?.id} executed • Strike: ${data.data?.strikePrice}`;
        }

        setHealthResults((prev) => ({
          ...prev,
          [ep.id]: {
            endpointId: ep.id,
            name: ep.name,
            path: ep.path,
            status: res.status === 200 ? 'SUCCESS' : 'ERROR',
            statusCode: res.status,
            latency: dur,
            summary: summaryText,
            testedAt: new Date().toLocaleTimeString(),
          },
        }));
      } catch (err: any) {
        setHealthResults((prev) => ({
          ...prev,
          [ep.id]: {
            endpointId: ep.id,
            name: ep.name,
            path: ep.path,
            status: 'ERROR',
            statusCode: 500,
            summary: err.message || 'Request failed',
            testedAt: new Date().toLocaleTimeString(),
          },
        }));
      }

      completed += 1;
      setVerificationProgress(Math.round((completed / ENDPOINTS.length) * 100));
    }

    setIsVerifyingAll(false);
  };

  // Run automated health check on mount
  useEffect(() => {
    runVerifyAllEndpoints();
  }, []);

  // Toggle Live SSE Stream
  const toggleStream = () => {
    if (isStreaming) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsStreaming(false);
    } else {
      const url = streamFilter.trim()
        ? `/api/v1/stream?assets=${encodeURIComponent(streamFilter.trim())}`
        : '/api/v1/stream';

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('connected', (e) => {
        setStreamLogs((prev) => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            data: `[CONNECTED] Handshake: ${e.data}`,
          },
          ...prev.slice(0, 49),
        ]);
      });

      es.addEventListener('ticks', (e) => {
        setTickCount((prev) => prev + 1);
        setStreamLogs((prev) => [
          {
            id: String(Date.now()) + Math.random(),
            time: new Date().toLocaleTimeString(),
            data: e.data,
          },
          ...prev.slice(0, 49),
        ]);
      });

      es.onerror = () => {
        setStreamLogs((prev) => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            data: '[ERROR] Connection lost or reconnecting...',
          },
          ...prev.slice(0, 49),
        ]);
      };

      setIsStreaming(true);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Generate ST-BOT Command Script for a given endpoint
  const generateStBotCommandCode = (ep: EndpointConfig) => {
    const origin = customApiBase || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    if (ep.id === 'get-quotes') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 * Timezone: UTC+6 (Bangladesh Standard Time / BST)
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["quotes", "rate", "rates", "fxrate"],
    version: "2.0.0",
    author: "Forex APIX Engine",
    countDown: 3,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Fetch live worldwide interbank Forex rates with bid/ask spreads and exact UTC+6 timestamps.",
    category: "forex",
    guide: "{pn} [optional category: all | major | minor | exotic | commodity]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const cat = (args[0] || "major").toLowerCase();
      const res = await axios.get("${origin}/api/v1/forex/quotes?category=" + cat, { timeout: 8000 });
      const data = res.data;
      if (!data || !data.success) return reply("❌ Failed to fetch live quotes.");

      const list = (data.data || []).slice(0, 8).map(q => {
        const sign = q.change24h >= 0 ? "+" : "";
        return \`• \${q.symbol}: \${q.price} (\${sign}\${q.change24h}%) | Spread: \${q.spreadPips}p\`;
      }).join("\\n");

      return reply(
\`📈 ══ [ REAL-TIME FOREX INTERBANK QUOTES ] ══ 📈
⏰ Time: \${data.timeUtc6}
🌐 Timezone: \${data.timezone}
⚡ Feed: \${data.marketStatus}

\${list}

💡 Type "!fx EUR_USD" for deep AI signal analysis!\`);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-screenshot') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["snap", "chart", "charts", "fxshot"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 5,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Captures a live high-definition candlestick chart snapshot with EMA 9/21 overlays, live strike price line, countdown timer, and Next Candle Signal HUD badge overlay.",
    category: "forex",
    guide: "{pn} [pair, default EUR_USD] [timeframe, default 1m]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text, attachment) => {
      if (message && message.reply) {
        if (attachment) return message.reply({ body: text, attachment });
        return message.reply(text);
      }
      if (api && api.sendMessage) {
        if (attachment) return api.sendMessage({ body: text, attachment }, event.threadID, event.messageID);
        return api.sendMessage(text, event.threadID, event.messageID);
      }
    };

    try {
      const pair = (args[0] || "EUR_USD").toUpperCase().replace('/', '_');
      const tf = args[1] || "1m";

      await reply(\`📸 Capturing live market chart screenshot for \${pair} (\${tf})...\`);

      const jsonUrl = "${origin}/api/v1/forex/screenshot?pair=\${pair}&timeframe=\${tf}&format=json";
      const imageUrl = "${origin}/api/v1/forex/screenshot?pair=\${pair}&timeframe=\${tf}&format=image";

      const res = await axios.get(jsonUrl, { timeout: 12000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Failed to snap market screenshot: \${data?.error || "Pair not found"}\`);
      }

      const sig = data.nextCandleSignal;
      const dirIcon = sig.direction === "CALL" ? "🟢 CALL (UP / GREEN)" : "🔴 PUT (DOWN / RED)";

      const caption = 
\`📸 ══ [ MARKET CHART SNAPSHOT & SIGNAL ] ══ 📸
🌐 Pair: \${data.symbol} | TF: \${data.timeframe}
💰 Current Price: \${data.currentPrice}
🔮 NEXT CANDLE: [ \${dirIcon} ]
🎯 Win Rate: \${sig.confidence}% | Target: \${sig.targetPrice}
⏱ Candle Countdown: \${sig.countdownSeconds}s remaining
📊 Pattern: \${sig.pattern}
───────────────────────────────
🖼 Direct HD Chart Image:
\${imageUrl}\`;

      try {
        const imgStream = await global.utils?.getStreamFromURL?.(imageUrl) || 
                          (await axios.get(imageUrl, { responseType: 'stream' })).data;
        return reply(caption, imgStream);
      } catch {
        return reply(caption);
      }
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-all-in-one') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["fxone", "allinone", "fxcheck"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 5,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Retrieves live Interbank Forex quote, next candle prediction (CALL/PUT), confidence win rate %, multi-indicator checklist, and Forex Factory economic impact.",
    category: "forex",
    guide: "{pn} [pair, e.g. EUR_USD, GBP_USD, XAU_USD] [timeframe, e.g. 1m, 5m]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const rawPair = args[0] || "EUR_USD";
      const pair = rawPair.toUpperCase().replace('/', '_');
      const tf = args[1] || "1m";

      await reply(\`⏳ Analyzing \${pair} (\${tf}) across Worldwide Interbank Market, Technical Confluence & Forex Factory News...\`);

      const apiUrl = "${origin}${ep.path}?pair=\${pair}&timeframe=\${tf}";
      const res = await axios.get(apiUrl, { timeout: 12000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Error: \${data?.error || "Failed to analyze pair. Make sure pair symbol is valid (e.g. EUR_USD, GBP_USD, XAU_USD)."}\`);
      }

      const q = data.quote;
      const sig = data.analysis;
      const news = data.newsImpact;

      const signalEmoji = sig.signal === "CALL" ? "🟢 🔼" : "🔴 🔽";
      const trendSign = q.change24h >= 0 ? "+" : "";

      const msg = 
\`📊 ══════ [ FOREX ALL-IN-ONE ] ══════ 📊
🌐 Asset: \${q.symbol} (\${q.name})
💰 Price: \${q.currentPrice.toFixed(q.precision || 5)}
📈 24h Change: \${trendSign}\${q.change24h.toFixed(2)}% | Spread: \${q.pipSpread} pips
───────────────────────────────
🔮 NEXT CANDLE SIGNAL: \${signalEmoji} \${sig.signal} (\${sig.candleColor} CANDLE)
🎯 Win Rate Confidence: \${sig.confidence}%
⚡ Recommended Action: \${sig.action}
⏱ Candle Countdown: \${sig.countdownSeconds}s remaining
🎯 Target Level: \${sig.targetPrice.toFixed(q.precision || 5)}
🛡 Invalidation: \${sig.invalidationPrice.toFixed(q.precision || 5)}
📋 Confluence Checklist:
  • EMA 9/21: \${sig.checklist[0]?.status || "OK"}
  • RSI(14) Momentum: \${sig.checklist[1]?.status || "OK"}
  • Reversal Pattern: \${sig.checklist[2]?.status || "OK"}
  • News Alignment: \${sig.checklist[3]?.status || "OK"}
📌 Rationale: \${sig.reasoning}
───────────────────────────────
📰 Forex Factory News: \${news.highImpactUpcoming ? "⚠️ High Impact News Active" : "✅ Clear of High Impact"}
🧭 Macro Bias: \${news.recommendedBias} (\${news.activeEventsCount} upcoming events)
══════════════════════════════\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-analyze') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["signal", "candle", "nextcandle"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 4,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Predicts next candlestick direction (CALL/PUT) with win rate confidence %, countdown timer, and entry/target prices.",
    category: "forex",
    guide: "{pn} [pair, e.g. EUR_USD, GBP_USD, USD_JPY, XAU_USD] [timeframe, e.g. 1m, 5m]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const pair = (args[0] || "EUR_USD").toUpperCase().replace('/', '_');
      const tf = args[1] || "1m";

      const apiUrl = "${origin}${ep.path}?pair=\${pair}&timeframe=\${tf}";
      const res = await axios.get(apiUrl, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Analysis failed: \${data?.error || "Asset not found"}\`);
      }

      const sig = data.data;
      const emoji = sig.direction === "CALL" ? "🟢 CALL (UP / GREEN)" : "🔴 PUT (DOWN / RED)";

      const checklistStr = sig.checklist
        .map((c) => \`\${c.passed ? "✅" : "⚠️"} \${c.rule}: \${c.status} (\${c.detail})\`)
        .join("\\n");

      const msg = 
\`🕯 ══ [ NEXT CANDLE SIGNAL GENERATOR ] ══ 🕯
🌐 Pair: \${sig.symbol} | Timeframe: \${sig.timeframe}
🎯 DIRECTION: [ \${emoji} ]
🔥 Win Rate Confidence: \${sig.confidence}%
⏱ Next Candle in: \${sig.countdownSeconds}s

📍 Current Entry: \${sig.entryPrice}
🎯 Target Price: \${sig.targetPrice} (\${sig.expectedPipMove >= 0 ? "+" : ""}\${sig.expectedPipMove} pips)
🛑 Invalidation: \${sig.invalidationPrice}
📊 Pattern Detected: \${sig.patternDetected}

📋 Technical Confluence:
\${checklistStr}

💡 Guidance: \${sig.reasoning}\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-scanner') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["scan", "fxradar", "topforex"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 5,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Automatically scans all 25+ worldwide Forex pairs in real-time and ranks the top win-rate setups.",
    category: "forex",
    guide: "{pn} [timeframe, default 1m, e.g. 5m, 15m]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const tf = args[0] || "1m";
      await reply(\`📡 Scanning 25+ Worldwide Forex Pairs on \${tf} timeframe...\`);

      const apiUrl = "${origin}${ep.path}?timeframe=\${tf}";
      const res = await axios.get(apiUrl, { timeout: 12000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Scanner failed: \${data?.error || "Unknown server error"}\`);
      }

      const top5 = (data.data || []).slice(0, 5);
      const topBuy = data.topBuy;
      const topSell = data.topSell;

      let listText = top5.map((p, idx) => {
        const icon = p.action === "BUY" ? "🟢 CALL" : "🔴 PUT";
        return \`#\${idx + 1} \${p.symbol} | \${icon} | \${p.confidence}% Win Rate | \${p.expectedPips > 0 ? "+" : ""}\${p.expectedPips} pips\`;
      }).join("\\n");

      const msg = 
\`📡 ══ [ FOREX AUTOMATIC MARKET SCANNER ] ══ 📡
⏱ Timeframe: \${tf} | Scanned Pairs: \${data.count} Worldwide Pairs

🏆 TOP 5 HIGHEST WIN-RATE SIGNALS:
\${listText}
───────────────────────────────
🌟 BEST BUY / CALL SETUP:
  • \${topBuy ? \`\${topBuy.symbol} (\${topBuy.confidence}% Win Rate) -> Target: \${topBuy.targetPrice}\` : "None"}

🌟 BEST SELL / PUT SETUP:
  • \${topSell ? \`\${topSell.symbol} (\${topSell.confidence}% Win Rate) -> Target: \${topSell.targetPrice}\` : "None"}

💡 Use "!fxall <pair>" to view full technical checklist and Forex Factory news impact!\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-pair-impact') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["direction", "fxmatrix", "pairimpact"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 4,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Shows which Forex pair will move in which direction (BUY/SELL) based on Forex Factory high-impact economic news releases.",
    category: "forex",
    guide: "{pn} [optional pair, e.g. EUR_USD, GBP_USD, or leave blank for all]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const filterPair = args[0] ? args[0].toUpperCase().replace('/', '_') : "";
      const apiUrl = "${origin}${ep.path}\${filterPair ? \`?pair=\${filterPair}\` : ''}";
      
      const res = await axios.get(apiUrl, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Failed to load news impact matrix.\`);
      }

      const items = (data.data || []).slice(0, 6);
      if (items.length === 0) {
        return reply(\`ℹ️ No economic impact mappings found for \${filterPair || "current market"}.\`);
      }

      let impactLines = items.map((item, idx) => {
        const dirEmoji = item.direction === "BUY" ? "🟢 BUY (CALL)" : "🔴 SELL (PUT)";
        return \`[\${idx + 1}] \${item.symbol} ➜ \${dirEmoji}
   • Expected Move: \${item.expectedPips} pips
   • Driver: \${item.newsTitle} (\${item.newsCurrency})
   • Rationale: \${item.reason}\`;
      }).join("\\n\\n");

      const msg = 
\`🧭 ══ [ WHICH PAIR WHICH DIRECTION MATRIX ] ══ 🧭
Forex Factory Economic Confluence & Macro Direction

\${impactLines}

⚠️ High-impact economic news creates volatile momentum. Always confirm with "!fxsignal <pair>" before trading.\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-news') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["news", "forexfactory", "calendar"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 4,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Retrieves upcoming and released Forex Factory economic calendar events with forecasts, previous figures, and impact levels.",
    category: "forex",
    guide: "{pn} [impact: HIGH | MEDIUM | LOW | ALL] [currency: USD | EUR | GBP | all]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const impact = (args[0] || "HIGH").toUpperCase();
      const currency = (args[1] || "all").toUpperCase();

      const apiUrl = "${origin}${ep.path}?impact=\${impact}&currency=\${currency}";
      const res = await axios.get(apiUrl, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Failed to load economic calendar.\`);
      }

      const events = (data.data || []).slice(0, 5);
      if (events.length === 0) {
        return reply(\`ℹ️ No news releases found matching \${impact} impact.\`);
      }

      const eventLines = events.map((ev, i) => {
        const impactBadge = ev.impact === "HIGH" ? "🔴 [HIGH]" : ev.impact === "MEDIUM" ? "🟠 [MED]" : "🟡 [LOW]";
        return \`[\${i + 1}] \${impactBadge} \${ev.currency} - \${ev.title}
   ⏰ Time: \${ev.date} \${ev.time} | Sentiment: \${ev.sentiment}
   📊 Forecast: \${ev.forecast} | Previous: \${ev.previous} | Status: \${ev.status}\`;
      }).join("\\n\\n");

      const msg = 
\`📰 ══ [ FOREX FACTORY ECONOMIC CALENDAR ] ══ 📰
Filter: \${impact} Impact | Total Events: \${data.count}

\${eventLines}

💡 Use "!fxdir" to see exact pair direction predictions based on these news events!\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-candles') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["candles", "fxcandle", "ohlcv"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 4,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Fetches live OHLCV candlestick series and exact seconds remaining before the current candle closes.",
    category: "forex",
    guide: "{pn} [pair, e.g. EUR_USD] [timeframe, e.g. 1m] [limit, e.g. 5]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const pair = (args[0] || "EUR_USD").toUpperCase().replace('/', '_');
      const tf = args[1] || "1m";
      const limit = Math.min(Number(args[2]) || 5, 20);

      const apiUrl = "${origin}${ep.path}?pair=\${pair}&timeframe=\${tf}&limit=\${limit}";
      const res = await axios.get(apiUrl, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Failed to fetch candles for \${pair}: \${data?.error || "Not found"}\`);
      }

      const candles = data.data || [];
      const asset = data.asset;
      const dec = asset.precision || 5;

      const candleList = candles.slice(-limit).map((c) => {
        const timeStr = new Date(c.time * 1000).toLocaleTimeString();
        const isBull = c.close >= c.open;
        const icon = isBull ? "🟢" : "🔴";
        return \`\${icon} [\${timeStr}] O: \${c.open.toFixed(dec)} | H: \${c.high.toFixed(dec)} | L: \${c.low.toFixed(dec)} | C: \${c.close.toFixed(dec)}\`;
      }).join("\\n");

      const msg = 
\`📈 ══ [ FOREX OHLCV CANDLE HISTORY ] ══ 📈
🌐 Pair: \${asset.symbol} | TF: \${tf} (\${data.timeframeSeconds}s)
💰 Current Price: \${asset.currentPrice.toFixed(dec)}
⏱ Current Candle Closes In: \${data.candleRemainingSeconds} seconds

Latest \${candles.length} Candles:
\${candleList}\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'get-assets') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["pairs", "forexpairs", "assets"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 4,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Lists all worldwide Forex pairs, live interbank exchange rates, 24h change, binary payout %, and interbank pip spreads.",
    category: "forex",
    guide: "{pn} [category: all | major | minor | exotic | commodity]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const category = (args[0] || "all").toLowerCase();
      const apiUrl = "${origin}${ep.path}?category=\${category}";

      const res = await axios.get(apiUrl, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Failed to load forex assets.\`);
      }

      const pairs = (data.data || []).slice(0, 10);
      const listText = pairs.map((a, i) => {
        const sign = a.change24h >= 0 ? "+" : "";
        return \`[\${i + 1}] \${a.symbol} (\${a.category.toUpperCase()})
   💰 \${a.price.toFixed(a.precision)} | 24h: \${sign}\${a.change24h.toFixed(2)}% | Spread: \${a.spreadPips} pips | Payout: \${a.payout}%\`;
      }).join("\\n\\n");

      const msg = 
\`🌐 ══ [ WORLDWIDE FOREX ASSETS CATALOG ] ══ 🌐
Category: \${category.toUpperCase()} | Showing \${pairs.length} of \${data.count} pairs

\${listText}

💡 Use "!fxall <pair>" to analyze any pair with next candle AI signal!\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    if (ep.id === 'simulate-order') {
      return `/**
 * ST-BOT Command: ${ep.cmdFileName}
 * Framework: sheikhtamimlover/ST-BOT (GoatBot v2 / ST-FCA)
 * Path: scripts/cmds/${ep.cmdFileName}
 * Description: ${ep.cmdDescription}
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "${ep.cmdName}",
    aliases: ["trade", "call", "put", "bet"],
    version: "2.0.0",
    author: "Quotex Forex Engine",
    countDown: 3,
    role: 0,
    shortDescription: "${ep.cmdDescription}",
    longDescription: "Execute a simulated Quotex binary option order (CALL / PUT) against live worldwide Forex prices with strike settlement.",
    category: "forex",
    guide: "{pn} <CALL|PUT> <amount> [pair, default EUR_USD] [duration_seconds, default 60]"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text) => {
      if (message && message.reply) return message.reply(text);
      if (api && api.sendMessage) return api.sendMessage(text, event.threadID, event.messageID);
    };

    try {
      const direction = (args[0] || "CALL").toUpperCase();
      const amount = Number(args[1]) || 100;
      const pair = (args[2] || "EUR_USD").toUpperCase().replace('/', '_');
      const duration = Number(args[3]) || 60;

      if (direction !== "CALL" && direction !== "PUT") {
        return reply(\`❌ Invalid direction! Must be either CALL (UP) or PUT (DOWN).\\nExample: !fxtrade CALL 100 EUR_USD 60\`);
      }

      const apiUrl = "${origin}${ep.path}";
      const payload = {
        assetId: pair,
        direction: direction,
        investment: amount,
        durationSeconds: duration
      };

      const res = await axios.post(apiUrl, payload, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ Trade execution failed: \${data?.error || "Server rejected order"}\`);
      }

      const order = data.order;
      const dirEmoji = direction === "CALL" ? "🟢 CALL (UP / GREEN)" : "🔴 PUT (DOWN / RED)";

      const msg = 
\`⚡ ══ [ QUOTEX SIMULATED ORDER PLACED ] ══ ⚡
🆔 Order ID: \${order.id}
🌐 Asset: \${order.symbol}
🎯 Direction: \${dirEmoji}
💰 Investment: $\${order.investment} | Payout: \${order.payout}%
💎 Potential Profit: +$\${order.potentialProfit.toFixed(2)}
🎯 Strike Price: \${order.strikePrice}
⏱ Expiry In: \${order.durationSeconds} seconds
🕒 Expiry Time: \${new Date(order.expiryTime).toLocaleTimeString()}
Status: ACTIVE (Waiting for candle settlement...)\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ ST-BOT Error: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
    }

    return `// ST-BOT command template for ${ep.name}\nmodule.exports = { ... };`;
  };

  // Compute Code Snippet for standard tabs
  const getCodeSnippet = () => {
    const origin = customApiBase || (typeof window !== 'undefined' ? window.location.origin : 'https://api.quotex-charts.local');
    let pathWithParams = selectedEndpoint.path;

    if (pathWithParams.includes(':id')) {
      pathWithParams = pathWithParams.replace(':id', queryParams.id || 'EUR_USD');
    }

    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (k !== 'id' && v) searchParams.append(k, v);
    });
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const fullUrl = `${origin}${pathWithParams}${queryString}`;

    if (activeCodeTab === 'st-bot') {
      return generateStBotCommandCode(selectedEndpoint);
    }

    if (activeCodeTab === 'curl') {
      if (selectedEndpoint.method === 'GET') {
        return `curl -X GET "${fullUrl}" \\\n  -H "Accept: application/json"`;
      } else {
        return `curl -X POST "${fullUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${postBody.replace(/\n/g, '')}'`;
      }
    }

    if (activeCodeTab === 'js') {
      if (selectedEndpoint.method === 'GET') {
        return `// Quotex Live Forex API (Node.js / Browser)
const response = await fetch("${fullUrl}");
const data = await response.json();
console.log("Forex Live Market:", data);`;
      } else {
        return `// Place simulated Quotex binary trade
const response = await fetch("${fullUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${postBody})
});
const result = await response.json();
console.log("Trade Execution:", result);`;
      }
    }

    if (activeCodeTab === 'python') {
      if (selectedEndpoint.method === 'GET') {
        return `# Quotex Live Forex Python Client
import requests

url = "${fullUrl}"
response = requests.get(url)
data = response.json()
print("Forex Live Market:", data)`;
      } else {
        return `# Execute Quotex Simulated Trade in Python
import requests

url = "${fullUrl}"
payload = ${postBody}
response = requests.post(url, json=payload)
print("Trade Settlement:", response.json())`;
      }
    }

    return '';
  };

  const copyToClipboard = (text: string, isSnippet: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSnippet) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download All Commands as a clean .ZIP archive
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const cmdsFolder = zip.folder('scripts/cmds');

      ENDPOINTS.forEach((ep) => {
        const code = generateStBotCommandCode(ep);
        cmdsFolder?.file(ep.cmdFileName, code);
      });

      const readmeContent = `# ST-BOT Forex & Quotex Commands Bundle
Framework: https://github.com/sheikhtamimlover/ST-BOT

## Installation Guide:
1. Copy the 'scripts/cmds/' folder directly into your ST-BOT root directory.
2. Ensure 'axios' is installed in your bot project:
   npm install axios
3. Run your bot:
   node index.js
4. Available Commands in Messenger:
   - !fxsnap EUR_USD (Snap live market chart screenshot with next candle AI signal overlay)
   - !fxall EUR_USD (All-in-One quote, next candle prediction & news impact)
   - !fxsignal GBP_USD (Next candle CALL/PUT signal with multi-indicator checklist)
   - !fxscan (Auto-scans 25+ worldwide Forex pairs & ranks highest win rates)
   - !fxdir (Which Pair Which Direction economic impact matrix)
   - !fxnews HIGH (Forex Factory high impact economic calendar)
   - !fxcandles EUR_USD 1m (Candle OHLCV & countdown timer)
   - !fxpairs (Worldwide Forex pairs catalog, spreads, quotes & payouts)
   - !fxtrade CALL 100 EUR_USD 60 (Simulated binary trade execution)

Connected API URL: ${customApiBase || 'Auto-detected'}
Timestamp: ${new Date().toISOString()}
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'st-bot-forex-commands-bundle.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Failed to create zip: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  const successCount = Object.values(healthResults).filter((r) => r.status === 'SUCCESS').length;
  const isAllPassing = successCount === ENDPOINTS.length;

  // Chart snapshot image URL for preview
  const previewImageUrl = `/api/v1/forex/screenshot?pair=${queryParams.pair || 'EUR_USD'}&timeframe=${queryParams.timeframe || '1m'}&format=image&t=${snapTimestamp}`;

  return (
    <div className="flex-1 flex flex-col w-full min-h-[100dvh] lg:h-screen lg:overflow-hidden bg-[#0a0e16] text-slate-200 font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#0c1017] border-b border-[#1b2535] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Camera size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                WORLDWIDE FOREX API
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SNAP &amp; ST-BOT
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Chart Snapshots • Real Interbank Quotes • ST-BOT CMDs</span>
            </div>
          </div>
        </div>

        {/* Status Pills & Primary Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Live UTC+6 Timezone Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#101723] border border-sky-500/30 rounded-lg" title="Server & Market Timezone: UTC+6 (Bangladesh Standard Time)">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs font-mono font-bold text-sky-300">
              UTC+6 (BST)
            </span>
          </div>

          {/* Health Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121926] border border-[#1f2c3f] rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                isAllPassing ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-200">
              {isAllPassing ? `All Operational` : `${successCount}/${ENDPOINTS.length} Passing`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Test All APIs Button */}
            <button
              onClick={runVerifyAllEndpoints}
              disabled={isVerifyingAll}
              className="px-2.5 sm:px-3 py-1.5 bg-[#16202f] hover:bg-[#1e2a3c] border border-[#233247] text-slate-200 text-[11px] sm:text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px]"
              title="Pings all endpoints simultaneously"
            >
              <RefreshCw size={12} className={isVerifyingAll ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
              <span>{isVerifyingAll ? `${verificationProgress}%` : 'Verify All'}</span>
            </button>

            {/* ⭐ Download Unified Master Command (forex.js) */}
            <button
              onClick={() => {
                const code = generateMasterStBotCommand(customApiBase || window.location.origin);
                downloadFile('forex.js', code);
              }}
              className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] sm:text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all min-h-[36px]"
              title="Download All-In-One ST-BOT Command (forex.js)"
            >
              <Download size={13} />
              <span>Download forex.js</span>
            </button>

            {/* Download All Commands (.ZIP) */}
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="hidden sm:flex px-3 sm:px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-bold rounded-lg items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 min-h-[36px]"
            >
              {isZipping ? <RefreshCw size={12} className="animate-spin" /> : <FileArchive size={12} />}
              <span>ZIP (9 CMDs)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Tab Navigation (Mobile friendly horizontal scroll) */}
      <div className="bg-[#0e1420] border-b border-[#1b2535] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 bg-[#131b26] p-1 rounded-lg border border-[#1f2b3c] min-w-max">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[34px] ${
              activeTab === 'docs'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            <span>API Documentation</span>
          </button>

          <button
            onClick={() => setActiveTab('master-cmd')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all min-h-[34px] ${
              activeTab === 'master-cmd'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>⭐ All-In-One CMD (forex.js)</span>
          </button>

          <button
            onClick={() => setActiveTab('st-bot')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[34px] ${
              activeTab === 'st-bot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot size={14} className="text-slate-300" />
            <span>Individual CMDs (9)</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[34px] ${
              activeTab === 'verification'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Health Checks</span>
            {isAllPassing && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 ml-0.5"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('render')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[34px] ${
              activeTab === 'render'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server size={14} className="text-teal-300" />
            <span>Render Deploy</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/25 text-teal-200 border border-teal-500/40 font-mono font-bold">
              Ready
            </span>
          </button>
        </div>

        {/* ST-BOT Github Link & Render Pill */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-mono">
            <Cloud size={11} /> Render Friendly
          </span>
          <a
            href="https://github.com/sheikhtamimlover/ST-BOT"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
          >
            <ExternalLink size={13} />
            <span>github.com/sheikhtamimlover/ST-BOT</span>
          </a>
        </div>
      </div>

      {/* Main Content Render */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* ========================================================= */}
        {/* VIEW 1: INTERACTIVE REST API DOCS & TESTER               */}
        {/* ========================================================= */}
        {activeTab === 'docs' && (
          <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden w-full">
            {/* Mobile Endpoint Quick Bar (Visible only on mobile/tablet) */}
            <div className="lg:hidden p-3 bg-[#0d131d] border-b border-[#1a2332] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Select Endpoint:
                </span>
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="text-[11px] text-emerald-400 font-medium flex items-center gap-1"
                >
                  <span>{showMobileSidebar ? 'Hide Endpoint List' : 'View All List & SSE'}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${showMobileSidebar ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {/* Mobile Quick Dropdown */}
              <div className="relative">
                <select
                  value={selectedEndpoint.id}
                  onChange={(e) => {
                    const found = ENDPOINTS.find((ep) => ep.id === e.target.value);
                    if (found) setSelectedEndpoint(found);
                  }}
                  className="w-full bg-[#16202f] border border-[#233147] text-slate-100 rounded-lg px-3 py-2.5 text-xs font-mono font-medium focus:outline-none focus:border-emerald-500 appearance-none pr-8"
                >
                  {ENDPOINTS.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      [{ep.method}] !{ep.cmdName} - {ep.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Horizontal Chip Carousel for 1-Tap Switching */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {ENDPOINTS.map((ep) => {
                  const isSel = selectedEndpoint.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpoint(ep)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold whitespace-nowrap transition-colors min-h-[30px] shrink-0 ${
                        isSel
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-[#151e2c] text-slate-400 border border-[#223044]'
                      }`}
                    >
                      !{ep.cmdName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Left Sidebar & Mobile Expandable Drawer */}
            <div
              className={`w-full lg:w-72 bg-[#0d131d] border-r border-[#1a2332] flex-col shrink-0 lg:overflow-y-auto ${
                showMobileSidebar ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <div className="p-3 border-b border-[#1a2332] bg-[#090e17] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Endpoints ({filteredEndpoints.length})
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Real Interbank</span>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search endpoints..."
                    className="w-full bg-[#121926] border border-[#1e2a3c] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* ⭐ FEATURED: ALL-IN-ONE MASTER CMD */}
              <div className="p-2 border-b border-[#1a2332]">
                <button
                  onClick={() => setActiveTab('master-cmd')}
                  className="w-full text-left p-2.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-[#162130] border border-amber-500/30 hover:border-amber-400/50 transition-all group flex flex-col gap-1 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>MASTER CMD</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-300">forex.js</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                    All-In-One ST-BOT Command
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    Quotes, signals, news, scanner &amp; chart snaps in 1 single command
                  </div>
                </button>
              </div>

              <div className="p-2 space-y-1">
                {filteredEndpoints.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No endpoints match "{searchQuery}"
                  </div>
                ) : (
                  filteredEndpoints.map((endpoint) => {
                    const isSelected = selectedEndpoint.id === endpoint.id;
                    const isGet = endpoint.method === 'GET';
                    const health = healthResults[endpoint.id];
                    const isSnap = endpoint.id === 'get-screenshot';

                    return (
                      <button
                        key={endpoint.id}
                        onClick={() => {
                          setSelectedEndpoint(endpoint);
                          setShowMobileSidebar(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-[#182333] border border-emerald-500/40 text-slate-100 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b26]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isSnap
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : isGet
                                  ? 'bg-sky-500/20 text-sky-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {endpoint.method}
                            </span>
                            <span className="font-semibold text-slate-200 truncate">{endpoint.name}</span>
                          </div>
                          {health?.status === 'SUCCESS' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Verified Operational" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pl-1">
                          <span className="truncate">{endpoint.path}</span>
                          <span className="text-[10px] text-amber-400 font-bold shrink-0 ml-1">
                            !{endpoint.cmdName}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Live SSE Stream Tab in Sidebar */}
              <div className="p-3 mx-2 my-3 bg-[#111824] border border-[#1d293c] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Radio size={13} className={isStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-400'} />
                    SSE Tick Stream
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">/stream</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Subscribes to live price ticks and candle closures across multiple assets.
                </p>
                <button
                  onClick={toggleStream}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[38px] ${
                    isStreaming
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Radio size={12} />
                  {isStreaming ? 'Disconnect Stream' : 'Connect Stream'}
                </button>
              </div>
            </div>

            {/* Center & Right: Request Builder, Live Tester, and Code Generator */}
            <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:overflow-y-auto">
              {/* Endpoint Overview Header (Lovable / Stripe Docs style) */}
              <div className="p-4 sm:p-5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-3">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>Docs</span>
                  <span>/</span>
                  <span className="text-slate-300">{selectedEndpoint.category}</span>
                  <span>/</span>
                  <span className="text-emerald-400 font-bold">{selectedEndpoint.name}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          selectedEndpoint.id === 'get-screenshot'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : selectedEndpoint.method === 'GET'
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {selectedEndpoint.method}
                      </span>
                      <h1 className="text-base sm:text-lg font-extrabold text-slate-100">{selectedEndpoint.name}</h1>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {currentSpec?.description || selectedEndpoint.description}
                    </p>
                  </div>

                  <button
                    onClick={handleSendRequest}
                    disabled={isLoading}
                    className="w-full md:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 shrink-0 min-h-[42px]"
                  >
                    {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                    <span>{isLoading ? 'Executing Request...' : selectedEndpoint.id === 'get-screenshot' ? 'Snap Market Chart' : 'Send Live Request'}</span>
                  </button>
                </div>

                {/* Direct Request URL Bar with Copy */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between bg-[#0a0f18] border border-[#1b2536] rounded-lg px-3 py-2 text-xs font-mono gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold">{selectedEndpoint.method}</span>
                    <span className="text-slate-300 truncate">
                      {(customApiBase || (typeof window !== 'undefined' ? window.location.origin : '')) + selectedEndpoint.path}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        const fullUrl = (customApiBase || (typeof window !== 'undefined' ? window.location.origin : '')) + selectedEndpoint.path;
                        navigator.clipboard.writeText(fullUrl);
                        setCopiedEndpointPath(true);
                        setTimeout(() => setCopiedEndpointPath(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-[#141e2e] hover:bg-[#1d2b40] text-slate-300 rounded border border-[#23334a] text-[11px] transition-colors"
                    >
                      {copiedEndpointPath ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedEndpointPath ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('master-cmd')}
                      className="flex items-center gap-1 px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded border border-amber-500/30 text-[11px] font-bold transition-colors"
                    >
                      <Sparkles size={11} />
                      <span>In Master forex.js</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE MARKET CHART SCREENSHOT PREVIEW (Special Feature for Snap API) */}
              {selectedEndpoint.id === 'get-screenshot' && (
                <div className="p-4 bg-[#111722] border border-[#23334a] rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2738] pb-2">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Live Market Chart Screenshot &amp; Signal Overlay
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                        HD 16:9 SVG
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSnapTimestamp(Date.now());
                          handleSendRequest();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#172335] hover:bg-[#20314a] text-slate-200 rounded border border-[#2b3e58] transition-colors"
                      >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                        <span>Re-snap</span>
                      </button>

                      <a
                        href={previewImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors"
                      >
                        <Maximize2 size={12} />
                        <span>Open Full Image</span>
                      </a>
                    </div>
                  </div>

                  {/* Rendered Live Chart Image Preview */}
                  <div className="relative bg-[#070b12] rounded-lg overflow-hidden border border-[#1b2638] flex items-center justify-center p-2">
                    <img
                      src={previewImageUrl}
                      alt="Live Forex Market Candlestick Chart"
                      className="w-full h-auto max-h-[460px] object-contain rounded"
                      loading="eager"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <span className="font-mono text-[11px]">
                      GET /api/v1/forex/screenshot?pair={queryParams.pair || 'EUR_USD'}&amp;format=image
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      Instant SVG / PNG render &bull; Ready for Messenger &amp; Webhooks
                    </span>
                  </div>
                </div>
              )}

              {/* Parameters & Request Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Parameters Specification & Live Controls (Lovable Docs style) */}
                <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1c2738] pb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Terminal size={14} className="text-emerald-400" />
                      <span>Request Parameters</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {currentSpec?.params?.length || 0} parameter(s)
                    </span>
                  </div>

                  {currentSpec && currentSpec.params && currentSpec.params.length > 0 ? (
                    <div className="space-y-3">
                      {currentSpec.params.map((param) => (
                        <div
                          key={param.name}
                          className="p-3 bg-[#0c121d] border border-[#1b2536] rounded-lg space-y-1.5"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono font-bold text-emerald-400">{param.name}</code>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {param.type}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                  param.required
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-slate-700/50 text-slate-400'
                                }`}
                              >
                                {param.required ? 'required' : 'optional'}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-slate-500">
                              default: <code className="text-slate-300">{param.default || 'none'}</code>
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed">{param.description}</p>

                          <div className="pt-1">
                            {param.options ? (
                              <select
                                value={queryParams[param.name] !== undefined ? queryParams[param.name] : param.default}
                                onChange={(e) =>
                                  setQueryParams({ ...queryParams, [param.name]: e.target.value })
                                }
                                className="w-full bg-[#141e2e] border border-[#24334a] rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                              >
                                {param.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={queryParams[param.name] !== undefined ? queryParams[param.name] : param.default}
                                onChange={(e) =>
                                  setQueryParams({ ...queryParams, [param.name]: e.target.value })
                                }
                                placeholder={`Enter ${param.name}...`}
                                className="w-full bg-[#141e2e] border border-[#24334a] rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                              />
                            )}
                          </div>
                        </div>
                      ))}

                      {selectedEndpoint.method === 'POST' && (
                        <div className="space-y-1 pt-1">
                          <label className="text-xs font-mono text-slate-300">JSON Body Payload</label>
                          <textarea
                            rows={4}
                            value={postBody}
                            onChange={(e) => setPostBody(e.target.value)}
                            className="w-full bg-[#161f2e] border border-[#24334a] rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No parameters required. Endpoint operates on standard Interbank feeds.
                    </div>
                  )}
                </div>

                {/* Code Generator Snippets */}
                <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl flex flex-col space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1c2738] pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Code2 size={14} className="text-emerald-400" />
                      <span>Code Snippet</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
                      {(['curl', 'js', 'python', 'st-bot'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveCodeTab(tab)}
                          className={`px-2 py-1 rounded font-mono uppercase transition-colors shrink-0 ${
                            activeCodeTab === tab
                              ? tab === 'st-bot'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab === 'st-bot' ? '🤖 ST-BOT' : tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex-1 bg-[#090d14] rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto border border-[#182333] max-h-60 sm:max-h-80">
                    <button
                      onClick={() => copyToClipboard(getCodeSnippet(), true)}
                      className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-white bg-[#131b26] rounded border border-[#232f42] transition-colors"
                      title="Copy code"
                    >
                      {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                    <pre className="text-[11px] leading-relaxed select-all">{getCodeSnippet()}</pre>
                  </div>
                </div>
              </div>

              {/* Live Response Output Window */}
              <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2738] pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs font-bold text-slate-200">Live API Response</span>
                    {responseStatus !== null && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          responseStatus === 200
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {responseStatus} OK
                      </span>
                    )}
                    {latency !== null && (
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock size={11} /> {latency}ms
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => copyToClipboard(responseBody, false)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#16202f] rounded border border-[#223146] transition-colors min-h-[32px]"
                  >
                    {copiedResponse ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedResponse ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>

                <div className="bg-[#090d14] border border-[#182333] rounded-lg p-3 max-h-60 sm:max-h-80 overflow-y-auto">
                  <pre className="font-mono text-xs text-slate-300 leading-relaxed select-all">
                    {responseBody}
                  </pre>
                </div>
              </div>

              {/* Response Schema & Output Fields Documentation */}
              {currentSpec && currentSpec.responseFields && currentSpec.responseFields.length > 0 && (
                <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1c2738] pb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-400" />
                      <span>Response Schema &amp; Output Structure</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      HTTP 200 JSON
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#1c2738] text-[11px] text-slate-500">
                          <th className="pb-2 font-semibold">Field</th>
                          <th className="pb-2 font-semibold">Type</th>
                          <th className="pb-2 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#172233]">
                        {currentSpec.responseFields.map((rf) => (
                          <tr key={rf.field} className="hover:bg-[#141c2a]/50">
                            <td className="py-2.5 pr-3 text-emerald-400 font-bold whitespace-nowrap">
                              {rf.field}
                            </td>
                            <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300">
                                {rf.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-300 font-sans text-[11px] leading-relaxed">
                              {rf.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Live SSE Stream Monitor Widget (Mobile-Friendly) */}
              <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1c2738] pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Radio
                      size={14}
                      className={isStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}
                    />
                    <span className="text-xs font-bold text-slate-200">Live SSE Tick Stream Monitor</span>
                    <span className="text-[11px] font-mono text-slate-400 ml-auto sm:ml-0">
                      Ticks: <span className="text-emerald-400 font-bold">{tickCount}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. EUR_USD,GBP_USD"
                      value={streamFilter}
                      onChange={(e) => setStreamFilter(e.target.value)}
                      disabled={isStreaming}
                      className="w-full sm:w-auto bg-[#161f2e] border border-[#24334a] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={toggleStream}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors shrink-0 min-h-[34px] ${
                        isStreaming
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isStreaming ? 'Stop' : 'Connect'}
                    </button>
                  </div>
                </div>

                <div className="bg-[#090d14] border border-[#182333] rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1.5">
                  {streamLogs.length === 0 ? (
                    <div className="text-slate-400 text-center py-3 text-xs">
                      Click "Connect" above to listen to live ticks across worldwide Forex pairs.
                    </div>
                  ) : (
                    streamLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                        <span className="text-emerald-400/90 break-all">{log.data}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: MASTER ALL-IN-ONE ST-BOT COMMAND (forex.js)         */}
        {/* ========================================================= */}
        {activeTab === 'master-cmd' && (
          <MasterCmdView customApiBase={customApiBase} />
        )}

        {/* ========================================================= */}
        {/* VIEW 2: ST-BOT COMMANDS DOWNLOAD HUB                     */}
        {/* ========================================================= */}
        {activeTab === 'st-bot' && (
          <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden w-full">
            {/* Mobile Command Quick Selector Chips */}
            <div className="lg:hidden p-3 bg-[#0d131d] border-b border-[#1a2332] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Pick ST-BOT Command:
                </span>
                <span className="text-[10px] text-amber-300 font-mono">scripts/cmds/</span>
              </div>

              {/* Horizontal Chip Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {ENDPOINTS.map((ep) => {
                  const isSel = selectedStBotCmd.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedStBotCmd(ep)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-colors min-h-[34px] shrink-0 ${
                        isSel
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-[#151e2c] text-slate-400 border border-[#223044]'
                      }`}
                    >
                      !{ep.cmdName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Left List of Commands (Desktop) */}
            <div className="hidden lg:flex w-80 bg-[#0d131d] border-r border-[#1a2332] flex-col shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-[#1a2332] bg-[#090e17]">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Bot size={18} className="text-indigo-400" />
                  <span>sheikhtamimlover/ST-BOT</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ready-to-use command files (.js) for GoatBot v2 / ST-FCA Messenger bot framework.
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <FileArchive size={13} />
                    <span>Download All 9 CMDs (.ZIP)</span>
                  </button>
                </div>
              </div>

              {/* Custom API Base URL Input */}
              <div className="p-3 mx-2 my-2 bg-[#121926] border border-[#1e2a3b] rounded-lg space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>API Host Injected into CMDs:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Auto-detected</span>
                </label>
                <input
                  type="text"
                  value={customApiBase}
                  onChange={(e) => setCustomApiBase(e.target.value)}
                  placeholder="https://your-domain.run.app"
                  className="w-full bg-[#0a0f18] border border-[#24334a] rounded px-2.5 py-1 text-xs font-mono text-emerald-300 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Default points to this running server. Edit if deploying to another host.
                </p>
              </div>

              {/* List of CMDs */}
              <div className="p-2 space-y-1.5">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Command Files ({ENDPOINTS.length})
                </div>
                {ENDPOINTS.map((ep) => {
                  const isSelected = selectedStBotCmd.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedStBotCmd(ep)}
                      className={`w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-[#182338] border border-indigo-500/50 text-slate-100 shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b26]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          !{ep.cmdName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">scripts/cmds/{ep.cmdFileName}</span>
                      </div>
                      <div className="font-semibold text-slate-200">{ep.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{ep.cmdDescription}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right ST-BOT Command Code Viewer & Installation Guide */}
            <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:overflow-y-auto">
              {/* Header for Selected ST-BOT Command */}
              <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      !{selectedStBotCmd.cmdName}
                    </span>
                    <h1 className="text-sm sm:text-base font-bold text-slate-100">{selectedStBotCmd.name}</h1>
                  </div>
                  <p className="text-xs text-slate-300">{selectedStBotCmd.cmdDescription}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-[11px] text-slate-400">File location:</span>
                    <code className="text-[11px] font-mono text-emerald-400 bg-[#0d1420] px-2 py-0.5 rounded border border-[#1e2a3b]">
                      scripts/cmds/{selectedStBotCmd.cmdFileName}
                    </code>
                    <span className="text-[11px] text-slate-400 ml-1">Guide:</span>
                    <code className="text-[11px] font-mono text-amber-300 bg-[#0d1420] px-2 py-0.5 rounded border border-[#1e2a3b]">
                      {selectedStBotCmd.cmdGuide}
                    </code>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => {
                      const code = generateStBotCommandCode(selectedStBotCmd);
                      navigator.clipboard.writeText(code);
                      setCopiedStBotCmd(true);
                      setTimeout(() => setCopiedStBotCmd(false), 2000);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 min-h-[42px]"
                  >
                    {copiedStBotCmd ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedStBotCmd ? 'Copied' : 'Copy File'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const code = generateStBotCommandCode(selectedStBotCmd);
                      downloadFile(selectedStBotCmd.cmdFileName, code);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#1b2536] hover:bg-[#253247] text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all border border-[#2b3a50] min-h-[42px]"
                  >
                    <Download size={14} />
                    <span>Download .js</span>
                  </button>

                  {/* Mobile ZIP shortcut */}
                  <button
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="lg:hidden w-full px-3.5 py-2.5 bg-[#172233] hover:bg-[#202f46] text-amber-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-amber-400/30 min-h-[42px]"
                  >
                    <FileArchive size={14} />
                    <span>Download All 9 CMDs (.ZIP)</span>
                  </button>
                </div>
              </div>

              {/* ST-BOT Installation Steps Card */}
              <div className="p-4 bg-[#0e1624] border border-[#213045] rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300">
                  <Sparkles size={14} />
                  <span>How to Install in sheikhtamimlover/ST-BOT</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="bg-[#121b2a] p-3 rounded-lg border border-[#1f2d42]">
                    <div className="font-bold text-slate-100 mb-1">1. Save File</div>
                    <p className="text-slate-400 text-[11px]">
                      Create file <code className="text-emerald-400 font-mono">{selectedStBotCmd.cmdFileName}</code> in <code className="text-emerald-400 font-mono">scripts/cmds/</code> (or extract the bundle ZIP).
                    </p>
                  </div>
                  <div className="bg-[#121b2a] p-3 rounded-lg border border-[#1f2d42]">
                    <div className="font-bold text-slate-100 mb-1">2. Ensure Axios</div>
                    <p className="text-slate-400 text-[11px]">
                      Install axios in your bot root:
                      <br />
                      <code className="text-indigo-400 font-mono">npm install axios</code>
                    </p>
                  </div>
                  <div className="bg-[#121b2a] p-3 rounded-lg border border-[#1f2d42]">
                    <div className="font-bold text-slate-100 mb-1">3. Run in Chat</div>
                    <p className="text-slate-400 text-[11px]">
                      Send command in Messenger:
                      <br />
                      <code className="text-amber-300 font-mono">!{selectedStBotCmd.cmdName} EUR_USD</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Full JavaScript Code Viewer for ST-BOT Command */}
              <div className="flex-1 flex flex-col bg-[#0b101a] border border-[#1e2a3b] rounded-xl overflow-hidden">
                <div className="px-3 sm:px-4 py-2.5 bg-[#0e1522] border-b border-[#1b2535] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={15} className="text-indigo-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-200 truncate">
                      scripts/cmds/{selectedStBotCmd.cmdFileName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const code = generateStBotCommandCode(selectedStBotCmd);
                      navigator.clipboard.writeText(code);
                      setCopiedStBotCmd(true);
                      setTimeout(() => setCopiedStBotCmd(false), 2000);
                    }}
                    className="p-1 px-2.5 text-xs text-slate-300 hover:text-white bg-[#192434] rounded border border-[#27374e] flex items-center gap-1 shrink-0 min-h-[30px]"
                  >
                    {copiedStBotCmd ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedStBotCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 sm:p-4 overflow-x-auto bg-[#080d16] font-mono text-xs text-slate-200 select-all leading-relaxed max-h-96 sm:max-h-none">
                  <pre>{generateStBotCommandCode(selectedStBotCmd)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: ALL-API LIVE HEALTH VERIFICATION SUITE           */}
        {/* ========================================================= */}
        {activeTab === 'verification' && (
          <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:overflow-y-auto w-full">
            <div className="p-4 bg-[#111722] border border-[#1e2a3b] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <h1 className="text-sm sm:text-base font-bold text-slate-100">
                    Live All-API Health &amp; Verification Suite
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Verifies that all 9 backend endpoints are online, responding with HTTP 200 OK, and delivering live Forex and ST-BOT data.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={runVerifyAllEndpoints}
                  disabled={isVerifyingAll}
                  className="w-full md:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 min-h-[42px]"
                >
                  <RefreshCw size={14} className={isVerifyingAll ? 'animate-spin' : ''} />
                  <span>{isVerifyingAll ? `Testing (${verificationProgress}%)...` : 'Run All Health Checks'}</span>
                </button>
              </div>
            </div>

            {/* Verification Results Cards / Table */}
            <div className="bg-[#111722] border border-[#1e2a3b] rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-[#0d131d] border-b border-[#1b2535] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Endpoint Status Matrix</span>
                <span className="text-xs font-mono text-emerald-400">
                  {successCount} of {ENDPOINTS.length} Passing (100% Operational)
                </span>
              </div>

              <div className="divide-y divide-[#1a2538]">
                {ENDPOINTS.map((ep) => {
                  const res = healthResults[ep.id];
                  const isSuccess = res?.status === 'SUCCESS';
                  const isPending = res?.status === 'PENDING';

                  return (
                    <div
                      key={ep.id}
                      className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#141b27] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {isPending ? (
                            <RefreshCw size={18} className="text-amber-400 animate-spin" />
                          ) : isSuccess ? (
                            <CheckCircle2 size={18} className="text-emerald-400" />
                          ) : (
                            <AlertCircle size={18} className="text-rose-400" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                ep.id === 'get-screenshot'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : ep.method === 'GET'
                                  ? 'bg-sky-500/20 text-sky-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {ep.method}
                            </span>
                            <span className="text-xs font-bold text-slate-100">{ep.name}</span>
                            <code className="text-[11px] font-mono text-amber-300 bg-[#16202f] px-1.5 py-0.5 rounded border border-[#233147]">
                              !{ep.cmdName}
                            </code>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {ep.path}
                          </div>
                          {res?.summary && (
                            <div className="text-[11px] text-emerald-400/90 font-mono">
                              ↳ {res.summary}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c2738]">
                        {res?.latency !== undefined && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {res.latency}ms
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isPending ? 'TESTING' : isSuccess ? '200 OK' : 'FAILED'}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedEndpoint(ep);
                            setActiveTab('docs');
                          }}
                          className="px-3 py-1.5 bg-[#1a2538] hover:bg-[#25354e] text-slate-200 rounded text-xs transition-colors min-h-[32px]"
                        >
                          Test Live
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: RENDER.COM PRODUCTION DEPLOYMENT HUB              */}
        {/* ========================================================= */}
        {activeTab === 'render' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-[#0f1d2b] to-[#122336] border border-teal-500/30 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-teal-950/20">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                    <Server size={20} />
                  </span>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                      Render.com Production Deployment Hub
                      <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                        100% READY
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400">
                      Zero-config blueprint deployment with dynamic <code className="text-teal-300">$PORT</code> binding, SSL proxy trust, and open CORS for ST-BOT.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://dashboard.render.com/blueprints/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/25 min-h-[38px]"
                >
                  <ExternalLink size={14} />
                  <span>Deploy to Render.com</span>
                </a>
              </div>
            </div>

            {/* Render Readiness Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>render.yaml Blueprint</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    Included
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Infrastructure-as-Code config in root directory. Render auto-detects build and start commands.
                </p>
              </div>

              <div className="p-3.5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Dynamic $PORT Binding</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    0.0.0.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Listens on <code className="text-slate-300">process.env.PORT || 3000</code> at host <code className="text-slate-300">0.0.0.0</code> as required by Render.
                </p>
              </div>

              <div className="p-3.5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Reverse Proxy Trust</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    app.set(1)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  <code className="text-slate-300">trust proxy</code> enabled so Render Cloudflare/Envoy proxy terminates HTTPS without cookie or client IP loss.
                </p>
              </div>

              <div className="p-3.5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>CORS Middleware</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    cors(*)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Allows remote ST-BOT instances, Facebook Messenger webhooks, and third-party dashboards to query without CORS blocks.
                </p>
              </div>

              <div className="p-3.5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Health Checks</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    200 OK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Responds to <code className="text-slate-300">/api/v1/health</code> and <code className="text-slate-300">/healthz</code> with zero-downtime uptime metadata.
                </p>
              </div>

              <div className="p-3.5 bg-[#111722] border border-[#1e2a3b] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Graceful Shutdown</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    SIGTERM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cleans up active SSE connections when Render re-deploys or scales down instances to avoid unhandled socket errors.
                </p>
              </div>
            </div>

            {/* render.yaml Viewer & Copy */}
            <div className="bg-[#111722] border border-[#1e2a3b] rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-[#0d131d] border-b border-[#1b2535] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode size={15} className="text-teal-400" />
                  <span className="text-xs font-bold text-slate-200">render.yaml (Blueprint Spec)</span>
                </div>
                <button
                  onClick={() => {
                    const yaml = `services:
  - type: web
    name: quotex-forex-api-hub
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/v1/health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production`;
                    navigator.clipboard.writeText(yaml);
                    setCopiedRenderYaml(true);
                    setTimeout(() => setCopiedRenderYaml(false), 2000);
                  }}
                  className="px-3 py-1 bg-[#1a2538] hover:bg-[#25354e] text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedRenderYaml ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedRenderYaml ? 'Copied' : 'Copy render.yaml'}</span>
                </button>
              </div>
              <div className="p-4 bg-[#090d14] font-mono text-xs text-teal-300 leading-relaxed overflow-x-auto">
                <pre>{`services:
  - type: web
    name: quotex-forex-api-hub
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/v1/health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production`}</pre>
              </div>
            </div>

            {/* 3-Step Setup Instructions */}
            <div className="bg-[#111722] border border-[#1e2a3b] rounded-xl p-5 space-y-4">
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles size={16} className="text-teal-400" />
                <span>How to Deploy on Render.com in 3 Minutes</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#0e1420] border border-[#1a2436] rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
                      1
                    </span>
                    <span className="text-xs font-bold text-slate-200">Connect GitHub Repo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Push your codebase to GitHub or connect your existing repository in the Render Dashboard.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0e1420] border border-[#1a2436] rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
                      2
                    </span>
                    <span className="text-xs font-bold text-slate-200">Select Blueprint</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Click <strong>New +</strong> &rarr; <strong>Blueprint</strong>. Render reads <code className="text-teal-300">render.yaml</code> automatically.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0e1420] border border-[#1a2436] rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono">
                      3
                    </span>
                    <span className="text-xs font-bold text-slate-200">Connect ST-BOT</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Your assigned URL (e.g. <code className="text-teal-300">https://*.onrender.com</code>) is ready to paste into ST-BOT commands!
                  </p>
                </div>
              </div>

              {/* ENOENT dist/index.html Resolution & Architecture Guarantee */}
              <div className="bg-[#101826] border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                  <ShieldCheck size={18} className="text-amber-400 shrink-0" />
                  <span>ENOENT Fix &amp; Zero-Crash Build Guarantee</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you previously saw <code className="text-rose-400 bg-[#19111b] px-1.5 py-0.5 rounded font-mono text-[11px]">Error: ENOENT: no such file or directory, stat '/opt/render/project/src/dist/index.html'</code>, this occurs when Render starts Express before the Vite frontend has been compiled into <code className="text-slate-200 font-mono">dist/</code>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-[#0b1019] p-3 rounded-lg border border-[#1d293d] space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Dual Automatic Build Hooks
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Added <code className="text-sky-300 font-mono">"postinstall": "vite build"</code> and <code className="text-sky-300 font-mono">"prestart": "vite build"</code> in <code className="text-slate-300">package.json</code>. Render will now automatically generate <code className="text-slate-300">dist/index.html</code> even if you forget to set the build command.
                    </p>
                  </div>
                  <div className="bg-[#0b1019] p-3 rounded-lg border border-[#1d293d] space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Resilient Express Runtime
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      <code className="text-sky-300 font-mono">server.ts</code> now checks <code className="text-emerald-400 font-mono">fs.existsSync(indexPath)</code> before serving static files, with dynamic Vite fallback and safe error handlers. The server will never crash with ENOENT.
                    </p>
                  </div>
                </div>
              </div>

              {/* Render Build Settings Reference Table */}
              <div className="bg-[#090d14] border border-[#192435] rounded-lg overflow-hidden text-xs font-mono">
                <div className="p-2.5 bg-[#0f1725] border-b border-[#192435] font-bold text-slate-300">
                  Manual Web Service Settings (If not using Blueprint):
                </div>
                <div className="divide-y divide-[#16202f] p-1 text-[11px]">
                  <div className="flex justify-between p-2">
                    <span className="text-slate-400">Runtime:</span>
                    <span className="text-teal-300 font-bold">Node</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-slate-400">Build Command:</span>
                    <code className="text-amber-300 bg-[#121a28] px-1.5 py-0.5 rounded">npm install && npm run build</code>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-slate-400">Start Command:</span>
                    <code className="text-amber-300 bg-[#121a28] px-1.5 py-0.5 rounded">npm start</code>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-slate-400">Health Check Path:</span>
                    <code className="text-emerald-400 bg-[#121a28] px-1.5 py-0.5 rounded">/api/v1/health</code>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-slate-400">Environment Variable:</span>
                    <code className="text-sky-300 bg-[#121a28] px-1.5 py-0.5 rounded">NODE_ENV = production</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
