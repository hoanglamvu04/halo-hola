import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import ThemeCatalogManager from './ThemeCatalogManager.jsx'
import { getHomepageContent, updateAdminHomepageSection } from '../services/api.js'
import './CatalogManagementManager.css'

const defaults={
  eyebrow:'KHÁM PHÁ ĐA DẠNG GÓC NHÌN',
  title:'8 chủ đề về Hòa Lạc',
  description:'Tám mảnh ghép, một bức tranh Hòa Lạc đa sắc.'
}

export default function ThemeManagementManager(){
  const [enabled,setEnabled]=useState(true)
  const [content,setContent]=useState(defaults)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')

  const load=async()=>{
    setMessage('')
    const homepage=await getHomepageContent()
    const section=homepage?.themes||{}
    setEnabled(section.enabled!==false)
    setContent({...defaults,...(section.content||{})})
  }

  useEffect(()=>{load().catch(err=>setMessage(err.message))},[])

  const patch=(key,value)=>setContent(prev=>({...prev,[key]:value}))

  const saveSection=async()=>{
    setSaving(true);setMessage('')
    try{
      await updateAdminHomepageSection('themes',{enabled,content})
      setMessage('Đã lưu phần giới thiệu Chủ đề trên trang chủ.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  return <div className="catalog-management-stack">
    <section className="catalog-section-settings">
      <div className="catalog-section-head">
        <div><span className="eyebrow">HIỂN THỊ TRÊN TRANG CHỦ</span><h2>Khối Chủ đề</h2><p>Phần tiêu đề giới thiệu ở Home. Danh sách 8 chủ đề bên dưới là dữ liệu dùng chung cho toàn website.</p></div>
        <button className="btn btn-green btn-sm" onClick={saveSection} disabled={saving}><Save size={16}/>{saving?'Đang lưu...':'Lưu phần Home'}</button>
      </div>
      {message&&<div className="cms-message">{message}</div>}
      <div className="catalog-section-grid">
        <label><span>Eyebrow</span><input value={content.eyebrow||''} onChange={e=>patch('eyebrow',e.target.value)}/></label>
        <label><span>Tiêu đề</span><input value={content.title||''} onChange={e=>patch('title',e.target.value)}/></label>
        <label className="wide"><span>Mô tả</span><textarea rows="3" value={content.description||''} onChange={e=>patch('description',e.target.value)}/></label>
        <label className="catalog-toggle"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/><span>Hiển thị khối Chủ đề trên trang chủ</span></label>
      </div>
    </section>

    <ThemeCatalogManager/>
  </div>
}
