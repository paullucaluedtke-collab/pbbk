-- Add file_hash column to receipts table for duplicate detection
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT * FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'receipts' AND column_name = 'file_hash'
  ) THEN
    ALTER TABLE receipts ADD COLUMN file_hash text;
  END IF;
END $$;

-- Create index on file_hash for faster duplicate lookups
CREATE INDEX IF NOT EXISTS idx_receipts_file_hash ON receipts(user_id, file_hash);

-- Add missing columns to customers table (matching TypeScript type definition)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT * FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'address_line1'
  ) THEN
    ALTER TABLE customers ADD COLUMN address_line1 text;
  END IF;

  IF NOT EXISTS (
    SELECT * FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE customers ADD COLUMN address_line2 text;
  END IF;

  IF NOT EXISTS (
    SELECT * FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'city_zip'
  ) THEN
    ALTER TABLE customers ADD COLUMN city_zip text;
  END IF;

  IF NOT EXISTS (
    SELECT * FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE customers ADD COLUMN payment_terms text DEFAULT '14 Tage netto';
  END IF;
END $$;

-- Create company_settings table if not exists
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  company_name text,
  address_line1 text,
  address_line2 text,
  city_zip text,
  phone text,
  email text,
  website text,
  bank_name text,
  iban text,
  bic text,
  tax_id text,
  vat_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for company_settings
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_settings' AND policyname = 'Users can view own settings'
  ) THEN
    CREATE POLICY "Users can view own settings" ON company_settings
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_settings' AND policyname = 'Users can insert own settings'
  ) THEN
    CREATE POLICY "Users can insert own settings" ON company_settings
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_settings' AND policyname = 'Users can update own settings'
  ) THEN
    CREATE POLICY "Users can update own settings" ON company_settings
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create tax_returns table if not exists
CREATE TABLE IF NOT EXISTS tax_returns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  year integer NOT NULL,
  status text DEFAULT 'Draft' CHECK (status IN ('Draft', 'InProgress', 'Completed', 'Submitted')),
  current_step text DEFAULT 'personal',
  personal_data jsonb DEFAULT '{}',
  income_data jsonb DEFAULT '{}',
  deduction_data jsonb DEFAULT '{}',
  special_expenses_data jsonb DEFAULT '{}',
  extraordinary_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS for tax_returns
ALTER TABLE tax_returns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tax_returns' AND policyname = 'Users can view own tax returns'
  ) THEN
    CREATE POLICY "Users can view own tax returns" ON tax_returns
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tax_returns' AND policyname = 'Users can insert own tax returns'
  ) THEN
    CREATE POLICY "Users can insert own tax returns" ON tax_returns
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tax_returns' AND policyname = 'Users can update own tax returns'
  ) THEN
    CREATE POLICY "Users can update own tax returns" ON tax_returns
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tax_returns' AND policyname = 'Users can delete own tax returns'
  ) THEN
    CREATE POLICY "Users can delete own tax returns" ON tax_returns
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
