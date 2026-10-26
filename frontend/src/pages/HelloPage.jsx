import { ArrowRight, Building2, HeartHandshake, Images, Map, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions=[
  {title:'Xem TOP52',detail:'52 góc nhìn được chọn',href:'/top52',Icon:Images},
  {title:'Khám phá HOLA Map',detail:'Địa điểm và câu chuyện',href:'/hola-map',Icon:Map},
  {title:'Gửi một góc nhìn',detail:'Ảnh · video · story · art',href:'/gui-goc-nhin',Icon:Send},
  {title:'Tham gia WE HOLA',detail:'Cùng làm điều tốt cho Hòa Lạc',href:'/we-hola',Icon:HeartHandshake},
  {title:'Kiến trúc Hòa Lạc',detail:'Khám phá hệ sinh thái chuyên môn',href:'https://www.kientruchoalac.com/',Icon:Building2,external:true}
]

export default function HelloPage(){
  return <main className="hello-page">
    <div className="hello-card">
      <span className="brand big-brand">HAL<span>O</span> HOLA</span>
      <span className="eyebrow">HELLO HÒA LẠC</span>
      <h1>Bạn muốn<br/><em>khám phá gì hôm nay?</em></h1>
      <p>Chọn một lối vào nhanh để xem, đóng góp hoặc kết nối với những câu chuyện đang diễn ra ở Hòa Lạc.</p>
      <div className="hello-actions">
        {actions.map(({title,detail,href,Icon,external})=>external
          ? <a href={href} target="_blank" rel="noreferrer" key={title}><Icon/><div><b>{title}</b><small>{detail}</small></div><ArrowRight/></a>
          : <Link to={href} key={title}><Icon/><div><b>{title}</b><small>{detail}</small></div><ArrowRight/></Link>
        )}
      </div>
      <small>Khám phá · Ghi lại · Kết nối · Kể tiếp</small>
    </div>
  </main>
}
