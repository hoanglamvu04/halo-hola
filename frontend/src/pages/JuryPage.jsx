import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Download, Star, Save, EyeOff, Eye, ZoomIn, ZoomOut,
  Maximize2, RotateCcw, Search, Filter, X, CheckCircle2, AlertTriangle, Flag,
  Trophy, Bookmark, SlidersHorizontal, Image as ImageIcon, Video, FileText,
  ExternalLink, ShieldCheck, Users, BarChart3
} from 'lucide-react'
import {
  getAdminToken, getOriginalDownload, updateSubmissionStatus,
  getJurySubmissions, getJuryScorecard, saveJuryScore, getJuryStats
} from '../services/api.js'

const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']
const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải',REJECTED:'Không hợp lệ'}
const themes=[
  'Nét Đoài tại Hòa Lạc','Sắc Mường Hòa Lạc','Không gian Kiến trúc Hòa Lạc','Hòa Lạc xanh',
  'Nắng Hòa Lạc','Câu chuyện Hòa Lạc','Ước mơ Hòa Lạc','Sắc màu Hòa Lạc'
]
const colors=['Đá ong','Nắng','Xanh rêu','Xanh non','Be','Sắc Hòa Lạc']
const types=['Photo','Video','Story & Creative','Art & Design']
const recommendations=[
  ['NONE','Không đề cử'],['SHORTLIST','Đề cử Shortlist'],['TOP52','Đề cử TOP52'],['RESERVE','Dự bị'],['AWARD','Đề cử giải']
]
const defaultScore={quality:0,representation:0,story:0,creativity:0,recommendation:'NONE',conflictOfInterest:false,note:'',submitted:false}
const defaultFilters={q:'',status:'',type:'',theme:'',color:'',location:'',review:'',recommendation:'',rights:'',hasMedia:'',minScore:'',maxScore:'',sort:'newest'}

function weighted(score){
  return Math.round((Number(score.quality||0)*3+Number(score.representation||0)*3+Number(score.story||0)*2+Number(score.creativity||0)*2)*100)/100
}

function ScoreField({label,weight,value,onChange,disabled}){
  return <div className="jury-score-field">
    <div><span>{label}</span><small>{weight}%</small><b>{Number(value||0).toFixed(1)}</b></div>
    <div className="jury-score-inputs">
      <input disabled={disabled} type="range" min="0" max="10" step="0.5" value={value||0} onChange={e=>onChange(Number(e.target.value))}/>
      <input disabled={disabled} type="number" min="0" max="10" step="0.5" value={value||0} onChange={e=>onChange(Math.min(10,Math.max(0,Number(e.target.value)||0)))}/>
    </div>
  </div>
}

function MediaIcon({mime=''}){
  if(mime.startsWith('video/')) return <Video/>
  if(mime.startsWith('image/')) return <ImageIcon/>
  return <FileText/>
}

export default function JuryPage(){
  const token=getAdminToken()
  const {submissionId}=useParams()
  const navigate=useNavigate()
  const viewerRef=useRef(null)

  const [items,setItems]=useState([])
  const [filters,setFilters]=useState(defaultFilters)
  const [draftFilters,setDraftFilters]=useState(defaultFilters)
  const [stats,setStats]=useState({})
  const [blind,setBlind]=useState(true)
  const [filtersOpen,setFiltersOpen]=useState(true)
  const [scorecard,setScorecard]=useState({mine:null,judges:[],aggregate:{}})
  const [score,setScore]=useState(defaultScore)
  const [mediaIndex,setMediaIndex]=useState(0)
  const [mediaUrl,setMediaUrl]=useState('')
  const [zoom,setZoom]=useState(1)
  const [loading,setLoading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  const item=useMemo(()=>items.find(x=>x.id===submissionId)||items[0]||null,[items,submissionId])
  const currentIndex=useMemo(()=>item?items.findIndex(x=>x.id===item.id):-1,[items,item])
  const media=item?.media||[]
  const currentMedia=media[mediaIndex]||media[0]
  const currentMime=currentMedia?.mimeType||''
  const total=weighted(score)

  const loadQueue=async(nextFilters=filters,{keepSelection=true}={})=>{
    if(!token) return
    setLoading(true);setError('')
    try{
      const [list,nextStats]=await Promise.all([getJurySubmissions(nextFilters),getJuryStats()])
      setItems(list||[]);setStats(nextStats||{})
      if(list?.length){
        const exists=keepSelection&&submissionId&&list.some(x=>x.id===submissionId)
        if(!exists) navigate('/jury/'+list[0].id,{replace:true})
      }
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{if(token) loadQueue(defaultFilters,{keepSelection:true})},[token])

  useEffect(()=>{
    if(!item) return
    if(!submissionId||submissionId!==item.id) navigate('/jury/'+item.id,{replace:true})
    setMediaIndex(0);setZoom(1);setMessage('')
    getJuryScorecard(item.id).then(card=>{
      setScorecard(card||{mine:null,judges:[],aggregate:{}})
      setScore({...defaultScore,...(card?.mine||{})})
    }).catch(err=>setError(err.message))
  },[item?.id])

  useEffect(()=>{
    let cancelled=false
    setMediaUrl('');setZoom(1)
    if(!currentMedia?.id) return
    getOriginalDownload(currentMedia.id).then(data=>{if(!cancelled)setMediaUrl(data.url)}).catch(()=>{if(!cancelled)setMediaUrl('')})
    return()=>{cancelled=true}
  },[currentMedia?.id])

  const move=(delta)=>{
    if(!items.length||currentIndex<0) return
    const next=Math.min(items.length-1,Math.max(0,currentIndex+delta))
    if(items[next]) navigate('/jury/'+items[next].id)
  }

  const applyFilters=()=>{
    const next={...draftFilters}
    setFilters(next)
    loadQueue(next,{keepSelection:false})
  }

  const resetFilters=()=>{
    setDraftFilters(defaultFilters);setFilters(defaultFilters)
    loadQueue(defaultFilters,{keepSelection:false})
  }

  const patchScore=(key,value)=>setScore(v=>({...v,[key]:value,submitted:key==='conflictOfInterest'&&value?false:v.submitted}))

  const saveScore=async(submitted=false)=>{
    if(!item) return
    setSaving(true);setError('');setMessage('')
    try{
      const payload={...score,submitted:submitted&&!score.conflictOfInterest}
      const saved=await saveJuryScore(item.id,payload)
      const card=await getJuryScorecard(item.id)
      setScore({...defaultScore,...saved});setScorecard(card)
      setItems(v=>v.map(x=>x.id===item.id?{...x,my_score:saved,avg_score:card.aggregate?.average??x.avg_score,score_count:card.aggregate?.count??x.score_count}:x))
      setStats(await getJuryStats())
      setMessage(submitted?'Đã chốt điểm của bạn.':'Đã lưu nháp.')
    }catch(err){setError(err.message)}
    finally{setSaving(false)}
  }

  const setStatus=async(status)=>{
    if(!item) return
    try{
      await updateSubmissionStatus(item.id,status)
      setItems(v=>v.map(x=>x.id===item.id?{...x,status}:x))
      setMessage('Đã cập nhật trạng thái: '+statusLabels[status])
    }catch(err){setError(err.message)}
  }

  const openOriginal=async()=>{
    if(!currentMedia?.id) return
    try{const data=await getOriginalDownload(currentMedia.id);window.open(data.url,'_blank','noopener,noreferrer')}catch(err){setError(err.message)}
  }

  const fullscreen=()=>{
    if(viewerRef.current?.requestFullscreen) viewerRef.current.requestFullscreen().catch(()=>{})
  }

  useEffect(()=>{
    const onKey=(e)=>{
      const tag=e.target?.tagName
      if(['INPUT','TEXTAREA','SELECT'].includes(tag)) return
      if(e.key==='ArrowRight') move(1)
      if(e.key==='ArrowLeft') move(-1)
      if(e.key.toLowerCase()==='f') fullscreen()
      if(e.key.toLowerCase()==='s') setStatus('SHORTLIST')
      if(e.key==='1') document.getElementById('score-quality')?.focus()
      if(e.key==='2') document.getElementById('score-representation')?.focus()
      if(e.key==='3') document.getElementById('score-story')?.focus()
      if(e.key==='4') document.getElementById('score-creativity')?.focus()
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[items,currentIndex,item?.id])

  if(!token) return <main className="jury-login"><div><EyeOff/><h1>Review Workspace</h1><p>Đăng nhập quản trị trước để truy cập chế độ chấm.</p><Link className="btn btn-green" to="/admin">Đăng nhập Admin</Link></div></main>

  return <main className="jury-v2">
    <header className="jury-v2-top">
      <div className="jury-v2-brand">
        <Link to="/admin/submissions"><ArrowLeft/> Admin</Link>
        <div><b>HALO HOLA</b><span>REVIEW WORKSPACE V2</span></div>
      </div>
      <div className="jury-v2-stats">
        <span><b>{stats.total||0}</b><small>Tổng bài</small></span>
        <span><b>{stats.my_scored||0}</b><small>Đã chấm</small></span>
        <span><b>{stats.my_unscored||0}</b><small>Chưa chấm</small></span>
        <span><b>{stats.shortlist||0}</b><small>Shortlist</small></span>
        <span><b>{stats.top52||0}</b><small>TOP52</small></span>
      </div>
      <div className="jury-v2-top-actions">
        <button className={blind?'active':''} onClick={()=>setBlind(v=>!v)}>{blind?<EyeOff/>:<Eye/>}{blind?'Blind ON':'Blind OFF'}</button>
        <button className={filtersOpen?'active':''} onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal/> Bộ lọc</button>
      </div>
    </header>

    {error&&<div className="jury-toast error">{error}<button onClick={()=>setError('')}><X/></button></div>}
    {message&&<div className="jury-toast success">{message}<button onClick={()=>setMessage('')}><X/></button></div>}

    <section className={'jury-v2-layout '+(!filtersOpen?'queue-collapsed':'')}>
      <aside className="jury-v2-queue">
        <div className="jury-queue-search"><Search/><input value={draftFilters.q} onChange={e=>setDraftFilters(v=>({...v,q:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyFilters()} placeholder="Mã bài, tiêu đề, tác giả..."/><button onClick={applyFilters}><Filter/></button></div>
        {filtersOpen&&<div className="jury-advanced-filters">
          <div className="jury-filter-grid">
            <label>Trạng thái<select value={draftFilters.status} onChange={e=>setDraftFilters(v=>({...v,status:e.target.value}))}><option value="">Tất cả</option>{statuses.map(x=><option key={x} value={x}>{statusLabels[x]}</option>)}</select></label>
            <label>Tiến độ của tôi<select value={draftFilters.review} onChange={e=>setDraftFilters(v=>({...v,review:e.target.value}))}><option value="">Tất cả</option><option value="unscored">Chưa chấm</option><option value="draft">Đã lưu nháp</option><option value="scored">Đã chốt điểm</option><option value="conflict">Xung đột lợi ích</option></select></label>
            <label>Loại hình<select value={draftFilters.type} onChange={e=>setDraftFilters(v=>({...v,type:e.target.value}))}><option value="">Tất cả</option>{types.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Chủ đề<select value={draftFilters.theme} onChange={e=>setDraftFilters(v=>({...v,theme:e.target.value}))}><option value="">Tất cả</option>{themes.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Sắc màu<select value={draftFilters.color} onChange={e=>setDraftFilters(v=>({...v,color:e.target.value}))}><option value="">Tất cả</option>{colors.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Quyền sử dụng<select value={draftFilters.rights} onChange={e=>setDraftFilters(v=>({...v,rights:e.target.value}))}><option value="">Tất cả</option><option value="complete">Đủ quyền</option><option value="incomplete">Thiếu quyền</option></select></label>
            <label>Đề cử<select value={draftFilters.recommendation} onChange={e=>setDraftFilters(v=>({...v,recommendation:e.target.value}))}><option value="">Tất cả</option>{recommendations.slice(1).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
            <label>File<select value={draftFilters.hasMedia} onChange={e=>setDraftFilters(v=>({...v,hasMedia:e.target.value}))}><option value="">Tất cả</option><option value="true">Có file</option><option value="false">Thiếu file</option></select></label>
            <label>Điểm từ<input type="number" min="0" max="100" value={draftFilters.minScore} onChange={e=>setDraftFilters(v=>({...v,minScore:e.target.value}))}/></label>
            <label>Đến<input type="number" min="0" max="100" value={draftFilters.maxScore} onChange={e=>setDraftFilters(v=>({...v,maxScore:e.target.value}))}/></label>
            <label className="wide">Địa điểm<input value={draftFilters.location} onChange={e=>setDraftFilters(v=>({...v,location:e.target.value}))} placeholder="Hòa Lạc, Thạch Thất..."/></label>
            <label className="wide">Sắp xếp<select value={draftFilters.sort} onChange={e=>setDraftFilters(v=>({...v,sort:e.target.value}))}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="score_desc">Điểm cao → thấp</option><option value="score_asc">Điểm thấp → cao</option><option value="code">Theo mã bài</option></select></label>
          </div>
          <div className="jury-filter-actions"><button onClick={resetFilters}><RotateCcw/> Xóa lọc</button><button className="primary" onClick={applyFilters}><Filter/> Áp dụng</button></div>
        </div>}

        <div className="jury-queue-meta"><span>{loading?'Đang tải...':items.length+' tác phẩm'}</span><span>{currentIndex>=0?currentIndex+1:0}/{items.length}</span></div>
        <div className="jury-queue-list">
          {items.map((x,i)=><button key={x.id} className={(item?.id===x.id?'active ':'')+(x.my_score?.submitted?'scored ':'')+(x.my_score?.conflictOfInterest?'conflict':'')} onClick={()=>navigate('/jury/'+x.id)}>
            <span className="jury-queue-index">{String(i+1).padStart(2,'0')}</span>
            <div><b>{x.code}</b><strong>{x.title||'Tác phẩm chưa đặt tên'}</strong><small>{x.type} · {x.theme}</small></div>
            <div className="jury-queue-score">{x.my_score?.conflictOfInterest?<AlertTriangle/>:x.my_score?.submitted?<><b>{Math.round(x.my_score.weightedTotal)}</b><small>/100</small></>:x.avg_score>0?<><b>{Math.round(x.avg_score)}</b><small>AVG</small></>:<span>—</span>}</div>
          </button>)}
          {!items.length&&<div className="jury-empty-list"><Filter/><p>Không có tác phẩm phù hợp bộ lọc.</p></div>}
        </div>
      </aside>

      <section className="jury-v2-stage">
        {!item?<div className="jury-empty-stage"><ImageIcon/><h2>Không có tác phẩm</h2><p>Hãy thay đổi bộ lọc để tiếp tục.</p></div>:<>
          <div className="jury-stage-head">
            <div><span>{item.code} · {item.type}</span><h1>{item.title||'Tác phẩm chưa đặt tên'}</h1></div>
            <div className="jury-stage-head-meta"><span>{item.theme}</span><span>{item.location}</span><span className={'jury-status '+item.status.toLowerCase()}>{statusLabels[item.status]}</span></div>
          </div>

          <div className="jury-viewer" ref={viewerRef}>
            <div className="jury-viewer-toolbar">
              <span>{media.length?`${mediaIndex+1} / ${media.length}`:'0 file'}</span>
              <div><button onClick={()=>setZoom(v=>Math.max(.5,v-.25))}><ZoomOut/></button><b>{Math.round(zoom*100)}%</b><button onClick={()=>setZoom(v=>Math.min(3,v+.25))}><ZoomIn/></button><button onClick={()=>setZoom(1)}><RotateCcw/></button><button onClick={fullscreen}><Maximize2/></button><button onClick={openOriginal} disabled={!currentMedia}><Download/></button></div>
            </div>
            <div className="jury-viewer-canvas">
              {!mediaUrl?<div className="jury-media-placeholder"><MediaIcon mime={currentMime}/><p>{currentMedia?'Đang tải file preview...':'Tác phẩm chưa có file.'}</p></div>:
                currentMime.startsWith('video/')?<video src={mediaUrl} controls playsInline/>:
                currentMime.startsWith('image/')?<img src={mediaUrl} alt={item.title||item.code} style={{transform:`scale(${zoom})`}}/>:
                <div className="jury-media-placeholder"><FileText/><p>Định dạng này cần mở file gốc.</p><button onClick={openOriginal}>Mở original <ExternalLink/></button></div>}
            </div>
            {media.length>1&&<div className="jury-filmstrip">{media.map((m,i)=><button key={m.id} className={i===mediaIndex?'active':''} onClick={()=>setMediaIndex(i)}><MediaIcon mime={m.mimeType}/><span>{m.originalName||`File ${i+1}`}</span><small>{m.size?`${(Number(m.size)/1024/1024).toFixed(1)} MB`:''}</small></button>)}</div>}
          </div>

          <div className="jury-stage-story">
            <div><span className="eyebrow">CÂU CHUYỆN TÁC PHẨM</span><p>{item.story||'Chưa có câu chuyện.'}</p></div>
            <div className="jury-rights-summary">
              <span className={item.rights_confirmed?'ok':'warn'}>{item.rights_confirmed?<CheckCircle2/>:<AlertTriangle/>} Quyền tác giả</span>
              <span className={item.image_consent_confirmed?'ok':'warn'}>{item.image_consent_confirmed?<CheckCircle2/>:<AlertTriangle/>} Quyền hình ảnh</span>
              {item.is_minor&&<span className={item.guardian_consent?'ok':'warn'}>{item.guardian_consent?<CheckCircle2/>:<AlertTriangle/>} Giám hộ</span>}
            </div>
          </div>
        </>}
      </section>

      <aside className="jury-v2-panel">
        {!item?<div/>:<>
          <div className="jury-panel-head">
            <div><span className="eyebrow">PHIẾU CHẤM CỦA BẠN</span><h2>{total.toFixed(1)}<small>/100</small></h2></div>
            <div className="jury-average"><BarChart3/><span><b>{scorecard.aggregate?.average??'—'}</b><small>Điểm TB · {scorecard.aggregate?.count||0} GK</small></span></div>
          </div>

          <label className="jury-conflict"><input type="checkbox" checked={Boolean(score.conflictOfInterest)} onChange={e=>patchScore('conflictOfInterest',e.target.checked)}/><AlertTriangle/><span><b>Xung đột lợi ích</b><small>Đánh dấu nếu bạn không được phép chấm tác phẩm này.</small></span></label>

          <div className={'jury-score-fields '+(score.conflictOfInterest?'disabled':'')}>
            <div id="score-quality"><ScoreField label="Chất lượng thể hiện" weight="30" value={score.quality} disabled={score.conflictOfInterest} onChange={v=>patchScore('quality',v)}/></div>
            <div id="score-representation"><ScoreField label="Giá trị đại diện Hòa Lạc" weight="30" value={score.representation} disabled={score.conflictOfInterest} onChange={v=>patchScore('representation',v)}/></div>
            <div id="score-story"><ScoreField label="Câu chuyện" weight="20" value={score.story} disabled={score.conflictOfInterest} onChange={v=>patchScore('story',v)}/></div>
            <div id="score-creativity"><ScoreField label="Sáng tạo · góc nhìn riêng" weight="20" value={score.creativity} disabled={score.conflictOfInterest} onChange={v=>patchScore('creativity',v)}/></div>
          </div>

          <div className="jury-recommendation"><label>Đề cử của bạn<select disabled={score.conflictOfInterest} value={score.recommendation} onChange={e=>patchScore('recommendation',e.target.value)}>{recommendations.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>

          <label className="jury-note-v2">Nhận xét / ghi chú nội bộ<textarea rows="5" value={score.note||''} onChange={e=>patchScore('note',e.target.value)} placeholder="Điểm mạnh, điểm cần cân nhắc, lý do đề cử..."/></label>

          <div className="jury-save-actions"><button onClick={()=>saveScore(false)} disabled={saving}><Save/> Lưu nháp</button><button className="primary" onClick={()=>saveScore(true)} disabled={saving||score.conflictOfInterest}><ShieldCheck/> {saving?'Đang lưu':'Chốt điểm'}</button></div>

          <div className="jury-decision-block">
            <div><span className="eyebrow">QUYẾT ĐỊNH BTC</span><small>Tách biệt với điểm cá nhân của giám khảo.</small></div>
            <div className="jury-decision-grid">
              <button onClick={()=>setStatus('VALID')} className={item.status==='VALID'?'active':''}><CheckCircle2/> Hợp lệ</button>
              <button onClick={()=>setStatus('SHORTLIST')} className={item.status==='SHORTLIST'?'active':''}><Star/> Shortlist</button>
              <button onClick={()=>setStatus('TOP52')} className={item.status==='TOP52'?'active':''}><Bookmark/> TOP52</button>
              <button onClick={()=>setStatus('AWARDED')} className={item.status==='AWARDED'?'active':''}><Trophy/> Đạt giải</button>
              <button onClick={()=>setStatus('REJECTED')} className={'danger '+(item.status==='REJECTED'?'active':'')}><X/> Không hợp lệ</button>
            </div>
          </div>

          <details className="jury-info-details" open>
            <summary>Thông tin hồ sơ</summary>
            <dl>
              {!blind&&<><div><dt>Tác giả</dt><dd>{item.display_name||item.name}</dd></div><div><dt>Email</dt><dd>{item.email}</dd></div><div><dt>Điện thoại</dt><dd>{item.phone||'—'}</dd></div></>}
              <div><dt>Loại hình</dt><dd>{item.type}</dd></div><div><dt>Chủ đề</dt><dd>{item.theme}</dd></div><div><dt>Sắc màu</dt><dd>{item.color||'—'}</dd></div><div><dt>Địa điểm</dt><dd>{item.location}</dd></div><div><dt>Ngày sáng tác</dt><dd>{item.captured_at?new Date(item.captured_at).toLocaleDateString('vi-VN'):'—'}</dd></div><div><dt>File gốc</dt><dd>{media.length} file</dd></div>
            </dl>
          </details>

          <details className="jury-judges-details">
            <summary><Users/> Điểm từng giám khảo ({scorecard.judges?.length||0})</summary>
            <div>{(scorecard.judges||[]).map(j=><div key={j.id} className={j.conflictOfInterest?'conflict':''}><span><b>{j.name}</b><small>{j.conflictOfInterest?'Xung đột lợi ích':j.submitted?'Đã chốt':'Nháp'} · {j.recommendation}</small></span><strong>{j.conflictOfInterest?'—':j.weightedTotal}</strong></div>)}{!scorecard.judges?.length&&<p>Chưa có giám khảo nào lưu điểm.</p>}</div>
          </details>
        </>}
      </aside>
    </section>

    <footer className="jury-v2-nav">
      <button disabled={currentIndex<=0} onClick={()=>move(-1)}><ArrowLeft/> Bài trước</button>
      <span><b>{currentIndex>=0?currentIndex+1:0}</b> / {items.length}<small>← → chuyển bài · F toàn màn hình · S shortlist</small></span>
      <button disabled={currentIndex<0||currentIndex>=items.length-1} onClick={()=>move(1)}>Bài sau <ArrowRight/></button>
    </footer>
  </main>
}
