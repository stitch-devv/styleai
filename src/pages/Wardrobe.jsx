import { useState } from 'react'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { Loading, Empty, ErrorBox } from '../components/State'
import ManageGrid from '../components/ManageGrid'
import ProductModal from '../components/ProductModal'
import { useT } from '../i18n'
export default function Wardrobe() {
  const t = useT()
  const [open, setOpen] = useState(null)
  const { data, loading, error, reload } = useAsync(async () =>
    ok(await supabase.from('wardrobe_items').select('id,name,hex,category,products(*)').order('id', { ascending: false })), [])
  const del = async ids => { ok(await supabase.from('wardrobe_items').delete().in('id', ids)); reload() }
  const items = (data || []).map(w => ({ id: w.id, name: w.name, hex: w.hex, sub: w.products ? '$' + w.products.price : '',
    full: w.products || { name: w.name, hex: w.hex, color: '', category: w.category } }))
  return (
    <section>
      <h2>My Wardrobe</h2>
      <p className="sub">{t('Вещи, которые у тебя уже есть. Стилист использует их бесплатно.')}</p>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        !items.length ? <Empty>{t('Гардероб пуст. Добавь вещи в Discover.')}</Empty> :
        <ManageGrid items={items} onOpen={i => setOpen(i.full)} onDelete={del} />}
      {open && <ProductModal product={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
