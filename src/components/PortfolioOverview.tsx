import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioPosition } from '@/lib/algorithm';
import { formatCurrency, formatNumber } from '@/lib/mockData';

interface PortfolioOverviewProps {
  positions: PortfolioPosition[];
}

export const PortfolioOverview = ({ positions }: PortfolioOverviewProps) => {
  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.currentPrice,
    0
  );

  const totalCost = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.avgPrice,
    0
  );

  const totalPnL = totalValue - totalCost;
  const pnlPercentage = ((totalPnL / totalCost) * 100) || 0;
  const isProfit = totalPnL >= 0;

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold font-mono">{formatCurrency(totalValue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <div className="flex items-center gap-2">
              {isProfit ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <p
                className={`text-2xl font-bold font-mono ${
                  isProfit ? 'text-success' : 'text-destructive'
                }`}
              >
                {isProfit ? '+' : ''}{formatCurrency(totalPnL)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Return</p>
            <p
              className={`text-2xl font-bold font-mono ${
                isProfit ? 'text-success' : 'text-destructive'
              }`}
            >
              {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-5 text-xs text-muted-foreground font-medium px-3 py-2">
            <span>Asset</span>
            <span className="text-right">Quantity</span>
            <span className="text-right">Avg Price</span>
            <span className="text-right">Current</span>
            <span className="text-right">P&L</span>
          </div>
          
          {positions.map((position) => {
            const pnl = (position.currentPrice - position.avgPrice) * position.quantity;
            const pnlPercent = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;
            const posIsProfit = pnl >= 0;

            return (
              <div
                key={position.symbol}
                className="grid grid-cols-5 items-center px-3 py-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {position.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <span className="font-semibold">{position.symbol}</span>
                </div>
                <span className="text-right font-mono">
                  {formatNumber(position.quantity, 4)}
                </span>
                <span className="text-right font-mono text-muted-foreground">
                  ${formatNumber(position.avgPrice)}
                </span>
                <span className="text-right font-mono">
                  ${formatNumber(position.currentPrice)}
                </span>
                <div className="text-right">
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
      </CardContent>
    </Card>
  );
};
