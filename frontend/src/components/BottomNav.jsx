import { NavLink } from 'react-router-dom'
import { Home, Layers3, Plus, MapPinned, BookOpen } from 'lucide-react'

const items=[
  {to:'/',label:'Khám phá',Icon:Home,end:true},
  {to:'/chu-de',label:'Chủ đề',Icon:Layers3},
  {to:'/gui-goc-nhin',label:'Gửi góc nhìn',Icon:Plus,primary:true},
  {to:'/hola-map',label:'HOLA Map',Icon:MapPinned},
  {to:'/stories',label:'Stories',Icon:BookOpen}
]

export default function BottomNav(){
  return <nav className="mobile-bottom-nav" aria-label="Điều hướng nhanh">
    <div className="mobile-bottom-nav-inner">
      {items.map(({to,label,Icon,end,primary})=>
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({isActive})=>'mobile-bottom-item'+(isActive?' active':'')+(primary?' primary':'')}
        >
          <span className="mobile-bottom-icon"><Icon/></span>
          <small>{label}</small>
        </NavLink>
      )}
    </div>
  </nav>
}
