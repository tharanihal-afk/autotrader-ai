import { MarketData, PortfolioPosition, TradeRecommendation } from './algorithm';

// Mock market data - In production, replace with real API calls
export const mockMarketData: MarketData[] = [
  {
    symbol: 'BTC',
    price: 67432.50,
    change24h: 2.34,
    volume24h: 28500000000,
    high24h: 68100.00,
    low24h: 65800.00,
    timestamp: Date.now(),
  },
  {
    symbol: 'ETH',
    price: 3456.78,
    change24h: -1.23,
    volume24h: 15200000000,
    high24h: 3520.00,
    low24h: 3380.00,
    timestamp: Date.now(),
  },
  {
    symbol: 'SOL',
    price: 178.45,
    change24h: 5.67,
    volume24h: 3800000000,
    high24h: 182.00,
    low24h: 168.00,
    timestamp: Date.now(),
  },
  {
    symbol: 'XRP',
    price: 0.5234,
    change24h: -3.45,
    volume24h: 1200000000,
    high24h: 0.5500,
    low24h: 0.5100,
    timestamp: Date.now(),
  },
  {
    symbol: 'ADA',
    price: 0.4567,
    change24h: 1.89,
    volume24h: 450000000,
    high24h: 0.4700,
    low24h: 0.4400,
    timestamp: Date.now(),
  },
];

export const mockPortfolio: PortfolioPosition[] = [
  {
    symbol: 'BTC',
    quantity: 0.5,
    avgPrice: 62000.00,
    currentPrice: 67432.50,
  },
  {
    symbol: 'ETH',
    quantity: 5.0,
    avgPrice: 3200.00,
    currentPrice: 3456.78,
  },
  {
    symbol: 'SOL',
    quantity: 25.0,
    avgPrice: 150.00,
    currentPrice: 178.45,
  },
];

export const mockPendingTrades: TradeRecommendation[] = [
  {
    id: 'rec_1',
    symbol: 'XRP',
    action: 'BUY',
    quantity: 1500,
    price: 0.5234,
    confidence: 78,
    reason: 'Price dropped 3.45% - potential rebound opportunity based on support level',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'rec_2',
    symbol: 'SOL',
    action: 'SELL',
    quantity: 10,
    price: 178.45,
    confidence: 85,
    reason: 'Price gained 5.67% - taking partial profit at resistance level',
    timestamp: Date.now() - 60000,
  },
];

export interface TradeHistory {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  status: 'completed' | 'rejected';
  timestamp: number;
}

export const mockTradeHistory: TradeHistory[] = [
  {
    id: 'trade_1',
    symbol: 'BTC',
    action: 'BUY',
    quantity: 0.1,
    price: 65234.00,
    total: 6523.40,
    status: 'completed',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'trade_2',
    symbol: 'ETH',
    action: 'SELL',
    quantity: 2.0,
    price: 3510.00,
    total: 7020.00,
    status: 'completed',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'trade_3',
    symbol: 'ADA',
    action: 'BUY',
    quantity: 1000,
    price: 0.4400,
    total: 440.00,
    status: 'rejected',
    timestamp: Date.now() - 10800000,
  },
];

// Helper to format currency
export const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
