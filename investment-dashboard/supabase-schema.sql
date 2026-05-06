create table if not exists public.watchlists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.watchlists enable row level security;

drop policy if exists "Users can read own watchlist" on public.watchlists;
create policy "Users can read own watchlist"
on public.watchlists for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own watchlist" on public.watchlists;
create policy "Users can insert own watchlist"
on public.watchlists for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own watchlist" on public.watchlists;
create policy "Users can update own watchlist"
on public.watchlists for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own watchlist" on public.watchlists;
create policy "Users can delete own watchlist"
on public.watchlists for delete
to authenticated
using (auth.uid() = user_id);
