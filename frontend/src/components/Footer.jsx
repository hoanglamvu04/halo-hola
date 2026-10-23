import { ArrowRight, Facebook, Instagram, Mail, Music2, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

const exploreLinks=[
  ['Chủ đề','/chu-de'],
  ['Stories','/stories'],
  ['TOP52','/top52'],
  ['HOLA Map','/hola-map']
]

const programLinks=[
  ['HOLA Tour','/hola-tour'],
  ['HOLA DAY','/hola-day'],
  ['Calendar 2027','/calendar-2027'],
  ['WE HOLA','/we-hola']
]

const participateLinks=[
  ['Cách tham gia & Ghi nhận','/the-le-giai-thuong'],
  ['Theo dõi góc nhìn','/tra-cuu'],
  ['Đồng hành','/dong-hanh']
]

function SocialLink({href,label,children}){
  if(!href||href==='#') return null
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>{children}</a>
}

function FooterLinks({title,links,className=''}) {
  return <nav className={'footer-link-column '+className} aria-label={title}>
    <h4>{title}</h4>
    <div className="footer-link-list">
      {links.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
    </div>
  </nav>
}

export default function Footer() {
  const [settings,setSettings]=useState({})
  useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[])
  const brand=settings.brand||{}
  const footer=settings.footer||{}
  const email=footer.email||'admin@xspace.vn'

  return <footer className="site-footer site-footer-v3">
    <div className="container footer-shell footer-shell-v3">
      <section className="footer-brand-column">
        <Link to="/" className={'footer-logo-card '+(brand.logo?'has-image':'')} aria-label="Về trang chủ HALO HOLA">
          {brand.logo
            ? <img src={brand.logo} alt={brand.siteName||'HALO HOLA'}/>
            : <span className="footer-wordmark">HAL<span>O</span> HOLA</span>}
        </Link>

        <span className="footer-brand-eyebrow">HELLO HÒA LẠC</span>
        <p className="footer-brand-copy">{footer.description||brand.tagline||'Nơi cộng đồng cùng khám phá, ghi lại, đóng góp và kể tiếp những câu chuyện về Hòa Lạc.'}</p>
        {footer.address&&<div className="footer-address">{footer.address}</div>}

        <div className="footer-contact-row">
          <a className="footer-email" href={'mailto:'+email}><Mail size={16}/><span>{email}</span></a>
          <div className="socials footer-socials">
            <SocialLink href={footer.facebook} label="Facebook"><Facebook/></SocialLink>
            <SocialLink href={footer.instagram} label="Instagram"><Instagram/></SocialLink>
            <SocialLink href={footer.youtube} label="YouTube"><Youtube/></SocialLink>
            <SocialLink href={footer.tiktok} label="TikTok"><Music2/></SocialLink>
          </div>
        </div>
      </section>

      <FooterLinks title="Khám phá" links={exploreLinks}/>
      <FooterLinks title="Chương trình" links={programLinks}/>

      <section className="footer-participate-column">
        <h4>Tham gia</h4>
        <p className="footer-participate-copy">Có một góc nhìn, câu chuyện hoặc địa điểm về Hòa Lạc? Gửi về để cùng lưu lại.</p>
        <Link to="/gui-goc-nhin" className="footer-submit-cta">
          <span>Gửi một góc nhìn</span><ArrowRight size={18}/>
        </Link>
        <div className="footer-participate-links">
          {participateLinks.map(([label,to])=><Link key={to} to={to}>{label}</Link>)}
        </div>
      </section>

      <div className="footer-bottom">
        <span>© 2026 {brand.siteName||'HALO HOLA'}</span>
        <span className="footer-bottom-manifesto">Khám phá · Ghi lại · Kết nối · Kể tiếp</span>
        <span className="footer-bottom-note">52 góc nhìn · 1 Hòa Lạc</span>
      </div>
    </div>
  </footer>
}
