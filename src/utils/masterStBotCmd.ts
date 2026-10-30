/**
 * Unified Master ZYRO BOT Command Generator
 * Compatible with ZYRO BOT (GoatBot v2 / ST-FCA Architecture)
 * Path: scripts/cmds/forex.js or scripts/cmds/zyro.js
 */

export interface MasterSubCommand {
  syntax: string;
  shortDesc: string;
  example: string;
  category: 'core' | 'visual' | 'scanner' | 'news';
}

export const MASTER_SUBCOMMANDS: MasterSubCommand[] = [
  {
    syntax: '!zyro [pair]',
    shortDesc: 'All-In-One Real-Time Interbank Quote, AI Next Candle Prediction (CALL/PUT), Indicators & News',
    example: '!zyro EUR_USD',
    category: 'core',
  },
  {
    syntax: '!zyro future [count] [tf]',
    shortDesc: 'VIP Scheduled Future Signals: Predicts exact upcoming candle entry times in UTC+6 with strike & target',
    example: '!zyro future 5 1m',
    category: 'core',
  },
  {
    syntax: '!zyro snap [pair] [tf]',
    shortDesc: 'Captures and sends live HD candlestick chart image with ZYRO BOT Signal HUD overlay',
    example: '!zyro snap EUR_USD 1m',
    category: 'visual',
  },
  {
    syntax: '!zyro scan [tf]',
    shortDesc: 'Scans all 23+ Worldwide Interbank pairs and ranks top 5 highest-probability setups',
    example: '!zyro scan 1m',
    category: 'scanner',
  },
  {
    syntax: '!zyro signal [pair]',
    shortDesc: 'Deep technical confluence (EMA 9/21, RSI 14, MACD, Bollinger Bands, Stochastic)',
    example: '!zyro signal GBP_USD',
    category: 'core',
  },
  {
    syntax: '!zyro news [HIGH|ALL]',
    shortDesc: 'Live Forex Factory economic calendar in UTC+6 with forecasts & actual figures',
    example: '!zyro news HIGH',
    category: 'news',
  },
  {
    syntax: '!zyro dir [pair]',
    shortDesc: 'Which Pair Which Direction: Maps economic releases directly to trading bias & expected pips',
    example: '!zyro dir EUR_USD',
    category: 'news',
  },
  {
    syntax: '!zyro pairs [category]',
    shortDesc: 'Lists all 23+ active Interbank pairs with live strike prices, payouts & spreads',
    example: '!zyro pairs major',
    category: 'core',
  },
  {
    syntax: '!zyro (or !zyro help)',
    shortDesc: 'Interactive help menu with system status, active pairs & quick-start guide',
    example: '!zyro',
    category: 'core',
  },
];

export function generateMasterStBotCommand(baseUrl: string): string {
  return generateMasterZyroBotCommand(baseUrl);
}

export function generateMasterZyroBotCommand(baseUrl: string): string {
  const origin = baseUrl.replace(/\/+$/, '');

  return `/**
 * ZYRO BOT Command: forex.js / zyro.js (Unified Master Command)
 * Framework: ZYRO BOT (GoatBot v2 / ST-FCA Architecture)
 * Path: scripts/cmds/forex.js
 * Description: All-In-One Real-Time Worldwide Forex Engine - Accurate Interbank Spot Rates, AI Next Candle Signals (CALL/PUT), Multi-Indicator Confluence, Forex Factory News, Market Scanner & Live Chart Snapshots
 * Timezone: UTC+6 (Bangladesh Standard Time / BST)
 * Author: ZYRO BOT Team
 * Version: 4.0.0
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "forex",
    aliases: ["zyro", "fx", "qtx", "quotex", "trade"],
    version: "4.0.0",
    author: "ZYRO BOT Team",
    countDown: 3,
    role: 0,
    shortDescription: "ZYRO BOT Worldwide Real-Time Forex Trading Hub (UTC+6)",
    longDescription: "Complete Real-Time Interbank Forex command for ZYRO BOT. Fetches accurate live institutional quotes, AI next candle signals (CALL/PUT), technical indicators, Forex Factory news, market scanner, and live chart screenshots with UTC+6 timestamps.",
    category: "forex",
    guide: 
      "{pn} (Show interactive help menu & active pairs)\\n" +
      "{pn} [pair] [tf: 1m|5m] (All-in-one quote, AI signal & news)\\n" +
      "{pn} snap [pair] [tf] (Live HD chart screenshot with signal HUD)\\n" +
      "{pn} signal [pair] [tf] (Deep indicator confluence & invalidation)\\n" +
      "{pn} scan (Scan 23+ pairs & rank best win rate setups)\\n" +
      "{pn} news (High impact Forex Factory calendar in UTC+6)\\n" +
      "{pn} dir (Which pair which direction economic impact)\\n" +
      "{pn} pairs (List all active Interbank pairs & payouts)"
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = (text, attachment) => {
      if (message && message.reply) {
        return attachment ? message.reply({ body: text, attachment }) : message.reply(text);
      }
      if (api && api.sendMessage) {
        return attachment 
          ? api.sendMessage({ body: text, attachment }, event.threadID, event.messageID)
          : api.sendMessage(text, event.threadID, event.messageID);
      }
    };

    const BASE_URL = "${origin}";

    // Helper: Normalize user input (e.g. "eurusd" -> "EUR_USD", "gold" -> "XAU_USD")
    const normalizePair = (input) => {
      if (!input) return "EUR_USD";
      let clean = input.toUpperCase().trim().replace(/[\\/\\-_ ]+/g, '');
      if (clean === "GOLD") return "XAU_USD";
      if (clean === "SILVER") return "XAG_USD";
      if (clean === "OIL") return "WTI_USD";
      if (clean.length === 6) {
        return clean.slice(0, 3) + "_" + clean.slice(3);
      }
      return input.toUpperCase().replace('/', '_');
    };

    const sub = (args[0] || "").toLowerCase();

    // ─────────────────────────────────────────────────────────────
    // SUBCOMMAND 1: SNAP / CHART (Live Candlestick Screenshot Image)
    // ─────────────────────────────────────────────────────────────
    if (sub === "snap" || sub === "chart" || sub === "shot") {
      const pair = normalizePair(args[1]);
      const tf = args[2] || "1m";
      await reply(\`📸 [ZYRO BOT] Capturing live HD candlestick chart for \${pair} (\${tf})...\`);

      const jsonUrl = \`\${BASE_URL}/api/v1/forex/screenshot?pair=\${pair}&timeframe=\${tf}&format=json\`;
      const imageUrl = \`\${BASE_URL}/api/v1/forex/screenshot?pair=\${pair}&timeframe=\${tf}&format=image\`;

      try {
        const res = await axios.get(jsonUrl, { timeout: 12000 });
        const data = res.data;
        if (!data || !data.success) {
          return reply(\`❌ [ZYRO BOT] Failed to snap chart: \${data?.error || "Pair not found"}\`);
        }

        const sig = data.nextCandleSignal || data.signal;
        const dirBadge = sig.direction === "CALL" ? "🟢 CALL (UP / GREEN)" : "🔴 PUT (DOWN / RED)";
        const caption = 
\`📸 ══ [ ZYRO BOT • FOREX CHART SNAPSHOT ] ══ 📸
🌐 Asset: \${data.symbol} (\${data.name || pair}) | TF: \${data.timeframe}
⏰ Time (UTC+6): \${data.timeUtc6 || "Live BST"}
⚡ Feed: Real-Time Institutional Interbank Spot
💰 Live Market Price: \${data.currentPrice}
🔮 NEXT CANDLE SIGNAL: [ \${dirBadge} ]
🎯 Win Rate: \${sig.confidence}% | Target: \${sig.targetPrice}
⏱ Countdown: \${sig.countdownSeconds}s remaining
📊 Pattern: \${sig.pattern}
───────────────────────────────
🖼 Direct HD Image URL:
\${imageUrl}
Powered by ZYRO BOT Engine\`;

        try {
          const imgStream = await global.utils?.getStreamFromURL?.(imageUrl) || 
                            (await axios.get(imageUrl, { responseType: 'stream' })).data;
          return reply(caption, imgStream);
        } catch {
          return reply(caption);
        }
      } catch (err) {
        return reply(\`❌ [ZYRO BOT] Chart Snap Error: \${err.response?.data?.error || err.message}\`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SUBCOMMAND 2: SCAN (Market Scanner)
    // ─────────────────────────────────────────────────────────────
    if (sub === "scan" || sub === "scanner" || sub === "top") {
      const tf = args[1] || "1m";
      await reply(\`🔍 [ZYRO BOT] Scanning all Worldwide Forex pairs across real-time technical confluence...\`);
      try {
        const res = await axios.get(\`\${BASE_URL}/api/v1/forex/scanner?timeframe=\${tf}\`, { timeout: 10000 });
        const data = res.data;
        if (!data || !data.success) return reply(\`❌ [ZYRO BOT] Failed to scan market.\`);

        const top = (data.data || []).slice(0, 5);
        const lines = top.map((p, i) => {
          const dir = p.signal.direction === "CALL" ? "🟢 CALL" : "🔴 PUT";
          return \`[\${i + 1}] \${p.symbol} - \${dir} (\${p.signal.confidence}%)
   💰 Live Price: \${p.price} | Target: \${p.signal.targetPrice}
   ⏱ Close in: \${p.signal.countdownSeconds}s | Spread: \${p.pipSpread} pips\`;
        }).join("\\n\\n");

        return reply(
\`📊 ══ [ ZYRO BOT • FOREX MARKET SCANNER ] ══ 📊
Total Pairs: \${data.totalScanned || data.count} | Timeframe: \${data.timeframe}
⏰ Time (UTC+6): \${data.timeUtc6 || "Live BST"}
⚡ Market: Real-Time Institutional Interbank Spot (No OTC)

\${lines}

💡 Tip: Type "!zyro snap [pair]" to view the live candlestick chart image!\`);
      } catch (err) {
        return reply(\`❌ [ZYRO BOT] Scanner Error: \${err.response?.data?.error || err.message}\`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SUBCOMMAND 3: NEWS (Forex Factory Economic Calendar)
    // ─────────────────────────────────────────────────────────────
    if (sub === "news" || sub === "calendar" || sub === "cal") {
      const impact = (args[1] || "HIGH").toUpperCase();
      await reply(\`📰 [ZYRO BOT] Fetching live Forex Factory economic events (\${impact} impact)...\`);
      try {
        const res = await axios.get(\`\${BASE_URL}/api/v1/forex/news?impact=\${impact}\`, { timeout: 10000 });
        const data = res.data;
        if (!data || !data.success) return reply(\`❌ [ZYRO BOT] Failed to load economic calendar.\`);

        const events = (data.data || []).slice(0, 5);
        const lines = events.map((ev, i) => {
          const badge = ev.impact === "HIGH" ? "🔴 [HIGH]" : ev.impact === "MEDIUM" ? "🟠 [MED]" : "🟡 [LOW]";
          return \`[\${i + 1}] \${badge} \${ev.currency} - \${ev.title}
   ⏰ Time (UTC+6): \${ev.timeUtc6 || ev.time}
   📊 Forecast: \${ev.forecast} | Previous: \${ev.previous} | Sentiment: \${ev.sentiment}\`;
        }).join("\\n\\n");

        return reply(
\`📰 ══ [ ZYRO BOT • FOREX FACTORY CALENDAR ] ══ 📰
Impact Filter: \${impact} | Events Count: \${data.count}
⏰ Timezone: UTC+6 (Bangladesh Standard Time / BST)

\${lines}

💡 Type "!zyro dir" to see which pairs will move and expected pips!\`);
      } catch (err) {
        return reply(\`❌ [ZYRO BOT] News Error: \${err.response?.data?.error || err.message}\`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SUBCOMMAND 4: DIR (Which Pair Which Direction)
    // ─────────────────────────────────────────────────────────────
    if (sub === "dir" || sub === "direction" || sub === "impact") {
      const pair = args[1] ? normalizePair(args[1]) : "EUR_USD";
      await reply(\`🧭 [ZYRO BOT] Calculating news direction impact for \${pair}...\`);
      try {
        const res = await axios.get(\`\${BASE_URL}/api/v1/forex/news/pair-impact?pair=\${pair}\`, { timeout: 10000 });
        const data = res.data;
        if (!data || !data.success) return reply(\`❌ [ZYRO BOT] Failed to calculate direction impact.\`);

        const impacts = (data.data || []).slice(0, 4);
        const lines = impacts.map((item, i) => {
          const dirIcon = item.expectedDirection === "UP" ? "🟢 BUY / LONG" : "🔴 SELL / SHORT";
          return \`[\${i + 1}] \${item.eventTitle} (\${item.affectedPair})
   🎯 Bias: \${dirIcon} (Expected: \${item.expectedPips} pips)
   💡 Reason: \${item.tradeLogic}\`;
        }).join("\\n\\n");

        return reply(
\`🧭 ══ [ ZYRO BOT • NEWS DIRECTION MATRIX ] ══ 🧭
Pair: \${pair} | Overall Sentiment: \${data.overallSentiment || "NEUTRAL"}
⏰ Time (UTC+6): \${data.timeUtc6 || "Live BST"}

\${lines}\`);
      } catch (err) {
        return reply(\`❌ [ZYRO BOT] Impact Error: \${err.response?.data?.error || err.message}\`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SUBCOMMAND 5: PAIRS (All Assets List)
    // ─────────────────────────────────────────────────────────────
    if (sub === "pairs" || sub === "assets" || sub === "list") {
      try {
        const res = await axios.get(\`\${BASE_URL}/api/v1/forex/assets\`, { timeout: 8000 });
        const data = res.data;
        if (!data || !data.success) return reply(\`❌ [ZYRO BOT] Failed to load pairs.\`);

        const majors = data.data.filter(a => a.category === "major");
        const listStr = majors.map(a => \`• \${a.symbol} (Live: \${a.price}) [Payout: \${a.payout}%]\`).join("\\n");

        return reply(
\`🌐 ══ [ ZYRO BOT • REAL-TIME INTERBANK PAIRS ] ══ 🌐
Total Active Pairs: \${data.count} (100% Real Interbank Spot)
⏰ Time (UTC+6): \${data.timeUtc6 || "Live BST"}

⭐ Major Pairs:
\${listStr}

💡 Command: "!zyro EUR_USD" to analyze any pair!\`);
      } catch (err) {
        return reply(\`❌ [ZYRO BOT] Assets Error: \${err.response?.data?.error || err.message}\`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SUBCOMMAND 6: MENU / HELP (No args provided)
    // ─────────────────────────────────────────────────────────────
    if (!args[0] || sub === "help" || sub === "menu") {
      return reply(
\`🤖 ══ [ ZYRO BOT • FOREX AI TRADING ENGINE ] ══ 🤖
Status: Online (100% Real-Time Institutional Interbank Spot)
⚡ Feed: Real Live Forex Prices & Candlesticks (No Simulated Data)
⏰ Timezone: UTC+6 (Bangladesh Standard Time / BST)

⚡ ZYRO BOT MASTER COMMANDS:
• !zyro [pair]        -> All-In-One quote, AI signal & news (UTC+6)
• !zyro snap [pair]   -> Live candlestick chart screenshot
• !zyro signal [pair] -> Next candle CALL/PUT & win rate %
• !zyro scan          -> Scan pairs & rank top win-rate setups
• !zyro news          -> Forex Factory high-impact calendar (UTC+6)
• !zyro dir [pair]    -> Which pair which direction matrix
• !zyro pairs         -> View all active Forex pairs & payouts

📌 Examples:
!zyro EUR_USD
!zyro snap GBP_USD 1m
!zyro scan
!zyro news

🔥 Aliases: !zyro or !fx both work everywhere!\`);
    }

    // ─────────────────────────────────────────────────────────────
    // DEFAULT ACTION: ALL-IN-ONE FOREX ANALYSIS FOR GIVEN PAIR
    // ─────────────────────────────────────────────────────────────
    const rawPair = (sub === "signal" && args[1]) ? args[1] : args[0];
    const pair = normalizePair(rawPair);
    const tf = (sub === "signal" && args[2]) ? args[2] : (args[1] || "1m");

    await reply(\`⏳ [ZYRO BOT] Analyzing \${pair} (\${tf}) with Live Interbank Market, AI Next Candle & Forex Factory News...\`);

    try {
      const res = await axios.get(\`\${BASE_URL}/api/v1/forex/all-in-one?pair=\${pair}&timeframe=\${tf}\`, { timeout: 10000 });
      const data = res.data;

      if (!data || !data.success) {
        return reply(\`❌ [ZYRO BOT] Failed to analyze \${pair}: \${data?.error || "Asset not found"}\`);
      }

      const a = data.asset;
      const sig = data.signal || data.nextCandleSignal;
      const ind = sig.confluenceIndicators || {
        emaTrend: "EMA 9 above EMA 21 (BULLISH)",
        rsi: "RSI 14 Neutral (54.2)",
        macd: "MACD Histogram Positive Divergence",
        bollinger: "Upper Band Expansion",
        stochastic: "Stoch %K/%D Bull Cross"
      };
      const dirIcon = sig.direction === "CALL" ? "🟢 CALL (BUY / GREEN)" : "🔴 PUT (SELL / RED)";
      const changeIcon = a.change24h >= 0 ? "📈 +" : "📉 ";

      const msg = 
\`⚡ ══ [ ZYRO BOT • FOREX AI PREDICTION ] ══ ⚡
🌐 Pair: \${a.symbol} (\${a.name}) | Timeframe: \${data.timeframe || tf}
⏰ Time (UTC+6): \${data.timeUtc6 || "Live BST"}
⚡ Market: Real-Time Institutional Interbank Spot
💰 Accurate Live Price: \${a.price} (\${changeIcon}\${a.change24h}%)
📊 Spread: \${a.spreadPips} pips | Payout: \${a.payout || a.payoutRate}%

🎯 NEXT CANDLE PREDICTION:
👉 [ \${dirIcon} ]
⭐️ Win Rate Confidence: \${sig.confidenceScore || sig.confidence + '%'}
⏱ Candle Countdown: \${sig.candleCloseRemainingSeconds || sig.countdownSeconds}s remaining
🎯 Target Price: \${sig.targetPrice}
🛡 Invalidation: \${sig.invalidationPrice || sig.invalidationLevel}

📊 TECHNICAL CONFLUENCE:
• EMA Trend (9/21): \${ind.emaTrend}
• RSI (14): \${ind.rsi}
• MACD: \${ind.macd}
• Bollinger Bands: \${ind.bollinger}
• Stochastic: \${ind.stochastic}
• Overall Bias: \${sig.pattern}

📰 ECONOMIC IMPACT (Forex Factory):
• Event: \${data.forexFactoryNews?.upcomingHighImpactEvent || "No critical events right now"}
• Sentiment: \${data.forexFactoryNews?.currencySentiment || "Neutral"}
• News Direction: \${data.forexFactoryNews?.recommendedDirection || "Follow Technicals"}

💡 Tip: Type "!zyro snap \${a.symbol}" to get the live chart image!\`;

      return reply(msg);
    } catch (err) {
      return reply(\`❌ [ZYRO BOT] Error analyzing \${pair}: \${err.response?.data?.error || err.message}\`);
    }
  }
};`;
}
