import { TrendingUp, Activity, Target, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Trade } from '@/lib/api';

interface StatsCardsProps {
  trades: Trade[];
  pendingCount: number;
}

export const StatsCards = ({ trades, pendingCount }: StatsCardsProps) => {
  const executedTrades = trades.filter((t) => t.status === 'executed');
  const totalVolume = executedTrades.reduce((sum, t) => sum + t.total, 0);
  const successRate = trades.length > 0
    ? ((executedTrades.length / trades.length) * 100).toFixed(0)
    : '0';

  const stats = [
    {
      label: 'Trades',
      value: trades.length.toString(),
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Volume',
      value: `$${(totalVolume / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Success',
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold font-mono">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
