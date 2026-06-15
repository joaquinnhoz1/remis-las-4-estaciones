import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './DashSettings.module.css'

export default function DashSettings() {
  const { autoAssignEnabled, setAutoAssignEnabled, autoAssignMode, setAutoAssignMode } = useApp()
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    companyName: 'Remis Las 4 Estaciones',
    phone: '+54 9 12345678',
    address: 'Daireaux, Buenos Aires',
    email: 'info@remisya.com.ar',
    pricePerKm: '450',
    minPrice: '1500',
    nightSurcharge: '30',
    weekendSurcharge: '20',
    notifyNewTrip: true,
    notifyDriverAssigned: true,
    autoAssign: false,
    maintenanceMode: false,
  })

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.sub}>Ajustes generales de la remisería</p>
      </div>

      <div className={styles.grid}>
        {/* COMPANY */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏢 Información de la empresa</h2>
          <div className={styles.fields}>
            <Field label="Nombre" value={config.companyName} onChange={v => set('companyName', v)} />
            <Field label="Teléfono" value={config.phone} onChange={v => set('phone', v)} />
            <Field label="Dirección" value={config.address} onChange={v => set('address', v)} />
            <Field label="Email" value={config.email} onChange={v => set('email', v)} type="email" />
          </div>
        </section>

        {/* PRICING */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💰 Tarifas</h2>
          <div className={styles.fields}>
            <Field label="Precio por km (ARS)" value={config.pricePerKm} onChange={v => set('pricePerKm', v)} type="number" />
            <Field label="Precio mínimo (ARS)" value={config.minPrice} onChange={v => set('minPrice', v)} type="number" />
            <Field label="Recargo nocturno (%)" value={config.nightSurcharge} onChange={v => set('nightSurcharge', v)} type="number" />
            <Field label="Recargo fin de semana (%)" value={config.weekendSurcharge} onChange={v => set('weekendSurcharge', v)} type="number" />
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔔 Notificaciones</h2>
          <div className={styles.toggles}>
            <Toggle label="Nuevo viaje solicitado" desc="Recibir alerta cuando llegue un pedido" checked={config.notifyNewTrip} onChange={v => set('notifyNewTrip', v)} />
            <Toggle label="Chofer asignado" desc="Notificar cuando se asigna un chofer" checked={config.notifyDriverAssigned} onChange={v => set('notifyDriverAssigned', v)} />
          </div>
        </section>

        {/* SYSTEM */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚙️ Sistema</h2>
          <div className={styles.toggles}>
            <Toggle label="Auto-asignación de choferes" desc="Asignar automáticamente el chofer disponible al recibir un pedido" checked={autoAssignEnabled} onChange={setAutoAssignEnabled} />
            <Toggle label="Modo mantenimiento" desc="Deshabilitar reservas desde el sitio público" checked={config.maintenanceMode} onChange={v => set('maintenanceMode', v)} danger />
          </div>
          {autoAssignEnabled && (
            <div style={{ marginTop: 12, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Modo de asignación</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { k: 'primer_disponible', l: 'Primer disponible',   d: 'El primero en la lista que esté disponible' },
                  { k: 'menor_carga',       l: 'Menor carga',         d: 'El que tenga menos viajes este mes' },
                  { k: 'mayor_rating',      l: 'Mayor calificación',  d: 'El mejor calificado que esté disponible' },
                  { k: 'balance_mensual',   l: 'Balance mensual',     d: 'Distribuir equitativamente entre todos' },
                ].map(opt => (
                  <button key={opt.k} onClick={() => setAutoAssignMode(opt.k)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: autoAssignMode === opt.k ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${autoAssignMode === opt.k ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${autoAssignMode === opt.k ? '#fff' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      {autoAssignMode === opt.k && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: autoAssignMode === opt.k ? '#fff' : 'rgba(255,255,255,0.55)' }}>{opt.l}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{opt.d}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className={styles.saveBar}>
        <p className={styles.saveNote}>Los cambios se aplican inmediatamente.</p>
        <button className={`${styles.saveBtn} ${saved ? styles.saved : ''}`} onClick={handleSave}>
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 10,
          padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit',
          transition: 'border-color 0.2s', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.30)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
      />
    </div>
  )
}

function Toggle({ label, desc, checked, onChange, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12,
      border: `1px solid ${danger && checked ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.07)'}`,
      gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: danger && checked ? '#f87171' : 'rgba(255,255,255,0.85)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        style={{
          width: 46, height: 25, borderRadius: 999, flexShrink: 0,
          background: checked ? (danger ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.08)',
          position: 'relative', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 19, height: 19, borderRadius: '50%',
          background: checked ? (danger ? '#f87171' : '#0f1119') : 'rgba(255,255,255,0.25)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}
