# Quantio - Automated Crypto Trading Platform

A personal crypto trading platform that uses your custom algorithm to generate trade recommendations, which you approve with a single click.

## 🚀 Features

- **Real-time Market Data** - Live prices from Binance for BTC, ETH, SOL, and more
- **Custom Algorithm Integration** - Plug in your own trading strategy
- **One-Click Trade Approval** - Algorithm suggests trades, you approve or reject
- **Email Notifications** - Get notified of new trade signals via Gmail
- **Portfolio Tracking** - Real-time P&L and position monitoring
- **Trade History** - Complete log of all approved/rejected trades
- **Responsive Design** - Works on desktop, tablet, and mobile

## 📋 Prerequisites

Before using Quantio, you need:

1. **Binance Account** with API access enabled
2. **Resend Account** for email notifications (free tier available)
3. **Your trading algorithm** (or use the built-in example)

## 🔧 Configuration

### Required API Keys (Already Configured)

The following secrets have been configured in the backend:

| Secret | Description |
|--------|-------------|
| `BINANCE_API_KEY` | Your Binance API key |
| `BINANCE_API_SECRET` | Your Binance API secret |
| `RESEND_API_KEY` | Resend API key for email notifications |
| `NOTIFICATION_EMAIL` | Email address to receive trade alerts |

### Updating Secrets

To update API keys, go to **Cloud** → **Secrets** in the Lovable sidebar.

## 🧠 Adding Your Algorithm

### Location
Your trading algorithm is defined in:
```
supabase/functions/run-algorithm/index.ts
```

### Algorithm Function
Modify the `analyzeMarket` function (around line 20):

```typescript
function analyzeMarket(
  marketData: Array<{
    symbol: string;
    price: number;
    change_24h: number;
    volume_24h: number;
    high_24h: number;
    low_24h: number;
  }>,
  positions: Array<{
    symbol: string;
    quantity: number;
    avg_price: number;
  }>,
  settings: {
    max_position_value: number;
  }
): Array<{
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  confidence: number;  // 0-100
  reason: string;      // Explain why this trade
}> {
  const recommendations = [];
  
  // =========================================
  // YOUR ALGORITHM LOGIC GOES HERE
  // =========================================
  
  // Example: Buy when price drops 5%
  for (const data of marketData) {
    if (data.change_24h < -5) {
      recommendations.push({
        symbol: data.symbol,
        action: "BUY",
        quantity: settings.max_position_value / data.price,
        price: data.price,
        confidence: 85,
        reason: `Price dropped ${data.change_24h}% - buying the dip`,
      });
    }
  }
  
  return recommendations;
}
```

### Algorithm Tips

1. **Use the `marketData` array** - Contains live prices, 24h change, volume, highs/lows
2. **Check `positions`** - Know what you already own before recommending new buys
3. **Respect `max_position_value`** - Don't exceed your configured max per trade
4. **Set meaningful `confidence`** - 80+ is high confidence, 50-79 is medium
5. **Write clear `reason`** - Helps you decide whether to approve

## ⚙️ Platform Settings

Access settings via the gear icon in the header:

| Setting | Description | Default |
|---------|-------------|---------|
| Algorithm Active | Enable/disable auto-recommendations | On |
| Max Position Value | Max USD per trade | $1,000 |
| Watched Symbols | Cryptos to monitor | BTC,ETH,SOL,XRP,ADA,BNB,DOGE |

## 🔄 How It Works

1. **Market Data Refresh** - Click refresh to fetch latest Binance prices
2. **Run Algorithm** - Click "Run" to analyze markets and generate recommendations
3. **Review Trades** - Pending trades show with confidence scores and reasons
4. **Approve/Reject** - One click to execute on Binance or dismiss
5. **Get Notified** - Email alerts for new recommendations and executed trades

## ⚠️ Important Notes

### Binance API Setup

1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. Enable **Spot Trading** permission
4. Restrict to your IP address for security
5. **Never enable withdrawal permissions**

### For Testing (Testnet)

The current configuration uses Binance Testnet. For real trading, edit:
```
supabase/functions/binance-trade/index.ts
```

Change line 52 from:
```typescript
const binanceUrl = "https://testnet.binance.vision/api/v3/order";
```
To:
```typescript
const binanceUrl = "https://api.binance.com/api/v3/order";
```

### Email Notifications

For production email delivery:
1. Go to [Resend Domains](https://resend.com/domains)
2. Add and verify your domain
3. Update the `from` address in `send-notification/index.ts`

## 📁 Project Structure

```
├── src/
│   ├── components/       # UI components
│   ├── lib/
│   │   └── api.ts        # Frontend API helpers
│   └── pages/
│       └── Index.tsx     # Main dashboard
│
└── supabase/
    └── functions/
        ├── binance-trade/       # Execute trades on Binance
        ├── fetch-market-data/   # Get live prices
        ├── run-algorithm/       # YOUR ALGORITHM HERE
        └── send-notification/   # Email alerts
```

## 🔐 Security

- All API keys stored as encrypted secrets
- Trades require explicit user approval
- RLS policies on all database tables
- No withdrawal API permissions needed

## 📞 Support

This is a personal trading platform. Use at your own risk. Cryptocurrency trading involves substantial risk of loss.
