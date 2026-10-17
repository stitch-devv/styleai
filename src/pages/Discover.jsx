import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../auth'
import ProductCard from '../components/ProductCard'
import { Loading, Empty, ErrorBox } from '../components/State'
const PAGE = 12
export default function Discover() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [q, setQ] = useState(''), [cat, setCat] = useState('all'), [sort, setSort] = useState('new'), [page, setPage] = useState(0)
  const [note, setNote] = useState('')
  const { data, loading, error, reload } = useAsync(async () => {
    let r = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true)
    if (q.trim()) r = r.ilike('name', `%${q.trim()}%`)
    if (cat !== 'all') r = r.eq('category', cat)
    r = sort === 'asc' ? r.order('price') : sort === 'desc' ? r.order('price', { ascending: false }) : r.order('id')
    const { data, count, error } = await r.range(page * PAGE, page * PAGE + PAGE - 1)
    if (error) throw error
    return { rows: data, count }
  }, [q, cat, sort, page])
  const favs = useAsync(async () => user ? ok(await supabase.from('favorites').select('product_id')).map(f => f.product_id) : [], [user])
  const set = new Set(favs.data || [])
  const need = fn => async p => { if (!user) return nav('/login'); try { await fn(p) } catch (e) { setNote(e.message) } }
  const toggleFav = need(async p => {
    set.has(p.id) ? ok(await supabase.from('favorites').delete().eq('product_id', p.id))
                  : ok(await supabase.from('favorites').insert({ product_id: p.id }))
    favs.reload()
  })
  const toWardrobe = need(async p => {
    ok(await supabase.from('wardrobe_items').insert({ product_id: p.id, name: p.name, category: p.category, hex: p.hex }))
    setNote(`«${p.name}» добавлено в гардероб.`)
  })
  const pages = data ? Math.ceil(data.count / PAGE) : 0
  const f = fn => e => { fn(e.target.value); setPage(0) }
  return (
    <section>
      <h2>Discover</h2>
      <div className="tools">
        <input type="search" placeholder="Поиск по названию" aria-label="Поиск" value={q} onChange={f(setQ)} />
        <select aria-label="Категория" value={cat} onChange={f(setCat)}>
          <option value="all">Все категории</option><option value="top">Верх</option><option value="bottom">Низ</option>
          <option value="shoes">Обувь</option><option value="outer">Верхняя одежда</option></select>
        <select aria-label="Сортировка" value={sort} onChange={f(setSort)}>
          <option value="new">По умолчанию</option><option value="asc">Цена ниже</option><option value="desc">Цена выше</option></select>
      </div>
      <p className="why" role="status">{note}</p>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !data.rows.length ? <Empty>Ничего не найдено. <button className="chip" onClick={() => { setQ(''); setCat('all'); setSort('new'); setPage(0) }}>Сбросить фильтры</button></Empty> :
        <div className="dgrid">{data.rows.map(p => <ProductCard key={p.id} p={p} fav={set.has(p.id)} onFav={toggleFav} onWardrobe={toWardrobe} />)}</div>}
      {pages > 1 && <div className="chips" style={{ marginTop: 24 }}>
        <button className="chip" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Назад</button>
        <span className="why">{page + 1} / {pages}</span>
        <button className="chip" disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}>Вперёд</button></div>}
    </section>
  )
}
