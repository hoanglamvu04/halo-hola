import { Eye, MapPin, Heart, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const previewStatusLabel={
  PENDING:'ĐÃ NHẬN',
  VALID:'ĐÃ XÁC MINH',
  SHORTLIST:'ĐANG BIÊN TẬP',
  TOP52:'TRONG 52 GÓC NHÌN',
  AWARDED:'ĐÃ GHI NHẬN'
}

const publicStatusLabel={
  VALID:'GÓC NHÌN HÒA LẠC',
  SHORTLIST:'GÓC NHÌN NỔI BẬT',
  TOP52:'52 GÓC NHÌN · 2026',
  AWARDED:'ĐƯỢC GHI NHẬN'
}

export default function ArtworkCard({ item, featured = false }) {
  const href=item.preview?`/tac-pham/xem-truoc/${item.id}`:`/tac-pham/${item.slug}`
  const badge=item.badgeLabel||(item.preview
    ? `${item.isDemo?'MẪU · ':''}${previewStatusLabel[item.status]||item.status}`
    : (publicStatusLabel[item.status]||'GÓC NHÌN HÒA LẠC'))
  const hasOutreach=item.preview&&Number.isFinite(Number(item.outreachScore))&&Number(item.outreachScore)>0

  return <Link to={href} className={`art-card ${featured ? 'featured' : ''}`}>
    <div className="art-image">{item.image?<img src={item.image} alt={item.title||item.code} loading="lazy" decoding="async"/>:<div className="theme-card-placeholder"/>}<span className="top52-badge">{badge}</span><span className="heart" aria-hidden="true"><Heart size={16}/></span></div>
    <div className="art-body"><h3>{item.title||item.code}</h3><p>{item.author||'HALO HOLA Editorial'}</p><div className="art-meta">{hasOutreach?<span><Share2 size={14}/>{Number(item.outreachScore)} điểm lan tỏa</span>:<span><Eye size={14}/>{item.type||'Góc nhìn'}</span>}<span><MapPin size={14}/>{item.location||'Hòa Lạc'}</span></div></div>
  </Link>
}
