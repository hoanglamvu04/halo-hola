import { useMemo } from 'react'
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileWarning, Globe2,
  Images, RefreshCw, ShieldCheck, Sparkles, Trophy, Users
} from 'lucide-react'
import AdminOperationsInsights from './AdminOperationsInsights.jsx'
import './AdminOverviewV2.css'

const statusLabels={
  PENDING:'Mới nhận',
  VALID:'Hợp lệ',
  SHORTLIST:'Shortlist',
  TOP52:'TOP52',
  AWARDED:'Đạt giải',
  REJECTED:'Không hợp lệ'
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
      title:data.pending?'Tác phẩm đang chờ duyệt':'Hàng chờ đã sạch',
      text:data.pending?`${data.pending} bài cần kiểm tra trạng thái và quyền sử dụng.`:'Không còn tác phẩm mới cần xử lý ngay.',
      action:data.pending?'Duyệt ngay':'Xem tác phẩm',
      tone:data.pending?'warning':'good',
      go:()=>onNavigate?.('Tác phẩm')
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
      go:()=>onNavigate?.('Tác phẩm')
    },
    {
      key:'publish',
      count:data.needsPublication,
      icon:Globe2,
      title:data.needsPublication?'Có bài hợp lệ chưa công bố':'Công bố đã đồng bộ',
      text:data.needsPublication?`${data.needsPublication} bài đủ điều kiện đang chưa ở trạng thái công khai.`:'Không có bài hợp lệ đang chờ công bố.',
      action:'Mở công bố',
      tone:data.needsPublication?'info':'good',
      go:()=>onNavigate?.('Công bố')
    },
    {
      key:'maps',
      count:data.mapFailed,
      icon:AlertTriangle,
      title:data.mapFailed?'HOLA Maps có lỗi đồng bộ':'HOLA Maps không có lỗi',
      text:data.mapFailed?`${data.mapFailed} bài cần đồng bộ lại từ module Tác phẩm.`:'Không phát hiện job HOLA Maps bị FAILED trong danh sách hiện tại.',
      action:'Kiểm tra Maps',
      tone:data.mapFailed?'danger':'good',
      go:()=>onNavigate?.('Tác phẩm')
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
          : 'Hiện chưa có cảnh báo ưu tiên. Bạn có thể tiếp tục theo dõi bài dự thi, BGK và lịch công bố.'}</p>
        <div className="admin-v2-hero-actions">
          <button onClick={()=>onNavigate?.('Tác phẩm')}><Images size={16}/> Quản lý tác phẩm <ArrowRight size={15}/></button>
          <button className="secondary" onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading?'spin':''}/> Làm mới</button>
        </div>
      </div>
      <div className="admin-v2-hero-health">
        <div className="admin-v2-progress-ring" style={{'--admin-progress':`${data.reviewProgress*3.6}deg`}}>
          <div><strong>{data.reviewProgress}%</strong><span>đã xử lý</span></div>
        </div>
        <div className="admin-v2-health-copy">
          <b>{data.pending?`${data.pending} bài đang chờ`:'Không có bài chờ duyệt'}</b>
          <span>{data.today?`Hôm nay nhận thêm ${data.today} bài.`:'Hôm nay chưa có bài mới.'}</span>
        </div>
      </div>
    </section>

    <section className="admin-v2-metrics" aria-label="Chỉ số chính">
      <button onClick={()=>onNavigate?.('Tác phẩm')}>
        <span className="metric-icon"><Images/></span><div><small>Tổng tác phẩm</small><strong>{data.total}</strong><em>{data.pending} chờ duyệt</em></div>
      </button>
      <button onClick={()=>onNavigate?.('Tác giả')}>
        <span className="metric-icon"><Users/></span><div><small>Tác giả</small><strong>{uniqueCreators}</strong><em>{data.today} bài mới hôm nay</em></div>
      </button>
      <button onClick={()=>onNavigate?.('Kết quả BGK')}>
        <span className="metric-icon"><ShieldCheck/></span><div><small>Qua vòng kiểm tra</small><strong>{data.valid+data.shortlist+data.top52+data.awarded}</strong><em>{data.shortlist} shortlist</em></div>
      </button>
      <button onClick={()=>onNavigate?.('TOP52')}>
        <span className="metric-icon"><Trophy/></span><div><small>TOP52 / giải</small><strong>{data.top52+data.awarded}</strong><em>{data.awarded} đạt giải</em></div>
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
          <div><span>GẦN ĐÂY</span><h3>Tác phẩm mới nhất</h3></div>
          <button onClick={()=>onNavigate?.('Tác phẩm')}>Xem tất cả</button>
        </div>
        <div className="admin-v2-recent-list">
          {data.recent.length?data.recent.map(item=><button key={item.id||item.code} onClick={()=>onOpenSubmission?.(item)}>
            <span className="recent-avatar">{String(item.display_name||item.name||item.title||'H').charAt(0).toUpperCase()}</span>
            <span className="recent-copy"><b>{item.title||'Tác phẩm chưa đặt tên'}</b><small>{item.code} · {item.display_name||item.name||'Chưa có tên'}</small></span>
            <span className={`recent-status ${String(item.status||'PENDING').toLowerCase()}`}>{statusLabels[item.status]||item.status}</span>
          </button>):<div className="admin-v2-empty"><CheckCircle2/><b>Chưa có tác phẩm</b><span>Dữ liệu mới sẽ xuất hiện tại đây.</span></div>}
        </div>
      </div>
    </section>

    <AdminOperationsInsights/>

    {data.rejected>0&&<div className="admin-v2-foot-alert"><AlertTriangle/><span><b>{data.rejected} hồ sơ không hợp lệ.</b> Có thể xem lại tại module Tác phẩm để đảm bảo lý do xử lý đã rõ ràng.</span><button onClick={()=>onNavigate?.('Tác phẩm')}>Mở danh sách</button></div>}
  </div>
}
