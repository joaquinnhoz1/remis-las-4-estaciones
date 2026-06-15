// Módulo 16 — Roadmap
const PHASES = [
  {
    num: 1, label: 'MVP', status: 'done', color: '#4ade80',
    period: 'Ene — Mar 2026',
    items: [
      'Landing page pública con reserva en línea',
      'Panel de administración con autenticación',
      'Gestión de viajes (8 estados)',
      'Gestión de choferes',
      'Calculadora de tarifas en tiempo real',
      'Sistema de clientes por teléfono',
    ]
  },
  {
    num: 2, label: 'Notificaciones & Finanzas', status: 'done', color: '#4ade80',
    period: 'Mar — Abr 2026',
    items: [
      'Notificaciones WhatsApp (manual)',
      'Módulo de finanzas con gastos',
      'Ranking de choferes con score ponderado',
      'Registro de auditoría',
      'Lista negra de clientes',
      'Módulo de tarifas configurable',
    ]
  },
  {
    num: 3, label: 'Tracking & Choferes', status: 'done', color: '#4ade80',
    period: 'May — Jun 2026',
    items: [
      'App de choferes con login por PIN',
      'Panel chofer: ver y actualizar viajes',
      'Página de seguimiento público por ID',
      'Mapa en vivo con Leaflet',
      'Estadísticas avanzadas con gráficos',
      'Asignación automática de choferes',
    ]
  },
  {
    num: 4, label: 'Integración real', status: 'active', color: '#facc15',
    period: 'Jul — Sep 2026',
    items: [
      'Backend con Node.js / Express',
      'Base de datos PostgreSQL persistente',
      'WebSockets para tracking real (Socket.io)',
      'API de WhatsApp Business integrada',
      'Notificaciones push en app móvil',
      'Geolocalización GPS real desde el móvil del chofer',
    ]
  },
  {
    num: 5, label: 'App móvil', status: 'pending', color: '#6b7280',
    period: 'Oct — Dic 2026',
    items: [
      'App para choferes (React Native / Expo)',
      'App para clientes con cuenta y historial',
      'Pagos online (Mercado Pago)',
      'Calificaciones bidireccionales',
      'Chat en tiempo real chofer ↔ cliente',
      'Notificaciones push nativas',
    ]
  },
  {
    num: 6, label: 'Escala', status: 'pending', color: '#6b7280',
    period: '2027+',
    items: [
      'Multi-remisería (SaaS)',
      'Panel de franquicia / red de remises',
      'BI y reportes avanzados para gerencia',
      'Integración con AFIP para facturación electrónica',
      'Programa de fidelidad para clientes frecuentes',
      'Exportación de datos y API pública',
    ]
  },
]

const STATUS_STYLE = {
  done:    { label: 'Completado',  bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',  color: '#4ade80' },
  active:  { label: 'En progreso', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', color: '#facc15' },
  pending: { label: 'Pendiente',   bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', color: '#6b7280' },
}

export default function DashRoadmap() {
  const done    = PHASES.filter(p => p.status === 'done').length
  const total   = PHASES.length
  const pct     = Math.round((done / total) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Roadmap del Producto</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Plan de desarrollo para Remis Las 4 Estaciones — 6 fases</p>
      </div>

      {/* Progreso global */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Progreso general</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80' }}>{pct}% completado</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{done} de {total} fases</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Última actualización: Jun 2026</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80, #22c55e)', borderRadius: 999, transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {Object.entries(STATUS_STYLE).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{v.label}: {PHASES.filter(p => p.status === k).length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, rgba(74,222,128,0.4), rgba(107,114,128,0.15))' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PHASES.map((phase, i) => {
            const st = STATUS_STYLE[phase.status]
            return (
              <div key={phase.num} style={{ display: 'flex', gap: 22 }}>
                {/* Nodo */}
                <div style={{ flexShrink: 0, width: 40, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phase.color}20`, border: `2px solid ${phase.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: phase.color, zIndex: 1, position: 'relative' }}>
                    {phase.status === 'done' ? '✓' : phase.num}
                  </div>
                </div>

                {/* Card */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${phase.status === 'active' ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: 20, marginBottom: 4, boxShadow: phase.status === 'active' ? '0 0 24px rgba(250,204,21,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Fase {phase.num}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>{st.label}</span>
                        {phase.status === 'active' && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                        )}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{phase.label}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'right', flexShrink: 0 }}>{phase.period}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {phase.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ flexShrink: 0, fontSize: 11, color: phase.status === 'done' ? '#4ade80' : phase.status === 'active' ? '#facc15' : 'rgba(255,255,255,0.2)', marginTop: 1 }}>
                          {phase.status === 'done' ? '✓' : '○'}
                        </span>
                        <span style={{ fontSize: 12.5, color: phase.status === 'done' ? 'rgba(255,255,255,0.6)' : phase.status === 'active' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nota */}
      <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
        💡 Este roadmap es orientativo. Las prioridades pueden ajustarse según las necesidades del negocio. Para activar la siguiente fase, contactar al equipo de desarrollo.
      </div>
    </div>
  )
}
