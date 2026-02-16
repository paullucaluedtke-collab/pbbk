-- 1. Create Customers Table
create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  address text,
  email text,
  tax_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Customers
alter table customers enable row level security;

create policy "Users can view own customers" on customers
  for select using (auth.uid() = user_id);

create policy "Users can insert own customers" on customers
  for insert with check (auth.uid() = user_id);

create policy "Users can update own customers" on customers
  for update using (auth.uid() = user_id);

create policy "Users can delete own customers" on customers
  for delete using (auth.uid() = user_id);


-- 2. Create Invoices Table
create table invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  customer_id uuid references customers(id) on delete set null,
  invoice_number text not null,
  date date not null,
  due_date date,
  status text check (status in ('Draft', 'Sent', 'Paid', 'Overdue')) default 'Draft',
  subtotal numeric default 0,
  tax_amount numeric default 0,
  total_amount numeric default 0,
  footer_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Invoices
alter table invoices enable row level security;

create policy "Users can view own invoices" on invoices
  for select using (auth.uid() = user_id);

create policy "Users can insert own invoices" on invoices
  for insert with check (auth.uid() = user_id);

create policy "Users can update own invoices" on invoices
  for update using (auth.uid() = user_id);

create policy "Users can delete own invoices" on invoices
  for delete using (auth.uid() = user_id);


-- 3. Create Invoice Items Table
create table invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  unit_price numeric default 0,
  tax_rate numeric default 19,
  total_price numeric default 0
);

-- Enable RLS for Invoice Items (inherit from invoice via join? simpler to just check invoice ownership)
-- Ideally we link to user_id too for simpler RLS, or rely on invoice_id RLS cascade?
-- Supabase best practice: Add user_id to child tables for easier RLS, OR use exists query.
-- Let's add user_id to invoice_items for performance and simplicity in RLS.

alter table invoice_items add column user_id uuid references auth.users not null;

alter table invoice_items enable row level security;

create policy "Users can view own invoice items" on invoice_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own invoice items" on invoice_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own invoice items" on invoice_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own invoice items" on invoice_items
  for delete using (auth.uid() = user_id);
