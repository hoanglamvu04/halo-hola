import { useEffect, useMemo, useState } from 'react'
import {
  Search, Upload, Copy, Trash2, Save, Image as ImageIcon, FolderOpen,
  RefreshCw, Archive, ArchiveRestore, X
} from 'lucide-react'
import {
  getAdminMediaLibrary, updateAdminMediaAsset, deleteAdminMediaAsset,
  uploadAdminSiteAsset
} from '../services/api.js'

export default function MediaLibrary(){
  const [assets,setAssets]=useState([])
  const [q,setQ]=useState('')
  const [folder,setFolder]=useState('')
  const [selected,setSelected]=useState(null)
  const [uploading,setUploading]=useState(false)
  const [message,setMessage]=useState('')
  const [showArchived,setShowArchived]=useState(false)

  const load=async()=>{
    try{
      const data=await getAdminMediaLibrary({q:q||undefined,folder:folder||undefined,archived:showArchived})
      setAssets(data)
      if(selected){
        const next=data.find(x=>x.id===selected.id)
        setSelected(next||null)
      }
    }catch(err){setMessage(err.message)}
  }

  useEffect(()=>{load()},[folder,showArchived])

  const folders=useMemo(()=>Array.from(new Set(assets.map(x=>x.folder||'general'))).sort(),[assets])

  const upload=async(file)=>{
    if(!file) return
    setUploading(true);setMessage('')
    try{
      const asset=await uploadAdminSiteAsset(folder||'media-library',file)
      await updateAdminMediaAsset(asset.id,{folder:folder||'general',title:file.name,alt_text:file.name.replace(/\.[^.]+$/,'')})
      await load()
      setMessage('Đã upload vào Media Library.')
    }catch(err){setMessage(err.message)}
    finally{setUploading(false)}
  }

  const save=async()=>{
    if(!selected) return
    try{
      const updated=await updateAdminMediaAsset(selected.id,{
        title:selected.title||'',
        alt_text:selected.alt_text||'',
        folder:selected.folder||'general',
        tags:selected.tags||'',
        archived:Boolean(selected.archived)
      })
      setSelected(updated)
      await load()
      setMessage('Đã lưu metadata ảnh.')
    }catch(err){setMessage(err.message)}
  }

  const remove=async()=>{
    if(!selected||!window.confirm('Xóa file này khỏi Media Library và storage?')) return
    try{
      await deleteAdminMediaAsset(selected.id)
      setSelected(null)
      await load()
      setMessage('Đã xóa media.')
    }catch(err){setMessage(err.message)}
  }

  const copy=async(url)=>{
    try{await navigator.clipboard.writeText(url);setMessage('Đã copy URL ảnh.')}catch{}
  }

  return <div className="media-admin">
    <header className="media-admin-head">
      <div><span className="eyebrow">GLOBAL MEDIA LIBRARY</span><h2><ImageIcon/> Kho ảnh HALO HOLA</h2><p>Một nơi quản lý ảnh dùng cho Homepage, Stories, Tour, Map và đối tác.</p></div>
      <div>
        <label className="btn btn-terra btn-sm"><Upload/>{uploading?'Đang tải...':'Tải ảnh'}<input hidden type="file" accept="image/*" disabled={uploading} onChange={e=>upload(e.target.files?.[0])}/></label>
        <button className="icon-btn" onClick={load}><RefreshCw/></button>
      </div>
    </header>

    {message&&<div className="cms-message">{message}</div>}

    <div className="media-admin-toolbar">
      <div className="admin-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Tên file, tiêu đề, tag..."/></div>
      <select value={folder} onChange={e=>setFolder(e.target.value)}>
        <option value="">Tất cả thư mục</option>
        {folders.map(x=><option key={x}>{x}</option>)}
      </select>
      <button onClick={()=>setShowArchived(v=>!v)}>{showArchived?<ArchiveRestore/>:<Archive/>}{showArchived?'Đang xem lưu trữ':'Ảnh đang dùng'}</button>
      <button className="btn btn-outline btn-sm" onClick={load}>Lọc</button>
    </div>

    <div className="media-admin-layout">
      <div className="media-admin-grid">
        {assets.map(asset=><button key={asset.id} className={selected?.id===asset.id?'active':''} onClick={()=>setSelected({...asset})}>
          <div><img src={asset.url} alt={asset.alt_text||asset.original_name}/>{asset.archived&&<span>LƯU TRỮ</span>}</div>
          <b>{asset.title||asset.original_name}</b>
          <small>{asset.folder||'general'} · {(Number(asset.size_bytes||0)/1024/1024).toFixed(2)} MB</small>
        </button>)}
        {!assets.length&&<div className="cmsv2-empty">Chưa có ảnh phù hợp.</div>}
      </div>

      <aside className="media-inspector">
        {!selected?<div className="media-inspector-empty"><ImageIcon/><h3>Chọn một ảnh</h3><p>Metadata và thao tác sẽ hiện ở đây.</p></div>:<>
          <div className="media-inspector-preview"><img src={selected.url} alt={selected.alt_text||selected.original_name}/></div>
          <div className="media-inspector-title"><div><b>{selected.original_name}</b><small>{selected.storage_provider} · {(Number(selected.size_bytes||0)/1024/1024).toFixed(2)} MB</small></div><button onClick={()=>setSelected(null)}><X/></button></div>
          <label>Tiêu đề<input value={selected.title||''} onChange={e=>setSelected(v=>({...v,title:e.target.value}))}/></label>
          <label>Alt text<input value={selected.alt_text||''} onChange={e=>setSelected(v=>({...v,alt_text:e.target.value}))}/></label>
          <label>Thư mục<input value={selected.folder||'general'} onChange={e=>setSelected(v=>({...v,folder:e.target.value}))}/></label>
          <label>Tags<input value={selected.tags||''} onChange={e=>setSelected(v=>({...v,tags:e.target.value}))} placeholder="homepage, tour, landscape"/></label>
          <label className="media-archive-check"><input type="checkbox" checked={Boolean(selected.archived)} onChange={e=>setSelected(v=>({...v,archived:e.target.checked}))}/> Lưu trữ ảnh này</label>
          <div className="media-inspector-actions">
            <button onClick={()=>copy(selected.url)}><Copy/> Copy URL</button>
            <button onClick={save}><Save/> Lưu metadata</button>
            <button className="danger" onClick={remove}><Trash2/> Xóa file</button>
          </div>
        </>}
      </aside>
    </div>
  </div>
}
