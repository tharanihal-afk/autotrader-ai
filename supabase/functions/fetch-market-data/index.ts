import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if request includes klines parameter
    let body: { symbol?: string; klines?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // No body provided
    }

    // If requesting klines (historical data)
    if (body.klines && body.symbol) {
      console.log(`Fetching klines for ${body.symbol}`);
      const klineResponse = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${body.symbol}&interval=1h&limit=24`
      );
      
      if (!klineResponse.ok) {
        throw new Error(`Binance klines API error: ${klineResponse.status}`);
      }
      
      const klines = await klineResponse.json();
      return new Response(
        JSON.stringify({ success: true, klines }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get watched symbols from settings
    const { data: settingsData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "watched_symbols")
      .single();

    const watchedSymbols: string[] = settingsData?.value || ["BTC", "ETH", "SOL", "XRP", "ADA", "BNB", "DOGE"];

    console.log("Fetching market data for:", watchedSymbols);

    // Fetch 24hr ticker data from Binance
    const binanceSymbols = watchedSymbols.map((s) => `${s}USDT`);
    const symbolsParam = JSON.stringify(binanceSymbols);

    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const tickers: BinanceTicker[] = await response.json();
    console.log(`Received ${tickers.length} tickers from Binance`);

    // Update market_data table
    for (const ticker of tickers) {
      const symbol = ticker.symbol.replace("USDT", "");
      
      await supabase
        .from("market_data")
        .upsert(
          {
            symbol,
            price: parseFloat(ticker.lastPrice),
            change_24h: parseFloat(ticker.priceChangePercent),
            volume_24h: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice),
            high_24h: parseFloat(ticker.highPrice),
            low_24h: parseFloat(ticker.lowPrice),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "symbol" }
        );
    }

    return new Response(
      JSON.stringify({ success: true, updated: tickers.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Market data fetch error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
