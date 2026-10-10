import { Eye, MapPin, Heart, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const previewStatusLabel={
  PENDING:'CHỜ DUYỆT',
  VALID:'HỢP LỆ',
  SHORTLIST:'SHORTLIST',
  TOP52:'TOP52',
  AWARDED:'ĐẠT GIẢI'
}

const publicStatusLabel={
  VALID:'GÓC NHÌN CỘNG ĐỒNG',
  SHORTLIST:'SHORTLIST',
  TOP52:'TOP52',
  AWARDED:'ĐẠT GIẢI'
}

export default function ArtworkCard({ item, featured = false }) {
  const href=item.preview?`/tac-pham/xem-truoc/${item.id}`:`/tac-pham/${item.slug}`
  const badge=item.badgeLabel||(item.preview
    ? `${item.isDemo?'MẪU · ':''}${previewStatusLabel[item.status]||item.status}`
    : (publicStatusLabel[item.status]||'GÓC NHÌN CỘNG ĐỒNG'))
  const hasOutreach=Number.isFinite(Number(item.outreachScore))&&Number(item.outreachScore)>0

  return <Link to={href} className={`art-card ${featured ? 'featured' : ''}`}>
    <div className="art-image">{item.image?<img src={item.image} alt={item.title||item.code} loading="lazy" decoding="async"/>:<div className="theme-card-placeholder"/>}<span className="top52-badge">{badge}</span><span className="heart" aria-hidden="true"><Heart size={16}/></span></div>
    <div className="art-body"><h3>{item.title||item.code}</h3><p>{item.author}</p><div className="art-meta">{hasOutreach?<span><Share2 size={14}/>{Number(item.outreachScore)} điểm lan tỏa</span>:<span><Eye size={14}/>{Number(item.juryScore||0).toFixed(1)} điểm BGK</span>}<span><MapPin size={14}/>{item.location}</span></div></div>
  </Link>
}
