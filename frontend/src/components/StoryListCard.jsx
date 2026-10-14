import { Link } from 'react-router-dom'
import { Clock3, Heart, MapPin } from 'lucide-react'

export default function StoryListCard({story,index=0}){
  const image=story?.image||story?.cover
  return <Link className="story-card-ref" to={'/stories/'+story.slug}>
    <div className="story-card-media">
      {image?<img src={image} alt={story.title}/>:<div className="theme-card-placeholder"/>}
      <span className="story-card-heart"><Heart/></span>
      <span className="story-card-index">{String(index).padStart(2,'0')}</span>
    </div>
    <div className="story-card-copy">
      <span className="story-card-category">{story.category}</span>
      <h3>{story.title}</h3>
      <p>{story.excerpt}</p>
      <div className="story-card-author">
        <span>{story.author?.charAt(0)}</span>
        <div><b>{story.author}</b><small>{story.role}</small></div>
      </div>
      <div className="story-card-bottom">
        <span><MapPin/> {story.location}</span>
        <span><Clock3/> {story.readTime}</span>
      </div>
    </div>
  </Link>
}
