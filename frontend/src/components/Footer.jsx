import {
  ArrowRight, ArrowUpRight, Building2, Eye, Facebook, House,
  Instagram, Layers3, Mail, MapPin, Music2, Youtube
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

const exploreLinks=[
  ['Chủ đề','/chu-de'],
  ['Stories','/stories'],
  ['HOLA Map','/hola-map'],
  ['HOLA Tour','/hola-tour'],
  ['HOLA DAY','/hola-day'],
  ['WE HOLA','/we-hola']
]

const ecosystemLinks=[
  {label:'XSPACE',href:'https://www.xspace.vn/',icon:Layers3},
  {label:'Kiến Trúc Hòa Lạc',href:'https://www.kientruchoalac.com/',icon:House},
  {label:'Bản đồ Hòa Lạc',href:'https://maps.dothihoalac.vn/',icon:MapPin},
  {label:'Đô thị Hòa Lạc',href:'https://www.dothihoalac.vn/',icon:Building2}
]

function SocialLink({href,label,children}){
  if(!href||href==='#') return null
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>{children}</a>
}

export default function Footer() {
  const [settings,setSettings]=useState({})
  useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[])
  const brand=settings.brand||{}
  const footer=settings.footer||{}
  const email=footer.email||'admin@xspace.vn'
  const address=footer.address||'Hòa Lạc, Hà Nội'

  return <footer className="site-footer site-footer-v3">
    <div className="footer-landscape" aria-hidden="true"/>

    <div className="container footer-shell footer-shell-v3">
      <div className="footer-main-grid">
        <section className="footer-brand-column">
          <Link to="/" className={'footer-logo-card '+(brand.logo?'has-image':'')} aria-label="Về trang chủ HALO HOLA">
            {brand.logo
              ? <img src={brand.logo} alt={brand.siteName||'HALO HOLA'}/>
              : <span className="footer-wordmark">HAL<span>O</span> HOLA</span>}
          </Link>
          <p className="footer-brand-copy">{footer.description||brand.tagline||'Nơi cộng đồng cùng khám phá, ghi lại, đóng góp và kể tiếp những câu chuyện về Hòa Lạc.'}</p>

          <div className="footer-brand-contact">
            <span><MapPin/><b>Hòa Lạc</b><em>{address}</em></span>
            <a href={'mailto:'+email}><Mail/><b>Email</b><em>{email}</em></a>
          </div>

          <div className="footer-socials" aria-label="Mạng xã hội HALO HOLA">
            <SocialLink href={footer.facebook} label="Facebook"><Facebook/></SocialLink>
            <SocialLink href={footer.tiktok} label="TikTok"><Music2/></SocialLink>
            <SocialLink href={footer.youtube} label="YouTube"><Youtube/></SocialLink>
            <SocialLink href={footer.instagram} label="Instagram"><Instagram/></SocialLink>
          </div>
        </section>

        <nav className="footer-explore-column" aria-label="Khám phá">
          <h4>Khám phá</h4>
          <i className="footer-heading-line"/>
          <div className="footer-explore-links">
            {exploreLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
          </div>
        </nav>

        <section className="footer-ecosystem-column">
          <h4>Cùng hệ sinh thái</h4>
          <i className="footer-heading-line"/>
          <p>Khám phá thêm các nền tảng về Hòa Lạc và XSPACE.</p>
          <div className="footer-ecosystem-cards">
            {ecosystemLinks.map(({label,href,icon:Icon})=>
              <a key={href} href={href} target="_blank" rel="noreferrer">
                <Icon/>
                <span>{label}</span>
                <ArrowUpRight/>
              </a>
            )}
          </div>
        </section>

      </div>

      <section className="footer-story-band">
        <div className="footer-story-copy">
          <span className="footer-story-kicker">Cùng kể về Hòa Lạc</span>
          <p>Bạn có câu chuyện, hình ảnh hay góc nhìn thú vị về Hòa Lạc?</p>
        </div>
        <Link to="/gui-goc-nhin" className="footer-submit-cta">
          <span>Gửi một góc nhìn</span>
          <span className="footer-submit-icon"><ArrowRight/></span>
        </Link>
      </section>

      <div className="footer-bottom">
        <span>© 2026 {brand.siteName||'HELLO HÒA LẠC'}. All rights reserved.</span>
        <span className="footer-bottom-manifesto">Khám phá · Ghi lại · Kết nối · Kể tiếp</span>
        <span className="footer-bottom-note"><Eye/>52 góc nhìn · 1 Hòa Lạc</span>
      </div>
    </div>
  </footer>
}
