import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminJournalApi, uploadApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'
import CropperModal from '../../components/admin/CropperModal'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function AdminJournals() {
  const { token } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cropModal, setCropModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [form, setForm] = useState({ title: '', excerpt: '', body: '', coverImage: '', published: false })

  const showToast = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    adminJournalApi.list(token)
      .then(res => setPosts(res.data.posts))
      .catch(err => showToast(err.message || 'Error cargando', true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', excerpt: '', body: '', coverImage: '', published: false })
    setModalOpen(true)
  }

  const openEdit = (post) => {
    setEditing(post)
    setForm({ title: post.title, excerpt: post.excerpt, body: post.body, coverImage: post.coverImage || '', published: post.published })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return showToast('El título es obligatorio', true)
    setSaving(true)
    try {
      if (editing) {
        await adminJournalApi.update(editing.id, form, token)
        showToast('Journal actualizado ✓')
      } else {
        await adminJournalApi.create(form, token)
        showToast('Journal creado ✓')
      }
      setModalOpen(false)
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await adminJournalApi.delete(id, token)
      showToast('Journal eliminado ✓')
      setDeleteConfirm(null)
      load()
    } catch (err) { showToast(err.message || 'Error', true) }
  }

  const openCropper = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropModal({ image: reader.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = async (blob) => {
    setCropModal(null)
    setUploading(true)
    try {
      const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
      const res = await uploadApi.images([file], token)
      setForm(prev => ({ ...prev, coverImage: res.data.urls[0] }))
    } catch { showToast('Error subiendo imagen', true) }
    finally { setUploading(false) }
  }

  if (loading) return <AdminLayout title="Journal"><div className="admin-empty"><div className="product-detail__spinner" /></div></AdminLayout>

  return (
    <AdminLayout title="Journal">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>{posts.length} publicación(es)</p>
        <button className="admin-btn admin-btn--primary" onClick={openCreate}>+ Nuevo Journal</button>
      </div>

      {posts.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty__text">No hay publicaciones aún</p>
          <button className="admin-btn admin-btn--primary" onClick={openCreate} style={{ marginTop: '16px' }}>Crear primera publicación</button>
        </div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="admin-table__img" />
                    ) : (
                      <div className="admin-table__img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--admin-bg-input)', fontSize: '0.6rem', color: 'var(--admin-text-muted)' }}>—</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{post.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>{post.excerpt?.substring(0, 60)}{post.excerpt?.length > 60 ? '...' : ''}</div>
                  </td>
                  <td><span className={`admin-badge admin-badge--${post.published ? 'active' : 'inactive'}`}>{post.published ? 'Publicado' : 'Borrador'}</span></td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{fmtDate(post.publishedAt || post.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => openEdit(post)}>✏️ Editar</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteConfirm(post.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="admin-modal__overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{editing ? 'Editar Journal' : 'Nuevo Journal'}</h3>
              <button className="admin-modal__close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form">
                <div className="admin-form__field">
                  <label className="admin-form__label">Título *</label>
                  <input className="admin-form__input" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Título del artículo" />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Extracto (se muestra en la tarjeta)</label>
                  <textarea className="admin-form__textarea" value={form.excerpt} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Breve descripción del artículo..." rows={3} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Contenido (detalle del artículo)</label>
                  <textarea className="admin-form__textarea" value={form.body} onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))} placeholder="Escribí el contenido completo del artículo..." style={{ minHeight: '200px' }} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Imagen de Portada</label>
                  {form.coverImage && (
                    <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
                      <img src={form.coverImage} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }} />
                      <button onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))} style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--admin-danger)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                    </div>
                  )}
                  <div className="admin-upload__zone" style={{ padding: '16px' }}>
                    <input type="file" accept="image/*" onChange={openCropper} />
                    <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir portada'}</p>
                  </div>
                </div>
                <div className="admin-form__field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: 'var(--admin-accent)' }} />
                  <label htmlFor="published" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>Publicar (visible en la tienda)</label>
                </div>
                <div className="admin-form__actions">
                  <button className="admin-btn admin-btn--secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="admin-modal__overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Eliminar Journal</h3>
              <button className="admin-modal__close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="admin-modal__body" style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '20px' }}>¿Seguro que querés eliminar esta publicación? Esta acción no se puede deshacer.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(deleteConfirm)}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`admin-toast ${toast.error ? 'admin-toast--error' : ''}`}>{toast.msg}</div>}
      {cropModal && <CropperModal image={cropModal.image} aspect={1.5} onCropComplete={handleCropComplete} onCancel={() => setCropModal(null)} />}
    </AdminLayout>
  )
}
