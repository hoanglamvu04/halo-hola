import { useEffect, useMemo, useState } from 'react'
import { Save, Upload, ImagePlus, ExternalLink, RefreshCw } from 'lucide-react'
import { client, getAdminMediaLibrary, uploadAdminSiteAsset } from '../services/api.js'
import './ThemeCatalogManager.css'

function normalizeTheme(item){
  return {
    ...item,
    title:item.title||'',
    description:item.description||'',
    intro:item.intro||'',
    image:item.image||'',
    color:item.color||'#0f5132',
    locationLabel:item.locationLabel||'Hòa Lạc',
    sortOrder:Number(item.sortOrder||0),
    published:item.published!==false
  }
}

export default function ThemeCatalogManager(){
  const [themes,setThemes]=useState([])
  const [activeId,setActiveId]=useState(null)
  const [assets,setAssets]=useState([])
  const [saving,setSaving]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [message,setMessage]=useState('')

  const load=async()=>{
    setMessage('')
    const [themeRes,media]=await Promise.all([
      client.get('/admin/themes'),
      getAdminMediaLibrary({archived:false})
    ])
    const rows=(themeRes.data||[]).map(normalizeTheme)
    setThemes(rows)
    setActiveId(current=>current||rows[0]?.id||null)
    setAssets(Array.isArray(media)?media:[])
  }

  useEffect(()=>{load().catch(err=>setMessage(err.message))},[])

  const active=useMemo(()=>themes.find(t=>t.id===activeId),[themes,activeId])
  const patch=(key,value)=>setThemes(prev=>prev.map(t=>t.id===activeId?{...t,[key]:value}:t))

  const save=async()=>{
    if(!active)return
    setSaving(true);setMessage('')
    try{
      const {data}=await client.put('/admin/themes/'+active.id,{
        title:active.title,
        description:active.description,
        intro:active.intro,
        image:active.image,
        color:active.color,
        locationLabel:active.locationLabel,
        sortOrder:Number(active.sortOrder||0),
        published:active.published
      })
      setThemes(prev=>prev.map(t=>t.id===active.id?normalizeTheme(data):t))
      setMessage('Đã lưu chủ đề. Trang chủ, trang Chủ đề và trang chi tiết chủ đề dùng chung dữ liệu này.')
    }catch(err){setMessage(err.response?.data?.error||err.message)}
    finally{setSaving(false)}
  }

  const upload=async(file)=>{
    if(!file)return
    setUploading(true);setMessage('')
    try{
      const asset=await uploadAdminSiteAsset('themes',file)
      patch('image',asset.url)
      setAssets(prev=>[asset,...prev])
      setMessage('Đã tải ảnh. Bấm “Lưu chủ đề” để áp dụng đồng bộ.')
    }catch(err){setMessage(err.message)}
    finally{setUploading(false)}
  }

  return <div className="theme-admin-shell">
    <aside className="theme-admin-list">
      <div className="theme-admin-list-head"><div><b>8 chủ đề</b><small>Dữ liệu dùng chung toàn website</small></div><button onClick={()=>load()} title="Tải lại"><RefreshCw size={16}/></button></div>
      {themes.map((theme,index)=><button key={theme.id} className={activeId===theme.id?'active':''} onClick={()=>setActiveId(theme.id)}>
        <span>{String(index+1).padStart(2,'0')}</span>
        <div><b>{theme.title}</b><small>/{theme.slug}</small></div>
        <i className={theme.published?'on':'off'}/>
      </button>)}
    </aside>

    <section className="theme-admin-editor">
      {!active?<div className="cms-message">Đang tải danh sách chủ đề...</div>:<>
        <header className="theme-admin-head">
          <div><span className="eyebrow">CHỦ ĐỀ #{String(active.id).padStart(2,'0')}</span><h2>{active.title}</h2><p>Chỉnh một lần, dữ liệu sẽ đồng bộ từ card ở Trang chủ → trang /chu-de → trang chi tiết chủ đề.</p></div>
          <div className="theme-admin-actions">
            <a href={'/chu-de/'+active.slug} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><ExternalLink size={15}/> Xem trang</a>
            <button className="btn btn-green btn-sm" onClick={save} disabled={saving}><Save size={16}/>{saving?'Đang lưu...':'Lưu chủ đề'}</button>
          </div>
        </header>

        {message&&<div className="cms-message">{message}</div>}

        <div className="theme-admin-grid">
          <label><span>Tên chủ đề</span><input value={active.title} onChange={e=>patch('title',e.target.value)}/></label>
          <label><span>Địa điểm hiển thị</span><input value={active.locationLabel} onChange={e=>patch('locationLabel',e.target.value)}/></label>
          <label className="wide"><span>Mô tả ngắn</span><textarea rows="3" value={active.description} onChange={e=>patch('description',e.target.value)}/></label>
          <label className="wide"><span>Giới thiệu chi tiết</span><textarea rows="6" value={active.intro} onChange={e=>patch('intro',e.target.value)}/></label>
          <label><span>Màu nhận diện</span><div className="theme-color-input"><input type="color" value={/^#[0-9a-f]{6}$/i.test(active.color)?active.color:'#0f5132'} onChange={e=>patch('color',e.target.value)}/><input value={active.color} onChange={e=>patch('color',e.target.value)} placeholder="#0f5132"/></div></label>
          <label><span>Thứ tự</span><input type="number" value={active.sortOrder} onChange={e=>patch('sortOrder',e.target.value)}/></label>
          <label className="theme-admin-toggle"><input type="checkbox" checked={active.published} onChange={e=>patch('published',e.target.checked)}/><span>Hiển thị chủ đề ngoài website</span></label>
        </div>

        <div className="theme-image-manager">
          <div className="theme-image-current">
            <div><b>Ảnh đại diện chủ đề</b><small>Ảnh này dùng cả card ở Trang chủ, trang danh sách Chủ đề và Hero trang chi tiết.</small></div>
            <div className="theme-image-preview">{active.image?<img src={active.image} alt={active.title}/>:<ImagePlus/>}</div>
            <input value={active.image} onChange={e=>patch('image',e.target.value)} placeholder="URL ảnh"/>
            <label className="cms-upload-btn"><Upload size={15}/>{uploading?'Đang tải...':'Tải ảnh mới'}<input hidden type="file" accept="image/*" disabled={uploading} onChange={e=>upload(e.target.files?.[0])}/></label>
          </div>

          <div className="theme-media-pick">
            <b>Chọn từ Media Library</b><small>Bấm một ảnh để gán cho chủ đề đang chọn.</small>
            <div className="theme-media-grid">{assets.slice(0,36).map(asset=><button key={asset.id} onClick={()=>{patch('image',asset.url);setMessage('Đã chọn ảnh từ Media Library. Bấm “Lưu chủ đề” để áp dụng.')}}><img src={asset.url} alt={asset.alt_text||asset.title||asset.original_name}/><span>{asset.title||asset.original_name}</span></button>)}</div>
          </div>
        </div>
      </>}
    </section>
  </div>
}
