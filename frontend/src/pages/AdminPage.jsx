import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Images, Users, Map, CalendarDays, BookOpen, Handshake, Settings,
  Search, Bell, CheckCircle2, Clock3, LogIn, RefreshCw, Download, ShieldCheck,
  AlertTriangle, ExternalLink, Star, Home
} from 'lucide-react'
import { artworks, mapPlaces, tours } from '../data/siteData.js'
import HomepageManager from '../components/HomepageManager.jsx'
import {
  adminLogin, getAdminSubmissions, getAdminToken, setAdminToken,
  updateSubmissionStatus, getOriginalDownload, getAdminTourRegistrations
} from '../services/api.js'

const nav=[
  ['Tổng quan',LayoutDashboard],['Trang chủ',Home],['Tác phẩm',Images],['Tác giả',Users],['TOP52',Images],
  ['HOLA Map',Map],['HOLA Tour',CalendarDays],['Stories',BookOpen],['Đối tác',Handshake],['Cài đặt',Settings]
]
const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']
const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải',REJECTED:'Không hợp lệ'}

export default function AdminPage(){
 const [active,setActive]=useState('Tổng quan')
 const [token,setToken]=useState(()=>getAdminToken() || '')
 const [credentials,setCredentials]=useState({email:'',password:''})
 const [submissions,setSubmissions]=useState([])
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [statusFilter,setStatusFilter]=useState('')
 const [query,setQuery]=useState('')
 const [selected,setSelected]=useState(null)
 const [tourRegistrations,setTourRegistrations]=useState([])

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
 useEffect(()=>{ if(token&&active==='HOLA Tour') getAdminTourRegistrations().then(setTourRegistrations).catch(err=>setError(err.message)) },[token,active])

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
     <nav>{nav.map(([n,I])=><button className={active===n?'active':''} key={n} onClick={()=>setActive(n)}><I size={18}/>{n}</button>)}</nav>
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
           <div className="admin-panel-head"><h2>Tác phẩm mới</h2><button className="text-button" onClick={()=>setActive('Tác phẩm')}>Xem tất cả</button></div>
           {(submissions.length?submissions:artworks.slice(0,6)).slice(0,8).map((a)=><button className="admin-row admin-row-button" key={a.id||a.slug} onClick={()=>a.id&&setSelected(a)}>
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
     active==='HOLA Tour'?<div className="admin-panel"><div className="admin-panel-head"><h2>Đăng ký HOLA Tour</h2><span>{tourRegistrations.length} đăng ký</span></div><div className="tour-admin-list">{tourRegistrations.length?tourRegistrations.map(r=><div key={r.id}><div><b>{r.code} · Tour #{r.tour_number}</b><small>{r.name} · {r.email} · {r.phone}</small></div><div><span>{r.role_label||'Chưa chọn vai trò'}</span><small>{r.equipment||'Không ghi thiết bị'}</small></div><b className="status approved">{r.status}</b></div>):<p>Chưa có đăng ký tour.</p>}</div></div>:
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
