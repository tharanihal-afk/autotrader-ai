import { Clock, CheckCircle2, XCircle, AlertTriangle, Zap, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trade, formatNumber, formatTime } from '@/lib/api';

interface PendingTradesProps {
  trades: Trade[];
  onApprove: (trade: Trade) => void;
  onReject: (tradeId: string) => void;
  onRunAlgorithm: () => void;
  isApproving: string | null;
  isRunningAlgorithm: boolean;
}

export const PendingTrades = ({
  trades,
  onApprove,
  onReject,
  onRunAlgorithm,
  isApproving,
  isRunningAlgorithm,
}: PendingTradesProps) => {
  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Pending Trades
          </div>
          <div className="flex items-center gap-2">
            {trades.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                {trades.length}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRunAlgorithm}
              disabled={isRunningAlgorithm}
              className="h-8 text-xs sm:text-sm"
            >
              <Play className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isRunningAlgorithm ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Run Algorithm</span>
              <span className="sm:hidden">Run</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3 sm:mb-4">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No pending trades</p>
            <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
              Algorithm analyzing market
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all animate-slide-up"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center ${
                        trade.action === 'BUY'
                          ? 'bg-success/20'
                          : 'bg-destructive/20'
                      }`}
                    >
                      <span
                        className={`text-xs sm:text-sm font-bold ${
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
                        <span className="font-semibold text-sm sm:text-base">{trade.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(trade.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-mono font-semibold text-sm sm:text-base">
                      {formatNumber(trade.quantity, 4)} @ ${formatNumber(trade.price, trade.price < 1 ? 4 : 2)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Total: ${formatNumber(trade.total, 2)}
                    </p>
                  </div>
                </div>

                {trade.reason && (
                  <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-background/50">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-muted-foreground">{trade.reason}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 sm:w-20 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (trade.confidence || 0) >= 80
                              ? 'bg-success'
                              : (trade.confidence || 0) >= 60
                              ? 'bg-warning'
                              : 'bg-muted-foreground'
                          }`}
                          style={{ width: `${trade.confidence || 0}%` }}
                        />
                      </div>
                      <span className={`text-sm font-mono font-medium ${getConfidenceColor(trade.confidence)}`}>
                        {trade.confidence || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(trade.id)}
                      disabled={isApproving === trade.id}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive h-8 text-xs sm:text-sm"
                    >
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove(trade)}
                      disabled={isApproving === trade.id}
                      className="bg-success hover:bg-success/90 text-success-foreground glow-success h-8 text-xs sm:text-sm"
                    >
                      {isApproving === trade.id ? (
                        <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-success-foreground border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      )}
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
