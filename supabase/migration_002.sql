-- Сохранённые образы стилиста. Запусти в Supabase -> SQL Editor
create table saved_looks(id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text, occasion text, style text, item_ids bigint[] not null, created_at timestamptz default now());
alter table saved_looks enable row level security;
create policy "own looks" on saved_looks for all using(user_id=auth.uid()) with check(user_id=auth.uid());
