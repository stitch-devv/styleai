export const Loading = () => <div className="skeletons" aria-busy="true">{[...Array(4)].map((_, i) => <div key={i} className="sk" />)}</div>
export const Empty = ({ children }) => <div className="empty">{children}</div>
export const ErrorBox = ({ error, onRetry }) => (
  <div className="empty" role="alert">Не удалось загрузить данные: {error.message} <button className="chip" onClick={onRetry}>Повторить</button></div>)
