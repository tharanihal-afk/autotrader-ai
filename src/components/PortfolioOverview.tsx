import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Position, MarketData, formatCurrency, formatNumber } from '@/lib/api';

interface PortfolioOverviewProps {
  positions: Position[];
  marketData: MarketData[];
}

export const PortfolioOverview = ({ positions, marketData }: PortfolioOverviewProps) => {
  // Calculate current prices from market data
  const getPrice = (symbol: string) => {
    const data = marketData.find((m) => m.symbol === symbol);
    return data?.price || 0;
  };

  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.quantity * getPrice(pos.symbol),
    0
  );

  const totalCost = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.avg_price,
    0
  );

  const totalPnL = totalValue - totalCost;
  const pnlPercentage = totalCost > 0 ? ((totalPnL / totalCost) * 100) : 0;
  const isProfit = totalPnL >= 0;

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-6">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Value</p>
            <p className="text-lg sm:text-2xl font-bold font-mono">{formatCurrency(totalValue)}</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">P&L</p>
            <div className="flex items-center gap-1 sm:gap-2">
              {isProfit ? (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              )}
              <p
                className={`text-lg sm:text-2xl font-bold font-mono ${
                  isProfit ? 'text-success' : 'text-destructive'
                }`}
              >
                {isProfit ? '+' : ''}{formatCurrency(totalPnL)}
              </p>
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Return</p>
            <p
              className={`text-lg sm:text-2xl font-bold font-mono ${
                isProfit ? 'text-success' : 'text-destructive'
              }`}
            >
              {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {positions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">No positions yet</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <div className="hidden sm:grid grid-cols-5 text-xs text-muted-foreground font-medium px-3 py-2">
              <span>Asset</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Avg</span>
              <span className="text-right">Current</span>
              <span className="text-right">P&L</span>
            </div>
            
            {positions.map((position) => {
              const currentPrice = getPrice(position.symbol);
              const pnl = (currentPrice - position.avg_price) * position.quantity;
              const pnlPercent = position.avg_price > 0 
                ? ((currentPrice - position.avg_price) / position.avg_price) * 100 
                : 0;
              const posIsProfit = pnl >= 0;

              return (
                <div
                  key={position.id}
                  className="grid grid-cols-2 sm:grid-cols-5 items-center gap-2 px-2 sm:px-3 py-2 sm:py-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-primary">
                        {position.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">{position.symbol}</span>
                  </div>
                  
                  {/* Mobile: Show P&L on right */}
                  <div className="sm:hidden text-right">
                    <span
                      className={`font-mono font-medium text-sm ${
                        posIsProfit ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {posIsProfit ? '+' : ''}{formatCurrency(pnl)}
                    </span>
                    <span
                      className={`block text-xs ${
                        posIsProfit ? 'text-success/70' : 'text-destructive/70'
                      }`}
                    >
                      {posIsProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Desktop columns */}
                  <span className="hidden sm:block text-right font-mono text-sm">
                    {formatNumber(position.quantity, 4)}
                  </span>
                  <span className="hidden sm:block text-right font-mono text-muted-foreground text-sm">
                    ${formatNumber(position.avg_price)}
                  </span>
                  <span className="hidden sm:block text-right font-mono text-sm">
                    ${formatNumber(currentPrice)}
                  </span>
                  <div className="hidden sm:block text-right">
                    <span
                      className={`font-mono font-medium ${
                        posIsProfit ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {posIsProfit ? '+' : ''}{formatCurrency(pnl)}
                    </span>
                    <span
                      className={`block text-xs ${
                        posIsProfit ? 'text-success/70' : 'text-destructive/70'
                      }`}
                    >
                      {posIsProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
