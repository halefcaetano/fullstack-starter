// src/auth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import API from './api' // your axios/fetch wrapper

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const json = localStorage.getItem('user')
    return json ? JSON.parse(json) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  // persist to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')

    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [user, token])

  // keep API Authorization header in sync (if using axios)
  useEffect(() => {
    if (API?.defaults) {
      if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete API.defaults.headers.common['Authorization']
      }
    }
  }, [token])

  async function register({ username, email, password }) {
    const { data } = await API.post('/auth/register', { username, email, password })
    setUser(data.user)
    setToken(data.token)
    return data.user
  }

  async function login({ email, password }) {
    const { data } = await API.post('/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
    return data.user
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  const value = useMemo(() => ({ user, token, register, login, logout }), [user, token])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
