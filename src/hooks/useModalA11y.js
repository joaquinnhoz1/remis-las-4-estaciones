import { useEffect } from 'react'

/**
 * Accesibilidad básica para modales:
 *  - Cierra con la tecla Escape
 *  - Bloquea el scroll del fondo mientras el modal está abierto
 *
 * Usar junto con role="dialog" aria-modal="true" en el contenedor del modal.
 */
export default function useModalA11y(onClose, active = true) {
  useEffect(() => {
    if (!active) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, active])
}
