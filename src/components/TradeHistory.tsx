import { History, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradeHistory as TradeHistoryType } from '@/lib/mockData';
import { formatNumber } from '@/lib/mockData';

interface TradeHistoryProps {
  trades: TradeHistoryType[];
}

export const TradeHistory = ({ trades }: TradeHistoryProps) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Trade History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No trade history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      trade.status === 'completed'
                        ? trade.action === 'BUY'
                          ? 'bg-success/20'
                          : 'bg-primary/20'
                        : 'bg-destructive/20'
                    }`}
                  >
                    {trade.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          trade.action === 'BUY'
                            ? 'bg-success/20 text-success'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {trade.action}
                      </span>
                      <span className="font-medium">{trade.symbol}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(trade.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm">
                    {formatNumber(trade.quantity, 4)} @ ${formatNumber(trade.price, 2)}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      trade.status === 'completed'
                        ? 'text-foreground'
                        : 'text-destructive'
                    }`}
                  >
                    {trade.status === 'completed'
                      ? `$${formatNumber(trade.total, 2)}`
                      : 'Rejected'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
