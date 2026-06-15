import { useApp } from '../../context/AppContext'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }

function score(d) {
  const trips   = Math.min(d.monthTrips / 60, 1) * 40
  const income  = Math.min(d.income / 500000, 1) * 30
  const rating  = ((d.rating - 1) / 4) * 20
  const punct   = 10
  return Math.round(trips + income + rating + punct)
}

const MEDAL = ['🥇', '🥈', '🥉']

export default function DashRanking() {
  const { drivers, trips } = useApp()

  const ranked = [...drivers]
    .map(d => ({ ...d, score: score(d) }))
    .sort((a, b) => b.score - a.score)

  const completedTrips = trips.filter(t => t.status === 'completado')
  const tripsPerDriver = (name) => completedTrips.filter(t => t.driver === name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Ranking de Choferes</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Desempeño mensual — peso: viajes 40% · facturación 30% · calificación 20% · puntualidad 10%</p>
      </div>

      {/* TOP 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {ranked.slice(0, 3).map((d, i) => (
          <div key={d.id} style={{ ...g, textAlign: 'center', borderColor: i === 0 ? 'rgba(250,204,21,0.25)' : i === 1 ? 'rgba(156,163,175,0.25)' : 'rgba(180,120,80,0.25)', background: i === 0 ? 'rgba(250,204,21,0.05)' : g.background }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{MEDAL[i]}</div>
            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', margin: '0 auto 12px' }}>{d.avatar}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{d.name.split(' ')[0]}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: i === 0 ? '#facc15' : '#fff', letterSpacing: '-1px' }}>{d.score}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}> pts</span></div>
            <div style={{ display: 'flex', justify: 'center', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              <Stat l="Viajes mes" v={d.monthTrips} />
              <Stat l="Calificación" v={`★ ${d.rating}`} />
              <Stat l="Ingresos" v={fmt(d.income)} />
            </div>
          </div>
        ))}
      </div>

      {/* RANKING COMPLETO */}
      <div style={g}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Tabla completa</h2>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              {['#', 'Chofer', 'Vehículo', 'Viajes mes', 'Total viajes', 'Calificación', 'Ingresos', 'Score'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px', color: i < 3 ? ['#facc15', '#9ca3af', '#b47850'][i] : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: 14 }}>{i < 3 ? MEDAL[i] : `#${i + 1}`}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>{d.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{d.status === 'inactivo' ? '🔴 Inactivo' : d.status === 'en viaje' ? '🟡 En viaje' : '🟢 Disponible'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{d.car}</td>
                <td style={{ padding: '12px', fontSize: 14, fontWeight: 700, color: '#fff' }}>{d.monthTrips}</td>
                <td style={{ padding: '12px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{d.trips}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#facc15', fontSize: 13 }}>★</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{d.rating}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{fmt(d.income)}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, minWidth: 60 }}>
                      <div style={{ width: `${d.score}%`, height: '100%', background: i === 0 ? '#facc15' : i === 1 ? '#9ca3af' : i === 2 ? '#b47850' : 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', width: 30, textAlign: 'right' }}>{d.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ALERTAS DE VENCIMIENTO */}
      <div style={g}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>⚠️ Alertas de documentación</h2>
        {drivers.map(d => {
          const licDays = Math.round((new Date(d.license) - new Date()) / 86400000)
          const vtvDays = d.vtv ? Math.round((new Date(d.vtv) - new Date()) / 86400000) : 999
          const alerts = []
          if (licDays <= 90) alerts.push({ type: 'Licencia', days: licDays })
          if (vtvDays <= 60) alerts.push({ type: 'VTV', days: vtvDays })
          if (!alerts.length) return null
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fb923c' }}>{d.name}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {alerts.map(a => `${a.type}: vence en ${a.days} días`).join(' · ')}
                </div>
              </div>
            </div>
          )
        })}
        {drivers.every(d => {
          const ld = Math.round((new Date(d.license) - new Date()) / 86400000)
          return ld > 90
        }) && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>✓ Sin alertas de vencimiento próximo</p>}
      </div>
    </div>
  )
}

function Stat({ l, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{l}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{v}</span>
    </div>
  )
}
