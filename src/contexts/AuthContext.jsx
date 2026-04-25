import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authApi.me(token)
        .then(res => { setUser(res.data.user); setLoading(false) })
        .catch(() => { logout(); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    setToken(res.data.accessToken)
    setUser(res.data.user)
    localStorage.setItem('token', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    return res.data.user
  }

  const register = async (email, password, firstName, lastName) => {
    const res = await authApi.register({ email, password, firstName, lastName })
    setToken(res.data.accessToken)
    setUser(res.data.user)
    localStorage.setItem('token', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    return res.data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
