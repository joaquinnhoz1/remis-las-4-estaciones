import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import useModalA11y from '../../hooks/useModalA11y'
import styles from './DashTrips.module.css'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const ALL_STATUSES = ['todos', 'pendiente', 'asignado', 'chofer_camino', 'chofer_llego', 'a_bordo', 'en_curso', 'completado', 'cancelado']

// Qué transiciones puede hacer el admin desde cada estado
const NEXT_STATES = {
  pendiente:      [{ s: 'cancelado', label: 'Cancelar' }],
  asignado:       [{ s: 'chofer_camino', label: 'Chofer en camino' }, { s: 'cancelado', label: 'Cancelar' }],
  chofer_camino:  [{ s: 'chofer_llego', label: 'Chofer llegó' }, { s: 'cancelado', label: 'Cancelar' }],
  chofer_llego:   [{ s: 'a_bordo', label: 'Pasajero a bordo' }],
  a_bordo:        [{ s: 'en_curso', label: 'En curso' }],
  en_curso:       [{ s: 'completado', label: 'Completar' }],
  completado:     [],
  cancelado:      [],
}

function StatusBadge({ status }) {
  const { TRIP_STATES } = useApp()
  const s = TRIP_STATES[status] || { label: status, color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)' }
  return (
    <span style={{ color: s.color, background: s.bg, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${s.color}30`, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

export default function DashTrips() {
  const { trips, updateTripStatus, assignDriver, drivers, TRIP_STATES } = useApp()
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [assignId, setAssignId] = useState('')
  useModalA11y(() => { setSelected(null); setAssignId('') }, !!selected)

  const activeFilters = ['todos', 'pendiente', 'asignado', 'en_curso', 'completado', 'cancelado']

  const filtered = trips.filter(t => {
    const matchStatus = filter === 'todos' || t.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || t.customer?.toLowerCase().includes(q) || t.id?.toLowerCase().includes(q) || t.from?.toLowerCase().includes(q) || t.to?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const handleAssign = (tripId) => {
    if (assignId) { assignDriver(tripId, parseInt(assignId)); setSelected(null); setAssignId('') }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Viajes</h1>
          <p className={styles.sub}>{trips.length} viajes · {trips.filter(t => t.status === 'pendiente').length} pendientes de asignación</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {activeFilters.map(s => {
            const count = s === 'todos' ? trips.length : trips.filter(t => t.status === s).length
            return (
              <button key={s} className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`} onClick={() => setFilter(s)}>
                {s === 'todos' ? 'Todos' : TRIP_STATES[s]?.label || s}
                <span className={styles.filterCount}>{count}</span>
              </button>
            )
          })}
        </div>
        <input className={styles.search} placeholder="Buscar cliente, ID, origen..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Origen → Destino</th><th>Chofer</th><th>Fecha / Hora</th><th>Precio</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(trip => (
              <tr key={trip.id} className={styles.row}>
                <td><span className={styles.tripId}>{trip.id}</span></td>
                <td>
                  <div className={styles.customer}>{trip.customer}</div>
                  {trip.phone && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{trip.phone}</div>}
                </td>
                <td>
                  <div className={styles.route}>
                    <span className={styles.routeFrom}>{trip.from}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.routeTo}>{trip.to}</span>
                    {trip.obs && <span style={{ fontSize: 10, color: 'rgba(251,146,60,0.8)', marginTop: 2 }}>📝 {trip.obs}</span>}
                  </div>
                </td>
                <td>{trip.driver ? <span className={styles.driver}>{trip.driver}</span> : <span className={styles.noDriver}>Sin asignar</span>}</td>
                <td className={styles.datetime}>{trip.date}<br/>{trip.time}</td>
                <td><span className={styles.price}>{fmt(trip.price)}</span></td>
                <td><StatusBadge status={trip.status} /></td>
                <td>
                  <div className={styles.actions}>
                    {!['completado','cancelado','pendiente'].includes(trip.status) && (
                      <Link to={`/seguimiento/${trip.id}`} target="_blank" className={styles.actionBtn} style={{ textDecoration: 'none' }}>📍 Tracking</Link>
                    )}
                    {trip.status === 'pendiente' && (
                      <button className={styles.actionBtn} onClick={() => setSelected(trip)}>Asignar</button>
                    )}
                    {NEXT_STATES[trip.status]?.map(ns => (
                      <button key={ns.s}
                        className={`${styles.actionBtn} ${ns.s === 'cancelado' ? styles.cancel : ns.s === 'completado' ? styles.complete : ''}`}
                        onClick={() => updateTripStatus(trip.id, ns.s)}
                      >{ns.label}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className={styles.empty}>No hay viajes que coincidan con los filtros.</div>}
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Asignar chofer al viaje ${selected.id}`}>
            <h3 className={styles.modalTitle}>Asignar chofer — {selected.id}</h3>
            <div className={styles.modalRoute}>
              <span>{selected.from}</span><span> → </span><span>{selected.to}</span>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>👤 {selected.customer} · {selected.phone}</div>
            </div>
            <select className={styles.select} value={assignId} onChange={e => setAssignId(e.target.value)}>
              <option value="">Seleccionar chofer...</option>
              {drivers.filter(d => d.status === 'disponible').map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.car} ({d.plate})</option>
              ))}
            </select>
            {drivers.filter(d => d.status === 'disponible').length === 0 && (
              <p style={{ fontSize: 12, color: '#fb923c', marginTop: 8 }}>⚠️ No hay choferes disponibles en este momento.</p>
            )}
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setSelected(null)}>Cancelar</button>
              <button className={styles.btnAssign} onClick={() => handleAssign(selected.id)} disabled={!assignId}>Asignar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
