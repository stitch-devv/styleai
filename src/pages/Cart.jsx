import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, ok } from '../lib/supabase'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import { Empty } from '../components/State'
export default function Cart() {
  const { items, setQty, clear, total } = useCart()
  const { user } = useAuth()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const checkout = async () => {
    if (!user) return nav('/login')
    setBusy(true); setErr('')
    try {
      const o = ok(await supabase.from('orders').insert({ total }).select('id').single())
      ok(await supabase.from('order_items').insert(items.map(i => ({ order_id: o.id, product_id: i.id, size: i.size, qty: i.qty, unit_price: i.price }))))
      clear(); nav('/orders')
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <section style={{ maxWidth: 640 }}>
      <h2>Корзина</h2>
      {!items.length ? <Empty>Корзина пуста. <Link to="/discover">Выбрать вещи</Link>.</Empty> : <>
        {items.map(i => (
          <div key={i.id + i.size} className="slot" style={{ marginBottom: 6 }}>
            <span className="sw" style={{ background: i.hex }} /><span><b>{i.name}</b><small>{i.size} · ${i.price * i.qty}</small></span>
            <span className="chips" style={{ marginLeft: 'auto' }}>
              <button className="chip" aria-label="Меньше" onClick={() => setQty(i.id, i.size, i.qty - 1)}>−</button>{i.qty}
              <button className="chip" aria-label="Больше" onClick={() => setQty(i.id, i.size, i.qty + 1)}>+</button></span></div>))}
        <p style={{ fontSize: 22, margin: '20px 0 12px' }}><b>Итого: ${total}</b></p>
        <p className="why" role="alert">{err}</p>
        <button className="btn" disabled={busy} onClick={checkout}>{busy ? 'Оформляем…' : 'Оформить демо-заказ'}</button>
        <p className="why" style={{ marginTop: 8 }}>Оплата не проводится: это демонстрационный заказ.</p></>}
    </section>
  )
}
