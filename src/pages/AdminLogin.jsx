import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const { login, adminAuth } = useApp()
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState(0)

  if (adminAuth) return <Navigate to="/admin" replace />

  const MAX_ATTEMPTS = 5
  const LOCK_MS = 30000

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Date.now() < lockUntil) {
      const secs = Math.ceil((lockUntil - Date.now()) / 1000)
      setError(`Demasiados intentos. Esperá ${secs} segundos.`)
      return
    }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 800))
    if (login(user, pass)) {
      setAttempts(0)
      navigate('/admin')
    } else {
      const n = attempts + 1
      setAttempts(n)
      if (n >= MAX_ATTEMPTS) {
        setLockUntil(Date.now() + LOCK_MS)
        setError(`Demasiados intentos fallidos. Cuenta bloqueada 30 segundos.`)
      } else {
        setError(`Usuario o contraseña incorrectos (${n}/${MAX_ATTEMPTS})`)
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>R</div>
          <span className={styles.logoText}>RemisYA</span>
        </div>
        <h1 className={styles.title}>Panel de Administración</h1>
        {import.meta.env.DEV && (
          <p className={styles.hint}>
            Demo: <code>admin</code> / <code>remis123</code>
          </p>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Usuario</label>
            <input
              className={styles.input}
              type="text"
              placeholder="admin"
              value={user}
              onChange={e => setUser(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.btnLogin} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Ingresar'}
          </button>
        </form>
        <button className={styles.backLink} onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
