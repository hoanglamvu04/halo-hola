import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Eye, EyeOff, History, Search, Send, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getAdminPublicationOverview,getAdminPublicationItems,setAdminPublication,
  bulkSetAdminPublication,getAdminPublicationAudit
} from '../services/api.js'
import './PublicationManager.css'

const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải',REJECTED:'Không hợp lệ'}
const stateLabels={HIDDEN:'Đang ẩn',PUBLISHED:'Đã công bố',SCHEDULED:'Đã hẹn giờ'}
const actionLabels={PUBLISH:'Công bố',HIDE:'Ẩn',SCHEDULE:'Hẹn giờ'}

function fmt(value){if(!value)return '—';try{return new Date(value).toLocaleString('vi-VN')}catch{return '—'}}
function stateOf(item){if(item.publicNow)return 'PUBLIC_NOW';return item.publicationState||'HIDDEN'}

export default function PublicationManager(){
  const [overview,setOverview]=useState({})
  const [items,setItems]=useState([])
  const [audit,setAudit]=useState([])
  const [filters,setFilters]=useState({q:'',status:'',publicationState:'',eligibleOnly:'true'})
  const [selected,setSelected]=useState([])
  const [scheduledAt,setScheduledAt]=useState('')
  const [reason,setReason]=useState('')
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState('')
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  const load=async(next=filters)=>{
    setLoading(true);setError('')
    try{
      const [ov,list,logs]=await Promise.all([
        getAdminPublicationOverview(),getAdminPublicationItems({...next,limit:300}),getAdminPublicationAudit({limit:80})
      ])
      setOverview(ov||{});setItems(Array.isArray(list)?list:[]);setAudit(Array.isArray(logs)?logs:[])
      setSelected(current=>current.filter(id=>(list||[]).some(x=>x.id===id)))
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  useEffect(()=>{load()},[])

  const applyFilters=(patch={})=>{const next={...filters,...patch};setFilters(next);load(next)}
  const eligibleIds=useMemo(()=>items.filter(x=>x.eligible).map(x=>x.id),[items])
  const allSelected=eligibleIds.length>0&&eligibleIds.every(id=>selected.includes(id))
  const toggle=id=>setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])
  const toggleAll=()=>setSelected(allSelected?[]:eligibleIds)

  const run=async(key,fn,success)=>{
    setBusy(key);setError('');setMessage('')
    try{await fn();setMessage(success);await load()}catch(err){setError(err.message)}finally{setBusy('')}
  }
  const payload=action=>({action,scheduledAt:action==='SCHEDULE'?scheduledAt:undefined,reason})
  const single=(item,action)=>run(`${action}-${item.id}`,()=>setAdminPublication(item.id,payload(action)),`${actionLabels[action]} ${item.code} thành công.`)
  const bulk=action=>run(`bulk-${action}`,()=>bulkSetAdminPublication({ids:selected,...payload(action)}),`Đã ${actionLabels[action].toLowerCase()} ${selected.length} tác phẩm.`)

  return <div className="pub-shell">
    <section className="pub-hero">
      <div><span className="pub-kicker"><Send/> PUBLICATION CONTROL</span><h2>Điều khiển công bố tác phẩm</h2><p>Trạng thái thi và trạng thái public được tách riêng. TOP52/Đạt giải chỉ xuất hiện ngoài website sau khi BTC công bố hoặc tới đúng giờ đã hẹn.</p></div>
      <div className="pub-hero-note"><ShieldAlert/><div><b>Không tự lộ nội dung</b><small>DEMO, bài chưa đủ quyền hoặc chưa phải TOP52/Đạt giải sẽ bị chặn khi công bố.</small></div></div>
    </section>

    {error&&<div className="pub-alert error">{error}</div>}{message&&<div className="pub-alert success"><CheckCircle2/>{message}</div>}

    <section className="pub-stats">
      <article><Eye/><div><small>Đang hiển thị public</small><b>{overview.public_now||0}</b></div></article>
      <article><CalendarClock/><div><small>Đang hẹn giờ</small><b>{overview.scheduled||0}</b></div></article>
      <article><EyeOff/><div><small>Đang ẩn</small><b>{overview.hidden||0}</b></div></article>
      <article className={overview.blocked_rights?'warn':''}><ShieldAlert/><div><small>Thiếu điều kiện quyền</small><b>{overview.blocked_rights||0}</b></div></article>
    </section>

    <section className="pub-toolbar">
      <div className="pub-search"><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyFilters()} placeholder="Mã bài, tên, tác giả, chủ đề..."/></div>
      <select value={filters.status} onChange={e=>applyFilters({status:e.target.value})}><option value="">Mọi trạng thái thi</option>{['TOP52','AWARDED','SHORTLIST','VALID','PENDING'].map(x=><option key={x} value={x}>{statusLabels[x]}</option>)}</select>
      <select value={filters.publicationState} onChange={e=>applyFilters({publicationState:e.target.value})}><option value="">Mọi trạng thái public</option><option value="HIDDEN">Đang ẩn</option><option value="PUBLISHED">Đã công bố</option><option value="SCHEDULED">Hẹn giờ</option></select>
      <label><input type="checkbox" checked={filters.eligibleOnly==='true'} onChange={e=>applyFilters({eligibleOnly:e.target.checked?'true':'false'})}/> Chỉ bài đủ nhóm công bố</label>
      <button onClick={()=>load()} disabled={loading}>Làm mới</button>
    </section>

    <section className="pub-bulkbar">
      <div><b>{selected.length}</b><span>đã chọn</span><button onClick={toggleAll}>{allSelected?'Bỏ chọn tất cả':'Chọn tất cả đủ điều kiện'}</button></div>
      <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)}/>
      <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ghi chú / lý do công bố"/>
      <button className="publish" disabled={!selected.length||Boolean(busy)} onClick={()=>bulk('PUBLISH')}><Eye/> Công bố ngay</button>
      <button className="schedule" disabled={!selected.length||!scheduledAt||Boolean(busy)} onClick={()=>bulk('SCHEDULE')}><CalendarClock/> Hẹn giờ</button>
      <button className="hide" disabled={!selected.length||Boolean(busy)} onClick={()=>bulk('HIDE')}><EyeOff/> Ẩn</button>
    </section>

    <section className="pub-table">
      <div className="pub-head"><span></span><span>Tác phẩm</span><span>Trạng thái thi</span><span>Public</span><span>Thời gian</span><span>Thao tác</span></div>
      {loading?<div className="pub-empty">Đang tải trạng thái công bố...</div>:items.length===0?<div className="pub-empty">Không có tác phẩm phù hợp.</div>:items.map(item=>{
        const current=stateOf(item)
        return <div className={'pub-row '+(!item.eligible?'blocked':'')} key={item.id}>
          <label className="pub-check"><input type="checkbox" disabled={!item.eligible} checked={selected.includes(item.id)} onChange={()=>toggle(item.id)}/></label>
          <div className="pub-work"><div><b>{item.code}</b>{item.isDemo&&<i>MẪU</i>}</div><strong>{item.title||'Chưa đặt tên'}</strong><small>{item.author} · {item.theme} · {item.type}</small>{!item.eligible&&<em>{item.reasons?.join(' ')}</em>}</div>
          <span className={'pub-status '+item.status.toLowerCase()}>{statusLabels[item.status]||item.status}</span>
          <span className={'pub-state '+current.toLowerCase()}>{current==='PUBLIC_NOW'?'ĐANG HIỂN THỊ':stateLabels[item.publicationState]||item.publicationState}</span>
          <div className="pub-time"><b>{item.publicationState==='SCHEDULED'?fmt(item.publishScheduledAt):fmt(item.publishedAt)}</b><small>{item.publicationState==='SCHEDULED'?'Giờ hẹn':'Lần công bố'}</small></div>
          <div className="pub-actions">
            <Link to={`/tac-pham/xem-truoc/${item.id}`} title="Xem trước"><Eye/></Link>
            <button title="Công bố ngay" disabled={!item.eligible||Boolean(busy)} onClick={()=>single(item,'PUBLISH')}><Eye/></button>
            <button title="Hẹn giờ" disabled={!item.eligible||!scheduledAt||Boolean(busy)} onClick={()=>single(item,'SCHEDULE')}><CalendarClock/></button>
            <button title="Ẩn" disabled={Boolean(busy)} onClick={()=>single(item,'HIDE')}><EyeOff/></button>
          </div>
        </div>
      })}
    </section>

    <section className="pub-audit">
      <div className="pub-audit-head"><History/><div><h3>Lịch sử công bố</h3><p>Mọi thao tác công bố, ẩn và hẹn giờ đều được lưu để BTC đối soát.</p></div></div>
      <div className="pub-audit-list">{audit.length?audit.map(log=><div key={log.id}><span>{actionLabels[log.action]||log.action}</span><div><b>{log.code} · {log.title||'Chưa đặt tên'}</b><small>{log.actor} · {fmt(log.createdAt)}{log.reason?` · ${log.reason}`:''}</small></div></div>):<div className="pub-empty small">Chưa có lịch sử thao tác.</div>}</div>
    </section>
  </div>
}
