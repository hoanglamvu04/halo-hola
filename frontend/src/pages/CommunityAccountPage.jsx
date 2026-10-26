import { useEffect, useState } from 'react'
import {
  ArrowRight, CheckCircle2, Clock3, History, KeyRound,
  LogOut, Mail, Pencil, Save, Send, UserRound
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getCommunityAccount,
  getCommunityContributionHistory,
  logoutCommunityAccount,
  requestCommunityLoginCode,
  updateCommunityAccount,
  verifyCommunityLoginCode
} from '../services/api.js'
import '../styles/community-account.css'

const STATUS_LABELS={
  PENDING:'Đã nhận',
  VALID:'Đủ thông tin',
  SHORTLIST:'Được chọn biên tập',
  TOP52:'TOP52',
  AWARDED:'Góc nhìn tiêu biểu',
  REJECTED:'Cần bổ sung'
}

const EMPTY_PROFILE={name:'',displayName:'',phone:'',bio:''}

export default function CommunityAccountPage(){
  const navigate=useNavigate()
  const [params]=useSearchParams()
  const next=params.get('next')||''
  const [loading,setLoading]=useState(true)
  const [account,setAccount]=useState(null)
  const [items,setItems]=useState([])
  const [email,setEmail]=useState(params.get('email')||'')
  const [code,setCode]=useState('')
  const [codeSent,setCodeSent]=useState(false)
  const [expiresIn,setExpiresIn]=useState(0)
  const [authBusy,setAuthBusy]=useState(false)
  const [profile,setProfile]=useState(EMPTY_PROFILE)
  const [editing,setEditing]=useState(false)
  const [saving,setSaving]=useState(false)
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')

  const loadHistory=async()=>{
    const data=await getCommunityContributionHistory()
    setItems(Array.isArray(data?.items)?data.items:[])
  }

  useEffect(()=>{
    let alive=true
    getCommunityAccount().then(async data=>{
      if(!alive)return
      const current=data?.account||null
      setAccount(current)
      if(current){
        setEmail(current.email||'')
        setProfile({
          name:current.name||'',
          displayName:current.displayName||'',
          phone:current.phone||'',
          bio:current.bio||''
        })
        await loadHistory().catch(()=>{})
      }
    }).catch(()=>{}).finally(()=>{if(alive)setLoading(false)})
    return()=>{alive=false}
  },[])

  const requestCode=async event=>{
    event?.preventDefault?.()
    setError('');setNotice('');setAuthBusy(true)
    try{
      const data=await requestCommunityLoginCode({email})
      setCodeSent(true)
      setExpiresIn(Number(data?.expiresIn||600))
      setNotice('Mã 6 số đã được gửi tới email của bạn.')
      if(data?.devCode)setCode(String(data.devCode))
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const verifyCode=async event=>{
    event?.preventDefault?.()
    setError('');setNotice('');setAuthBusy(true)
    try{
      const data=await verifyCommunityLoginCode({email,code})
      const current=data?.account
      setAccount(current)
      setProfile({
        name:current?.name||'',
        displayName:current?.displayName||'',
        phone:current?.phone||'',
        bio:current?.bio||''
      })
      await loadHistory().catch(()=>{})
      setNotice('Đã đăng nhập. Những đóng góp cũ cùng email đã được liên kết vào tài khoản.')
      if(next)navigate(next,{replace:true})
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const saveProfile=async event=>{
    event?.preventDefault?.()
    setError('');setNotice('');setSaving(true)
    try{
      const data=await updateCommunityAccount(profile)
      setAccount(data.account)
      setProfile({
        name:data.account?.name||'',
        displayName:data.account?.displayName||'',
        phone:data.account?.phone||'',
        bio:data.account?.bio||''
      })
      setEditing(false)
      setNotice('Đã cập nhật hồ sơ. Lần gửi tiếp theo sẽ tự điền thông tin này.')
    }catch(err){setError(err.message)}
    finally{setSaving(false)}
  }

  const logout=async()=>{
    setError('');setNotice('')
    try{await logoutCommunityAccount()}catch{}
    setAccount(null);setItems([]);setCode('');setCodeSent(false);setProfile(EMPTY_PROFILE)
    setNotice('Đã đăng xuất khỏi tài khoản cộng đồng.')
  }

  if(loading)return <main className="community-account-page"><div className="container community-account-loading">Đang mở hồ sơ cộng đồng…</div></main>

  if(!account)return <main className="community-account-page">
    <section className="container community-auth-shell">
      <div className="community-auth-copy">
        <span className="eyebrow">TÀI KHOẢN CỘNG ĐỒNG</span>
        <h1>Gửi nhanh hơn.<br/>Giữ lại hành trình của bạn.</h1>
        <p>Đăng nhập bằng email và mã OTP. Không cần mật khẩu. Sau khi xác minh, HALO HOLA tự liên kết những góc nhìn trước đây dùng cùng email.</p>
        <div className="community-auth-benefits">
          <div><UserRound/><span><b>Tự điền hồ sơ</b><small>Không nhập lại tên, email, số điện thoại ở mỗi lần gửi.</small></span></div>
          <div><History/><span><b>Lịch sử đóng góp</b><small>Xem toàn bộ mã góc nhìn và trạng thái ở một nơi.</small></span></div>
          <div><Pencil/><span><b>Chỉnh sửa hồ sơ</b><small>Cập nhật thông tin một lần cho những lần đóng góp tiếp theo.</small></span></div>
        </div>
      </div>
      <section className="community-auth-card">
        <span className="community-auth-icon">{codeSent?<KeyRound/>:<Mail/>}</span>
        <h2>{codeSent?'Nhập mã đăng nhập':'Đăng nhập / tạo tài khoản'}</h2>
        <p>{codeSent?<>Mã đã gửi tới <b>{email}</b>. Mã có hiệu lực khoảng {Math.max(1,Math.round(expiresIn/60))} phút.</>:<>Nhập email bạn dùng để đóng góp góc nhìn. Nếu chưa có tài khoản, tài khoản sẽ được tạo sau khi xác minh.</>}</p>
        {!codeSent?<form onSubmit={requestCode}>
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@gmail.com"/></label>
          <button className="btn btn-green full" disabled={authBusy}>{authBusy?'Đang gửi mã…':'Gửi mã đăng nhập'} <ArrowRight/></button>
        </form>:<form onSubmit={verifyCode}>
          <label>Mã 6 số<input required inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456"/></label>
          <button className="btn btn-green full" disabled={authBusy||code.length!==6}>{authBusy?'Đang xác minh…':'Xác minh & đăng nhập'} <ArrowRight/></button>
          <button type="button" className="community-auth-link" onClick={()=>{setCodeSent(false);setCode('');setError('')}}>Dùng email khác</button>
        </form>}
        {notice&&<div className="community-account-notice success"><CheckCircle2/>{notice}</div>}
        {error&&<div className="community-account-notice error">{error}</div>}
        <small className="community-auth-privacy">Mã OTP chỉ dùng để xác minh email. HALO HOLA không yêu cầu mật khẩu.</small>
      </section>
    </section>
  </main>

  return <main className="community-account-page">
    <section className="container community-account-head">
      <div>
        <span className="eyebrow">HỒ SƠ CỘNG ĐỒNG</span>
        <h1>Xin chào, {account.displayName||account.name||'người kể chuyện'}.</h1>
        <p>Thông tin này sẽ được dùng để tự điền ở những lần đóng góp tiếp theo. Email đã xác minh được giữ cố định để bảo vệ lịch sử của bạn.</p>
      </div>
      <div className="community-account-head-actions">
        <Link className="btn btn-terra" to="/gui-goc-nhin"><Send/> Gửi góc nhìn mới</Link>
        <button className="btn btn-outline" onClick={logout}><LogOut/> Đăng xuất</button>
      </div>
    </section>

    <section className="container community-account-grid">
      <article className="community-profile-card">
        <div className="community-card-head">
          <div><span>HỒ SƠ CÁ NHÂN</span><h2>Thông tin người đóng góp</h2></div>
          {!editing&&<button onClick={()=>setEditing(true)}><Pencil/> Chỉnh sửa</button>}
        </div>
        {editing?<form className="community-profile-form" onSubmit={saveProfile}>
          <label>Họ và tên *<input required minLength="2" value={profile.name} onChange={e=>setProfile(v=>({...v,name:e.target.value}))}/></label>
          <label>Tên hiển thị<input value={profile.displayName} onChange={e=>setProfile(v=>({...v,displayName:e.target.value}))}/></label>
          <label className="full">Email đã xác minh<input value={account.email} disabled/></label>
          <label className="full">Số điện thoại *<input required minLength="6" value={profile.phone} onChange={e=>setProfile(v=>({...v,phone:e.target.value}))}/></label>
          <label className="full">Giới thiệu ngắn<textarea rows="4" maxLength="1000" value={profile.bio} onChange={e=>setProfile(v=>({...v,bio:e.target.value}))}/></label>
          <div className="community-profile-actions full">
            <button type="button" className="btn btn-outline" onClick={()=>{setEditing(false);setProfile({name:account.name||'',displayName:account.displayName||'',phone:account.phone||'',bio:account.bio||''})}}>Hủy</button>
            <button className="btn btn-green" disabled={saving}><Save/> {saving?'Đang lưu…':'Lưu hồ sơ'}</button>
          </div>
        </form>:<div className="community-profile-summary">
          <div><small>Họ và tên</small><b>{account.name||'Chưa cập nhật'}</b></div>
          <div><small>Tên hiển thị</small><b>{account.displayName||'Chưa đặt'}</b></div>
          <div><small>Email</small><b>{account.email}</b></div>
          <div><small>Số điện thoại</small><b>{account.phone||'Chưa cập nhật'}</b></div>
          <div className="full"><small>Giới thiệu</small><p>{account.bio||'Bạn chưa thêm giới thiệu ngắn.'}</p></div>
        </div>}
        {notice&&<div className="community-account-notice success"><CheckCircle2/>{notice}</div>}
        {error&&<div className="community-account-notice error">{error}</div>}
      </article>

      <article className="community-history-card">
        <div className="community-card-head">
          <div><span>LỊCH SỬ ĐÓNG GÓP</span><h2>{items.length} góc nhìn của bạn</h2></div>
          <History/>
        </div>
        {items.length?<div className="community-history-list">{items.map(item=>{
          const isPublic=item.publicationState==='PUBLISHED'
          return <div className="community-history-item" key={item.id}>
            <div className="community-history-code"><Clock3/><span><b>{item.code}</b><small>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</small></span></div>
            <div className="community-history-copy"><h3>{item.title||'Góc nhìn chưa đặt tên'}</h3><p>{item.location||item.type||'Hòa Lạc'}</p></div>
            <div className="community-history-status"><span className={'status-'+String(item.status||'').toLowerCase()}>{STATUS_LABELS[item.status]||item.status}</span><small>{item.mediaCount||0} tệp</small></div>
            {isPublic?<Link to={'/tac-pham/'+String(item.code||'').toLowerCase()}>Xem công khai <ArrowRight/></Link>:<span className="community-history-wait">Đang trong hành trình biên tập</span>}
          </div>
        })}</div>:<div className="community-history-empty"><History/><b>Chưa có góc nhìn nào</b><p>Khi bạn gửi góc nhìn bằng email này, lịch sử sẽ xuất hiện tại đây.</p><Link className="btn btn-green" to="/gui-goc-nhin">Gửi góc nhìn đầu tiên</Link></div>}
      </article>
    </section>
  </main>
}
