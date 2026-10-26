import { useEffect, useState } from 'react'
import { PlugZap, Save, Send, RefreshCw, RotateCcw, ShieldCheck, Mail, MapPinned, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react'
import { getAdminConnections, updateAdminConnection, resetAdminConnection, testAdminSmtp, sendAdminSmtpTestEmail } from '../services/api.js'
import './AdminConnectionsManager.css'

const META={
  smtp:{title:'Email / SMTP',icon:Mail,description:'Gửi mã xác minh email, đặt lại mật khẩu và thông báo góc nhìn.'},
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
  const [smtpVerified,setSmtpVerified]=useState(null)
  const [loadError,setLoadError]=useState(null)
  const selected=items.find(item=>item.key===active)
  const isGmail=active==='smtp'&&String(draft?.host||'').trim().toLowerCase()==='smtp.gmail.com'
  const smtpPort=Number(draft?.port)
  const gmailIssue=isGmail && ((smtpPort!==465&&smtpPort!==587)||(smtpPort===465&&!draft?.secure)||(smtpPort===587&&draft?.secure))
  const load=async()=>{
    setLoading(true)
    setLoadError(null)
    setSmtpVerified(null)
    try{
      const result=await getAdminConnections()
      setItems(result.items||[])
      setMessage(null)
    }catch(err){
      setItems([])
      setDraft(null)
      const help=err.status===401
        ? 'Phiên đăng nhập đã hết hạn. Hãy đăng xuất rồi đăng nhập lại.'
        : err.status===403
          ? 'Tài khoản hiện tại không có quyền ADMIN. Vui lòng sử dụng tài khoản quản trị cấp ADMIN.'
          : err.status===404
            ? 'Backend chưa có API quản lý kết nối. Cần triển khai phiên bản backend mới.'
            : err.status===500
              ? 'Backend xảy ra lỗi. Kiểm tra log API và migration integration_connections trên VPS.'
              : err.message
      setLoadError({status:err.status,help})
    }finally{setLoading(false)}
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
    setBusy('save');setMessage(null);setSmtpVerified(null)
    try{
      const payload={...draft}
      for(const field of Object.keys(selected.secrets||{})){
        if(!payload[field])delete payload[field]
      }
      // Backend schema expects secret string fields even when unchanged.
      for(const field of Object.keys(selected.secrets||{}))payload[field]=draft[field]||''
      const result=await updateAdminConnection(active,payload)
      setItems(previous=>previous.map(item=>item.key===active?result:item))
      setMessage({ok:true,text:'Đã lưu cấu hình. Hãy bấm “Kiểm tra SMTP” để xác nhận kết nối thực tế.'})
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
    setBusy('test');setMessage(null);setSmtpVerified(null)
    try{
      const result=await testAdminSmtp()
      setSmtpVerified(Boolean(result.ok))
      setMessage({ok:result.ok,text:result.message})
    }catch(err){setMessage({ok:false,text:err.message})}
    finally{setBusy('')}
  }

  const sendTest=async()=>{
    setBusy('send-test');setMessage(null)
    try{
      const result=await sendAdminSmtpTestEmail()
      setSmtpVerified(Boolean(result.ok))
      setMessage({ok:result.ok,text:result.message})
    }catch(err){setSmtpVerified(false);setMessage({ok:false,text:err.message})}
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
          return <button type="button" key={key} className={active===key?'selected':''} onClick={()=>{setActive(key);setDraft(null);setMessage(null);setSmtpVerified(null)}}>
            <Icon size={20}/><span><b>{meta.title}</b><small>{!item?'Chưa tải dữ liệu':item.enabled===false?'Đang tắt':item.configured?'Đã nhập cấu hình':'Chưa sẵn sàng'}</small></span>
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
              {active==='smtp'&&smtpVerified===true?'SMTP đã xác thực':selected.configured?'Đã nhập cấu hình':'Chưa sẵn sàng'}
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
          {isGmail&&<div className={'connection-smtp-guidance '+(gmailIssue?'warning':'')} role={gmailIssue?'alert':'note'}>
            {gmailIssue?<AlertTriangle size={19}/>:<CheckCircle2 size={19}/>}
            <div><b>{gmailIssue?'Cấu hình cổng Gmail chưa đúng':'Định dạng cổng Gmail hợp lệ'}</b>
              <p>Gmail dùng cổng <strong>465 + SSL trực tiếp bật</strong> hoặc <strong>587 + SSL trực tiếp tắt</strong>. {gmailIssue?'Hãy sửa và lưu lại trước khi kiểm tra.':'Để xác minh tài khoản SMTP, bấm Kiểm tra SMTP.'}</p>
            </div>
            {gmailIssue&&<button type="button" className="connection-ghost" onClick={()=>setDraft(v=>({...v,port:465,secure:true}))}>Dùng 465 + SSL</button>}
          </div>}
          <div className="connection-security"><ShieldCheck size={19}/><span>Khóa bí mật được mã hóa trên server. Sau khi lưu, hệ thống không gửi lại giá trị mật khẩu hoặc access key về trình duyệt.</span></div>
          {message&&<p role="status" className={'connection-message '+(message.ok?'success':'error')}>{message.text}</p>}
          <div className="connection-actions">
            <button className="btn btn-green" onClick={save} disabled={Boolean(busy)}><Save size={16}/>{busy==='save'?'Đang lưu...':'Lưu kết nối'}</button>
            {active==='smtp'&&<button className="connection-ghost" onClick={verify} disabled={Boolean(busy)||!selected.configured}><PlugZap size={16}/>{busy==='test'?'Đang kiểm tra...':'Kiểm tra SMTP'}</button>}
            {active==='smtp'&&<button className="connection-ghost" onClick={sendTest} disabled={Boolean(busy)||!selected.configured}><Send size={16}/>{busy==='send-test'?'Đang gửi email...':'Gửi email thử'}</button>}
            {selected.source==='admin'&&<button className="connection-ghost connection-reset" onClick={reset} disabled={Boolean(busy)}><RotateCcw size={16}/> Dùng lại .env</button>}
          </div>
          <p className="connection-note">{active==='smtp'?'Kiểm tra SMTP chỉ xác thực kết nối. Nút Gửi email thử sẽ gửi đến địa chỉ người gửi đã lưu để xác nhận khả năng gửi thực tế.':active==='hola_maps'?'Thay đổi được áp dụng cho các lượt đồng bộ tiếp theo. Không phát sinh bài đăng thử.':'Bucket và khóa mới áp dụng cho lần tải tệp tiếp theo. Các file đã lưu vẫn giữ bucket ban đầu.'}</p>
        </>:!loading&&loadError?<div className="connection-load-error" role="alert"><AlertTriangle size={22}/><div><h3>Không tải được cấu hình kết nối{loadError.status?` (HTTP ${loadError.status})`:''}</h3><p>{loadError.help}</p><button type="button" className="connection-ghost" onClick={load}><RefreshCw size={16}/> Thử tải lại</button></div></div>:!loading&&<p>Không có dữ liệu kết nối. Bấm Làm mới để thử lại.</p>}
      </section>
    </div>
  </div>
}
