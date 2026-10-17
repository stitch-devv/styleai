import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import { useLang, useT } from '../i18n'
export default function Layout() {
  const { user, role, signOut } = useAuth()
  const { count } = useCart()
  const { lang, setLang } = useLang()
  const t = useT()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme) }, [theme])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  const close = () => setOpen(false)
  const L = (to, label) => <NavLink to={to} onClick={close}>{label}</NavLink>
  return (
    <div className="wrap">
      <header>
        <Link to="/" className="logo" onClick={close}>StyleAI</Link>
        <nav id="menu" className={open ? 'open' : ''} aria-label="Menu">
          {L('/discover', 'Discover')}{L('/stylist', 'AI Stylist')}{L('/wardrobe', 'My Wardrobe')}
          {L('/favorites', t('Избранное'))}{L('/saved-looks', t('Образы'))}{L('/orders', t('Заказы'))}
          {L('/cart', `${t('Корзина')} (${count})`)}
          {user && L('/profile', t('Профиль'))}{role === 'admin' && L('/admin', t('Админ'))}
          {user ? <button className="tbtn" onClick={() => { close(); signOut() }}>{t('Выйти')}</button> : L('/login', t('Войти'))}
          <select className="tbtn" aria-label="Language" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="ru">RU</option><option value="en">EN</option><option value="ky">KY</option></select>
          <button className="tbtn" onClick={() => setTheme(x => x === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? t('Светлая тема') : t('Тёмная тема')}</button>
        </nav>
        <button className="burger" aria-label="Menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(o => !o)}><i /><i /><i /></button>
        <div className={'scrim' + (open ? ' open' : '')} onClick={close} />
      </header>
      <main><Outlet /></main>
    </div>
  )
}
