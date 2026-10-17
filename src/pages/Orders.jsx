import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../auth'
import { Loading, Empty, ErrorBox } from '../components/State'
export default function Orders() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(async () =>
    ok(await supabase.from('orders').select('id,total,created_at,order_items(qty,unit_price,size,products(name))').eq('user_id', user.id).order('id', { ascending: false })), [user.id])
  return (
    <section>
      <h2>Мои заказы</h2>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !data.length ? <Empty>Заказов пока нет.</Empty> :
        data.map(o => (
          <div key={o.id} className="rev"><b>Заказ №{o.id}</b> · {new Date(o.created_at).toLocaleDateString('ru')} · ${o.total}<br />
            {o.order_items.map(i => `${i.products?.name ?? 'Товар удалён'} (${i.size}) ×${i.qty}`).join(', ')}</div>))}
    </section>
  )
}
