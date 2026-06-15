import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }

export default function DashTariffs() {
  const { tariffs, updateTariffs, destinations, addDestination, updateDestination, removeDestination } = useApp()
  const [form, setForm] = useState({ ...tariffs })
  const [saved, setSaved] = useState(false)
  const [newDest, setNewDest] = useState({ from: 'Daireaux', to: '', distance: '', price: '', returnPrice: '', time: '' })
  const [showDestForm, setShowDestForm] = useState(false)
  const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const save = () => {
    updateTariffs(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const exampleCalc = (km, night = false, luggage = false) => {
    const base = Math.max(form.tarifaMinima, km * form.precioPorKm)
    let p = base
    if (night) p *= (1 + form.recargoNocturno / 100)
    if (luggage) p += form.recargoEquipaje
    return Math.round(p / 100) * 100
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Tarifas Inteligentes</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Configuración de precios — los cambios se aplican en tiempo real a nuevas reservas</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        {/* CONFIGURACIÓN */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20 }}>⚙️ Parámetros de tarifa</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'tarifaMinima',     label: 'Tarifa mínima ($)',           type: 'number', desc: 'Precio base independiente de distancia' },
              { key: 'precioPorKm',      label: 'Precio por km — urbano ($)',  type: 'number', desc: 'Por la ruta calculada dentro del radio' },
              { key: 'tarifaInterurbana',label: 'Precio por km — interurbano ($)', type: 'number', desc: 'Viajes fuera del radio urbano' },
              { key: 'radioUrbanoKm',    label: 'Radio urbano (km)',           type: 'number', desc: 'A partir de aquí aplica tarifa interurbana' },
              { key: 'recargoNocturno',  label: 'Recargo nocturno (%)',        type: 'number', desc: '22hs–6hs sobre la tarifa base' },
              { key: 'recargoFeriado',   label: 'Recargo feriado (%)',         type: 'number', desc: 'Días feriados nacionales' },
              { key: 'recargoEquipaje',  label: 'Recargo equipaje ($)',        type: 'number', desc: 'Monto fijo adicional por equipaje' },
            ].map(f => (
              <div key={f.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{f.label}</label>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{f.desc}</span>
                </div>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '10px 13px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
              </div>
            ))}
            <button onClick={save} style={{ padding: '12px', borderRadius: 12, background: saved ? 'rgba(74,222,128,0.15)' : '#fff', color: saved ? '#4ade80' : '#0f1119', fontWeight: 700, fontSize: 14, border: saved ? '1px solid rgba(74,222,128,0.3)' : 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s', marginTop: 4 }}>
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* SIMULADOR */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20 }}>🧮 Simulador de precios</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '3 km — viaje urbano diurno', km: 3, night: false, luggage: false },
              { label: '5 km — viaje urbano nocturno', km: 5, night: true, luggage: false },
              { label: '8 km — con equipaje', km: 8, night: false, luggage: true },
              { label: '12 km — interurbano', km: 12, night: false, luggage: false, inter: true },
              { label: '20 km — nocturno + equipaje', km: 20, night: true, luggage: true },
            ].map((s, i) => {
              const km = s.inter ? s.km * (form.tarifaInterurbana / form.precioPorKm) : s.km
              const price = exampleCalc(km, s.night, s.luggage)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{fmt(price)}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 14, lineHeight: 1.5 }}>
            Prioridad: (1) Destino fijo → (2) Tarifa zona → (3) Km × precio + recargos. En todos los casos se respeta la tarifa mínima.
          </p>
        </div>
      </div>

      {/* DESTINOS FIJOS */}
      <div style={g}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>📍 Destinos con precio fijo</h2>
          <button onClick={() => setShowDestForm(true)} style={{ background: '#fff', color: '#0f1119', padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Agregar</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {destinations.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${d.active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`, borderRadius: 12, opacity: d.active ? 1 : 0.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{d.from} → {d.to}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{d.distance} km · {d.time}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{fmt(d.price)}</div>
                {d.returnPrice && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Ida y vuelta: {fmt(d.returnPrice)}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => updateDestination(d.id, { active: !d.active })}
                  style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: d.active ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${d.active ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`, color: d.active ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                  {d.active ? 'Activo' : 'Inactivo'}
                </button>
                <button onClick={() => removeDestination(d.id)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL NUEVO DESTINO */}
      {showDestForm && (
        <div onClick={() => setShowDestForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(12,14,22,0.97)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'inherit' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Nuevo destino fijo</h3>
            {[
              { l: 'Origen', k: 'from', ph: 'Ej: Daireaux' },
              { l: 'Destino', k: 'to', ph: 'Ej: Pehuajó' },
              { l: 'Distancia (km)', k: 'distance', ph: '70', num: true },
              { l: 'Precio ida ($)', k: 'price', ph: '18000', num: true },
              { l: 'Precio ida y vuelta ($)', k: 'returnPrice', ph: '32000', num: true },
              { l: 'Tiempo estimado', k: 'time', ph: '55 min' },
            ].map(f => (
              <div key={f.k}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{f.l}</div>
                <input type={f.num ? 'number' : 'text'} placeholder={f.ph} value={newDest[f.k]} onChange={e => setNewDest(p => ({ ...p, [f.k]: f.num ? Number(e.target.value) : e.target.value }))}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '10px 13px', color: '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowDestForm(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={() => { addDestination({ ...newDest, active: true }); setShowDestForm(false); setNewDest({ from: 'Daireaux', to: '', distance: '', price: '', returnPrice: '', time: '' }) }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#fff', color: '#0f1119', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
