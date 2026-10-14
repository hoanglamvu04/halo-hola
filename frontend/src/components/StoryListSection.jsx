import StoryListCard from './StoryListCard.jsx'

export default function StoryListSection({
  stories=[],
  kicker='NHỮNG CÂU CHUYỆN KHÁC',
  title='Khám phá Hòa Lạc qua nhiều lớp góc nhìn',
  description='Mỗi câu chuyện là một lát cắt: văn hóa, thiên nhiên, kiến trúc, con người, tuổi trẻ và những chuyển động mới.',
  startIndex=2,
  className=''
}){
  if(!stories.length)return null
  return <section className={`stories-list-ref ${className}`.trim()}>
    <div className="stories-list-inner">
      <header className="stories-list-head">
        <div>
          <div className="stories-kicker"><span>{kicker}</span><i/></div>
          <h2>{title}</h2>
        </div>
        {description&&<p>{description}</p>}
      </header>
      <div className="stories-grid-ref">
        {stories.map((story,index)=><StoryListCard story={story} index={startIndex+index} key={story.slug}/>)}
      </div>
    </div>
  </section>
}
