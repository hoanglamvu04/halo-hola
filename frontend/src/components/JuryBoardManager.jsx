import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, Search, ShieldCheck, UserCheck, UserX, KeyRound, Save, Trash2, ExternalLink, AlertTriangle } from 'lucide-react'
import {
  getAdminJuryBoard,getAdminJuryBoardSummary,createAdminJuror,updateAdminJuror,
  resetAdminJurorPassword,deleteAdminJuror
} from '../services/api.js'
import './JuryBoardManager.css'

const THEMES=[
  'Nét Đoài tại Hòa Lạc','Sắc Mường Hòa Lạc','Không gian Kiến trúc Hòa Lạc','Hòa Lạc xanh',
  'Nắng Hòa Lạc','Câu chuyện Hòa Lạc','Ước mơ Hòa Lạc','Sắc màu Hòa Lạc'
]
const TYPES=['Photo','Video','Story & Creative','Art & Design']
const emptyForm={
  name:'',email:'',password:'',title:'',organization:'',phone:'',expertise:'',notes:'',sortOrder:0,
  allowedThemes:[],allowedTypes:[],accountStatus:'ACTIVE'
}

function pct(juror){
  const total=Number(juror.totalSubmissions||0)
  return total?Math.min(100,Math.round(Number(juror.submittedCount||0)/total*100)):0
}
function formatDate(value){
  if(!value) return 'Chưa có'
  return new Date(value).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'})
}

export default function JuryBoardManager(){
  const [jurors,setJurors]=useState([])
  const [summary,setSummary]=useState({})
  const [selectedId,setSelectedId]=useState(null)
  const [form,setForm]=useState(emptyForm)
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [resetPassword,setResetPassword]=useState('')

  const load=async()=>{
    setLoading(true);setError('')
    try{
      const [items,stats]=await Promise.all([getAdminJuryBoard(),getAdminJuryBoardSummary()])
      setJurors(items);setSummary(stats)
      if(selectedId){
        const current=items.find(x=>x.id===selectedId)
        if(current) fill(current)
      }
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  useEffect(()=>{load()},[])

  const fill=(j)=>{
    setSelectedId(j.id)
    setForm({
      name:j.name||'',email:j.email||'',password:'',title:j.title||'',organization:j.organization||'',phone:j.phone||'',
      expertise:j.expertise||'',notes:j.notes||'',sortOrder:j.sortOrder||0,
      allowedThemes:j.allowedThemes||[],allowedTypes:j.allowedTypes||[],accountStatus:j.accountStatus||'ACTIVE'
    })
    setResetPassword('');setMessage('');setError('')
  }
  const newJuror=()=>{setSelectedId(null);setForm(emptyForm);setResetPassword('');setMessage('');setError('')}
  const toggle=(field,value)=>setForm(v=>({...v,[field]:v[field].includes(value)?v[field].filter(x=>x!==value):[...v[field],value]}))

  const save=async()=>{
    setSaving(true);setError('');setMessage('')
    try{
      if(selectedId){
        await updateAdminJuror(selectedId,form);setMessage('Đã lưu hồ sơ giám khảo.')
      }else{
        const created=await createAdminJuror(form);setSelectedId(created.id);setMessage('Đã tạo tài khoản giám khảo.')
      }
      await load()
    }catch(err){setError(err.message)}finally{setSaving(false)}
  }
  const resetPass=async()=>{
    if(!selectedId) return
    setSaving(true);setError('');setMessage('')
    try{await resetAdminJurorPassword(selectedId,resetPassword);setResetPassword('');setMessage('Đã đặt lại mật khẩu.')}
    catch(err){setError(err.message)}finally{setSaving(false)}
  }
  const remove=async()=>{
    if(!selectedId||!confirm('Xóa tài khoản giám khảo này? Chỉ xóa được nếu chưa có dữ liệu chấm.')) return
    setSaving(true);setError('')
    try{await deleteAdminJuror(selectedId);newJuror();await load()}
    catch(err){setError(err.message)}finally{setSaving(false)}
  }

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    if(!q) return jurors
    return jurors.filter(j=>[j.name,j.email,j.title,j.organization,j.expertise].some(v=>String(v||'').toLowerCase().includes(q)))
  },[jurors,query])

  return <div className="jury-board-admin">
    <div className="jury-board-hero admin-panel">
      <div>
        <span className="eyebrow">HỘI ĐỒNG GIÁM KHẢO 2026</span>
        <h2>Quản lý Hội đồng</h2>
        <p>Tạo tài khoản cá nhân, theo dõi tiến độ chấm, phân nhóm chuyên môn và khóa quyền truy cập khi cần.</p>
      </div>
      <div className="jury-board-hero-actions">
        <Link className="btn btn-outline" to="/jury"><ExternalLink size={16}/> Mở Jury Mode</Link>
        <button className="btn btn-green" onClick={newJuror}><Plus size={17}/> Thêm giám khảo</button>
      </div>
    </div>

    <div className="jury-board-stats">
      <div><span>Giám khảo hoạt động</span><b>{summary.activeJurors||0}/{summary.totalJurors||0}</b><small>Tài khoản ACTIVE</small></div>
      <div><span>Phiếu đã chốt</span><b>{summary.submittedScores||0}</b><small>{summary.completionPercent||0}% tổng khối lượng</small></div>
      <div><span>Xung đột lợi ích</span><b>{summary.conflicts||0}</b><small>Không tính vào điểm chung</small></div>
      <div><span>Chênh lệch điểm cao</span><b>{summary.highDisagreement||0}</b><small>Spread từ 20 điểm</small></div>
    </div>

    {error&&<div className="form-error">{error}</div>}
    {message&&<div className="jury-board-success">{message}</div>}

    <div className="jury-board-layout">
      <section className="admin-panel jury-board-list-panel">
        <div className="jury-board-list-head">
          <div className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tên, email, đơn vị..."/></div>
          <button className="icon-btn" onClick={load} title="Làm mới"><RefreshCw className={loading?'spin':''}/></button>
        </div>
        <div className="jury-board-list">
          {filtered.map(j=><button key={j.id} className={'jury-member-card '+(selectedId===j.id?'selected':'')} onClick={()=>fill(j)}>
            <span className="jury-member-avatar">{(j.name||j.email).charAt(0).toUpperCase()}</span>
            <div className="jury-member-main">
              <div><b>{j.name}</b><span className={j.accountStatus==='ACTIVE'?'jury-active':'jury-suspended'}>{j.accountStatus==='ACTIVE'?'Hoạt động':'Đã khóa'}</span></div>
              <small>{j.title||'Giám khảo'}{j.organization?' · '+j.organization:''}</small>
              <small>{j.email}</small>
              <div className="jury-progress-mini"><i style={{width:pct(j)+'%'}}/><span>{j.submittedCount||0}/{j.totalSubmissions||0} bài · {pct(j)}%</span></div>
            </div>
            <div className="jury-member-score"><b>{Number(j.averageGivenScore||0).toFixed(1)}</b><small>điểm TB</small></div>
          </button>)}
          {!filtered.length&&<div className="admin-empty"><ShieldCheck/><p>Chưa có giám khảo phù hợp.</p></div>}
        </div>
      </section>

      <section className="admin-panel jury-board-editor">
        <div className="jury-board-editor-head">
          <div><span className="eyebrow">{selectedId?'HỒ SƠ GIÁM KHẢO':'TẠO TÀI KHOẢN'}</span><h2>{selectedId?form.name||'Giám khảo':'Giám khảo mới'}</h2></div>
          {selectedId&&<span className={form.accountStatus==='ACTIVE'?'jury-active':'jury-suspended'}>{form.accountStatus==='ACTIVE'?<UserCheck size={15}/>:<UserX size={15}/>} {form.accountStatus==='ACTIVE'?'ACTIVE':'SUSPENDED'}</span>}
        </div>

        <div className="jury-form-grid">
          <label>Họ và tên<input value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
          <label>Email đăng nhập<input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
          {!selectedId&&<label>Mật khẩu ban đầu<input type="password" value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))} placeholder="Tối thiểu 8 ký tự"/></label>}
          <label>Chức danh<input value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} placeholder="KTS, Nhiếp ảnh gia, Nhà nghiên cứu..."/></label>
          <label>Đơn vị<input value={form.organization} onChange={e=>setForm(v=>({...v,organization:e.target.value}))}/></label>
          <label>Số điện thoại<input value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
          <label>Thứ tự hiển thị<input type="number" value={form.sortOrder} onChange={e=>setForm(v=>({...v,sortOrder:Number(e.target.value)}))}/></label>
          <label>Trạng thái<select value={form.accountStatus} onChange={e=>setForm(v=>({...v,accountStatus:e.target.value}))}><option value="ACTIVE">Hoạt động</option><option value="SUSPENDED">Khóa tài khoản</option></select></label>
        </div>

        <label className="jury-full-label">Chuyên môn<textarea rows="2" value={form.expertise} onChange={e=>setForm(v=>({...v,expertise:e.target.value}))} placeholder="Kiến trúc, văn hóa, nhiếp ảnh, truyền thông..."/></label>

        <div className="jury-scope-block"><b>Chủ đề phụ trách</b><small>Để trống = có thể chấm tất cả chủ đề.</small><div className="jury-check-grid">{THEMES.map(t=><label key={t}><input type="checkbox" checked={form.allowedThemes.includes(t)} onChange={()=>toggle('allowedThemes',t)}/><span>{t}</span></label>)}</div></div>
        <div className="jury-scope-block"><b>Loại hình phụ trách</b><small>Để trống = có thể chấm tất cả loại hình.</small><div className="jury-check-grid compact">{TYPES.map(t=><label key={t}><input type="checkbox" checked={form.allowedTypes.includes(t)} onChange={()=>toggle('allowedTypes',t)}/><span>{t}</span></label>)}</div></div>

        <label className="jury-full-label">Ghi chú nội bộ<textarea rows="3" value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))}/></label>
        <div className="jury-editor-actions"><button className="btn btn-green" onClick={save} disabled={saving}><Save size={16}/> {saving?'Đang lưu...':'Lưu hồ sơ'}</button></div>

        {selectedId&&<>
          <div className="jury-account-security">
            <div><KeyRound/><div><b>Đặt lại mật khẩu</b><small>Không hiển thị mật khẩu cũ. Chỉ quản trị viên có thể đặt mật khẩu mới.</small></div></div>
            <div><input type="password" value={resetPassword} onChange={e=>setResetPassword(e.target.value)} placeholder="Mật khẩu mới ≥ 8 ký tự"/><button className="btn btn-outline btn-sm" onClick={resetPass} disabled={saving||resetPassword.length<8}>Đặt lại</button></div>
          </div>
          <div className="jury-account-meta">
            <span>Đăng nhập gần nhất: <b>{formatDate(jurors.find(x=>x.id===selectedId)?.lastLoginAt)}</b></span>
            <span>Chấm gần nhất: <b>{formatDate(jurors.find(x=>x.id===selectedId)?.lastScoreAt)}</b></span>
            <span>Nháp: <b>{jurors.find(x=>x.id===selectedId)?.draftCount||0}</b></span>
            <span>COI: <b>{jurors.find(x=>x.id===selectedId)?.conflictCount||0}</b></span>
          </div>
          <button className="jury-delete-btn" onClick={remove} disabled={saving}><Trash2 size={15}/> Xóa tài khoản chưa có dữ liệu chấm</button>
        </>}
      </section>
    </div>

    <div className="jury-board-note"><AlertTriangle/><span>Giám khảo đã có phiếu chấm sẽ không thể xóa để bảo toàn lịch sử; hãy chuyển trạng thái sang <b>Khóa tài khoản</b>.</span></div>
  </div>
}
