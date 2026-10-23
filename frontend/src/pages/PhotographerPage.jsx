import { useEffect, useMemo, useState } from 'react'
import {
  Camera, CalendarDays, FolderOpen, Image as ImageIcon, LogIn, LogOut,
  MapPin, Plus, RefreshCw, Trash2, UploadCloud, CheckCircle2
} from 'lucide-react'
import {
  adminLogin, getCurrentUser, getAdminToken, setAdminToken,
  getPhotographerPlaces, getPhotographerShoots, createPhotographerShoot,
  updatePhotographerShoot, getPhotographerAssets, uploadPhotographerAssets,
  deletePhotographerAsset
} from '../services/api.js'
import './PhotographerPage.css'

const today=()=>new Date().toISOString().slice(0,10)
const formatBytes=value=>{
  const bytes=Number(value||0)
  if(bytes<1024*1024) return (bytes/1024).toFixed(0)+' KB'
  if(bytes<1024*1024*1024) return (bytes/1024/1024).toFixed(1)+' MB'
  return (bytes/1024/1024/1024).toFixed(2)+' GB'
}

export default function PhotographerPage(){
  const [token,setToken]=useState(()=>getAdminToken()||'')
  const [user,setUser]=useState(null)
  const [credentials,setCredentials]=useState({email:'',password:''})
  const [places,setPlaces]=useState([])
  const [shoots,setShoots]=useState([])
  const [selectedId,setSelectedId]=useState('')
  const [assets,setAssets]=useState([])
  const [form,setForm]=useState({title:'',capturedOn:today(),placeId:'',placeName:'',notes:''})
  const [files,setFiles]=useState([])
  const [loading,setLoading]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  const selected=useMemo(()=>shoots.find(x=>x.id===selectedId)||null,[shoots,selectedId])
  const totalAssets=useMemo(()=>shoots.reduce((sum,x)=>sum+Number(x.asset_count||0),0),[shoots])
  const totalBytes=useMemo(()=>shoots.reduce((sum,x)=>sum+Number(x.total_bytes||0),0),[shoots])

  const loadWorkspace=async(preferredId='')=>{
    setLoading(true);setError('')
    try{
      const [placeRows,shootRows]=await Promise.all([getPhotographerPlaces(),getPhotographerShoots()])
      setPlaces(placeRows);setShoots(shootRows)
      const nextId=preferredId||selectedId||shootRows[0]?.id||''
      setSelectedId(nextId)
      setAssets(nextId?await getPhotographerAssets({shootId:nextId}):[])
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    if(!token){setUser(null);return}
    let alive=true
    getCurrentUser().then(data=>{
      if(!alive)return
      const next=data?.user
      if(!['PHOTOGRAPHER','MODERATOR','ADMIN'].includes(next?.role)){
        setAdminToken(null);setToken('');setError('Tài khoản này không có quyền vào khu tác nghiệp.')
        return
      }
      setUser(next);loadWorkspace()
    }).catch(err=>{
      if(!alive)return
      setAdminToken(null);setToken('');setError(err.message)
    })
    return()=>{alive=false}
  },[token])

  const login=async event=>{
    event.preventDefault();setLoading(true);setError('')
    try{
      const data=await adminLogin(credentials)
      if(!['PHOTOGRAPHER','MODERATOR','ADMIN'].includes(data?.user?.role)){
        throw new Error('Tài khoản này không thuộc đội tác nghiệp.')
      }
      setAdminToken(data.token);setToken(data.token);setUser(data.user)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const selectShoot=async id=>{
    setSelectedId(id);setError('')
    try{setAssets(await getPhotographerAssets({shootId:id}))}catch(err){setError(err.message)}
  }

  const createShoot=async event=>{
    event.preventDefault();setLoading(true);setError('');setMessage('')
    try{
      const created=await createPhotographerShoot(form)
      setForm({title:'',capturedOn:today(),placeId:'',placeName:'',notes:''})
      setMessage('Đã tạo buổi chụp. Bạn có thể tải ảnh lên ngay.')
      await loadWorkspace(created.id)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const upload=async()=>{
    if(!selectedId||!files.length)return
    setUploading(true);setError('');setMessage('')
    try{
      const batches=[]
      for(let i=0;i<files.length;i+=5)batches.push(files.slice(i,i+5))
      for(const batch of batches) await uploadPhotographerAssets(selectedId,batch)
      setFiles([])
      setMessage('Đã tải ảnh lên kho tác nghiệp.')
      await loadWorkspace(selectedId)
    }catch(err){setError(err.message)}
    finally{setUploading(false)}
  }

  const completeShoot=async()=>{
    if(!selected)return
    try{
      await updatePhotographerShoot(selected.id,{status:selected.status==='COMPLETE'?'OPEN':'COMPLETE'})
      await loadWorkspace(selected.id)
    }catch(err){setError(err.message)}
  }

  const removeAsset=async id=>{
    if(!confirm('Xóa file này khỏi kho tác nghiệp?'))return
    try{
      await deletePhotographerAsset(id)
      setAssets(v=>v.filter(x=>x.id!==id))
      await loadWorkspace(selectedId)
    }catch(err){setError(err.message)}
  }

  const logout=()=>{setAdminToken(null);setToken('');setUser(null)}

  if(!token||!user) return <main className="photo-workspace-login">
    <form onSubmit={login}>
      <div className="photo-workspace-brand"><Camera/> HALO HOLA</div>
      <span>ĐỘI TÁC NGHIỆP</span>
      <h1>Đăng nhập kho ảnh</h1>
      <p>Tài khoản dành riêng cho đội nhiếp ảnh HALO HOLA.</p>
      <input type="email" required placeholder="Email" value={credentials.email} onChange={e=>setCredentials(v=>({...v,email:e.target.value}))}/>
      <input type="password" required placeholder="Mật khẩu" value={credentials.password} onChange={e=>setCredentials(v=>({...v,password:e.target.value}))}/>
      {error&&<div className="photo-workspace-error">{error}</div>}
      <button disabled={loading}><LogIn/>{loading?'Đang đăng nhập...':'Đăng nhập'}</button>
    </form>
  </main>

  return <main className="photo-workspace">
    <header className="photo-workspace-top">
      <div>
        <span>HALO HOLA · ĐỘI TÁC NGHIỆP</span>
        <h1>Kho ảnh hiện trường</h1>
        <p>Chào {user.name}. Ảnh được lưu theo tài khoản, ngày chụp và buổi tác nghiệp.</p>
      </div>
      <div className="photo-workspace-top-actions">
        <button onClick={()=>loadWorkspace(selectedId)}><RefreshCw/> Làm mới</button>
        <button onClick={logout}><LogOut/> Đăng xuất</button>
      </div>
    </header>

    {error&&<div className="photo-workspace-error">{error}</div>}
    {message&&<div className="photo-workspace-success">{message}</div>}

    <section className="photo-workspace-stats">
      <div><FolderOpen/><span><b>{shoots.length}</b> buổi chụp</span></div>
      <div><ImageIcon/><span><b>{totalAssets}</b> file đã tải</span></div>
      <div><UploadCloud/><span><b>{formatBytes(totalBytes)}</b> đã lưu</span></div>
    </section>

    <div className="photo-workspace-layout">
      <aside>
        <form className="photo-shoot-form" onSubmit={createShoot}>
          <span>TẠO BUỔI CHỤP</span>
          <h2>Hôm nay chụp ở đâu?</h2>
          <label>Tên buổi chụp<input required value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} placeholder="Ví dụ: Buổi sáng Xứ Đoài"/></label>
          <label>Ngày chụp<input type="date" required value={form.capturedOn} onChange={e=>setForm(v=>({...v,capturedOn:e.target.value}))}/></label>
          <label>Điểm HOLA Map<select value={form.placeId} onChange={e=>setForm(v=>({...v,placeId:e.target.value,placeName:''}))}><option value="">Chọn từ danh sách</option>{places.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          {!form.placeId&&<label>Hoặc nhập địa điểm<input value={form.placeName} onChange={e=>setForm(v=>({...v,placeName:e.target.value}))} placeholder="Tên điểm chụp"/></label>}
          <label>Ghi chú<textarea rows="3" value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))} placeholder="Brief, khung giờ, nội dung cần lưu ý..."/></label>
          <button disabled={loading}><Plus/> Tạo buổi chụp</button>
        </form>

        <div className="photo-shoot-list">
          <div className="photo-shoot-list-head"><span>BUỔI CHỤP CỦA TÔI</span><b>{shoots.length}</b></div>
          {shoots.map(shoot=><button key={shoot.id} className={selectedId===shoot.id?'active':''} onClick={()=>selectShoot(shoot.id)}>
            <div><CalendarDays/><span><b>{shoot.title}</b><small>{shoot.captured_on?.slice(0,10)} · {shoot.place_name}</small></span></div>
            <small>{shoot.asset_count||0} file</small>
          </button>)}
          {!shoots.length&&<p>Chưa có buổi chụp nào.</p>}
        </div>
      </aside>

      <section className="photo-library">
        {!selected?<div className="photo-empty"><Camera/><h2>Tạo một buổi chụp để bắt đầu</h2><p>Mỗi album sẽ tự nằm trong thư mục riêng của tài khoản trên R2.</p></div>:<>
          <header className="photo-library-head">
            <div><span>{selected.captured_on?.slice(0,10)} · {selected.place_name}</span><h2>{selected.title}</h2><p>{selected.notes||'Không có ghi chú.'}</p></div>
            <button className={selected.status==='COMPLETE'?'complete':''} onClick={completeShoot}><CheckCircle2/>{selected.status==='COMPLETE'?'Đã hoàn tất':'Đánh dấu hoàn tất'}</button>
          </header>

          <div className="photo-upload-box">
            <UploadCloud/>
            <div><b>Thả hoặc chọn ảnh từ máy</b><small>JPG, PNG, WEBP, TIFF và RAW: DNG, CR2, NEF, ARW · tối đa 100 MB/file.</small></div>
            <label>Chọn ảnh<input hidden multiple type="file" accept=".jpg,.jpeg,.png,.webp,.avif,.tif,.tiff,.dng,.cr2,.nef,.arw" onChange={e=>setFiles([...e.target.files])}/></label>
          </div>
          {files.length>0&&<div className="photo-upload-queue"><span>{files.length} file đã chọn · {formatBytes(files.reduce((s,f)=>s+f.size,0))}</span><button onClick={upload} disabled={uploading}>{uploading?'Đang tải...':'Tải lên R2'}</button></div>}

          <div className="photo-asset-grid">
            {assets.map(asset=><article key={asset.id}>
              <div className="photo-asset-preview">{asset.previewable&&asset.url?<img src={asset.url} alt={asset.original_name}/>:<div><ImageIcon/><span>RAW / FILE</span></div>}</div>
              <div className="photo-asset-meta"><b title={asset.original_name}>{asset.original_name}</b><small>{formatBytes(asset.size_bytes)}</small></div>
              <div className="photo-asset-actions">{asset.url&&<a href={asset.url} target="_blank" rel="noreferrer">Mở file</a>}<button onClick={()=>removeAsset(asset.id)}><Trash2/></button></div>
            </article>)}
            {!assets.length&&<div className="photo-empty compact"><ImageIcon/><p>Album này chưa có ảnh.</p></div>}
          </div>
        </>}
      </section>
    </div>
  </main>
}
