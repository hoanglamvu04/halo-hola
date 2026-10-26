import { useEffect, useState } from 'react'
import { PlugZap, Save, RefreshCw, RotateCcw, ShieldCheck, Mail, MapPinned, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react'
import { getAdminConnections, updateAdminConnection, resetAdminConnection, testAdminSmtp } from '../services/api.js'
import './AdminConnectionsManager.css'

const META={
  smtp:{title:'Email / SMTP',icon:Mail,description:'Gửi OTP đăng nhập, biên nhận và thông báo trạng thái góc nhìn.'},
  hola_maps:{title:'HOLA Maps',icon:MapPinned,description:'Đồng bộ các góc nhìn đã được duyệt và công bố sang bản đồ.'},
  r2:{title:'Cloudflare R2',icon:HardDrive,description:'Lưu ảnh và tệp gốc của cộng đồng, Media Library.'}
}
const SCHEMA={
  smtp:[
    ['host','Máy chủ SMTP','text','smtp.example.com'],['port','Cổng SMTP','number','587'],
    ['secure','SSL trực tiếp (thường cổng 465)','checkbox'],
    ['user','Tên đăng nhập SMTP','text','email@example.com'],
    ['password','Mật khẩu ứng dụng','password','Để trống để giữ mật khẩu hiện tại'],
    ['fromName','Tên người gửi','text','HALO HOLA'],['fromAddress','Email người gửi','email','noreply@example.com']
  ],
  hola_maps:[
    ['baseUrl','URL máy chủ HOLA Maps','url','https://maps.dothihoalac.vn'],
    ['secret','Secret đồng bộ','password','Để trống để giữ khóa hiện tại'],
    ['timeoutMs','Timeout (ms)','number','8000']
  ],
  r2:[
    ['endpoint','R2 S3 endpoint','url','https://ACCOUNT_ID.r2.cloudflarestorage.com'],
    ['accessKeyId','R2 Access Key ID','password','Để trống để giữ khóa hiện tại'],
    ['secretAccessKey','R2 Secret Access Key','password','Để trống để giữ khóa hiện tại'],
    ['bucketOriginals','Bucket file gốc','text','halo-hola-originals'],
    ['bucketPublic','Bucket media','text','halo-hola-public']
  ]
}

export default function AdminConnectionsManager(){
  const [items,setItems]=useState([])
  const [active,setActive]=useState('smtp')
  const [draft,setDraft]=useState(null)
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState('')
  const [message,setMessage]=useState(null)
  const selected=items.find(item=>item.key===active)
  const load=async()=>{
    setLoading(true)
    try{
      const result=await getAdminConnections()
      setItems(result.items||[])
      setMessage(null)
    }catch(err){setMessage({ok:false,text:err.message})}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[])
  useEffect(()=>{
    if(!selected)return
    const secrets=Object.fromEntries(Object.keys(selected.secrets||{}).map(field=>[field,'']))
    setDraft({...selected.config,...secrets,enabled:selected.enabled})
  },[selected])

  const patch=(name,value)=>setDraft(previous=>({...previous,[name]:value}))
  const save=async()=>{
    if(!draft)return
    setBusy('save');setMessage(null)
    try{
      const payload={...draft}
      for(const field of Object.keys(selected.secrets||{})){
        if(!payload[field])delete payload[field]
      }
      // Backend schema expects secret string fields even when unchanged.
      for(const field of Object.keys(selected.secrets||{}))payload[field]=draft[field]||''
      const result=await updateAdminConnection(active,payload)
      setItems(previous=>previous.map(item=>item.key===active?result:item))
      setMessage({ok:true,text:'Đã lưu kết nối. Cấu hình mới được áp dụng ngay trên API.'})
    }catch(err){setMessage({ok:false,text:err.message})}
    finally{setBusy('')}
  }
  const reset=async()=>{
    if(!window.confirm('Khôi phục cấu hình .env cho kết nối này?'))return
    setBusy('reset');setMessage(null)
    try{
      const result=await resetAdminConnection(active)
      setItems(previous=>previous.map(item=>item.key===active?result:item))
      setMessage({ok:true,text:'Đã chuyển về cấu hình .env.'})
    }catch(err){setMessage({ok:false,text:err.message})}
    finally{setBusy('')}
  }
  const verify=async()=>{
    setBusy('test');setMessage(null)
    try{
      const result=await testAdminSmtp()
      setMessage({ok:result.ok,text:result.message})
    }catch(err){setMessage({ok:false,text:err.message})}
    finally{setBusy('')}
  }

  return <div className="connection-admin">
    <div className="connection-intro">
      <div><span className="eyebrow">SYSTEM INTEGRATIONS</span><h2><PlugZap size={25}/> Quản lý kết nối</h2><p>Lưu thông tin kết nối trong cơ sở dữ liệu thay vì thay đổi file .env. Chỉ ADMIN có quyền truy cập.</p></div>
      <button className="connection-ghost" onClick={load} disabled={loading||Boolean(busy)}><RefreshCw size={16}/> Làm mới</button>
    </div>
    <div className="connection-layout">
      <nav className="connection-services" aria-label="Các dịch vụ kết nối">
        {Object.entries(META).map(([key,meta])=>{
          const Icon=meta.icon
          const item=items.find(value=>value.key===key)
          return <button type="button" key={key} className={active===key?'selected':''} onClick={()=>{setActive(key);setMessage(null)}}>
            <Icon size={20}/><span><b>{meta.title}</b><small>{item?.configured?'Đã cấu hình':item?.enabled===false?'Đang tắt':'Chưa sẵn sàng'}</small></span>
            <span className={'connection-dot '+(item?.configured?'online':'')} aria-hidden="true"/>
          </button>
        })}
      </nav>
      <section className="connection-detail">
        {loading&&!items.length?<p>Đang tải các kết nối...</p>:selected&&draft?<>
          <div className="connection-detail-head">
            <div><h3>{META[active].title}</h3><p>{META[active].description}</p></div>
            <span className={'connection-status '+(selected.configured?'active':'inactive')}>
              {selected.configured?<CheckCircle2 size={15}/>:<AlertTriangle size={15}/>}
              {selected.configured?'Đã cấu hình':'Chưa sẵn sàng'}
            </span>
          </div>
          <p className="connection-source">Nguồn thiết lập: <b>{selected.source==='admin'?'Admin / PostgreSQL':'.env / biến môi trường'}</b></p>
          <label className="connection-enable">
            <input type="checkbox" checked={draft.enabled!==false} onChange={e=>patch('enabled',e.target.checked)}/>
            <span><b>Bật kết nối</b><small>Có thể tạm tắt dịch vụ mà không xóa thông tin cấu hình.</small></span>
          </label>
          <div className="connection-fields">
            {SCHEMA[active].map(([field,label,type,placeholder])=><label key={field} className={type==='checkbox'?'connection-check':''}>
              {type==='checkbox'?<><input type="checkbox" checked={Boolean(draft[field])} onChange={e=>patch(field,e.target.checked)}/><span>{label}</span></>:
                <><span>{label}{type==='password'&&selected.secrets[field]&&<small> · Đã lưu an toàn</small>}</span>
                  <input type={type} value={draft[field]??''} placeholder={placeholder||''}
                    autoComplete={type==='password'?'new-password':'off'}
                    onChange={e=>patch(field,type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value)}/></>}
            </label>)}
          </div>
          <div className="connection-security"><ShieldCheck size={19}/><span>Khóa bí mật được mã hóa trên server. Sau khi lưu, hệ thống không gửi lại giá trị mật khẩu hoặc access key về trình duyệt.</span></div>
          {message&&<p role="status" className={'connection-message '+(message.ok?'success':'error')}>{message.text}</p>}
          <div className="connection-actions">
            <button className="btn btn-green" onClick={save} disabled={Boolean(busy)}><Save size={16}/>{busy==='save'?'Đang lưu...':'Lưu kết nối'}</button>
            {active==='smtp'&&<button className="connection-ghost" onClick={verify} disabled={Boolean(busy)||!selected.configured}><PlugZap size={16}/>{busy==='test'?'Đang kiểm tra...':'Kiểm tra SMTP'}</button>}
            {selected.source==='admin'&&<button className="connection-ghost connection-reset" onClick={reset} disabled={Boolean(busy)}><RotateCcw size={16}/> Dùng lại .env</button>}
          </div>
          <p className="connection-note">{active==='smtp'?'Kiểm tra SMTP xác thực máy chủ nhưng không gửi email thử. Hãy lưu cấu hình trước khi kiểm tra.':active==='hola_maps'?'Thay đổi được áp dụng cho các lượt đồng bộ tiếp theo. Không phát sinh bài đăng thử.':'Bucket và khóa mới áp dụng cho lần tải tệp tiếp theo. Các file đã lưu vẫn giữ bucket ban đầu.'}</p>
        </>:!loading&&<p>Không lấy được dữ liệu kết nối. Vui lòng thử lại.</p>}
      </section>
    </div>
  </div>
}
