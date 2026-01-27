import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketData } from '@/lib/algorithm';
import { formatCurrency, formatNumber } from '@/lib/mockData';

interface MarketOverviewProps {
  marketData: MarketData[];
}

export const MarketOverview = ({ marketData }: MarketOverviewProps) => {
  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {marketData.map((data) => {
            const isPositive = data.change24h >= 0;

            return (
              <div
                key={data.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-sm font-bold text-primary">
                      {data.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">{data.symbol}</span>
                    <p className="text-xs text-muted-foreground">
                      Vol: {formatCurrency(data.volume24h)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-semibold">
                    ${formatNumber(data.price, data.price < 1 ? 4 : 2)}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 text-sm ${
                      isPositive ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="font-mono">
                      {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
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
