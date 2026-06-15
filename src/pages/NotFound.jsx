import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#080a10', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-2px', marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px' }}>Página no encontrada</h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 24px' }}>
          La dirección que ingresaste no existe o fue movida.
        </p>
        <Link
          to="/"
          style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 12, background: '#fff', color: '#0f1119', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
