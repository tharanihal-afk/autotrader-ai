import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * =============================================================================
 * YOUR TRADING ALGORITHM - IMPLEMENT YOUR LOGIC HERE
 * =============================================================================
 * 
 * This function is called periodically to analyze market data and generate
 * trade recommendations. Modify this function to implement your strategy.
 * 
 * @param marketData - Current market data from Binance
 * @param positions - Your current portfolio positions
 * @returns Array of trade recommendations
 */
function analyzeMarket(
  marketData: Array<{
    symbol: string;
    price: number;
    change_24h: number;
    volume_24h: number;
    high_24h: number;
    low_24h: number;
  }>,
  positions: Array<{
    symbol: string;
    quantity: number;
    avg_price: number;
  }>,
  settings: {
    max_position_value: number;
  }
): Array<{
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  confidence: number;
  reason: string;
}> {
  const recommendations: Array<{
    symbol: string;
    action: "BUY" | "SELL";
    quantity: number;
    price: number;
    confidence: number;
    reason: string;
  }> = [];

  // ===========================================================================
  // YOUR ALGORITHM LOGIC STARTS HERE
  // ===========================================================================
  
  // Example: Simple momentum strategy
  // - Buy if price dropped more than 3% (potential rebound)
  // - Sell if price gained more than 5% and we have a position (take profit)

  for (const data of marketData) {
    const position = positions.find((p) => p.symbol === data.symbol);
    
    // Buy signal: Price dropped significantly
    if (data.change_24h < -3 && !position) {
      const quantity = Number((settings.max_position_value / data.price).toFixed(6));
      
      recommendations.push({
        symbol: data.symbol,
        action: "BUY",
        quantity,
        price: data.price,
        confidence: Math.min(90, Math.abs(data.change_24h) * 10),
        reason: `Price dropped ${data.change_24h.toFixed(2)}% - potential rebound opportunity`,
      });
    }
    
    // Sell signal: Price gained and we have position with profit
    if (position && data.change_24h > 5) {
      const profitPercent = ((data.price - position.avg_price) / position.avg_price) * 100;
      
      if (profitPercent > 3) {
        recommendations.push({
          symbol: data.symbol,
          action: "SELL",
          quantity: Number(position.quantity),
          price: data.price,
          confidence: Math.min(95, data.change_24h * 8),
          reason: `Price gained ${data.change_24h.toFixed(2)}% (${profitPercent.toFixed(2)}% profit) - taking profit`,
        });
      }
    }
  }

  // ===========================================================================
  // YOUR ALGORITHM LOGIC ENDS HERE
  // ===========================================================================

  return recommendations;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if algorithm is enabled
    const { data: enabledSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "algorithm_enabled")
      .single();

    if (enabledSetting?.value !== true && enabledSetting?.value !== "true") {
      console.log("Algorithm is disabled");
      return new Response(
        JSON.stringify({ success: true, message: "Algorithm is disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get max position value setting
    const { data: maxPositionSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "max_position_value")
      .single();

    const maxPositionValue = parseFloat(maxPositionSetting?.value || "1000");

    // Fetch current market data
    const { data: marketData, error: marketError } = await supabase
      .from("market_data")
      .select("*");

    if (marketError) throw marketError;

    // Fetch current positions
    const { data: positions, error: positionsError } = await supabase
      .from("positions")
      .select("*");

    if (positionsError) throw positionsError;

    console.log(`Analyzing ${marketData?.length || 0} symbols with ${positions?.length || 0} positions`);

    // Run algorithm
    const recommendations = analyzeMarket(
      marketData || [],
      positions || [],
      { max_position_value: maxPositionValue }
    );

    console.log(`Algorithm generated ${recommendations.length} recommendations`);

    // Insert new pending trades
    for (const rec of recommendations) {
      // Check if there's already a pending trade for this symbol
      const { data: existingTrade } = await supabase
        .from("trades")
        .select("id")
        .eq("symbol", rec.symbol)
        .eq("status", "pending")
        .maybeSingle();

      if (existingTrade) {
        console.log(`Skipping ${rec.symbol} - already has pending trade`);
        continue;
      }

      const { data: newTrade, error: insertError } = await supabase
        .from("trades")
        .insert({
          symbol: rec.symbol,
          action: rec.action,
          quantity: rec.quantity,
          price: rec.price,
          confidence: rec.confidence,
          reason: rec.reason,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Failed to insert trade for ${rec.symbol}:`, insertError);
        continue;
      }

      console.log(`Created pending trade: ${rec.action} ${rec.quantity} ${rec.symbol}`);

      // Send notification for new trade
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "new_trade",
            symbol: rec.symbol,
            action: rec.action,
            quantity: rec.quantity,
            price: rec.price,
            reason: rec.reason,
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analyzed: marketData?.length || 0,
        recommendations: recommendations.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Algorithm execution error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
