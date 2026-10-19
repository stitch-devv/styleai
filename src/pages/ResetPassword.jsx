import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useT } from '../i18n'
import { Loading } from '../components/State'
export default function ResetPassword() {
  const t = useT()
  const nav = useNavigate()
  const { user, loading, updatePassword } = useAuth()
  const [pw, setPw] = useState(''), [pw2, setPw2] = useState(''), [msg, setMsg] = useState('')
  if (loading) return <section><Loading /></section>
  if (!user) return (
    <section style={{ maxWidth: 420 }}><h2>{t('Сброс пароля')}</h2>
      <p>{t('Ссылка недействительна или устарела.')}</p><Link className="btn" to="/forgot-password">{t('Запросить новую ссылку')}</Link></section>)
  const submit = async e => {
    e.preventDefault(); setMsg('')
    if (pw.length < 6) return setMsg(t('Пароль: минимум 6 символов.'))
    if (pw !== pw2) return setMsg(t('Пароли не совпадают.'))
    const { error } = await updatePassword(pw)
    if (error) return setMsg(error.message)
    setMsg(t('Пароль изменён.')); setTimeout(() => nav('/discover'), 1200)
  }
  return (
    <section style={{ maxWidth: 420 }}>
      <h2>{t('Новый пароль')}</h2>
      <form className="form" onSubmit={submit}>
        <input type="password" required autoComplete="new-password" placeholder={t('Новый пароль')} value={pw} onChange={e => setPw(e.target.value)} />
        <input type="password" required autoComplete="new-password" placeholder={t('Повтори пароль')} value={pw2} onChange={e => setPw2(e.target.value)} />
        <p className="why" role="status">{msg}</p>
        <button className="btn" type="submit">{t('Сохранить пароль')}</button>
      </form>
    </section>
  )
}
