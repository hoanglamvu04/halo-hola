import { Facebook, Instagram, Youtube, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

export default function Footer() {
  const [settings,setSettings]=useState({})
  useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[])
  const brand=settings.brand||{}
  const footer=settings.footer||{}
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Link to="/" className="brand footer-brand">{brand.siteName||<>HAL<span>O</span> HOLA</>}</Link><p>{footer.description||brand.tagline||'Nơi những câu chuyện Hòa Lạc được kể lại.'}</p></div>
      <div><h4>Khám phá</h4><Link to="/chu-de/net-doai">Chủ đề</Link><Link to="/top52">TOP52</Link><Link to="/stories">Stories</Link></div>
      <div><h4>Trải nghiệm</h4><Link to="/hola-tour">HOLA Tour</Link><Link to="/hola-map">HOLA Map</Link><Link to="/gui-goc-nhin">Gửi góc nhìn</Link><Link to="/tra-cuu">Tra cứu tác phẩm</Link></div>
      <div><h4>Cộng đồng</h4><Link to="/we-hola">WE HOLA</Link><Link to="/dong-hanh">Đồng hành</Link><Link to="/hola-day">HOLA DAY</Link></div>
      <div><h4>Kết nối</h4><div className="socials">
        <a href={footer.facebook||'#'}><Facebook/></a>
        <a href={footer.instagram||'#'}><Instagram/></a>
        <a href={footer.youtube||'#'}><Youtube/></a>
        <a href={footer.tiktok||'#'}><Music2/></a>
      </div>
      {footer.email&&<a className="footer-contact-link" href={'mailto:'+footer.email}>{footer.email}</a>}
      {footer.phone&&<a className="footer-contact-link" href={'tel:'+footer.phone}>{footer.phone}</a>}
      <small>© 2026 {brand.siteName||'HALO HOLA'}.</small></div>
    </div>
  </footer>
}
