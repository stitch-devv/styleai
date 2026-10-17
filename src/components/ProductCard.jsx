import { Link } from 'react-router-dom'
export default function ProductCard({ p, fav, onFav, onWardrobe }) {
  return (
    <article className="card">
      <Link to={`/product/${p.id}`}><span className="sw" style={{ background: p.hex, display: 'block' }} /><h3>{p.name}</h3></Link>
      <p>{p.color} · ${p.price}</p>
      <div className="row">
        <button className="save" onClick={() => onWardrobe(p)}>В гардероб</button>
        <button className="fav" aria-pressed={fav} aria-label={`Избранное: ${p.name}`} onClick={() => onFav(p)}>♥</button>
      </div>
    </article>
  )
}
