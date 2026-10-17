import { useEffect } from 'react'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../auth'
import { useT } from '../i18n'
import { Loading, Empty, ErrorBox } from '../components/State'
const STEPS = ['placed', 'packed', 'shipped', 'delivered']
const LABEL = { placed: 'Заказ оформлен', packed: 'Собираем заказ', shipped: 'Передан в доставку', delivered: 'Доставлен', cancelled: 'Отменён' }
export default function Orders() {
  const t = useT()
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(async () =>
    ok(await supabase.from('orders').select('id,total,status,created_at,order_items(qty,unit_price,size,products(name,hex))').eq('user_id', user.id).order('id', { ascending: false })), [user.id])
  useEffect(() => {
    const ch = supabase.channel('orders-' + user.id).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => reload()).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user.id]) // eslint-disable-line
  return (
    <section>
      <div className="chips" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>{t('Мои заказы')}</h2><button className="chip" onClick={reload}>{t('Обновить')}</button></div>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !data.length ? <Empty>{t('Заказов пока нет.')}</Empty> :
        data.map(o => { const idx = STEPS.indexOf(o.status); return (
          <article key={o.id} className="order">
            <div className="oh"><div><b>{t('Заказ')} №{o.id}</b><small>{new Date(o.created_at).toLocaleDateString()}</small></div>
              <span className={'badge ' + o.status}>{t(LABEL[o.status])}</span></div>
            {o.status !== 'cancelled' && <ol className="track">{STEPS.map((s, i) => <li key={s} className={i <= idx ? 'done' : ''}><i />{t(LABEL[s])}</li>)}</ol>}
            <div className="oi">{o.order_items.map((i, n) => (
              <div key={n}><span className="sw" style={{ background: i.products?.hex || '#888' }} />
                <span style={{ flex: 1 }}>{i.products?.name ?? '—'}<small className="why" style={{ display: 'block' }}>{i.size} · ×{i.qty}</small></span>
                <b>${(i.unit_price * i.qty).toFixed(0)}</b></div>))}</div>
            <div className="of"><span>{t('Итого')}</span><b>${o.total}</b></div>
          </article>) })}
    </section>
  )
}
