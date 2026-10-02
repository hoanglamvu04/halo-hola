import { Menu, Search, X, ArrowRight } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

const items = [
  ['Khám phá', '/'], ['Chủ đề', '/chu-de/net-doai'], ['HOLA Tour', '/hola-tour'],
  ['HOLA Map', '/hola-map'], ['Stories', '/stories'], ['TOP52', '/top52'], ['WE HOLA', '/we-hola']
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" to="/">HAL<span>O</span> HOLA</Link>
      <nav className={`main-nav ${open ? 'open' : ''}`}>
        {items.map(([label, href]) => <NavLink key={href} to={href} onClick={() => setOpen(false)}>{label}</NavLink>)}
      </nav>
      <div className="header-actions">
        <button className="icon-btn search-btn" aria-label="Tìm kiếm"><Search size={18}/></button>
        <Link className="btn btn-terra btn-sm" to="/gui-goc-nhin">GỬI GÓC NHÌN <ArrowRight size={16}/></Link>
        <button className="menu-btn" onClick={() => setOpen(v => !v)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
  </header>
}
