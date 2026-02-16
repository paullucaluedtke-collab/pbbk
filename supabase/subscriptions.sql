-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    customer_id uuid REFERENCES customers(id) NOT NULL,
    interval text NOT NULL CHECK (interval IN ('monthly', 'quarterly', 'yearly')),
    next_run date NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    template_data jsonb NOT NULL, -- Stores { items: [], taxRate: 19, ... }
    created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
    ON subscriptions FOR DELETE
    USING (auth.uid() = user_id);
