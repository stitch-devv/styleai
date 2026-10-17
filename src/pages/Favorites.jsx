import { useState } from 'react'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { Loading, Empty, ErrorBox } from '../components/State'
import ManageGrid from '../components/ManageGrid'
import ProductModal from '../components/ProductModal'
import { useT } from '../i18n'
export default function Favorites() {
  const t = useT()
  const [open, setOpen] = useState(null)
  const { data, loading, error, reload } = useAsync(async () => ok(await supabase.from('favorites').select('product_id,products(*)')), [])
  const del = async ids => { ok(await supabase.from('favorites').delete().in('product_id', ids)); reload() }
  const items = (data || []).filter(f => f.products).map(f => ({ id: f.product_id, name: f.products.name, hex: f.products.hex, sub: '$' + f.products.price, full: f.products }))
  return (
    <section>
      <h2>{t('Избранное')}</h2>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !items.length ? <Empty>{t('Пока пусто. Нажми ♥ в Discover.')}</Empty> :
        <ManageGrid items={items} onOpen={i => setOpen(i.full)} onDelete={del} />}
      {open && <ProductModal product={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
