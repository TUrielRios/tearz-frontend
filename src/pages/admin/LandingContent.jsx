import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { siteContentApi, uploadApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'
import CropperModal from '../../components/admin/CropperModal'

const defaultSlide = { tag: '', title: '', cta: '', image: '' }
const defaultBanner = { label: '', title: '', subtitle: '', cta: '', image: '' }
const defaultLookbook = { tag: '', title: '', cta: '', image: '' }

export default function LandingContent() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [uploading, setUploading] = useState(null) // track which field is uploading
  const [cropModal, setCropModal] = useState(null) // { image, aspect, callback }

  // Content state
  const [heroSlides, setHeroSlides] = useState([
    { tag: 'NUEVA COLECCIÓN', title: 'OTOÑO / INVIERNO 2026', cta: 'VER COLECCIÓN', image: '' },
    { tag: 'EDICIÓN LIMITADA', title: 'COLECCIÓN CÁPSULA', cta: 'EXPLORAR', image: '' },
    { tag: 'SALE', title: 'HASTA 50% OFF', cta: 'COMPRAR AHORA', image: '' },
  ])
  const [saleBanner, setSaleBanner] = useState({ label: 'TEARZ 1874!', title: 'SALE', subtitle: 'Prendas en liquidación con descuentos increíbles', cta: 'VER SALE', image: '' })
  const [lookbook, setLookbook] = useState({ tag: 'LOOKBOOK', title: 'OTOÑO / INVIERNO 2026', cta: 'VER LOOKBOOK', image: '' })

  useEffect(() => {
    siteContentApi.getAll(token)
      .then(res => {
        const content = res.data.content
        if (content.hero_slides) setHeroSlides(content.hero_slides)
        if (content.sale_banner) setSaleBanner(content.sale_banner)
        if (content.lookbook) setLookbook(content.lookbook)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const showToast = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3000) }

  const openCropper = (e, aspect, callback) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropModal({ image: reader.result, aspect, callback })
    reader.readAsDataURL(file)
    e.target.value = '' // Reset to allow same file again
  }

  const handleCropComplete = async (blob) => {
    const { callback } = cropModal
    setCropModal(null)
    setUploading(true)
    try {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
      const res = await uploadApi.images([file], token)
      callback(res.data.urls[0])
    } catch { showToast('Error subiendo imagen', true) }
    finally { setUploading(false) }
  }

  const handleUpload = async (files, callback) => {
    if (!files.length) return
    setUploading(true)
    try {
      const res = await uploadApi.images(files, token)
      callback(res.data.urls[0])
    } catch { showToast('Error subiendo imagen', true) }
    finally { setUploading(false) }
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      await Promise.all([
        siteContentApi.upsert('hero_slides', heroSlides, token),
        siteContentApi.upsert('sale_banner', saleBanner, token),
        siteContentApi.upsert('lookbook', lookbook, token),
      ])
      showToast('Contenido guardado ✓')
    } catch (err) { showToast(err.message || 'Error', true) }
    finally { setSaving(false) }
  }

  const updateSlide = (idx, field, value) => {
    setHeroSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  if (loading) return <AdminLayout title="Landing Page"><div className="admin-empty"><div className="product-detail__spinner" /></div></AdminLayout>

  return (
    <AdminLayout title="Landing Page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="admin-btn admin-btn--primary" onClick={saveAll} disabled={saving}>
          {saving ? 'Guardando...' : '💾 Guardar Todo'}
        </button>
      </div>

      {/* Hero Slides */}
      <div className="admin-landing-section">
        <div className="admin-landing-section__header">
          <h3 className="admin-landing-section__title">Hero Banners ({heroSlides.length} slides)</h3>
        </div>
        {heroSlides.map((slide, idx) => (
          <div key={idx} className="admin-landing-card" style={{ marginBottom: '16px' }}>
            <div className="admin-landing-card__preview">
              {slide.image ? (
                <>
                  <img src={slide.image} alt="" />
                  <button className="admin-landing-card__crop-btn" onClick={() => setCropModal({ image: slide.image, aspect: 1.5, callback: (url) => updateSlide(idx, 'image', url) })}>✂️ Recortar</button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>Sin imagen</div>
              )}
            </div>
            <div className="admin-form" style={{ gap: '12px' }}>
              <div className="admin-form__field">
                <label className="admin-form__label">Tag</label>
                <input className="admin-form__input" value={slide.tag} onChange={e => updateSlide(idx, 'tag', e.target.value)} placeholder="NUEVA COLECCIÓN" />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">Título</label>
                <input className="admin-form__input" value={slide.title} onChange={e => updateSlide(idx, 'title', e.target.value)} placeholder="OTOÑO / INVIERNO 2026" />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">CTA</label>
                <input className="admin-form__input" value={slide.cta} onChange={e => updateSlide(idx, 'cta', e.target.value)} placeholder="VER COLECCIÓN" />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">Imagen (Proporción 3:2 recomendada)</label>
                <div className="admin-upload__zone" style={{ padding: '16px' }}>
                  <input type="file" accept="image/*" onChange={e => openCropper(e, 1.5, (url) => updateSlide(idx, 'image', url))} />
                  <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir y recortar'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sale Banner */}
      <div className="admin-landing-section">
        <div className="admin-landing-section__header">
          <h3 className="admin-landing-section__title">Banner de Sale</h3>
        </div>
        <div className="admin-landing-card">
          <div className="admin-landing-card__preview">
            {saleBanner.image ? (
              <>
                <img src={saleBanner.image} alt="" />
                <button className="admin-landing-card__crop-btn" onClick={() => setCropModal({ image: saleBanner.image, aspect: 1.5, callback: (url) => setSaleBanner(prev => ({ ...prev, image: url })) })}>✂️ Recortar</button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>Sin imagen</div>
            )}
          </div>
          <div className="admin-form" style={{ gap: '12px' }}>
            <div className="admin-form__field">
              <label className="admin-form__label">Label</label>
              <input className="admin-form__input" value={saleBanner.label} onChange={e => setSaleBanner(prev => ({ ...prev, label: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">Título</label>
              <input className="admin-form__input" value={saleBanner.title} onChange={e => setSaleBanner(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">Subtítulo</label>
              <input className="admin-form__input" value={saleBanner.subtitle} onChange={e => setSaleBanner(prev => ({ ...prev, subtitle: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">Imagen (Proporción 1.5:1)</label>
              <div className="admin-upload__zone" style={{ padding: '16px' }}>
                <input type="file" accept="image/*" onChange={e => openCropper(e, 1.5, (url) => setSaleBanner(prev => ({ ...prev, image: url })))} />
                <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir y recortar'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lookbook */}
      <div className="admin-landing-section">
        <div className="admin-landing-section__header">
          <h3 className="admin-landing-section__title">Lookbook</h3>
        </div>
        <div className="admin-landing-card">
          <div className="admin-landing-card__preview">
            {lookbook.image ? (
              <>
                <img src={lookbook.image} alt="" />
                <button className="admin-landing-card__crop-btn" onClick={() => setCropModal({ image: lookbook.image, aspect: 1.5, callback: (url) => setLookbook(prev => ({ ...prev, image: url })) })}>✂️ Recortar</button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>Sin imagen</div>
            )}
          </div>
          <div className="admin-form" style={{ gap: '12px' }}>
            <div className="admin-form__field">
              <label className="admin-form__label">Tag</label>
              <input className="admin-form__input" value={lookbook.tag} onChange={e => setLookbook(prev => ({ ...prev, tag: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">Título</label>
              <input className="admin-form__input" value={lookbook.title} onChange={e => setLookbook(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">CTA</label>
              <input className="admin-form__input" value={lookbook.cta} onChange={e => setLookbook(prev => ({ ...prev, cta: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">Imagen (Proporción 3:2 recomendada)</label>
              <div className="admin-upload__zone" style={{ padding: '16px' }}>
                <input type="file" accept="image/*" onChange={e => openCropper(e, 1.5, (url) => setLookbook(prev => ({ ...prev, image: url })))} />
                <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir y recortar'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={`admin-toast ${toast.error ? 'admin-toast--error' : ''}`}>{toast.msg}</div>}

      {cropModal && (
        <CropperModal
          image={cropModal.image}
          aspect={cropModal.aspect}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropModal(null)}
        />
      )}
    </AdminLayout>
  )
}
