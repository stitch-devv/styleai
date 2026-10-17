import { useState } from 'react'
import { supabase, ok } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../auth'
import { useT } from '../i18n'
import { Loading, ErrorBox } from '../components/State'
const STYLES = ['minimal', 'smart', 'streetwear', 'classic', 'sporty']
export default function Profile() {
  const t = useT()
  const { user } = useAuth()
  const s = useAsync(async () => ok(await supabase.from('profiles').select('display_name,budget,favorite_style').eq('id', user.id).single()), [user.id])
  const [f, setF] = useState(null), [msg, setMsg] = useState('')
  if (s.loading) return <section><Loading /></section>
  if (s.error) return <section><ErrorBox error={s.error} onRetry={s.reload} /></section>
  const v = f || s.data
  const set = k => e => setF({ ...v, [k]: e.target.value })
  const save = async e => {
    e.preventDefault(); setMsg('')
    try { ok(await supabase.from('profiles').update({ display_name: v.display_name, budget: +v.budget, favorite_style: v.favorite_style }).eq('id', user.id)); setMsg(t('Сохранено.')) } catch (x) { setMsg(x.message) }
  }
  return (
    <section style={{ maxWidth: 460 }}>
      <h2>{t('Профиль')}</h2><p className="sub">{user.email}</p>
      <form className="form" onSubmit={save}>
        <label>{t('Имя')}<input value={v.display_name || ''} onChange={set('display_name')} /></label>
        <label>{t('Любимый стиль')}<select value={v.favorite_style} onChange={set('favorite_style')}>{STYLES.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>{t('Бюджет по умолчанию')}<select value={v.budget} onChange={set('budget')}>{[0, 50, 100, 200].map(x => <option key={x} value={x}>{x ? `$${x}` : '0'}</option>)}</select></label>
        <p className="why" role="status">{msg}</p><button className="btn" type="submit">{t('Сохранить')}</button>
      </form>
    </section>
  )
}
