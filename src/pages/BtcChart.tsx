import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatNumber } from '@/lib/api';

interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
}

const chartConfig = {
  price: {
    label: "BTC Price",
    color: "hsl(var(--primary))",
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

      // Fetch historical kline data from Binance via edge function
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbol: 'BTCUSDT', klines: true }
      });

      if (!error && data?.klines) {
        const formattedData = data.klines.map((kline: number[]) => ({
          timestamp: kline[0],
          time: new Date(kline[0]).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          price: parseFloat(String(kline[4])), // Close price
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

        {/* Main Chart */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Price Chart (Last 24 Hours)
            </CardTitle>
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
                <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => [`$${formatNumber(value as number, 2)}`, 'Price']}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">No chart data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">●</span> Chart updates every 30 seconds with live data from Binance. 
              Displaying hourly candle close prices for the last 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
