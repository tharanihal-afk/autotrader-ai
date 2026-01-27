import { History, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade, formatNumber } from '@/lib/api';

interface TradeHistoryProps {
  trades: Trade[];
}

export const TradeHistory = ({ trades }: TradeHistoryProps) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: Trade['status']) => {
    switch (status) {
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'approved':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Trade['status']) => {
    switch (status) {
      case 'executed':
        return 'bg-success/20';
      case 'rejected':
      case 'failed':
        return 'bg-destructive/20';
      case 'approved':
        return 'bg-warning/20';
      default:
        return 'bg-muted/20';
    }
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Trade History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <p className="text-muted-foreground text-sm">No trade history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${getStatusColor(trade.status)}`}
                  >
                    {getStatusIcon(trade.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                          trade.action === 'BUY'
                            ? 'bg-success/20 text-success'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {trade.action}
                      </span>
                      <span className="font-medium text-sm">{trade.symbol}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatDate(trade.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs sm:text-sm">
                    {formatNumber(trade.quantity, 4)} @ ${formatNumber(trade.price, 2)}
                  </p>
                  <p
                    className={`text-xs sm:text-sm font-medium capitalize ${
                      trade.status === 'executed'
                        ? 'text-success'
                        : trade.status === 'rejected' || trade.status === 'failed'
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {trade.status}
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
