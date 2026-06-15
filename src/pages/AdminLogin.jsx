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

  if (adminAuth) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 800))
    if (login(user, pass)) {
      navigate('/admin')
    } else {
      setError('Usuario o contraseña incorrectos')
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
        <p className={styles.hint}>
          Demo: <code>admin</code> / <code>remis123</code>
        </p>
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
