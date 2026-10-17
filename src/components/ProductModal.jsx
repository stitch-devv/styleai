import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart'
import { useT } from '../i18n'
export default function ProductModal({ product: p, onClose }) {
  const t = useT()
  const { add } = useCart()
  const [size, setSize] = useState(null), [note, setNote] = useState('')
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [onClose])
  const sizes = p.category === 'shoes' ? ['39', '40', '41', '42', '43', '44'] : ['XS', 'S', 'M', 'L', 'XL']
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pan" role="dialog" aria-modal="true" aria-label={p.name}>
        <button className="chip x" onClick={onClose}>{t('Закрыть')}</button>
        <div className="pgrid">
          <span className="sw big" style={{ background: p.hex, display: 'block' }} />
          <div>
            <h2 style={{ fontSize: 34 }}>{p.name}</h2>
            <p className="why">{p.color}{p.price != null && ` · $${p.price}`}</p>
            {p.description && <><h3 className="h3" style={{ fontSize: 20, margin: '20px 0 6px' }}>{t('Описание')}</h3><p>{p.description}</p></>}
            {p.styles?.length > 0 && <p className="why">{t('Стили')}: {p.styles.join(', ')}</p>}
            {p.id && <>
              <fieldset style={{ margin: '16px 0' }}><legend>{t('Размер')}</legend><div className="chips">
                {sizes.map(s => <button key={s} className="chip" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>)}</div></fieldset>
              <div className="row"><button className="btn" onClick={() => size ? (add(p, size), setNote(t('Добавлено в корзину.'))) : setNote(t('Выбери размер.'))}>{t('В корзину')}</button>
                <Link className="chip" to={`/product/${p.id}`} style={{ alignSelf: 'center' }}>{t('Открыть страницу товара')}</Link></div>
              <p className="why" role="status" style={{ marginTop: 10 }}>{note}</p></>}
          </div>
        </div>
      </div>
    </div>
  )
}
