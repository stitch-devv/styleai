import { useState } from 'react'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { Loading, Empty, ErrorBox } from '../components/State'
const TABS = [['stats', 'Обзор'], ['products', 'Товары'], ['orders', 'Заказы'], ['reviews', 'Отзывы'], ['users', 'Пользователи']]
const ST = ['placed', 'packed', 'shipped', 'delivered', 'cancelled']
const SL = { placed: 'Оформлен', packed: 'Собирается', shipped: 'В доставке', delivered: 'Доставлен', cancelled: 'Отменён' }
const Box = ({ s, children }) => s.loading ? <Loading /> : s.error ? <ErrorBox error={s.error} onRetry={s.reload} /> : children(s.data)

function Stats() {
  const s = useAsync(async () => {
    const c = t => supabase.from(t).select('id', { count: 'exact', head: true })
    const [p, u, r] = await Promise.all([c('products'), c('profiles'), c('reviews')])
    const o = ok(await supabase.from('orders').select('total,status'))
    return { products: p.count, users: u.count, reviews: r.count, orders: o }
  }, [])
  return <Box s={s}>{d => {
    const rev = d.orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + Number(o.total), 0)
    const by = ST.map(k => [k, d.orders.filter(o => o.status === k).length]), max = Math.max(1, ...by.map(x => x[1]))
    return <>
      <div className="stats">{[['Товары', d.products], ['Пользователи', d.users], ['Заказы', d.orders.length], ['Выручка', '$' + rev.toFixed(0)], ['Отзывы', d.reviews]].map(([k, v]) => <div key={k} className="stat"><b>{v}</b>{k}</div>)}</div>
      <h3 className="h3">Заказы по статусам</h3>
      <div className="bars">{by.map(([k, n]) => <div key={k}><span style={{ width: 110 }}>{SL[k]}</span><span className="f" style={{ width: (n / max * 60) + '%', minWidth: 2 }} />{n}</div>)}</div></>
  }}</Box>
}
const EMPTY = { name: '', category: 'top', color: '', hex: '#888888', styles: 'minimal', price: '', description: '', is_active: true }
function Products() {
  const s = useAsync(async () => ok(await supabase.from('products').select('*').order('id')), [])
  const [f, setF] = useState(null), [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const save = async e => {
    e.preventDefault(); setErr('')
    const row = { name: f.name.trim(), category: f.category, color: f.color, hex: f.hex, styles: String(f.styles).split(',').map(x => x.trim()).filter(Boolean), price: Number(f.price), description: f.description, is_active: f.is_active }
    try { const q = f.id ? supabase.from('products').update(row).eq('id', f.id) : supabase.from('products').insert(row); ok(await q); setF(null); s.reload() } catch (x) { setErr(x.message) }
  }
  const del = async p => { if (confirm(`Удалить «${p.name}»?`)) try { ok(await supabase.from('products').delete().eq('id', p.id)); s.reload() } catch (x) { setErr(x.message) } }
  return <>
    <button className="chip" onClick={() => setF({ ...EMPTY })}>+ Новый товар</button>
    <p className="why" role="alert">{err}</p>
    {f && <form className="form" onSubmit={save} style={{ margin: '12px 0', maxWidth: 560 }}>
      <input required placeholder="Название" value={f.name} onChange={set('name')} />
      <select value={f.category} onChange={set('category')}>{['top', 'bottom', 'shoes', 'outer'].map(c => <option key={c}>{c}</option>)}</select>
      <input placeholder="Цвет (слово)" value={f.color || ''} onChange={set('color')} />
      <input type="color" aria-label="Цвет" value={f.hex} onChange={set('hex')} />
      <input placeholder="Стили через запятую: minimal, smart" value={f.styles} onChange={set('styles')} />
      <input required type="number" min="0" step="0.01" placeholder="Цена" value={f.price} onChange={set('price')} />
      <textarea rows="3" placeholder="Описание" value={f.description || ''} onChange={set('description')} style={{ font: 'inherit', padding: 12 }} />
      <label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} style={{ width: 'auto' }} /> Показывать в каталоге</label>
      <div className="row"><button className="btn" type="submit">Сохранить</button><button className="chip" type="button" onClick={() => setF(null)}>Отмена</button></div></form>}
    <Box s={s}>{rows => <div className="tblwrap"><table className="tbl"><thead><tr><th /><th>Название</th><th>Категория</th><th>Цена</th><th>Активен</th><th /></tr></thead>
      <tbody>{rows.map(p => <tr key={p.id}><td><span className="sw" style={{ display: 'block', width: 28, height: 28, background: p.hex }} /></td><td>{p.name}</td><td>{p.category}</td><td>${p.price}</td><td>{p.is_active ? 'да' : 'нет'}</td>
        <td><button className="chip" onClick={() => setF({ ...p, styles: p.styles.join(', ') })}>Изм.</button> <button className="chip" onClick={() => del(p)}>Удалить</button></td></tr>)}</tbody></table></div>}</Box></>
}
function OrdersAdmin() {
  const s = useAsync(async () => ok(await supabase.from('orders').select('id,total,status,created_at,user_id,order_items(qty)').order('id', { ascending: false })), [])
  const [err, setErr] = useState('')
  const setSt = async (id, status) => { try { ok(await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id)); s.reload() } catch (x) { setErr(x.message) } }
  return <><p className="why" role="alert">{err}</p><Box s={s}>{rows => !rows.length ? <Empty>Заказов нет.</Empty> :
    <div className="tblwrap"><table className="tbl"><thead><tr><th>№</th><th>Дата</th><th>Покупатель</th><th>Позиций</th><th>Сумма</th><th>Статус</th></tr></thead>
      <tbody>{rows.map(o => <tr key={o.id}><td>{o.id}</td><td>{new Date(o.created_at).toLocaleDateString()}</td><td>{o.user_id.slice(0, 8)}</td><td>{o.order_items.reduce((a, i) => a + i.qty, 0)}</td><td>${o.total}</td>
        <td><select value={o.status} onChange={e => setSt(o.id, e.target.value)}>{ST.map(k => <option key={k} value={k}>{SL[k]}</option>)}</select></td></tr>)}</tbody></table></div>}</Box></>
}
function Reviews() {
  const s = useAsync(async () => ok(await supabase.from('reviews').select('id,rating,comment,products(name)').order('id', { ascending: false })), [])
  const del = async id => { if (confirm('Удалить отзыв?')) { ok(await supabase.from('reviews').delete().eq('id', id)); s.reload() } }
  return <Box s={s}>{rows => !rows.length ? <Empty>Отзывов нет.</Empty> : rows.map(r => <div key={r.id} className="rev"><b>{r.products?.name}</b> ★{r.rating}<br />{r.comment}<br /><button className="chip" onClick={() => del(r.id)}>Удалить</button></div>)}</Box>
}
function Users() {
  const s = useAsync(async () => ok(await supabase.from('profiles').select('id,display_name,role,created_at').order('created_at')), [])
  const [err, setErr] = useState('')
  const setRole = async (id, r) => { try { ok(await supabase.rpc('set_role', { uid: id, r })); s.reload() } catch (x) { setErr(x.message) } }
  return <><p className="why" role="alert">{err}</p><Box s={s}>{rows => <div className="tblwrap"><table className="tbl"><thead><tr><th>Имя</th><th>Роль</th><th>Дата</th></tr></thead>
    <tbody>{rows.map(u => <tr key={u.id}><td>{u.display_name}</td><td><select value={u.role} onChange={e => setRole(u.id, e.target.value)}><option>user</option><option>admin</option></select></td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</Box></>
}
export default function Admin() {
  const [tab, setTab] = useState('stats')
  const View = { stats: Stats, products: Products, orders: OrdersAdmin, reviews: Reviews, users: Users }[tab]
  return <section><h2>Админ-панель</h2>
    <div className="chips" style={{ margin: '16px 0 24px' }}>{TABS.map(([k, l]) => <button key={k} className="chip" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
    <View /></section>
}
