import { useApp } from '../context/AppContext'
import useModalA11y from '../hooks/useModalA11y'

const glass = {
  background: 'rgba(15, 17, 25, 0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)',
}

export default function SuccessModal() {
  const { bookingSuccess, setBookingSuccess } = useApp()
  useModalA11y(() => setBookingSuccess(null))
  if (!bookingSuccess) return null

  return (
    <div
      onClick={() => setBookingSuccess(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Reserva confirmada"
        style={{
          ...glass,
          borderRadius: 24, padding: '40px 32px',
          maxWidth: 420, width: '100%',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          boxShadow: '0 32px 64px rgba(0,0,0,0.55)',
          animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ fontSize: 52 }}>🎉</div>

        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            ¡Reserva confirmada!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
            Tu remis está siendo gestionado. Un chofer será asignado en minutos.
          </p>
        </div>

        {/* INFO */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, width: '100%', overflow: 'hidden' }}>
          {[
            { l: 'Código de reserva', v: bookingSuccess.id, highlight: true },
            { l: 'Origen', v: bookingSuccess.from },
            { l: 'Destino', v: bookingSuccess.to },
            { l: 'Tiempo estimado', v: '~5 minutos', green: true },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', gap: 12,
              borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{r.l}</span>
              <span style={{
                fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', maxWidth: '60%',
                color: r.highlight ? '#fff' : r.green ? '#4ade80' : 'rgba(255,255,255,0.75)',
                fontFamily: r.highlight ? 'monospace' : 'inherit',
              }}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* TRACKING LINK */}
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.20)', borderRadius: 12, padding: '14px 18px', width: '100%' }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Seguí tu viaje en tiempo real
          </div>
          <a
            href={`/seguimiento/${bookingSuccess.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}
          >
            <span style={{ fontSize: '0.85rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
              {(typeof window !== 'undefined' ? window.location.host : '')}/seguimiento/{bookingSuccess.id}
            </span>
            <span style={{ fontSize: 16 }}>→</span>
          </a>
        </div>

        {/* NOTE */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 18px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, width: '100%' }}>
          📞 Consultas al <strong style={{ color: 'rgba(255,255,255,0.85)' }}>+54 9 12345678</strong>
        </div>

        <button
          onClick={() => setBookingSuccess(null)}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: '#fff', color: '#0f1119',
            fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit',
            border: 'none', cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          Aceptar
        </button>
      </div>

      <style>{`@keyframes popIn { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}
