import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, isLoggedIn, user, logout } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // If logged in, show account info
  if (isLoggedIn) {
    return (
      <>
        <div className="auth-modal__overlay" onClick={onClose} />
        <div className="auth-modal">
          <button className="auth-modal__close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div className="auth-modal__account">
            <div className="auth-modal__avatar">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </div>
            <h3 className="auth-modal__greeting">Hola, {user.firstName || user.email.split('@')[0]}!</h3>
            <p className="auth-modal__email">{user.email}</p>
            {user.role === 'admin' && <span className="admin-sidebar__user-role" style={{ color: 'var(--accent-color)', fontWeight: '600', display: 'block', margin: '4px 0 15px' }}>Administrador</span>}
            <button className="auth-modal__logout-btn" onClick={() => { logout(); onClose() }}>
              Cerrar sesión
            </button>
            {user.role === 'admin' && (
              <button 
                className="auth-modal__submit" 
                style={{ marginTop: '10px', background: 'var(--accent-color)' }}
                onClick={() => { window.location.href = '/admin'; onClose() }}
              >
                PANEL ADMIN
              </button>
            )}
          </div>
        </div>
      </>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.email, form.password, form.firstName, form.lastName)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Ocurrió un error, intentá de nuevo')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  return (
    <>
      <div className="auth-modal__overlay" onClick={onClose} />
      <div className="auth-modal">
        <button className="auth-modal__close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="auth-modal__title">{mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}</h2>

        {error && <div className="auth-modal__error">{error}</div>}

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-modal__row">
              <div className="auth-modal__field">
                <label className="auth-modal__label">Nombre</label>
                <input className="auth-modal__input" type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Tu nombre" />
              </div>
              <div className="auth-modal__field">
                <label className="auth-modal__label">Apellido</label>
                <input className="auth-modal__input" type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Tu apellido" />
              </div>
            </div>
          )}
          <div className="auth-modal__field">
            <label className="auth-modal__label">Email</label>
            <input className="auth-modal__input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
          </div>
          <div className="auth-modal__field">
            <label className="auth-modal__label">Contraseña</label>
            <input className="auth-modal__input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••" required minLength={6} />
          </div>
          <button className="auth-modal__submit" type="submit" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'INGRESAR' : 'REGISTRARSE'}
          </button>
        </form>

        <div className="auth-modal__switch">
          {mode === 'login' ? (
            <p>¿No tenés cuenta? <button onClick={() => { setMode('register'); setError('') }}>Crear cuenta</button></p>
          ) : (
            <p>¿Ya tenés cuenta? <button onClick={() => { setMode('login'); setError('') }}>Iniciar sesión</button></p>
          )}
        </div>
      </div>
    </>
  )
}
