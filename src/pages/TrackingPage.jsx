// Módulo 5 — Seguimiento en tiempo real
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DAIREAUX = { lat: -36.5996, lng: -61.7517 }
const TRIP_STATE_LABELS = {
  pendiente:      { l: 'Pendiente de asignación', c: '#6b7280', icon: '⏳' },
  asignado:       { l: 'Chofer asignado',          c: '#60a5fa', icon: '✅' },
  chofer_camino:  { l: 'Chofer en camino',          c: '#fb923c', icon: '🚗' },
  chofer_llego:   { l: 'Chofer llegó',              c: '#facc15', icon: '📍' },
  a_bordo:        { l: 'Pasajero a bordo',          c: '#34d399', icon: '🧑' },
  en_curso:       { l: 'Viaje en curso',             c: '#4ade80', icon: '▶' },
  completado:     { l: 'Viaje completado',           c: '#4ade80', icon: '✓' },
  cancelado:      { l: 'Viaje cancelado',            c: '#f87171', icon: '✗' },
}

const STEPS = ['asignado', 'chofer_camino', 'chofer_llego', 'a_bordo', 'en_curso', 'completado']

export default function TrackingPage() {
  const { id }    = useParams()
  const { trips, drivers } = useApp()
  const mapRef    = useRef(null)
  const leafletRef = useRef(null)
  const driverMarkerRef = useRef(null)

  const trip   = trips.find(t => t.id === id)
  const driver = trip ? drivers.find(d => d.name === trip.driver) : null
  const st     = trip ? (TRIP_STATE_LABELS[trip.status] || { l: trip.status, c: '#fff', icon: '?' }) : null

  const stepIdx = trip ? STEPS.indexOf(trip.status) : -1

  useEffect(() => {
    if (!mapRef.current || leafletRef.current || !trip || trip.status === 'pendiente') return

    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: false }).setView(
        [DAIREAUX.lat, DAIREAUX.lng], 14
      )
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM', maxZoom: 19 }).addTo(map)

      // Marcador del pasajero (destino)
      L.circleMarker([DAIREAUX.lat - 0.003, DAIREAUX.lng + 0.004], {
        radius: 10, fillColor: '#60a5fa', fillOpacity: 0.9, color: '#fff', weight: 2
      }).addTo(map).bindTooltip('Tu ubicación', { permanent: true, direction: 'top', offset: [0, -10] })

      // Marcador del chofer (animado)
      if (driver && ['chofer_camino', 'chofer_llego', 'a_bordo', 'en_curso'].includes(trip.status)) {
        const icon = L.divIcon({
          html: `<div style="background:#fb923c;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 0 16px rgba(251,146,60,0.6);">${driver.avatar}</div>`,
          className: '', iconSize: [36, 36], iconAnchor: [18, 18],
        })
        const startLat = DAIREAUX.lat + (Math.random() - 0.5) * 0.012
        const startLng = DAIREAUX.lng + (Math.random() - 0.5) * 0.012
        const m = L.marker([startLat, startLng], { icon }).addTo(map)
        driverMarkerRef.current = { marker: m, startLat, startLng }

        // Animar hacia la ubicación del pasajero
        if (trip.status === 'chofer_camino') {
          let t = 0
          const target = [DAIREAUX.lat - 0.003, DAIREAUX.lng + 0.004]
          const interval = setInterval(() => {
            t = Math.min(t + 0.02, 1)
            const lat = startLat + (target[0] - startLat) * t
            const lng = startLng + (target[1] - startLng) * t
            m.setLatLng([lat + (Math.random() - 0.5) * 0.0002, lng + (Math.random() - 0.5) * 0.0002])
            if (t >= 1) clearInterval(interval)
          }, 200)
        }
      }

      leafletRef.current = map
    })

    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null }
    }
  }, [trip?.status])

  const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <div style={{ minHeight: '100vh', background: '#080a10', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* HEADER */}
      <header style={{ background: 'rgba(12,14,22,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Remis Las 4 Estaciones</div>
        <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {!trip ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Viaje no encontrado</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>El ID de viaje <strong>{id}</strong> no existe o expiró.</div>
            <Link to="/" style={{ color: '#60a5fa', fontSize: 14 }}>Volver al inicio</Link>
          </div>
        ) : (
          <>
            {/* Estado principal */}
            <div style={{ background: `${st.c}12`, border: `1px solid ${st.c}30`, borderRadius: 18, padding: 22, marginBottom: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{st.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: st.c, marginBottom: 4 }}>{st.l}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{trip.id}</div>
            </div>

            {/* Barra de progreso */}
            {!['cancelado', 'pendiente'].includes(trip.status) && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  {STEPS.map((s, i) => {
                    const done = i <= stepIdx
                    const lbl = { asignado: 'Asig.', chofer_camino: 'Camino', chofer_llego: 'Llegó', a_bordo: 'Bordo', en_curso: 'Viaje', completado: 'Listo' }
                    return (
                      <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#4ade80' : 'rgba(255,255,255,0.08)', border: `2px solid ${done ? '#4ade80' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: done ? '#080a10' : 'rgba(255,255,255,0.3)', fontWeight: 800 }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 9, color: done ? '#4ade80' : 'rgba(255,255,255,0.2)', fontWeight: done ? 700 : 400 }}>{lbl[s]}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(5, (stepIdx / (STEPS.length - 1)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80, #22c55e)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            )}

            {/* Mapa */}
            {!['pendiente', 'cancelado', 'completado'].includes(trip.status) && (
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: 240, marginBottom: 18, position: 'relative' }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0f18' }} />
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(8,10,16,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '5px 10px', fontSize: 10, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  EN VIVO
                </div>
              </div>
            )}

            {/* Info del viaje */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', width: 22 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origen</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{trip.from}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', width: 22 }}>🏁</span>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destino</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{trip.to}</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Precio estimado</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>{fmt(trip.price)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Hora</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{trip.time}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chofer */}
            {driver && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{driver.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{driver.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{driver.car} · {driver.plate}</div>
                  <div style={{ fontSize: 12, color: '#facc15', marginTop: 2 }}>⭐ {driver.rating}</div>
                </div>
                <a href={`tel:${driver.phone}`} style={{ width: 40, height: 40, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none' }}>
                  📞
                </a>
              </div>
            )}

            {/* Contacto remisería */}
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>¿Necesitás ayuda?</div>
              <a href="tel:+54912345678" style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>📞 +54 9 12345678</a>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Remis Las 4 Estaciones · Daireaux</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
