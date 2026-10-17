-- StyleAI: запусти целиком в Supabase -> SQL Editor
create table profiles(id uuid primary key references auth.users on delete cascade,
  display_name text, role text not null default 'user' check(role in('user','admin')), created_at timestamptz default now());
create table products(id bigint generated always as identity primary key, name text not null,
  category text not null check(category in('top','bottom','shoes','outer')), color text, hex text,
  styles text[] not null default '{}', price numeric(10,2) not null check(price>=0), is_active boolean not null default true);
create table wardrobe_items(id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  product_id bigint references products on delete set null, name text not null, category text not null, hex text);
create table favorites(user_id uuid not null default auth.uid() references auth.users on delete cascade,
  product_id bigint not null references products on delete cascade, primary key(user_id,product_id));
create table orders(id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  total numeric(10,2) not null, created_at timestamptz default now());
create table order_items(id bigint generated always as identity primary key,
  order_id bigint not null references orders on delete cascade, product_id bigint references products on delete set null,
  size text, qty int not null check(qty>0), unit_price numeric(10,2) not null);
create table reviews(id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  product_id bigint not null references products on delete cascade,
  rating int not null check(rating between 1 and 5), comment text, created_at timestamptz default now(), unique(user_id,product_id));

create function is_admin() returns boolean language sql security definer stable set search_path=public
as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public
as $$ begin insert into profiles(id,display_name) values(new.id,split_part(new.email,'@',1)); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security; alter table products enable row level security;
alter table wardrobe_items enable row level security; alter table favorites enable row level security;
alter table orders enable row level security; alter table order_items enable row level security; alter table reviews enable row level security;

-- роль менять нельзя: разрешаем обновлять только display_name
revoke update on profiles from authenticated; grant update(display_name) on profiles to authenticated;
create policy "own profile read" on profiles for select using(id=auth.uid() or is_admin());
create policy "own profile update" on profiles for update using(id=auth.uid());
create policy "catalog read" on products for select using(is_active or is_admin());
create policy "catalog admin write" on products for all using(is_admin()) with check(is_admin());
create policy "own wardrobe" on wardrobe_items for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own favorites" on favorites for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own orders read" on orders for select using(user_id=auth.uid() or is_admin());
create policy "own orders insert" on orders for insert with check(user_id=auth.uid());
create policy "own order items read" on order_items for select using(exists(select 1 from orders o where o.id=order_id and (o.user_id=auth.uid() or is_admin())));
create policy "own order items insert" on order_items for insert with check(exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "reviews read" on reviews for select using(true);
create policy "own reviews write" on reviews for all using(user_id=auth.uid()) with check(user_id=auth.uid());

insert into products(name,category,color,hex,styles,price) values
('Белая рубашка','top','белый','#F4F4F0','{minimal,classic,smart}',35),
('Чёрная футболка','top','чёрный','#1A1A1A','{minimal,streetwear,sporty}',18),
('Серое худи','top','серый','#8A8D93','{streetwear,sporty}',40),
('Тёмно-синее поло','top','navy','#1F2A44','{classic,smart}',42),
('Бежевый овершёрт','top','бежевый','#C9B79C','{smart,minimal,streetwear}',35),
('Графичная футболка','top','светло-серый','#E4E4E4','{streetwear,sporty}',22),
('Чёрные брюки','bottom','чёрный','#1A1A1A','{classic,smart,minimal}',48),
('Светлые джинсы','bottom','голубой','#8FA6C4','{streetwear,smart,classic,minimal}',45),
('Серые джоггеры','bottom','серый','#6E7178','{sporty,streetwear}',30),
('Чиносы','bottom','камень','#BFB8A8','{smart,classic,minimal}',40),
('Карго оливковые','bottom','оливковый','#5F6B4E','{streetwear}',44),
('Белые кеды','shoes','белый','#F2F2F2','{minimal,streetwear,smart,sporty}',55),
('Чёрные лоферы','shoes','чёрный','#141414','{classic,smart,minimal}',70),
('Беговые кроссовки','shoes','графит','#2B2B2B','{sporty,streetwear}',60),
('Коричневые ботинки','shoes','коричневый','#6B4A32','{classic,streetwear,smart}',85),
('Синий блейзер','outer','navy','#22304F','{classic,smart}',90),
('Чёрный бомбер','outer','чёрный','#161616','{streetwear,sporty,minimal}',65),
('Тренч','outer','песочный','#B9A88C','{classic,minimal,smart}',95);
-- Сделать себя админом (после регистрации): update profiles set role='admin' where id='<твой uuid>';
