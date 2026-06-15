import { useApp } from '../../context/AppContext'

const g = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 22, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }

export default function DashAudit() {
  const { auditLog } = useApp()

  const fmt = (iso) => {
    const d = new Date(iso)
    return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const actionColor = (action) => {
    if (action === 'Login' || action === 'Logout') return '#60a5fa'
    if (action === 'Reserva') return '#4ade80'
    if (action === 'Asignación' || action === 'Estado viaje') return '#fb923c'
    if (action === 'Configuración' || action === 'Tarifas') return '#facc15'
    if (action === 'Chofer') return '#34d399'
    if (action === 'Finanzas') return '#a78bfa'
    if (action === 'Clientes') return '#f87171'
    return 'rgba(255,255,255,0.4)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Registro de Auditoría</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>{auditLog.length} registros · acciones administrativas del sistema</p>
      </div>

      <div style={g}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {auditLog.map((entry, i) => (
            <div key={entry.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '11px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: actionColor(entry.action), marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: actionColor(entry.action), background: `${actionColor(entry.action)}18`, padding: '1px 7px', borderRadius: 999 }}>{entry.action}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{fmt(entry.ts)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{entry.detail}</div>
              </div>
            </div>
          ))}
          {auditLog.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '32px 0' }}>Sin registros de auditoría.</p>}
        </div>
      </div>
    </div>
  )
}
