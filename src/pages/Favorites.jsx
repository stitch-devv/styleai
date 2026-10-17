import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { Loading, Empty, ErrorBox } from '../components/State'
export default function Favorites() {
  const { data, loading, error, reload } = useAsync(async () => ok(await supabase.from('favorites').select('products(*)')), [])
  const rows = (data || []).map(f => f.products).filter(Boolean)
  return (
    <section>
      <h2>Избранное</h2>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !rows.length ? <Empty>Пока пусто. Нажми ♥ в Discover.</Empty> :
        <div className="wgrid">{rows.map(p => (
          <div key={p.id} className="w"><span className="sw" style={{ display: 'block', background: p.hex }} />{p.name}<small>${p.price}</small></div>))}</div>}
    </section>
  )
}
