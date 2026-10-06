import { useEffect, useMemo, useState } from 'react'
import { ImagePlus, Save, Upload } from 'lucide-react'
import ColorPaletteManager from './ColorPaletteManager.jsx'
import { getAdminColors } from '../services/colorAdminApi.js'
import {
  getAdminMediaLibrary,
  getHomepageContent,
  updateAdminHomepageSection,
  uploadAdminSiteAsset
} from '../services/api.js'
import './CatalogManagementManager.css'

const defaults={
  eyebrow:'SẮC MÀU HÒA LẠC',
  title:'Hòa Lạc trong bạn có màu gì?',
  description:'Mỗi màu sắc là một lát cắt của Hòa Lạc.',
  storyImagePrimary:'',
  storyImageSecondary:'',
  colorImage1:'',
  colorImage2:'',
  colorImage3:'',
  colorImage4:'',
  colorImage5:'',
  colorImage6:''
}

export default function ColorManagementManager(){
  const [enabled,setEnabled]=useState(true)
  const [content,setContent]=useState(defaults)
  const [colors,setColors]=useState([])
  const [assets,setAssets]=useState([])
  const [targetField,setTargetField]=useState('storyImagePrimary')
  const [saving,setSaving]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [message,setMessage]=useState('')

  const load=async()=>{
    setMessage('')
    const [homepage,colorRows,media]=await Promise.all([
      getHomepageContent(),
      getAdminColors(),
      getAdminMediaLibrary({archived:false})
    ])
    const section=homepage?.colors||{}
    setEnabled(section.enabled!==false)
    setContent({...defaults,...(section.content||{})})
    setColors(Array.isArray(colorRows)?colorRows:[])
    setAssets(Array.isArray(media)?media:[])
  }

  useEffect(()=>{load().catch(err=>setMessage(err.message))},[])

  const patch=(key,value)=>setContent(prev=>({...prev,[key]:value}))

  const imageSlots=useMemo(()=>[
    ['storyImagePrimary','Ảnh visual chính phía trên'],
    ['storyImageSecondary','Ảnh visual phụ phía trên'],
    ...Array.from({length:6},(_,index)=>[
      `colorImage${index+1}`,
      `Ảnh ${colors[index]?.name||`sắc màu ${index+1}`}`
    ])
  ],[colors])

  const saveSection=async()=>{
    setSaving(true);setMessage('')
    try{
      await updateAdminHomepageSection('colors',{enabled,content})
      setMessage('Đã lưu phần Sắc màu. Trang chủ sẽ dùng ngay nội dung và ảnh mới.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  const upload=async(file)=>{
    if(!file)return
    setUploading(true);setMessage('')
    try{
      const asset=await uploadAdminSiteAsset('colors',file)
      patch(targetField,asset.url)
      setAssets(prev=>[asset,...prev])
      setMessage('Đã tải ảnh và gán vào vị trí đang chọn. Bấm “Lưu phần Home” để áp dụng.')
    }catch(err){setMessage(err.message)}
    finally{setUploading(false)}
  }

  return <div className="catalog-management-stack">
    <section className="catalog-section-settings">
      <div className="catalog-section-head">
        <div><span className="eyebrow">HIỂN THỊ TRÊN TRANG CHỦ</span><h2>Khối Sắc màu Hòa Lạc</h2><p>Quản lý phần giới thiệu và toàn bộ ảnh của khối Sắc màu trên Home. Tên/mã màu quản lý riêng ở bảng màu bên dưới.</p></div>
        <button className="btn btn-green btn-sm" onClick={saveSection} disabled={saving}><Save size={16}/>{saving?'Đang lưu...':'Lưu phần Home'}</button>
      </div>
      {message&&<div className="cms-message">{message}</div>}

      <div className="catalog-section-grid">
        <label><span>Eyebrow</span><input value={content.eyebrow||''} onChange={e=>patch('eyebrow',e.target.value)}/></label>
        <label><span>Tiêu đề</span><input value={content.title||''} onChange={e=>patch('title',e.target.value)}/></label>
        <label className="wide"><span>Mô tả</span><textarea rows="3" value={content.description||''} onChange={e=>patch('description',e.target.value)}/></label>
        <label className="catalog-toggle"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/><span>Hiển thị khối Sắc màu trên trang chủ</span></label>
      </div>
    </section>

    <ColorPaletteManager/>

    <section className="catalog-section-settings">
      <div className="catalog-section-head">
        <div><span className="eyebrow">HÌNH ẢNH</span><h2>Ảnh Sắc màu</h2><p>Chọn vị trí cần thay rồi bấm ảnh trong Media Library, hoặc tải ảnh mới.</p></div>
        <label className="cms-upload-btn"><Upload size={15}/>{uploading?'Đang tải...':'Tải ảnh mới'}<input hidden type="file" accept="image/*" disabled={uploading} onChange={e=>upload(e.target.files?.[0])}/></label>
      </div>

      <div className="catalog-image-slots">
        {imageSlots.map(([key,label])=><button type="button" key={key} className={targetField===key?'active':''} onClick={()=>setTargetField(key)}>
          <div>{content[key]?<img src={content[key]} alt={label}/>:<ImagePlus/>}</div>
          <span>{label}</span>
        </button>)}
      </div>

      <label className="catalog-url-field"><span>URL ảnh của vị trí đang chọn</span><input value={content[targetField]||''} onChange={e=>patch(targetField,e.target.value)} placeholder="https://..."/></label>

      <div className="catalog-media-block">
        <b>Media Library</b><small>Bấm một ảnh để gán vào <strong>{imageSlots.find(([key])=>key===targetField)?.[1]}</strong>.</small>
        <div className="catalog-media-grid">{assets.slice(0,40).map(asset=><button type="button" key={asset.id} onClick={()=>{patch(targetField,asset.url);setMessage('Đã chọn ảnh từ Media Library. Bấm “Lưu phần Home” để áp dụng.')}}><img src={asset.url} alt={asset.alt_text||asset.title||asset.original_name}/><span>{asset.title||asset.original_name}</span></button>)}</div>
      </div>
    </section>
  </div>
}
