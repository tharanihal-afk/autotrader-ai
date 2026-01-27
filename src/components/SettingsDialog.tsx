import { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fetchSettings, updateSetting } from '@/lib/api';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAlgorithmRunning: boolean;
  onAlgorithmToggle: (enabled: boolean) => void;
}

export const SettingsDialog = ({
  open,
  onOpenChange,
  isAlgorithmRunning,
  onAlgorithmToggle,
}: SettingsDialogProps) => {
  const [maxPositionValue, setMaxPositionValue] = useState('1000');
  const [watchedSymbols, setWatchedSymbols] = useState('BTC,ETH,SOL,XRP,ADA,BNB,DOGE');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSettings().then((settings) => {
        if (settings.max_position_value) {
          setMaxPositionValue(String(settings.max_position_value));
        }
        if (settings.watched_symbols) {
          const symbols = Array.isArray(settings.watched_symbols)
            ? settings.watched_symbols.join(',')
            : String(settings.watched_symbols);
          setWatchedSymbols(symbols);
        }
      });
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting('max_position_value', maxPositionValue);
      await updateSetting(
        'watched_symbols',
        watchedSymbols.split(',').map((s) => s.trim().toUpperCase())
      );
      await updateSetting('algorithm_enabled', isAlgorithmRunning);
      toast.success('Settings saved');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your Quantio trading platform settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Algorithm Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Algorithm Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable automatic trade recommendations
              </p>
            </div>
            <Switch
              checked={isAlgorithmRunning}
              onCheckedChange={onAlgorithmToggle}
            />
          </div>

          <Separator />

          {/* Max Position Value */}
          <div className="space-y-2">
            <Label htmlFor="maxPosition">Max Position Value (USD)</Label>
            <Input
              id="maxPosition"
              type="number"
              value={maxPositionValue}
              onChange={(e) => setMaxPositionValue(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Maximum amount to invest per trade recommendation
            </p>
          </div>

          {/* Watched Symbols */}
          <div className="space-y-2">
            <Label htmlFor="symbols">Watched Symbols</Label>
            <Input
              id="symbols"
              value={watchedSymbols}
              onChange={(e) => setWatchedSymbols(e.target.value)}
              placeholder="BTC,ETH,SOL"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of crypto symbols to monitor
            </p>
          </div>

          <Separator />

          {/* API Configuration Info */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">API Configuration</p>
                <p className="text-xs text-muted-foreground">
                  Binance API keys and notification email are configured via environment secrets in the backend. 
                  Contact your administrator to update these settings.
                </p>
                <div className="text-xs space-y-1 mt-2">
                  <p className="text-muted-foreground">Required secrets:</p>
                  <ul className="list-disc list-inside text-muted-foreground/80 space-y-0.5">
                    <li>BINANCE_API_KEY</li>
                    <li>BINANCE_API_SECRET</li>
                    <li>RESEND_API_KEY</li>
                    <li>NOTIFICATION_EMAIL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
