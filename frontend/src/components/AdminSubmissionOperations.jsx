import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Check, CheckCircle2, Circle, Download, ExternalLink, Facebook,
  FileCheck2, FileText, Filter, Globe2, Images, Link2, Mail, MapPin, MoreHorizontal,
  RefreshCw, Search, ShieldCheck, Trash2, UserRound, X
} from 'lucide-react'
import { client } from '../services/api.js'
import { resyncSubmissionHolaMaps } from '../services/adminOperationsApi.js'
import './AdminSubmissionOperations.css'

const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']
const statusLabels={PENDING:'Mới nhận',VALID:'Đủ thông tin',SHORTLIST:'Được chọn biên tập',TOP52:'TOP52',AWARDED:'Góc nhìn tiêu biểu',REJECTED:'Cần bổ sung'}

const approvedStatuses=new Set(['VALID','SHORTLIST','TOP52','AWARDED'])

function isPublished(item){
  return item.publication_state==='PUBLISHED'||(
    item.publication_state==='SCHEDULED'&&item.publish_scheduled_at&&new Date(item.publish_scheduled_at)<=new Date()
  )
}

function isMapped(item){
  return Boolean(item.hola_maps_published)&&String(item.hola_maps_sync_status||'').toUpperCase()==='SYNCED'
}

function publicLabel(item){
  if(item.publication_state==='PUBLISHED') return 'Đã công bố'
  if(item.publication_state==='SCHEDULED') return 'Đã hẹn giờ'
  return 'Chưa công bố'
}

function mapTone(item){
  const state=String(item.hola_maps_sync_status||'').toUpperCase()
  if(state==='FAILED') return 'danger'
  if(isMapped(item)) return 'good'
  if(state==='PENDING') return 'pending'
  return 'muted'
}

function sourceLabel(item){
  return String(item.submission_source||'WEB').toUpperCase()==='FACEBOOK'?'Facebook':'Web'
}

function firstPreview(item){
  const media=item.media?.[0]
  return media?.preview_url||media?.thumbnail_url||media?.url||''
}

function formatDate(value){
  if(!value)return '—'
  const date=new Date(value)
  if(Number.isNaN(date.getTime()))return '—'
  return date.toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
}

function getOperationalState(item){
  const mediaCount=Number(item.media_count ?? item.media?.length ?? 0)
  if(!mediaCount&&!item.external_link)return {label:'Thiếu file',tone:'danger'}
  if(String(item.submission_source||'').toUpperCase()==='FACEBOOK'&&!item.facebook_post_url)return {label:'Thiếu Facebook',tone:'danger'}
  if(item.facebook_post_url&&!item.facebook_post_verified_at)return {label:'Chưa xác minh',tone:'pending'}
  if(item.status==='PENDING')return {label:'Chờ kiểm tra',tone:'pending'}
  if(item.status==='REJECTED')return {label:'Không hợp lệ',tone:'danger'}
  return {label:statusLabels[item.status]||'Đủ dữ liệu',tone:'good'}
}

function Pipeline({item,compact=false}){
  const steps=[
    ['Đã nhận',true],
    ['Hợp lệ',approvedStatuses.has(item.status)],
    ['Công bố',isPublished(item)],
    ['Maps',isMapped(item)]
  ]
  return <div className={'admin-v2-pipeline '+(compact?'compact':'')}>
    {steps.map(([label,done],index)=><div className={done?'done':''} key={label}>
      <span className="admin-v2-pipeline-dot">{done?<Check size={11}/>:null}</span>
      <small>{label}</small>
      {index<steps.length-1&&<i/>}
    </div>)}
  </div>
}

function csvCell(value){
  return `"${String(value??'').replaceAll('"','""')}"`
}

export default function AdminSubmissionOperations({
  submissions=[],selected,setSelected,query,setQuery,statusFilter,
  loading,onLoad,onSetStatus,onOpenOriginal,onNavigate,onError
}){
  const [opsOverview,setOpsOverview]=useState(null)
  const [opsItems,setOpsItems]=useState([])
  const [opsLoading,setOpsLoading]=useState(false)
  const [sourceFilter,setSourceFilter]=useState('')
  const [viewStatus,setViewStatus]=useState(statusFilter||'')
  const [themeFilter,setThemeFilter]=useState('')
  const [sortMode,setSortMode]=useState('newest')
  const [activeIssue,setActiveIssue]=useState('')
  const [syncing,setSyncing]=useState('')
  const [syncMessage,setSyncMessage]=useState('')
  const [facebookBusy,setFacebookBusy]=useState(false)
  const [notifyBusy,setNotifyBusy]=useState(false)
  const [resetBusy,setResetBusy]=useState(false)
  const [facebookEdit,setFacebookEdit]=useState({url:'',verified:false,reactions:0,comments:0,shares:0})

  const loadOperations=async()=>{
    setOpsLoading(true)
    try{
      const [overviewRes,listRes]=await Promise.all([
        client.get('/submission-operations/admin/overview'),
        client.get('/submission-operations/admin/list',{params:{limit:300}})
      ])
      setOpsOverview(overviewRes.data||{})
      setOpsItems(Array.isArray(listRes.data)?listRes.data:[])
    }catch(err){
      onError?.(err.response?.data?.error||err.message)
    }finally{
      setOpsLoading(false)
    }
  }

  useEffect(()=>{loadOperations()},[])

  const opsById=useMemo(()=>new Map(opsItems.map(item=>[String(item.id),item])),[opsItems])
  const mergedItems=useMemo(()=>{
    const mainIds=new Set(submissions.map(item=>String(item.id)))
    const primary=submissions.map(item=>({...opsById.get(String(item.id)),...item}))
    const operationalOnly=opsItems.filter(item=>!mainIds.has(String(item.id)))
    return [...primary,...operationalOnly]
  },[submissions,opsItems,opsById])

  const themes=useMemo(()=>Array.from(new Set(mergedItems.map(item=>item.theme).filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b),'vi')),[mergedItems])

  const filteredItems=useMemo(()=>{
    const needle=String(query||'').trim().toLowerCase()
    const matchesIssue=item=>{
      if(!activeIssue)return true
      if(activeIssue==='MISSING_FACEBOOK')return String(item.submission_source||'').toUpperCase()==='FACEBOOK'&&!item.facebook_post_url
      if(activeIssue==='UNVERIFIED_FACEBOOK')return Boolean(item.facebook_post_url)&&!item.facebook_post_verified_at
      if(activeIssue==='OUTREACH_ELIGIBLE')return Boolean(item.facebook_post_url)&&item.facebook_completion_status==='CONFIRMED'
      return true
    }
    const result=mergedItems.filter(item=>{
      if(needle&&!`${item.code||''} ${item.title||''} ${item.display_name||''} ${item.name||''} ${item.email||''} ${item.phone||''}`.toLowerCase().includes(needle))return false
      if(sourceFilter&&String(item.submission_source||'WEB').toUpperCase()!==sourceFilter)return false
      if(viewStatus&&item.status!==viewStatus)return false
      if(themeFilter&&item.theme!==themeFilter)return false
      return matchesIssue(item)
    })
    return [...result].sort((a,b)=>{
      if(sortMode==='oldest')return new Date(a.created_at||0)-new Date(b.created_at||0)
      if(sortMode==='code')return String(a.code||'').localeCompare(String(b.code||''),'vi')
      return new Date(b.created_at||0)-new Date(a.created_at||0)
    })
  },[mergedItems,query,sourceFilter,viewStatus,themeFilter,sortMode,activeIssue])

  const selectedItem=useMemo(()=>mergedItems.find(item=>String(item.id)===String(selected?.id))||selected,[mergedItems,selected])

  useEffect(()=>{
    if(!selectedItem&&filteredItems.length)setSelected?.(filteredItems[0])
  },[selectedItem,filteredItems,setSelected])

  useEffect(()=>{
    if(!selectedItem)return
    setFacebookEdit({
      url:selectedItem.facebook_post_url||'',
      verified:Boolean(selectedItem.facebook_post_verified_at),
      reactions:Number(selectedItem.facebook_reactions||0),
      comments:Number(selectedItem.facebook_comments||0),
      shares:Number(selectedItem.facebook_shares||0)
    })
    setSyncMessage('')
  },[selectedItem?.id,selectedItem?.facebook_post_url,selectedItem?.facebook_post_verified_at,selectedItem?.facebook_reactions,selectedItem?.facebook_comments,selectedItem?.facebook_shares])

  const refreshAll=async()=>{
    await Promise.all([Promise.resolve(onLoad?.()),loadOperations()])
  }

  const selectKpi=(type)=>{
    setActiveIssue('')
    if(type==='all'){setViewStatus('');setSourceFilter('')}
    if(type==='pending'){setViewStatus('PENDING')}
    if(type==='missing-facebook'){setViewStatus('');setActiveIssue('MISSING_FACEBOOK')}
    if(type==='unverified'){setViewStatus('');setActiveIssue('UNVERIFIED_FACEBOOK')}
    if(type==='ready'){setViewStatus('');setActiveIssue('OUTREACH_ELIGIBLE')}
  }

  const saveFacebook=async()=>{
    if(!selectedItem)return
    setFacebookBusy(true)
    try{
      await client.patch(`/submission-operations/admin/${selectedItem.id}/facebook`,facebookEdit)
      await loadOperations()
    }catch(err){onError?.(err.response?.data?.error||err.message)}
    finally{setFacebookBusy(false)}
  }

  const resync=async(item)=>{
    setSyncing(item.id);setSyncMessage('')
    try{
      const result=await resyncSubmissionHolaMaps(item.id)
      setSyncMessage(result?.holaMaps?.action==='DELETE'?'Đã xếp hàng gỡ khỏi HOLA Maps.':'Đã xếp hàng đồng bộ HOLA Maps.')
      await refreshAll()
    }catch(err){onError?.(err.message)}
    finally{setSyncing('')}
  }

  const notify=async()=>{
    if(!selectedItem?.code)return
    setNotifyBusy(true)
    try{
      const {data}=await client.post('/admin/submissions/notify',{code:selectedItem.code})
      const delivery=data?.delivery||{}
      if(delivery.skipped){
        window.alert(delivery.reason==='SMTP_NOT_CONFIGURED'?'Chưa cấu hình SMTP nên email chưa được gửi.':`Email chưa được gửi: ${delivery.reason||'không xác định'}`)
      }else window.alert(`Đã gửi email trạng thái cho ${selectedItem.code}.`)
    }catch(err){onError?.(err.response?.data?.error||err.message)}
    finally{setNotifyBusy(false)}
  }

  const resetAll=async()=>{
    if(resetBusy)return
    const typed=window.prompt('Thao tác này sẽ xóa toàn bộ góc nhìn và không thể hoàn tác.\n\nNhập XOA TAT CA để xác nhận:')
    if(typed===null)return
    if(typed.trim().toUpperCase()!=='XOA TAT CA'){
      window.alert('Nội dung xác nhận chưa đúng. Chưa có dữ liệu nào bị xóa.')
      return
    }
    setResetBusy(true)
    try{
      const {data}=await client.post('/admin/submissions/reset-all',{confirm:'RESET_ALL_SUBMISSIONS'})
      setSelected?.(null)
      window.alert(`Đã xóa ${Number(data?.removed||0)} góc nhìn.`)
      await refreshAll()
    }catch(err){onError?.(err.response?.data?.error||err.message)}
    finally{setResetBusy(false)}
  }

  const exportCsv=()=>{
    const header=['Mã góc nhìn','Góc nhìn','Người kể','Email','SĐT','Nguồn','Chủ đề','Trạng thái','Địa điểm','Facebook','Điểm lan tỏa','HOLA Maps']
    const rows=filteredItems.map(item=>[
      item.code,item.title,item.display_name||item.name,item.email,item.phone,sourceLabel(item),item.theme,statusLabels[item.status]||item.status,item.location,
      item.facebook_post_url,item.outreachScore||0,isMapped(item)?'Đã đồng bộ':item.hola_maps_sync_status||'Chưa đồng bộ'
    ])
    const csv='\uFEFF'+[header,...rows].map(row=>row.map(csvCell).join(',')).join('\n')
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}))
    const anchor=document.createElement('a')
    anchor.href=url;anchor.download=`halo-hola-tac-pham-${new Date().toISOString().slice(0,10)}.csv`;anchor.click()
    URL.revokeObjectURL(url)
  }

  const score=Number(facebookEdit.reactions||0)+Number(facebookEdit.comments||0)*2+Number(facebookEdit.shares||0)*3
  const total=Number(opsOverview?.total ?? submissions.length)
  const pendingCount=mergedItems.filter(item=>item.status==='PENDING').length
  const missingFacebook=Number(opsOverview?.missing_facebook ?? 0)
  const unverified=Number(opsOverview?.facebook_unverified ?? 0)
  const ready=Number(opsOverview?.outreach_eligible ?? 0)
  const busy=loading||opsLoading

  return <div className="admin-submissions-v2">
    <div className="admin-v2-commandbar">
      <div><b>Quản lý góc nhìn cộng đồng</b><span>Kiểm tra, biên tập, công bố và theo dõi từng góc nhìn trên cùng một màn hình.</span></div>
      <div className="admin-v2-command-actions">
        <button className="admin-v2-btn ghost" onClick={exportCsv}><Download/> Xuất CSV</button>
        <button className="admin-v2-btn ghost" onClick={refreshAll} disabled={busy}><RefreshCw className={busy?'spin':''}/> Làm mới</button>
        <details className="admin-v2-more"><summary aria-label="Thao tác khác"><MoreHorizontal/></summary><div><button onClick={resetAll} disabled={resetBusy}><Trash2/> {resetBusy?'Đang xóa...':'Xóa toàn bộ góc nhìn'}</button></div></details>
      </div>
    </div>

    <div className="admin-v2-kpis">
      <button className={!viewStatus&&!activeIssue&&!sourceFilter?'active':''} onClick={()=>selectKpi('all')}><span className="kpi-icon blue"><FileText/></span><small>Tổng góc nhìn</small><b>{total}</b></button>
      <button className={viewStatus==='PENDING'?'active':''} onClick={()=>selectKpi('pending')}><span className="kpi-icon amber"><FileCheck2/></span><small>Chờ kiểm tra</small><b>{pendingCount}</b></button>
      <button className={activeIssue==='MISSING_FACEBOOK'?'active':''} onClick={()=>selectKpi('missing-facebook')}><span className="kpi-icon red"><Link2/></span><small>Thiếu Facebook</small><b>{missingFacebook}</b></button>
      <button className={activeIssue==='UNVERIFIED_FACEBOOK'?'active':''} onClick={()=>selectKpi('unverified')}><span className="kpi-icon amber"><ShieldCheck/></span><small>Chưa xác minh</small><b>{unverified}</b></button>
      <button className={activeIssue==='OUTREACH_ELIGIBLE'?'active':''} onClick={()=>selectKpi('ready')}><span className="kpi-icon green"><CheckCircle2/></span><small>Đủ dữ liệu Lan tỏa</small><b>{ready}</b></button>
    </div>

    <div className="admin-v2-filterbar">
      <label className="admin-v2-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo mã góc nhìn, tiêu đề, người kể, email..."/></label>
      <select value={sourceFilter} onChange={e=>{setSourceFilter(e.target.value);setActiveIssue('')}}><option value="">Mọi nguồn</option><option value="WEB">Web</option><option value="FACEBOOK">Facebook</option></select>
      <select value={viewStatus} onChange={e=>{setViewStatus(e.target.value);setActiveIssue('')}}><option value="">Tất cả trạng thái</option>{statuses.map(status=><option value={status} key={status}>{statusLabels[status]}</option>)}</select>
      <select value={themeFilter} onChange={e=>setThemeFilter(e.target.value)}><option value="">Mọi chủ đề</option>{themes.map(theme=><option value={theme} key={theme}>{theme}</option>)}</select>
      <select value={sortMode} onChange={e=>setSortMode(e.target.value)}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="code">Theo mã góc nhìn</option></select>
      <button className="admin-v2-btn primary" onClick={refreshAll}><Filter/> Lọc</button>
    </div>

    <div className="admin-v2-layout">
      <section className="admin-v2-list-card">
        <div className="admin-v2-list-title"><div><h2>Danh sách góc nhìn</h2><span>{filteredItems.length} / {total} góc nhìn</span></div>{activeIssue&&<button onClick={()=>setActiveIssue('')}><X/> Bỏ lọc nhanh</button>}</div>
        <div className="admin-v2-table-head"><span></span><span>Góc nhìn</span><span>Tác giả</span><span>Nguồn</span><span>Tiến trình</span><span>Facebook</span><span>Maps</span><span>Trạng thái</span><span></span></div>
        <div className="admin-v2-rows">
          {filteredItems.map(item=>{
            const state=getOperationalState(item)
            const preview=firstPreview(item)
            const isSelected=String(selectedItem?.id)===String(item.id)
            return <div className={'admin-v2-row '+(isSelected?'selected':'')} key={item.id} role="button" tabIndex="0" onClick={()=>setSelected?.(item)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setSelected?.(item)}}>
              <span className={'admin-v2-select '+(isSelected?'checked':'')}>{isSelected?<Check/>:null}</span>
              <div className="admin-v2-artwork-cell">{preview?<img src={preview} alt=""/>:<span className="admin-v2-thumb-placeholder"><Images/></span>}<div><b>{item.title||'Góc nhìn chưa đặt tên'}</b><small>{item.code||'Chưa có mã'}</small><em><MapPin/> {item.location||'Chưa có địa điểm'}</em></div></div>
              <div className="admin-v2-author-cell"><b>{item.display_name||item.name||'Chưa có tên'}</b><small>{item.email||'—'}</small></div>
              <span className={'admin-v2-source '+(sourceLabel(item)==='Facebook'?'facebook':'')}>{sourceLabel(item)}</span>
              <Pipeline item={item} compact/>
              <span className={'admin-v2-signal '+(item.facebook_post_url?(item.facebook_post_verified_at?'good':'pending'):'danger')} title={item.facebook_post_url?(item.facebook_post_verified_at?'Facebook đã xác minh':'Facebook chưa xác minh'):'Chưa có Facebook'}><Facebook/></span>
              <span className={'admin-v2-signal '+mapTone(item)} title={isMapped(item)?'Đã lên HOLA Maps':item.hola_maps_sync_status||'Chưa đồng bộ'}><MapPin/></span>
              <span className={'admin-v2-status '+state.tone}>{state.label}</span>
              <button className="admin-v2-view" onClick={e=>{e.stopPropagation();setSelected?.(item)}}>Xem</button>
            </div>
          })}
          {!filteredItems.length&&!busy&&<div className="admin-v2-empty"><Search/><b>Không có góc nhìn phù hợp</b><span>Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác.</span></div>}
          {busy&&!filteredItems.length&&<div className="admin-v2-empty"><RefreshCw className="spin"/><b>Đang tải dữ liệu...</b></div>}
        </div>
      </section>

      <aside className="admin-v2-detail-card">
        {!selectedItem?<div className="admin-v2-detail-empty"><Images/><h3>Chọn một góc nhìn</h3><p>Thông tin hồ sơ, Facebook, file gốc và các hành động vận hành sẽ hiển thị tại đây.</p></div>:<>
          <div className="admin-v2-detail-head">
            {firstPreview(selectedItem)?<img src={firstPreview(selectedItem)} alt=""/>:<span className="admin-v2-detail-placeholder"><Images/></span>}
            <div><span className="admin-v2-code">{selectedItem.code}</span><h2>{selectedItem.title||'Góc nhìn chưa đặt tên'}</h2><span className={'admin-v2-status '+getOperationalState(selectedItem).tone}>{getOperationalState(selectedItem).label}</span></div>
          </div>
          <div className="admin-v2-meta-line"><span><MapPin/> {selectedItem.location||'Chưa có địa điểm'}</span><span>Nhận: {formatDate(selectedItem.created_at)}</span></div>
          <Pipeline item={selectedItem}/>

          <section className="admin-v2-detail-section">
            <div className="admin-v2-section-title"><UserRound/><h3>Thông tin tác giả</h3></div>
            <dl><div><dt>Họ tên</dt><dd>{selectedItem.display_name||selectedItem.name||'—'}</dd></div><div><dt>Email</dt><dd>{selectedItem.email||'—'}</dd></div><div><dt>Số điện thoại</dt><dd>{selectedItem.phone||'—'}</dd></div></dl>
          </section>

          <section className="admin-v2-detail-section">
            <div className="admin-v2-section-title"><Images/><h3>File & liên kết</h3></div>
            <div className="admin-v2-file-grid">
              <div className="admin-v2-file-summary"><span className="admin-v2-file-thumb">{firstPreview(selectedItem)?<img src={firstPreview(selectedItem)} alt=""/>:<Images/>}</span><div><small>File góc nhìn</small><b>{selectedItem.media?.[0]?.originalName||`${Number(selectedItem.media_count||0)} file đã lưu`}</b></div>{selectedItem.media?.[0]?.id&&<button title="Tải file gốc" onClick={()=>onOpenOriginal?.(selectedItem.media[0].id)}><Download/></button>}</div>
              <div className="admin-v2-link-summary"><div><small>Link góc nhìn</small><b>{selectedItem.external_link?'Đã có liên kết':'Chưa có liên kết'}</b></div>{selectedItem.external_link&&<a href={selectedItem.external_link} target="_blank" rel="noreferrer"><ExternalLink/></a>}</div>
            </div>
          </section>

          <section className="admin-v2-detail-section facebook-section">
            <div className="admin-v2-section-title"><Facebook/><h3>Facebook & Lan tỏa</h3><span className={'admin-v2-mini-state '+(facebookEdit.url?(facebookEdit.verified?'good':'pending'):'danger')}>{facebookEdit.url?(facebookEdit.verified?'Đã xác minh':'Chưa xác minh'):'Thiếu link'}</span></div>
            <label className="admin-v2-field"><span>Link bài Facebook</span><div><input value={facebookEdit.url} onChange={e=>setFacebookEdit(v=>({...v,url:e.target.value}))} placeholder="https://www.facebook.com/..."/>{facebookEdit.url&&<a href={facebookEdit.url} target="_blank" rel="noreferrer" title="Mở Facebook"><ExternalLink/></a>}</div></label>
            <div className="admin-v2-metrics"><label><span>Reaction</span><input type="number" min="0" value={facebookEdit.reactions} onChange={e=>setFacebookEdit(v=>({...v,reactions:Number(e.target.value)}))}/></label><label><span>Bình luận</span><input type="number" min="0" value={facebookEdit.comments} onChange={e=>setFacebookEdit(v=>({...v,comments:Number(e.target.value)}))}/></label><label><span>Chia sẻ</span><input type="number" min="0" value={facebookEdit.shares} onChange={e=>setFacebookEdit(v=>({...v,shares:Number(e.target.value)}))}/></label><div className="admin-v2-score"><small>Điểm Lan tỏa</small><b>{score}</b></div></div>
            <label className="admin-v2-check"><input type="checkbox" checked={facebookEdit.verified} onChange={e=>setFacebookEdit(v=>({...v,verified:e.target.checked}))}/><span>Đã kiểm tra đúng link Facebook của mã dự thi này</span></label>
            <button className="admin-v2-btn soft" disabled={facebookBusy} onClick={saveFacebook}><CheckCircle2/> {facebookBusy?'Đang lưu...':'Lưu Facebook & số liệu'}</button>
          </section>

          <section className="admin-v2-detail-section compact-section">
            <div className="admin-v2-section-title"><ShieldCheck/><h3>Kiểm tra hồ sơ</h3></div>
            <div className="admin-v2-rights">
              <span className={selectedItem.rights_confirmed?'good':'danger'}>{selectedItem.rights_confirmed?<CheckCircle2/>:<AlertTriangle/>} Quyền tác giả</span>
              <span className={selectedItem.image_consent_confirmed?'good':'danger'}>{selectedItem.image_consent_confirmed?<CheckCircle2/>:<AlertTriangle/>} Quyền hình ảnh</span>
              <span className={!selectedItem.is_minor||selectedItem.guardian_consent?'good':'danger'}>{!selectedItem.is_minor||selectedItem.guardian_consent?<CheckCircle2/>:<AlertTriangle/>} Người giám hộ</span>
            </div>
          </section>

          <section className="admin-v2-detail-section actions-section">
            <div className="admin-v2-section-title"><FileCheck2/><h3>Hành động</h3></div>
            <label className="admin-v2-status-select"><span>Trạng thái duyệt</span><select value={selectedItem.status||'PENDING'} onChange={e=>onSetStatus?.(selectedItem.id,e.target.value)}>{statuses.map(status=><option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
            <div className="admin-v2-action-grid">
              {!approvedStatuses.has(selectedItem.status)&&<button className="admin-v2-btn primary" onClick={()=>onSetStatus?.(selectedItem.id,'VALID')}><Check/> Đánh dấu hợp lệ</button>}
              <button className="admin-v2-btn ghost" onClick={()=>onNavigate?.('Công bố')}><Globe2/> Công bố</button>
              <button className="admin-v2-btn ghost" disabled={syncing===selectedItem.id} onClick={()=>resync(selectedItem)}><MapPin/> {syncing===selectedItem.id?'Đang đồng bộ...':isMapped(selectedItem)?'Đồng bộ lại Maps':'Đưa vào HOLA Maps'}</button>
              <button className="admin-v2-btn ghost" disabled={notifyBusy} onClick={notify}><Mail/> {notifyBusy?'Đang gửi...':'Gửi email trạng thái'}</button>
            </div>
            {syncMessage&&<div className="admin-v2-notice good"><CheckCircle2/>{syncMessage}</div>}
            {selectedItem.hola_maps_last_sync_error&&<div className="admin-v2-notice danger"><AlertTriangle/><span><b>Lỗi Maps gần nhất</b>{selectedItem.hola_maps_last_sync_error}</span></div>}
          </section>

          {(selectedItem.media?.length>1||selectedItem.story)&&<details className="admin-v2-more-detail">
            <summary>Thông tin mở rộng</summary>
            {selectedItem.media?.length>1&&<div className="admin-v2-vault"><h4>Original Vault · {selectedItem.media.length} file</h4>{selectedItem.media.map(media=><div key={media.id}><div><b>{media.originalName}</b><small>{(Number(media.size||0)/1024/1024).toFixed(2)} MB · {media.provider||'storage'}</small></div><button onClick={()=>onOpenOriginal?.(media.id)}><Download/></button></div>)}</div>}
            {selectedItem.story&&<div className="admin-v2-story"><h4>Câu chuyện</h4><p>{selectedItem.story}</p></div>}
          </details>}
        </>}
      </aside>
    </div>
  </div>
}
