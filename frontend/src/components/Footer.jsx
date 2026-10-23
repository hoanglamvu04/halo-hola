import { ArrowRight, ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

const footerLinks=[
  ['Chủ đề','/chu-de'],
  ['Stories','/stories'],
  ['HOLA Map','/hola-map'],
  ['HOLA Tour','/hola-tour'],
  ['HOLA DAY','/hola-day'],
  ['WE HOLA','/we-hola']
]

const ecosystemLinks=[
  ['XSPACE','https://www.xspace.vn/'],
  ['Kiến Trúc Hòa Lạc','https://www.kientruchoalac.com/'],
  ['Bản đồ Hòa Lạc','https://maps.dothihoalac.vn/'],
  ['Đô thị Hòa Lạc','https://www.dothihoalac.vn/']
]

export default function Footer() {
  const [settings,setSettings]=useState({})
  useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[])
  const brand=settings.brand||{}
  const footer=settings.footer||{}
  const email=footer.email||'admin@xspace.vn'
  const address=footer.address||'Hòa Lạc, Hà Nội'

  return <footer className="site-footer site-footer-v3">
    <div className="container footer-shell footer-shell-v3">
      <div className="footer-primary">
        <section className="footer-brand-column">
          <Link to="/" className={'footer-logo-card '+(brand.logo?'has-image':'')} aria-label="Về trang chủ HALO HOLA">
            {brand.logo
              ? <img src={brand.logo} alt={brand.siteName||'HALO HOLA'}/>
              : <span className="footer-wordmark">HAL<span>O</span> HOLA</span>}
          </Link>
          <p className="footer-brand-copy">{footer.description||brand.tagline||'Nơi những câu chuyện, góc nhìn và trải nghiệm về Hòa Lạc được ghi lại và kể tiếp.'}</p>
        </section>

        <section className="footer-contact-compact">
          <div>
            <MapPin/>
            <span><small>Hòa Lạc</small><b>{address}</b></span>
          </div>
          <a href={'mailto:'+email}>
            <Mail/>
            <span><small>Liên hệ</small><b>{email}</b></span>
          </a>
        </section>

        <section className="footer-cta-column">
          <span className="footer-cta-kicker">Cùng kể về Hòa Lạc</span>
          <Link to="/gui-goc-nhin" className="footer-submit-cta">
            <span>Gửi một góc nhìn</span><ArrowRight/>
          </Link>
        </section>
      </div>

      <nav className="footer-nav-row" aria-label="Điều hướng cuối trang">
        {footerLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
      </nav>

      <section className="footer-ecosystem">
        <div className="footer-ecosystem-title">
          <span>CÙNG HỆ SINH THÁI</span>
          <p>Khám phá thêm các nền tảng về Hòa Lạc và XSPACE.</p>
        </div>
        <div className="footer-ecosystem-links">
          {ecosystemLinks.map(([label,href])=>
            <a key={href} href={href} target="_blank" rel="noreferrer">
              <span>{label}</span><ArrowUpRight/>
            </a>
          )}
        </div>
      </section>

      <div className="footer-bottom">
        <span>© 2026 {brand.siteName||'HALO HOLA'}</span>
        <span>Khám phá · Ghi lại · Kết nối · Kể tiếp</span>
        <span>52 góc nhìn · 1 Hòa Lạc</span>
      </div>
    </div>
  </footer>
}
