import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, Check, CheckCircle2, ExternalLink, Facebook, FileCheck2, FileUp, ImageOff, Link2, Loader2, RefreshCw, Search, ShieldCheck, Smartphone, Upload, Users } from 'lucide-react'
import { client } from '../services/api.js'

function mountBefore(selector,className){
  const anchor=document.querySelector(selector)
  if(!anchor)return null
  const parent=anchor.parentElement
  if(!parent)return null
  let mount=parent.querySelector(`:scope > .${className}`)
  if(!mount){mount=document.createElement('div');mount.className=className;parent.insertBefore(mount,anchor)}
  return mount
}

function useDomTarget(pathname,activePath,selector,className){
  const [target,setTarget]=useState(null)
  useEffect(()=>{
    if(!pathname.startsWith(activePath)){setTarget(null);return undefined}
    let observer
    const attach=()=>{
      const node=mountBefore(selector,className)
      if(node){setTarget(node);return true}
      return false
    }
    if(!attach()){
      observer=new MutationObserver(()=>{if(attach())observer.disconnect()})
      observer.observe(document.body,{childList:true,subtree:true})
    }
    return()=>observer?.disconnect()
  },[pathname,activePath,selector,className])
  return target
}

const ISSUE_LABELS={
  MISSING_MEDIA:'Chưa có ảnh / file',
  MISSING_FACEBOOK:'Chưa có link Facebook',
  UNVERIFIED_FACEBOOK:'Facebook chưa xác minh',
  PENDING_FACEBOOK:'Chưa hoàn tất Facebook',
  OUTREACH_ELIGIBLE:'Có dữ liệu Giải Lan tỏa'
}

function AdminOperations({pathname}){
  const target=useDomTarget(pathname,'/admin/submissions','.admin-workspace','submission-ops-admin-mount')
  const [overview,setOverview]=useState(null)
  const [items,setItems]=useState([])
  const [filters,setFilters]=useState({source:'',issue:'',q:''})
  const [selected,setSelected]=useState(null)
  const [edit,setEdit]=useState({url:'',reactions:0,comments:0,shares:0,verified:false})
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const load=async()=>{
    if(!target)return
    setLoading(true);setError('')
    try{
      const [overviewRes,listRes]=await Promise.all([
        client.get('/submission-operations/admin/overview'),
        client.get('/submission-operations/admin/list',{params:{source:filters.source||undefined,issue:filters.issue||undefined,q:filters.q||undefined,limit:120}})
      ])
      setOverview(overviewRes.data||{})
      setItems(Array.isArray(listRes.data)?listRes.data:[])
      if(selected){
        const refreshed=(listRes.data||[]).find(item=>item.id===selected.id)
        if(refreshed)selectItem(refreshed)
      }
    }catch(err){setError(err.response?.data?.error||err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{if(target)load()},[target,filters.source,filters.issue])

  const selectItem=item=>{
    setSelected(item)
    setEdit({
      url:item.facebook_post_url||'',
      reactions:Number(item.facebook_reactions||0),
      comments:Number(item.facebook_comments||0),
      shares:Number(item.facebook_shares||0),
      verified:Boolean(item.facebook_post_verified_at)
    })
  }

  const saveFacebook=async()=>{
    if(!selected)return
    setLoading(true);setError('')
    try{
      await client.patch(`/submission-operations/admin/${selected.id}/facebook`,edit)
      await load()
    }catch(err){setError(err.response?.data?.error||err.message)}
    finally{setLoading(false)}
  }

  if(!target)return null
  const cards=[
    ['Tất cả bài',overview?.total||0,'',Users],
    ['Facebook-only',overview?.facebook_only||0,'FACEBOOK_ONLY',Smartphone],
    ['Thiếu ảnh / file',overview?.missing_media||0,'MISSING_MEDIA',ImageOff],
    ['Thiếu Facebook',overview?.missing_facebook||0,'MISSING_FACEBOOK',Link2],
    ['Chưa xác minh',overview?.facebook_unverified||0,'UNVERIFIED_FACEBOOK',ShieldCheck],
    ['Đủ dữ liệu Lan tỏa',overview?.outreach_eligible||0,'OUTREACH_ELIGIBLE',Facebook]
  ]

  return createPortal(<section className="submission-ops-admin">
    <div className="submission-ops-head"><div><span>SUBMISSION & COMPETITION OS</span><h2>Trung tâm vận hành bài dự thi</h2><p>Web và Facebook cùng quy về một Mã dự thi. Theo dõi nhanh hồ sơ nào còn thiếu file, thiếu link Facebook hoặc chưa xác minh.</p></div><button onClick={load} disabled={loading}><RefreshCw className={loading?'spin':''}/> Làm mới</button></div>
    <div className="submission-ops-stats">{cards.map(([label,value,issue,Icon])=><button key={label} className={filters.issue===issue?'active':''} onClick={()=>setFilters(v=>({...v,issue:issue==='FACEBOOK_ONLY'?'':issue,source:issue==='FACEBOOK_ONLY'?'FACEBOOK':v.source}))}><Icon/><span>{label}</span><b>{value}</b></button>)}</div>
    <div className="submission-ops-toolbar"><label><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Mã dự thi, tên, email, SĐT..."/></label><select value={filters.source} onChange={e=>setFilters(v=>({...v,source:e.target.value}))}><option value="">Mọi nguồn</option><option value="WEB">Web</option><option value="FACEBOOK">Facebook-only</option></select><select value={filters.issue} onChange={e=>setFilters(v=>({...v,issue:e.target.value}))}><option value="">Mọi tình trạng</option>{Object.entries(ISSUE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button onClick={load}>Lọc</button></div>
    {error&&<div className="submission-ops-error">{error}</div>}
    <div className="submission-ops-layout">
      <div className="submission-ops-list">{items.slice(0,40).map(item=><button key={item.id} className={selected?.id===item.id?'selected':''} onClick={()=>selectItem(item)}><div><b>{item.code} · {item.title||'Chưa đặt tên'}</b><small>{item.display_name||item.name} · {item.email}</small><span><em>{item.submission_source==='FACEBOOK'?'Facebook-only':'Web'}</em>{item.media_count>0?<i className="good">Có file</i>:<i>Thiếu file</i>}{item.facebook_post_url?<i className="good">Có Facebook</i>:<i>Thiếu Facebook</i>}</span></div><strong>{item.outreachScore||0}<small>điểm lan tỏa</small></strong></button>)}{!items.length&&!loading&&<p>Không có bài nào trong bộ lọc này.</p>}</div>
      <aside className="submission-ops-detail">{selected?<><div className="ops-detail-title"><span>{selected.code}</span><h3>{selected.title}</h3><p>{selected.name} · {selected.phone||'Chưa có SĐT'}</p></div><div className="ops-detail-flags">{selected.issues?.length?selected.issues.map(issue=><span key={issue}><AlertTriangle/>{ISSUE_LABELS[issue]||issue}</span>):<span className="good"><CheckCircle2/>Hồ sơ vận hành đầy đủ</span>}</div><label>Link bài Facebook<input value={edit.url} onChange={e=>setEdit(v=>({...v,url:e.target.value}))} placeholder="https://www.facebook.com/..."/></label><div className="ops-metric-grid"><label>Reaction<input type="number" min="0" value={edit.reactions} onChange={e=>setEdit(v=>({...v,reactions:Number(e.target.value)}))}/></label><label>Bình luận<input type="number" min="0" value={edit.comments} onChange={e=>setEdit(v=>({...v,comments:Number(e.target.value)}))}/></label><label>Chia sẻ<input type="number" min="0" value={edit.shares} onChange={e=>setEdit(v=>({...v,shares:Number(e.target.value)}))}/></label></div><div className="ops-score">Điểm Lan tỏa = <b>{Number(edit.reactions||0)+Number(edit.comments||0)*2+Number(edit.shares||0)*3}</b></div><label className="ops-check"><input type="checkbox" checked={edit.verified} onChange={e=>setEdit(v=>({...v,verified:e.target.checked}))}/> Đã kiểm tra đúng link Facebook của Mã dự thi này</label><button className="ops-save" disabled={loading} onClick={saveFacebook}><Check/>Lưu xác minh & số liệu Facebook</button>{selected.facebook_post_url&&<a href={selected.facebook_post_url} target="_blank" rel="noreferrer"><ExternalLink/>Mở bài Facebook</a>}</>:<div className="ops-detail-empty"><FileCheck2/><b>Chọn một bài dự thi</b><span>Chi tiết Facebook và điểm Lan tỏa sẽ xuất hiện ở đây.</span></div>}</aside>
    </div>
  </section>,target)
}

function LookupOperations({pathname}){
  const target=useDomTarget(pathname,'/tra-cuu','.lookup-modern-result','submission-lookup-ops-mount')
  const [identity,setIdentity]=useState(null)
  const [state,setState]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [facebookUrl,setFacebookUrl]=useState('')
  const fileRef=useRef(null)

  const fetchState=async(nextIdentity=identity)=>{
    if(!nextIdentity?.code||!nextIdentity?.email)return
    setLoading(true);setError('')
    try{
      const {data}=await client.get('/submission-operations/state',{params:nextIdentity})
      setState(data);setFacebookUrl(data.facebook_post_url||'')
    }catch(err){setState(null);setError(err.response?.data?.error||'Chưa đọc được trạng thái hoàn thiện hồ sơ.')}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    if(!target)return
    const form=document.querySelector('.lookup-modern-form-card')
    if(!form)return
    const onSubmit=()=>{
      const inputs=form.querySelectorAll('input')
      const next={code:String(inputs[0]?.value||'').trim().toUpperCase(),email:String(inputs[1]?.value||'').trim()}
      setIdentity(next)
      window.setTimeout(()=>fetchState(next),250)
    }
    form.addEventListener('submit',onSubmit)
    return()=>form.removeEventListener('submit',onSubmit)
  },[target])

  const attachFacebook=async()=>{
    if(!identity||!facebookUrl)return
    setLoading(true);setError('')
    try{await client.post('/submissions/facebook-complete',{...identity,facebookPostUrl:facebookUrl});await fetchState(identity)}catch(err){setError(err.response?.data?.error||err.message)}finally{setLoading(false)}
  }

  const uploadFiles=async(event)=>{
    const files=Array.from(event.target.files||[])
    if(!identity||!files.length)return
    const body=new FormData();body.append('email',identity.email);files.forEach(file=>body.append('files',file))
    setLoading(true);setError('')
    try{const {data}=await client.post(`/submission-operations/${encodeURIComponent(identity.code)}/files`,body,{timeout:0});setState(data)}catch(err){setError(err.response?.data?.error||err.message)}finally{setLoading(false);event.target.value=''}
  }

  if(!target||(!state&&!loading&&!error))return null
  return createPortal(<section className="lookup-ops-card">
    {loading&&!state?<div className="lookup-ops-loading"><Loader2 className="spin"/>Đang kiểm tra mức hoàn thiện hồ sơ...</div>:state?<><div className="lookup-ops-head"><div><span>HỒ SƠ DỰ THI</span><h3>{state.code}</h3><p>{state.submission_source==='FACEBOOK'?'Khởi tạo từ Facebook':'Gửi đầy đủ trên web'} · hoàn thiện {state.completionPercent}%</p></div><div className="lookup-ops-ring"><b>{state.completionPercent}%</b></div></div><div className="lookup-ops-checklist"><div className={state.media_count>0?'done':''}>{state.media_count>0?<CheckCircle2/>:<ImageOff/>}<span><b>Ảnh / file gốc</b><small>{state.media_count>0?`${state.media_count} file đã lưu`:'Chưa bổ sung file'}</small></span></div><div className={state.facebook_post_url?'done':''}>{state.facebook_post_url?<CheckCircle2/>:<Link2/>}<span><b>Link Facebook</b><small>{state.facebook_post_url?'Đã gắn với Mã dự thi':'Chưa có link bài viết'}</small></span></div><div className={state.facebook_post_verified_at?'done':''}>{state.facebook_post_verified_at?<CheckCircle2/>:<ShieldCheck/>}<span><b>BTC xác minh Facebook</b><small>{state.facebook_post_verified_at?'Đã xác minh':'Đang chờ / chưa xác minh'}</small></span></div><div className={state.phone?'done':''}>{state.phone?<CheckCircle2/>:<AlertTriangle/>}<span><b>Thông tin liên hệ</b><small>{state.phone?'Đã có email + SĐT':'Cần bổ sung SĐT'}</small></span></div></div>{!state.media_count&&<div className="lookup-ops-action"><FileUp/><div><b>Bổ sung ảnh / file gốc</b><span>Bài Facebook-only có thể bổ sung file sau mà không đổi Mã dự thi.</span></div><button onClick={()=>fileRef.current?.click()}>Chọn file</button><input ref={fileRef} hidden multiple type="file" accept="image/*,video/*,.pdf,.doc,.docx,.mp3" onChange={uploadFiles}/></div>}{!state.facebook_post_url&&<div className="lookup-ops-facebook"><label>Link bài Facebook<input value={facebookUrl} onChange={e=>setFacebookUrl(e.target.value)} placeholder="https://www.facebook.com/groups/.../posts/..."/></label><button disabled={!facebookUrl||loading} onClick={attachFacebook}><Facebook/>Gắn link Facebook</button></div>}{state.facebook_post_url&&<a className="lookup-ops-facebook-link" href={state.facebook_post_url} target="_blank" rel="noreferrer"><Facebook/>Mở bài Facebook đã gắn <ExternalLink/></a>}<div className="lookup-ops-outreach"><span>Giải Lan tỏa</span><b>{state.outreachScore||0} điểm</b><small>{state.facebook_reactions||0} reaction · {state.facebook_comments||0} bình luận · {state.facebook_shares||0} chia sẻ</small></div></>:null}
    {error&&<div className="submission-ops-error">{error}</div>}
  </section>,target)
}

function ArtworkOutreach({pathname}){
  const isArtwork=pathname.startsWith('/tac-pham/')&&!pathname.startsWith('/tac-pham/xem-truoc/')
  const target=useDomTarget(pathname,isArtwork?'/tac-pham/':'/__none__','.artwork-showcase-actions','artwork-outreach-mount')
  const [item,setItem]=useState(null)
  useEffect(()=>{
    if(!isArtwork||!target)return
    const slug=decodeURIComponent(pathname.split('/').filter(Boolean).pop()||'')
    client.get('/artworks/'+encodeURIComponent(slug)).then(({data})=>{
      setItem(data)
      const badge=document.querySelector('.artwork-status-badge')
      if(badge){badge.textContent=data.status==='AWARDED'?'ĐẠT GIẢI':data.status==='TOP52'?'TOP52':data.status==='SHORTLIST'?'SHORTLIST':'GÓC NHÌN CỘNG ĐỒNG'}
    }).catch(()=>{})
  },[pathname,target,isArtwork])
  if(!target||!item)return null
  return createPortal(<div className="artwork-outreach-card"><div><span>LAN TỎA CỘNG ĐỒNG</span><b>{item.outreachScore||0} điểm</b><small>{item.facebookReactions||0} reaction · {item.facebookComments||0} bình luận · {item.facebookShares||0} chia sẻ</small></div>{item.facebookPostUrl?<a href={item.facebookPostUrl} target="_blank" rel="noreferrer"><Facebook/>Xem bài Facebook gốc <ExternalLink/></a>:<span className="artwork-no-facebook">Bài chưa công khai link Facebook</span>}</div>,target)
}

export default function SubmissionOperationsRuntime(){
  const {pathname}=useLocation()
  return <><AdminOperations pathname={pathname}/><LookupOperations pathname={pathname}/><ArtworkOutreach pathname={pathname}/></>
}
