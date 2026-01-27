import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { PortfolioOverview } from '@/components/PortfolioOverview';
import { MarketOverview } from '@/components/MarketOverview';
import { PendingTrades } from '@/components/PendingTrades';
import { TradeHistory } from '@/components/TradeHistory';
import { StatsCards } from '@/components/StatsCards';
import { tradingAlgorithm } from '@/lib/algorithm';
import {
  mockMarketData,
  mockPortfolio,
  mockPendingTrades,
  mockTradeHistory,
  TradeHistory as TradeHistoryType,
} from '@/lib/mockData';
import { TradeRecommendation } from '@/lib/algorithm';

const Index = () => {
  const [pendingTrades, setPendingTrades] = useState<TradeRecommendation[]>(mockPendingTrades);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryType[]>(mockTradeHistory);
  const [isAlgorithmRunning] = useState(true);

  const handleApproveTrade = useCallback((tradeId: string) => {
    const trade = pendingTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    // Move trade from pending to history as completed
    setPendingTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setTradeHistory((prev) => [
      {
        id: `trade_${Date.now()}`,
        symbol: trade.symbol,
        action: trade.action,
        quantity: trade.quantity,
        price: trade.price,
        total: trade.quantity * trade.price,
        status: 'completed',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    toast.success(`Trade approved: ${trade.action} ${trade.quantity} ${trade.symbol}`, {
      description: `Executed at $${trade.price.toFixed(2)}`,
    });
  }, [pendingTrades]);

  const handleRejectTrade = useCallback((tradeId: string) => {
    const trade = pendingTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    // Move trade from pending to history as rejected
    setPendingTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setTradeHistory((prev) => [
      {
        id: `trade_${Date.now()}`,
        symbol: trade.symbol,
        action: trade.action,
        quantity: trade.quantity,
        price: trade.price,
        total: trade.quantity * trade.price,
        status: 'rejected',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    toast.error(`Trade rejected: ${trade.action} ${trade.symbol}`);
  }, [pendingTrades]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        algorithmName={tradingAlgorithm.getName()}
        isRunning={isAlgorithmRunning}
      />

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats Row */}
        <StatsCards trades={tradeHistory} pendingCount={pendingTrades.length} />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Portfolio & Market */}
          <div className="col-span-5 space-y-6">
            <PortfolioOverview positions={mockPortfolio} />
            <MarketOverview marketData={mockMarketData} />
          </div>

          {/* Right Column - Pending Trades & History */}
          <div className="col-span-7 space-y-6">
            <PendingTrades
              trades={pendingTrades}
              onApprove={handleApproveTrade}
              onReject={handleRejectTrade}
            />
            <TradeHistory trades={tradeHistory} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
