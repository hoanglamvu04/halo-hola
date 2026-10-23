import { ArrowRight, Facebook, Instagram, Mail, MapPin, Music2, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api.js'

function SocialLink({href,label,children}){
  if(!href||href==='#') return null
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>{children}<span>{label}</span></a>
}

export default function Footer() {
  const [settings,setSettings]=useState({})
  useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[])
  const brand=settings.brand||{}
  const footer=settings.footer||{}
  const email=footer.email||'admin@xspace.vn'
  const address=footer.address||'Hòa Lạc, Hà Nội'

  return <footer className="site-footer site-footer-v3">
    <div className="container footer-shell footer-shell-v3">
      <section className="footer-brand-column">
        <Link to="/" className={'footer-logo-card '+(brand.logo?'has-image':'')} aria-label="Về trang chủ HALO HOLA">
          {brand.logo
            ? <img src={brand.logo} alt={brand.siteName||'HALO HOLA'}/>
            : <span className="footer-wordmark">HAL<span>O</span> HOLA</span>}
        </Link>
        <p className="footer-brand-copy">{footer.description||brand.tagline||'Nơi cộng đồng cùng khám phá, ghi lại, đóng góp và kể tiếp những câu chuyện về Hòa Lạc.'}</p>
        <div className="footer-brand-note">
          <span>52 góc nhìn</span>
          <span>1 Hòa Lạc</span>
        </div>
      </section>

      <section className="footer-contact-column">
        <h4>Thông tin liên hệ</h4>
        <div className="footer-contact-item">
          <MapPin/>
          <div><b>Hòa Lạc</b><span>{address}</span></div>
        </div>
        <a className="footer-contact-item footer-contact-link" href={'mailto:'+email}>
          <Mail/>
          <div><b>Email</b><span>{email}</span></div>
        </a>
      </section>

      <section className="footer-connect-column">
        <h4>Kết nối với chúng tôi</h4>
        <p>Theo dõi HALO HOLA và cùng đóng góp những góc nhìn, câu chuyện về Hòa Lạc.</p>
        <Link to="/gui-goc-nhin" className="footer-submit-cta">
          <span>Gửi một góc nhìn</span><ArrowRight/>
        </Link>
        <div className="footer-social-links">
          <SocialLink href={footer.facebook} label="Facebook"><Facebook/></SocialLink>
          <SocialLink href={footer.instagram} label="Instagram"><Instagram/></SocialLink>
          <SocialLink href={footer.youtube} label="YouTube"><Youtube/></SocialLink>
          <SocialLink href={footer.tiktok} label="TikTok"><Music2/></SocialLink>
        </div>
      </section>

      <div className="footer-bottom">
        <span>© 2026 {brand.siteName||'HALO HOLA'}</span>
        <span>Khám phá · Ghi lại · Kết nối · Kể tiếp</span>
        <span>Hòa Lạc · Hà Nội</span>
      </div>
    </div>
  </footer>
}
