import { useEffect, useMemo, useState } from 'react'
import { Camera, ExternalLink, KeyRound, Plus, RefreshCw, Save, UserCheck, UserX } from 'lucide-react'
import {
  getAdminPhotographers,createAdminPhotographer,updateAdminPhotographer,
  resetAdminPhotographerPassword,getAdminPhotographerShoots
} from '../services/api.js'
import './PhotographerManager.css'

const empty={name:'',email:'',password:'',phone:'',notes:'',sortOrder:0,accountStatus:'ACTIVE'}

export default function PhotographerManager(){
  const [people,setPeople]=useState([])
  const [shoots,setShoots]=useState([])
  const [selectedId,setSelectedId]=useState('')
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
      setShoots(id?await getAdminPhotographerShoots({photographerId:id}):[])
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{load('')},[])

  const choose=async p=>{
    setSelectedId(p.id);setReset('');setMessage('');setError('')
    setForm({
      name:p.name||'',
      email:p.email||'',
      password:'',
      phone:p.phone||'',
      notes:p.notes||'',
      sortOrder:p.sortOrder||0,
      accountStatus:p.accountStatus||'ACTIVE'
    })
    try{setShoots(await getAdminPhotographerShoots({photographerId:p.id}))}
    catch(err){setError(err.message)}
  }

  const createNew=()=>{
    setSelectedId('')
    setForm(empty)
    setShoots([])
    setMessage('')
    setError('')
  }

  const save=async()=>{
    setLoading(true);setError('');setMessage('')
    try{
      if(selectedId){
        await updateAdminPhotographer(selectedId,form)
        setMessage('Đã lưu tài khoản đội ảnh.')
        await load(selectedId)
      }else{
        const created=await createAdminPhotographer(form)
        setMessage('Đã tạo tài khoản đội ảnh.')
        await load(created.id)
      }
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const resetPass=async()=>{
    if(!selectedId||reset.length<8)return
    try{
      await resetAdminPhotographerPassword(selectedId,reset)
      setReset('')
      setMessage('Đã đặt lại mật khẩu.')
    }catch(err){setError(err.message)}
  }

  return <div className="photo-admin">
    <div className="admin-panel photo-admin-hero">
      <div>
        <span className="eyebrow">ĐỘI NHIẾP ẢNH</span>
        <h2>Điểm chụp & Google Drive</h2>
        <p>Cấp tài khoản và nhận link thư mục ảnh theo từng địa điểm. Nội dung, caption và câu chuyện được biên tập riêng sau.</p>
      </div>
      <div>
        <a className="btn btn-outline" href="/tac-nghiep" target="_blank" rel="noreferrer"><Camera/> Mở khu tác nghiệp</a>
        <button className="btn btn-green" onClick={createNew}><Plus/> Thêm tài khoản</button>
      </div>
    </div>

    {error&&<div className="form-error">{error}</div>}
    {message&&<div className="cms-message">{message}</div>}

    <div className="photo-admin-layout">
      <section className="admin-panel photo-admin-people">
        <div className="photo-admin-head">
          <h3>Tài khoản</h3>
          <button className="icon-btn" onClick={()=>load()}><RefreshCw/></button>
        </div>
        {people.map(p=><button key={p.id} className={selectedId===p.id?'active':''} onClick={()=>choose(p)}>
          <span className="avatar">{(p.name||p.email).charAt(0).toUpperCase()}</span>
          <div>
            <b>{p.name}</b>
            <small>{p.email}</small>
            <small>{p.shootCount||0} lần đã gửi</small>
          </div>
          <i className={p.accountStatus==='ACTIVE'?'on':'off'}>{p.accountStatus==='ACTIVE'?<UserCheck/>:<UserX/>}</i>
        </button>)}
        {!people.length&&<p>Chưa có tài khoản nhiếp ảnh.</p>}
      </section>

      <section className="admin-panel photo-admin-editor">
        <div className="photo-admin-head">
          <div>
            <span className="eyebrow">{selectedId?'TÀI KHOẢN':'TẠO TÀI KHOẢN'}</span>
            <h3>{selectedId?(selected?.name||form.name):'Nhiếp ảnh gia mới'}</h3>
          </div>
        </div>
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
      <div className="photo-admin-head">
        <div><span className="eyebrow">THƯ MỤC ĐÃ GỬI</span><h3>{selected?.name}</h3></div>
        <b>{shoots.length} lần</b>
      </div>
      <div className="photo-admin-drive-list">
        {shoots.map(s=><article key={s.id}>
          <div><small>{s.captured_on?.slice(0,10)}</small><b>{s.place_name}</b>{s.notes&&<p>{s.notes}</p>}</div>
          <a href={s.drive_url} target="_blank" rel="noreferrer">Mở Google Drive <ExternalLink/></a>
        </article>)}
        {!shoots.length&&<p>Chưa có thư mục nào được gửi.</p>}
      </div>
    </section>}
  </div>
}
