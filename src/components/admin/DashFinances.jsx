import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const g = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }
const CATS = ['Combustible', 'Taller', 'Seguro', 'Lavado', 'Peaje', 'VTV', 'Otro']
const CAT_ICON = { Combustible: '⛽', Taller: '🔧', Seguro: '🛡️', Lavado: '🚿', Peaje: '🛣️', VTV: '📋', Otro: '📌' }

export default function DashFinances() {
  const { trips, expenses, addExpense, removeExpense } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ category: 'Combustible', description: '', amount: '', vehicle: '', date: new Date().toISOString().split('T')[0] })

  const completed = trips.filter(t => t.status === 'completado')
  const totalIncome = completed.reduce((s, t) => s + t.price, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalIncome - totalExpenses
  const margin = totalIncome ? Math.round((netProfit / totalIncome) * 100) : 0

  const expByCategory = CATS.map(c => ({ cat: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter(x => x.total > 0)
  const maxExp = Math.max(...expByCategory.map(x => x.total), 1)

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)

  const handleAdd = () => {
    if (!form.description || !form.amount) return
    addExpense({ ...form, amount: Number(form.amount) })
    setForm({ category: 'Combustible', description: '', amount: '', vehicle: '', date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Finanzas</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Ingresos, gastos y rentabilidad</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: '#fff', color: '#0f1119', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Registrar gasto</button>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Ingresos totales', value: fmt(totalIncome), icon: '📈', color: '#4ade80' },
          { label: 'Gastos totales', value: fmt(totalExpenses), icon: '📉', color: '#f87171' },
          { label: 'Ganancia neta', value: fmt(netProfit), icon: '💰', color: netProfit >= 0 ? '#4ade80' : '#f87171' },
          { label: 'Margen', value: `${margin}%`, icon: '📊', color: margin >= 40 ? '#4ade80' : margin >= 20 ? '#facc15' : '#f87171' },
        ].map((s, i) => (
          <div key={i} style={g}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* GASTOS POR CATEGORÍA */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Gastos por categoría</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expByCategory.sort((a, b) => b.total - a.total).map(x => (
              <div key={x.cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{CAT_ICON[x.cat]} {x.cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{fmt(x.total)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${(x.total / maxExp) * 100}%`, height: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
            {expByCategory.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Sin gastos registrados</p>}
          </div>
        </div>

        {/* BALANCE VISUAL */}
        <div style={g}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Balance</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { l: 'Total ingresos', v: fmt(totalIncome), c: '#4ade80' },
              { l: 'Total gastos', v: fmt(totalExpenses), c: '#f87171' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{r.l}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: r.c }}>{r.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: netProfit >= 0 ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)', borderRadius: 10, border: `1px solid ${netProfit >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Ganancia neta</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: netProfit >= 0 ? '#4ade80' : '#f87171' }}>{fmt(netProfit)}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 4 }}>Basado en {completed.length} viajes completados y {expenses.length} gastos registrados</div>
          </div>
        </div>
      </div>

      {/* TABLA DE GASTOS */}
      <div style={g}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Gastos registrados</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', ...CATS].map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: filter === c ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === c ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`, color: filter === c ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>{CAT_ICON[e.category] || '📌'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{e.category} · {e.date}{e.vehicle ? ` · ${e.vehicle}` : ''}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171', flexShrink: 0 }}>{fmt(e.amount)}</div>
              <button onClick={() => removeExpense(e.id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
              >✕</button>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Sin gastos en esta categoría</p>}
        </div>
      </div>

      {/* MODAL AGREGAR GASTO */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(12,14,22,0.97)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'inherit' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Registrar gasto</h3>
            {[
              { l: 'Categoría', el: <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={sel}>{CATS.map(c => <option key={c}>{c}</option>)}</select> },
              { l: 'Descripción', el: <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej: Nafta 20L Toyota Corolla" style={inp} /> },
              { l: 'Monto ($)', el: <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" style={inp} /> },
              { l: 'Vehículo (patente)', el: <input value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))} placeholder="Ej: AB123CD" style={inp} /> },
              { l: 'Fecha', el: <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} /> },
            ].map(f => (
              <div key={f.l}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{f.l}</div>
                {f.el}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={handleAdd} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#fff', color: '#0f1119', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inp = { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '10px 13px', color: '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%' }
const sel = { ...inp, cursor: 'pointer' }
