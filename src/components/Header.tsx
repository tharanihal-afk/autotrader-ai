import { Activity, Cpu, Zap } from 'lucide-react';

interface HeaderProps {
  algorithmName: string;
  isRunning: boolean;
}

export const Header = ({ algorithmName, isRunning }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse-glow" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-gradient-primary">Crypto</span>
                <span className="text-foreground">Trade</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">
                {algorithmName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isRunning
                    ? 'bg-success animate-pulse'
                    : 'bg-muted-foreground'
                }`}
              />
              <span className="text-sm font-medium">
                {isRunning ? 'Algorithm Active' : 'Paused'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-primary">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
