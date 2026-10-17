import { useState, useEffect, useCallback } from 'react'
export function useAsync(fn, deps) {
  const [s, set] = useState({ data: null, error: null, loading: true })
  const run = useCallback(() => {
    set(p => ({ ...p, loading: true, error: null }))
    fn().then(data => set({ data, error: null, loading: false })).catch(error => set({ data: null, error, loading: false }))
  }, deps) // eslint-disable-line
  useEffect(run, [run])
  return { ...s, reload: run }
}
