/**
 * =============================================================================
 * TRADING ALGORITHM - INSERT YOUR ALGORITHM HERE
 * =============================================================================
 * 
 * This file is where you implement your custom trading algorithm.
 * The algorithm analyzes market data and returns trade recommendations.
 * 
 * The TradingAlgorithm class provides the interface between your logic
 * and the trading platform.
 */

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface TradeRecommendation {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  confidence: number; // 0-100
  reason: string;
  timestamp: number;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

/**
 * YOUR TRADING ALGORITHM CLASS
 * 
 * Modify the `analyze` method to implement your trading logic.
 * The platform will call this method periodically with current market data.
 */
export class TradingAlgorithm {
  private name = "Custom Algorithm v1.0";

  getName(): string {
    return this.name;
  }

  /**
   * ==========================================================================
   * MAIN ALGORITHM ENTRY POINT - IMPLEMENT YOUR LOGIC HERE
   * ==========================================================================
   * 
   * @param marketData - Current market data for all tracked assets
   * @param portfolio - Your current portfolio positions
   * @returns Array of trade recommendations (or empty array for no action)
   * 
   * Example implementation below uses a simple momentum strategy.
   * Replace this with your own algorithm.
   */
  analyze(
    marketData: MarketData[],
    portfolio: PortfolioPosition[]
  ): TradeRecommendation[] {
    const recommendations: TradeRecommendation[] = [];

    // =========================================================================
    // YOUR ALGORITHM LOGIC STARTS HERE
    // =========================================================================

    for (const data of marketData) {
      // Example: Simple momentum strategy
      // Buy if price dropped more than 3% (potential rebound)
      // Sell if price gained more than 5% (take profit)

      const position = portfolio.find(p => p.symbol === data.symbol);
      
      if (data.change24h < -3 && !position) {
        // Buy signal: Price dropped, potential entry point
        recommendations.push({
          id: `rec_${Date.now()}_${data.symbol}_buy`,
          symbol: data.symbol,
          action: 'BUY',
          quantity: this.calculateBuyQuantity(data.price),
          price: data.price,
          confidence: Math.min(90, Math.abs(data.change24h) * 10),
          reason: `Price dropped ${data.change24h.toFixed(2)}% - potential rebound opportunity`,
          timestamp: Date.now(),
        });
      } else if (data.change24h > 5 && position) {
        // Sell signal: Price gained, take profit
        recommendations.push({
          id: `rec_${Date.now()}_${data.symbol}_sell`,
          symbol: data.symbol,
          action: 'SELL',
          quantity: position.quantity,
          price: data.price,
          confidence: Math.min(95, data.change24h * 8),
          reason: `Price gained ${data.change24h.toFixed(2)}% - taking profit`,
          timestamp: Date.now(),
        });
      }
    }

    // =========================================================================
    // YOUR ALGORITHM LOGIC ENDS HERE
    // =========================================================================

    return recommendations;
  }

  /**
   * Helper: Calculate buy quantity based on your strategy
   * Modify this to match your position sizing logic
   */
  private calculateBuyQuantity(price: number): number {
    const maxPositionValue = 1000; // $1000 max per position
    return Number((maxPositionValue / price).toFixed(6));
  }

  /**
   * Optional: Add any helper methods your algorithm needs below
   */
}

// Export singleton instance
export const tradingAlgorithm = new TradingAlgorithm();
