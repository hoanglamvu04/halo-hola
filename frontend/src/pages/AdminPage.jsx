import { useEffect, useState } from 'react'
import { LayoutDashboard, Images, Users, Map, CalendarDays, BookOpen, Handshake, Settings, Search, Bell, CheckCircle2, Clock3, LogIn, RefreshCw } from 'lucide-react'
import { artworks, mapPlaces, tours } from '../data/siteData.js'
import { API_URL, adminLogin, getAdminSubmissions, getAdminToken, setAdminToken, updateSubmissionStatus } from '../services/api.js'
const nav=[['Tổng quan',LayoutDashboard],['Tác phẩm',Images],['Tác giả',Users],['TOP52',Images],['HOLA Map',Map],['HOLA Tour',CalendarDays],['Stories',BookOpen],['Đối tác',Handshake],['Cài đặt',Settings]]
const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']

export default function AdminPage(){
 const [active,setActive]=useState('Tổng quan')
 const [token,setToken]=useState(()=>getAdminToken() || '')
 const [credentials,setCredentials]=useState({email:'',password:''})
 const [submissions,setSubmissions]=useState([])
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')

 const load=async()=>{
   if(!token) return
   setLoading(true); setError('')
   try{
     setSubmissions(await getAdminSubmissions())
   }catch(err){setError(err.message)}
   finally{setLoading(false)}
 }

 useEffect(()=>{ if(token) load() },[token])

 const login=async(e)=>{
   e.preventDefault()
   setError('')
   setLoading(true)
   try{
     const data=await adminLogin(credentials)
     setAdminToken(data.token)
     setToken(data.token)
   }catch(err){setError(err.message)}
   finally{setLoading(false)}
 }

 const updateStatus=async(id,status)=>{
   try{
     await updateSubmissionStatus(id,status)
     setSubmissions(v=>v.map(x=>x.id===id?{...x,status}:x))
   }catch(err){setError(err.message)}
 }

 if(!token) return <main className="admin-login"><form onSubmit={login}><div className="brand admin-login-brand">HAL<span>O</span> HOLA</div><span className="eyebrow">ADMIN 2026</span><h1>Đăng nhập quản trị</h1><p>Dùng tài khoản admin đã tạo bằng npm run db:seed:admin.</p><input type="email" value={credentials.email} onChange={e=>setCredentials(v=>({...v,email:e.target.value}))} placeholder="admin@halohola.vn"/><input type="password" value={credentials.password} onChange={e=>setCredentials(v=>({...v,password:e.target.value}))} placeholder="Mật khẩu"/>{error&&<div className="form-error">{error}</div>}<button className="btn btn-green" disabled={loading}><LogIn size={17}/> {loading?'Đang đăng nhập...':'Vào quản trị'}</button></form></main>

 return <main className="admin-shell"><aside className="admin-sidebar"><div className="brand admin-brand">HAL<span>O</span> HOLA</div><small>ADMIN 2026</small><nav>{nav.map(([n,I])=><button className={active===n?'active':''} key={n} onClick={()=>setActive(n)}><I size={18}/>{n}</button>)}</nav><button className="admin-logout" onClick={()=>{setAdminToken(null);setToken('')}}>Đăng xuất</button></aside><section className="admin-main"><header className="admin-top"><div><h1>{active}</h1><p>Quản trị nội dung và vận hành HALO HOLA.</p></div><div><button className="icon-btn" onClick={()=>load()}><RefreshCw className={loading?'spin':''}/></button><Search/><Bell/><div className="avatar">HL</div></div></header>

 {error&&<div className="form-error">{error}</div>}
 {active==='Tổng quan'?<><div className="admin-stats"><div><span>Tác phẩm đã nhận</span><b>{submissions.length || 428}</b><small>Dữ liệu API / demo</small></div><div><span>Tác giả</span><b>{new Set(submissions.map(x=>x.email)).size || 196}</b><small>Theo email người gửi</small></div><div><span>Địa điểm</span><b>{mapPlaces.length}</b><small>Seed hiện tại</small></div><div><span>Tour</span><b>{tours.length}</b><small>3 hành trình</small></div></div><div className="admin-grid"><div className="admin-panel"><h2>Tác phẩm mới</h2>{(submissions.length?submissions:artworks.slice(0,6)).slice(0,8).map((a,i)=><div className="admin-row" key={a.id || a.slug}><img src={a.media?.[0]?.url ? `${API_URL.replace('/api','')}${a.media[0].url}` : a.image}/><div><b>{a.story?.slice(0,60) || a.title}</b><small>{a.displayName || a.name || a.author}</small></div><span className={`status ${(a.status||'VALID')==='PENDING'?'pending':'approved'}`}>{(a.status||'VALID')==='PENDING'?<Clock3/>:<CheckCircle2/>}{a.status||'Hợp lệ'}</span></div>)}</div><div className="admin-panel"><h2>Tiến độ chiến dịch</h2><div className="progress-item"><span>Landing & form</span><b>100%</b><i style={{width:'100%'}}/></div><div className="progress-item"><span>HOLA Map</span><b>75%</b><i style={{width:'75%'}}/></div><div className="progress-item"><span>TOP52</span><b>45%</b><i style={{width:'45%'}}/></div><div className="progress-item"><span>HOLA DAY</span><b>60%</b><i style={{width:'60%'}}/></div></div></div></>:
 active==='Tác phẩm'?<div className="admin-panel"><div className="admin-panel-head"><h2>Danh sách tác phẩm</h2><span>{submissions.length} hồ sơ</span></div>{submissions.length?submissions.map(a=><div className="submission-admin-row" key={a.id}><div><b>{a.code}</b><small>{a.displayName||a.name} · {a.email}</small></div><div><span>{a.type}</span><small>{a.theme}</small></div><div><span>{a.location}</span><small>{new Date(a.created_at || a.createdAt).toLocaleDateString('vi-VN')}</small></div><select value={a.status} onChange={e=>updateStatus(a.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>):<p>Chưa có hồ sơ trong database.</p>}</div>:
 <div className="admin-panel admin-empty"><h2>{active}</h2><p>Module {active} đã có nền tảng UI. Nội dung chi tiết sẽ đọc/ghi qua API tương ứng.</p></div>}
 </section></main>
}
