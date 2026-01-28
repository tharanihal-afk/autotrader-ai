import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketData, formatCurrency, formatNumber } from '@/lib/api';

interface MarketOverviewProps {
  marketData: MarketData[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const MarketOverview = ({ marketData, onRefresh, isRefreshing }: MarketOverviewProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Markets
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-2">
          {marketData.map((data) => {
            const isPositive = (data.change_24h || 0) >= 0;
            const isBtc = data.symbol === 'BTC';

            return (
              <div
                key={data.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {data.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-semibold text-sm sm:text-base">{data.symbol}</span>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Vol: {formatCurrency(data.volume_24h || 0)}
                      </p>
                    </div>
                    {isBtc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/btc-chart')}
                        className="h-7 w-7 p-0 hover:bg-primary/20 hover:text-primary"
                        title="View BTC Chart"
                      >
                        <LineChart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-semibold text-sm sm:text-base">
                    ${formatNumber(data.price, data.price < 1 ? 4 : 2)}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 text-xs sm:text-sm ${
                      isPositive ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="font-mono">
                      {isPositive ? '+' : ''}{(data.change_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
