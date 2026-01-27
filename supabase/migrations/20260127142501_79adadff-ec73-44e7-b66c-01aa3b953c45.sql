-- Trades table to store all executed/pending/rejected trades
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
  quantity DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total DECIMAL GENERATED ALWAYS AS (quantity * price) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'failed')),
  confidence INTEGER,
  reason TEXT,
  exchange_order_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio positions table
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  quantity DECIMAL NOT NULL DEFAULT 0,
  avg_price DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform settings/configuration
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification log
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('email', 'push')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Market data cache (for real-time prices)
CREATE TABLE public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  price DECIMAL NOT NULL,
  change_24h DECIMAL,
  volume_24h DECIMAL,
  high_24h DECIMAL,
  low_24h DECIMAL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (personal use, but good practice)
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Since this is personal use, allow all operations (no user_id needed)
-- In production with multiple users, you'd add user_id and proper policies

CREATE POLICY "Allow all trades" ON public.trades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all positions" ON public.positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all market_data" ON public.market_data FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for trades (for live updates when algorithm creates new pending trades)
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON public.market_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('algorithm_enabled', 'true', 'Whether the trading algorithm is active'),
  ('notification_email', '""', 'Email address for trade notifications'),
  ('max_position_value', '1000', 'Maximum value per position in USD'),
  ('watched_symbols', '["BTC", "ETH", "SOL", "XRP", "ADA", "BNB", "DOGE"]', 'Crypto symbols to monitor');

-- Insert initial market data for common cryptos
INSERT INTO public.market_data (symbol, price, change_24h, volume_24h, high_24h, low_24h) VALUES
  ('BTC', 67432.50, 2.34, 28500000000, 68100.00, 65800.00),
  ('ETH', 3456.78, -1.23, 15200000000, 3520.00, 3380.00),
  ('SOL', 178.45, 5.67, 3800000000, 182.00, 168.00),
  ('XRP', 0.5234, -3.45, 1200000000, 0.5500, 0.5100),
  ('ADA', 0.4567, 1.89, 450000000, 0.4700, 0.4400),
  ('BNB', 612.34, 0.78, 890000000, 620.00, 605.00),
  ('DOGE', 0.1234, -2.15, 560000000, 0.1300, 0.1180);