import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../auth'
export default function Layout() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme) }, [theme])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  const close = () => setOpen(false)
  return (
    <div className="wrap">
      <header>
        <Link to="/" className="logo" onClick={close}>StyleAI</Link>
        <nav id="menu" className={open ? 'open' : ''} aria-label="Основное меню">
          <NavLink to="/discover" onClick={close}>Discover</NavLink>
          <NavLink to="/wardrobe" onClick={close}>My Wardrobe</NavLink>
          <NavLink to="/favorites" onClick={close}>Избранное</NavLink>
          {user ? <button className="tbtn" onClick={() => { close(); signOut() }}>Выйти</button>
                : <NavLink to="/login" onClick={close}>Войти</NavLink>}
          <button className="tbtn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</button>
        </nav>
        <button className="burger" aria-label="Меню" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(o => !o)}><i /><i /><i /></button>
        <div className={'scrim' + (open ? ' open' : '')} onClick={close} />
      </header>
      <main><Outlet /></main>
    </div>
  )
}
