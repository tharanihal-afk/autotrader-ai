import { Clock, CheckCircle2, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TradeRecommendation } from '@/lib/algorithm';
import { formatNumber } from '@/lib/mockData';

interface PendingTradesProps {
  trades: TradeRecommendation[];
  onApprove: (tradeId: string) => void;
  onReject: (tradeId: string) => void;
}

export const PendingTrades = ({ trades, onApprove, onReject }: PendingTradesProps) => {
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Pending Trades
          </div>
          {trades.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
              {trades.length} awaiting
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No pending trades</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Algorithm is analyzing market conditions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all animate-slide-up"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        trade.action === 'BUY'
                          ? 'bg-success/20'
                          : 'bg-destructive/20'
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          trade.action === 'BUY' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {trade.symbol}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            trade.action === 'BUY'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {trade.action}
                        </span>
                        <span className="font-semibold">{trade.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(trade.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-semibold">
                      {formatNumber(trade.quantity, 4)} @ ${formatNumber(trade.price, trade.price < 1 ? 4 : 2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${formatNumber(trade.quantity * trade.price, 2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-background/50">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">{trade.reason}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            trade.confidence >= 80
                              ? 'bg-success'
                              : trade.confidence >= 60
                              ? 'bg-warning'
                              : 'bg-muted-foreground'
                          }`}
                          style={{ width: `${trade.confidence}%` }}
                        />
                      </div>
                      <span className={`text-sm font-mono font-medium ${getConfidenceColor(trade.confidence)}`}>
                        {trade.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(trade.id)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove(trade.id)}
                      className="bg-success hover:bg-success/90 text-success-foreground glow-success"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
