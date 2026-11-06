import { useEffect, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, RefreshCw, Search, ShieldCheck, ShieldOff, UserRound, Users
} from 'lucide-react'
import { getAdminCommunityPublishers, setAdminCommunityPublisherAccess } from '../services/api.js'
import './AdminPublisherAccessManager.css'

function formatDate(value){
  if(!value)return '—'
  try{return new Date(value).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'})}
  catch{return '—'}
}

export default function AdminPublisherAccessManager(){
  const [items,setItems]=useState([])
  const [query,setQuery]=useState('')
  const [note,setNote]=useState('')
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState('')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  const load=async(q=query)=>{
    setLoading(true)
    setError('')
    try{
      const result=await getAdminCommunityPublishers({q,limit:300})
      setItems(Array.isArray(result?.items)?result.items:[])
    }catch(err){
      setError(err.message||'Không tải được danh sách tài khoản.')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{load('')},[])

  const authorized=items.filter(item=>item.autoPublishEnabled).length
  const active=items.filter(item=>item.status==='ACTIVE'&&item.emailVerifiedAt).length

  const toggle=async item=>{
    const enabled=!item.autoPublishEnabled
    const title=item.displayName||item.name||item.email
    const confirmed=window.confirm(enabled
      ? `Ủy quyền tự công bố cho tài khoản ${item.email}? Các góc nhìn mới đủ điều kiện sẽ tự xuất hiện trên website và được xếp hàng đồng bộ HOLA Maps.`
      : `Thu hồi quyền tự công bố của ${item.email}? Các góc nhìn gửi sau đó sẽ quay lại quy trình duyệt thủ công.`)
    if(!confirmed)return

    setBusy(item.id)
    setError('')
    setMessage('')
    try{
      await setAdminCommunityPublisherAccess(item.id,{enabled,note:enabled?note:''})
      setMessage(enabled
        ? `Đã cấp quyền tự công bố cho ${title}. Quyền áp dụng cho các góc nhìn gửi mới.`
        : `Đã thu hồi quyền tự công bố của ${title}.`)
      await load(query)
    }catch(err){
      setError(err.message||'Không thể cập nhật quyền tài khoản.')
    }finally{
      setBusy('')
    }
  }

  const search=event=>{
    event.preventDefault()
    load(query)
  }

  return <div className="publisher-access">
    <section className="publisher-access-hero">
      <div className="publisher-access-hero-copy">
        <span className="publisher-access-kicker"><ShieldCheck size={15}/> QUYỀN XUẤT BẢN CỘNG ĐỒNG</span>
        <h2>Ủy quyền tự công bố</h2>
        <p>Chọn những tài khoản đáng tin cậy để họ gửi góc nhìn trực tiếp. HALO HOLA tự công bố tác phẩm đủ điều kiện và đưa ảnh lên HOLA Maps, không cần Admin duyệt từng bài.</p>
      </div>
      <div className="publisher-access-stats">
        <article><Users/><small>Tài khoản hoạt động</small><b>{active}</b></article>
        <article><ShieldCheck/><small>Đang được ủy quyền</small><b>{authorized}</b></article>
      </div>
    </section>

    <section className="publisher-access-rules">
      <div><CheckCircle2/><b>Website</b><span>Tự chuyển sang Đủ thông tin và Đã công bố.</span></div>
      <div><CheckCircle2/><b>HOLA Maps</b><span>Tự xếp hàng đồng bộ ảnh và vị trí sau khi lưu thành công.</span></div>
      <div><ShieldCheck/><b>An toàn</b><span>Tài khoản thường vẫn qua duyệt. Admin có thể thu hồi quyền bất cứ lúc nào.</span></div>
    </section>

    <section className="publisher-access-eligibility">
      <AlertTriangle/>
      <p><b>Điều kiện tự công bố:</b> tài khoản phải đăng nhập và đã xác minh email; tác phẩm có ít nhất một ảnh, địa điểm HOLA Maps hoặc tọa độ ghim, đồng thời xác nhận quyền tác giả, quyền hình ảnh và quyền sử dụng media. Nếu thiếu ảnh hoặc vị trí, bài vẫn ở trạng thái chờ duyệt và không tự đưa lên bản đồ.</p>
    </section>

    {error&&<div className="publisher-access-message error" role="alert">{error}</div>}
    {message&&<div className="publisher-access-message success" role="status"><CheckCircle2/>{message}</div>}

    <section className="publisher-access-list">
      <div className="publisher-access-list-head">
        <div><span className="publisher-access-kicker">DANH SÁCH TÀI KHOẢN</span><h3>Chọn người được đăng trực tiếp</h3><p>Chỉ tài khoản cộng đồng đã đăng ký và xác minh email mới được cấp quyền.</p></div>
        <button type="button" className="publisher-access-refresh" onClick={()=>load(query)} disabled={loading||Boolean(busy)}><RefreshCw className={loading?'spin':''}/> Làm mới</button>
      </div>

      <form className="publisher-access-search" onSubmit={search}>
        <label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email tài khoản…"/></label>
        <button type="submit" disabled={loading}>Tìm tài khoản</button>
      </form>

      <label className="publisher-access-note">Ghi chú cấp quyền (không bắt buộc)
        <input value={note} onChange={event=>setNote(event.target.value)} maxLength={1000} placeholder="Ví dụ: Ban biên tập, cộng tác viên phụ trách nội dung…"/>
      </label>

      <div className="publisher-access-table">
        <div className="publisher-access-table-head"><span>Tài khoản</span><span>Đóng góp</span><span>Trạng thái quyền</span><span>Thao tác</span></div>
        {items.map(item=>{
          const canGrant=item.status==='ACTIVE'&&Boolean(item.emailVerifiedAt)
          return <article className="publisher-access-row" key={item.id}>
            <div className="publisher-access-person">
              <span className="publisher-access-avatar"><UserRound/></span>
              <div><b>{item.displayName||item.name||'Chưa cập nhật tên'}</b><small>{item.email}</small><small>{item.status==='ACTIVE'?'Tài khoản hoạt động':'Tài khoản đã khóa'} · {item.emailVerifiedAt?'Đã xác minh email':'Chưa xác minh email'}</small></div>
            </div>
            <div className="publisher-access-count"><b>{item.submissionCount||0}</b><small>góc nhìn · {item.publishedCount||0} đã công bố</small></div>
            <div className="publisher-access-state">
              {item.autoPublishEnabled
                ? <><span className="publisher-access-badge enabled"><ShieldCheck/> Đang ủy quyền</span><small>Từ {formatDate(item.autoPublishGrantedAt)}</small>{item.autoPublishNote&&<small>{item.autoPublishNote}</small>}</>
                : <><span className="publisher-access-badge disabled"><ShieldOff/> Duyệt thủ công</span><small>Chưa được cấp quyền</small></>}
            </div>
            <div className="publisher-access-action">
              <button type="button" className={item.autoPublishEnabled?'revoke':'grant'} disabled={Boolean(busy)||(!item.autoPublishEnabled&&!canGrant)} onClick={()=>toggle(item)}>
                {busy===item.id?'Đang lưu…':item.autoPublishEnabled?'Thu hồi quyền':'Cấp quyền tự đăng'}
              </button>
            </div>
          </article>
        })}
        {!items.length&&!loading&&<div className="publisher-access-empty"><Users/><b>Chưa tìm thấy tài khoản cộng đồng</b><span>Người dùng cần đăng ký và xác minh email trước khi Admin có thể ủy quyền.</span></div>}
        {loading&&!items.length&&<div className="publisher-access-empty">Đang tải tài khoản…</div>}
      </div>
      <p className="publisher-access-footnote">Quyền chỉ áp dụng cho góc nhìn gửi mới sau thời điểm cấp quyền. Các bài cũ không tự thay đổi trạng thái.</p>
    </section>
  </div>
}
