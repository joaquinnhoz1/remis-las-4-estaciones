// Módulo 2 — Notificaciones WhatsApp
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }

const TEMPLATES = {
  confirmacion: (t, d) =>
    `Hola ${t.customer || 'cliente'} 👋\n\n✅ *Tu viaje fue confirmado*\n📍 Origen: ${t.from}\n🏁 Destino: ${t.to}\n🚗 Chofer: ${d?.name || 'Por asignar'}\n🚙 Vehículo: ${d ? `${d.car} (${d.plate})` : '—'}\n💰 Precio estimado: $${t.price?.toLocaleString('es-AR')}\n\n📞 Remis Las 4 Estaciones · +54 9 12345678`,

  camino: (t, d) =>
    `Hola ${t.customer || 'cliente'} 🚗\n\n*Tu chofer está en camino*\n👤 ${d?.name || '—'}\n🚙 ${d?.car || '—'} · ${d?.plate || '—'}\n⏱️ Llegada estimada: 5-10 min\n\n📞 Remis Las 4 Estaciones · +54 9 12345678`,

  llegada: (t, d) =>
    `Hola ${t.customer || 'cliente'} 📍\n\n*Tu remis llegó al punto de encuentro*\n👤 ${d?.name || '—'} te está esperando\n🚙 ${d?.car || '—'} · ${d?.plate || '—'}\n\n¡Buen viaje! 🙌\n📞 Remis Las 4 Estaciones · +54 9 12345678`,

  completado: (t) =>
    `Hola ${t.customer || 'cliente'} ✅\n\n*Viaje completado*\n💰 Total: $${t.price?.toLocaleString('es-AR')}\n\nGracias por elegir *Remis Las 4 Estaciones* 🌟\nCalificá tu viaje respondiendo del 1 al 5 ⭐\n📞 +54 9 12345678`,

  cancelacion: (t) =>
    `Hola ${t.customer || 'cliente'} ❌\n\n*Tu viaje fue cancelado*\n${t.from} → ${t.to}\n\nComunicate con nosotros para reprogramarlo:\n📞 +54 9 12345678 · Remis Las 4 Estaciones`,
}

const TEMPLATE_LABELS = {
  confirmacion: { l: 'Confirmación', c: '#4ade80', icon: '✅' },
  camino:       { l: 'Chofer en camino', c: '#fb923c', icon: '🚗' },
  llegada:      { l: 'Chofer llegó', c: '#facc15', icon: '📍' },
  completado:   { l: 'Completado', c: '#60a5fa', icon: '💫' },
  cancelacion:  { l: 'Cancelación', c: '#f87171', icon: '❌' },
}

export default function DashNotifications() {
  const { trips, drivers } = useApp()
  const [selectedTrip, setSelectedTrip] = useState('')
  const [templateKey, setTemplateKey]   = useState('confirmacion')
  const [preview, setPreview]           = useState('')
  const [log, setLog]                   = useState([
    { id: 1, to: 'María García', phone: '2993001122', type: 'confirmacion', ts: new Date(Date.now() - 3600000).toISOString(), status: 'enviado' },
    { id: 2, to: 'Juan Rodríguez', phone: '2993445566', type: 'camino', ts: new Date(Date.now() - 1800000).toISOString(), status: 'enviado' },
    { id: 3, to: 'Ana López', phone: '2993778899', type: 'completado', ts: new Date(Date.now() - 900000).toISOString(), status: 'enviado' },
  ])

  const activeTrips = trips.filter(t => !['completado', 'cancelado'].includes(t.status))

  const buildPreview = (tripId, tmpl) => {
    const t = trips.find(x => x.id === tripId)
    if (!t) { setPreview(''); return }
    const d = drivers.find(x => x.name === t.driver)
    setPreview(TEMPLATES[tmpl](t, d))
  }

  const handleTrip = (v) => { setSelectedTrip(v); buildPreview(v, templateKey) }
  const handleTemplate = (v) => { setTemplateKey(v); buildPreview(selectedTrip, v) }

  const send = () => {
    const t = trips.find(x => x.id === selectedTrip)
    if (!t || !preview) return
    const waText = encodeURIComponent(preview)
    const phone  = (t.phone || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone || '5491112345678'}?text=${waText}`, '_blank')
    setLog(prev => [{
      id: Date.now(),
      to: t.customer,
      phone: t.phone,
      type: templateKey,
      ts: new Date().toISOString(),
      status: 'enviado',
    }, ...prev])
  }

  const fmt = (iso) => new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Notificaciones</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Envío manual de mensajes WhatsApp a clientes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>

        {/* COMPOSITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={g}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>📨 Nuevo mensaje</h2>

            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Viaje</label>
            <select value={selectedTrip} onChange={e => handleTrip(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, color: '#fff', fontSize: 13, fontFamily: 'inherit', marginBottom: 14 }}>
              <option value="">Seleccionar viaje...</option>
              {activeTrips.map(t => (
                <option key={t.id} value={t.id}>{t.id} · {t.customer} — {t.from} → {t.to}</option>
              ))}
            </select>

            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Plantilla</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
              {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => handleTemplate(k)} style={{ padding: '7px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: templateKey === k ? `${v.c}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${templateKey === k ? v.c : 'rgba(255,255,255,0.08)'}`, color: templateKey === k ? v.c : 'rgba(255,255,255,0.4)' }}>
                  {v.icon} {v.l}
                </button>
              ))}
            </div>

            <button onClick={send} disabled={!selectedTrip || !preview} style={{ width: '100%', padding: '12px 0', background: selectedTrip && preview ? '#25D366' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: selectedTrip && preview ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 14, cursor: selectedTrip && preview ? 'pointer' : 'default', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Abrir WhatsApp
            </button>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8 }}>Se abre WhatsApp Web con el mensaje pre-cargado</p>
          </div>
        </div>

        {/* PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...g, flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>👁️ Vista previa</h2>
            {preview ? (
              <div style={{ background: '#0b141a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, minHeight: 200 }}>
                <div style={{ display: 'inline-block', background: '#202c33', borderRadius: '12px 12px 12px 0', padding: '12px 14px', maxWidth: '90%' }}>
                  {preview.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '1px 0', fontSize: 13, color: '#e9edef', lineHeight: 1.6 }}>
                      {line.replace(/\*(.*?)\*/g, (_, m) => m) || ' '}
                    </p>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8, textAlign: 'right' }}>Enviado por WhatsApp</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>
                Seleccioná un viaje para ver la vista previa
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOG */}
      <div style={g}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>📋 Historial de mensajes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {log.map(entry => {
            const tl = TEMPLATE_LABELS[entry.type] || { l: entry.type, c: '#fff', icon: '📩' }
            return (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>{tl.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{entry.to}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{entry.phone}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: tl.c, background: `${tl.c}18`, padding: '2px 8px', borderRadius: 999 }}>{tl.l}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{fmt(entry.ts)}</span>
                <span style={{ fontSize: 11, color: '#4ade80' }}>✓ {entry.status}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
