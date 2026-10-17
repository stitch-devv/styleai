import { Link } from 'react-router-dom'
import { useT } from '../i18n'
export default function ProductCard({ p, fav, onFav, onWardrobe }) {
  const t = useT()
  return (
    <article className="card">
      <Link to={`/product/${p.id}`}><span className="sw" style={{ background: p.hex, display: 'block' }} /><h3>{p.name}</h3></Link>
      <p>{p.color} · ${p.price}</p>
      <div className="row">
        <button className="save" onClick={() => onWardrobe(p)}>{t('В гардероб')}</button>
        <button className="fav" aria-pressed={fav} aria-label={`Избранное: ${p.name}`} onClick={() => onFav(p)}>♥</button>
      </div>
    </article>
  )
}
