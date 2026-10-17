import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { Loading, Empty, ErrorBox } from '../components/State'
export default function Wardrobe() {
  const { data, loading, error, reload } = useAsync(async () => ok(await supabase.from('wardrobe_items').select('*').order('id', { ascending: false })), [])
  const remove = async id => { if (confirm('Убрать вещь из гардероба?')) { ok(await supabase.from('wardrobe_items').delete().eq('id', id)); reload() } }
  return (
    <section>
      <h2>My Wardrobe</h2>
      <p className="sub">Вещи, которые у тебя уже есть. Стилист использует их бесплатно.</p>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !data.length ? <Empty>Гардероб пуст. Добавь вещи в Discover.</Empty> :
        <div className="wgrid">{data.map(i => (
          <button key={i.id} className="w" onClick={() => remove(i.id)} aria-label={`Убрать: ${i.name}`}>
            <span className="sw" style={{ display: 'block', background: i.hex }} />{i.name}<small>убрать</small></button>))}</div>}
    </section>
  )
}
