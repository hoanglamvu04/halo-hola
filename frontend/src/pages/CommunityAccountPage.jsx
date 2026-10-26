import { useEffect, useState } from 'react'
import {
  ArrowRight, CheckCircle2, Clock3, History, KeyRound,
  LockKeyhole, LogOut, Mail, Pencil, Save, Send, UserRound
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getCommunityAccount,
  getCommunityContributionHistory,
  logoutCommunityAccount,
  registerCommunityAccount,
  resendCommunityVerification,
  verifyCommunityEmail,
  loginCommunityAccount,
  requestCommunityPasswordReset,
  resetCommunityPassword,
  updateCommunityAccount
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
  const rawNext=params.get('next')||''
  const next=rawNext.startsWith('/')&&!rawNext.startsWith('//')?rawNext:''
  const [loading,setLoading]=useState(true)
  const [account,setAccount]=useState(null)
  const [items,setItems]=useState([])
  const [email,setEmail]=useState(params.get('email')||'')
  const [authMode,setAuthMode]=useState(params.get('mode')==='register'?'register':'login')
  const [name,setName]=useState('')
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [cooldown,setCooldown]=useState(0)
  const [code,setCode]=useState('')
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

  useEffect(()=>{
    if(cooldown<=0)return undefined
    const timer=window.setInterval(()=>setCooldown(v=>Math.max(0,v-1)),1000)
    return()=>window.clearInterval(timer)
  },[cooldown>0])

  const switchMode=(mode)=>{
    setAuthMode(mode)
    setCode('')
    setPassword('')
    setConfirmPassword('')
    setCooldown(0)
    setError('')
    setNotice('')
  }

  const finishAuth=async(current,message)=>{
    setAccount(current)
    setEmail(current.email||'')
    setProfile({
      name:current.name||'',displayName:current.displayName||'',
      phone:current.phone||'',bio:current.bio||''
    })
    setPassword('')
    setConfirmPassword('')
    setCode('')
    await loadHistory().catch(()=>{})
    setNotice(message)
    if(next)navigate(next,{replace:true})
  }

  const register=async event=>{
    event.preventDefault()
    setError('');setNotice('')
    if(password!==confirmPassword){setError('Hai mật khẩu chưa khớp.');return}
    if(password.length<8){setError('Mật khẩu phải có ít nhất 8 ký tự.');return}
    setAuthBusy(true)
    try{
      const result=await registerCommunityAccount({name,email,password})
      setAuthMode('verify')
      setPassword('');setConfirmPassword('')
      setCooldown(45)
      setNotice('Đã gửi mã xác minh email. Hãy kiểm tra cả thư mục Spam.')
      if(result.devCode)setCode(String(result.devCode))
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const login=async event=>{
    event.preventDefault()
    setError('');setNotice('');setAuthBusy(true)
    try{
      const data=await loginCommunityAccount({email,password})
      await finishAuth(data.account,'Đăng nhập thành công. Chào mừng bạn trở lại!')
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const verifyEmail=async event=>{
    event.preventDefault()
    setError('');setNotice('');setAuthBusy(true)
    try{
      const result=await verifyCommunityEmail({email,code})
      await finishAuth(result.account,'Email đã được xác minh. Tài khoản của bạn đã sẵn sàng.')
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const resend=async()=>{
    setError('');setNotice('');setAuthBusy(true)
    try{
      const result=await resendCommunityVerification({email})
      setCooldown(45)
      setNotice('Đã gửi lại mã xác minh. Mã trước đó không còn hiệu lực.')
      if(result.devCode)setCode(String(result.devCode))
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const requestReset=async event=>{
    event?.preventDefault?.()
    setError('');setNotice('');setAuthBusy(true)
    try{
      const result=await requestCommunityPasswordReset({email})
      setAuthMode('reset');setCode('');setPassword('');setConfirmPassword('')
      setCooldown(45)
      setNotice('Nếu email có tài khoản, mã đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư.')
      if(result.devCode)setCode(String(result.devCode))
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const reset=async event=>{
    event.preventDefault()
    setError('');setNotice('')
    if(password!==confirmPassword){setError('Hai mật khẩu chưa khớp.');return}
    if(password.length<8){setError('Mật khẩu mới phải có ít nhất 8 ký tự.');return}
    setAuthBusy(true)
    try{
      const result=await resetCommunityPassword({email,code,password})
      await finishAuth(result.account,'Đã đặt lại mật khẩu và đăng nhập. Các phiên cũ đã được đăng xuất.')
    }catch(err){setError(err.message)}
    finally{setAuthBusy(false)}
  }

  const startLegacySetup=async()=>{
    const previous=account
    try{await logoutCommunityAccount()}catch(err){
      setError('Không thể kết thúc phiên cũ. Vui lòng thử lại.')
      return
    }
    setAccount(null);setItems([]);setName(previous?.name||'')
    setEmail(previous?.email||'')
    switchMode('register')
    setNotice('Tài khoản cũ đã có email xác minh. Hãy tạo mật khẩu và xác minh email một lần để tiếp tục sử dụng.')
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
    setAccount(null);setItems([]);setCode('');setProfile(EMPTY_PROFILE);switchMode('login')
    setNotice('Đã đăng xuất khỏi tài khoản cộng đồng.')
  }

  if(loading)return <main className="community-account-page"><div className="container community-account-loading">Đang mở hồ sơ cộng đồng…</div></main>

  if(!account)return <main className="community-account-page">
    <section className="container community-auth-shell">
      <div className="community-auth-copy">
        <span className="eyebrow">TÀI KHOẢN CỘNG ĐỒNG</span>
        <h1>Gửi nhanh hơn.<br/>Giữ lại hành trình của bạn.</h1>
        <p>Tạo tài khoản bằng email và mật khẩu, xác minh email một lần để kích hoạt. Sau đó đăng nhập nhanh bằng mật khẩu, không cần mã mỗi lần.</p>
        <div className="community-auth-benefits">
          <div><UserRound/><span><b>Tự điền hồ sơ</b><small>Không nhập lại tên, email, số điện thoại ở mỗi lần gửi.</small></span></div>
          <div><History/><span><b>Lịch sử đóng góp</b><small>Góc nhìn trước đây dùng cùng email sẽ được liên kết sau khi xác minh.</small></span></div>
          <div><Pencil/><span><b>Chỉnh sửa hồ sơ</b><small>Cập nhật thông tin một lần cho những lần đóng góp tiếp theo.</small></span></div>
        </div>
      </div>
      <section className="community-auth-card">
        <span className="community-auth-icon">{authMode==='verify'||authMode==='reset'?<KeyRound/>:<LockKeyhole/>}</span>
        {(authMode==='login'||authMode==='register')&&<div className="community-auth-tabs" role="tablist" aria-label="Loại tài khoản">
          <button type="button" role="tab" aria-selected={authMode==='login'} className={authMode==='login'?'active':''} onClick={()=>switchMode('login')}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={authMode==='register'} className={authMode==='register'?'active':''} onClick={()=>switchMode('register')}>Đăng ký</button>
        </div>}
        <h2>{authMode==='login'?'Chào mừng trở lại':authMode==='register'?'Tạo tài khoản HALO HOLA':authMode==='verify'?'Xác minh email':authMode==='forgot'?'Quên mật khẩu?':'Đặt lại mật khẩu'}</h2>
        <p>{authMode==='login'?'Đăng nhập bằng email và mật khẩu của bạn.'
          :authMode==='register'?'Nhập thông tin của bạn. HALO HOLA sẽ gửi mã xác minh để kích hoạt tài khoản.'
          :authMode==='verify'?<>Nhập mã 6 số đã gửi tới <b>{email}</b>. Mã có hiệu lực 10 phút.</>
          :authMode==='forgot'?'Nhập email đã đăng ký để nhận mã đặt lại mật khẩu.'
          :<>Mã đặt lại mật khẩu đã được gửi tới <b>{email}</b> nếu tài khoản tồn tại.</>}</p>

        {authMode==='login'&&<form onSubmit={login}>
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@gmail.com"/></label>
          <label>Mật khẩu<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nhập mật khẩu của bạn"/></label>
          <div className="community-auth-help"><button type="button" className="community-auth-link" onClick={()=>switchMode('forgot')}>Quên mật khẩu?</button></div>
          <button className="btn btn-green full" disabled={authBusy}>{authBusy?'Đang đăng nhập…':'Đăng nhập'} <ArrowRight/></button>
          <small className="community-auth-hint">Nếu bạn từng đăng nhập bằng OTP, hãy chọn Đăng ký để thiết lập mật khẩu cho email cũ.</small>
        </form>}

        {authMode==='register'&&<form onSubmit={register}>
          <label>Họ và tên<input required minLength="2" maxLength="160" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Nguyễn Văn A"/></label>
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@gmail.com"/></label>
          <label>Mật khẩu (ít nhất 8 ký tự)<input required type="password" minLength="8" maxLength="72" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tạo mật khẩu an toàn"/></label>
          <label>Nhập lại mật khẩu<input required type="password" minLength="8" maxLength="72" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu"/></label>
          <button className="btn btn-green full" disabled={authBusy}>{authBusy?'Đang tạo tài khoản…':'Đăng ký & nhận mã xác minh'} <ArrowRight/></button>
        </form>}

        {authMode==='verify'&&<form onSubmit={verifyEmail}>
          <label>Mã xác minh 6 số<input required inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456"/></label>
          <button className="btn btn-green full" disabled={authBusy||code.length!==6}>{authBusy?'Đang xác minh…':'Xác minh & kích hoạt tài khoản'} <ArrowRight/></button>
          <div className="community-auth-secondary"><button type="button" className="community-auth-link" disabled={authBusy||cooldown>0} onClick={resend}>{cooldown>0?'Gửi lại sau '+cooldown+'s':'Gửi lại mã'}</button><button type="button" className="community-auth-link" onClick={()=>switchMode('register')}>Sửa thông tin</button></div>
        </form>}

        {authMode==='forgot'&&<form onSubmit={requestReset}>
          <label>Email đã đăng ký<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@gmail.com"/></label>
          <button className="btn btn-green full" disabled={authBusy}>{authBusy?'Đang xử lý…':'Gửi mã đặt lại mật khẩu'} <ArrowRight/></button>
          <button type="button" className="community-auth-link" onClick={()=>switchMode('login')}>Quay lại đăng nhập</button>
        </form>}

        {authMode==='reset'&&<form onSubmit={reset}>
          <label>Mã xác minh 6 số<input required inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456"/></label>
          <label>Mật khẩu mới<input required type="password" minLength="8" maxLength="72" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu mới"/></label>
          <label>Nhập lại mật khẩu<input required type="password" minLength="8" maxLength="72" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu mới"/></label>
          <button className="btn btn-green full" disabled={authBusy||code.length!==6}>{authBusy?'Đang cập nhật…':'Đặt lại mật khẩu'} <ArrowRight/></button>
          <div className="community-auth-secondary"><button type="button" className="community-auth-link" disabled={authBusy||cooldown>0} onClick={requestReset}>{cooldown>0?'Gửi lại sau '+cooldown+'s':'Gửi lại mã'}</button><button type="button" className="community-auth-link" onClick={()=>switchMode('forgot')}>Đổi email</button></div>
        </form>}

        {notice&&<div role="status" className="community-account-notice success"><CheckCircle2/>{notice}</div>}
        {error&&<div role="alert" className="community-account-notice error">{error}</div>}
        <small className="community-auth-privacy">HALO HOLA chỉ dùng OTP để xác minh email đăng ký hoặc đặt lại mật khẩu, không yêu cầu OTP khi đăng nhập thông thường.</small>
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
      {!account.hasPassword&&<div className="community-account-legacy-alert">
        <KeyRound size={19}/>
        <span>Tài khoản trước đây dùng mã OTP. Hãy thiết lập mật khẩu một lần để đăng nhập theo cách mới.</span>
        <button type="button" className="btn btn-outline" onClick={startLegacySetup}>Thiết lập mật khẩu</button>
      </div>}
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
