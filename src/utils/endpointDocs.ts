/**
 * Detailed API Documentation Metadata & Specifications
 * Formatted for Developer Documentation Portal (Lovable / Stripe style)
 */

export interface ParamDoc {
  name: string;
  type: string;
  in: 'query' | 'body';
  required: boolean;
  default: string;
  description: string;
  options?: string[];
}

export interface ResponseFieldDoc {
  field: string;
  type: string;
  description: string;
}

export interface EndpointSpecification {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  name: string;
  summary: string;
  description: string;
  category: 'All-In-One' | 'Market Scanner' | 'Signal & Analysis' | 'Economic News' | 'Candle Charts' | 'System';
  defaultParams: Record<string, string>;
  defaultBody?: string;
  params: ParamDoc[];
  responseFields: ResponseFieldDoc[];
  cmdFileName: string;
  cmdName: string;
  cmdDescription: string;
  cmdGuide: string;
}

export const ENDPOINT_SPECS: EndpointSpecification[] = [
  {
    id: 'get-quotes',
    method: 'GET',
    path: '/api/v1/forex/quotes',
    name: 'Real-Time Interbank Quotes & Ticker (UTC+6)',
    summary: 'Streams real-time worldwide interbank forex quotes, spreads, and explicit UTC+6 timestamps',
    description: 'Provides live streaming interbank exchange rates for 23+ worldwide pairs (Majors, Minors, Exotics, Commodities) with real-time bid, ask, spread, 24h high/low, and exact UTC+6 (Bangladesh Standard Time / BST) timestamps.',
    category: 'All-In-One',
    defaultParams: { category: 'all', search: '' },
    params: [
      {
        name: 'category',
        type: 'string',
        in: 'query',
        required: false,
        default: 'all',
        description: 'Filter pairs by category.',
        options: ['all', 'major', 'minor', 'exotic', 'commodity'],
      },
      {
        name: 'search',
        type: 'string',
        in: 'query',
        required: false,
        default: '',
        description: 'Search by symbol or currency name (e.g. EUR, USD, JPY, Gold).',
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Request success status flag.' },
      { field: 'isRealtime', type: 'boolean', description: 'Real-time live streaming market status flag.' },
      { field: 'marketStatus', type: 'string', description: 'Worldwide 24/5 interbank market session status.' },
      { field: 'timezone', type: 'string', description: 'Explicit timezone identifier: UTC+6 (Asia/Dhaka / BST).' },
      { field: 'timeUtc6', type: 'string', description: 'Human-readable live timestamp in UTC+6 (YYYY-MM-DD HH:mm:ss).' },
      { field: 'timestampUtc6', type: 'string', description: 'ISO 8601 UTC+6 timestamp (+06:00 offset).' },
      { field: 'data', type: 'array', description: 'List of live pair quotes with bid, ask, spread, and 24h stats.' },
    ],
    cmdFileName: 'fxquote.js',
    cmdName: 'fxquote',
    cmdDescription: 'Real-time Forex quotes & spreads with live UTC+6 time',
    cmdGuide: '{pn} [optional category: all | major | minor | exotic | commodity]',
  },
  {
    id: 'get-all-in-one',
    method: 'GET',
    path: '/api/v1/forex/all-in-one',
    name: 'Unified All-In-One Forex API',
    summary: 'Consolidates live quote, AI candle prediction, indicator confluence, and Forex Factory news in 1 call',
    description: 'The most comprehensive Forex endpoint available. Returns live Interbank bid/ask quotes, next candle direction prediction (CALL/PUT), multi-indicator technical confluence (EMA 9/21, RSI 14, MACD, Bollinger Bands, Stochastic), target prices, candle countdown, and high-impact economic news sentiment in a single fast JSON response.',
    category: 'All-In-One',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m' },
    params: [
      {
        name: 'pair',
        type: 'string',
        in: 'query',
        required: false,
        default: 'EUR_USD',
        description: 'Currency pair symbol (e.g. EUR_USD, GBP_USD, USD_JPY, XAU_USD).',
        options: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'EUR_GBP', 'XAU_USD', 'BTC_USD'],
      },
      {
        name: 'timeframe',
        type: 'string',
        in: 'query',
        required: false,
        default: '1m',
        description: 'Candle timeframe resolution.',
        options: ['1m', '5m', '15m', '1h', '1d'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Request success status flag.' },
      { field: 'asset', type: 'object', description: 'Live quote data (symbol, price, payout %, pip spread, 24h change).' },
      { field: 'signal', type: 'object', description: 'Next candle prediction (direction CALL/PUT, confidence %, target price, invalidation level, countdown).' },
      { field: 'signal.confluenceIndicators', type: 'object', description: 'Multi-indicator breakdown: EMA 9/21 cross, RSI 14, MACD, Bollinger Bands squeeze, Stochastic.' },
      { field: 'forexFactoryNews', type: 'object', description: 'Upcoming high impact Forex Factory calendar event and currency sentiment.' },
    ],
    cmdFileName: 'fxall.js',
    cmdName: 'fxall',
    cmdDescription: 'All-In-One Forex quote, next candle prediction & news impact',
    cmdGuide: '{pn} [pair, e.g. EUR_USD, GBP_USD, XAU_USD] [timeframe, e.g. 1m, 5m]',
  },
  {
    id: 'get-screenshot',
    method: 'GET',
    path: '/api/v1/forex/screenshot',
    name: 'Market Chart Screenshot & Snap API',
    summary: 'Generates instant HD candlestick chart images with live Next Candle HUD overlay',
    description: 'Generates an instant high-definition candlestick chart snapshot with EMA 9/21 trend lines, live strike price line, countdown clock, and Next Candle Signal HUD badge overlay. Supports direct image streaming for Messenger/Discord bots or rich JSON metadata with base64 DataURIs.',
    category: 'Signal & Analysis',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m', format: 'json' },
    params: [
      {
        name: 'pair',
        type: 'string',
        in: 'query',
        required: false,
        default: 'EUR_USD',
        description: 'Forex asset symbol to capture.',
        options: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'XAU_USD'],
      },
      {
        name: 'timeframe',
        type: 'string',
        in: 'query',
        required: false,
        default: '1m',
        description: 'Candlestick interval for chart wicks & bodies.',
        options: ['1m', '5m', '15m', '1h', '1d'],
      },
      {
        name: 'format',
        type: 'string',
        in: 'query',
        required: false,
        default: 'json',
        description: 'Output format: "json" (returns URLs + signal HUD data) or "image" (streams direct SVG/PNG image).',
        options: ['json', 'image'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Indicates successful chart generation.' },
      { field: 'symbol', type: 'string', description: 'Currency pair captured (e.g. EUR_USD).' },
      { field: 'currentPrice', type: 'number', description: 'Live strike price at moment of snapshot.' },
      { field: 'nextCandleSignal', type: 'object', description: 'Direction (CALL/PUT), confidence %, countdown seconds, and pattern.' },
      { field: 'imageUrl', type: 'string', description: 'Direct high-resolution URL to fetch the rendered image.' },
      { field: 'dataUri', type: 'string', description: 'Base64 image data URI for direct inline embedding in HTML/React.' },
    ],
    cmdFileName: 'fxsnap.js',
    cmdName: 'fxsnap',
    cmdDescription: 'Snap live market chart screenshot with next candle AI signal overlay',
    cmdGuide: '{pn} [pair, e.g. EUR_USD, GBP_USD, XAU_USD] [timeframe, e.g. 1m, 5m]',
  },
  {
    id: 'get-analyze',
    method: 'GET',
    path: '/api/v1/forex/analyze',
    name: 'Next Candle Signal & Confluence',
    summary: 'Predicts the next candle direction (CALL / PUT) with win rate confidence and indicator checklist',
    description: 'Deep technical analysis engine combining exponential moving averages (EMA 9/21), relative strength index (RSI 14), moving average convergence divergence (MACD), Bollinger Bands, and Stochastic oscillator to calculate next candle direction, target price, and risk invalidation boundaries.',
    category: 'Signal & Analysis',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m' },
    params: [
      {
        name: 'pair',
        type: 'string',
        in: 'query',
        required: false,
        default: 'EUR_USD',
        description: 'Currency pair to analyze.',
        options: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'XAU_USD'],
      },
      {
        name: 'timeframe',
        type: 'string',
        in: 'query',
        required: false,
        default: '1m',
        description: 'Candlestick analysis timeframe.',
        options: ['1m', '5m', '15m'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Success flag.' },
      { field: 'symbol', type: 'string', description: 'Asset pair symbol.' },
      { field: 'currentPrice', type: 'number', description: 'Current live Interbank price.' },
      { field: 'nextCandleSignal.direction', type: 'string', description: '"CALL" (UP/Green) or "PUT" (DOWN/Red).' },
      { field: 'nextCandleSignal.confidence', type: 'number', description: 'Statistical win rate confidence percentage (e.g. 88%).' },
      { field: 'nextCandleSignal.targetPrice', type: 'number', description: 'Predicted candle close target.' },
      { field: 'nextCandleSignal.invalidationPrice', type: 'number', description: 'Risk boundary / stop level.' },
    ],
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
    summary: 'Scans all 23+ Worldwide pairs in parallel and ranks them by signal win rate',
    description: 'Analyzes all 23+ worldwide Interbank currency pairs simultaneously in real-time, computing technical confluence and sorting setups from highest win rate to lowest so traders can immediately pick the best opportunities.',
    category: 'Market Scanner',
    defaultParams: { timeframe: '1m' },
    params: [
      {
        name: 'timeframe',
        type: 'string',
        in: 'query',
        required: false,
        default: '1m',
        description: 'Scan timeframe resolution.',
        options: ['1m', '5m', '15m'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Status flag.' },
      { field: 'totalScanned', type: 'number', description: 'Total number of active currency pairs analyzed.' },
      { field: 'timeframe', type: 'string', description: 'Analysis timeframe.' },
      { field: 'data', type: 'array', description: 'Ranked list of setups with confidence %, target prices, and spreads.' },
    ],
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
    summary: 'Directly maps economic calendar events to currency pair direction and expected pips',
    description: 'Translates complex macro announcements (CPI, NFP, Interest Rate decisions) into actionable directional biases (BUY / UP vs SELL / DOWN) with forecasted pip expansion for specific currency pairs.',
    category: 'Economic News',
    defaultParams: { pair: 'EUR_USD' },
    params: [
      {
        name: 'pair',
        type: 'string',
        in: 'query',
        required: false,
        default: 'EUR_USD',
        description: 'Filter impacts for a specific currency pair, or leave empty for all.',
        options: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Status flag.' },
      { field: 'pair', type: 'string', description: 'Target pair or "ALL".' },
      { field: 'overallSentiment', type: 'string', description: 'BULLISH, BEARISH, or NEUTRAL.' },
      { field: 'data', type: 'array', description: 'List of impacted pairs with expectedDirection, expectedPips, and tradeLogic.' },
    ],
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
    summary: 'Live high-impact economic releases with forecast, previous, and live sentiment',
    description: 'Delivers real-time economic calendar events sourced from Forex Factory, including central bank announcements, employment statistics, inflation figures, and sentiment classifications.',
    category: 'Economic News',
    defaultParams: { impact: 'HIGH', currency: 'all' },
    params: [
      {
        name: 'impact',
        type: 'string',
        in: 'query',
        required: false,
        default: 'HIGH',
        description: 'Filter events by market impact level.',
        options: ['HIGH', 'MEDIUM', 'LOW', 'ALL'],
      },
      {
        name: 'currency',
        type: 'string',
        in: 'query',
        required: false,
        default: 'all',
        description: 'Filter events by currency (e.g. USD, EUR, GBP, JPY, CAD, AUD).',
        options: ['all', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Status flag.' },
      { field: 'count', type: 'number', description: 'Number of events returned.' },
      { field: 'impactFilter', type: 'string', description: 'Applied impact filter.' },
      { field: 'data', type: 'array', description: 'Event items with title, date, time, currency, forecast, previous, and sentiment.' },
    ],
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
    summary: 'Returns OHLCV candlestick series and live countdown timer until candle close',
    description: 'Retrieves historic and forming candlestick intervals (Open, High, Low, Close, Volume) and exact countdown seconds remaining before the current candle bar closes.',
    category: 'Candle Charts',
    defaultParams: { pair: 'EUR_USD', timeframe: '1m', limit: '60' },
    params: [
      {
        name: 'pair',
        type: 'string',
        in: 'query',
        required: false,
        default: 'EUR_USD',
        description: 'Currency pair symbol.',
        options: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'XAU_USD'],
      },
      {
        name: 'timeframe',
        type: 'string',
        in: 'query',
        required: false,
        default: '1m',
        description: 'Candle interval.',
        options: ['1m', '5m', '15m', '1h', '1d'],
      },
      {
        name: 'limit',
        type: 'string',
        in: 'query',
        required: false,
        default: '60',
        description: 'Number of historical bars to retrieve (max 300).',
        options: ['30', '60', '120', '300'],
      },
    ],
    responseFields: [
      { field: 'symbol', type: 'string', description: 'Pair symbol.' },
      { field: 'timeframe', type: 'string', description: 'Resolution.' },
      { field: 'currentPrice', type: 'number', description: 'Latest forming bar price.' },
      { field: 'candleCloseRemainingSeconds', type: 'number', description: 'Seconds until candle closes.' },
      { field: 'candles', type: 'array', description: 'Array of candles [time, open, high, low, close, volume].' },
    ],
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
    summary: 'Lists all 23+ active Interbank pairs with live strike prices, payouts & spreads',
    description: 'Lists all 23+ active Worldwide Forex assets across Major, Minor, Exotic, and Commodity categories with payout percentages (up to 92%), tight pip spreads, and 24-hour price change metrics.',
    category: 'Candle Charts',
    defaultParams: { category: 'all', search: '' },
    params: [
      {
        name: 'category',
        type: 'string',
        in: 'query',
        required: false,
        default: 'all',
        description: 'Filter category.',
        options: ['all', 'major', 'minor', 'exotic', 'commodity'],
      },
      {
        name: 'search',
        type: 'string',
        in: 'query',
        required: false,
        default: '',
        description: 'Optional query string to search by currency code.',
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Status flag.' },
      { field: 'count', type: 'number', description: 'Number of pairs returned.' },
      { field: 'marketType', type: 'string', description: '"Worldwide Interbank Forex (No OTC)".' },
      { field: 'data', type: 'array', description: 'List of assets (id, symbol, price, payout, spreadPips, change24h).' },
    ],
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
    summary: 'Executes simulated binary CALL or PUT trade against live Forex strike price',
    description: 'Place simulated UP (CALL) or DOWN (PUT) trades against the live Interbank market price. Simulates expiration settlement, payout calculation, and win/loss verification.',
    category: 'All-In-One',
    defaultParams: {},
    defaultBody: JSON.stringify(
      { assetId: 'EUR_USD', direction: 'CALL', investment: 100, durationSeconds: 60 },
      null,
      2
    ),
    params: [
      {
        name: 'assetId',
        type: 'string',
        in: 'body',
        required: true,
        default: 'EUR_USD',
        description: 'Currency pair to trade.',
      },
      {
        name: 'direction',
        type: 'string',
        in: 'body',
        required: true,
        default: 'CALL',
        description: '"CALL" (UP) or "PUT" (DOWN).',
        options: ['CALL', 'PUT'],
      },
      {
        name: 'investment',
        type: 'number',
        in: 'body',
        required: true,
        default: '100',
        description: 'Investment stake amount (USD).',
      },
      {
        name: 'durationSeconds',
        type: 'number',
        in: 'body',
        required: false,
        default: '60',
        description: 'Option expiration duration in seconds.',
        options: ['30', '60', '180', '300'],
      },
    ],
    responseFields: [
      { field: 'success', type: 'boolean', description: 'Order placement result.' },
      { field: 'orderId', type: 'string', description: 'Unique order identifier.' },
      { field: 'strikePrice', type: 'number', description: 'Execution strike price.' },
      { field: 'payoutRate', type: 'number', description: 'Broker payout percentage.' },
      { field: 'potentialProfit', type: 'number', description: 'Expected net profit on win.' },
    ],
    cmdFileName: 'fxtrade.js',
    cmdName: 'fxtrade',
    cmdDescription: 'Simulate binary trade with strike price & live settlement',
    cmdGuide: '{pn} <CALL|PUT> <amount> [pair, e.g. EUR_USD] [seconds, e.g. 60]',
  },
];
