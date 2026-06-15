import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { X, Phone } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const glass = {
  background: 'rgba(15, 17, 25, 0.92)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.09)',
  borderRadius: 12, padding: '11px 14px', color: '#fff',
  fontSize: '0.9rem', fontFamily: 'Inter, system-ui, sans-serif',
  outline: 'none', width: '100%', transition: 'border-color 0.2s',
}

// Simula distancia entre dos direcciones (sin API real)
function estimateDistance(from, to) {
  if (!from || !to) return null
  const seed = (from.length * 7 + to.length * 13) % 120
  return Math.max(2, seed % 40 + 2)
}

const NOW_OPT = 'now'

export default function BookingModal({ onClose }) {
  const { addTrip, calcPrice, destinations, lookupClient, blacklist } = useApp()
  const [step, setStep] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [when, setWhen] = useState(NOW_OPT)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [hasLuggage, setHasLuggage] = useState(false)
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)
  const [foundClient, setFoundClient] = useState(null)
  const [blocked, setBlocked] = useState(false)

  const isNight = (() => {
    const h = when === NOW_OPT ? new Date().getHours() : parseInt((customTime || '12:00').split(':')[0])
    return h >= 22 || h < 6
  })()

  const fixedDest = destinations.find(d => d.active && to && d.to.toLowerCase().includes(to.toLowerCase()))
  const distKm = estimateDistance(from, to)
  const estimatedPrice = from && to && distKm
    ? calcPrice({ distanceKm: distKm, isNight, hasLuggage, fixedDestTo: to })
    : null

  // Lookup cliente frecuente
  useEffect(() => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 8) {
      const c = lookupClient(phone) || null
      setFoundClient(c)
      const bl = blacklist.find(b => b.phone === phone)
      setBlocked(!!bl)
      if (c && !name) setName(c.name)
    } else {
      setFoundClient(null)
      setBlocked(false)
    }
  }, [phone])

  const handleBook = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    addTrip({
      customer: name, phone, from, to,
      price: estimatedPrice || 0,
      distance: distKm ? `${distKm} km` : '—',
      obs: [hasLuggage && 'equipaje', obs].filter(Boolean).join(', '),
    })
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...glass, borderRadius: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>

        {/* HEADER */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Reservar remis</h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Paso {step} de 3</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* PROGRESS */}
        <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center' }}>
          {[1, 2, 3].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: step > n ? '#fff' : step === n ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: step >= n ? `2px solid ${step > n ? '#fff' : 'rgba(255,255,255,0.5)'}` : '2px solid rgba(255,255,255,0.10)', color: step > n ? '#000' : step === n ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}>
                {step > n ? '✓' : n}
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > n ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)', margin: '0 8px', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: RUTA Y PRECIO ── */}
        {step === 1 && (
          <div style={{ padding: 24 }}>
            <Label>¿A dónde vas?</Label>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '6px 14px', marginBottom: 12 }}>
              <RouteInput icon="🟡" placeholder="Punto de partida" value={from} onChange={setFrom} />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '2px 0' }} />
              <RouteInput icon="🔴" placeholder="Destino" value={to} onChange={setTo} />
            </div>

            {/* Destinos fijos sugeridos */}
            {to.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {destinations.filter(d => d.active && d.to.toLowerCase().includes(to.toLowerCase())).map(d => (
                  <button key={d.id} onClick={() => setTo(d.to)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    📍 {d.to} — {fmt(d.price)}
                  </button>
                ))}
              </div>
            )}

            {/* Precio estimado */}
            {estimatedPrice && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      {fixedDest ? '📍 Destino con precio fijo' : `📏 ~${distKm} km estimados`}
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{fmt(estimatedPrice)}</div>
                  </div>
                  {isNight && <span style={{ fontSize: '0.7rem', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.25)', color: '#facc15', padding: '3px 8px', borderRadius: 999 }}>🌙 +{useApp().tariffs?.recargoNocturno || 20}% nocturno</span>}
                </div>
              </div>
            )}

            {/* Opciones */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Toggle checked={hasLuggage} onChange={setHasLuggage} label="🧳 Equipaje" />
            </div>

            <Btn disabled={!from || !to} onClick={() => setStep(2)}>Continuar →</Btn>
          </div>
        )}

        {/* ── STEP 2: CUÁNDO ── */}
        {step === 2 && (
          <div style={{ padding: 24 }}>
            <Label>¿Cuándo lo necesitás?</Label>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[{ v: NOW_OPT, l: '⚡ Ahora mismo' }, { v: 'schedule', l: '📅 Programar' }].map(opt => (
                <button key={opt.v} onClick={() => setWhen(opt.v)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: when === opt.v ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${when === opt.v ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`, color: when === opt.v ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {opt.l}
                </button>
              ))}
            </div>

            {when === 'schedule' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div><FieldLabel>Fecha</FieldLabel><input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} style={inputStyle} min={new Date().toISOString().split('T')[0]} /></div>
                <div><FieldLabel>Hora</FieldLabel><input type="time" value={customTime} onChange={e => setCustomTime(e.target.value)} style={inputStyle} /></div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Observaciones (opcional)</FieldLabel>
              <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Ej: voy con bebé, accesibilidad, animales..." style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <BackBtn onClick={() => setStep(1)} />
              <Btn onClick={() => setStep(3)}>Continuar →</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 3: DATOS + CONFIRMACIÓN ── */}
        {step === 3 && (
          <div style={{ padding: 24 }}>
            <Label>Tus datos</Label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div>
                <FieldLabel>Teléfono</FieldLabel>
                <input style={{ ...inputStyle, borderColor: blocked ? 'rgba(248,113,113,0.5)' : foundClient ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.09)' }}
                  placeholder="+54 9 2317-XXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                {blocked && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>⛔ Este número está bloqueado.</p>}
                {!blocked && foundClient && (
                  <p style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: 4 }}>
                    ✓ Bienvenido/a, {foundClient.name} — {foundClient.trips} viajes realizados
                    {foundClient.label !== 'Nuevo' && ` · ${foundClient.label}`}
                  </p>
                )}
              </div>
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <input style={inputStyle} placeholder="Tu nombre completo" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            {/* Resumen */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {[
                { l: 'Origen', v: from },
                { l: 'Destino', v: to },
                { l: 'Cuándo', v: when === NOW_OPT ? 'Ahora mismo' : `${customDate} ${customTime}` },
                ...(obs ? [{ l: 'Notas', v: obs }] : []),
                ...(hasLuggage ? [{ l: 'Extras', v: 'Equipaje' }] : []),
              ].map((r, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: 12 }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{r.l}</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', textAlign: 'right' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Precio estimado</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{estimatedPrice ? fmt(estimatedPrice) : '—'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <BackBtn onClick={() => setStep(2)} />
              <Btn disabled={!name || !phone || loading || blocked} onClick={handleBook}>
                {loading
                  ? <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  : 'Confirmar reserva'}
              </Btn>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Helpers ──
function Label({ children }) {
  return <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 12 }}>{children}</p>
}
function FieldLabel({ children }) {
  return <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{children}</div>
}
function RouteInput({ icon, placeholder, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <span style={{ fontSize: 10, flexShrink: 0 }}>{icon}</span>
      <input style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', padding: '2px 0' }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: checked ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${checked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, color: checked ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
      {label}
    </button>
  )
}
function Btn({ children, onClick, disabled, mt }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ flex: 1, padding: '13px', borderRadius: 12, background: disabled ? 'rgba(255,255,255,0.06)' : '#fff', color: disabled ? 'rgba(255,255,255,0.2)' : '#0f1119', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', marginTop: mt || 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 46 }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#f3f4f6' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = disabled ? 'rgba(255,255,255,0.06)' : '#fff' }}>
      {children}
    </button>
  )
}
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
      ← Atrás
    </button>
  )
}
