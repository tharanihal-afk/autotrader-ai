import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface MarketData {
  id: string;
  symbol: string;
  price: number;
  change_24h: number | null;
  volume_24h: number | null;
  high_24h: number | null;
  low_24h: number | null;
  updated_at: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avg_price: number;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  confidence: number | null;
  reason: string | null;
  exchange_order_id: string | null;
  error_message: string | null;
  created_at: string;
  executed_at: string | null;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | boolean | number | string[];
  description: string | null;
}

// Fetch market data
export async function fetchMarketData(): Promise<MarketData[]> {
  const { data, error } = await supabase
    .from("market_data")
    .select("*")
    .order("symbol");

  if (error) throw error;
  return data || [];
}

// Fetch positions
export async function fetchPositions(): Promise<Position[]> {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .order("symbol");

  if (error) throw error;
  return data || [];
}

// Fetch pending trades
export async function fetchPendingTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Trade[]) || [];
}

// Fetch trade history
export async function fetchTradeHistory(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data as Trade[]) || [];
}

// Fetch settings
export async function fetchSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from("settings").select("*");

  if (error) throw error;

  const settings: Record<string, unknown> = {};
  data?.forEach((s) => {
    settings[s.key] = s.value;
  });
  return settings;
}

// Approve trade
export async function approveTrade(trade: Trade): Promise<void> {
  // Update status to approved first
  const { error: updateError } = await supabase
    .from("trades")
    .update({ status: "approved" })
    .eq("id", trade.id);

  if (updateError) throw updateError;

  // Execute trade via edge function
  const { data, error } = await supabase.functions.invoke("binance-trade", {
    body: {
      tradeId: trade.id,
      symbol: trade.symbol,
      action: trade.action,
      quantity: trade.quantity,
    },
  });

  if (error) {
    toast.error("Failed to execute trade", { description: error.message });
    throw error;
  }

  if (!data?.success) {
    toast.error("Trade execution failed", { description: data?.error });
    throw new Error(data?.error || "Unknown error");
  }

  // Send success notification
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "trade_executed",
        symbol: trade.symbol,
        action: trade.action,
        quantity: trade.quantity,
        price: trade.price,
      },
    });
  } catch (notifyError) {
    console.error("Failed to send notification:", notifyError);
  }
}

// Reject trade
export async function rejectTrade(tradeId: string): Promise<void> {
  const { error } = await supabase
    .from("trades")
    .update({ status: "rejected" })
    .eq("id", tradeId);

  if (error) throw error;
}

// Fetch latest market data from Binance
export async function refreshMarketData(): Promise<void> {
  const { data, error } = await supabase.functions.invoke("fetch-market-data");

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || "Failed to fetch market data");
}

// Run the algorithm
export async function runAlgorithm(): Promise<{ recommendations: number }> {
  const { data, error } = await supabase.functions.invoke("run-algorithm");

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || "Algorithm execution failed");

  return { recommendations: data.recommendations || 0 };
}

// Update setting
export async function updateSetting(key: string, value: Json): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .update({ value })
    .eq("key", key);

  if (error) throw error;
}

// Format currency
export function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
