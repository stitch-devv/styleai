# StyleAI (React + Supabase)

1. Создай проект на supabase.com → SQL Editor → вставь и запусти `supabase/schema.sql` (таблицы, RLS, 18 товаров).
2. `cp .env.example .env` и впиши Project URL и anon key (Settings → API).
3. `npm install && npm run dev`
4. Админ: зарегистрируйся, затем в SQL Editor: `update profiles set role='admin' where id='<uuid из Auth → Users>';`
5. Деплой: залей в GitHub → Vercel → Import → добавь те же две переменные `VITE_SUPABASE_*`. `vercel.json` уже настроен для роутера.
Anon key публичный — данные защищены политиками RLS, не скрытием кнопок.
