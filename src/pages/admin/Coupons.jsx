import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminCouponsApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—'

const defaultForm = { code: '', type: 'percentage', value: '', minPurchase: '', maxUses: '', expiresAt: '', active: true }

export default function Coupons() {
  const { token } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = () => {
    adminCouponsApi.list(token)
      .then(res => setCoupons(res.data.coupons))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const showToast = (msg, error = false) => {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 3000)
  }

  const openEdit = (c) => {
    setForm({
      code: c.code, type: c.type, value: c.value,
      minPurchase: c.minPurchase || '', maxUses: c.maxUses || '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', active: c.active,
    })
    setEditId(c.id)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      code: form.code.toUpperCase(),
      value: parseFloat(form.value),
      minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
      expiresAt: form.expiresAt || null,
    }
    try {
      if (modal === 'create') {
        await adminCouponsApi.create(body, token)
        showToast('Cupón creado')
      } else {
        await adminCouponsApi.update(editId, body, token)
        showToast('Cupón actualizado')
      }
      setModal(null)
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try {
      await adminCouponsApi.delete(id, token)
      showToast('Cupón eliminado')
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <AdminLayout title="Cupones">
      <div className="admin-filters">
        <div style={{ flex: 1 }} />
        <button className="admin-btn admin-btn--primary" onClick={() => { setForm(defaultForm); setEditId(null); setModal('create') }}>
          + Nuevo Cupón
        </button>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-empty"><div className="product-detail__spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Usos</th><th>Vence</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {coupons.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>Sin cupones</td></tr>}
              {coupons.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{c.code}</td>
                  <td>{c.type === 'percentage' ? 'Porcentaje' : 'Fijo'}</td>
                  <td>{c.type === 'percentage' ? `${c.value}%` : `$${parseFloat(c.value).toLocaleString('es-AR')}`}</td>
                  <td>{c.usedCount || 0}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>{fmtDate(c.expiresAt)}</td>
                  <td><span className={`admin-badge ${c.active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>{c.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => openEdit(c)}>Editar</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(c.id)}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="admin-modal__overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{modal === 'create' ? 'Nuevo Cupón' : 'Editar Cupón'}</h3>
              <button className="admin-modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Código</label>
                    <input className="admin-form__input" name="code" value={form.code} onChange={handleChange} required placeholder="DESCUENTO20" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="admin-form__field">
                    <label className="admin-form__label">Tipo</label>
                    <select className="admin-form__select" name="type" value={form.type} onChange={handleChange}>
                      <option value="percentage">Porcentaje</option>
                      <option value="fixed">Monto fijo</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Valor ({form.type === 'percentage' ? '%' : '$'})</label>
                    <input className="admin-form__input" name="value" type="number" step="0.01" value={form.value} onChange={handleChange} required />
                  </div>
                  <div className="admin-form__field">
                    <label className="admin-form__label">Compra mínima ($)</label>
                    <input className="admin-form__input" name="minPurchase" type="number" step="0.01" value={form.minPurchase} onChange={handleChange} placeholder="Opcional" />
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Usos máximos</label>
                    <input className="admin-form__input" name="maxUses" type="number" value={form.maxUses} onChange={handleChange} placeholder="Ilimitado" />
                  </div>
                  <div className="admin-form__field">
                    <label className="admin-form__label">Fecha de expiración</label>
                    <input className="admin-form__input" name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
                  </div>
                </div>
                <div className="admin-form__field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} id="coupon-active" />
                  <label htmlFor="coupon-active" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Cupón activo</label>
                </div>
                <div className="admin-form__actions">
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setModal(null)}>Cancelar</button>
                  <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`admin-toast ${toast.error ? 'admin-toast--error' : ''}`}>{toast.msg}</div>}
    </AdminLayout>
  )
}
