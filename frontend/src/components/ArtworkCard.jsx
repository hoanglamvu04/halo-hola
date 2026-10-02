import { Eye, MapPin, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ArtworkCard({ item, featured = false }) {
  return <Link to={`/tac-pham/${item.slug}`} className={`art-card ${featured ? 'featured' : ''}`}>
    <div className="art-image"><img src={item.image} alt={item.title}/><span className="top52-badge">TOP52</span><button className="heart"><Heart size={16}/></button></div>
    <div className="art-body"><h3>{item.title}</h3><p>{item.author}</p><div className="art-meta"><span><Eye size={14}/>{item.views}</span><span><MapPin size={14}/>{item.location}</span></div></div>
  </Link>
}
