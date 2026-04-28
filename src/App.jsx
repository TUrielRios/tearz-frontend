import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider, useCart } from './contexts/CartContext'
import { productsApi, categoriesApi, siteContentApi, journalApi } from './services/api'
import AuthModal from './components/AuthModal'
import ProductDetail from './pages/ProductDetail'
import JournalDetail from './pages/JournalDetail'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'
import AdminCoupons from './pages/admin/Coupons'
import AdminCustomers from './pages/admin/Customers'
import AdminLanding from './pages/admin/LandingContent'
import AdminJournals from './pages/admin/Journals'
import Checkout from './pages/Checkout'
import CheckoutStatus from './pages/CheckoutStatus'
import StaticPage from './pages/StaticPage'

/* Journal posts are now loaded from the API */

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  const { items, totalItems, subtotal, shippingCost, total, removeItem, updateQuantity, isOpen: cartOpen, setIsOpen: setCartOpen, clearCart } = useCart()

  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState({ productos: false, accesorios: false })
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [authOpen, setAuthOpen] = useState(false)

  const isHome = location.pathname === '/'

  const [announcementBar1, setAnnouncementBar1] = useState('Envío gratis en compras superiores a $50.000')
  const [announcementBar2, setAnnouncementBar2] = useState('Envíos a todo el país · Nuevos drops cada semana')
  const [footerNewsletter, setFooterNewsletter] = useState('Recibí las últimas novedades por email.')
  const [footerCopyright, setFooterCopyright] = useState('© 2026 — TEARZ 1874!')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState(null)
  
  // Hardcode instagram per user request
  const instagramLink = 'https://www.instagram.com/tearz.1874/'

  useEffect(() => {
    siteContentApi.getAll()
      .then(res => {
        const c = res.data?.content
        if (c) {
          if (c.announcement_bar_1) setAnnouncementBar1(c.announcement_bar_1)
          if (c.announcement_bar_2) setAnnouncementBar2(c.announcement_bar_2)
          if (c.footer_newsletter) setFooterNewsletter(c.footer_newsletter)
          if (c.footer_copyright) setFooterCopyright(c.footer_copyright)
        }
      })
      .catch(err => console.error('Error fetching layout content:', err))
  }, [])

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterStatus('loading')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      })
      const data = await res.json()
      if (data.success) {
        setNewsletterStatus('success')
        setNewsletterEmail('')
      } else {
        setNewsletterStatus('error')
      }
    } catch (err) {
      setNewsletterStatus('error')
    }
    setTimeout(() => setNewsletterStatus(null), 3000)
  }

  const handleNavClick = (path) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  const formatPrice = (p) => `$${parseFloat(p).toLocaleString('es-AR')}`

  return (
    <>
      {/* Announcement Bars */}
      <div className="announcement-bar">
        <div className="announcement-bar__inner">
          <p className="announcement-bar__text">{announcementBar1}</p>
        </div>
      </div>
      <div className="announcement-bar announcement-bar--dark">
        <div className="announcement-bar__inner">
          <p className="announcement-bar__text">{announcementBar2}</p>
        </div>
      </div>

      {/* Header */}
      <header className={`header ${headerScrolled ? 'scrolled' : ''}`}>
        <div className="header__top">
          <button className="header__mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className="header__logo">
            <Link to="/">
              <img src="/WEB/logo tearz.png" alt="Tearz 1874!" className="header__logo-img" />
            </Link>
          </div>
          <div className="header__utilities">
            <button className="header__utility-btn" onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button className="header__utility-btn" onClick={() => setAuthOpen(true)} aria-label="Mi Cuenta">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {isLoggedIn && <span className="header__auth-dot" />}
            </button>
            <button className="header__utility-btn" onClick={() => setCartOpen(true)} aria-label="Carrito">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="header__cart-count">{totalItems}</span>
            </button>
          </div>
        </div>
        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link to="/" className={`header__nav-link ${isHome ? 'active' : ''}`}>INICIO</Link>
            </li>
            {useAuth().user?.role === 'admin' && (
              <li className="header__nav-item">
                <Link to="/admin" className="header__nav-link" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>ADMIN</Link>
              </li>
            )}
            <li className="header__nav-item header__nav-item--dropdown">
              <Link to="/productos" className={`header__nav-link ${location.pathname.startsWith('/productos') ? 'active' : ''}`}>PRODUCTOS</Link>
              <div className="header__dropdown">
                <ul className="header__dropdown-list">
                  <li><Link to="/productos?category=remeras" className="header__dropdown-link">Remeras</Link></li>
                  <li><Link to="/productos?category=chombas" className="header__dropdown-link">Chombas</Link></li>
                  <li><Link to="/productos?category=bermudas" className="header__dropdown-link">Shorts</Link></li>
                  <li><Link to="/productos?category=musculosas" className="header__dropdown-link">Musculosas</Link></li>
                  <li><Link to="/productos?category=conjuntos" className="header__dropdown-link">Conjuntos</Link></li>
                </ul>
              </div>
            </li>
            <li className="header__nav-item header__nav-item--dropdown">
              <Link to="/productos?category=gorras" className="header__nav-link">ACCESORIOS</Link>
              <div className="header__dropdown">
                <ul className="header__dropdown-list">
                  <li><Link to="/productos?category=gorras" className="header__dropdown-link">Gorras</Link></li>
                </ul>
              </div>
            </li>
            <li className="header__nav-item">
              <Link to="/productos?sort=price_asc&badge=sale" className="header__nav-link header__nav-link--sale">SALE</Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu__header">
          <img src="/WEB/logo tearz.png" alt="Tearz 1874!" className="mobile-menu__logo" />
          <button className="mobile-menu__close" onClick={() => setMobileMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <ul className="mobile-menu__list">
          <li><button className="mobile-menu__link" onClick={() => handleNavClick('/')}>INICIO</button></li>
          <li className="mobile-menu__item--accordion">
            <button className="mobile-menu__accordion-btn" onClick={() => setAccordionOpen(prev => ({ ...prev, productos: !prev.productos }))}>
              PRODUCTOS <span className="accordion-icon">+</span>
            </button>
            <ul className={`mobile-menu__sub-list ${accordionOpen.productos ? 'open' : ''}`}>
              <li><button className="mobile-menu__sub-link" onClick={() => handleNavClick('/productos?category=remeras')}>Remeras</button></li>
              <li><button className="mobile-menu__sub-link" onClick={() => handleNavClick('/productos?category=chombas')}>Chombas</button></li>
              <li><button className="mobile-menu__sub-link" onClick={() => handleNavClick('/productos?category=bermudas')}>Shorts</button></li>
              <li><button className="mobile-menu__sub-link" onClick={() => handleNavClick('/productos?category=musculosas')}>Musculosas</button></li>
            </ul>
          </li>
          <li className="mobile-menu__item--accordion">
            <button className="mobile-menu__accordion-btn" onClick={() => setAccordionOpen(prev => ({ ...prev, accesorios: !prev.accesorios }))}>
              ACCESORIOS <span className="accordion-icon">+</span>
            </button>
            <ul className={`mobile-menu__sub-list ${accordionOpen.accesorios ? 'open' : ''}`}>
              <li><button className="mobile-menu__sub-link" onClick={() => handleNavClick('/productos?category=gorras')}>Gorras</button></li>
            </ul>
          </li>
          <li><button className="mobile-menu__link mobile-menu__link--sale" onClick={() => handleNavClick('/productos?sort=price_asc')}>SALE</button></li>
        </ul>
        <div className="mobile-menu__footer">
          <button className="mobile-menu__footer-link" onClick={() => { setMobileMenuOpen(false); setAuthOpen(true) }}>Mi Cuenta</button>
          <button className="mobile-menu__footer-link" onClick={() => { setMobileMenuOpen(false); setSearchOpen(true) }}>Buscar</button>
        </div>
      </div>
      <div className={`mobile-menu__overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/journal/:slug" element={<JournalDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutStatus variant="success" />} />
        <Route path="/checkout/failure" element={<CheckoutStatus variant="failure" />} />
        <Route path="/checkout/pending" element={<CheckoutStatus variant="pending" />} />
        <Route path="/politica-de-privacidad" element={<StaticPage />} />
        <Route path="/terminos-y-condiciones" element={<StaticPage />} />
        <Route path="/cambios-y-devoluciones" element={<StaticPage />} />
        <Route path="/preguntas-frecuentes" element={<StaticPage />} />
        <Route path="/contacto" element={<StaticPage />} />
      </Routes>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="footer__top">
          <div className="footer__col">
            <h4 className="footer__heading">MENÚ</h4>
            <ul className="footer__list">
              <li><Link to="/" className="footer__link">Inicio</Link></li>
              <li><Link to="/productos" className="footer__link">Productos</Link></li>
              <li><Link to="/contacto" className="footer__link">Contacto</Link></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">CATEGORÍAS</h4>
            <ul className="footer__list">
              <li><Link to="/productos" className="footer__link">Todos los Productos</Link></li>
              <li><Link to="/productos?category=remeras" className="footer__link">Remeras</Link></li>
              <li><Link to="/productos?category=chombas" className="footer__link">Chombas</Link></li>
              <li><Link to="/productos?category=bermudas" className="footer__link">Shorts</Link></li>
              <li><Link to="/productos?category=gorras" className="footer__link">Gorras</Link></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">NEWSLETTER</h4>
            <p className="footer__text">{footerNewsletter}</p>
            <form className="footer__newsletter" onSubmit={handleNewsletterSubmit}>
              <input type="email" className="footer__input" placeholder="Tu e-mail" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required />
              <button type="submit" className="footer__submit" disabled={newsletterStatus === 'loading'}>
                {newsletterStatus === 'loading' ? '...' : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </form>
            {newsletterStatus === 'success' && <p style={{color: 'green', fontSize: '0.8rem', marginTop: '4px'}}>¡Gracias por suscribirte!</p>}
            {newsletterStatus === 'error' && <p style={{color: 'red', fontSize: '0.8rem', marginTop: '4px'}}>Hubo un error. Intenta nuevamente.</p>}
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">INFORMACIÓN</h4>
            <ul className="footer__list">
              <li><Link to="/politica-de-privacidad" className="footer__link">Política de Privacidad</Link></li>
              <li><Link to="/terminos-y-condiciones" className="footer__link">Términos y Condiciones</Link></li>
              <li><Link to="/cambios-y-devoluciones" className="footer__link">Cambios y Devoluciones</Link></li>
              <li><Link to="/preguntas-frecuentes" className="footer__link">Preguntas Frecuentes</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer__social">
          <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
        </div>
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <img src="/WEB/logo pie de pagina.png" alt="Tearz 1874!" className="footer__logo" />
            <p className="footer__copyright">{footerCopyright}</p>
          </div>
          <div className="footer__bottom-right">
            <div className="footer__payments">
              <span className="footer__payment-icon" title="Visa"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24"><rect width="38" height="24" rx="4" fill="#fff" stroke="#e6e6e6"/><text x="19" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a1f71">VISA</text></svg></span>
              <span className="footer__payment-icon" title="Mastercard"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24"><rect width="38" height="24" rx="4" fill="#fff" stroke="#e6e6e6"/><circle cx="15" cy="12" r="6" fill="#eb001b" opacity="0.8"/><circle cx="23" cy="12" r="6" fill="#f79e1b" opacity="0.8"/></svg></span>
              <span className="footer__payment-icon" title="Mercado Pago"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24"><rect width="38" height="24" rx="4" fill="#fff" stroke="#e6e6e6"/><text x="19" y="14" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#009ee3">MP</text></svg></span>
              <span className="footer__payment-icon" title="Transferencia"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24"><rect width="38" height="24" rx="4" fill="#fff" stroke="#e6e6e6"/><text x="19" y="14" textAnchor="middle" fontSize="5" fontWeight="600" fill="#333">TRANS</text></svg></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Search Overlay */}
      <div className={`search-overlay ${searchOpen ? 'open' : ''}`}>
        <div className="search-overlay__inner">
          <button className="search-overlay__close" onClick={() => setSearchOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <form className="search-overlay__form" onSubmit={handleSearch}>
            <input type="text" className="search-overlay__input" placeholder="¿Qué estás buscando?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
            <button type="submit" className="search-overlay__submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
        </div>
      </div>

      {/* Cart Drawer */}
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-drawer__header">
          <h3 className="cart-drawer__title">Carrito ({totalItems})</h3>
          <button className="cart-drawer__close" onClick={() => setCartOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="cart-drawer__items">
              {items.map(item => (
                <div key={`${item.productId}_${item.size}`} className="cart-drawer__item">
                  <div className="cart-drawer__item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-drawer__item-info">
                    <h4 className="cart-drawer__item-name">{item.name}</h4>
                    <p className="cart-drawer__item-size">Talle: {item.size}</p>
                    <p className="cart-drawer__item-price">{formatPrice(item.price)}</p>
                    <div className="cart-drawer__item-qty">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-drawer__item-remove" onClick={() => removeItem(item.productId, item.size)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__totals">
              <div className="cart-drawer__total-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-drawer__total-row">
                <span>Envío</span>
                <span>{shippingCost === 0 ? <em className="cart-drawer__free">GRATIS</em> : formatPrice(shippingCost)}</span>
              </div>
              <div className="cart-drawer__total-row cart-drawer__total-row--total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            {!isLoggedIn ? (
              <button className="cart-drawer__checkout-btn" onClick={() => { setCartOpen(false); setAuthOpen(true) }}>
                INICIAR SESIÓN PARA COMPRAR
              </button>
            ) : (
              <button className="cart-drawer__checkout-btn" onClick={() => { setCartOpen(false); navigate('/checkout') }}>
                FINALIZAR COMPRA
              </button>
            )}
          </div>
        )}
      </div>
      <div className={`cart-drawer__overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

// ─── HOME PAGE ─────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [revealed, setRevealed] = useState([])

  const [slides, setSlides] = useState([
    { tag: 'NUEVA COLECCIÓN', title: 'OTOÑO / INVIERNO 2026', cta: 'VER COLECCIÓN', image: '' },
    { tag: 'EDICIÓN LIMITADA', title: 'COLECCIÓN CÁPSULA', cta: 'EXPLORAR', image: '' },
    { tag: 'SALE', title: 'HASTA 50% OFF', cta: 'COMPRAR AHORA', image: '' },
  ])
  const [saleBanner, setSaleBanner] = useState({ label: 'TEARZ 1874!', title: 'SALE', subtitle: 'Prendas en liquidación con descuentos increíbles', cta: 'VER SALE', image: '' })
  const [lookbook, setLookbook] = useState({ tag: 'LOOKBOOK', title: 'OTOÑO / INVIERNO 2026', cta: 'VER LOOKBOOK', image: '' })
  const [journalPosts, setJournalPosts] = useState([])
  const [philosophyQuote, setPhilosophyQuote] = useState('"ESTILO, ACTITUD Y ESENCIA"')
  const [newArrivalsTitle, setNewArrivalsTitle] = useState('NUEVOS INGRESOS')
  const [allProductsTitle, setAllProductsTitle] = useState('TODOS LOS PRODUCTOS')
  const [editorialTitle, setEditorialTitle] = useState('[ TEARZ JOURNAL ]')
  const [editorialSubtitle, setEditorialSubtitle] = useState('Inspiración, cultura y estilo por el equipo de Tearz 1874!')

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  useEffect(() => {
    siteContentApi.getAll()
      .then(res => {
        const content = res.data?.content;
        if (content) {
          if (content.hero_slides) setSlides(content.hero_slides);
          if (content.sale_banner) setSaleBanner(content.sale_banner);
          if (content.lookbook) setLookbook(content.lookbook);
          if (content.philosophy_quote) setPhilosophyQuote(content.philosophy_quote);
          if (content.new_arrivals_title) setNewArrivalsTitle(content.new_arrivals_title);
          if (content.all_products_title) setAllProductsTitle(content.all_products_title);
          if (content.editorial_title) setEditorialTitle(content.editorial_title);
          if (content.editorial_subtitle) setEditorialSubtitle(content.editorial_subtitle);
        }
      })
      .catch(err => console.error('Error fetching site content:', err));

    journalApi.listPublished()
      .then(res => setJournalPosts(res.data.posts || []))
      .catch(err => console.error('Error fetching journals:', err));
  }, []);

  useEffect(() => {
    productsApi.list({ limit: 50 })
      .then(res => {
        const all = res.data.products
        setNewArrivals(all.filter(p => p.badge === 'NUEVO').slice(0, 4))
        setProducts(all.filter(p => p.badge !== 'NUEVO'))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.id;
          setRevealed(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
          });
        }
      });
    }, { threshold: 0.05, rootMargin: '50px' });

    const setupObserver = () => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach(el => observer.observe(el));
    };

    // Run after a short delay to ensure DOM update
    const timer = setTimeout(setupObserver, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [products, newArrivals, loading]);

  const scrollToPhilosophy = () => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })

  const displayPrice = (p) => `$${parseFloat(p).toLocaleString('es-AR')}`

  const ProductCard = ({ product, index, prefix = '' }) => (
    <article className={`product-card reveal ${revealed.includes(`${prefix}${index}`) ? 'visible' : ''}`} data-id={`${prefix}${index}`} style={{ transitionDelay: `${index * 0.08}s` }}>
      <Link to={`/producto/${product.id}`} className="product-card__link">
        <div className="product-card__image">
          <img src={product.images?.[0] || product.image} alt={product.name} className="product-card__img" />
          {product.badge && <span className="product-card__badge">{product.badge}</span>}
        </div>
        <div className="product-card__info">
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__price-wrapper">
            {product.oldPrice && <span className="product-card__price product-card__price--old">{displayPrice(product.oldPrice)}</span>}
            <p className="product-card__price">{displayPrice(product.price)}</p>
          </div>
          <div className="product-card__colors">
            {product.colors?.map((color, i) => (
              <span key={i} className="product-card__color" style={{ background: color, border: color === '#ffffff' || color === '#f5f5f5' ? '1px solid #ddd' : 'none' }} title="Color" />
            ))}
          </div>
        </div>
      </Link>
    </article>
  )

  return (
    <>
      {/* Hero Slider */}
      <section className="hero">
        <div className="hero__slider">
          {slides.map((slide, index) => (
            <div key={index} className={`hero__slide ${currentSlide === index ? 'hero__slide--active' : ''}`}>
              {slide.image ? (
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="hero__slide-bg" 
                />
              ) : (
                <div className="hero__slide-bg hero__slide-placeholder">
                  <div className="hero__placeholder-content">
                    <span className="hero__placeholder-label">HERO BANNER {index + 1}</span>
                    <span className="hero__placeholder-size">3:2 o 16:9 recomendado</span>
                  </div>
                </div>
              )}
              <div className="hero__slide-content">
                <span className="hero__slide-tag">{slide.tag}</span>
                <h2 className="hero__slide-title">{slide.title}</h2>
                <Link to="/productos" className="hero__slide-cta">{slide.cta}</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="hero__dots">
          {slides.map((_, index) => (
            <button key={index} className={`hero__dot ${currentSlide === index ? 'hero__dot--active' : ''}`} onClick={() => setCurrentSlide(index)} aria-label={`Slide ${index + 1}`} />
          ))}
        </div>
        <button className="hero__scroll-down" onClick={scrollToPhilosophy} aria-label="Desplazar hacia abajo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </section>

      {/* Philosophy */}
      <section className="philosophy" id="philosophy">
        <p className="philosophy__quote">{philosophyQuote}</p>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="products-section" id="new-arrivals">
          <div className="products-section__header">
            <div className="products-section__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <h2 className="products-section__title">{newArrivalsTitle}</h2>
          </div>
          <div className="products-grid">
            {newArrivals.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
          </div>
          <div className="products-section__cta">
            <Link to="/productos" className="btn btn--primary">VER TODO</Link>
          </div>
        </section>
      )}

      {/* All Products */}
      {products.length > 0 && (
        <section className="products-section products-section--alt" id="all-products">
          <div className="products-section__header">
            <h2 className="products-section__title">{allProductsTitle}</h2>
          </div>
          <div className="products-grid">
            {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} prefix="a-" />)}
          </div>
          <div className="products-section__cta">
            <Link to="/productos" className="btn btn--primary">VER TODOS LOS PRODUCTOS</Link>
          </div>
        </section>
      )}

      {/* Lookbook */}
      <section className="lookbook" id="lookbook">
        <div className="lookbook__image">
          {lookbook.image ? (
            <img src={lookbook.image} alt={lookbook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="lookbook__placeholder">
              <div className="lookbook__placeholder-content">
                <span className="lookbook__placeholder-label">LOOKBOOK / VISUAL</span>
                <span className="lookbook__placeholder-size">1920 × 900</span>
              </div>
            </div>
          )}
        </div>
        <div className="lookbook__overlay">
          <span className="lookbook__tag">{lookbook.tag}</span>
          <h2 className="lookbook__title">{lookbook.title}</h2>
          <Link to="/productos" className="lookbook__cta">{lookbook.cta}</Link>
        </div>
      </section>

      {/* Sale Banner */}
      <section className="feature-banner" id="feature-sale">
        <div className="feature-banner__text">
          <span className="feature-banner__label">{saleBanner.label}</span>
          <h2 className="feature-banner__title">{saleBanner.title}</h2>
          <p className="feature-banner__subtitle">{saleBanner.subtitle}</p>
          <Link to="/productos?sort=price_asc" className="feature-banner__cta">{saleBanner.cta || 'VER SALE'}</Link>
        </div>
        <div className="feature-banner__image">
          {saleBanner.image ? (
            <img src={saleBanner.image} alt={saleBanner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="feature-banner__placeholder">
              <div className="feature-banner__placeholder-content">
                <span>SALE BANNER</span>
                <span>960 × 640</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Editorial / Journal */}
      {journalPosts.length > 0 && (
        <section className="editorial" id="editorial">
          <div className="editorial__header"><h2 className="editorial__title">{editorialTitle}</h2><p className="editorial__subtitle">{editorialSubtitle}</p></div>
          <div className="editorial__grid">
            {journalPosts.slice(0, 3).map((post, index) => (
              <article key={post.id} className={`editorial__card reveal ${revealed.includes(`e-${index}`) ? 'visible' : ''}`} data-id={`e-${index}`} style={{ transitionDelay: `${index * 0.1}s` }}>
                <Link to={`/journal/${post.slug}`} className="editorial__card-link">
                  <div className="editorial__card-image">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="editorial__card-placeholder"><span>480 × 320</span></div>
                    )}
                  </div>
                  <div className="editorial__card-content"><h3 className="editorial__card-title">{post.title}</h3><p className="editorial__card-excerpt">{post.excerpt}</p><span className="editorial__card-readmore">Leer más</span></div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

// ─── PRODUCTS PAGE ─────────────────────────────────────
function ProductsPage() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState([])
  const params = Object.fromEntries(new URLSearchParams(location.search))

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    productsApi.list({ limit: 50, ...params })
      .then(res => { setProducts(res.data.products); setLoading(false) })
      .catch(() => setLoading(false))
  }, [location.search])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) setRevealed(prev => [...prev, entry.target.dataset.id]) })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [products])

  const displayPrice = (p) => `$${parseFloat(p).toLocaleString('es-AR')}`

  const categoryTitle = params.category ? params.category.charAt(0).toUpperCase() + params.category.slice(1) : params.search ? `Resultados: "${params.search}"` : 'Todos los productos'

  return (
    <section className="products-section" style={{ minHeight: '60vh' }}>
      <div className="products-section__header">
        <h2 className="products-section__title">{categoryTitle.toUpperCase()}</h2>
      </div>
      {loading ? (
        <div className="product-detail__loading"><div className="product-detail__spinner" /></div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <p>No se encontraron productos</p>
          <Link to="/productos" className="btn btn--primary" style={{ marginTop: '24px' }}>VER TODOS</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product, index) => (
            <article key={product.id} className={`product-card reveal ${revealed.includes(`p-${index}`) ? 'visible' : ''}`} data-id={`p-${index}`} style={{ transitionDelay: `${index * 0.06}s` }}>
              <Link to={`/producto/${product.id}`} className="product-card__link">
                <div className="product-card__image">
                  <img src={product.images?.[0] || product.image} alt={product.name} className="product-card__img" />
                  {product.badge && <span className="product-card__badge">{product.badge}</span>}
                </div>
                <div className="product-card__info">
                  <h3 className="product-card__name">{product.name}</h3>
                  <div className="product-card__price-wrapper">
                    {product.oldPrice && <span className="product-card__price product-card__price--old">{displayPrice(product.oldPrice)}</span>}
                    <p className="product-card__price">{displayPrice(product.price)}</p>
                  </div>
                  <div className="product-card__colors">
                    {product.colors?.map((color, i) => (
                      <span key={i} className="product-card__color" style={{ background: color, border: color === '#ffffff' || color === '#f5f5f5' ? '1px solid #ddd' : 'none' }} />
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── APP ROOT ──────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin Panel */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/landing" element={<AdminLanding />} />
            <Route path="/admin/journals" element={<AdminJournals />} />
            {/* Storefront */}
            <Route path="/*" element={<Layout />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App