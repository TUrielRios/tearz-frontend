import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminCategoriesApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

export default function Categories() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = () => {
    adminCategoriesApi.list(token)
      .then(res => setCategories(res.data.categories))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const showToast = (msg, error = false) => {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await adminCategoriesApi.create(form, token)
        showToast('Categoría creada')
      } else {
        await adminCategoriesApi.update(editId, form, token)
        showToast('Categoría actualizada')
      }
      setModal(null)
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await adminCategoriesApi.delete(id, token)
      showToast('Categoría eliminada')
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
  }

  return (
    <AdminLayout title="Categorías">
      <div className="admin-filters">
        <div style={{ flex: 1 }} />
        <button className="admin-btn admin-btn--primary" onClick={() => { setForm({ name: '' }); setEditId(null); setModal('create') }}>
          + Nueva Categoría
        </button>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-empty"><div className="product-detail__spinner" /></div> : (
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Slug</th><th>Acciones</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>{c.slug}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => { setForm({ name: c.name }); setEditId(c.id); setModal('edit') }}>Editar</button>
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
              <h3 className="admin-modal__title">{modal === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}</h3>
              <button className="admin-modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__field">
                  <label className="admin-form__label">Nombre</label>
                  <input className="admin-form__input" value={form.name} onChange={e => setForm({ name: e.target.value })} required placeholder="Ej: Remeras" />
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
