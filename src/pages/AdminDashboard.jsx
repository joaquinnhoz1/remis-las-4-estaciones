import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './AdminDashboard.module.css'

// Lazy-load de módulos admin: cada uno se separa en su propio chunk
// (Recharts, Leaflet, etc. ya no entran al bundle inicial)
const DashHome          = lazy(() => import('../components/admin/DashHome'))
const DashTrips         = lazy(() => import('../components/admin/DashTrips'))
const DashDrivers       = lazy(() => import('../components/admin/DashDrivers'))
const DashFinances      = lazy(() => import('../components/admin/DashFinances'))
const DashClients       = lazy(() => import('../components/admin/DashClients'))
const DashTariffs       = lazy(() => import('../components/admin/DashTariffs'))
const DashRanking       = lazy(() => import('../components/admin/DashRanking'))
const DashAudit         = lazy(() => import('../components/admin/DashAudit'))
const DashSettings      = lazy(() => import('../components/admin/DashSettings'))
const DashNotifications = lazy(() => import('../components/admin/DashNotifications'))
const DashMap           = lazy(() => import('../components/admin/DashMap'))
const DashStats         = lazy(() => import('../components/admin/DashStats'))
const DashBackups       = lazy(() => import('../components/admin/DashBackups'))
const DashRoadmap       = lazy(() => import('../components/admin/DashRoadmap'))

const navItems = [
  { path: '',               label: 'Dashboard',        icon: '⊞' },
  { path: 'viajes',         label: 'Viajes',            icon: '🚗' },
  { path: 'choferes',       label: 'Choferes',          icon: '👤' },
  { path: 'finanzas',       label: 'Finanzas',          icon: '💰' },
  { path: 'clientes',       label: 'Clientes',          icon: '👥' },
  { path: 'tarifas',        label: 'Tarifas',           icon: '🏷️' },
  { path: 'ranking',        label: 'Ranking',           icon: '🏆' },
  { path: 'notificaciones', label: 'Notificaciones',    icon: '💬' },
  { path: 'mapa',           label: 'Mapa en Vivo',      icon: '🗺️' },
  { path: 'estadisticas',   label: 'Estadísticas',      icon: '📊' },
  { path: 'auditoria',      label: 'Auditoría',         icon: '📋' },
  { path: 'backups',        label: 'Backups',           icon: '🔒' },
  { path: 'roadmap',        label: 'Roadmap',           icon: '🗓️' },
  { path: 'configuracion',  label: 'Configuración',     icon: '⚙️' },
]

const isMobile = () => window.innerWidth <= 768

export default function AdminDashboard() {
  const { logout, stats } = useApp()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile())
  const [mobile, setMobile]           = useState(isMobile())

  // Detectar cambio de tamaño
  useEffect(() => {
    const onResize = () => {
      const m = isMobile()
      setMobile(m)
      if (!m) setSidebarOpen(true)   // desktop: siempre abierto por defecto
      else     setSidebarOpen(false)  // mobile: cerrado por defecto
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Cerrar sidebar al navegar en mobile
  useEffect(() => {
    if (mobile) setSidebarOpen(false)
  }, [location.pathname, mobile])

  const toggleSidebar = () => setSidebarOpen(v => !v)
  const closeSidebar  = () => { if (mobile) setSidebarOpen(false) }

  // Clases del sidebar según contexto
  const sidebarClass = [
    styles.sidebar,
    mobile ? (sidebarOpen ? styles.sidebarMobileOpen : '') : (sidebarOpen ? styles.open : styles.closed),
  ].filter(Boolean).join(' ')

  // Clase del main (solo desktop usa margin-left)
  const mainClass = [
    styles.main,
    !mobile && !sidebarOpen ? styles.mainCollapsed : '',
  ].filter(Boolean).join(' ')

  // Página activa para breadcrumb
  const activePage = navItems.find(item => {
    if (item.path === '') return location.pathname === '/admin' || location.pathname === '/admin/'
    return location.pathname.includes(item.path)
  })

  return (
    <div className={styles.layout}>

      {/* Overlay mobile */}
      {mobile && sidebarOpen && (
        <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={closeSidebar} />
      )}

      {/* SIDEBAR */}
      <aside className={sidebarClass}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>R</div>
            <span className={styles.logoText}>Las 4 Estaciones</span>
          </div>
          {!mobile && (
            <button className={styles.toggleBtn} onClick={toggleSidebar}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
          )}
          {mobile && (
            <button className={styles.toggleBtn} onClick={closeSidebar} style={{ fontSize: 14 }}>✕</button>
          )}
        </div>

        {sidebarOpen && (
          <div className={styles.sidebarMeta}>
            <div className={styles.adminBadge}>
              <div className={styles.adminAvatar}>A</div>
              <div>
                <div className={styles.adminName}>Administrador</div>
                <div className={styles.adminRole}>Panel de control</div>
              </div>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              end={item.path === ''}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {(sidebarOpen || mobile) && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {sidebarOpen && (
          <div className={styles.sidebarLive}>
            <div className={styles.liveTitle}>Estado en vivo</div>
            <div className={styles.liveRow}><span className={`${styles.dot} ${styles.green}`} /><span>{stats.availableDrivers} disponibles</span></div>
            <div className={styles.liveRow}><span className={`${styles.dot} ${styles.yellow}`} /><span>{stats.activeTrips} en viaje</span></div>
            <div className={styles.liveRow}><span className={`${styles.dot} ${styles.red}`} /><span>{stats.pendingTrips} pendientes</span></div>
          </div>
        )}

        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>
          <span>🚪</span>
          {(sidebarOpen || mobile) && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {/* MAIN */}
      <main className={mainClass}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.menuBtn} onClick={toggleSidebar}>☰</button>
            <div className={styles.breadcrumb}>
              {activePage ? `${activePage.icon} ${activePage.label}` : 'Admin'}
            </div>
          </div>
          <div className={styles.topbarRight}>
            <button className={`${styles.homeBtn} ${styles.homeBtnSecondary}`} onClick={() => navigate('/chofer/login')}>🚗 Chofer</button>
            <button className={styles.homeBtn} onClick={() => navigate('/')}>🏠 Sitio</button>
          </div>
        </header>

        <div className={styles.content}>
          <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Cargando…</div>}>
          <Routes>
            <Route path=""               element={<DashHome />} />
            <Route path="viajes"         element={<DashTrips />} />
            <Route path="choferes"       element={<DashDrivers />} />
            <Route path="finanzas"       element={<DashFinances />} />
            <Route path="clientes"       element={<DashClients />} />
            <Route path="tarifas"        element={<DashTariffs />} />
            <Route path="ranking"        element={<DashRanking />} />
            <Route path="notificaciones" element={<DashNotifications />} />
            <Route path="mapa"           element={<DashMap />} />
            <Route path="estadisticas"   element={<DashStats />} />
            <Route path="auditoria"      element={<DashAudit />} />
            <Route path="backups"        element={<DashBackups />} />
            <Route path="roadmap"        element={<DashRoadmap />} />
            <Route path="configuracion"  element={<DashSettings />} />
          </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
