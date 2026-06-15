import { useState, useEffect } from 'react'
import { useNavigate, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import DashHome          from '../components/admin/DashHome'
import DashTrips         from '../components/admin/DashTrips'
import DashDrivers       from '../components/admin/DashDrivers'
import DashFinances      from '../components/admin/DashFinances'
import DashClients       from '../components/admin/DashClients'
import DashTariffs       from '../components/admin/DashTariffs'
import DashRanking       from '../components/admin/DashRanking'
import DashAudit         from '../components/admin/DashAudit'
import DashSettings      from '../components/admin/DashSettings'
import DashNotifications from '../components/admin/DashNotifications'
import DashMap           from '../components/admin/DashMap'
import DashStats         from '../components/admin/DashStats'
import DashBackups       from '../components/admin/DashBackups'
import DashRoadmap       from '../components/admin/DashRoadmap'
import styles from './AdminDashboard.module.css'

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
        </div>
      </main>
    </div>
  )
}
