import { Images, Map, Users, Building2, HeartHandshake, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HelloPage(){
 const actions=[['Xem TOP52','52 góc nhìn tiêu biểu','/top52',Images],['Khám phá HOLA Map','Địa điểm và câu chuyện','/hola-map',Map],['CHECK IN HOALAC','Tham gia cộng đồng mở','#',Users],['Tham gia WE HOLA','Cùng làm điều tốt cho Hòa Lạc','/we-hola',HeartHandshake],['Kiến trúc Hòa Lạc','Khám phá chuyên môn kiến trúc','#',Building2]]
 return <main className="hello-page"><div className="hello-card"><span className="brand big-brand">HAL<span>O</span> HOLA</span><span className="eyebrow">SCAN TO SAY HELLO</span><h1>HELLO<br/><em>HÒA LẠC</em></h1><p>Bạn muốn làm gì hôm nay?</p><div className="hello-actions">{actions.map(([t,d,h,I])=><Link to={h} key={t}><I/><div><b>{t}</b><small>{d}</small></div><ArrowRight/></Link>)}</div><small>52 góc nhìn · 1 Hòa Lạc</small></div></main>
}
