import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { PortfolioOverview } from '@/components/PortfolioOverview';
import { MarketOverview } from '@/components/MarketOverview';
import { PendingTrades } from '@/components/PendingTrades';
import { TradeHistory } from '@/components/TradeHistory';
import { StatsCards } from '@/components/StatsCards';
import { SettingsDialog } from '@/components/SettingsDialog';
import { supabase } from '@/integrations/supabase/client';
import {
  MarketData,
  Position,
  Trade,
  fetchMarketData,
  fetchPositions,
  fetchPendingTrades,
  fetchTradeHistory,
  fetchSettings,
  approveTrade,
  rejectTrade,
  refreshMarketData,
  runAlgorithm,
} from '@/lib/api';

const ALGORITHM_NAME = "Custom Algorithm v1.0"; // Matches run-algorithm edge function

const Index = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(true);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState(false);
  const [isRunningAlgorithm, setIsRunningAlgorithm] = useState(false);
  const [approvingTradeId, setApprovingTradeId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [market, pos, pending, history, settings] = await Promise.all([
          fetchMarketData(),
          fetchPositions(),
          fetchPendingTrades(),
          fetchTradeHistory(),
          fetchSettings(),
        ]);

        setMarketData(market);
        setPositions(pos);
        setPendingTrades(pending);
        setTradeHistory(history);
        setIsAlgorithmRunning(settings.algorithm_enabled === true || settings.algorithm_enabled === 'true');
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const tradesChannel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades' },
        async () => {
          // Refresh pending and history
          const [pending, history] = await Promise.all([
            fetchPendingTrades(),
            fetchTradeHistory(),
          ]);
          setPendingTrades(pending);
          setTradeHistory(history);
        }
      )
      .subscribe();

    const marketChannel = supabase
      .channel('market-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_data' },
        async () => {
          const market = await fetchMarketData();
          setMarketData(market);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(marketChannel);
    };
  }, []);

  const handleApproveTrade = useCallback(async (trade: Trade) => {
    setApprovingTradeId(trade.id);
    try {
      await approveTrade(trade);
      toast.success(`Trade approved: ${trade.action} ${trade.quantity} ${trade.symbol}`);
      
      // Refresh positions
      const pos = await fetchPositions();
      setPositions(pos);
    } catch (error) {
      console.error('Failed to approve trade:', error);
      // Toast is handled in approveTrade
    } finally {
      setApprovingTradeId(null);
    }
  }, []);

  const handleRejectTrade = useCallback(async (tradeId: string) => {
    try {
      await rejectTrade(tradeId);
      toast.error('Trade rejected');
    } catch (error) {
      console.error('Failed to reject trade:', error);
      toast.error('Failed to reject trade');
    }
  }, []);

  const handleRefreshMarket = useCallback(async () => {
    setIsRefreshingMarket(true);
    try {
      await refreshMarketData();
      const market = await fetchMarketData();
      setMarketData(market);
      toast.success('Market data refreshed');
    } catch (error) {
      console.error('Failed to refresh market:', error);
      toast.error('Failed to refresh market data');
    } finally {
      setIsRefreshingMarket(false);
    }
  }, []);

  const handleRunAlgorithm = useCallback(async () => {
    setIsRunningAlgorithm(true);
    try {
      const result = await runAlgorithm();
      if (result.recommendations > 0) {
        toast.success(`Algorithm found ${result.recommendations} trade opportunities`);
      } else {
        toast.info('No trade opportunities found');
      }
    } catch (error) {
      console.error('Failed to run algorithm:', error);
      toast.error('Failed to run algorithm');
    } finally {
      setIsRunningAlgorithm(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading Quantio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        algorithmName={ALGORITHM_NAME}
        isRunning={isAlgorithmRunning}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Row */}
        <StatsCards trades={tradeHistory} pendingCount={pendingTrades.length} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Portfolio & Market */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <PortfolioOverview positions={positions} marketData={marketData} />
            <MarketOverview
              marketData={marketData}
              onRefresh={handleRefreshMarket}
              isRefreshing={isRefreshingMarket}
            />
          </div>

          {/* Right Column - Pending Trades & History */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <PendingTrades
              trades={pendingTrades}
              onApprove={handleApproveTrade}
              onReject={handleRejectTrade}
              onRunAlgorithm={handleRunAlgorithm}
              isApproving={approvingTradeId}
              isRunningAlgorithm={isRunningAlgorithm}
            />
            <TradeHistory trades={tradeHistory} />
          </div>
        </div>
      </main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        isAlgorithmRunning={isAlgorithmRunning}
        onAlgorithmToggle={setIsAlgorithmRunning}
      />
    </div>
  );
};

export default Index;
