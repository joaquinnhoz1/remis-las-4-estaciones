// Módulo 9 — Dashboard con mapa en vivo
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const DAIREAUX = { lat: -36.5996, lng: -61.7517 }
const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }

const STATUS_COLOR = {
  disponible: '#4ade80',
  en_viaje:   '#fb923c',
  inactivo:   '#6b7280',
}
const STATUS_LABEL = {
  disponible: 'Disponible',
  en_viaje:   'En viaje',
  inactivo:   'Inactivo',
}

// Posiciones simuladas alrededor de Daireaux
const DRIVER_POSITIONS = [
  { lat: -36.5980, lng: -61.7490 },
  { lat: -36.6020, lng: -61.7560 },
  { lat: -36.5960, lng: -61.7530 },
  { lat: -36.6010, lng: -61.7470 },
  { lat: -36.5990, lng: -61.7600 },
]

export default function DashMap() {
  const { drivers, trips, stats } = useApp()
  const mapRef    = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)

  useEffect(() => {
    if (mapRef.current && !leafletRef.current) {
      import('leaflet').then(L => {
        // Fix icon paths
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(
          [DAIREAUX.lat, DAIREAUX.lng], 14
        )

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map)

        // Centro de Daireaux marker
        L.circleMarker([DAIREAUX.lat, DAIREAUX.lng], {
          radius: 8, fillColor: '#ffffff', fillOpacity: 0.15, color: '#ffffff', opacity: 0.4, weight: 2
        }).addTo(map).bindTooltip('Centro · Daireaux', { permanent: false, direction: 'top' })

        // Choferes
        drivers.forEach((d, i) => {
          const pos = DRIVER_POSITIONS[i % DRIVER_POSITIONS.length]
          const color = STATUS_COLOR[d.status] || '#6b7280'
          const icon = L.divIcon({
            html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid rgba(255,255,255,0.8);box-shadow:0 0 12px ${color}80;cursor:pointer;">${d.avatar}</div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })
          const m = L.marker([pos.lat, pos.lng], { icon })
            .addTo(map)
            .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:150px"><strong>${d.name}</strong><br/><span style="color:${color}">● ${STATUS_LABEL[d.status]}</span><br/>${d.car} · ${d.plate}<br/>⭐ ${d.rating} · ${d.monthTrips} viajes este mes</div>`)
          markersRef.current.push(m)
        })

        leafletRef.current = map
        setMapReady(true)

        // Pequeño jitter simulando movimiento
        const interval = setInterval(() => {
          markersRef.current.forEach((m, i) => {
            const d = drivers[i]
            if (d?.status === 'en_viaje') {
              const ll = m.getLatLng()
              m.setLatLng([
                ll.lat + (Math.random() - 0.5) * 0.0005,
                ll.lng + (Math.random() - 0.5) * 0.0005,
              ])
            }
          })
        }, 3000)
        return () => clearInterval(interval)
      })
    }

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
        markersRef.current = []
        setMapReady(false)
      }
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Mapa en Vivo</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Posición de choferes en tiempo real · Daireaux, Buenos Aires</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(STATUS_LABEL).map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[k] }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { l: 'Disponibles', v: stats.availableDrivers, c: '#4ade80', icon: '🟢' },
          { l: 'En viaje',    v: stats.activeTrips,      c: '#fb923c', icon: '🚗' },
          { l: 'Pendientes',  v: stats.pendingTrips,     c: '#facc15', icon: '⏳' },
          { l: 'Total choferes', v: drivers.length,      c: '#60a5fa', icon: '👤' },
        ].map((s, i) => (
          <div key={i} style={{ ...g, padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
        {/* MAPA */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', minHeight: 460 }}>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 460, background: '#080a10' }} />
          {!mapReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,10,16,0.8)', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              Cargando mapa...
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(8,10,16,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80', animation: 'pulse 2s infinite' }} />
            EN VIVO
          </div>
        </div>

        {/* LISTA CHOFERES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>CHOFERES ACTIVOS</div>
          {drivers.map((d, i) => (
            <div key={d.id} onClick={() => setSelectedDriver(selectedDriver?.id === d.id ? null : d)} style={{ padding: '13px 14px', background: selectedDriver?.id === d.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedDriver?.id === d.id ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: `${STATUS_COLOR[d.status]}20`, border: `2px solid ${STATUS_COLOR[d.status]}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{d.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: STATUS_COLOR[d.status], fontWeight: 600 }}>● {STATUS_LABEL[d.status]}</div>
                </div>
              </div>
              {selectedDriver?.id === d.id && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🚙 {d.car} · {d.plate}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⭐ {d.rating} · {d.monthTrips} viajes</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📞 {d.phone}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
