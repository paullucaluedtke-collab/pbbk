-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    date date NOT NULL,
    amount numeric(10, 2) NOT NULL,
    purpose text, -- Verwendungszweck
    sender_receiver text, -- Gegenkonto / Name
    status text DEFAULT 'Unmatched' CHECK (status IN ('Unmatched', 'Matched', 'Ignored')),
    matched_receipt_id uuid REFERENCES receipts(id),
    matched_invoice_id uuid REFERENCES invoices(id),
    created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON bank_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON bank_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON bank_transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON bank_transactions FOR DELETE
    USING (auth.uid() = user_id);
