import { useT } from '../i18n'
export const Loading = () => <div className="skeletons" aria-busy="true">{[...Array(4)].map((_, i) => <div key={i} className="sk" />)}</div>
export const Empty = ({ children }) => <div className="empty">{children}</div>
export function ErrorBox({ error, onRetry }) {
  const t = useT()
  return <div className="empty" role="alert">{t('Не удалось загрузить данные:')} {error.message} <button className="chip" onClick={onRetry}>{t('Повторить')}</button></div>
}
