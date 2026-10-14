import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ThemeCard.css'
import './ThemeCardBadge.css'
import './ThemeCardTitleAlignment.css'

export default function ThemeCard({ theme, index = 0 }) {
  const id = theme?.id || index + 1
  const title = theme?.title || ''
  const slug = theme?.slug || ''
  const artworkCount = Number(theme?.artworkCount || 0)

  return (
    <Link to={'/chu-de/' + slug} className="theme-card theme-card-reference shared-theme-card">
      <div className="theme-card-media">
        {theme?.image
          ? <img src={theme.image} alt={title} loading="lazy" decoding="async" />
          : <div className="theme-card-placeholder" />}
        <span className="theme-card-glow" />
        <span className="theme-card-count-badge">{artworkCount} tác phẩm</span>
      </div>

      <div className="theme-card-body">
        <div className="theme-card-number">
          <b>{String(id).padStart(2, '0')}</b>
          <i />
        </div>

        <div className="theme-card-copy">
          <h3>{title}</h3>
          <p>{theme?.description || ''}</p>
        </div>

        <span className="theme-card-arrow" aria-hidden="true"><ArrowRight /></span>
      </div>
    </Link>
  )
}
