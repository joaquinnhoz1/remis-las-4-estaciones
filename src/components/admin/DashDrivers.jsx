import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import useModalA11y from '../../hooks/useModalA11y'
import styles from './DashDrivers.module.css'

function StatusDot({ status }) {
  const colors = { disponible: '#00C851', 'en viaje': '#FFE000', inactivo: '#555' }
  return <span style={{ color: colors[status] || '#555', fontSize: 12, fontWeight: 600 }}>● {status}</span>
}

export default function DashDrivers() {
  const { drivers, addDriver, updateDriverStatus, removeDriver } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', car: '', plate: '', pin: '' })
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formError, setFormError] = useState('')
  useModalA11y(() => { setShowAdd(false); setConfirmDelete(null); setFormError('') }, showAdd || !!confirmDelete)

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase()
    return !q || d.name.toLowerCase().includes(q) || d.car.toLowerCase().includes(q) || d.plate.toLowerCase().includes(q)
  })

  const handleAdd = (e) => {
    e.preventDefault()
    setFormError('')
    if (!(form.name && form.phone && form.car && form.plate)) {
      setFormError('Completá todos los campos.')
      return
    }
    if (!/^\d{4}$/.test(form.pin)) {
      setFormError('El PIN debe tener exactamente 4 dígitos.')
      return
    }
    if (drivers.some(d => d.pin === form.pin)) {
      setFormError('Ese PIN ya está en uso por otro chofer. Elegí otro.')
      return
    }
    addDriver(form)
    setForm({ name: '', phone: '', car: '', plate: '', pin: '' })
    setShowAdd(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Choferes</h1>
          <p className={styles.sub}>{drivers.length} choferes registrados · {drivers.filter(d => d.status === 'disponible').length} disponibles ahora</p>
        </div>
        <button className={styles.btnAdd} onClick={() => { setShowAdd(true); setFormError('') }}>+ Agregar chofer</button>
      </div>

      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          placeholder="Buscar por nombre, auto, patente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* CARDS GRID */}
      <div className={styles.grid}>
        {filtered.map(driver => (
          <div key={driver.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}>{driver.avatar}</div>
              <div className={styles.info}>
                <div className={styles.name}>{driver.name}</div>
                <div className={styles.phone}>{driver.phone}</div>
              </div>
              <StatusDot status={driver.status} />
            </div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Vehículo</span>
                <span className={styles.detailValue}>{driver.car}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Patente</span>
                <span className={styles.detailValue}>{driver.plate}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Calificación</span>
                <span className={styles.detailValue} style={{ color: '#FFE000' }}>★ {driver.rating}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Viajes</span>
                <span className={styles.detailValue}>{driver.trips}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <select
                className={styles.statusSelect}
                value={driver.status}
                onChange={e => updateDriverStatus(driver.id, e.target.value)}
              >
                <option value="disponible">Disponible</option>
                <option value="en viaje">En viaje</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <button
                className={styles.deleteBtn}
                onClick={() => setConfirmDelete(driver)}
                aria-label={`Eliminar chofer ${driver.name}`}
                title="Eliminar chofer"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>No se encontraron choferes.</div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className={styles.overlay} onClick={() => { setShowAdd(false); setFormError('') }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Agregar nuevo chofer">
            <h3 className={styles.modalTitle}>Agregar nuevo chofer</h3>
            <form onSubmit={handleAdd} className={styles.form}>
              {[
                { key: 'name',  label: 'Nombre completo', placeholder: 'Ej: Carlos Rodríguez' },
                { key: 'phone', label: 'Teléfono',        placeholder: 'Ej: 2317-550199' },
                { key: 'car',   label: 'Vehículo',        placeholder: 'Ej: Toyota Corolla' },
                { key: 'plate', label: 'Patente',         placeholder: 'Ej: AB123CD' },
                { key: 'pin',   label: 'PIN de acceso (4 dígitos)', placeholder: 'Ej: 7890', maxLength: 4, type: 'password' },
              ].map(f => (
                <div key={f.key} className={styles.field}>
                  <label className={styles.label}>{f.label}</label>
                  <input
                    className={styles.input}
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    maxLength={f.maxLength}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              {formError && (
                <div style={{ color: '#f87171', fontSize: 12.5, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                  {formError}
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancelModal} onClick={() => { setShowAdd(false); setFormError('') }}>Cancelar</button>
                <button type="submit" className={styles.btnSave}>Guardar chofer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirmar eliminación de chofer">
            <h3 className={styles.modalTitle}>¿Eliminar chofer?</h3>
            <p className={styles.confirmText}>
              Estás por eliminar a <strong>{confirmDelete.name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancelModal} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className={styles.btnDelete} onClick={() => { removeDriver(confirmDelete.id); setConfirmDelete(null) }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
