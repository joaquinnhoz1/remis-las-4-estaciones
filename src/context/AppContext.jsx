import { createContext, useContext, useState, useEffect } from 'react'

// ── PERSISTENCIA localStorage ────────────────────────────────────────────────
const LS = 'remis4e_'
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(LS + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(LS + key, JSON.stringify(value))
  } catch (e) {
    // Cuota llena o storage deshabilitado: avisar en consola (ROB-3)
    console.warn(`No se pudo guardar "${key}" en localStorage:`, e?.name || e)
  }
}

// Normaliza teléfonos a solo dígitos para comparar sin importar el formato (SEC-3)
const onlyDigits = (p) => String(p || '').replace(/\D/g, '')

// Escapa HTML para evitar XSS al inyectar datos en strings de Leaflet (SEC-2)
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

const AppContext = createContext(null)

// ── 8 ESTADOS DEL VIAJE (Módulo 7) ──────────────────────────────────────────
export const TRIP_STATES = {
  pendiente:        { label: 'Pendiente',        color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  asignado:         { label: 'Asignado',          color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  'chofer_camino':  { label: 'Chofer en camino',  color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  'chofer_llego':   { label: 'Chofer llegó',      color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  'a_bordo':        { label: 'Pasajero a bordo',  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'en_curso':       { label: 'En curso',           color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  completado:       { label: 'Completado',         color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  cancelado:        { label: 'Cancelado',          color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
}

// ── DATOS INICIALES ──────────────────────────────────────────────────────────
const initialDrivers = [
  { id: 1, name: 'Carlos Rodríguez',  phone: '+54 9 2317-550101', car: 'Toyota Corolla',    plate: 'AB123CD', status: 'disponible', rating: 4.8, trips: 342, monthTrips: 38, income: 284600, avatar: 'CR', license: '2026-12-15', vtv: '2026-09-01', pin: '1234' },
  { id: 2, name: 'Martín López',      phone: '+54 9 2317-550102', car: 'Chevrolet Cruze',   plate: 'XY456EF', status: 'en viaje',   rating: 4.6, trips: 218, monthTrips: 24, income: 179400, avatar: 'ML', license: '2026-08-20', vtv: '2027-01-10', pin: '2345' },
  { id: 3, name: 'Diego Fernández',   phone: '+54 9 2317-550103', car: 'Volkswagen Polo',   plate: 'DE789GH', status: 'disponible', rating: 4.9, trips: 510, monthTrips: 52, income: 431200, avatar: 'DF', license: '2025-11-30', vtv: '2026-11-05', pin: '3456' },
  { id: 4, name: 'Sergio Gómez',      phone: '+54 9 2317-550104', car: 'Ford Focus',        plate: 'GH012IJ', status: 'inactivo',   rating: 4.3, trips: 89,  monthTrips:  9, income:  72100, avatar: 'SG', license: '2027-03-10', vtv: '2026-07-20', pin: '4567' },
  { id: 5, name: 'Pablo Martínez',    phone: '+54 9 2317-550105', car: 'Renault Logan',     plate: 'JK345LM', status: 'en viaje',   rating: 4.7, trips: 267, monthTrips: 31, income: 223800, avatar: 'PM', license: '2026-05-01', vtv: '2026-10-15', pin: '5678' },
]

const initialTrips = [
  { id: 'V001', customer: 'Ana García',        phone: '2317-401001', driver: 'Carlos Rodríguez', from: 'Av. San Martín 1200', to: 'Cooperativa Daireaux',    status: 'completado',     price: 2800, date: '2026-06-15', time: '09:15', distance: '3.2 km', obs: '' },
  { id: 'V002', customer: 'Luis Pérez',         phone: '2317-401002', driver: 'Martín López',     from: 'Bv. Rivadavia 500',   to: 'Hospital Daireaux',        status: 'en_curso',       price: 1950, date: '2026-06-15', time: '10:30', distance: '2.1 km', obs: '' },
  { id: 'V003', customer: 'María Torres',       phone: '2317-401003', driver: 'Diego Fernández',  from: 'Barrio Norte',         to: 'Centro',                   status: 'completado',     price: 3400, date: '2026-06-15', time: '08:00', distance: '5.8 km', obs: 'con bebé' },
  { id: 'V004', customer: 'Roberto Silva',      phone: '2317-401004', driver: null,                from: 'Terminal de Ómnibus',  to: 'Pehuajó',                  status: 'pendiente',      price: 4500, date: '2026-06-15', time: '11:00', distance: '70 km',  obs: 'equipaje' },
  { id: 'V005', customer: 'Laura Díaz',         phone: '2317-401005', driver: 'Pablo Martínez',   from: 'Barrio Sur',           to: 'Plaza Central',            status: 'chofer_camino',  price: 2100, date: '2026-06-15', time: '10:45', distance: '3.9 km', obs: '' },
  { id: 'V006', customer: 'Javier Ruiz',        phone: '2317-401006', driver: 'Carlos Rodríguez', from: 'Barrio Jardín',        to: 'Escuela N°1',              status: 'completado',     price: 3100, date: '2026-06-14', time: '18:30', distance: '4.5 km', obs: '' },
  { id: 'V007', customer: 'Valentina Acosta',   phone: '2317-401003', driver: 'Diego Fernández',  from: 'Villa Belgrano',       to: 'Plaza Central Daireaux',   status: 'completado',     price: 5200, date: '2026-06-14', time: '17:15', distance: '9.1 km', obs: '' },
  { id: 'V008', customer: 'Nicolás Herrera',    phone: '2317-401008', driver: null,                from: 'Parque Municipal',     to: 'Estación de Tren',         status: 'cancelado',      price: 1800, date: '2026-06-14', time: '16:00', distance: '2.0 km', obs: '' },
  { id: 'V009', customer: 'Sofía Méndez',       phone: '2317-401009', driver: 'Martín López',     from: 'Daireaux',             to: 'Bolívar',                  status: 'asignado',       price: 7200, date: '2026-06-15', time: '14:00', distance: '85 km',  obs: '' },
  { id: 'V010', customer: 'Gonzalo Ferreyra',   phone: '2317-401010', driver: 'Diego Fernández',  from: 'Hospital Daireaux',    to: 'Barrio Norte',             status: 'chofer_llego',   price: 1600, date: '2026-06-15', time: '11:30', distance: '2.8 km', obs: '' },
]

// ── TARIFAS INTELIGENTES (Módulo 13) ────────────────────────────────────────
const initialTariffs = {
  tarifaMinima:       1500,
  precioPorKm:         280,
  recargoNocturno:      20,   // %
  recargoFeriado:       30,   // %
  recargoEquipaje:     500,   // $ fijo
  tarifaInterurbana:   320,   // $/km fuera del radio
  radioUrbanoKm:        10,
}

// ── DESTINOS FRECUENTES (Módulo 14) ─────────────────────────────────────────
const initialDestinations = [
  { id: 1, from: 'Daireaux', to: 'Pehuajó',          distance: 70,  price: 18000, returnPrice: 32000, time: '55 min',  active: true },
  { id: 2, from: 'Daireaux', to: 'Bolívar',           distance: 85,  price: 22000, returnPrice: 40000, time: '1h 10m', active: true },
  { id: 3, from: 'Daireaux', to: 'Trenque Lauquen',   distance: 100, price: 26000, returnPrice: 48000, time: '1h 25m', active: true },
  { id: 4, from: 'Daireaux', to: 'Ezeiza / Aeropuerto', distance: 380, price: 95000, returnPrice: 180000, time: '4h 30m', active: true },
  { id: 5, from: 'Daireaux', to: 'Azul',              distance: 120, price: 31000, returnPrice: 58000, time: '1h 40m', active: true },
  { id: 6, from: 'Daireaux', to: 'Olavarría',         distance: 130, price: 34000, returnPrice: 62000, time: '1h 50m', active: true },
]

// ── GASTOS (Módulo 8) ────────────────────────────────────────────────────────
const initialExpenses = [
  { id: 1, category: 'Combustible', description: 'Nafta - Toyota Corolla AB123CD', amount: 18500, date: '2026-06-14', vehicle: 'AB123CD' },
  { id: 2, category: 'Taller',      description: 'Service - Volkswagen Polo DE789GH', amount: 35000, date: '2026-06-10', vehicle: 'DE789GH' },
  { id: 3, category: 'Combustible', description: 'Nafta - Chevrolet Cruze XY456EF', amount: 21000, date: '2026-06-13', vehicle: 'XY456EF' },
  { id: 4, category: 'Seguro',      description: 'Seguro mensual flota (5 unidades)', amount: 62000, date: '2026-06-01', vehicle: 'FLOTA' },
  { id: 5, category: 'Lavado',      description: 'Lavado completo Toyota Corolla', amount: 4500, date: '2026-06-12', vehicle: 'AB123CD' },
  { id: 6, category: 'Combustible', description: 'Nafta - Renault Logan JK345LM', amount: 16800, date: '2026-06-15', vehicle: 'JK345LM' },
]

const EXPENSE_CATS = ['Combustible', 'Taller', 'Seguro', 'Lavado', 'Peaje', 'VTV', 'Otro']

// ── CLIENTES (Módulo 10) ─────────────────────────────────────────────────────
const buildClients = (trips) => {
  const map = {}
  trips.forEach(t => {
    if (!t.phone) return
    const key = onlyDigits(t.phone)
    if (!key) return
    if (!map[key]) {
      map[key] = { phone: t.phone, phoneKey: key, name: t.customer, trips: 0, spent: 0, lastTrip: t.date, label: 'Nuevo', blacklisted: false }
    }
    map[key].trips += 1
    if (t.status === 'completado') map[key].spent += t.price
    if (t.date > map[key].lastTrip) map[key].lastTrip = t.date
  })
  return Object.values(map).map(c => ({
    ...c,
    label: c.trips >= 30 ? 'VIP' : c.trips >= 10 ? 'Frecuente' : c.trips >= 3 ? 'Regular' : 'Nuevo'
  }))
}

// ── AUDIT LOG ────────────────────────────────────────────────────────────────
const createLog = (action, detail) => ({ id: Date.now(), ts: new Date().toISOString(), action, detail })

// ── AUTO-ASSIGNMENT (Módulo 6) ───────────────────────────────────────────────
// Modes: 'primer_disponible' | 'menor_carga' | 'mayor_rating' | 'balance_mensual'
const autoAssignDriver = (drivers, mode) => {
  const avail = drivers.filter(d => d.status === 'disponible')
  if (!avail.length) return null
  if (mode === 'primer_disponible') return avail[0]
  if (mode === 'menor_carga')       return avail.reduce((a, b) => a.monthTrips <= b.monthTrips ? a : b)
  if (mode === 'mayor_rating')      return avail.reduce((a, b) => a.rating >= b.rating ? a : b)
  if (mode === 'balance_mensual')   return avail.reduce((a, b) => a.monthTrips <= b.monthTrips ? a : b)
  return avail[0]
}

export function AppProvider({ children }) {
  // adminAuth y driverSession NO se persisten (seguridad: siempre arranca deslogueado)
  const [adminAuth, setAdminAuth] = useState(false)
  const [driverSession, setDriverSessionState] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(null)

  const [autoAssignEnabled, setAutoAssignEnabledState] = useState(() => load('autoAssignEnabled', false))
  const [autoAssignMode,    setAutoAssignModeState]    = useState(() => load('autoAssignMode', 'menor_carga'))
  const [drivers,     setDrivers]     = useState(() => load('drivers',      initialDrivers))
  const [trips,       setTrips]       = useState(() => load('trips',        initialTrips))
  const [tariffs,     setTariffs]     = useState(() => load('tariffs',      initialTariffs))
  const [destinations,setDestinations]= useState(() => load('destinations', initialDestinations))
  const [expenses,    setExpenses]    = useState(() => load('expenses',     initialExpenses))
  const [blacklist,   setBlacklist]   = useState(() => load('blacklist',    []))
  const [auditLog,    setAuditLog]    = useState(() => load('auditLog', [
    createLog('Sistema', 'Base de datos cargada desde localStorage'),
  ]))

  // Guardar en localStorage cada vez que cambia el estado
  useEffect(() => save('drivers',           drivers),           [drivers])
  useEffect(() => save('trips',             trips),             [trips])
  useEffect(() => save('tariffs',           tariffs),           [tariffs])
  useEffect(() => save('destinations',      destinations),      [destinations])
  useEffect(() => save('expenses',          expenses),          [expenses])
  useEffect(() => save('blacklist',         blacklist),         [blacklist])
  useEffect(() => save('auditLog',          auditLog),          [auditLog])
  useEffect(() => save('autoAssignEnabled', autoAssignEnabled), [autoAssignEnabled])
  useEffect(() => save('autoAssignMode',    autoAssignMode),    [autoAssignMode])

  // Wrappers que propagan al estado (sin cambiar la API pública)
  const setAutoAssignEnabled = (v) => setAutoAssignEnabledState(v)
  const setAutoAssignMode    = (v) => setAutoAssignModeState(v)

  const log = (action, detail) => setAuditLog(prev => [createLog(action, detail), ...prev].slice(0, 200))

  // ── AUTH ──
  const login = (user, pass) => {
    if (user === 'admin' && pass === 'remis123') {
      setAdminAuth(true)
      log('Login', `Administrador ingresó al sistema`)
      return true
    }
    return false
  }
  const logout = () => { log('Logout', 'Sesión cerrada'); setAdminAuth(false) }

  // ── PRICE CALC (Módulo 1 / 13) ──
  const calcPrice = ({ distanceKm, isNight = false, isHoliday = false, hasLuggage = false, fixedDestTo = null }) => {
    // Check fixed destination first — match EXACTO para no dar falsos positivos (BIZ-4)
    const target = (fixedDestTo || '').trim().toLowerCase()
    const fixed = target ? destinations.find(d => d.active && d.to.trim().toLowerCase() === target) : null
    if (fixed) return fixed.price

    let price = Math.max(tariffs.tarifaMinima, distanceKm * (distanceKm > tariffs.radioUrbanoKm ? tariffs.tarifaInterurbana : tariffs.precioPorKm))
    if (isNight)    price *= (1 + tariffs.recargoNocturno / 100)
    if (isHoliday)  price *= (1 + tariffs.recargoFeriado / 100)
    if (hasLuggage) price += tariffs.recargoEquipaje
    return Math.round(price / 100) * 100
  }

  // ── TRIPS ──
  const addTrip = (trip) => {
    // ID basado en el máximo existente para evitar colisiones (B-4)
    const maxNum = trips.reduce((max, t) => {
      const n = parseInt(String(t.id).replace(/\D/g, ''), 10)
      return Number.isFinite(n) && n > max ? n : max
    }, 0)
    const newTrip = {
      id: `V${String(maxNum + 1).padStart(3, '0')}`,
      ...trip,
      status: 'pendiente',
      driver: null,
      date: trip.date || new Date().toISOString().split('T')[0],
      time: trip.time || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      obs: trip.obs || '',
    }
    // Auto-asignación (Módulo 6)
    if (autoAssignEnabled) {
      const chosen = autoAssignDriver(drivers, autoAssignMode)
      if (chosen) {
        newTrip.driver = chosen.name
        newTrip.status = 'asignado'
        setDrivers(prev => prev.map(d => d.id === chosen.id ? { ...d, status: 'en viaje' } : d))
        log('Asignación', `Auto-asignación: ${newTrip.id} → ${chosen.name} (modo: ${autoAssignMode})`)
      }
    }
    setTrips(prev => [newTrip, ...prev])
    setBookingSuccess(newTrip)
    log('Reserva', `Nueva reserva ${newTrip.id} — ${newTrip.customer}`)
    return newTrip
  }

  const updateTripStatus = (id, status) => {
    const trip = trips.find(t => t.id === id)
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t))

    // Al cerrar el viaje, liberar al chofer (BIZ-1) y actualizar sus métricas (BIZ-2)
    if ((status === 'completado' || status === 'cancelado') && trip?.driver) {
      setDrivers(prev => prev.map(d => {
        if (d.name !== trip.driver) return d
        const freed = { ...d, status: 'disponible' }
        if (status === 'completado') {
          freed.trips      = (d.trips || 0) + 1
          freed.monthTrips = (d.monthTrips || 0) + 1
          freed.income     = (d.income || 0) + (trip.price || 0)
        }
        return freed
      }))
    }

    log('Estado viaje', `${id} → ${TRIP_STATES[status]?.label || status}`)
  }

  const assignDriver = (tripId, driverId) => {
    const driver = drivers.find(d => d.id === driverId)
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, driver: driver?.name, status: 'asignado' } : t))
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'en viaje' } : d))
    log('Asignación', `${tripId} asignado a ${driver?.name}`)
  }

  // ── DRIVER SESSION (Módulo 4) ──
  const setDriverSession = (driver) => setDriverSessionState(driver)
  const clearDriverSession = () => setDriverSessionState(null)

  // ── DRIVERS ──
  const addDriver = (driver) => {
    const d = { ...driver, id: Date.now(), status: 'disponible', rating: 5.0, trips: 0, monthTrips: 0, income: 0, avatar: driver.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }
    setDrivers(prev => [...prev, d])
    log('Chofer', `Nuevo chofer registrado: ${driver.name}`)
  }
  const updateDriverStatus = (id, status) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }
  const removeDriver = (id) => {
    const d = drivers.find(x => x.id === id)
    setDrivers(prev => prev.filter(d => d.id !== id))
    log('Chofer', `Chofer eliminado: ${d?.name}`)
  }

  // ── EXPENSES ──
  const addExpense = (exp) => {
    setExpenses(prev => [{ ...exp, id: Date.now() }, ...prev])
    log('Finanzas', `Gasto registrado: ${exp.category} — $${exp.amount.toLocaleString('es-AR')}`)
  }
  const removeExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id))

  // ── TARIFFS ──
  const updateTariffs = (t) => {
    setTariffs(t)
    log('Configuración', 'Tarifas actualizadas')
  }

  // ── DESTINATIONS ──
  const addDestination = (d) => setDestinations(prev => [...prev, { ...d, id: Date.now() }])
  const updateDestination = (id, data) => setDestinations(prev => prev.map(d => d.id === id ? { ...d, ...data } : d))
  const removeDestination = (id) => setDestinations(prev => prev.filter(d => d.id !== id))

  // ── CLIENTS ──
  const clients = buildClients(trips)
  const blockClient = (phone, reason) => {
    setBlacklist(prev => [...prev, { phone, phoneKey: onlyDigits(phone), reason, date: new Date().toISOString() }])
    log('Clientes', `Número bloqueado: ${phone}`)
  }
  const unblockClient = (phone) => setBlacklist(prev => prev.filter(b => (b.phoneKey || onlyDigits(b.phone)) !== onlyDigits(phone)))
  const lookupClient = (phone) => clients.find(c => c.phoneKey === onlyDigits(phone))
  // Comparación robusta para la lista negra (ignora formato del teléfono) — SEC-3
  const isPhoneBlocked = (phone) => blacklist.some(b => (b.phoneKey || onlyDigits(b.phone)) === onlyDigits(phone))

  // ── STATS ──
  const today = new Date().toISOString().split('T')[0]
  const completed = trips.filter(t => t.status === 'completado')
  const stats = {
    totalTrips: trips.length,
    activeTrips: trips.filter(t => ['en_curso', 'chofer_camino', 'chofer_llego', 'a_bordo'].includes(t.status)).length,
    pendingTrips: trips.filter(t => t.status === 'pendiente').length,
    completedToday: trips.filter(t => t.status === 'completado' && t.date === today).length,
    totalRevenue: completed.reduce((s, t) => s + t.price, 0),
    revenueToday: completed.filter(t => t.date === today).reduce((s, t) => s + t.price, 0),
    totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    availableDrivers: drivers.filter(d => d.status === 'disponible').length,
    activeDrivers: drivers.filter(d => d.status === 'en viaje').length,
    cancelRate: trips.length ? Math.round(trips.filter(t => t.status === 'cancelado').length / trips.length * 100) : 0,
    avgTicket: completed.length ? Math.round(completed.reduce((s, t) => s + t.price, 0) / completed.length) : 0,
  }

  return (
    <AppContext.Provider value={{
      adminAuth, login, logout,
      driverSession, setDriverSession, clearDriverSession,
      autoAssignEnabled, setAutoAssignEnabled, autoAssignMode, setAutoAssignMode,
      drivers, addDriver, updateDriverStatus, removeDriver,
      trips, addTrip, updateTripStatus, assignDriver,
      bookingSuccess, setBookingSuccess,
      tariffs, updateTariffs, calcPrice,
      destinations, addDestination, updateDestination, removeDestination,
      expenses, addExpense, removeExpense, EXPENSE_CATS,
      clients, blacklist, blockClient, unblockClient, lookupClient, isPhoneBlocked,
      auditLog,
      stats,
      TRIP_STATES,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
