import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminBundlesApi, adminProductsApi, adminCategoriesApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

const defaultForm = { name: '', discountPercentage: 10, productIds: [], categoryIds: [], active: true }

export default function Bundles() {
  const { token } = useAuth()
  const [bundles, setBundles] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Search products
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const load = async () => {
    try {
      const [bRes, pRes, cRes] = await Promise.all([
        adminBundlesApi.list(token),
        adminProductsApi.list(token, { limit: 1000, active: 'all' }),
        adminCategoriesApi.list(token)
      ])
      
      console.log('📦 Bundles response:', bRes)
      console.log('📦 Products response:', pRes)
      console.log('📦 Categories response:', cRes)

      setBundles(bRes.data?.bundles || [])
      
      // Handle different possible response structures
      const loadedProducts = pRes.data?.products || pRes.data || []
      const loadedCategories = cRes.data?.categories || cRes.data || []
      
      console.log('✅ Products loaded:', loadedProducts.length)
      console.log('✅ Categories loaded:', loadedCategories.length)
      
      setProducts(loadedProducts)
      setCategories(loadedCategories)
    } catch (err) {
      console.error('❌ Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  const showToast = (msg, error = false) => {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSearch = (val) => {
    setSearchTerm(val)
    
    if (!Array.isArray(products) || !Array.isArray(categories)) {
      setSearchResults([])
      return
    }

    // If search is empty, show first 10 items
    if (!val) {
      const pInitial = products.filter(p => !form.productIds.includes(p.id)).slice(0, 5).map(i => ({ ...i, type: 'product' }))
      const cInitial = categories.filter(c => !form.categoryIds.includes(c.id)).slice(0, 5).map(i => ({ ...i, type: 'category' }))
      setSearchResults([...pInitial, ...cInitial])
      return
    }

    const filteredProducts = products.filter(p => 
      (p.name?.toLowerCase().includes(val.toLowerCase()) || 
       p.description?.toLowerCase().includes(val.toLowerCase())) && 
      !form.productIds.includes(p.id)
    ).slice(0, 10).map(i => ({ ...i, type: 'product' }))

    const filteredCategories = categories.filter(c => 
      c.name?.toLowerCase().includes(val.toLowerCase()) && 
      !form.categoryIds.includes(c.id)
    ).slice(0, 5).map(i => ({ ...i, type: 'category' }))
    
    setSearchResults([...filteredProducts, ...filteredCategories])
  }

  const addItem = (item) => {
    if (item.type === 'product') {
      setForm(prev => ({ ...prev, productIds: [...prev.productIds, item.id] }))
    } else {
      setForm(prev => ({ ...prev, categoryIds: [...prev.categoryIds, item.id] }))
    }
    setSearchTerm('')
    setSearchResults([])
  }

  const removeItem = (id, type) => {
    if (type === 'product') {
      setForm(prev => ({ ...prev, productIds: prev.productIds.filter(pid => pid !== id) }))
    } else {
      setForm(prev => ({ ...prev, categoryIds: prev.categoryIds.filter(cid => cid !== id) }))
    }
  }

  const openEdit = (b) => {
    setForm({
      name: b.name,
      discountPercentage: b.discountPercentage,
      productIds: b.productIds || [],
      categoryIds: b.categoryIds || [],
      active: b.active,
    })
    setEditId(b.id)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const totalItems = form.productIds.length + form.categoryIds.length
    if (totalItems < 2) {
      showToast('Selecciona al menos 2 elementos (productos o categorías)', true)
      return
    }
    setSaving(true)
    try {
      if (modal === 'create') {
        await adminBundlesApi.create(form, token)
        showToast('Combo creado')
      } else {
        await adminBundlesApi.update(editId, form, token)
        showToast('Combo actualizado')
      }
      setModal(null)
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este combo?')) return
    try {
      await adminBundlesApi.delete(id, token)
      showToast('Combo eliminado')
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const getProductName = (id) => {
    if (!Array.isArray(products)) return 'Cargando...'
    const p = products.find(p => p.id === id)
    return p ? p.name : 'Producto no encontrado'
  }

  const getCategoryName = (id) => {
    if (!Array.isArray(categories)) return 'Cargando...'
    const c = categories.find(c => c.id === id)
    return c ? c.name : 'Categoría no encontrada'
  }

  return (
    <AdminLayout title="Combos (Descuentos por Pack)">
      <div className="admin-filters">
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
            Configura descuentos automáticos cuando se agregan productos específicos al carrito.
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => { setForm(defaultForm); setEditId(null); setModal('create') }}>
          + Nuevo Combo
        </button>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-empty"><div className="product-detail__spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr><th>Nombre del Combo</th><th>Elementos Incluidos</th><th>Descuento</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {bundles.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>No hay combos configurados</td></tr>}
              {bundles.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                      {b.productIds.map(pid => (
                        <span key={pid} className="admin-badge" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                          📦 {getProductName(pid)}
                        </span>
                      ))}
                      {(b.categoryIds || []).map(cid => (
                        <span key={cid} className="admin-badge" style={{ backgroundColor: '#eef2ff', color: '#4338ca' }}>
                          📁 {getCategoryName(cid)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{b.discountPercentage}% OFF</td>
                  <td><span className={`admin-badge ${b.active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>{b.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => openEdit(b)}>Editar</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(b.id)}>×</button>
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
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{modal === 'create' ? 'Nuevo Combo' : 'Editar Combo'}</h3>
              <button className="admin-modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__field">
                  <label className="admin-form__label">Nombre del Combo</label>
                  <input className="admin-form__input" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Pack Remera + Pantalón" />
                </div>
                
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label className="admin-form__label">Descuento (%)</label>
                    <input className="admin-form__input" name="discountPercentage" type="number" value={form.discountPercentage} onChange={handleChange} min="1" max="100" required />
                  </div>
                  <div className="admin-form__field" style={{ justifyContent: 'center', paddingTop: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> Combo activo
                    </label>
                  </div>
                </div>

                <div className="admin-form__field" style={{ position: 'relative' }}>
                  <label className="admin-form__label">Agregar Elementos (Productos o Categorías)</label>
                  <input 
                    className="admin-form__input" 
                    value={searchTerm} 
                    onChange={e => handleSearch(e.target.value)} 
                    onFocus={() => handleSearch(searchTerm)}
                    placeholder="Buscar producto o categoría..." 
                  />
                  {searchTerm && (
                    <div style={{ 
                      position: 'absolute', top: '100%', left: 0, right: 0, 
                      backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', borderRadius: '4px',
                      zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      marginTop: '4px', maxHeight: '250px', overflowY: 'auto'
                    }}>
                      {searchResults.length > 0 ? searchResults.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => addItem(item)}
                          style={{ 
                            padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--admin-border-light)', 
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {item.type === 'product' ? (
                            <>
                              {item.images?.[0] && <img src={item.images[0]} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text)', fontWeight: 500 }}>{item.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Producto • ${item.price}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--admin-accent-light)', color: 'var(--admin-accent-hover)', borderRadius: '4px' }}>📁</div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text)', fontWeight: 500 }}>{item.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Categoría completa</span>
                              </div>
                            </>
                          )}
                        </div>
                      )) : (
                        <div style={{ padding: '15px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                          No se encontraron resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '15px' }}>
                  <label className="admin-form__label">Elementos seleccionados:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {form.productIds.length === 0 && form.categoryIds.length === 0 && <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>No hay elementos seleccionados</p>}
                    
                    {/* Products */}
                    {form.productIds.map(pid => (
                      <div key={pid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--admin-bg-input)', borderRadius: '4px', border: '1px solid var(--admin-border)' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>📦 {getProductName(pid)}</span>
                        <button type="button" onClick={() => removeItem(pid, 'product')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                      </div>
                    ))}

                    {/* Categories */}
                    {form.categoryIds.map(cid => (
                      <div key={cid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--admin-accent-light)', borderRadius: '4px', border: '1px solid var(--admin-accent)' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-accent-hover)' }}>📁 Categoría: {getCategoryName(cid)}</span>
                        <button type="button" onClick={() => removeItem(cid, 'category')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-form__actions" style={{ marginTop: '30px' }}>
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setModal(null)}>Cancelar</button>
                  <button type="submit" className="admin-btn admin-btn--primary" disabled={saving || (form.productIds.length + form.categoryIds.length) < 2}>
                    {saving ? 'Guardando...' : 'Guardar Combo'}
                  </button>
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
