import { useEffect, useMemo, useState } from 'react'
import {
  Camera, CalendarDays, ExternalLink, FolderOpen, LogIn, LogOut,
  MapPin, RefreshCw, Send
} from 'lucide-react'
import {
  adminLogin, getCurrentUser, getAdminToken, setAdminToken,
  getPhotographerPlaces, getPhotographerShoots, createPhotographerShoot
} from '../services/api.js'
import './PhotographerPage.css'

const today=()=>new Date().toISOString().slice(0,10)

export default function PhotographerPage(){
  const [token,setToken]=useState(()=>getAdminToken()||'')
  const [user,setUser]=useState(null)
  const [credentials,setCredentials]=useState({email:'',password:''})
  const [places,setPlaces]=useState([])
  const [shoots,setShoots]=useState([])
  const [form,setForm]=useState({
    capturedOn:today(),
    placeId:'',
    placeName:'',
    driveUrl:'',
    notes:''
  })
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  const uniquePlaces=useMemo(()=>new Set(shoots.map(x=>x.place_name).filter(Boolean)).size,[shoots])

  const loadWorkspace=async()=>{
    setLoading(true);setError('')
    try{
      const [placeRows,shootRows]=await Promise.all([
        getPhotographerPlaces(),
        getPhotographerShoots()
      ])
      setPlaces(placeRows)
      setShoots(shootRows)
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
        setAdminToken(null)
        setToken('')
        setError('Tài khoản này không có quyền vào khu tác nghiệp.')
        return
      }
      setUser(next)
      loadWorkspace()
    }).catch(err=>{
      if(!alive)return
      setAdminToken(null)
      setToken('')
      setError(err.message)
    })
    return()=>{alive=false}
  },[token])

  const login=async event=>{
    event.preventDefault()
    setLoading(true);setError('')
    try{
      const data=await adminLogin(credentials)
      if(!['PHOTOGRAPHER','MODERATOR','ADMIN'].includes(data?.user?.role)){
        throw new Error('Tài khoản này không thuộc đội tác nghiệp.')
      }
      setAdminToken(data.token)
      setToken(data.token)
      setUser(data.user)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const submit=async event=>{
    event.preventDefault()
    setLoading(true);setError('');setMessage('')
    try{
      await createPhotographerShoot(form)
      setForm({
        capturedOn:today(),
        placeId:'',
        placeName:'',
        driveUrl:'',
        notes:''
      })
      setMessage('Đã gửi địa điểm và link Google Drive.')
      await loadWorkspace()
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const logout=()=>{
    setAdminToken(null)
    setToken('')
    setUser(null)
  }

  if(!token||!user) return <main className="photo-workspace-login">
    <form onSubmit={login}>
      <div className="photo-workspace-brand"><Camera/> HALO HOLA</div>
      <span>ĐỘI NHIẾP ẢNH</span>
      <h1>Đăng nhập</h1>
      <p>Gửi nhanh địa điểm chụp và thư mục ảnh Google Drive.</p>
      <input type="email" required placeholder="Email" value={credentials.email} onChange={e=>setCredentials(v=>({...v,email:e.target.value}))}/>
      <input type="password" required placeholder="Mật khẩu" value={credentials.password} onChange={e=>setCredentials(v=>({...v,password:e.target.value}))}/>
      {error&&<div className="photo-workspace-error">{error}</div>}
      <button disabled={loading}><LogIn/>{loading?'Đang đăng nhập...':'Đăng nhập'}</button>
    </form>
  </main>

  return <main className="photo-workspace">
    <header className="photo-workspace-top">
      <div>
        <span>HALO HOLA · ĐỘI NHIẾP ẢNH</span>
        <h1>Gửi ảnh hiện trường</h1>
        <p>Upload ảnh vào Google Drive của đội, sau đó gửi link và địa điểm tại đây.</p>
      </div>
      <div className="photo-workspace-top-actions">
        <button onClick={loadWorkspace}><RefreshCw/> Làm mới</button>
        <button onClick={logout}><LogOut/> Đăng xuất</button>
      </div>
    </header>

    {error&&<div className="photo-workspace-error">{error}</div>}
    {message&&<div className="photo-workspace-success">{message}</div>}

    <section className="photo-workspace-stats">
      <div><FolderOpen/><span><b>{shoots.length}</b> lần đã gửi</span></div>
      <div><MapPin/><span><b>{uniquePlaces}</b> địa điểm</span></div>
    </section>

    <div className="photo-workspace-simple">
      <form className="photo-drive-form" onSubmit={submit}>
        <span>GỬI THƯ MỤC ẢNH</span>
        <h2>Ảnh được chụp ở đâu?</h2>
        <p>Không cần viết câu chuyện. Chỉ cần chọn địa điểm và gửi đúng thư mục Drive chứa ảnh gốc.</p>

        <label>Ngày chụp
          <input type="date" required value={form.capturedOn} onChange={e=>setForm(v=>({...v,capturedOn:e.target.value}))}/>
        </label>

        <label>Điểm HOLA Map
          <select value={form.placeId} onChange={e=>setForm(v=>({...v,placeId:e.target.value,placeName:''}))}>
            <option value="">Chọn từ danh sách</option>
            {places.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        {!form.placeId&&<label>Hoặc nhập địa điểm
          <input required value={form.placeName} onChange={e=>setForm(v=>({...v,placeName:e.target.value}))} placeholder="Ví dụ: Làng cổ Đường Lâm"/>
        </label>}

        <label>Link thư mục Google Drive
          <input type="url" required value={form.driveUrl} onChange={e=>setForm(v=>({...v,driveUrl:e.target.value}))} placeholder="https://drive.google.com/drive/folders/..."/>
        </label>

        <label>Ghi chú <small>(không bắt buộc)</small>
          <textarea rows="3" value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))} placeholder="Ví dụ: ảnh buổi sáng, có thêm flycam..."/>
        </label>

        <button disabled={loading}><Send/> {loading?'Đang gửi...':'Gửi cho HALO HOLA'}</button>
      </form>

      <section className="photo-drive-history">
        <div className="photo-drive-history-head">
          <div><span>ĐÃ GỬI</span><h2>Thư mục của tôi</h2></div>
          <b>{shoots.length}</b>
        </div>

        <div className="photo-drive-list">
          {shoots.map(shoot=><article key={shoot.id}>
            <div className="photo-drive-date"><CalendarDays/><span>{shoot.captured_on?.slice(0,10)}</span></div>
            <div className="photo-drive-place"><MapPin/><div><b>{shoot.place_name}</b>{shoot.notes&&<small>{shoot.notes}</small>}</div></div>
            <a href={shoot.drive_url} target="_blank" rel="noreferrer">Mở Drive <ExternalLink/></a>
          </article>)}
          {!shoots.length&&!loading&&<div className="photo-drive-empty">
            <FolderOpen/>
            <p>Chưa có thư mục nào được gửi.</p>
          </div>}
        </div>
      </section>
    </div>
  </main>
}
