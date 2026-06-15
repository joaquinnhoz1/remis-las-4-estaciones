import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import styles from './DashHome.module.css'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function DashHome() {
  const { stats, trips, drivers, TRIP_STATES } = useApp()
  const navigate = useNavigate()

  const recentTrips = trips.slice(0, 5)
  const todayLabel = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle} style={{ textTransform: 'capitalize' }}>{todayLabel}</p>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} /> En vivo
        </div>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statsGrid}>
        <StatCard label="Viajes hoy" value={stats.completedToday} icon="✅" color="green" delta="completados hoy" />
        <StatCard label="En curso" value={stats.activeTrips} icon="🚗" color="yellow" delta="actualizado ahora" />
        <StatCard label="Pendientes" value={stats.pendingTrips} icon="⏳" color="orange" delta="esperando chofer" />
        <StatCard label="Choferes activos" value={stats.activeDrivers} icon="👤" color="blue" delta={`${stats.availableDrivers} disponibles`} />
        <StatCard label="Ingresos hoy" value={fmt(stats.revenueToday)} icon="💰" color="green" delta="del día" large />
        <StatCard label="Ingresos totales" value={fmt(stats.totalRevenue)} icon="📈" color="yellow" delta="histórico" large />
      </div>

      <div className={styles.grid2}>
        {/* RECENT TRIPS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Viajes recientes</h2>
            <span className={styles.cardBadge}>{trips.length} total</span>
          </div>
          <div className={styles.tripList}>
            {recentTrips.map(trip => (
              <div key={trip.id} className={styles.tripRow}>
                <div className={styles.tripId}>{trip.id}</div>
                <div className={styles.tripInfo}>
                  <div className={styles.tripCustomer}>{trip.customer}</div>
                  <div className={styles.tripRoute}>{trip.from} → {trip.to}</div>
                </div>
                <div className={styles.tripRight}>
                  <StatusBadge status={trip.status} states={TRIP_STATES} />
                  <div className={styles.tripPrice}>{fmt(trip.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRIVERS STATUS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Choferes</h2>
            <span className={styles.cardBadge}>{drivers.length} total</span>
          </div>
          <div className={styles.driverList}>
            {drivers.map(driver => (
              <div key={driver.id} className={styles.driverRow}>
                <div className={styles.driverAvatar}>{driver.avatar}</div>
                <div className={styles.driverInfo}>
                  <div className={styles.driverName}>{driver.name}</div>
                  <div className={styles.driverCar}>{driver.car} · {driver.plate}</div>
                </div>
                <div className={styles.driverRight}>
                  <DriverStatusBadge status={driver.status} />
                  <div className={styles.driverRating}>★ {driver.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Accesos rápidos</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, padding: '4px 0 8px' }}>
          {[
            { icon: '🗺️', label: 'Mapa en vivo',    path: '/admin/mapa',           color: '#4ade80' },
            { icon: '📊', label: 'Estadísticas',     path: '/admin/estadisticas',   color: '#60a5fa' },
            { icon: '💬', label: 'Notificaciones',   path: '/admin/notificaciones', color: '#25D366' },
            { icon: '🚗', label: 'Portal chofer',    path: '/chofer/login',         color: '#fb923c', external: true },
            { icon: '🔒', label: 'Backups',          path: '/admin/backups',        color: '#facc15' },
            { icon: '🗓️', label: 'Roadmap',          path: '/admin/roadmap',        color: '#a78bfa' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => item.external ? window.open(item.path, '_blank') : navigate(item.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* REVENUE CHART (visual only) */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Ingresos — últimos 7 días</h2>
        </div>
        <RevenueChart />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, delta, large }) {
  return (
    <div className={`${styles.statCard} ${large ? styles.statLarge : ''}`}>
      <div className={`${styles.statIcon} ${styles[`icon_${color}`]}`}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statDelta}>{delta}</div>
    </div>
  )
}

function StatusBadge({ status, states }) {
  const s = states?.[status] || { label: status, color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)' }
  return (
    <span style={{ color: s.color, background: s.bg, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  )
}

function DriverStatusBadge({ status }) {
  const map = {
    'disponible': '#4ade80',
    'en viaje':   '#facc15',
    'inactivo':   'rgba(255,255,255,0.2)',
  }
  return (
    <span style={{ color: map[status] || 'rgba(255,255,255,0.3)', fontSize: 11.5, fontWeight: 600 }}>
      ● {status}
    </span>
  )
}

function RevenueChart() {
  const { trips } = useApp()

  // Ingresos reales de los últimos 7 días (viajes completados)
  const series = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const val = trips
      .filter(t => t.status === 'completado' && t.date === key)
      .reduce((s, t) => s + (t.price || 0), 0)
    series.push({ val, label: d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '') })
  }
  const max = Math.max(...series.map(s => s.val), 1)
  const todayIdx = series.length - 1

  return (
    <div className={styles.chart}>
      {series.map((s, i) => (
        <div key={i} className={styles.chartBar}>
          <div
            className={styles.chartBarFill}
            style={{ height: `${(s.val / max) * 160}px`, background: i === todayIdx ? 'rgba(129,140,248,0.85)' : 'rgba(255,255,255,0.10)' }}
          />
          <div className={styles.chartDay} style={{ textTransform: 'capitalize' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
