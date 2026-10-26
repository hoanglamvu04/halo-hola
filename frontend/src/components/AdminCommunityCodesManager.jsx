import { useEffect, useState } from 'react'
import { Copy, KeyRound, RefreshCw, Search, ShieldX } from 'lucide-react'
import {
  createAdminCommunityLoginCode,
  getAdminCommunityLoginCodes,
  revokeAdminCommunityLoginCode
} from '../services/api.js'

const STATUS_LABELS={ACTIVE:'Đang hiệu lực',USED:'Đã dùng / thu hồi',EXPIRED:'Hết hạn'}

function formatDate(value){
  if(!value)return '—'
  try{return new Date(value).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'})}
  catch{return String(value)}
}

export default function AdminCommunityCodesManager(){
  const [items,setItems]=useState([])
  const [email,setEmail]=useState('')
  const [expiresInMinutes,setExpiresInMinutes]=useState(10)
  const [purpose,setPurpose]=useState('VERIFY_EMAIL')
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(false)
  const [issued,setIssued]=useState(null)
  const [copied,setCopied]=useState(false)
  const [error,setError]=useState('')

  const load=async(q=query)=>{
    setLoading(true);setError('')
    try{
      const data=await getAdminCommunityLoginCodes({q,limit:100})
      setItems(Array.isArray(data?.items)?data.items:[])
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{load('')},[])

  const issue=async event=>{
    event.preventDefault()
    setLoading(true);setError('');setIssued(null);setCopied(false)
    try{
      const data=await createAdminCommunityLoginCode({email,expiresInMinutes,purpose})
      setIssued(data)
      setEmail('')
      await load(query)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const revoke=async item=>{
    if(!window.confirm(`Thu hồi mã xác minh của ${item.email}?`))return
    setLoading(true);setError('')
    try{
      await revokeAdminCommunityLoginCode(item.id)
      if(issued?.id===item.id)setIssued(null)
      await load(query)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }

  const copyCode=async()=>{
    if(!issued?.code)return
    try{
      await navigator.clipboard.writeText(issued.code)
      setCopied(true)
      window.setTimeout(()=>setCopied(false),1600)
    }catch{
      setError('Không thể sao chép tự động. Hãy chọn và copy mã thủ công.')
    }
  }

  const search=event=>{
    event.preventDefault()
    load(query)
  }

  return <div className="admin-community-codes">
    <section className="admin-community-code-create">
      <div className="admin-community-code-create-copy">
        <span>DỰ PHÒNG OTP</span>
        <h2>Tạo mã xác minh thủ công</h2>
        <p>Dành cho đăng ký chờ xác minh hoặc đặt lại mật khẩu khi SMTP gặp sự cố. Mã chỉ hiển thị một lần và không thể dùng để đăng nhập trực tiếp.</p>
      </div>
      <form className="admin-community-code-form" onSubmit={issue}>
        <label>Email người dùng
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nguoidung@gmail.com"/>
        </label>
        <label>Loại mã
          <select value={purpose} onChange={e=>setPurpose(e.target.value)}>
            <option value="VERIFY_EMAIL">Xác minh email đăng ký</option>
            <option value="RESET_PASSWORD">Đặt lại mật khẩu</option>
          </select>
        </label>
        <label>Hiệu lực
          <select value={expiresInMinutes} onChange={e=>setExpiresInMinutes(Number(e.target.value))}>
            <option value={10}>10 phút</option>
            <option value={20}>20 phút</option>
            <option value={30}>30 phút</option>
            <option value={60}>60 phút</option>
          </select>
        </label>
        <button className="btn btn-green" disabled={loading}><KeyRound size={16}/>{loading?'Đang xử lý…':'Tạo mã 6 số'}</button>
      </form>
    </section>

    {issued&&<section className="admin-community-code-issued">
      <div>
        <small>MÃ VỪA TẠO · {issued.email}</small>
        <strong>{issued.code}</strong>
        <small>Hết hạn: {formatDate(issued.expiresAt)} · Sau khi rời trang, Admin không thể xem lại plaintext của mã này.</small>
      </div>
      <button type="button" onClick={copyCode}><Copy size={15}/>{copied?'Đã copy':'Copy mã'}</button>
    </section>}

    {error&&<div className="form-error">{error}</div>}

    <section className="admin-community-code-list">
      <div className="admin-community-code-list-head">
        <div>
          <span>LỊCH SỬ YÊU CẦU</span>
          <h2>Mã xác minh cộng đồng</h2>
          <p>Danh sách mã xác minh email và đặt lại mật khẩu; không lưu mã plaintext. Chỉ cấp mã thủ công sau khi xác nhận đúng chủ email.</p>
        </div>
        <form className="admin-community-code-search" onSubmit={search}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo email…"/>
          <button className="icon-btn" aria-label="Tìm kiếm"><Search size={17}/></button>
          <button type="button" className="icon-btn" onClick={()=>load(query)} aria-label="Làm mới"><RefreshCw size={17} className={loading?'spin':''}/></button>
        </form>
      </div>

      <div className="admin-community-code-table">
        {items.map(item=><div className="admin-community-code-row" key={item.id}>
          <div className="admin-community-code-email">
            <b>{item.email}</b>
            <small>{item.purpose==='RESET_PASSWORD'?'Đặt lại mật khẩu':item.purpose==='VERIFY_EMAIL'?'Xác minh email':'Mã OTP cũ'} · {item.accountId?(item.accountDisplayName||item.accountName||'Đã có tài khoản'):'Chưa tạo tài khoản'}</small>
          </div>
          <span className={'admin-community-code-status '+String(item.status||'').toLowerCase()}>{STATUS_LABELS[item.status]||item.status}</span>
          <small>Tạo: {formatDate(item.createdAt)}</small>
          <small>Hết hạn: {formatDate(item.expiresAt)}</small>
          {item.status==='ACTIVE'?<button type="button" onClick={()=>revoke(item)}><ShieldX size={13}/> Thu hồi</button>:<span/>}
        </div>)}
        {!items.length&&!loading&&<div className="admin-community-code-empty">Chưa có yêu cầu mã xác minh nào.</div>}
        {loading&&!items.length&&<div className="admin-community-code-empty">Đang tải dữ liệu mã xác minh…</div>}
      </div>
    </section>
  </div>
}
