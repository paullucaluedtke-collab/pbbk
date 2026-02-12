-- Create a table for public profiles if needed (optional)
-- create table profiles (
--   id uuid references auth.users not null primary key,
--   updated_at timestamp with time zone,
--   username text unique,
--   full_name text,
--   avatar_url text,
--   website text,
--   constraint username_length check (char_length(username) >= 3)
-- );

-- 1. Create Receipts Table
create table receipts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  vendor text,
  category text,
  type text check (type in ('Ausgabe', 'Einnahme')),
  tax_amount numeric default 0,
  total_amount numeric default 0,
  property text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table receipts enable row level security;

-- 3. Create Policies
-- Allow users to view their own receipts
create policy "Users can view own receipts" on receipts
  for select using (auth.uid() = user_id);

-- Allow users to insert their own receipts
create policy "Users can insert own receipts" on receipts
  for insert with check (auth.uid() = user_id);

-- Allow users to update their own receipts
create policy "Users can update own receipts" on receipts
  for update using (auth.uid() = user_id);

-- Allow users to delete their own receipts
create policy "Users can delete own receipts" on receipts
  for delete using (auth.uid() = user_id);

-- 4. Storage Bucket Setup (Note: You must also create the bucket 'receipts' in the dashboard)
-- Policy for Storage: "Give users access to own folder 1ok12a_0"
-- We will use a simpler policy for MVP: Authenticated users can upload to 'receipts' bucket
