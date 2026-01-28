import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { XAxis, YAxis, CartesianGrid, Area, AreaChart, Bar, BarChart, ComposedChart, ReferenceLine, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatNumber } from '@/lib/api';

interface PricePoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--muted-foreground))",
  },
};

export default function BtcChart() {
  const navigate = useNavigate();
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);
  const [high24h, setHigh24h] = useState<number>(0);
  const [low24h, setLow24h] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBtcData = async () => {
    try {
      // Get current BTC data from database
      const { data: marketData } = await supabase
        .from('market_data')
        .select('*')
        .eq('symbol', 'BTC')
        .maybeSingle();

      if (marketData) {
        setCurrentPrice(marketData.price);
        setChange24h(marketData.change_24h || 0);
        setHigh24h(marketData.high_24h || 0);
        setLow24h(marketData.low_24h || 0);
      }

      // Fetch historical kline data from Binance via edge function (15-min intervals, 96 points = 24h)
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbol: 'BTCUSDT', klines: true, interval: '15m', limit: 96 }
      });

      if (!error && data?.klines) {
        const formattedData = data.klines.map((kline: (string | number)[]) => ({
          timestamp: kline[0] as number,
          time: new Date(kline[0] as number).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          open: parseFloat(String(kline[1])),
          high: parseFloat(String(kline[2])),
          low: parseFloat(String(kline[3])),
          price: parseFloat(String(kline[4])), // Close price
          volume: parseFloat(String(kline[5])),
        }));
        setPriceHistory(formattedData);
      }
    } catch (error) {
      console.error('Error fetching BTC data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBtcData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchBtcData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBtcData, 30000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = change24h >= 0;
  const priceRange = high24h - low24h;
  const currentPosition = priceRange > 0 ? ((currentPrice - low24h) / priceRange) * 100 : 50;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">₿</span>
                </span>
                Bitcoin
                <span className="text-muted-foreground text-lg">BTC/USDT</span>
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Price Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              <p className="text-xl sm:text-2xl font-mono font-bold">
                ${formatNumber(currentPrice, 2)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">24h Change</p>
              <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-xl sm:text-2xl font-mono font-bold">
                  {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">24h High</p>
              <p className="text-xl sm:text-2xl font-mono font-bold text-success">
                ${formatNumber(high24h, 2)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">24h Low</p>
              <p className="text-xl sm:text-2xl font-mono font-bold text-destructive">
                ${formatNumber(low24h, 2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price Range Indicator */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">24h Price Range</p>
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-destructive via-primary to-success"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-lg"
                style={{ left: `calc(${currentPosition}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
              <span>${formatNumber(low24h, 0)}</span>
              <span>${formatNumber(high24h, 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Price Chart */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Price Chart (24h · 15min intervals)
              </CardTitle>
              <div className="text-xs text-muted-foreground font-mono">
                {priceHistory.length} data points
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              </div>
            ) : priceHistory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ComposedChart data={priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={11}
                    tickMargin={8}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    domain={['dataMin - 50', 'dataMax + 50']}
                    width={75}
                    tickCount={8}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload as PricePoint;
                        const priceChange = data.price - data.open;
                        const priceChangePercent = ((priceChange / data.open) * 100);
                        const isUp = priceChange >= 0;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
                            <p className="text-xs text-muted-foreground mb-2 font-mono">{data.time}</p>
                            <div className="space-y-1 text-sm font-mono">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Open:</span>
                                <span className="text-foreground">${formatNumber(data.open, 2)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">High:</span>
                                <span className="text-success">${formatNumber(data.high, 2)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Low:</span>
                                <span className="text-destructive">${formatNumber(data.low, 2)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Close:</span>
                                <span className="text-foreground font-bold">${formatNumber(data.price, 2)}</span>
                              </div>
                              <div className="flex justify-between gap-4 pt-1 border-t border-border">
                                <span className="text-muted-foreground">Change:</span>
                                <span className={isUp ? 'text-success' : 'text-destructive'}>
                                  {isUp ? '+' : ''}{formatNumber(priceChange, 2)} ({isUp ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Volume:</span>
                                <span className="text-foreground">{formatNumber(data.volume, 4)} BTC</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">No chart data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Volume (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isLoading && priceHistory.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <BarChart data={priceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={23}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toFixed(0)}`}
                    width={45}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload as PricePoint;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-2 shadow-xl">
                            <p className="text-xs text-muted-foreground font-mono">{data.time}</p>
                            <p className="text-sm font-mono font-bold">{formatNumber(data.volume, 4)} BTC</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="volume" 
                    fill="hsl(var(--muted-foreground))"
                    opacity={0.6}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">●</span> Live data from Binance (api.binance.com). 
              Chart displays 15-minute OHLCV candles for the last 24 hours with {priceHistory.length} data points. 
              Auto-refreshes every 30 seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
