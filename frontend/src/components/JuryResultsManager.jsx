import { useEffect, useMemo, useState } from 'react'
import {
  Trophy, Lock, Unlock, RefreshCw, Search, AlertTriangle, CheckCircle2,
  Users, ClipboardCheck, ShieldAlert, Sparkles, ListChecks, History, Eye,
  ChevronDown, ExternalLink, WandSparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getThemes,
  getAdminJuryResultsOverview,
  getAdminJuryResultsRanking,
  autoBuildAdminJurySelections,
  setAdminJurySelection,
  lockAdminJuryRound,
  reopenAdminJuryRound,
  publishAdminTop52,
  getAdminJuryAudit
} from '../services/api.js'
import './JuryResultsManager.css'

const types=['Photo','Video','Story & Creative','Art & Design']
const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED']
const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải'}
const actionLabels={
  AUTO_BUILD_SELECTIONS:'Tạo TOP52 tự động',SET_SELECTION:'Chọn thủ công',REMOVE_SELECTION:'Bỏ lựa chọn',
  LOCK_ROUND:'Khóa vòng chấm',REOPEN_ROUND:'Mở lại vòng chấm',PUBLISH_TOP52_STATUS:'Đồng bộ TOP52'
}

function selectionHas(item,type){return Array.isArray(item.selectionTypes)&&item.selectionTypes.includes(type)}
function scoreClass(item){
  if(!item.scoreCount)return 'empty'
  if(item.scoreRange>=20&&item.scoreCount>=2)return 'warn'
  if(item.completionPercent>=100)return 'good'
  return 'partial'
}
function fmtDate(value){if(!value)return '—';try{return new Date(value).toLocaleString('vi-VN')}catch{return '—'}}

export default function JuryResultsManager(){
  const [overview,setOverview]=useState(null)
  const [rows,setRows]=useState([])
  const [themes,setThemes]=useState([])
  const [audit,setAudit]=useState([])
  const [tab,setTab]=useState('ranking')
  const [filters,setFilters]=useState({q:'',theme:'',type:'',status:'',sort:'score_desc',includeDemo:'true'})
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState('')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [reason,setReason]=useState('')
  const [includeDemoBuilder,setIncludeDemoBuilder]=useState(false)

  const load=async(nextFilters=filters)=>{
    setLoading(true);setError('')
    try{
      const [ov,list,themeRows,logs]=await Promise.all([
        getAdminJuryResultsOverview(),
        getAdminJuryResultsRanking({...nextFilters,limit:500}),
        getThemes(),
        getAdminJuryAudit({limit:80})
      ])
      setOverview(ov)
      setRows(Array.isArray(list)?list:[])
      setThemes(Array.isArray(themeRows)?themeRows:[])
      setAudit(Array.isArray(logs)?logs:[])
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }

  useEffect(()=>{load()},[])

  const applyFilters=(patch={})=>{
    const next={...filters,...patch}
    setFilters(next)
    load(next)
  }

  const top52Rows=useMemo(()=>rows.filter(x=>selectionHas(x,'TOP52')),[rows])
  const reserveRows=useMemo(()=>rows.filter(x=>selectionHas(x,'RESERVE')),[rows])
  const counts=overview?.counts||{}
  const round=overview?.round

  const runAction=async(key,fn,success)=>{
    setBusy(key);setError('');setMessage('')
    try{await fn();setMessage(success);await load()}
    catch(err){setError(err.message)}finally{setBusy('')}
  }

  const autoBuild=()=>runAction('auto',()=>autoBuildAdminJurySelections({includeDemo:includeDemoBuilder,top52Limit:52,reserveLimit:8,reason}),
    'Đã tạo lại danh sách TOP52 và dự phòng theo xếp hạng hiện tại.')
  const toggleSelection=(item,type)=>runAction(`${type}-${item.id}`,()=>setAdminJurySelection(item.id,{selectionType:type,selected:!selectionHas(item,type),note:reason}),
    selectionHas(item,type)?`Đã bỏ ${type} khỏi ${item.code}.`:`Đã thêm ${item.code} vào ${type}.`)
  const toggleRound=()=>round?.status==='LOCKED'
    ? runAction('round',()=>reopenAdminJuryRound(reason),'Đã mở lại vòng chấm. BGK có thể tiếp tục chỉnh điểm.')
    : runAction('round',()=>lockAdminJuryRound(reason),'Đã khóa vòng chấm. Phiếu chấm hiện chuyển sang chỉ đọc.')
  const publishTop52=()=>runAction('publish',()=>publishAdminTop52(reason),'Đã đồng bộ danh sách TOP52 sang trạng thái tác phẩm.')

  return <div className="jr-shell">
    <section className="jr-hero">
      <div>
        <span className="jr-eyebrow"><Trophy/> JURY RESULTS · HALO HOLA 2026</span>
        <h2>Kết quả Hội đồng BGK</h2>
        <p>Tổng hợp phiếu đã chốt, xếp hạng, độ lệch điểm, COI và danh sách TOP52. Điểm tổng hợp chỉ lấy phiếu đã chốt và loại phiếu xung đột lợi ích.</p>
      </div>
      <div className={'jr-round '+(round?.status==='LOCKED'?'locked':'open')}>
        <span>{round?.status==='LOCKED'?<Lock/>:<Unlock/>}</span>
        <div><small>VÒNG CHẤM</small><b>{round?.status==='LOCKED'?'Đã khóa':'Đang mở'}</b><em>{round?.name||'Sơ khảo / TOP52'}</em></div>
        <button disabled={busy==='round'} onClick={toggleRound}>{round?.status==='LOCKED'?'Mở lại':'Khóa vòng'}</button>
      </div>
    </section>

    {error&&<div className="jr-alert error"><AlertTriangle/>{error}</div>}
    {message&&<div className="jr-alert success"><CheckCircle2/>{message}</div>}

    <section className="jr-stats">
      <article><span><Users/></span><div><small>BGK hoạt động</small><b>{counts.activeJurors||0}<i>/{counts.jurors||0}</i></b></div></article>
      <article><span><ClipboardCheck/></span><div><small>Phiếu đã chốt</small><b>{counts.finalizedBallots||0}</b><em>{counts.pendingBallots||0} phiếu còn thiếu</em></div></article>
      <article><span><ListChecks/></span><div><small>Bài đủ phiếu</small><b>{counts.fullyScoredSubmissions||0}<i>/{counts.submissions||0}</i></b></div></article>
      <article><span><ShieldAlert/></span><div><small>COI</small><b>{counts.conflicts||0}</b><em>{counts.drafts||0} phiếu nháp</em></div></article>
      <article className={counts.highVariance?'warn':''}><span><AlertTriangle/></span><div><small>Chênh điểm cao</small><b>{counts.highVariance||0}</b><em>Range ≥ {overview?.thresholds?.highVarianceRange||20}</em></div></article>
      <article><span><Trophy/></span><div><small>TOP52 / Dự phòng</small><b>{counts.top52||0}<i> / {counts.reserves||0}</i></b></div></article>
    </section>

    <div className="jr-tabs">
      <button className={tab==='ranking'?'active':''} onClick={()=>setTab('ranking')}><Sparkles/> Xếp hạng</button>
      <button className={tab==='top52'?'active':''} onClick={()=>setTab('top52')}><Trophy/> TOP52 Builder <span>{counts.top52||0}</span></button>
      <button className={tab==='audit'?'active':''} onClick={()=>setTab('audit')}><History/> Audit log</button>
    </div>

    {tab==='ranking'&&<>
      <section className="jr-toolbar">
        <label className="jr-search"><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyFilters()} placeholder="Mã bài, tiêu đề, tác giả..."/></label>
        <select value={filters.theme} onChange={e=>applyFilters({theme:e.target.value})}><option value="">Tất cả chủ đề</option>{themes.map(x=><option key={x.id} value={x.title}>{x.title}</option>)}</select>
        <select value={filters.type} onChange={e=>applyFilters({type:e.target.value})}><option value="">Tất cả loại hình</option>{types.map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select value={filters.status} onChange={e=>applyFilters({status:e.target.value})}><option value="">Tất cả trạng thái</option>{statuses.map(x=><option key={x} value={x}>{statusLabels[x]}</option>)}</select>
        <select value={filters.sort} onChange={e=>applyFilters({sort:e.target.value})}><option value="score_desc">Điểm cao → thấp</option><option value="ballots_desc">Nhiều phiếu nhất</option><option value="variance_desc">Chênh điểm cao</option><option value="code">Mã tác phẩm</option><option value="newest">Mới nhất</option></select>
        <label className="jr-check"><input type="checkbox" checked={filters.includeDemo==='true'} onChange={e=>applyFilters({includeDemo:e.target.checked?'true':'false'})}/> Hiện dữ liệu mẫu</label>
        <button className="jr-refresh" onClick={()=>load()} disabled={loading}><RefreshCw className={loading?'spin':''}/></button>
      </section>

      <section className="jr-table-wrap">
        <div className="jr-table-head"><span>#</span><span>Tác phẩm</span><span>Phiếu</span><span>Điểm TB</span><span>Khoảng điểm</span><span>Đề cử</span><span>Tiến độ</span><span>Chọn</span></div>
        {loading?<div className="jr-empty">Đang tổng hợp kết quả...</div>:rows.length===0?<div className="jr-empty">Chưa có dữ liệu phù hợp.</div>:rows.map((item,index)=><div className={'jr-row '+scoreClass(item)} key={item.id}>
          <span className="jr-rank">{index+1}</span>
          <div className="jr-work"><div><b>{item.code}</b>{item.isDemo&&<i>MẪU</i>}{selectionHas(item,'TOP52')&&<i className="top">TOP52</i>}{selectionHas(item,'RESERVE')&&<i className="reserve">DỰ PHÒNG</i>}</div><strong>{item.title||'Chưa đặt tên'}</strong><small>{item.author} · {item.theme} · {item.type}</small></div>
          <div className="jr-ballots"><b>{item.scoreCount}/{item.expectedCount}</b><small>{item.coiCount?`${item.coiCount} COI`:item.draftCount?`${item.draftCount} nháp`:'phiếu hợp lệ'}</small></div>
          <div className="jr-score"><b>{Number(item.avgScore||0).toFixed(1)}</b><small>/100</small></div>
          <div className="jr-range"><b>{item.scoreCount?`${Number(item.minScore).toFixed(0)}–${Number(item.maxScore).toFixed(0)}`:'—'}</b><small>{item.scoreCount>=2?`Δ ${Number(item.scoreRange).toFixed(1)}`:'Chưa đủ dữ liệu'}</small></div>
          <div className="jr-recs"><b>{item.top52Recommendations||0}</b><small>TOP52 · {item.awardRecommendations||0} giải</small></div>
          <div className="jr-progress"><div><i style={{width:`${item.completionPercent||0}%`}}/></div><small>{Number(item.completionPercent||0).toFixed(0)}%</small></div>
          <div className="jr-row-actions"><button className={selectionHas(item,'TOP52')?'selected':''} disabled={Boolean(busy)} onClick={()=>toggleSelection(item,'TOP52')}>52</button><button className={selectionHas(item,'RESERVE')?'selected reserve':''} disabled={Boolean(busy)} onClick={()=>toggleSelection(item,'RESERVE')}>DP</button><Link to={`/tac-pham/xem-truoc/${item.id}`} title="Xem tác phẩm"><Eye/></Link><Link to={`/jury/${item.id}`} title="Mở Jury"><ExternalLink/></Link></div>
        </div>)}
      </section>
      <p className="jr-note"><AlertTriangle/> “Chênh điểm cao” là cảnh báo vận hành để Admin rà soát, không tự động loại hay thay đổi kết quả.</p>
    </>}

    {tab==='top52'&&<section className="jr-builder">
      <div className="jr-builder-main">
        <div className="jr-builder-head"><div><span className="jr-eyebrow"><WandSparkles/> TOP52 BUILDER</span><h3>Xây danh sách TOP52 từ điểm BGK</h3><p>Hệ thống xếp theo điểm trung bình phiếu đã chốt; khi bằng điểm ưu tiên bài có nhiều phiếu hợp lệ hơn rồi độ chênh thấp hơn. Admin vẫn có thể thêm/bỏ thủ công trước khi đồng bộ trạng thái.</p></div><div className="jr-builder-count"><b>{counts.top52||0}</b><small>/ 52 tác phẩm</small><em>{counts.reserves||0} dự phòng</em></div></div>
        <div className="jr-builder-controls">
          <label><input type="checkbox" checked={includeDemoBuilder} onChange={e=>setIncludeDemoBuilder(e.target.checked)}/> Bao gồm dữ liệu mẫu khi tạo tự động</label>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ghi chú / lý do thao tác (khuyến nghị)"/>
          <button className="auto" onClick={autoBuild} disabled={Boolean(busy)}><WandSparkles/> {busy==='auto'?'Đang tạo...':'Tạo lại TOP52 + 8 dự phòng'}</button>
          <button className="publish" onClick={publishTop52} disabled={Boolean(busy)||!counts.top52}><CheckCircle2/> {busy==='publish'?'Đang đồng bộ...':'Đồng bộ TOP52 vào trạng thái'}</button>
        </div>
        <div className="jr-selection-columns">
          <div><h4>TOP52 <span>{top52Rows.length}</span></h4>{top52Rows.length?top52Rows.map((item,i)=><div className="jr-selection-item" key={item.id}><b>{String(i+1).padStart(2,'0')}</b><div><strong>{item.code} · {item.title||'Chưa đặt tên'}</strong><small>{item.theme} · {Number(item.avgScore||0).toFixed(1)} điểm · {item.scoreCount} phiếu</small></div><button onClick={()=>toggleSelection(item,'TOP52')}>×</button></div>):<div className="jr-empty small">Chưa có TOP52.</div>}</div>
          <div><h4>Dự phòng <span>{reserveRows.length}</span></h4>{reserveRows.length?reserveRows.map((item,i)=><div className="jr-selection-item reserve" key={item.id}><b>{i+1}</b><div><strong>{item.code} · {item.title||'Chưa đặt tên'}</strong><small>{item.theme} · {Number(item.avgScore||0).toFixed(1)} điểm</small></div><button onClick={()=>toggleSelection(item,'RESERVE')}>×</button></div>):<div className="jr-empty small">Chưa có danh sách dự phòng.</div>}</div>
        </div>
      </div>
      <aside className="jr-builder-side"><h4>Quy trình an toàn</h4><ol><li>Chờ đủ phiếu chấm cần thiết.</li><li>Rà các bài có COI hoặc chênh điểm cao.</li><li>Tạo TOP52 tự động rồi chỉnh tay nếu cần.</li><li>Khóa vòng chấm để giữ nguyên phiếu.</li><li>Đồng bộ TOP52 vào trạng thái khi đã chốt nội bộ.</li></ol><div className={round?.status==='LOCKED'?'jr-lock-card locked':'jr-lock-card'}><b>{round?.status==='LOCKED'?'Vòng chấm đang khóa':'Vòng chấm vẫn đang mở'}</b><small>{round?.status==='LOCKED'?'BGK không thể sửa phiếu cho tới khi mở lại.':'Nên khóa vòng sau khi đã nhận đủ phiếu trước khi công bố TOP52.'}</small><button onClick={toggleRound}>{round?.status==='LOCKED'?<Unlock/>:<Lock/>}{round?.status==='LOCKED'?'Mở lại vòng':'Khóa vòng chấm'}</button></div></aside>
    </section>}

    {tab==='audit'&&<section className="jr-audit"><header><div><span className="jr-eyebrow"><History/> AUDIT TRAIL</span><h3>Lịch sử thao tác kết quả</h3></div><button onClick={()=>load()}><RefreshCw/> Làm mới</button></header>{audit.length?audit.map(item=><article key={item.id}><span className="jr-audit-dot"/><div><b>{actionLabels[item.action]||item.action}</b><small>{item.actor} · {fmtDate(item.createdAt)}</small>{item.reason&&<p>{item.reason}</p>}</div><em>{item.entityType}</em></article>):<div className="jr-empty">Chưa có thao tác nào được ghi nhận.</div>}</section>}
  </div>
}
