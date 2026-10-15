import { useState } from 'react'
import {
  AlertTriangle, CheckCircle2, Circle, Download, ExternalLink, Globe2, Images,
  MapPin, RefreshCw, Search, Send, ShieldCheck
} from 'lucide-react'
import { resyncSubmissionHolaMaps } from '../services/adminOperationsApi.js'
import './AdminSubmissionOperations.css'

const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']
const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải',REJECTED:'Không hợp lệ'}

function publicLabel(item){
  if(item.publication_state==='PUBLISHED') return 'Đã công bố'
  if(item.publication_state==='SCHEDULED') return 'Đã hẹn giờ'
  return 'Đang ẩn'
}

function mapTone(item){
  const state=String(item.hola_maps_sync_status||'').toUpperCase()
  if(state==='FAILED') return 'danger'
  if(item.hola_maps_published&&state==='SYNCED') return 'good'
  if(state==='PENDING') return 'pending'
  return 'muted'
}

function Pipeline({item}){
  const received=true
  const approved=['VALID','SHORTLIST','TOP52','AWARDED'].includes(item.status)
  const published=item.publication_state==='PUBLISHED'||(item.publication_state==='SCHEDULED'&&item.publish_scheduled_at&&new Date(item.publish_scheduled_at)<=new Date())
  const mapped=Boolean(item.hola_maps_published)&&String(item.hola_maps_sync_status).toUpperCase()==='SYNCED'
  const steps=[['Đã nhận',received],['Hợp lệ',approved],['Công bố',published],['HOLA Maps',mapped]]
  return <div className="admin-ops-pipeline">{steps.map(([label,done],index)=><div className={done?'done':''} key={label}>{done?<CheckCircle2/>:<Circle/>}<span>{label}</span>{index<steps.length-1&&<i/>}</div>)}</div>
}

export default function AdminSubmissionOperations({
  submissions=[],selected,setSelected,query,setQuery,statusFilter,setStatusFilter,
  loading,onLoad,onSetStatus,onOpenOriginal,onNavigate,onError
}){
  const [syncing,setSyncing]=useState('')
  const [syncMessage,setSyncMessage]=useState('')

  const resync=async(item)=>{
    setSyncing(item.id);setSyncMessage('')
    try{
      const result=await resyncSubmissionHolaMaps(item.id)
      setSyncMessage(result?.holaMaps?.action==='DELETE'?'Đã xếp hàng gỡ khỏi HOLA Maps.':'Đã xếp hàng đồng bộ HOLA Maps.')
      await onLoad?.()
    }catch(err){onError?.(err.message)}
    finally{setSyncing('')}
  }

  return <div className="admin-workspace admin-ops-workspace">
    <div className="admin-panel submissions-panel admin-ops-list-panel">
      <div className="admin-toolbar">
        <div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onLoad?.()} placeholder="Mã, tên tác phẩm, tác giả, email..."/></div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">Tất cả trạng thái</option>{statuses.map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select>
        <button className="btn btn-outline btn-sm" onClick={onLoad}>Lọc</button>
      </div>

      <div className="admin-ops-table-head"><span>Tác phẩm</span><span>Luồng vận hành</span><span>Maps</span><span>Trạng thái</span></div>
      {submissions.length?submissions.map(item=><button className={'admin-ops-row '+(selected?.id===item.id?'selected':'')} key={item.id} onClick={()=>setSelected(item)}>
        <div className="admin-ops-title"><b>{item.code} · {item.title||'Chưa đặt tên'}</b><small>{item.display_name||item.name} · {item.email}</small><em>{item.media?.length||0} file · {item.location||'Chưa có địa điểm'}</em></div>
        <Pipeline item={item}/>
        <div className={'admin-ops-map-badge '+mapTone(item)}><MapPin/><span>{item.hola_maps_published?'Đã lên Maps':String(item.hola_maps_sync_status||'Chưa sync')}</span></div>
        <select value={item.status} onClick={e=>e.stopPropagation()} onChange={e=>onSetStatus(item.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select>
      </button>):<p>Chưa có hồ sơ phù hợp.</p>}
    </div>

    <aside className="admin-detail admin-ops-detail">
      {!selected?<div className="admin-detail-empty"><Images/><h3>Chọn một tác phẩm</h3><p>Toàn bộ luồng nhận bài → duyệt → công bố → HOLA Maps sẽ hiện tại đây.</p></div>:<>
        <span className="eyebrow">{selected.code}</span><h2>{selected.title||'Tác phẩm chưa đặt tên'}</h2>
        <p className="admin-detail-author">{selected.display_name||selected.name} · {selected.email}</p>
        <Pipeline item={selected}/>

        <div className="admin-ops-summary-grid">
          <div><ShieldCheck/><small>Duyệt</small><b>{statusLabels[selected.status]||selected.status}</b></div>
          <div><Globe2/><small>Công bố</small><b>{publicLabel(selected)}</b></div>
          <div className={mapTone(selected)}><MapPin/><small>HOLA Maps</small><b>{selected.hola_maps_published?'Đã đồng bộ':selected.hola_maps_sync_status||'Chưa đồng bộ'}</b></div>
        </div>

        <div className="admin-ops-actions">
          <button className="btn btn-outline" onClick={()=>onNavigate?.('Công bố')}><Globe2/> Quản lý công bố</button>
          <button className="btn btn-outline" disabled={syncing===selected.id} onClick={()=>resync(selected)}><RefreshCw className={syncing===selected.id?'spin':''}/> {syncing===selected.id?'Đang đồng bộ...':'Đồng bộ lại Maps'}</button>
          {selected.hola_maps_public_url&&<a className="btn btn-outline" href={selected.hola_maps_public_url} target="_blank" rel="noreferrer"><MapPin/> Mở pin HOLA Maps <ExternalLink/></a>}
          {!selected.hola_maps_public_url&&selected.hola_maps_published&&<a className="btn btn-outline" href="https://maps.dothihoalac.vn/halo" target="_blank" rel="noreferrer"><MapPin/> Mở HOLA Maps <ExternalLink/></a>}
        </div>
        {syncMessage&&<div className="admin-ops-sync-note"><Send/>{syncMessage}</div>}
        {selected.hola_maps_last_sync_error&&<div className="admin-ops-error"><AlertTriangle/><div><b>Lỗi đồng bộ gần nhất</b><p>{selected.hola_maps_last_sync_error}</p></div></div>}
        {selected.hola_maps_last_synced_at&&<p className="admin-ops-last-sync">Đồng bộ gần nhất: {new Date(selected.hola_maps_last_synced_at).toLocaleString('vi-VN')}</p>}

        <div className="chip-wrap"><span>{selected.type}</span><span>{selected.theme}</span><span>{selected.color}</span></div>
        <div className="admin-rights">
          <div className={selected.rights_confirmed?'ok':'warn'}>{selected.rights_confirmed?<CheckCircle2/>:<AlertTriangle/>}<span>Quyền tác giả</span></div>
          <div className={selected.image_consent_confirmed?'ok':'warn'}>{selected.image_consent_confirmed?<CheckCircle2/>:<AlertTriangle/>}<span>Quyền hình ảnh</span></div>
          <div className={!selected.is_minor||selected.guardian_consent?'ok':'warn'}>{!selected.is_minor||selected.guardian_consent?<CheckCircle2/>:<AlertTriangle/>}<span>Guardian consent</span></div>
        </div>

        <h3>Original Vault</h3>
        <div className="media-vault-list">{(selected.media||[]).map(media=><div key={media.id}><div><b>{media.originalName}</b><small>{(Number(media.size||0)/1024/1024).toFixed(2)} MB · {media.provider} · v{media.revision||1}</small><code>SHA256 {media.sha256||'legacy'}</code></div><button onClick={()=>onOpenOriginal(media.id)} title="Tải file gốc"><Download/></button></div>)}</div>
        {selected.external_link&&<a href={selected.external_link} target="_blank" rel="noreferrer" className="btn btn-outline"><ExternalLink size={16}/> Mở link tác phẩm</a>}
        <h3>Câu chuyện</h3><p className="admin-story">{selected.story}</p>
      </>}
    </aside>
  </div>
}
