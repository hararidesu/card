-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,
  member_number TEXT NOT NULL,
  barcode TEXT,
  qr_code TEXT,
  phone_number TEXT,
  url TEXT,
  front_image TEXT NOT NULL,
  back_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an index on created_at for ordering
CREATE INDEX idx_cards_created_at ON cards(created_at DESC);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- In production, you would want to add user authentication
CREATE POLICY "Allow all operations on cards" ON cards
  FOR ALL USING (true) WITH CHECK (true);