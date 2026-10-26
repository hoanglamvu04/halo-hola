import { useMemo } from 'react'
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileWarning, Globe2,
  Images, RefreshCw, ShieldCheck, Sparkles, Users
} from 'lucide-react'
import AdminOperationsInsights from './AdminOperationsInsights.jsx'
import './AdminOverviewV2.css'

const statusLabels={
  PENDING:'Mới nhận',
  VALID:'Đủ thông tin',
  SHORTLIST:'Được chọn biên tập',
  TOP52:'TOP52',
  AWARDED:'Góc nhìn tiêu biểu',
  REJECTED:'Cần bổ sung'
}

function dateValue(item){
  const value=item?.created_at||item?.createdAt||item?.updated_at
  const time=value?new Date(value).getTime():0
  return Number.isFinite(time)?time:0
}

export default function AdminOverviewV2({
  submissions=[],
  uniqueCreators=0,
  loading=false,
  onNavigate,
  onOpenSubmission,
  onRefresh
}){
  const data=useMemo(()=>{
    const total=submissions.length
    const pending=submissions.filter(x=>x.status==='PENDING').length
    const valid=submissions.filter(x=>x.status==='VALID').length
    const shortlist=submissions.filter(x=>x.status==='SHORTLIST').length
    const top52=submissions.filter(x=>x.status==='TOP52').length
    const awarded=submissions.filter(x=>x.status==='AWARDED').length
    const rejected=submissions.filter(x=>x.status==='REJECTED').length
    const missingMedia=submissions.filter(x=>!(x.media||[]).length&&!x.external_link).length
    const missingFacebook=submissions.filter(x=>x.submission_source==='FACEBOOK'&&!x.facebook_post_url).length
    const needsPublication=submissions.filter(x=>
      ['VALID','SHORTLIST','TOP52','AWARDED'].includes(x.status) && x.publication_state!=='PUBLISHED'
    ).length
    const mapFailed=submissions.filter(x=>String(x.hola_maps_sync_status||'').toUpperCase()==='FAILED').length
    const completed=Math.max(0,total-pending)
    const reviewProgress=total?Math.round((completed/total)*100):0
    const recent=[...submissions].sort((a,b)=>dateValue(b)-dateValue(a)).slice(0,5)
    const todayKey=new Date().toLocaleDateString('vi-VN')
    const today=submissions.filter(x=>{
      const value=x.created_at||x.createdAt
      return value && new Date(value).toLocaleDateString('vi-VN')===todayKey
    }).length
    const issueCount=pending+missingMedia+missingFacebook+needsPublication+mapFailed
    return {total,pending,valid,shortlist,top52,awarded,rejected,missingMedia,missingFacebook,needsPublication,mapFailed,reviewProgress,recent,today,issueCount}
  },[submissions])

  const priorities=[
    {
      key:'pending',
      count:data.pending,
      icon:Clock3,
      title:data.pending?'Góc nhìn đang chờ kiểm tra':'Hàng chờ đã sạch',
      text:data.pending?`${data.pending} góc nhìn cần kiểm tra trạng thái và quyền sử dụng.`:'Không còn góc nhìn mới cần xử lý ngay.',
      action:data.pending?'Duyệt ngay':'Xem tác phẩm',
      tone:data.pending?'warning':'good',
      go:()=>onNavigate?.('Góc nhìn')
    },
    {
      key:'completion',
      count:data.missingMedia+data.missingFacebook,
      icon:FileWarning,
      title:(data.missingMedia+data.missingFacebook)?'Hồ sơ chưa hoàn tất':'Hồ sơ đang đầy đủ',
      text:(data.missingMedia+data.missingFacebook)
        ? `${data.missingMedia} bài thiếu file/link · ${data.missingFacebook} bài Facebook thiếu liên kết.`
        :'Chưa phát hiện hồ sơ thiếu media hoặc bước Facebook bắt buộc.',
      action:'Kiểm tra hồ sơ',
      tone:(data.missingMedia+data.missingFacebook)?'danger':'good',
      go:()=>onNavigate?.('Góc nhìn')
    },
    {
      key:'publish',
      count:data.needsPublication,
      icon:Globe2,
      title:data.needsPublication?'Có góc nhìn đủ điều kiện chưa công bố':'Công bố đã đồng bộ',
      text:data.needsPublication?`${data.needsPublication} góc nhìn đủ điều kiện đang chưa ở trạng thái công khai.`:'Không có góc nhìn đủ điều kiện đang chờ công bố.',
      action:'Mở công bố',
      tone:data.needsPublication?'info':'good',
      go:()=>onNavigate?.('Công bố')
    },
    {
      key:'maps',
      count:data.mapFailed,
      icon:AlertTriangle,
      title:data.mapFailed?'HOLA Maps có lỗi đồng bộ':'HOLA Maps không có lỗi',
      text:data.mapFailed?`${data.mapFailed} góc nhìn cần đồng bộ lại từ module Góc nhìn.`:'Không phát hiện job HOLA Maps bị FAILED trong danh sách hiện tại.',
      action:'Kiểm tra Maps',
      tone:data.mapFailed?'danger':'good',
      go:()=>onNavigate?.('Góc nhìn')
    }
  ]

  const headline=data.issueCount
    ? `Có ${data.issueCount} việc cần chú ý`
    : 'Mọi thứ đang trong tầm kiểm soát'

  return <div className="admin-v2-overview">
    <section className="admin-v2-hero">
      <div className="admin-v2-hero-copy">
        <span className="admin-v2-kicker"><Sparkles size={14}/> TRUNG TÂM VẬN HÀNH</span>
        <h2>{headline}</h2>
        <p>{data.issueCount
          ? 'Hệ thống đã gom các việc quan trọng lên trước để bạn không phải dò từng module.'
          : 'Hiện chưa có cảnh báo ưu tiên. Bạn có thể tiếp tục theo dõi góc nhìn, tiến trình biên tập và lịch công bố.'}</p>
        <div className="admin-v2-hero-actions">
          <button onClick={()=>onNavigate?.('Góc nhìn')}><Images size={16}/> Quản lý góc nhìn <ArrowRight size={15}/></button>
          <button className="secondary" onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading?'spin':''}/> Làm mới</button>
        </div>
      </div>
      <div className="admin-v2-hero-health">
        <div className="admin-v2-progress-ring" style={{'--admin-progress':`${data.reviewProgress*3.6}deg`}}>
          <div><strong>{data.reviewProgress}%</strong><span>đã xử lý</span></div>
        </div>
        <div className="admin-v2-health-copy">
          <b>{data.pending?`${data.pending} góc nhìn đang chờ`:'Không có bài chờ duyệt'}</b>
          <span>{data.today?`Hôm nay nhận thêm ${data.today} góc nhìn.`:'Hôm nay chưa có góc nhìn mới.'}</span>
        </div>
      </div>
    </section>

    <section className="admin-v2-metrics" aria-label="Chỉ số chính">
      <button onClick={()=>onNavigate?.('Góc nhìn')}>
        <span className="metric-icon"><Images/></span><div><small>Tổng góc nhìn</small><strong>{data.total}</strong><em>{data.pending} chờ kiểm tra</em></div>
      </button>
      <button onClick={()=>onNavigate?.('Tác giả')}>
        <span className="metric-icon"><Users/></span><div><small>Tác giả</small><strong>{uniqueCreators}</strong><em>{data.today} góc nhìn mới hôm nay</em></div>
      </button>
      <button onClick={()=>onNavigate?.('TOP52')}>
        <span className="metric-icon"><ShieldCheck/></span><div><small>Đủ điều kiện biên tập</small><strong>{data.valid+data.shortlist+data.top52+data.awarded}</strong><em>{data.shortlist} được chọn biên tập</em></div>
      </button>
      <button onClick={()=>onNavigate?.('TOP52')}>
        <span className="metric-icon"><Sparkles/></span><div><small>TOP52 / tiêu biểu</small><strong>{data.top52+data.awarded}</strong><em>{data.awarded} góc nhìn tiêu biểu</em></div>
      </button>
    </section>

    <section className="admin-v2-workspace">
      <div className="admin-v2-priorities">
        <div className="admin-v2-section-head">
          <div><span>ƯU TIÊN</span><h3>Việc nên xử lý trước</h3></div>
          <small>Tự tổng hợp từ dữ liệu hiện tại</small>
        </div>
        <div className="admin-v2-priority-list">
          {priorities.map(item=>{
            const Icon=item.icon
            return <button key={item.key} className={`admin-v2-priority ${item.tone}`} onClick={item.go}>
              <span className="priority-icon"><Icon/></span>
              <span className="priority-copy"><b>{item.title}</b><small>{item.text}</small></span>
              <span className="priority-action">{item.count>0&&<i>{item.count}</i>}{item.action}<ArrowRight/></span>
            </button>
          })}
        </div>
      </div>

      <div className="admin-v2-recent">
        <div className="admin-v2-section-head">
          <div><span>GẦN ĐÂY</span><h3>Góc nhìn mới nhất</h3></div>
          <button onClick={()=>onNavigate?.('Góc nhìn')}>Xem tất cả</button>
        </div>
        <div className="admin-v2-recent-list">
          {data.recent.length?data.recent.map(item=><button key={item.id||item.code} onClick={()=>onOpenSubmission?.(item)}>
            <span className="recent-avatar">{String(item.display_name||item.name||item.title||'H').charAt(0).toUpperCase()}</span>
            <span className="recent-copy"><b>{item.title||'Góc nhìn chưa đặt tên'}</b><small>{item.code} · {item.display_name||item.name||'Chưa có tên'}</small></span>
            <span className={`recent-status ${String(item.status||'PENDING').toLowerCase()}`}>{statusLabels[item.status]||item.status}</span>
          </button>):<div className="admin-v2-empty"><CheckCircle2/><b>Chưa có góc nhìn</b><span>Dữ liệu mới sẽ xuất hiện tại đây.</span></div>}
        </div>
      </div>
    </section>

    <AdminOperationsInsights/>

    {data.rejected>0&&<div className="admin-v2-foot-alert"><AlertTriangle/><span><b>{data.rejected} hồ sơ không hợp lệ.</b> Có thể xem lại tại module Góc nhìn để đảm bảo lý do xử lý đã rõ ràng.</span><button onClick={()=>onNavigate?.('Góc nhìn')}>Mở danh sách</button></div>}
  </div>
}
