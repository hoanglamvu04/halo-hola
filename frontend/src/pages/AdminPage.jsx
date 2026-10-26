import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Images, Users, Map as MapIcon, CalendarDays, BookOpen, Handshake, Settings,
  LogIn, RefreshCw, ExternalLink, Home, FolderOpen, Globe2,
  Activity, Layers3, Palette, ChevronRight, Camera
} from 'lucide-react'
import HomepageManager from '../components/HomepageManager.jsx'
import ThemeManagementManager from '../components/ThemeManagementManager.jsx'
import ColorManagementManager from '../components/ColorManagementManager.jsx'
import AdminContentManager from '../components/AdminContentManager.jsx'
import MediaLibrary from '../components/MediaLibrary.jsx'
import SiteSettingsManager from '../components/SiteSettingsManager.jsx'
import PublicationManager from '../components/PublicationManager.jsx'
import AnalyticsManager from '../components/AnalyticsManager.jsx'
import AdminOverviewV2 from '../components/AdminOverviewV2.jsx'
import AdminSubmissionOperations from '../components/AdminSubmissionOperations.jsx'
import PhotographerManager from '../components/PhotographerManager.jsx'
import {
  adminLogin, getAdminSubmissions, getAdminToken, setAdminToken,
  updateSubmissionStatus, getOriginalDownload, getAdminTourRegistrations
} from '../services/api.js'

const navGroups=[
  {
    label:'Điều hành',
    primary:true,
    items:[
      {label:'Tổng quan',icon:LayoutDashboard,path:'/admin'},
      {label:'Góc nhìn',icon:Images,path:'/admin/submissions'},
      {label:'Tác giả',icon:Users,path:'/admin/authors'},
      {label:'Công bố',icon:Globe2,path:'/admin/publication'},
      {label:'Đội ảnh',icon:Camera,path:'/admin/photographers'}
    ]
  },
  {
    label:'Nội dung',
    items:[
      {label:'Trang chủ',icon:Home,path:'/admin/homepage'},
      {label:'Chủ đề',icon:Layers3,path:'/admin/themes'},
      {label:'Sắc màu',icon:Palette,path:'/admin/colors'},
      {label:'Media Library',icon:FolderOpen,path:'/admin/media'},
      {label:'Stories',icon:BookOpen,path:'/admin/stories'},
      {label:'Đối tác',icon:Handshake,path:'/admin/partners'}
    ]
  },
  {
    label:'Tuyển chọn',
    items:[
      {label:'TOP52',icon:Images,path:'/admin/top52'}
    ]
  },
  {
    label:'Hệ thống',
    items:[
      {label:'Analytics',icon:Activity,path:'/admin/analytics'},
      {label:'HOLA Map',icon:MapIcon,path:'/admin/map'},
      {label:'HOLA Tour',icon:CalendarDays,path:'/admin/tours'},
      {label:'Cài đặt',icon:Settings,path:'/admin/settings'}
    ]
  }
]
const nav=navGroups.flatMap(group=>group.items)
const sectionDescriptions={
  'Tổng quan':'Ưu tiên công việc, theo dõi hồ sơ và tiến độ chương trình.',
  'Góc nhìn':'Theo dõi trọn luồng Đã nhận → Đủ thông tin → Biên tập → Công bố → HOLA Maps.',
  'Tác giả':'Danh sách người gửi và thông tin liên hệ theo hồ sơ.',
  'Công bố':'Kiểm soát tác phẩm nào được hiển thị ra website công khai.',
  'Đội ảnh':'Cấp tài khoản và nhận địa điểm cùng link Google Drive từ đội nhiếp ảnh.',
  'Trang chủ':'Biên tập các khối nội dung đang xuất hiện trên trang chủ.',
  'Chủ đề':'Quản lý hệ chủ đề của HALO HOLA 2026.',
  'Sắc màu':'Quản lý hệ màu và nội dung kể chuyện theo sắc màu Hòa Lạc.',
  'Media Library':'Quản lý hình ảnh và tài nguyên dùng trên website.',
  'Stories':'Quản lý nội dung Stories.',
  'Đối tác':'Quản lý đối tác và nội dung hợp tác.',
  'TOP52':'Theo dõi danh sách góc nhìn được Ban Biên tập tuyển chọn.',
  'Analytics':'Theo dõi hoạt động và hiệu quả sử dụng website.',
  'HOLA Map':'Quản lý nội dung liên quan tới bản đồ Hòa Lạc.',
  'HOLA Tour':'Quản lý tour và danh sách đăng ký.',
  'Cài đặt':'Thiết lập hệ thống và thông tin website.'
}

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
     const updated=await updateSubmissionStatus(id,status)
     setSubmissions(v=>v.map(x=>x.id===id?{...x,...updated}:x))
     setSelected(v=>v?.id===id?{...v,...updated}:v)
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
     <div className="brand admin-brand">HAL<span>O</span> HOLA</div><small>VẬN HÀNH 2026</small>
     <nav>{navGroups.map(group=>{
       const content=<div className="admin-nav-items">{group.items.map(({label,icon:I,path})=><button className={active===label?'active':''} key={path} onClick={()=>navigate(path)}><I size={18}/>{label}</button>)}</div>
       if(group.primary) return <div className="admin-nav-group" key={group.label}><div className="admin-nav-group-title">{group.label}</div>{content}</div>
       return <details className="admin-nav-group" key={group.label} open={group.items.some(item=>item.label===active)}>
         <summary>{group.label}<ChevronRight/></summary>{content}
       </details>
     })}</nav>
     <button className="admin-logout" onClick={()=>{setAdminToken(null);setToken('')}}>Đăng xuất</button>
   </aside>

   <section className="admin-main">
     <header className="admin-top">
       <div><h1>{active}</h1><p>{sectionDescriptions[active]||'Quản trị và vận hành HALO HOLA 2026.'}</p></div>
       <div>
         <a className="admin-view-site" href="/" target="_blank" rel="noreferrer"><ExternalLink size={15}/> Xem website</a>
         <button className="icon-btn" onClick={load} aria-label="Làm mới dữ liệu"><RefreshCw className={loading?'spin':''}/></button>
         <div className="avatar">HL</div>
       </div>
     </header>

     {error&&<div className="form-error">{error}</div>}

     {active==='Tổng quan'?<AdminOverviewV2
       submissions={submissions}
       uniqueCreators={uniqueCreators}
       loading={loading}
       onNavigate={go}
       onRefresh={load}
       onOpenSubmission={(item)=>{setSelected(item);go('Góc nhìn')}}
     />:
     active==='Trang chủ'?<HomepageManager/>:
     active==='Chủ đề'?<ThemeManagementManager/>:
     active==='Sắc màu'?<ColorManagementManager/>:
     active==='Media Library'?<MediaLibrary/>:
     active==='Stories'?<AdminContentManager type="stories"/>:
     active==='HOLA Map'?<AdminContentManager type="places"/>:
     active==='Đối tác'?<AdminContentManager type="partners"/>:
     active==='Cài đặt'?<SiteSettingsManager/>:
     active==='Analytics'?<AnalyticsManager/>:
     active==='Công bố'?<PublicationManager/>:
     active==='Đội ảnh'?<PhotographerManager/>:
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
       <p className="admin-helper">TOP52 là danh sách góc nhìn được Ban Biên tập tuyển chọn. Việc nội dung có xuất hiện ngoài website hay không được kiểm soát riêng tại <button className="text-button" onClick={()=>go('Công bố')}>Công bố</button>.</p>
       <div className="admin-top52-grid">
         {submissions.filter(s=>s.status==='TOP52'||s.status==='AWARDED').map(a=><button key={a.id} onClick={()=>{setSelected(a);go('Góc nhìn')}}>
           <div>{a.media?.[0]?.url?<img src={a.media[0].url} alt=""/>:<Images/>}</div>
           <b>{a.title||'Tác phẩm chưa đặt tên'}</b><small>{a.display_name||a.name} · {a.code}</small>
         </button>)}
         {!submissions.some(s=>s.status==='TOP52'||s.status==='AWARDED')&&<p>Chưa có góc nhìn TOP52. Hãy tuyển chọn từ danh sách Góc nhìn.</p>}
       </div>
     </div>:
     active==='Tác phẩm'?<AdminSubmissionOperations
       submissions={submissions}
       selected={selected}
       setSelected={setSelected}
       query={query}
       setQuery={setQuery}
       statusFilter={statusFilter}
       setStatusFilter={setStatusFilter}
       loading={loading}
       onLoad={load}
       onSetStatus={setStatus}
       onOpenOriginal={openOriginal}
       onNavigate={go}
       onError={setError}
     />:
     <div className="admin-panel admin-empty"><h2>{active}</h2><p>Module {active} đã có nền tảng UI; sẽ nối dữ liệu thật theo từng giai đoạn vận hành.</p></div>}
   </section>
 </main>
}
