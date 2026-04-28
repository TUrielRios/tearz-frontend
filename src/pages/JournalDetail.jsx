import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { journalApi } from '../services/api'

export default function JournalDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    journalApi.getBySlug(slug)
      .then(res => setPost(res.data.post))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="journal-detail">
        <div className="journal-detail__loading">
          <div className="product-detail__spinner" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="journal-detail">
        <div className="journal-detail__error">
          <h2>Publicación no encontrada</h2>
          <p>La publicación que buscás no existe o fue eliminada.</p>
          <Link to="/" className="btn btn--primary" style={{ marginTop: '24px', display: 'inline-block' }}>Volver al Inicio</Link>
        </div>
      </div>
    )
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className="journal-detail">
      {post.coverImage && (
        <div className="journal-detail__hero">
          <img src={post.coverImage} alt={post.title} className="journal-detail__hero-img" />
          <div className="journal-detail__hero-overlay" />
        </div>
      )}

      <div className="journal-detail__container">
        <div className="journal-detail__breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span>Journal</span>
        </div>

        <header className="journal-detail__header">
          <span className="journal-detail__tag">TEARZ JOURNAL</span>
          <h1 className="journal-detail__title">{post.title}</h1>
          {post.publishedAt && (
            <time className="journal-detail__date">{fmtDate(post.publishedAt)}</time>
          )}
        </header>

        {post.excerpt && (
          <p className="journal-detail__excerpt">{post.excerpt}</p>
        )}

        <div className="journal-detail__body">
          {post.body.split('\n').map((paragraph, i) => {
            if (!paragraph.trim()) return <br key={i} />
            return <p key={i}>{paragraph}</p>
          })}
        </div>

        <div className="journal-detail__footer">
          <Link to="/" className="journal-detail__back">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver al Inicio
          </Link>
        </div>
      </div>
    </article>
  )
}
