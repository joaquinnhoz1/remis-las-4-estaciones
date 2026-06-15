// Módulo 15 — Backups y Seguridad
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }
const btn = { padding: '9px 18px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff' }

const INITIAL_BACKUPS = [
  { id: 1, name: 'backup_2026-06-15_02-00.json', size: '148 KB', date: '2026-06-15T02:00:00', type: 'automático', status: 'ok' },
  { id: 2, name: 'backup_2026-06-14_02-00.json', size: '141 KB', date: '2026-06-14T02:00:00', type: 'automático', status: 'ok' },
  { id: 3, name: 'backup_2026-06-13_18-32.json', size: '139 KB', date: '2026-06-13T18:32:00', type: 'manual',    status: 'ok' },
  { id: 4, name: 'backup_2026-06-13_02-00.json', size: '136 KB', date: '2026-06-13T02:00:00', type: 'automático', status: 'ok' },
  { id: 5, name: 'backup_2026-06-12_02-00.json', size: '130 KB', date: '2026-06-12T02:00:00', type: 'automático', status: 'ok' },
  { id: 6, name: 'backup_2026-06-11_02-00.json', size: '124 KB', date: '2026-06-11T02:00:00', type: 'automático', status: 'ok' },
  { id: 7, name: 'backup_2026-06-10_02-00.json', size: '118 KB', date: '2026-06-10T02:00:00', type: 'automático', status: 'ok' },
]

export default function DashBackups() {
  const { trips, drivers, tariffs, destinations, expenses, auditLog } = useApp()
  const [backups, setBackups]   = useState(INITIAL_BACKUPS)
  const [restoring, setRestoring] = useState(null)
  const [msg, setMsg]           = useState('')

  const createBackup = () => {
    const data = { trips, drivers, tariffs, destinations, expenses, auditLog, createdAt: new Date().toISOString(), version: '1.0' }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const ts   = new Date().toISOString().replace('T', '_').slice(0, 16).replace(':', '-')
    const a    = document.createElement('a')
    a.href     = url
    a.download = `backup_${ts}.json`
    a.click()
    URL.revokeObjectURL(url)

    const newBackup = {
      id: Date.now(),
      name: `backup_${ts}.json`,
      size: `${Math.round(json.length / 1024)} KB`,
      date: new Date().toISOString(),
      type: 'manual',
      status: 'ok',
    }
    setBackups(prev => [newBackup, ...prev])
    setMsg('✅ Backup creado y descargado correctamente.')
    setTimeout(() => setMsg(''), 4000)
  }

  const restore = (b) => {
    setRestoring(b)
  }
  const confirmRestore = () => {
    setMsg('⚠️ Restauración simulada. En producción esto recargaría el estado del sistema desde el archivo seleccionado.')
    setRestoring(null)
    setTimeout(() => setMsg(''), 5000)
  }

  const fmt = (iso) => new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const resetData = () => {
    const keys = ['drivers','trips','tariffs','destinations','expenses','blacklist','auditLog','autoAssignEnabled','autoAssignMode']
    keys.forEach(k => localStorage.removeItem('remis4e_' + k))
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Backups & Seguridad</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Gestión de copias de seguridad y políticas de acceso</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={createBackup} style={{ ...btn, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.35)', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 8 }}>
            💾 Crear backup ahora
          </button>
          <button onClick={() => { if (window.confirm('¿Borrar todos los datos y volver al estado inicial?')) resetData() }} style={{ ...btn, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
            🗑 Resetear datos
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, fontSize: 13, color: '#4ade80' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* Estado del sistema */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>🔒 Estado del sistema</h2>
          {[
            { l: 'Autenticación de admin',  v: 'Activa',         c: '#4ade80', icon: '🔑' },
            { l: 'Sesiones activas',         v: '1 sesión',       c: '#60a5fa', icon: '🌐' },
            { l: 'Último backup automático', v: 'Hace 6 horas',  c: '#facc15', icon: '🕐' },
            { l: 'Logs de auditoría',        v: `${auditLog.length} registros`, c: '#fb923c', icon: '📋' },
            { l: 'Acceso a panel chofer',    v: 'PIN protegido',  c: '#4ade80', icon: '🚗' },
            { l: 'Datos en localStorage',    v: 'Sin cifrar',     c: '#f87171', icon: '⚠️' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.l}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: item.c, background: `${item.c}15`, padding: '3px 10px', borderRadius: 999 }}>{item.v}</span>
            </div>
          ))}
        </div>

        {/* Configuración de backups */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>⚙️ Política de backups</h2>
          {[
            { l: 'Frecuencia automática', v: 'Cada 24 hs (02:00)' },
            { l: 'Retención máxima',       v: '30 días / 30 archivos' },
            { l: 'Formato de archivo',     v: 'JSON comprimido' },
            { l: 'Datos incluidos',        v: 'Viajes, choferes, finanzas, tarifas, auditoría' },
            { l: 'Almacenamiento',         v: 'LocalStorage + descarga manual' },
            { l: 'Próximo backup auto',    v: 'Mañana 02:00 hs' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '11px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{item.l}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LISTA BACKUPS */}
      <div style={g}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>📁 Copias de seguridad disponibles</h2>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{backups.length} archivos</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {backups.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{fmt(b.date)} · {b.size}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: b.type === 'manual' ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.07)', color: b.type === 'manual' ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                {b.type}
              </span>
              <span style={{ fontSize: 11, color: '#4ade80' }}>✓ {b.status}</span>
              <button onClick={() => restore(b)} style={{ ...btn, fontSize: 12, padding: '6px 12px', color: '#facc15', border: '1px solid rgba(250,204,21,0.25)', background: 'rgba(250,204,21,0.07)' }}>
                Restaurar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL RESTAURAR */}
      {restoring && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setRestoring(null)}>
          <div style={{ background: '#0f1119', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 32, maxWidth: 420, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 10px' }}>Confirmar restauración</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>
              ¿Restaurar el sistema desde <strong style={{ color: '#facc15' }}>{restoring.name}</strong>?<br />
              Esta acción reemplazará todos los datos actuales. No se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setRestoring(null)} style={{ ...btn, flex: 1 }}>Cancelar</button>
              <button onClick={confirmRestore} style={{ ...btn, flex: 1, background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.35)', color: '#facc15' }}>
                Sí, restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
