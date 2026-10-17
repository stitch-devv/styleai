import { useState } from 'react'
import { useT } from '../i18n'
export default function ManageGrid({ items, onOpen, onDelete }) {
  const t = useT()
  const [mode, setMode] = useState(false)
  const [sel, setSel] = useState(new Set())
  const toggle = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const exit = () => { setMode(false); setSel(new Set()) }
  const del = async () => { if (sel.size && confirm(t('Удалить выбранные?'))) { await onDelete([...sel]); exit() } }
  return (
    <>
      <div className="chips" style={{ marginBottom: 16 }}>
        {!mode ? <button className="chip" onClick={() => setMode(true)}>{t('Удалить')}</button> : <>
          <button className="chip" disabled={!sel.size} onClick={del}>{t('Удалить выбранные')} ({sel.size})</button>
          <button className="chip" onClick={exit}>{t('Отмена')}</button>
          <span className="why">{t('Отметь карточки для удаления')}</span></>}
      </div>
      <div className="wgrid">{items.map(i => (
        <button key={i.id} className="w" aria-pressed={mode && sel.has(i.id)} onClick={() => mode ? toggle(i.id) : onOpen(i)}>
          <span className="sw" style={{ display: 'block', background: i.hex }} />{i.name}<small>{i.sub}</small>
          {mode && <small>{sel.has(i.id) ? '✓ ' + t('выбрано') : t('нажми, чтобы выбрать')}</small>}
        </button>))}</div>
    </>
  )
}
