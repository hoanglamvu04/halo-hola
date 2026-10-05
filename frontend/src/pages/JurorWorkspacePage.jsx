import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, Eye, EyeOff, Filter, LogIn, Save, Search, ShieldCheck, Star, Trophy, UserX } from 'lucide-react'
import {
  adminLogin,getAdminToken,setAdminToken,getCurrentUser,getJurySubmissions,getJuryStats,
  getJuryScorecard,saveJuryScore,getJuryMediaDownload,updateSubmissionStatus
} from '../services/api.js'
import './JurorWorkspacePage.css'

const statuses=['PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED']
const statusLabels={PENDING:'Mới nhận',VALID:'Hợp lệ',SHORTLIST:'Shortlist',TOP52:'TOP52',AWARDED:'Đạt giải',REJECTED:'Không hợp lệ'}
const themes=['Nét Đoài tại Hòa Lạc','Sắc Mường Hòa Lạc','Không gian Kiến trúc Hòa Lạc','Hòa Lạc xanh','Nắng Hòa Lạc','Câu chuyện Hòa Lạc','Ước mơ Hòa Lạc','Sắc màu Hòa Lạc']
const types=['Photo','Video','Story & Creative','Art & Design']
const emptyScore={quality:0,representation:0,story:0,creativity:0,recommendation:'NONE',conflictOfInterest:false,note:'',submitted:false}

function weighted(s){return Math.round((Number(s.quality||0)*3+Number(s.representation||0)*3+Number(s.story||0)*2+Number(s.creativity||0)*2)*100)/100}
function Score({label,weight,value,onChange,disabled}){return <label className="jw-score"><span>{label}<small>{weight}%</small><b>{Number(value||0).toFixed(1)}</b></span><input disabled={disabled} type="range" min="0" max="10" step="0.5" value={value||0} onChange={e=>onChange(Number(e.target.value))}/></label>}

export default function JurorWorkspacePage(){
  const {submissionId}=useParams()
  const navigate=useNavigate()
  const [token,setToken]=useState(()=>getAdminToken()||'')
  const [user,setUser]=useState(null)
  const [credentials,setCredentials]=useState({email:'',password:''})
  const [items,setItems]=useState([])
  const [stats,setStats]=useState({})
  const [filters,setFilters]=useState({q:'',status:'',review:'',type:'',theme:'',sort:'newest'})
  const [score,setScore]=useState(emptyScore)
  const [scorecard,setScorecard]=useState({judges:[],aggregate:{}})
  const [mediaUrl,setMediaUrl]=useState('')
  const [mediaIndex,setMediaIndex]=useState(0)
  const [blind,setBlind]=useState(true)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)

  const item=useMemo(()=>items.find(x=>x.id===submissionId)||items[0]||null,[items,submissionId])
  const idx=useMemo(()=>item?items.findIndex(x=>x.id===item.id):-1,[items,item])
  const media=item?.media||[]
  const currentMedia=media[mediaIndex]||media[0]
  const isManager=['ADMIN','MODERATOR'].includes(user?.role)

  const load=async(next=filters)=>{
    if(!token)return
    setLoading(true);setError('')
    try{
      const [me,list,nextStats]=await Promise.all([getCurrentUser(),getJurySubmissions(next),getJuryStats()])
      if(!['JUROR','MODERATOR','ADMIN'].includes(me.user?.role)) throw new Error('Tài khoản này không có quyền vào Hội đồng giám khảo.')
      setUser(me.user);setItems(list||[]);setStats(nextStats||{})
      if(list?.length&&(!submissionId||!list.some(x=>x.id===submissionId))) navigate('/jury/'+list[0].id,{replace:true})
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  useEffect(()=>{if(token)load()},[token])

  useEffect(()=>{
    if(!item)return
    setMediaIndex(0);setMediaUrl('');setMessage('')
    getJuryScorecard(item.id).then(card=>{setScorecard(card||{judges:[],aggregate:{}});setScore({...emptyScore,...(card?.mine||{})})}).catch(err=>setError(err.message))
  },[item?.id])

  useEffect(()=>{
    let cancel=false;setMediaUrl('')
    if(!currentMedia?.id)return
    getJuryMediaDownload(currentMedia.id).then(x=>{if(!cancel)setMediaUrl(x.url)}).catch(()=>{})
    return()=>{cancel=true}
  },[currentMedia?.id])

  const login=async e=>{
    e.preventDefault();setLoading(true);setError('')
    try{
      const data=await adminLogin(credentials)
      if(!['JUROR','MODERATOR','ADMIN'].includes(data.user?.role)) throw new Error('Tài khoản này không thuộc Hội đồng giám khảo.')
      setAdminToken(data.token);setToken(data.token);setUser(data.user)
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  const logout=()=>{setAdminToken(null);setToken('');setUser(null);setItems([])}
  const move=d=>{const n=Math.max(0,Math.min(items.length-1,idx+d));if(items[n])navigate('/jury/'+items[n].id)}
  const patch=(k,v)=>setScore(s=>({...s,[k]:v,submitted:k==='conflictOfInterest'&&v?false:s.submitted}))
  const save=async submitted=>{
    if(!item)return
    setLoading(true);setError('');setMessage('')
    try{
      const saved=await saveJuryScore(item.id,{...score,submitted:submitted&&!score.conflictOfInterest})
      const card=await getJuryScorecard(item.id);setScore({...emptyScore,...saved});setScorecard(card);setStats(await getJuryStats());setMessage(submitted?'Đã chốt điểm.':'Đã lưu nháp.')
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  const moderate=async status=>{if(!item||!isManager)return;try{await updateSubmissionStatus(item.id,status);setItems(v=>v.map(x=>x.id===item.id?{...x,status}:x));setMessage('Đã đổi trạng thái: '+statusLabels[status])}catch(err){setError(err.message)}}

  if(!token)return <main className="jw-login"><form onSubmit={login}><div className="jw-login-brand">HAL<span>O</span> HOLA</div><ShieldCheck/><h1>Đăng nhập Hội đồng</h1><p>Tài khoản giám khảo được tạo bởi Ban tổ chức.</p><input type="email" placeholder="Email giám khảo" value={credentials.email} onChange={e=>setCredentials(v=>({...v,email:e.target.value}))}/><input type="password" placeholder="Mật khẩu" value={credentials.password} onChange={e=>setCredentials(v=>({...v,password:e.target.value}))}/>{error&&<div className="form-error">{error}</div>}<button className="btn btn-green" disabled={loading}><LogIn size={17}/>{loading?'Đang đăng nhập...':'Vào Review Workspace'}</button></form></main>

  return <main className="jw-shell">
    <header className="jw-top"><div><Link to={isManager?'/admin/jury-board':'/'}><ArrowLeft/> {isManager?'Admin':'HALO HOLA'}</Link><div><b>HALO HOLA · JURY 2026</b><small>{user?.name} · {user?.role}</small></div></div><div className="jw-stats"><span><b>{stats.total||0}</b><small>Tổng</small></span><span><b>{stats.my_scored||0}</b><small>Đã chấm</small></span><span><b>{stats.my_unscored||0}</b><small>Chưa chấm</small></span><span><b>{stats.my_conflicts||0}</b><small>COI</small></span></div><div><button onClick={()=>setBlind(v=>!v)}>{blind?<EyeOff/>:<Eye/>}{blind?'Blind ON':'Blind OFF'}</button><button onClick={logout}>Đăng xuất</button></div></header>

    {error&&<div className="jw-alert error">{error}</div>}{message&&<div className="jw-alert success">{message}</div>}
    <div className="jw-layout">
      <aside className="jw-queue">
        <div className="jw-filter"><div><Search/><input placeholder="Mã bài, tiêu đề..." value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))}/></div><select value={filters.review} onChange={e=>setFilters(v=>({...v,review:e.target.value}))}><option value="">Tất cả tiến độ</option><option value="unscored">Chưa chấm</option><option value="draft">Đã lưu nháp</option><option value="scored">Đã chốt</option><option value="conflict">Xung đột</option></select><select value={filters.status} onChange={e=>setFilters(v=>({...v,status:e.target.value}))}><option value="">Tất cả trạng thái</option>{statuses.map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select><select value={filters.type} onChange={e=>setFilters(v=>({...v,type:e.target.value}))}><option value="">Tất cả loại hình</option>{types.map(t=><option key={t}>{t}</option>)}</select><select value={filters.theme} onChange={e=>setFilters(v=>({...v,theme:e.target.value}))}><option value="">Tất cả chủ đề</option>{themes.map(t=><option key={t}>{t}</option>)}</select><button onClick={()=>load(filters)}><Filter/> Áp dụng</button></div>
        <div className="jw-queue-meta"><b>{items.length} tác phẩm</b><span>{idx+1}/{items.length}</span></div>
        <div className="jw-list">{items.map(x=><button key={x.id} className={x.id===item?.id?'active':''} onClick={()=>navigate('/jury/'+x.id)}><div><b>{x.code}</b><span>{x.my_score?.submitted?'Đã chốt':x.my_score?'Nháp':'Chưa chấm'}</span></div><strong>{x.title||'Chưa đặt tên'}</strong><small>{x.theme} · {x.type}</small><div><em>{Number(x.avg_score||0).toFixed(1)}</em><small>{x.score_count||0} phiếu</small></div></button>)}</div>
      </aside>

      <section className="jw-viewer">
        {!item?<div className="jw-empty">Không có tác phẩm phù hợp bộ lọc.</div>:<>
          <div className="jw-viewer-head"><div><span>{item.code}</span><h1>{item.title||'Tác phẩm chưa đặt tên'}</h1>{!blind&&<p>{item.display_name||item.name} · {item.email}</p>}<small>{item.theme} · {item.type} · {item.location}</small></div><div><button disabled={idx<=0} onClick={()=>move(-1)}><ArrowLeft/></button><button disabled={idx>=items.length-1} onClick={()=>move(1)}><ArrowRight/></button></div></div>
          <div className="jw-media">{mediaUrl?(currentMedia?.mimeType||'').startsWith('video/')?<video src={mediaUrl} controls/>:<img src={mediaUrl} alt={item.title}/>:<div>Không có preview trực tiếp</div>}</div>
          {media.length>1&&<div className="jw-thumbs">{media.map((m,i)=><button key={m.id} className={i===mediaIndex?'active':''} onClick={()=>setMediaIndex(i)}>{i+1}</button>)}</div>}
          <div className="jw-viewer-actions"><button onClick={async()=>{if(currentMedia?.id){const d=await getJuryMediaDownload(currentMedia.id);window.open(d.url,'_blank')}}}><Download/> Mở original</button></div>
          <article className="jw-story"><h3>Câu chuyện tác phẩm</h3><p>{item.story}</p></article>
        </>}
      </section>

      <aside className="jw-panel">
        {item&&<>
          <div className="jw-score-head"><div><span>PHIẾU CHẤM CỦA TÔI</span><h2>{weighted(score).toFixed(1)}<small>/100</small></h2></div>{score.submitted&&<b>ĐÃ CHỐT</b>}</div>
          <Score label="Chất lượng thể hiện" weight="30" value={score.quality} onChange={v=>patch('quality',v)} disabled={score.conflictOfInterest}/><Score label="Đại diện Hòa Lạc" weight="30" value={score.representation} onChange={v=>patch('representation',v)} disabled={score.conflictOfInterest}/><Score label="Câu chuyện" weight="20" value={score.story} onChange={v=>patch('story',v)} disabled={score.conflictOfInterest}/><Score label="Sáng tạo / góc nhìn" weight="20" value={score.creativity} onChange={v=>patch('creativity',v)} disabled={score.conflictOfInterest}/>
          <label className="jw-field">Đề cử<select disabled={score.conflictOfInterest} value={score.recommendation} onChange={e=>patch('recommendation',e.target.value)}><option value="NONE">Không đề cử</option><option value="SHORTLIST">Shortlist</option><option value="TOP52">TOP52</option><option value="RESERVE">Dự bị</option><option value="AWARD">Đề cử giải</option></select></label>
          <label className="jw-coi"><input type="checkbox" checked={score.conflictOfInterest} onChange={e=>patch('conflictOfInterest',e.target.checked)}/><UserX/><span><b>Xung đột lợi ích</b><small>Bài này sẽ không tính điểm của bạn.</small></span></label>
          <label className="jw-field">Nhận xét<textarea rows="5" value={score.note||''} onChange={e=>patch('note',e.target.value)} placeholder="Nhận xét chuyên môn, điểm mạnh/yếu..."/></label>
          <div className="jw-actions"><button onClick={()=>save(false)} disabled={loading}><Save/> Lưu nháp</button><button className="primary" onClick={()=>save(true)} disabled={loading||score.conflictOfInterest}><ShieldCheck/> Chốt điểm</button></div>
          <div className="jw-aggregate"><div><b>{scorecard.aggregate?.average==null?'—':Number(scorecard.aggregate.average).toFixed(1)}</b><small>Điểm TB hội đồng</small></div><div><b>{scorecard.aggregate?.count||0}</b><small>Phiếu đã chốt</small></div><div><b>{scorecard.aggregate?.min==null?'—':Number(scorecard.aggregate.min).toFixed(1)}</b><small>Thấp nhất</small></div><div><b>{scorecard.aggregate?.max==null?'—':Number(scorecard.aggregate.max).toFixed(1)}</b><small>Cao nhất</small></div></div>
          {isManager&&<div className="jw-moderation"><b>Quyết định BTC</b><div><button onClick={()=>moderate('VALID')}>Hợp lệ</button><button onClick={()=>moderate('SHORTLIST')}><Star/> Shortlist</button><button onClick={()=>moderate('TOP52')}>TOP52</button><button onClick={()=>moderate('AWARDED')}><Trophy/> Đạt giải</button></div></div>}
        </>}
      </aside>
    </div>
  </main>
}
