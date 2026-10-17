import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../auth'
import { buildLooks, lookCost, why, SLOTS } from '../lib/stylist'
import { Loading, ErrorBox, Empty } from '../components/State'
const O = [['everyday', 'На каждый день'], ['work', 'Работа / учёба'], ['date', 'Свидание'], ['travel', 'Поездка']]
const S = [['minimal', 'Минимализм'], ['smart', 'Smart casual'], ['streetwear', 'Стритвир'], ['classic', 'Классика'], ['sporty', 'Спорт']]
const B = [[0, 'Только мой гардероб'], [50, 'До $50'], [100, 'До $100'], [200, 'До $200']]
const lbl = (L, v) => L.find(x => x[0] === v)[1]
const Chips = ({ list, value, onChange, label }) => (
  <fieldset><legend>{label}</legend><div className="chips">
    {list.map(([v, t]) => <button key={v} type="button" className="chip" aria-pressed={value === v} onClick={() => onChange(v)}>{t}</button>)}</div></fieldset>)
export default function Stylist() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [sel, setSel] = useState({ occasion: 'everyday', style: 'minimal', budget: 100 })
  const [looks, setLooks] = useState(null), [offset, setOffset] = useState(0), [note, setNote] = useState('')
  const { data, loading, error, reload } = useAsync(async () => {
    const products = ok(await supabase.from('products').select('*').eq('is_active', true))
    const w = user ? ok(await supabase.from('wardrobe_items').select('product_id')) : []
    return { products, owned: new Set(w.map(i => i.product_id).filter(Boolean)) }
  }, [user])
  const set = k => v => setSel(s => ({ ...s, [k]: v }))
  const go = off => { setOffset(off); setNote(''); setLooks(buildLooks({ ...data, ...sel, offset: off })) }
  const swap = (n, slot) => setLooks(ls => ls.map((l, i) => {
    if (i !== n) return l
    const pool = data.products.filter(p => p.category === slot && p.styles.includes(sel.style))
    return { ...l, [slot]: pool[(pool.findIndex(p => p.id === l[slot].id) + 1) % pool.length] }
  }))
  const save = async l => {
    if (!user) return nav('/login')
    try {
      ok(await supabase.from('saved_looks').insert({ title: `${lbl(O, sel.occasion)}, ${lbl(S, sel.style)}`, occasion: sel.occasion, style: sel.style, item_ids: SLOTS.filter(s => l[s]).map(s => l[s].id) }))
      setNote('Образ сохранён в «Образы».')
    } catch (e) { setNote(e.message) }
  }
  if (loading) return <section><Loading /></section>
  if (error) return <section><ErrorBox error={error} onRetry={reload} /></section>
  return (
    <section>
      <h2>Давай соберём образ</h2>
      <p className="sub">Три ответа, три варианта с объяснением. Вещь можно заменить нажатием.</p>
      <div className="form">
        <Chips label="Какой повод?" list={O} value={sel.occasion} onChange={set('occasion')} />
        <Chips label="Какой стиль ближе?" list={S} value={sel.style} onChange={set('style')} />
        <Chips label="Бюджет на новые вещи" list={B} value={sel.budget} onChange={set('budget')} />
        <div><button className="btn" onClick={() => go(0)}>Подобрать образы</button></div>
      </div>
      <p className="why" role="status" style={{ marginTop: 16 }}>{note}</p>
      {looks && (!looks.length ? <Empty>Не нашли сочетаний. Увеличь бюджет, выбери другой стиль или добавь вещи в гардероб.</Empty> : <>
        <div className="looks">{looks.map((l, n) => (
          <article key={n} className="look"><h3>Образ {n + 1}</h3>
            <div className="slots">{SLOTS.filter(s => l[s]).map(s => (
              <div key={s} className="row" style={{ margin: 0 }}>
                <button className="slot" onClick={() => swap(n, s)} aria-label={`Заменить: ${l[s].name}`}>
                  <span className="sw" style={{ background: l[s].hex }} />
                  <span><b>{l[s].name}</b><small>{data.owned.has(l[s].id) ? 'уже есть' : `$${l[s].price}`}</small></span></button>
                <Link className="chip" to={`/product/${l[s].id}`} style={{ alignSelf: 'center' }}>Открыть</Link>
              </div>))}</div>
            <p className="why">{why(l, data.owned)}</p>
            <div className="tot"><span>Новые покупки<br /><strong>${lookCost(l, data.owned)}</strong></span>
              <button className="save" style={{ flex: 'none' }} onClick={() => save(l)}>Сохранить</button></div>
          </article>))}</div>
        <p style={{ marginTop: 20 }}><button className="chip" onClick={() => go(offset + 3)}>Показать другие</button></p></>)}
    </section>
  )
}
