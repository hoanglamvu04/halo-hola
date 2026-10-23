import { useEffect, useMemo, useState } from 'react'
import { Camera, KeyRound, Plus, RefreshCw, Save, UserCheck, UserX } from 'lucide-react'
import {
  getAdminPhotographers,createAdminPhotographer,updateAdminPhotographer,
  resetAdminPhotographerPassword,getAdminPhotographerShoots,getAdminPhotographerAssets
} from '../services/api.js'
import './PhotographerManager.css'

const empty={name:'',email:'',password:'',phone:'',notes:'',sortOrder:0,accountStatus:'ACTIVE'}
const bytes=v=>{const n=Number(v||0);return n>1024**3?(n/1024**3).toFixed(2)+' GB':(n/1024**2).toFixed(1)+' MB'}

export default function PhotographerManager(){
  const [people,setPeople]=useState([])
  const [shoots,setShoots]=useState([])
  const [assets,setAssets]=useState([])
  const [selectedId,setSelectedId]=useState('')
  const [selectedShoot,setSelectedShoot]=useState('')
  const [form,setForm]=useState(empty)
  const [reset,setReset]=useState('')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)

  const selected=useMemo(()=>people.find(x=>x.id===selectedId)||null,[people,selectedId])

  const load=async(preferred=selectedId)=>{
    setLoading(true);setError('')
    try{
      const list=await getAdminPhotographers()
      setPeople(list)
      const id=preferred||list[0]?.id||''
      setSelectedId(id)
      if(id){
        const [s,a]=await Promise.all([
          getAdminPhotographerShoots({photographerId:id}),
          getAdminPhotographerAssets({photographerId:id})
        ])
        setShoots(s);setAssets(a)
      }else{setShoots([]);setAssets([])}
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }
  useEffect(()=>{load('')},[])

  const choose=async p=>{
    setSelectedId(p.id);setSelectedShoot('');setReset('');setMessage('')
    setForm({name:p.name||'',email:p.email||'',password:'',phone:p.phone||'',notes:p.notes||'',sortOrder:p.sortOrder||0,accountStatus:p.accountStatus||'ACTIVE'})
    try{
      const [s,a]=await Promise.all([getAdminPhotographerShoots({photographerId:p.id}),getAdminPhotographerAssets({photographerId:p.id})])
      setShoots(s);setAssets(a)
    }catch(err){setError(err.message)}
  }

  const createNew=()=>{setSelectedId('');setSelectedShoot('');setForm(empty);setShoots([]);setAssets([]);setMessage('');setError('')}

  const save=async()=>{
    setLoading(true);setError('');setMessage('')
    try{
      if(selectedId){
        await updateAdminPhotographer(selectedId,form);setMessage('Đã lưu tài khoản đội ảnh.')
      }else{
        const created=await createAdminPhotographer(form);setSelectedId(created.id);setMessage('Đã tạo tài khoản đội ảnh.')
      }
      await load(selectedId)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const resetPass=async()=>{
    if(!selectedId||reset.length<8)return
    try{await resetAdminPhotographerPassword(selectedId,reset);setReset('');setMessage('Đã đặt lại mật khẩu.')}
    catch(err){setError(err.message)}
  }

  const filterShoot=async id=>{
    setSelectedShoot(id)
    try{setAssets(await getAdminPhotographerAssets({photographerId:selectedId,shootId:id||undefined}))}
    catch(err){setError(err.message)}
  }

  return <div className="photo-admin">
    <div className="admin-panel photo-admin-hero">
      <div><span className="eyebrow">ĐỘI NHIẾP ẢNH</span><h2>Kho tác nghiệp</h2><p>Cấp tài khoản, theo dõi buổi chụp và xem ảnh theo từng nhiếp ảnh gia.</p></div>
      <div><a className="btn btn-outline" href="/tac-nghiep" target="_blank" rel="noreferrer"><Camera/> Mở khu tác nghiệp</a><button className="btn btn-green" onClick={createNew}><Plus/> Thêm tài khoản</button></div>
    </div>
    {error&&<div className="form-error">{error}</div>}
    {message&&<div className="cms-message">{message}</div>}

    <div className="photo-admin-layout">
      <section className="admin-panel photo-admin-people">
        <div className="photo-admin-head"><h3>Tài khoản</h3><button className="icon-btn" onClick={()=>load()}><RefreshCw/></button></div>
        {people.map(p=><button key={p.id} className={selectedId===p.id?'active':''} onClick={()=>choose(p)}>
          <span className="avatar">{(p.name||p.email).charAt(0).toUpperCase()}</span>
          <div><b>{p.name}</b><small>{p.email}</small><small>{p.shootCount||0} buổi · {p.assetCount||0} file · {bytes(p.totalBytes)}</small></div>
          <i className={p.accountStatus==='ACTIVE'?'on':'off'}>{p.accountStatus==='ACTIVE'?<UserCheck/>:<UserX/>}</i>
        </button>)}
        {!people.length&&<p>Chưa có tài khoản nhiếp ảnh.</p>}
      </section>

      <section className="admin-panel photo-admin-editor">
        <div className="photo-admin-head"><div><span className="eyebrow">{selectedId?'TÀI KHOẢN':'TẠO TÀI KHOẢN'}</span><h3>{selectedId?(selected?.name||form.name):'Nhiếp ảnh gia mới'}</h3></div></div>
        <div className="photo-admin-form">
          <label>Họ tên<input value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
          <label>Email đăng nhập<input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
          {!selectedId&&<label>Mật khẩu ban đầu<input type="password" value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))}/></label>}
          <label>Số điện thoại<input value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
          <label>Trạng thái<select value={form.accountStatus} onChange={e=>setForm(v=>({...v,accountStatus:e.target.value}))}><option value="ACTIVE">Hoạt động</option><option value="SUSPENDED">Khóa</option></select></label>
          <label>Thứ tự<input type="number" value={form.sortOrder} onChange={e=>setForm(v=>({...v,sortOrder:Number(e.target.value)}))}/></label>
          <label className="wide">Ghi chú<textarea rows="2" value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))}/></label>
        </div>
        <button className="btn btn-green" onClick={save} disabled={loading}><Save/> Lưu tài khoản</button>
        {selectedId&&<div className="photo-admin-reset"><KeyRound/><input type="password" value={reset} onChange={e=>setReset(e.target.value)} placeholder="Mật khẩu mới ≥ 8 ký tự"/><button onClick={resetPass} disabled={reset.length<8}>Đặt lại</button></div>}
      </section>
    </div>

    {selectedId&&<section className="admin-panel photo-admin-library">
      <div className="photo-admin-head"><div><span className="eyebrow">ALBUM & ẢNH</span><h3>{selected?.name}</h3></div><select value={selectedShoot} onChange={e=>filterShoot(e.target.value)}><option value="">Tất cả buổi chụp</option>{shoots.map(s=><option key={s.id} value={s.id}>{s.captured_on?.slice(0,10)} · {s.title}</option>)}</select></div>
      <div className="photo-admin-shoots">{shoots.map(s=><button key={s.id} onClick={()=>filterShoot(s.id)}><b>{s.title}</b><small>{s.captured_on?.slice(0,10)} · {s.place_name}</small><span>{s.asset_count||0} file</span></button>)}</div>
      <div className="photo-admin-assets">{assets.map(a=><article key={a.id}>{a.previewable&&a.url?<img src={a.url} alt={a.original_name}/>:<div><Camera/></div>}<b>{a.original_name}</b><small>{a.shoot_title} · {bytes(a.size_bytes)}</small>{a.url&&<a href={a.url} target="_blank" rel="noreferrer">Mở file gốc</a>}</article>)}</div>
      {!assets.length&&<p>Chưa có ảnh trong phạm vi đang chọn.</p>}
    </section>}
  </div>
}
