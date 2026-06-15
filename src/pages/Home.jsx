import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Phone, MapPin, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react'
import BookingModal from '../components/BookingModal'
import SuccessModal from '../components/SuccessModal'
import { useApp } from '../context/AppContext'

const NAV_ITEMS = ['Inicio', 'Nosotros', 'Tarifas', 'Beneficios', 'FAQ']

const SERVICES = [
  { icon: '🚗', name: 'Remis Urbano', desc: 'Traslados dentro de la ciudad con choferes profesionales y precio fijo.', price: 'Desde $1.500' },
  { icon: '🚙', name: 'Remis Premium', desc: 'Vehículos 0km con aire acondicionado, WiFi y máximo confort.', price: 'Desde $2.200' },
  { icon: '🚐', name: 'Remis Grupal', desc: 'Unidades para grupos de hasta 6 pasajeros con equipaje.', price: 'Desde $3.000' },
  { icon: '✈️', name: 'Traslado Aeropuerto', desc: 'Servicio puntual al Aeropuerto Internacional de Daireaux.', price: 'Desde $4.500' },
]

const BENEFITS = [
  { icon: '🕐', title: 'Disponible 24/7', desc: 'Cualquier día, a cualquier hora. Siempre hay un remis para vos.' },
  { icon: '💰', title: 'Precio fijo', desc: 'Sin sorpresas. El precio acordado es el precio que pagás.' },
  { icon: '⭐', title: 'Choferes verificados', desc: 'Todos nuestros choferes pasan por un proceso de selección riguroso.' },
  { icon: '📍', title: 'Seguimiento en vivo', desc: 'Seguí tu remis en tiempo real desde que lo solicitás.' },
  { icon: '🛡️', title: 'Viajes seguros', desc: 'Unidades con seguro completo y choferes habilitados.' },
  { icon: '📱', title: 'Reserva fácil', desc: 'Reservá por esta web, por WhatsApp o llamando al instante.' },
]

const FAQS = [
  { q: '¿Cómo reservo un remis?', a: 'Podés reservar desde esta página haciendo clic en "Reservar ahora", llamándonos al +54 9 12345678 o por WhatsApp.' },
  { q: '¿Cuánto tarda en llegar el remis?', a: 'El tiempo promedio de llegada es de 5 minutos dentro de la ciudad. Te confirmamos la espera exacta al momento de la reserva.' },
  { q: '¿Puedo pagar con tarjeta?', a: 'Sí, aceptamos efectivo, débito y crédito. También podés pagar por transferencia bancaria.' },
  { q: '¿Atienden feriados y fines de semana?', a: 'Sí, trabajamos los 365 días del año, las 24 horas. Los fines de semana y feriados pueden aplicar un pequeño recargo.' },
  { q: '¿Hacen viajes interurbanos?', a: 'Sí, realizamos traslados a otras ciudades de la provincia. Consultanos por precio para tu destino específico.' },
]

const REVIEWS = [
  { name: 'Analía M.', text: 'Siempre puntuales y muy amables. Lo uso todos los días para ir al trabajo.', stars: 5 },
  { name: 'Roberto P.', text: 'El mejor servicio de remis de Daireaux. Precio justo y chofer profesional.', stars: 5 },
  { name: 'Valentina G.', text: 'Me salvaron mil veces a la madrugada. Súper confiables.', stars: 5 },
]

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [showBooking, setShowBooking] = useState(false)
  const { bookingSuccess } = useApp()
  const navigate = useNavigate()

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ══════════════ HERO ══════════════ */}
      <section id="inicio" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

        {/* VIDEO */}
        <video
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src="/hero.mp4"
          autoPlay muted loop playsInline
        />

        {/* OVERLAY */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1 }} />

        {/* CONTENT */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 2 }}>

          {/* NAVBAR */}
          <nav style={{ width: '100%', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.9)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#202A36', fontWeight: 800, fontSize: 18 }}>R</div>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>Remis Las<br />4 Estaciones</span>
              </div>

              {/* Desktop links */}
              <ul className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none' }}>
                {NAV_ITEMS.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo(item.toLowerCase())}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'inherit', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                    >{item}</button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setShowBooking(true)}
                    style={{ padding: '8px 20px', borderRadius: 9999, backgroundColor: '#202A36', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', transition: 'background-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2229'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#202A36'}
                  >Reservar</button>
                </li>
              </ul>

              {/* Hamburger */}
              <button className="mobile-menu-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}
                onClick={() => setMobileOpen(o => !o)}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
              <div style={{ margin: '0 16px', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', padding: '16px 24px' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {NAV_ITEMS.map((item) => (
                    <li key={item}>
                      <button onClick={() => scrollTo(item.toLowerCase())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'inherit' }}>{item}</button>
                    </li>
                  ))}
                  <li>
                    <button onClick={() => { setShowBooking(true); setMobileOpen(false) }} style={{ width: '100%', padding: '10px', borderRadius: 9999, backgroundColor: '#202A36', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Reservar ahora</button>
                  </li>
                </ul>
              </div>
            )}
          </nav>

          {/* HERO TEXT */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-80px' }}>
            <div style={{
              textAlign: 'center',
              padding: '48px 40px',
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.30)',
              maxWidth: 620,
              width: '90vw',
            }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                REMISERÍA EN DAIREAUX
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1, letterSpacing: '-0.04em', margin: 0 }}>
                  Rápido.
                </h1>
                <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 400, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.04em', margin: 0, marginTop: '-10px' }}>
                  Confiable.
                </h1>
              </div>
              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.72)', maxWidth: '36rem', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                Tu remis en minutos, las 24 horas. Precio fijo, choferes profesionales.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowBooking(true)}
                  style={{ padding: '12px 28px', borderRadius: 9999, backgroundColor: '#fff', color: '#202A36', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'background-color 0.15s, transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  Reservar ahora
                </button>
                <a href="tel:+54912345678"
                  style={{ padding: '12px 28px', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 8, transition: 'background-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                >
                  <Phone size={15} /> +54 9 12345678
                </a>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 0, marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.18)', justifyContent: 'center' }}>
                {[
                  { n: '12K+', l: 'Viajes' },
                  { n: '4.9★', l: 'Calificación' },
                  { n: '5 min', l: 'Espera prom.' },
                  { n: '24/7', l: 'Disponible' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '0 20px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.18)' : 'none', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{s.n}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ NOSOTROS ══════════════ */}
      <section id="nosotros" className="hide-mobile" style={sectionStyle('#fff')}>
        <div style={containerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div>
              <Tag>Quiénes somos</Tag>
              <h2 style={h2Style}>Tu remisería de confianza en Daireaux</h2>
              <p style={pStyle}>Más de 10 años conectando a los cordobeses con choferes profesionales. Nacimos con una misión simple: que llegues a donde necesitás, seguro y a tiempo.</p>
              <p style={{ ...pStyle, marginTop: 16 }}>Cada uno de nuestros choferes pasa por un proceso de selección estricto. Las unidades se revisan mensualmente. Porque tu seguridad no es negociable.</p>
              <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
                <Pill icon="🏆" text="10 años de experiencia" />
                <Pill icon="👥" text="+50 choferes activos" />
                <Pill icon="🚗" text="Flota propia" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { n: '12.000+', l: 'Viajes completados' },
                { n: '98%', l: 'Clientes satisfechos' },
                { n: '5 min', l: 'Tiempo promedio de llegada' },
                { n: '24/7', l: 'Atención sin interrupciones' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: 16, padding: '24px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#202A36', letterSpacing: '-1px' }}>{s.n}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TARIFAS ══════════════ */}
      <section id="tarifas" className="hide-mobile" style={sectionStyle('#f9fafb')}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Tag>Tarifas</Tag>
            <h2 style={h2Style}>Elegí el servicio que necesitás</h2>
            <p style={{ ...pStyle, maxWidth: 480, margin: '0 auto' }}>Precio fijo acordado antes de salir. Sin recargos ocultos.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {SERVICES.map((s, i) => (
              <div key={i}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: 36 }}>{s.icon}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{s.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, flex: 1 }}>{s.desc}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#202A36' }}>{s.price}</div>
                <button onClick={() => setShowBooking(true)} style={{ padding: '10px 20px', borderRadius: 9999, background: '#202A36', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', marginTop: 4 }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2229'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#202A36'}
                >Reservar</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BENEFICIOS ══════════════ */}
      <section id="beneficios" className="hide-mobile" style={sectionStyle('#202A36')}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Tag light>Beneficios</Tag>
            <h2 style={{ ...h2Style, color: '#fff' }}>Por qué elegir Las 4 Estaciones</h2>
            <p style={{ ...pStyle, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto' }}>Más que un remis — una experiencia.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{b.icon}</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{b.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ RESEÑAS ══════════════ */}
      <section className="hide-mobile" style={sectionStyle('#fff')}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Tag>Opiniones</Tag>
            <h2 style={h2Style}>Lo que dicen nuestros pasajeros</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ color: '#f59e0b', fontSize: '1.1rem', letterSpacing: 2 }}>{'★'.repeat(r.stars)}</div>
                <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.7, flex: 1 }}>"{r.text}"</p>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section id="faq" className="hide-mobile" style={sectionStyle('#f9fafb')}>
        <div style={{ ...containerStyle, maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Tag>FAQ</Tag>
            <h2 style={h2Style}>Preguntas frecuentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: 16 }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>{f.q}</span>
                  {openFaq === i ? <ChevronUp size={18} color="#6b7280" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#6b7280" style={{ flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 18px', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="hide-mobile" style={{ ...sectionStyle('#202A36'), padding: '80px 24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 16 }}>
            ¿Necesitás un remis ahora?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', marginBottom: 32 }}>
            Reservá en segundos o llamanos directamente.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowBooking(true)} style={{ padding: '14px 32px', borderRadius: 9999, backgroundColor: '#fff', color: '#202A36', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
            >
              Reservar ahora
            </button>
            <a href="tel:+54912345678" style={{ padding: '14px 32px', borderRadius: 9999, backgroundColor: 'transparent', color: '#fff', fontWeight: 700, border: '2px solid rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={18} /> +54 9 12345678
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="hide-mobile" style={{ background: '#111827', padding: '40px 32px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#202A36', fontWeight: 800, fontSize: 16 }}>R</div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Remis Las<br />4 Estaciones</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>© 2026 Remis Las 4 Estaciones · Daireaux, Argentina · Tel: +54 9 12345678</p>
          <button onClick={() => navigate('/admin/login')} style={{ background: 'transparent', color: '#4b5563', border: '1px solid #374151', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
            onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
          >
            Acceso Admin
          </button>
        </div>
      </footer>

      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
      {bookingSuccess && <SuccessModal />}

      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-nav { display: none !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Helpers ── */
const sectionStyle = (bg) => ({ background: bg, padding: '96px 24px' })
const containerStyle = { maxWidth: '80rem', margin: '0 auto' }
const h2Style = { fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', margin: '12px 0 16px' }
const pStyle = { fontSize: '1rem', color: '#6b7280', lineHeight: 1.7, margin: 0 }

function Tag({ children, light }) {
  return (
    <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,0.5)' : '#6b7280', background: light ? 'rgba(255,255,255,0.08)' : '#f3f4f6', padding: '4px 12px', borderRadius: 999, marginBottom: 8 }}>
      {children}
    </span>
  )
}

function Pill({ icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>
      {icon} {text}
    </span>
  )
}
