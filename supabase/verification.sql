-- Add status and verification fields to receipts table
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

-- Update RLS if necessary (usually existing policies cover updates if "owner" is checked)
-- Ensuring the owner can update these fields is covered by existing "Users can update their own receipts" policy.
