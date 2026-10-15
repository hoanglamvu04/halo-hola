import { ArrowRight, Facebook, Instagram, Mail, Music2, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

const exploreLinks=[
  ['Chủ đề','/chu-de'],
  ['TOP52','/top52'],
  ['Stories','/stories'],
  ['HOLA Tour','/hola-tour'],
  ['HOLA Map','/hola-map'],
  ['WE HOLA','/we-hola']
]

const participateLinks=[
  ['Thể lệ & Giải thưởng','/the-le-giai-thuong'],
  ['Tra cứu tác phẩm','/tra-cuu'],
  ['Đồng hành','/dong-hanh'],
  ['HOLA DAY','/hola-day']
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

  return <footer className="site-footer site-footer-v2">
    <div className="container footer-shell footer-shell-v2">
      <div className="footer-brand-column">
        <Link to="/" className={'footer-logo-card '+(brand.logo?'has-image':'')} aria-label="Về trang chủ HALO HOLA">
          {brand.logo
            ? <img src={brand.logo} alt={brand.siteName||'HALO HOLA'}/>
            : <span className="footer-wordmark">HAL<span>O</span> HOLA</span>}
        </Link>

        <p className="footer-brand-copy">{footer.description||brand.tagline||'Nơi những câu chuyện về Hòa Lạc được khám phá, ghi lại và kể tiếp.'}</p>
        {footer.address&&<div className="footer-address">{footer.address}</div>}

        <a className="footer-email" href={'mailto:'+email}><Mail size={16}/><span>{email}</span></a>

        <div className="socials footer-socials">
          <SocialLink href={footer.facebook} label="Facebook"><Facebook/></SocialLink>
          <SocialLink href={footer.instagram} label="Instagram"><Instagram/></SocialLink>
          <SocialLink href={footer.youtube} label="YouTube"><Youtube/></SocialLink>
          <SocialLink href={footer.tiktok} label="TikTok"><Music2/></SocialLink>
        </div>
      </div>

      <div className="footer-nav-column">
        <h4>Khám phá</h4>
        <div className="footer-nav-grid">
          {exploreLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
        </div>
      </div>

      <div className="footer-participate-column">
        <h4>Tham gia</h4>
        <Link to="/gui-goc-nhin" className="footer-submit-cta">
          <span>Gửi góc nhìn</span><ArrowRight size={18}/>
        </Link>
        <div className="footer-participate-links">
          {participateLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {brand.siteName||'HALO HOLA'}</span>
        <span className="footer-bottom-note">52 góc nhìn · 1 Hòa Lạc</span>
      </div>
    </div>
  </footer>
}
