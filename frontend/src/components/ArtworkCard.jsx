import { Eye, MapPin, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ArtworkCard({ item, featured = false }) {
  return <Link to={`/tac-pham/${item.slug}`} className={`art-card ${featured ? 'featured' : ''}`}>
    <div className="art-image">{item.image?<img src={item.image} alt={item.title||item.code}/>:<div className="theme-card-placeholder"/>}<span className="top52-badge">{item.status==='AWARDED'?'ĐẠT GIẢI':'TOP52'}</span><button className="heart" type="button" tabIndex={-1}><Heart size={16}/></button></div>
    <div className="art-body"><h3>{item.title||item.code}</h3><p>{item.author}</p><div className="art-meta"><span><Eye size={14}/>{Number(item.juryScore||0).toFixed(1)} điểm BGK</span><span><MapPin size={14}/>{item.location}</span></div></div>
  </Link>
}
