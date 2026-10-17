-- Этап 2: описания, профиль, статусы заказов, админ-права. Запусти в Supabase -> SQL Editor
alter table products add column description text;
update products set description = case category
 when 'top' then 'Базовая вещь для верха: мягкая ткань, свободная посадка. Легко сочетается с джинсами и брюками, подходит на каждый день.'
 when 'bottom' then 'Удобный низ на каждый день: хорошо держит форму и сочетается с футболками, рубашками и худи.'
 when 'shoes' then 'Универсальная обувь: удобная колодка и нейтральный цвет, подходит к большинству образов.'
 else 'Верхняя одежда на межсезонье: аккуратный крой, поверх базовых вещей собирает образ.' end
where description is null;
alter table profiles add column budget int not null default 100, add column favorite_style text not null default 'minimal';
grant update(display_name, budget, favorite_style) on profiles to authenticated;
alter table orders add column status text not null default 'placed' check(status in('placed','packed','shipped','delivered','cancelled')),
  add column updated_at timestamptz default now();
create policy "admin update orders" on orders for update using(is_admin()) with check(is_admin());
create policy "admin delete reviews" on reviews for delete using(is_admin());
create function set_role(uid uuid, r text) returns void language sql security definer set search_path=public
as $$ update profiles set role=r where id=uid and is_admin() and r in('user','admin') $$;
revoke all on function set_role(uuid,text) from public; grant execute on function set_role(uuid,text) to authenticated;
alter publication supabase_realtime add table orders; -- живое обновление статуса заказа
