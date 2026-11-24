-- Meine Rezepte: Tagesplanung + Verlauf (2026-11-24)
-- Einmal im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Rein additiv: bestehende Tabellen bleiben unverändert.

create table if not exists public.meal_days (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  recipe_id   uuid references public.recipes(id) on delete set null,
  recipe_name text not null,
  portions    integer not null default 4,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists meal_days_user_day_idx on public.meal_days (user_id, day);

alter table public.meal_days enable row level security;

create policy "meal_days select own" on public.meal_days
  for select to authenticated using (auth.uid() = user_id);
create policy "meal_days insert own" on public.meal_days
  for insert to authenticated with check (auth.uid() = user_id);
create policy "meal_days update own" on public.meal_days
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_days delete own" on public.meal_days
  for delete to authenticated using (auth.uid() = user_id);
