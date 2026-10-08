import { Facebook, Instagram, Youtube, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

const exploreLinks=[
  ['Chủ đề','/chu-de'],
  ['TOP52','/top52'],
  ['Stories','/stories'],
  ['HOLA Tour','/hola-tour'],
  ['HOLA Map','/hola-map']
]

const supportLinks=[
  ['Thể lệ & Giải thưởng','/the-le-giai-thuong'],
  ['Gửi góc nhìn','/gui-goc-nhin'],
  ['Tra cứu tác phẩm','/tra-cuu'],
  ['WE HOLA','/we-hola'],
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

  return <footer className="site-footer">
    <div className="container footer-shell">
      <div className="footer-intro">
        <Link to="/" className={'footer-logo-card '+(brand.logo?'has-image':'')} aria-label="Về trang chủ HALO HOLA">
          {brand.logo
            ? <img src={brand.logo} alt={brand.siteName||'HALO HOLA'}/>
            : <span className="footer-wordmark">HAL<span>O</span> HOLA</span>}
        </Link>

        <p>{footer.description||brand.tagline||'Nơi những câu chuyện Hòa Lạc được kể lại, lưu giữ và lan tỏa.'}</p>
        {footer.address&&<div className="footer-address">{footer.address}</div>}

        <div className="socials footer-socials">
          <SocialLink href={footer.facebook} label="Facebook"><Facebook/></SocialLink>
          <SocialLink href={footer.instagram} label="Instagram"><Instagram/></SocialLink>
          <SocialLink href={footer.youtube} label="YouTube"><Youtube/></SocialLink>
          <SocialLink href={footer.tiktok} label="TikTok"><Music2/></SocialLink>
        </div>
      </div>

      <div className="footer-link-groups">
        <div className="footer-link-group">
          <h4>Khám phá</h4>
          {exploreLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
        </div>

        <div className="footer-link-group">
          <h4>Hỗ trợ & liên hệ</h4>
          {supportLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
          {footer.email&&<a className="footer-contact-link" href={'mailto:'+footer.email}>{footer.email}</a>}
          {footer.phone&&<a className="footer-contact-link" href={'tel:'+footer.phone}>{footer.phone}</a>}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {brand.siteName||'HALO HOLA'}. All rights reserved.</span>
        <span className="footer-bottom-note">52 góc nhìn · 1 Hòa Lạc</span>
      </div>
    </div>
  </footer>
}
