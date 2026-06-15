// Módulo 11 — Estadísticas Avanzadas
import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
const g = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 22, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }

const TT_STYLE = { background: 'rgba(12,14,22,0.96)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, color: '#fff', fontSize: 12 }

const ZONE_COLORS = ['#60a5fa', '#4ade80', '#fb923c', '#facc15', '#a78bfa', '#f472b6']

export default function DashStats() {
  const { trips, drivers } = useApp()
  const [period, setPeriod] = useState('30d')

  const completed = trips.filter(t => t.status === 'completado')
  const cancelled = trips.filter(t => t.status === 'cancelado')
  const cancelRate = trips.length ? ((cancelled.length / trips.length) * 100).toFixed(1) : 0
  const avgTicket  = completed.length ? Math.round(completed.reduce((s, t) => s + t.price, 0) / completed.length) : 0
  const topDriver  = [...drivers].sort((a, b) => b.monthTrips - a.monthTrips)[0]

  // Serie diaria real (últimos 30 días) a partir de viajes completados
  const last30 = useMemo(() => {
    const out = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dayTrips = completed.filter(t => t.date === key)
      out.push({
        day: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        trips: dayTrips.length,
        income: dayTrips.reduce((s, t) => s + (t.price || 0), 0),
      })
    }
    return out
  }, [completed])

  // Demanda real por hora (a partir de la hora de cada viaje)
  const byHour = useMemo(() => Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    demand: trips.filter(t => parseInt(String(t.time || '').split(':')[0], 10) === h).length,
  })), [trips])

  // Zonas reales según destino de los viajes completados (top 5 + Otros)
  const zones = useMemo(() => {
    const counts = {}
    completed.forEach(t => { const k = (t.to || 'Otros').trim(); counts[k] = (counts[k] || 0) + 1 })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 5)
    const otros = sorted.slice(5).reduce((s, [, v]) => s + v, 0)
    const total = completed.length || 1
    const list = top.map(([name, v], i) => ({ name, value: Math.round((v / total) * 100), color: ZONE_COLORS[i] }))
    if (otros > 0) list.push({ name: 'Otros', value: Math.round((otros / total) * 100), color: ZONE_COLORS[5] })
    return list
  }, [completed])

  const data = period === '7d' ? last30.slice(-7) : period === '14d' ? last30.slice(-14) : last30

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Estadísticas</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Análisis del negocio con filtros por período</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d', '14d', '30d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: period === p ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${period === p ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`, color: period === p ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              {p === '7d' ? '7 días' : p === '14d' ? '14 días' : '30 días'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { l: 'Viajes completados', v: completed.length, icon: '✅', c: '#4ade80' },
          { l: 'Tasa cancelación',   v: `${cancelRate}%`, icon: '❌', c: '#f87171' },
          { l: 'Ticket promedio',    v: fmt(avgTicket),    icon: '🎫', c: '#60a5fa' },
          { l: 'Mejor chofer/mes',   v: topDriver?.name.split(' ')[0] || '—', icon: '🏆', c: '#facc15' },
        ].map((s, i) => (
          <div key={i} style={g}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c, letterSpacing: '-0.5px' }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* INGRESOS */}
      <div style={g}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>📈 Ingresos — últimos {period === '7d' ? '7' : period === '14d' ? '14' : '30'} días</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4ade80" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 6)} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v) => [fmt(v), 'Ingresos']} />
            <Area type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} fill="url(#incG)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* VIAJES POR DÍA */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>🚗 Viajes por día</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 5)} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} formatter={(v) => [v, 'Viajes']} />
              <Bar dataKey="trips" fill="rgba(96,165,250,0.6)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ZONAS */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>📍 Zonas más utilizadas</h2>
          {zones.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
              Sin viajes completados todavía
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <PieChart width={140} height={140}>
                <Pie data={zones} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {zones.map((z, i) => <Cell key={i} fill={z.color} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {zones.map(z => (
                  <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{z.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{z.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEMANDA POR HORA */}
      <div style={g}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>🕐 Horarios con mayor demanda</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={byHour} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v) => [v, 'Pedidos']} />
            <Bar dataKey="demand" radius={[3, 3, 0, 0]}>
              {byHour.map((d, i) => (
                <Cell key={i} fill={d.demand >= 8 ? '#fb923c' : d.demand >= 5 ? '#facc15' : 'rgba(255,255,255,0.12)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {[{ c: '#fb923c', l: 'Alta demanda' }, { c: '#facc15', l: 'Demanda media' }, { c: 'rgba(255,255,255,0.15)', l: 'Baja demanda' }].map(x => (
            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RENDIMIENTO POR CHOFER */}
      <div style={g}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>👤 Rendimiento por chofer</h2>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              {['Chofer', 'Viajes mes', 'Total', 'Calificación', 'Ingresos generados', 'Tendencia'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...drivers].sort((a, b) => b.monthTrips - a.monthTrips).map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{d.avatar}</div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{d.name}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 14, fontWeight: 800, color: '#fff' }}>{d.monthTrips}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{d.trips}</td>
                <td style={{ padding: '11px 12px' }}>
                  <span style={{ color: '#facc15', fontWeight: 700, fontSize: 13 }}>★ {d.rating}</span>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: '#4ade80' }}>
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(d.income)}
                </td>
                <td style={{ padding: '11px 12px' }}>
                  <span style={{ fontSize: 12, color: i < 2 ? '#4ade80' : i === 2 ? '#facc15' : 'rgba(255,255,255,0.3)' }}>
                    {i < 2 ? '↑ Subiendo' : i === 2 ? '→ Estable' : '↓ Bajando'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
