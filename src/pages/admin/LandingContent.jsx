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
  const [uploading, setUploading] = useState(null)
  const [cropModal, setCropModal] = useState(null)
  const [activeTab, setActiveTab] = useState('hero')

  // ─── Content state ───────────────────────────────────
  const [announcementBar1, setAnnouncementBar1] = useState('Envío gratis en compras superiores a $50.000')
  const [announcementBar2, setAnnouncementBar2] = useState('Envíos a todo el país · Nuevos drops cada semana')
  const [philosophyQuote, setPhilosophyQuote] = useState('"ESTILO, ACTITUD Y ESENCIA"')
  const [newArrivalsTitle, setNewArrivalsTitle] = useState('NUEVOS INGRESOS')
  const [allProductsTitle, setAllProductsTitle] = useState('TODOS LOS PRODUCTOS')
  const [editorialTitle, setEditorialTitle] = useState('[ TEARZ JOURNAL ]')
  const [editorialSubtitle, setEditorialSubtitle] = useState('Inspiración, cultura y estilo por el equipo de Tearz 1874!')

  const [heroSlides, setHeroSlides] = useState([
    { tag: 'NUEVA COLECCIÓN', title: 'OTOÑO / INVIERNO 2026', cta: 'VER COLECCIÓN', image: '' },
    { tag: 'EDICIÓN LIMITADA', title: 'COLECCIÓN CÁPSULA', cta: 'EXPLORAR', image: '' },
    { tag: 'SALE', title: 'HASTA 50% OFF', cta: 'COMPRAR AHORA', image: '' },
  ])
  const [saleBanner, setSaleBanner] = useState({ label: 'TEARZ 1874!', title: 'SALE', subtitle: 'Prendas en liquidación con descuentos increíbles', cta: 'VER SALE', image: '' })
  const [lookbook, setLookbook] = useState({ tag: 'LOOKBOOK', title: 'OTOÑO / INVIERNO 2026', cta: 'VER LOOKBOOK', image: '' })

  const [footerNewsletter, setFooterNewsletter] = useState('Recibí las últimas novedades por email.')
  const [footerCopyright, setFooterCopyright] = useState('© 2026 — TEARZ 1874!')
  const [socialLinks, setSocialLinks] = useState({ instagram: '', tiktok: '', facebook: '', twitter: '' })

  useEffect(() => {
    siteContentApi.getAll(token)
      .then(res => {
        const c = res.data.content
        if (c.hero_slides) setHeroSlides(c.hero_slides)
        if (c.sale_banner) setSaleBanner(c.sale_banner)
        if (c.lookbook) setLookbook(c.lookbook)
        if (c.announcement_bar_1) setAnnouncementBar1(c.announcement_bar_1)
        if (c.announcement_bar_2) setAnnouncementBar2(c.announcement_bar_2)
        if (c.philosophy_quote) setPhilosophyQuote(c.philosophy_quote)
        if (c.new_arrivals_title) setNewArrivalsTitle(c.new_arrivals_title)
        if (c.all_products_title) setAllProductsTitle(c.all_products_title)
        if (c.editorial_title) setEditorialTitle(c.editorial_title)
        if (c.editorial_subtitle) setEditorialSubtitle(c.editorial_subtitle)
        if (c.footer_newsletter) setFooterNewsletter(c.footer_newsletter)
        if (c.footer_copyright) setFooterCopyright(c.footer_copyright)
        if (c.social_links) setSocialLinks(c.social_links)
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
    e.target.value = ''
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

  const saveAll = async () => {
    setSaving(true)
    try {
      await Promise.all([
        siteContentApi.upsert('hero_slides', heroSlides, token),
        siteContentApi.upsert('sale_banner', saleBanner, token),
        siteContentApi.upsert('lookbook', lookbook, token),
        siteContentApi.upsert('announcement_bar_1', announcementBar1, token),
        siteContentApi.upsert('announcement_bar_2', announcementBar2, token),
        siteContentApi.upsert('philosophy_quote', philosophyQuote, token),
        siteContentApi.upsert('new_arrivals_title', newArrivalsTitle, token),
        siteContentApi.upsert('all_products_title', allProductsTitle, token),
        siteContentApi.upsert('editorial_title', editorialTitle, token),
        siteContentApi.upsert('editorial_subtitle', editorialSubtitle, token),
        siteContentApi.upsert('footer_newsletter', footerNewsletter, token),
        siteContentApi.upsert('footer_copyright', footerCopyright, token),
        siteContentApi.upsert('social_links', socialLinks, token),
      ])
      showToast('Contenido guardado ✓')
    } catch (err) { showToast(err.message || 'Error', true) }
    finally { setSaving(false) }
  }

  const updateSlide = (idx, field, value) => {
    setHeroSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const addSlide = () => setHeroSlides(prev => [...prev, { ...defaultSlide }])
  const removeSlide = (idx) => { if (heroSlides.length > 1) setHeroSlides(prev => prev.filter((_, i) => i !== idx)) }

  if (loading) return <AdminLayout title="Landing Page"><div className="admin-empty"><div className="product-detail__spinner" /></div></AdminLayout>

  const tabs = [
    { key: 'hero', label: '🎞️ Hero' },
    { key: 'texts', label: '✏️ Textos' },
    { key: 'banners', label: '🖼️ Banners' },
    { key: 'footer', label: '📋 Footer' },
  ]

  return (
    <AdminLayout title="Landing Page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="admin-landing-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`admin-landing-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="admin-btn admin-btn--primary" onClick={saveAll} disabled={saving}>
          {saving ? 'Guardando...' : '💾 Guardar Todo'}
        </button>
      </div>

      {/* ─── HERO TAB ─── */}
      {activeTab === 'hero' && (
        <div className="admin-landing-section">
          <div className="admin-landing-section__header">
            <h3 className="admin-landing-section__title">Hero Banners ({heroSlides.length} slides)</h3>
            <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={addSlide}>+ Agregar Slide</button>
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
                  <label className="admin-form__label">Imagen (3:2 recomendada)</label>
                  <div className="admin-upload__zone" style={{ padding: '16px' }}>
                    <input type="file" accept="image/*" onChange={e => openCropper(e, 1.5, (url) => updateSlide(idx, 'image', url))} />
                    <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir y recortar'}</p>
                  </div>
                </div>
                {heroSlides.length > 1 && (
                  <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeSlide(idx)} style={{ alignSelf: 'flex-start' }}>🗑️ Eliminar Slide</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TEXTS TAB ─── */}
      {activeTab === 'texts' && (
        <>
          <div className="admin-landing-section">
            <h3 className="admin-landing-section__title" style={{ marginBottom: '16px' }}>Barras de Anuncio</h3>
            <div className="admin-landing-card" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-form" style={{ gap: '12px' }}>
                <div className="admin-form__field">
                  <label className="admin-form__label">Barra Superior</label>
                  <input className="admin-form__input" value={announcementBar1} onChange={e => setAnnouncementBar1(e.target.value)} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Barra Inferior</label>
                  <input className="admin-form__input" value={announcementBar2} onChange={e => setAnnouncementBar2(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-landing-section">
            <h3 className="admin-landing-section__title" style={{ marginBottom: '16px' }}>Secciones de Texto</h3>
            <div className="admin-landing-card" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-form" style={{ gap: '12px' }}>
                <div className="admin-form__field">
                  <label className="admin-form__label">Frase Filosofía</label>
                  <input className="admin-form__input" value={philosophyQuote} onChange={e => setPhilosophyQuote(e.target.value)} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Título "Nuevos Ingresos"</label>
                  <input className="admin-form__input" value={newArrivalsTitle} onChange={e => setNewArrivalsTitle(e.target.value)} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Título "Todos los Productos"</label>
                  <input className="admin-form__input" value={allProductsTitle} onChange={e => setAllProductsTitle(e.target.value)} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Título Sección Journal</label>
                  <input className="admin-form__input" value={editorialTitle} onChange={e => setEditorialTitle(e.target.value)} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Subtítulo Sección Journal</label>
                  <input className="admin-form__input" value={editorialSubtitle} onChange={e => setEditorialSubtitle(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── BANNERS TAB ─── */}
      {activeTab === 'banners' && (
        <>
          <div className="admin-landing-section">
            <div className="admin-landing-section__header">
              <h3 className="admin-landing-section__title">Lookbook</h3>
            </div>
            <div className="admin-landing-card">
              <div className="admin-landing-card__preview">
                {lookbook.image ? (
                  <>
                    <img src={lookbook.image} alt="" />
                    <button className="admin-landing-card__crop-btn" onClick={() => setCropModal({ image: lookbook.image, aspect: 2.1, callback: (url) => setLookbook(prev => ({ ...prev, image: url })) })}>✂️ Recortar</button>
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
                  <label className="admin-form__label">Imagen (21:9 recomendada)</label>
                  <div className="admin-upload__zone" style={{ padding: '16px' }}>
                    <input type="file" accept="image/*" onChange={e => openCropper(e, 2.1, (url) => setLookbook(prev => ({ ...prev, image: url })))} />
                    <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir y recortar'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  <label className="admin-form__label">CTA</label>
                  <input className="admin-form__input" value={saleBanner.cta || ''} onChange={e => setSaleBanner(prev => ({ ...prev, cta: e.target.value }))} />
                </div>
                <div className="admin-form__field">
                  <label className="admin-form__label">Imagen (3:2)</label>
                  <div className="admin-upload__zone" style={{ padding: '16px' }}>
                    <input type="file" accept="image/*" onChange={e => openCropper(e, 1.5, (url) => setSaleBanner(prev => ({ ...prev, image: url })))} />
                    <p className="admin-upload__text" style={{ fontSize: '0.75rem' }}>{uploading ? 'Subiendo...' : 'Click para subir y recortar'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── FOOTER TAB ─── */}
      {activeTab === 'footer' && (
        <div className="admin-landing-section">
          <h3 className="admin-landing-section__title" style={{ marginBottom: '16px' }}>Footer</h3>
          <div className="admin-landing-card" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form" style={{ gap: '12px' }}>
              <div className="admin-form__field">
                <label className="admin-form__label">Texto Newsletter</label>
                <input className="admin-form__input" value={footerNewsletter} onChange={e => setFooterNewsletter(e.target.value)} />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">Copyright</label>
                <input className="admin-form__input" value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} />
              </div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Redes Sociales (URLs)</h4>
              <div className="admin-form__field">
                <label className="admin-form__label">Instagram</label>
                <input className="admin-form__input" value={socialLinks.instagram} onChange={e => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/..." />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">TikTok</label>
                <input className="admin-form__input" value={socialLinks.tiktok} onChange={e => setSocialLinks(prev => ({ ...prev, tiktok: e.target.value }))} placeholder="https://tiktok.com/..." />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">Facebook</label>
                <input className="admin-form__input" value={socialLinks.facebook} onChange={e => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label">X (Twitter)</label>
                <input className="admin-form__input" value={socialLinks.twitter} onChange={e => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))} placeholder="https://x.com/..." />
              </div>
            </div>
          </div>
        </div>
      )}

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
