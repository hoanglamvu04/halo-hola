import { Images, Map, Users, CalendarDays, HeartHandshake, ArrowRight, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HelloPage(){
 const actions=[
  ['52 góc nhìn 2026','Những câu chuyện đại diện cho Hòa Lạc năm 2026','/top52',Images],
  ['Khám phá HOLA Map','Địa điểm và câu chuyện','/hola-map',Map],
  ['Gửi một góc nhìn','Giới thiệu người, nơi hoặc câu chuyện đáng được kể','/gui-goc-nhin',Compass],
  ['Calendar 2027','52 tuần · 52 câu chuyện Hòa Lạc','/calendar-2027',CalendarDays],
  ['Tham gia WE HOLA','HALO HOLA kể · WE HOLA làm','/we-hola',HeartHandshake],
  ['CHECK IN HOALAC','Cộng đồng mở cùng chia sẻ Hòa Lạc','#',Users]
 ]
 return <main className="hello-page"><div className="hello-card"><span className="brand big-brand">HAL<span>O</span> HOLA</span><span className="eyebrow">SCAN TO SAY HELLO</span><h1>HELLO<br/><em>HÒA LẠC</em></h1><p>Bạn muốn khám phá Hòa Lạc theo cách nào?</p><div className="hello-actions">{actions.map(([t,d,h,I])=><Link to={h} key={t}><I/><div><b>{t}</b><small>{d}</small></div><ArrowRight/></Link>)}</div><small>52 góc nhìn · 1 Hòa Lạc</small></div></main>
}
