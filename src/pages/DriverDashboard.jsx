// Módulo 4 — Dashboard del Chofer
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DRIVER_NEXT = {
  asignado:      [{ s: 'chofer_camino', label: '🚗 Estoy en camino', c: '#fb923c' }],
  chofer_camino: [{ s: 'chofer_llego', label: '📍 Llegué al punto', c: '#facc15' }],
  chofer_llego:  [{ s: 'a_bordo', label: '🧑 Pasajero a bordo', c: '#34d399' }],
  a_bordo:       [{ s: 'en_curso', label: '▶ Iniciar viaje', c: '#4ade80' }],
  en_curso:      [{ s: 'completado', label: '✓ Viaje completado', c: '#4ade80' }],
  completado:    [],
  cancelado:     [],
}

const STATE_LABEL = {
  asignado:      { l: 'Asignado',         c: '#60a5fa' },
  chofer_camino: { l: 'En camino',         c: '#fb923c' },
  chofer_llego:  { l: 'Llegué',            c: '#facc15' },
  a_bordo:       { l: 'Pasajero a bordo',  c: '#34d399' },
  en_curso:      { l: 'En curso',          c: '#4ade80' },
  completado:    { l: 'Completado',         c: '#4ade80' },
  cancelado:     { l: 'Cancelado',          c: '#f87171' },
}

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function DriverDashboard() {
  const { driverSession, clearDriverSession, trips, updateTripStatus, updateDriverStatus, drivers } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('activos')

  if (!driverSession) return <Navigate to="/chofer/login" replace />

  const driver = drivers.find(d => d.id === driverSession.id) || driverSession
  const myTrips = trips.filter(t => t.driver === driver.name)
  const active  = myTrips.filter(t => !['completado', 'cancelado'].includes(t.status))
  const history = myTrips.filter(t => ['completado', 'cancelado'].includes(t.status))

  const logout = () => { clearDriverSession(); navigate('/chofer/login') }

  const setAvail = (status) => updateDriverStatus(driver.id, status)

  return (
    <div style={{ minHeight: '100vh', background: '#080a10', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* HEADER */}
      <header style={{ background: 'rgba(12,14,22,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{driver.avatar}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{driver.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{driver.car} · {driver.plate}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={driver.status} onChange={e => setAvail(e.target.value)} style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 9, color: '#fff', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="disponible">🟢 Disponible</option>
            <option value="en viaje">🟡 En viaje</option>
            <option value="inactivo">⚫ Inactivo</option>
          </select>
          <button onClick={logout} style={{ padding: '7px 14px', background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 9, color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Salir
          </button>
        </div>
      </header>

      <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { l: 'Viajes activos', v: active.length,   c: '#60a5fa' },
            { l: 'Este mes',      v: driver.monthTrips, c: '#4ade80' },
            { l: 'Calificación',  v: `⭐ ${driver.rating}`, c: '#facc15' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 5 }}>
          {[{ k: 'activos', l: `Activos (${active.length})` }, { k: 'historial', l: `Historial (${history.length})` }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', background: tab === t.k ? 'rgba(255,255,255,0.10)' : 'transparent', color: tab === t.k ? '#fff' : 'rgba(255,255,255,0.35)' }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* VIAJES */}
        {(tab === 'activos' ? active : history).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
            {tab === 'activos' ? '✅ Sin viajes activos por ahora' : 'Sin historial de viajes'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(tab === 'activos' ? active : history).map(trip => {
              const st = STATE_LABEL[trip.status] || { l: trip.status, c: '#fff' }
              const nexts = DRIVER_NEXT[trip.status] || []
              return (
                <div key={trip.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{trip.id}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: st.c, background: `${st.c}18`, padding: '3px 10px', borderRadius: 999 }}>● {st.l}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', width: 30 }}>📍</span>
                      <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{trip.from}</span>
                    </div>
                    <div style={{ marginLeft: 30, width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', width: 30 }}>🏁</span>
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{trip.to}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: nexts.length > 0 ? 14 : 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <span>👤 {trip.customer}</span>
                    <span>📞 {trip.phone}</span>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(trip.price)}</span>
                  </div>

                  {trip.obs && (
                    <div style={{ fontSize: 12, color: 'rgba(251,146,60,0.8)', marginBottom: 12, background: 'rgba(251,146,60,0.08)', padding: '6px 10px', borderRadius: 7 }}>
                      📝 {trip.obs}
                    </div>
                  )}

                  {nexts.length > 0 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {nexts.map(ns => (
                        <button key={ns.s} onClick={() => updateTripStatus(trip.id, ns.s)} style={{ flex: 1, padding: '12px 0', borderRadius: 11, border: `1px solid ${ns.c}50`, background: `${ns.c}15`, color: ns.c, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {ns.label}
                        </button>
                      ))}
                      <a href={`tel:${trip.phone}`} aria-label={`Llamar a ${trip.customer}`} title="Llamar al pasajero" style={{ padding: '12px 16px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: 16 }}>
                        📞
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
