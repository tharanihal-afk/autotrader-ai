import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TradeRequest {
  tradeId: string;
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BINANCE_API_KEY = Deno.env.get("BINANCE_API_KEY");
    const BINANCE_API_SECRET = Deno.env.get("BINANCE_API_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!BINANCE_API_KEY || !BINANCE_API_SECRET) {
      throw new Error("Binance API credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { tradeId, symbol, action, quantity }: TradeRequest = await req.json();

    console.log(`Executing ${action} order for ${quantity} ${symbol}`);

    // Binance API parameters
    const timestamp = Date.now();
    const binanceSymbol = `${symbol}USDT`; // Convert to Binance pair format
    
    const params = new URLSearchParams({
      symbol: binanceSymbol,
      side: action,
      type: "MARKET",
      quantity: quantity.toString(),
      timestamp: timestamp.toString(),
    });

    // Create HMAC signature
    const signature = createHmac("sha256", BINANCE_API_SECRET)
      .update(params.toString())
      .digest("hex");

    params.append("signature", signature);

    // Execute order on Binance
    // NOTE: Using testnet for safety - change to api.binance.com for production
    const binanceUrl = "https://testnet.binance.vision/api/v3/order";
    
    const binanceResponse = await fetch(`${binanceUrl}?${params.toString()}`, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": BINANCE_API_KEY,
      },
    });

    const binanceResult = await binanceResponse.json();
    console.log("Binance response:", JSON.stringify(binanceResult));

    if (!binanceResponse.ok) {
      // Update trade as failed
      await supabase
        .from("trades")
        .update({
          status: "failed",
          error_message: binanceResult.msg || "Binance API error",
        })
        .eq("id", tradeId);

      throw new Error(binanceResult.msg || "Failed to execute trade on Binance");
    }

    // Update trade as executed
    await supabase
      .from("trades")
      .update({
        status: "executed",
        exchange_order_id: binanceResult.orderId?.toString(),
        executed_at: new Date().toISOString(),
      })
      .eq("id", tradeId);

    // Update position
    const { data: existingPosition } = await supabase
      .from("positions")
      .select("*")
      .eq("symbol", symbol)
      .maybeSingle();

    const executedPrice = parseFloat(binanceResult.fills?.[0]?.price || "0");
    const executedQty = parseFloat(binanceResult.executedQty || quantity.toString());

    if (action === "BUY") {
      if (existingPosition) {
        // Update existing position
        const newQty = parseFloat(existingPosition.quantity) + executedQty;
        const newAvgPrice =
          (parseFloat(existingPosition.quantity) * parseFloat(existingPosition.avg_price) +
            executedQty * executedPrice) /
          newQty;

        await supabase
          .from("positions")
          .update({ quantity: newQty, avg_price: newAvgPrice })
          .eq("id", existingPosition.id);
      } else {
        // Create new position
        await supabase.from("positions").insert({
          symbol,
          quantity: executedQty,
          avg_price: executedPrice,
        });
      }
    } else if (action === "SELL" && existingPosition) {
      const newQty = parseFloat(existingPosition.quantity) - executedQty;
      if (newQty <= 0) {
        await supabase.from("positions").delete().eq("id", existingPosition.id);
      } else {
        await supabase
          .from("positions")
          .update({ quantity: newQty })
          .eq("id", existingPosition.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: binanceResult.orderId,
        executedQty: binanceResult.executedQty,
        status: binanceResult.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Trade execution error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
