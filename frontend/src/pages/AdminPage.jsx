import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Images, Users, Map as MapIcon, CalendarDays, BookOpen, Handshake, Settings,
  Search, Bell, CheckCircle2, Clock3, LogIn, RefreshCw, Download, ShieldCheck,
  AlertTriangle, ExternalLink, Star, Home, FolderOpen
} from 'lucide-react'
import { artworks } from '../data/siteData.js'
import HomepageManager from '../components/HomepageManager.jsx'
import AdminContentManager from '../components/AdminContentManager.jsx'
import MediaLibrary from '../components/MediaLibrary.jsx'
import SiteSettingsManager from '../components/SiteSettingsManager.jsx'
import JuryBoardManager from '../components/JuryBoardManager.jsx'
import {
  adminLogin, getAdminSubmissions, getAdminToken, setAdminToken,
  updateSubmissionStatus, getOriginalDownload, getAdminTourRegistrations
} from '../services/api.js'

const nav=[
  {label:'Tổng quan',icon:LayoutDashboard,path:'/admin'},
  {label:'Trang chủ',icon:Home,path:'/admin/homepage'},
  {label:'Media Library',icon:FolderOpen,path:'/admin/media'},
  {label:'Tác phẩm',icon:Images,path:'/admin/submissions'},
  {label:'Tác giả',icon:Users,path:'/admin/authors'},
  {label:'TOP52',icon:Images,path:'/admin/top52'},
  {label:'Hội đồng BGK',icon:ShieldCheck,path:'/admin/jury-board'},
  {label:'HOLA Map',icon:MapIcon,path:'/admin/map'},
  {label:'HOLA Tour',icon:CalendarDays,path:'/admin/tours'},
  {label:'Stories',icon:BookOpen,path:'/admin/stories'},
  {label:'Đối tác',icon:Handshake,path:'/admin/partners'},
  {label:'Cài đặt',icon:Settings,path:'/admin/settings'}
]
const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']
const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải',REJECTED:'Không hợp lệ'}

export default function AdminPage(){
 const location=useLocation()
 const navigate=useNavigate()
 const active=useMemo(()=>{
   const current=nav.find(item=>item.path==='/admin'
     ? location.pathname==='/admin' || location.pathname==='/admin/'
     : location.pathname===item.path || location.pathname.startsWith(item.path+'/'))
   return current?.label || 'Tổng quan'
 },[location.pathname])

 const [token,setToken]=useState(()=>getAdminToken() || '')
 const [credentials,setCredentials]=useState({email:'',password:''})
 const [submissions,setSubmissions]=useState([])
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [statusFilter,setStatusFilter]=useState('')
 const [query,setQuery]=useState('')
 const [selected,setSelected]=useState(null)
 const [tourRegistrations,setTourRegistrations]=useState([])

 const go=(label)=>{
   const item=nav.find(x=>x.label===label)
   if(item) navigate(item.path)
 }

 const load=async()=>{
   if(!token) return
   setLoading(true); setError('')
   try{
     const data=await getAdminSubmissions({status:statusFilter||undefined,q:query||undefined})
     setSubmissions(data)
     if(selected){
       const next=data.find(x=>x.id===selected.id)
       setSelected(next||null)
     }
   }catch(err){setError(err.message)}
   finally{setLoading(false)}
 }

 useEffect(()=>{ if(token) load() },[token,statusFilter])
 useEffect(()=>{
   if(token&&active==='HOLA Tour'){
     getAdminTourRegistrations().then(setTourRegistrations).catch(err=>setError(err.message))
   }
 },[token,active])

 const login=async(e)=>{
   e.preventDefault()
   setError('');setLoading(true)
   try{
     const data=await adminLogin(credentials)
     setAdminToken(data.token);setToken(data.token)
   }catch(err){setError(err.message)}
   finally{setLoading(false)}
 }

 const setStatus=async(id,status)=>{
   try{
     await updateSubmissionStatus(id,status)
     setSubmissions(v=>v.map(x=>x.id===id?{...x,status}:x))
     setSelected(v=>v?.id===id?{...v,status}:v)
   }catch(err){setError(err.message)}
 }

 const openOriginal=async(mediaId)=>{
   try{
     const data=await getOriginalDownload(mediaId)
     window.open(data.url,'_blank','noopener,noreferrer')
   }catch(err){setError(err.message)}
 }

 const uniqueCreators=useMemo(()=>new Set(submissions.map(x=>x.email)).size,[submissions])
 const authors=useMemo(()=>Array.from(new globalThis.Map(submissions.map(s=>[s.email,s])).values()),[submissions])
 const totalBytes=useMemo(()=>submissions.reduce((sum,s)=>sum+(s.media||[]).reduce((a,m)=>a+Number(m.size||0),0),0),[submissions])
 const pendingCount=submissions.filter(x=>x.status==='PENDING').length
 const shortlistCount=submissions.filter(x=>x.status==='SHORTLIST').length

 if(!token) return <main className="admin-login"><form onSubmit={login}>
   <div className="brand admin-login-brand">HAL<span>O</span> HOLA</div>
   <span className="eyebrow">ADMIN 2026</span><h1>Đăng nhập quản trị</h1>
   <p>Dùng tài khoản admin đã tạo bằng lệnh seed.</p>
   <input type="email" value={credentials.email} onChange={e=>setCredentials(v=>({...v,email:e.target.value}))} placeholder="admin@halohola.vn"/>
   <input type="password" value={credentials.password} onChange={e=>setCredentials(v=>({...v,password:e.target.value}))} placeholder="Mật khẩu"/>
   {error&&<div className="form-error">{error}</div>}
   <button className="btn btn-green" disabled={loading}><LogIn size={17}/> {loading?'Đang đăng nhập...':'Vào quản trị'}</button>
 </form></main>

 return <main className="admin-shell">
   <aside className="admin-sidebar">
     <div className="brand admin-brand">HAL<span>O</span> HOLA</div><small>ADMIN 2026</small>
     <nav>{nav.map(({label,icon:I,path})=><button className={active===label?'active':''} key={path} onClick={()=>navigate(path)}><I size={18}/>{label}</button>)}</nav>
     <Link className="admin-jury-link" to="/jury"><Star size={17}/> Jury Mode</Link>
     <button className="admin-logout" onClick={()=>{setAdminToken(null);setToken('')}}>Đăng xuất</button>
   </aside>

   <section className="admin-main">
     <header className="admin-top">
       <div><h1>{active}</h1><p>Quản trị tác phẩm, file gốc và vận hành HALO HOLA.</p></div>
       <div><button className="icon-btn" onClick={load}><RefreshCw className={loading?'spin':''}/></button><Bell/><div className="avatar">HL</div></div>
     </header>

     {error&&<div className="form-error">{error}</div>}

     {active==='Tổng quan'?<>
       <div className="admin-stats">
         <div><span>Tác phẩm</span><b>{submissions.length}</b><small>{pendingCount} đang chờ kiểm tra</small></div>
         <div><span>Tác giả</span><b>{uniqueCreators}</b><small>Theo email người gửi</small></div>
         <div><span>Shortlist</span><b>{shortlistCount}</b><small>Sẵn sàng cho Jury Mode</small></div>
         <div><span>Original Vault</span><b>{(totalBytes/1024/1024/1024).toFixed(2)} GB</b><small>Tổng file trong danh sách hiện tại</small></div>
       </div>
       <div className="admin-grid">
         <div className="admin-panel">
           <div className="admin-panel-head"><h2>Tác phẩm mới</h2><button className="text-button" onClick={()=>go('Tác phẩm')}>Xem tất cả</button></div>
           {(submissions.length?submissions:artworks.slice(0,6)).slice(0,8).map((a)=><button className="admin-row admin-row-button" key={a.id||a.slug} onClick={()=>{if(a.id){setSelected(a);go('Tác phẩm')}}}>
             <div className="admin-row-thumb">{a.media?.length?<ShieldCheck/>:<Images/>}</div>
             <div><b>{a.title||'Tác phẩm chưa đặt tên'}</b><small>{a.display_name||a.name||a.author} · {a.code||''}</small></div>
             <span className={'status '+((a.status||'VALID')==='PENDING'?'pending':'approved')}>{(a.status||'VALID')==='PENDING'?<Clock3/>:<CheckCircle2/>}{statusLabels[a.status]||a.status||'Hợp lệ'}</span>
           </button>)}
         </div>
         <div className="admin-panel">
           <h2>Kiểm tra vận hành</h2>
           <div className="ops-check good"><ShieldCheck/><div><b>Original Vault</b><small>R2 + SHA-256</small></div></div>
           <div className="ops-check good"><CheckCircle2/><div><b>Submission Lookup</b><small>Mã tác phẩm + email</small></div></div>
           <div className="ops-check"><AlertTriangle/><div><b>Email Notification</b><small>Chưa cấu hình SMTP</small></div></div>
           <div className="progress-item"><span>HOLA Map API</span><b>Chờ kết nối</b><i style={{width:'45%'}}/></div>
         </div>
       </div>
     </>:
     active==='Trang chủ'?<HomepageManager/>:
     active==='Media Library'?<MediaLibrary/>:
     active==='Stories'?<AdminContentManager type="stories"/>:
     active==='HOLA Map'?<AdminContentManager type="places"/>:
     active==='Đối tác'?<AdminContentManager type="partners"/>:
     active==='Cài đặt'?<SiteSettingsManager/>:
     active==='Hội đồng BGK'?<JuryBoardManager/>:
     active==='HOLA Tour'?<div className="admin-cms-stack">
       <AdminContentManager type="tours"/>
       <div className="admin-panel"><div className="admin-panel-head"><h2>Đăng ký HOLA Tour</h2><span>{tourRegistrations.length} đăng ký</span></div><div className="tour-admin-list">{tourRegistrations.length?tourRegistrations.map(r=><div key={r.id}><div><b>{r.code} · Tour #{r.tour_number}</b><small>{r.name} · {r.email} · {r.phone}</small></div><div><span>{r.role_label||'Chưa chọn vai trò'}</span><small>{r.equipment||'Không ghi thiết bị'}</small></div><b className="status approved">{r.status}</b></div>):<p>Chưa có đăng ký tour.</p>}</div></div>
     </div>:
     active==='Tác giả'?<div className="admin-panel">
       <div className="admin-panel-head"><h2>Tác giả / người gửi</h2><span>{uniqueCreators} người</span></div>
       <div className="admin-author-grid">
         {authors.map(author=><div key={author.email}>
           <span className="avatar">{(author.display_name||author.name||author.email)?.charAt(0)?.toUpperCase()}</span>
           <div><b>{author.display_name||author.name||'Chưa có tên'}</b><small>{author.email}</small><small>{author.phone||'Chưa có số điện thoại'}</small></div>
           <span>{submissions.filter(s=>s.email===author.email).length} tác phẩm</span>
         </div>)}
         {!submissions.length&&<p>Chưa có dữ liệu tác giả.</p>}
       </div>
     </div>:
     active==='TOP52'?<div className="admin-panel">
       <div className="admin-panel-head"><h2>TOP52</h2><span>{submissions.filter(s=>s.status==='TOP52'||s.status==='AWARDED').length} tác phẩm</span></div>
       <div className="admin-top52-grid">
         {submissions.filter(s=>s.status==='TOP52'||s.status==='AWARDED').map(a=><button key={a.id} onClick={()=>{setSelected(a);go('Tác phẩm')}}>
           <div>{a.media?.[0]?.url?<img src={a.media[0].url} alt=""/>:<Images/>}</div>
           <b>{a.title||'Tác phẩm chưa đặt tên'}</b><small>{a.display_name||a.name} · {a.code}</small>
         </button>)}
         {!submissions.some(s=>s.status==='TOP52'||s.status==='AWARDED')&&<p>Chưa có tác phẩm TOP52. Đổi trạng thái tác phẩm sang TOP52 để hiển thị tại đây.</p>}
       </div>
     </div>:
     active==='Tác phẩm'?<div className="admin-workspace">
       <div className="admin-panel submissions-panel">
         <div className="admin-toolbar">
           <div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Mã, tên tác phẩm, tác giả, email..."/></div>
           <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">Tất cả trạng thái</option>{statuses.map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select>
           <button className="btn btn-outline btn-sm" onClick={load}>Lọc</button>
         </div>
         <div className="submission-table-head"><span>Tác phẩm</span><span>File gốc</span><span>Địa điểm</span><span>Trạng thái</span></div>
         {submissions.length?submissions.map(a=><button className={'submission-admin-row '+(selected?.id===a.id?'selected':'')} key={a.id} onClick={()=>setSelected(a)}>
           <div><b>{a.code} · {a.title||'Chưa đặt tên'}</b><small>{a.display_name||a.name} · {a.email}</small></div>
           <div><span>{a.media?.length||0} file</span><small>{a.media?.every(m=>m.provider==='R2')?'R2 Original':'Local/legacy'}</small></div>
           <div><span>{a.location}</span><small>{new Date(a.created_at||a.createdAt).toLocaleDateString('vi-VN')}</small></div>
           <select value={a.status} onClick={e=>e.stopPropagation()} onChange={e=>setStatus(a.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select>
         </button>):<p>Chưa có hồ sơ phù hợp.</p>}
       </div>

       <aside className="admin-detail">
         {!selected?<div className="admin-detail-empty"><Images/><h3>Chọn một tác phẩm</h3><p>Metadata, quyền sử dụng và file original sẽ hiện tại đây.</p></div>:<>
           <span className="eyebrow">{selected.code}</span><h2>{selected.title||'Tác phẩm chưa đặt tên'}</h2>
           <p className="admin-detail-author">{selected.display_name||selected.name} · {selected.email}</p>
           <div className="chip-wrap"><span>{selected.type}</span><span>{selected.theme}</span><span>{selected.color}</span></div>
           <div className="admin-rights">
             <div className={selected.rights_confirmed?'ok':'warn'}>{selected.rights_confirmed?<CheckCircle2/>:<AlertTriangle/>}<span>Quyền tác giả</span></div>
             <div className={selected.image_consent_confirmed?'ok':'warn'}>{selected.image_consent_confirmed?<CheckCircle2/>:<AlertTriangle/>}<span>Quyền hình ảnh</span></div>
             <div className={!selected.is_minor||selected.guardian_consent?'ok':'warn'}>{!selected.is_minor||selected.guardian_consent?<CheckCircle2/>:<AlertTriangle/>}<span>Guardian consent</span></div>
           </div>
           <h3>Original Vault</h3>
           <div className="media-vault-list">{(selected.media||[]).map(m=><div key={m.id}><div><b>{m.originalName}</b><small>{(Number(m.size||0)/1024/1024).toFixed(2)} MB · {m.provider} · v{m.revision||1}</small><code>SHA256 {m.sha256||'legacy'}</code></div><button onClick={()=>openOriginal(m.id)} title="Tải file gốc"><Download/></button></div>)}</div>
           {selected.external_link&&<a href={selected.external_link} target="_blank" rel="noreferrer" className="btn btn-outline"><ExternalLink size={16}/> Mở link tác phẩm</a>}
           <h3>Câu chuyện</h3><p className="admin-story">{selected.story}</p>
         </>}
       </aside>
     </div>:
     <div className="admin-panel admin-empty"><h2>{active}</h2><p>Module {active} đã có nền tảng UI; sẽ nối dữ liệu thật theo từng giai đoạn vận hành.</p></div>}
   </section>
 </main>
}
