import { TrendingUp, Activity, Target, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TradeHistory } from '@/lib/mockData';

interface StatsCardsProps {
  trades: TradeHistory[];
  pendingCount: number;
}

export const StatsCards = ({ trades, pendingCount }: StatsCardsProps) => {
  const completedTrades = trades.filter((t) => t.status === 'completed');
  const totalVolume = completedTrades.reduce((sum, t) => sum + t.total, 0);
  const successRate = trades.length > 0
    ? ((completedTrades.length / trades.length) * 100).toFixed(0)
    : '0';

  const stats = [
    {
      label: 'Total Trades',
      value: trades.length.toString(),
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Volume Traded',
      value: `$${(totalVolume / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Pending',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
