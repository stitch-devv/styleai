import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import { Loading, ErrorBox } from '../components/State'
import { useT } from '../i18n'
export default function Product() {
  const { id } = useParams()
  const { user } = useAuth()
  const { add } = useCart()
  const nav = useNavigate()
  const t = useT()
  const [size, setSize] = useState(null), [note, setNote] = useState(''), [rating, setRating] = useState(5), [text, setText] = useState('')
  useEffect(() => { setSize(null); setNote('') }, [id])
  const { data, loading, error, reload } = useAsync(async () => {
    const p = ok(await supabase.from('products').select('*').eq('id', id).single())
    const reviews = ok(await supabase.from('reviews').select('rating,comment').eq('product_id', id).order('created_at', { ascending: false }))
    const more = ok(await supabase.from('products').select('*').eq('is_active', true).neq('category', p.category).overlaps('styles', p.styles).limit(3))
    return { p, reviews, more }
  }, [id])
  if (loading) return <section><Loading /></section>
  if (error) return <section><ErrorBox error={error} onRetry={reload} /></section>
  const { p, reviews, more } = data
  const sizes = p.category === 'shoes' ? ['39', '40', '41', '42', '43', '44'] : ['XS', 'S', 'M', 'L', 'XL']
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  const toCart = () => { if (!size) return setNote(t('Выбери размер.')); add(p, size); setNote(t('Добавлено в корзину.')) }
  const toWardrobe = async () => {
    if (!user) return nav('/login')
    try { ok(await supabase.from('wardrobe_items').insert({ product_id: p.id, name: p.name, category: p.category, hex: p.hex })); setNote(t('Добавлено в гардероб.')) } catch (e) { setNote(e.message) }
  }
  const review = async () => {
    try { ok(await supabase.from('reviews').upsert({ user_id: user.id, product_id: p.id, rating, comment: text.trim() }, { onConflict: 'user_id,product_id' })); setText(''); reload() } catch (e) { setNote(e.message) }
  }
  return (
    <section>
      <div className="pgrid">
        <span className="sw big" style={{ background: p.hex, display: 'block' }} />
        <div>
          <h2>{p.name}</h2>
          <p className="why">{p.color} · ${p.price} · {avg ? `★ ${avg} (${reviews.length})` : t('нет отзывов')}</p>
          <p className="why">{t('Стили')}: {p.styles.join(', ')}</p>
          <fieldset style={{ margin: '20px 0' }}><legend>{t('Размер')}</legend><div className="chips">
            {sizes.map(s => <button key={s} className="chip" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>)}</div></fieldset>
          <div className="row"><button className="btn" onClick={toCart}>{t('В корзину')}</button><button className="save" onClick={toWardrobe}>{t('В гардероб')}</button></div>
          <p className="why" role="status" style={{ marginTop: 12 }}>{note}</p>
        </div>
      </div>
      <h3 className="h3">Complete the look</h3>
      <div className="wgrid">{more.map(m => (
        <Link key={m.id} className="w" to={`/product/${m.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <span className="sw" style={{ display: 'block', background: m.hex }} />{m.name}<small>${m.price}</small></Link>))}</div>
      <h3 className="h3">{t('Отзывы')}</h3>
      {reviews.map((r, i) => <div key={i} className="rev">★{r.rating}<br />{r.comment}</div>)}
      {!reviews.length && <p className="why">{t('Пока нет отзывов.')}</p>}
      {user ? (
        <div className="form" style={{ marginTop: 16, maxWidth: 480 }}>
          <select aria-label="Оценка" value={rating} onChange={e => setRating(+e.target.value)}>{[5, 4, 3, 2, 1].map(n => <option key={n}>{n}</option>)}</select>
          <textarea rows="3" placeholder={t('Твой отзыв')} value={text} onChange={e => setText(e.target.value)} style={{ font: 'inherit', padding: 12 }} />
          <button className="save" onClick={review}>{t('Оставить отзыв')}</button></div>
      ) : <p className="why"><Link to="/login">{t('Войди')}</Link>{t(', чтобы оставить отзыв.')}</p>}
    </section>
  )
}
