// Módulo 4 — Login de Choferes (PIN)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function DriverLogin() {
  const { drivers, setDriverSession } = useApp()
  const navigate = useNavigate()
  const [pin, setPin]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleDigit = (d) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      setLoading(true)
      setTimeout(() => {
        const driver = drivers.find(dr => dr.pin === next)
        if (driver) {
          setDriverSession(driver)
          navigate('/chofer')
        } else {
          setError('PIN incorrecto. Intentá de nuevo.')
          setPin('')
        }
        setLoading(false)
      }, 600)
    }
  }

  const del = () => { setPin(p => p.slice(0, -1)); setError('') }

  const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del']

  return (
    <div style={{ minHeight: '100vh', background: '#080a10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#080a10', margin: '0 auto 14px' }}>R</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Portal Choferes</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Remis Las 4 Estaciones</div>
        </div>

        {/* Card */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28, backdropFilter: 'blur(16px)' }}>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 22 }}>Ingresá tu PIN de 4 dígitos</p>

          {/* Puntos */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', background: i < pin.length ? '#fff' : 'transparent', transition: 'all 0.15s', transform: i < pin.length ? 'scale(1.1)' : 'scale(1)' }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', color: '#f87171', fontSize: 13, marginBottom: 16, padding: '8px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: 8 }}>{error}</div>
          )}

          {/* Teclado */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Verificando...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {KEYS.map((k, i) => (
                k === null ? (
                  <div key={i} />
                ) : k === 'del' ? (
                  <button key={i} onClick={del} style={{ padding: '17px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
                    ⌫
                  </button>
                ) : (
                  <button key={i} onClick={() => handleDigit(String(k))} style={{ padding: '17px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  >{k}</button>
                )
              ))}
            </div>
          )}
        </div>

        {/* Hint (solo dev) */}
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
          {drivers.slice(0, 3).map(d => `${d.name.split(' ')[0]}: PIN ${d.pin}`).join('  ·  ')}
        </div>

        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
