import { Eye, MapPin, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const previewStatusLabel={
  PENDING:'CHỜ DUYỆT',
  VALID:'HỢP LỆ',
  SHORTLIST:'SHORTLIST',
  TOP52:'TOP52',
  AWARDED:'ĐẠT GIẢI'
}

export default function ArtworkCard({ item, featured = false }) {
  const href=item.preview?`/tac-pham/xem-truoc/${item.id}`:`/tac-pham/${item.slug}`
  const badge=item.preview
    ? `${item.isDemo?'MẪU · ':''}${previewStatusLabel[item.status]||item.status}`
    : (item.status==='AWARDED'?'ĐẠT GIẢI':'TOP52')

  return <Link to={href} className={`art-card ${featured ? 'featured' : ''}`}>
    <div className="art-image">{item.image?<img src={item.image} alt={item.title||item.code}/>:<div className="theme-card-placeholder"/>}<span className="top52-badge">{badge}</span><button className="heart" type="button" tabIndex={-1}><Heart size={16}/></button></div>
    <div className="art-body"><h3>{item.title||item.code}</h3><p>{item.author}</p><div className="art-meta"><span><Eye size={14}/>{Number(item.juryScore||0).toFixed(1)} điểm BGK</span><span><MapPin size={14}/>{item.location}</span></div></div>
  </Link>
}
