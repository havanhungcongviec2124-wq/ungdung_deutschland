-- Run this file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6d5dfc',
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  front text not null,
  back text not null,
  plural text not null default '',
  note text not null default '',
  known boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.folders enable row level security;
alter table public.cards enable row level security;

create policy "Users manage own folders" on public.folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own cards" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists cards_user_folder_idx on public.cards(user_id, folder_id);
create index if not exists folders_user_idx on public.folders(user_id);