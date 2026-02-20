-- Add vat_id to existing tables

-- 1. Add vat_id to company_settings table if it doesn't exist
do $$ 
begin 
  if not exists (select * from information_schema.columns where table_schema = 'public' and table_name = 'company_settings' and column_name = 'vat_id') then 
    alter table company_settings add column vat_id text; 
  end if; 
end $$;

-- 2. Add vat_id to customers table if it doesn't exist
do $$ 
begin 
  if not exists (select * from information_schema.columns where table_schema = 'public' and table_name = 'customers' and column_name = 'vat_id') then 
    alter table customers add column vat_id text; 
  end if; 
end $$;

-- 3. Add vat_id to invoices table if it doesn't exist (if you plan to save it on the invoice level directly)
do $$ 
begin 
  if not exists (select * from information_schema.columns where table_schema = 'public' and table_name = 'invoices' and column_name = 'vat_id') then 
    alter table invoices add column vat_id text; 
  end if; 
end $$;
