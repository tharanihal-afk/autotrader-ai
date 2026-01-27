import { Activity, Cpu, Zap, Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface HeaderProps {
  algorithmName: string;
  isRunning: boolean;
  onSettingsClick: () => void;
}

export const Header = ({ algorithmName, isRunning, onSettingsClick }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-primary rounded-full animate-pulse-glow" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-gradient-primary">Quantio</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 px-3 lg:px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground truncate max-w-[150px] lg:max-w-none">
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
                {isRunning ? 'Active' : 'Paused'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-primary">LIVE</span>
            </div>

            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-xs font-mono text-primary">LIVE</span>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card border-border">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {algorithmName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isRunning
                          ? 'bg-success animate-pulse'
                          : 'bg-muted-foreground'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      Algorithm {isRunning ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSettingsClick();
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
