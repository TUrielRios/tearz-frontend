import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminProductsApi, adminCategoriesApi, uploadApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

const fmtPrice = (n) => `$${parseFloat(n || 0).toLocaleString('es-AR')}`

const defaultForm = { name: '', description: '', price: '', oldPrice: '', stock: 0, categoryId: '', sizes: 'S,M,L,XL,XXL', colors: '', badge: '', images: [], active: true }

export default function Products() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = () => {
    Promise.all([
      adminProductsApi.list(token, { limit: 100 }),
      adminCategoriesApi.list(token),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.products)
      setCategories(cRes.data.categories)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const showToast = (msg, error = false) => {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => {
    setForm(defaultForm)
    setEditId(null)
    setModal('create')
  }

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '', price: p.price,
      oldPrice: p.oldPrice || '', stock: p.stock, categoryId: p.categoryId || '',
      sizes: (p.sizes || []).join(','), colors: (p.colors || []).join(','),
      badge: p.badge || '', images: p.images || [], active: p.active,
    })
    setEditId(p.id)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      price: parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      stock: parseInt(form.stock, 10),
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
      categoryId: form.categoryId || null,
      badge: form.badge || null,
    }
    try {
      if (modal === 'create') {
        await adminProductsApi.create(body, token)
        showToast('Producto creado')
      } else {
        await adminProductsApi.update(editId, body, token)
        showToast('Producto actualizado')
      }
      setModal(null)
      load()
    } catch (err) {
      showToast(err.message || 'Error', true)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return
    try {
      await adminProductsApi.delete(id, token)
      showToast('Producto desactivado')
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const res = await uploadApi.images(files, token)
      setForm(prev => ({ ...prev, images: [...prev.images, ...res.data.urls] }))
    } catch (err) { showToast('Error subiendo imagen', true) }
    finally { setUploading(false) }
  }

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const stockClass = (s) => s <= 5 ? 'admin-stock--low' : s <= 15 ? 'admin-stock--medium' : 'admin-stock--high'

  return (
    <AdminLayout title="Productos">
      <div className="admin-filters">
        <div className="admin-filters__search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openCreate}>
          + Nuevo Producto
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty"><div className="product-detail__spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={p.images?.[0] || '/placeholder.png'} alt="" className="admin-table__img" /></td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>{p.category?.name || '—'}</td>
                  <td>{fmtPrice(p.price)}</td>
                  <td><span className={`admin-stock ${stockClass(p.stock)}`}>{p.stock}</span></td>
                  <td><span className={`admin-badge ${p.active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>{p.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => openEdit(p)}>Editar</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(p.id)}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Create/Edit */}
      {modal && (
        <div className="admin-modal__overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{modal === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
              <button className="admin-modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__field">
                  <label className="admin-form__label">Nombre</label>
                  <input className="admin-form__input" name="name" value={form.name} onChange={handleChange} required placeholder='Ej: Remera "Cash Rules"' />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Descripción</label>
                  <textarea className="admin-form__textarea" name="description" value={form.description} onChange={handleChange} placeholder="Descripción del producto..." />
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Precio</label>
                    <input className="admin-form__input" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required placeholder="25000" />
                  </div>
                  <div className="admin-form__field">
                    <label className="admin-form__label">Precio anterior (sale)</label>
                    <input className="admin-form__input" name="oldPrice" type="number" step="0.01" value={form.oldPrice} onChange={handleChange} placeholder="30000" />
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Stock</label>
                    <input className="admin-form__input" name="stock" type="number" value={form.stock} onChange={handleChange} required />
                  </div>
                  <div className="admin-form__field">
                    <label className="admin-form__label">Categoría</label>
                    <select className="admin-form__select" name="categoryId" value={form.categoryId} onChange={handleChange}>
                      <option value="">Sin categoría</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Talles (separados por coma)</label>
                    <input className="admin-form__input" name="sizes" value={form.sizes} onChange={handleChange} placeholder="S,M,L,XL,XXL" />
                  </div>
                  <div className="admin-form__field">
                    <label className="admin-form__label">Colores (hex, separados por coma)</label>
                    <input className="admin-form__input" name="colors" value={form.colors} onChange={handleChange} placeholder="#1a1a1a,#ffffff" />
                  </div>
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Badge (NUEVO, 15% OFF, etc.)</label>
                  <input className="admin-form__input" name="badge" value={form.badge} onChange={handleChange} placeholder="NUEVO" />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Imágenes</label>
                  <div className="admin-upload">
                    <div className="admin-upload__zone">
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                      <p className="admin-upload__text">{uploading ? 'Subiendo...' : <><strong>Click para subir</strong> o arrastrá imágenes</>}</p>
                    </div>
                    {form.images.length > 0 && (
                      <div className="admin-upload__preview">
                        {form.images.map((url, idx) => (
                          <div key={idx} className="admin-upload__thumb">
                            <img src={url} alt="" />
                            <button type="button" className="admin-upload__thumb-remove" onClick={() => removeImage(idx)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-form__field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} id="product-active" />
                  <label htmlFor="product-active" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Producto activo</label>
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
