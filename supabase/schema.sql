create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  plan text not null default 'free' check (plan in ('free','pro','lifetime')),
  created_at timestamptz not null default now()
);
create table if not exists public.stock (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, brand text, category text, size text, condition text, buy_price numeric(12,2) default 0,
  target_price numeric(12,2) default 0, location text, status text, photo text, created_at timestamptz not null default now()
);
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.stock(id) on delete set null, price numeric(12,2) default 0, cost numeric(12,2) default 0,
  fees numeric(12,2) default 0, status text, payment_status text, created_at timestamptz not null default now()
);
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  category text, amount numeric(12,2) not null default 0, description text, date date not null default current_date
);
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text, stripe_subscription_id text, plan text not null default 'free' check (plan in ('free','pro','lifetime')),
  status text, current_period_end timestamptz, created_at timestamptz not null default now(), unique(user_id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email,name) values (new.id,new.email,coalesce(new.raw_user_meta_data->>'name','')) on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.stock enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.subscriptions enable row level security;

create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);
create policy stock_all_own on public.stock for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy sales_all_own on public.sales for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy expenses_all_own on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy subscriptions_select_own on public.subscriptions for select using (auth.uid() = user_id);
