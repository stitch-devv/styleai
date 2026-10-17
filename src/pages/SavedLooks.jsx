import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { Link } from 'react-router-dom'
import { Loading, Empty, ErrorBox } from '../components/State'
export default function SavedLooks() {
  const { data, loading, error, reload } = useAsync(async () => {
    const looks = ok(await supabase.from('saved_looks').select('*').order('id', { ascending: false }))
    const ids = [...new Set(looks.flatMap(l => l.item_ids))]
    const ps = ids.length ? ok(await supabase.from('products').select('*').in('id', ids)) : []
    const m = new Map(ps.map(p => [p.id, p]))
    return looks.map(l => ({ ...l, items: l.item_ids.map(i => m.get(i)).filter(Boolean) }))
  }, [])
  const del = async id => { if (confirm('Удалить образ?')) { ok(await supabase.from('saved_looks').delete().eq('id', id)); reload() } }
  return (
    <section>
      <h2>Сохранённые образы</h2>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !data.length ? <Empty>Образов пока нет. <Link to="/stylist">Подбери первый</Link>.</Empty> :
        <div className="looks">{data.map(l => (
          <article key={l.id} className="look"><h3>{l.title}</h3>
            <div className="slots">{l.items.map(p => (
              <Link key={p.id} className="slot" to={`/product/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <span className="sw" style={{ background: p.hex }} /><span><b>{p.name}</b><small>${p.price}</small></span></Link>))}</div>
            <button className="chip" onClick={() => del(l.id)}>Удалить</button></article>))}</div>}
    </section>
  )
}
