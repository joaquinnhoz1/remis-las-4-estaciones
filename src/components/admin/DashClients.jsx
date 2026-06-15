import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }

const LABEL_COLORS = {
  VIP:       { color: '#facc15', bg: 'rgba(250,204,21,0.10)' },
  Frecuente: { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
  Regular:   { color: '#34d399', bg: 'rgba(52,211,153,0.10)' },
  Nuevo:     { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)' },
}

export default function DashClients() {
  const { clients, trips, blacklist, blockClient, unblockClient, isPhoneBlocked } = useApp()
  const onlyDigits = (p) => String(p || '').replace(/\D/g, '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [blockReason, setBlockReason] = useState('')
  const [tab, setTab] = useState('clients')

  const clientsWithStatus = clients.map(c => ({ ...c, isBlocked: isPhoneBlocked(c.phone) }))
  const filtered = clientsWithStatus.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const selectedTrips = selected ? trips.filter(t => t.phone === selected.phone) : []
  const blockEntry = selected ? blacklist.find(b => (b.phoneKey || onlyDigits(b.phone)) === onlyDigits(selected.phone)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Clientes</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>{clients.length} clientes identificados · {blacklist.length} bloqueados</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['clients', 'blacklist'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)', border: `1px solid ${tab === t ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)'}`, color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              {t === 'clients' ? '👥 Clientes' : '⛔ Bloqueados'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'clients' && (
        <>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '9px 14px', color: '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: 18 }}>
            {/* LIST */}
            <div style={g}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(c => {
                  const lc = LABEL_COLORS[c.label] || LABEL_COLORS.Nuevo
                  return (
                    <div key={c.phone} onClick={() => setSelected(c === selected ? null : c)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: selected?.phone === c.phone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected?.phone === c.phone ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: c.isBlocked ? '#f87171' : 'rgba(255,255,255,0.85)' }}>{c.isBlocked ? '⛔ ' : ''}{c.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{c.phone}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: lc.color, background: lc.bg, padding: '2px 8px', borderRadius: 999 }}>{c.label}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.trips} viajes</span>
                      </div>
                    </div>
                  )
                })}
                {filtered.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin resultados</p>}
              </div>
            </div>

            {/* DETAIL */}
            {selected && (
              <div style={g}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{selected.name}</h2>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{selected.phone}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { l: 'Viajes', v: selected.trips },
                    { l: 'Gasto total', v: fmt(selected.spent || 0) },
                    { l: 'Último viaje', v: selected.lastTrip || '—' },
                    { l: 'Etiqueta', v: selected.label },
                  ].map(r => (
                    <div key={r.l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 3 }}>{r.v}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Historial de viajes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {selectedTrips.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12 }}>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.55)' }}>{t.from} → {t.to}</span>
                        <div style={{ color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{t.date} · {t.time}</div>
                      </div>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{fmt(t.price)}</span>
                    </div>
                  ))}
                  {selectedTrips.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Sin viajes registrados</p>}
                </div>

                {!blockEntry ? (
                  <div style={{ marginTop: 16 }}>
                    <input placeholder="Motivo del bloqueo..." value={blockReason} onChange={e => setBlockReason(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%', marginBottom: 8 }} />
                    <button onClick={() => { blockClient(selected.phone, blockReason); setBlockReason('') }}
                      style={{ width: '100%', padding: '9px', borderRadius: 9, background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ⛔ Bloquear número
                    </button>
                  </div>
                ) : (
                  <button onClick={() => unblockClient(selected.phone)} style={{ marginTop: 16, width: '100%', padding: '9px', borderRadius: 9, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ✓ Desbloquear
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'blacklist' && (
        <div style={g}>
          {blacklist.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '32px 0' }}>No hay números bloqueados.</p>
            : blacklist.map(b => (
              <div key={b.phone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f87171' }}>⛔ {b.phone}</div>
                  {b.reason && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{b.reason}</div>}
                </div>
                <button onClick={() => unblockClient(b.phone)} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Desbloquear</button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
