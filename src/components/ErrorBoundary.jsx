import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // En producción esto se podría enviar a un servicio de logging
    console.error('ErrorBoundary capturó un error:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{ minHeight: '100vh', background: '#080a10', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🛠️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px' }}>Algo salió mal</h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 24px' }}>
            Ocurrió un error inesperado. Podés volver al inicio e intentar de nuevo.
          </p>
          <button
            onClick={this.handleReload}
            style={{ padding: '12px 28px', borderRadius: 12, background: '#fff', color: '#0f1119', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }
}
