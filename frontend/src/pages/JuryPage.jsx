import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, Star, Save, EyeOff } from 'lucide-react'
import { getAdminSubmissions, getAdminToken, getOriginalDownload, updateJuryNote, updateSubmissionStatus } from '../services/api.js'

export default function JuryPage(){
  const token=getAdminToken()
  const [items,setItems]=useState([])
  const [index,setIndex]=useState(0)
  const [blind,setBlind]=useState(true)
  const [mediaUrl,setMediaUrl]=useState('')
  const [note,setNote]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{
    if(!token) return
    getAdminSubmissions().then(data=>setItems(data)).catch(err=>setError(err.message))
  },[token])

  const item=items[index]
  const media=item?.media?.[0]
  const progress=useMemo(()=>items.length?Math.round(((index+1)/items.length)*100):0,[index,items.length])

  useEffect(()=>{
    setMediaUrl('')
    setNote(item?.jury_note||'')
    if(media?.id){
      getOriginalDownload(media.id).then(data=>setMediaUrl(data.url)).catch(()=>setMediaUrl(''))
    }
  },[item?.id,media?.id])

  const setStatus=async(status)=>{
    if(!item) return
    await updateSubmissionStatus(item.id,status)
    setItems(v=>v.map(x=>x.id===item.id?{...x,status}:x))
  }

  const saveNote=async()=>{
    if(!item) return
    await updateJuryNote(item.id,note)
    setItems(v=>v.map(x=>x.id===item.id?{...x,jury_note:note}:x))
  }

  useEffect(()=>{
    const onKey=(e)=>{
      if(e.target?.tagName==='TEXTAREA'||e.target?.tagName==='INPUT') return
      if(e.key==='ArrowRight') setIndex(v=>Math.min(items.length-1,v+1))
      if(e.key==='ArrowLeft') setIndex(v=>Math.max(0,v-1))
      if(e.key.toLowerCase()==='s') setStatus('SHORTLIST')
    }
    window.addEventListener('keydown',onKey)
    return ()=>window.removeEventListener('keydown',onKey)
  },[items.length,item?.id])

  if(!token) return <main className="jury-login"><div><EyeOff/><h1>Jury Mode</h1><p>Đăng nhập quản trị trước để truy cập chế độ chấm.</p><Link className="btn btn-green" to="/admin">Đăng nhập Admin</Link></div></main>

  if(error) return <main className="jury-login"><div><p>{error}</p></div></main>
  if(!item) return <main className="jury-login"><div><h1>Jury Mode</h1><p>Chưa có tác phẩm để chấm.</p></div></main>

  return <main className="jury-page">
    <header className="jury-top"><div><b>HALO HOLA · JURY MODE</b><span>{index+1} / {items.length}</span></div><div className="jury-progress"><i style={{width:progress+'%'}}/></div><button onClick={()=>setBlind(v=>!v)}>{blind?'Blind ON':'Blind OFF'}</button></header>
    <section className="jury-layout">
      <div className="jury-media">{mediaUrl?<img src={mediaUrl} alt={item.title}/>:<div className="jury-placeholder">Không có preview trực tiếp</div>}</div>
      <aside className="jury-panel">
        <span className="eyebrow">{item.code} · {item.theme}</span>
        <h1>{item.title||'Tác phẩm chưa đặt tên'}</h1>
        {!blind&&<p className="jury-author">{item.display_name||item.name} · {item.email}</p>}
        <div className="chip-wrap"><span>{item.type}</span><span>{item.location}</span><span>{item.color}</span></div>
        <div className="jury-story"><h3>Câu chuyện</h3><p>{item.story}</p></div>
        <div className="jury-meta"><div><small>Original</small><b>{item.media?.length||0} file</b></div><div><small>Trạng thái</small><b>{item.status}</b></div></div>
        {media&&<button className="btn btn-outline" onClick={async()=>{const d=await getOriginalDownload(media.id);window.open(d.url,'_blank')}}><Download size={16}/> Mở original</button>}
        <textarea className="jury-note" rows="5" value={note} onChange={e=>setNote(e.target.value)} placeholder="Ghi chú của BGK..."/>
        <div className="jury-actions"><button className="btn btn-outline" onClick={()=>setStatus('VALID')}>Hợp lệ</button><button className="btn btn-terra" onClick={()=>setStatus('SHORTLIST')}><Star size={16}/> Shortlist</button><button className="btn btn-green" onClick={saveNote}><Save size={16}/> Lưu ghi chú</button></div>
      </aside>
    </section>
    <footer className="jury-nav"><button onClick={()=>setIndex(v=>Math.max(0,v-1))}><ArrowLeft/> Trước</button><span>← / → để chuyển · S để shortlist</span><button onClick={()=>setIndex(v=>Math.min(items.length-1,v+1))}>Tiếp <ArrowRight/></button></footer>
  </main>
}
