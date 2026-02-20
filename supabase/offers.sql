-- Create Offers Table
create table offers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  offer_number text not null,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  customer_address text not null,
  date date not null,
  valid_until date,
  items jsonb not null default '[]',
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  status text check (status in ('Draft', 'Sent', 'Accepted', 'Rejected', 'Converted')) default 'Draft',
  converted_invoice_id uuid references invoices(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Offers
alter table offers enable row level security;

create policy "Users can view own offers" on offers
  for select using (auth.uid() = user_id);

create policy "Users can insert own offers" on offers
  for insert with check (auth.uid() = user_id);

create policy "Users can update own offers" on offers
  for update using (auth.uid() = user_id);

create policy "Users can delete own offers" on offers
  for delete using (auth.uid() = user_id);
