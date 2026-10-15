import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function AdminMobileSidebarRuntime(){
  const location=useLocation()
  const [open,setOpen]=useState(false)
  const isAdmin=location.pathname.startsWith('/admin')

  useEffect(()=>{
    setOpen(false)
  },[location.pathname])

  useEffect(()=>{
    if(!isAdmin){
      document.body.classList.remove('admin-mobile-sidebar-open')
      return undefined
    }
    document.body.classList.toggle('admin-mobile-sidebar-open',open)
    return ()=>document.body.classList.remove('admin-mobile-sidebar-open')
  },[isAdmin,open])

  useEffect(()=>{
    if(!isAdmin || !open) return undefined
    const onKeyDown=(event)=>{
      if(event.key==='Escape') setOpen(false)
    }
    window.addEventListener('keydown',onKeyDown)
    return ()=>window.removeEventListener('keydown',onKeyDown)
  },[isAdmin,open])

  if(!isAdmin) return null

  return <>
    <button
      type="button"
      className="admin-mobile-menu-toggle"
      aria-label={open?'Đóng menu quản trị':'Mở menu quản trị'}
      aria-expanded={open}
      onClick={()=>setOpen(value=>!value)}
    >
      {open?<X/>:<Menu/>}
    </button>
    <button
      type="button"
      className="admin-mobile-sidebar-backdrop"
      aria-label="Đóng menu quản trị"
      tabIndex={open?0:-1}
      onClick={()=>setOpen(false)}
    />
  </>
}
