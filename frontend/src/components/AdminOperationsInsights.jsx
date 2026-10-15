import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Facebook, Globe2, MapPin, RefreshCw, Users } from 'lucide-react'
import { getAdminOperationsDashboard } from '../services/adminOperationsApi.js'
import './AdminOperationsInsights.css'

function Bars({items=[],empty='Chưa có dữ liệu'}){
  const max=Math.max(1,...items.map(item=>Number(item.count||0)))
  if(!items.length)return <div className="admin-insights-empty">{empty}</div>
  return <div className="admin-insights-bars">{items.map(item=><div key={item.label||item.day}>
    <span title={item.label||item.day}>{item.label||item.day}</span>
    <i><b style={{width:`${Math.max(3,Number(item.count||0)/max*100)}%`}}/></i>
    <strong>{item.count}</strong>
  </div>)}</div>
}

export default function AdminOperationsInsights(){
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  const load=async()=>{
    setLoading(true);setError('')
    try{setData(await getAdminOperationsDashboard())}
    catch(err){setError(err.message)}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[])

  const summary=data?.summary||{}
  const byDay=useMemo(()=>data?.byDay||[],[data])
  const sourceTotal=Number(summary.source_web||0)+Number(summary.source_facebook||0)

  return <section className="admin-insights">
    <div className="admin-insights-head">
      <div><span>PHÂN TÍCH VẬN HÀNH</span><h3>Số liệu thật của chương trình</h3><p>Nhận bài, duyệt, công bố và trạng thái HOLA Maps được tổng hợp trực tiếp từ database.</p></div>
      <button onClick={load} disabled={loading}><RefreshCw className={loading?'spin':''}/> Làm mới</button>
    </div>
    {error&&<div className="form-error">{error}</div>}
    {loading&&!data?<div className="admin-insights-loading">Đang tổng hợp dữ liệu…</div>:<>
      <div className="admin-insights-kpis">
        <div><Users/><small>Tác giả</small><strong>{summary.creators||0}</strong><em>{summary.today||0} bài hôm nay</em></div>
        <div><BarChart3/><small>Tỷ lệ hợp lệ</small><strong>{summary.valid_rate||0}%</strong><em>{summary.approved||0}/{summary.total||0} hồ sơ</em></div>
        <div><Globe2/><small>Tỷ lệ công bố</small><strong>{summary.publication_rate||0}%</strong><em>{summary.public_now||0} đang public</em></div>
        <div className={Number(summary.maps_failed||0)?'warn':''}><MapPin/><small>HOLA Maps</small><strong>{summary.maps_sync_rate||0}%</strong><em>{summary.maps_synced||0} synced · {summary.maps_failed||0} lỗi</em></div>
      </div>

      <div className="admin-insights-grid">
        <article><header><div><span>14 NGÀY</span><h4>Lượng bài gửi theo ngày</h4></div><b>{summary.total||0} tổng</b></header><Bars items={byDay.map(x=>({label:String(x.day).slice(5),count:x.count}))}/></article>
        <article><header><div><span>CHỦ ĐỀ</span><h4>Phân bổ tác phẩm</h4></div></header><Bars items={data?.byTheme||[]}/></article>
        <article><header><div><span>ĐỊA BÀN</span><h4>Nơi được ghi lại nhiều nhất</h4></div></header><Bars items={data?.byLocation||[]}/></article>
        <article><header><div><span>LOẠI HÌNH</span><h4>Cơ cấu tác phẩm</h4></div></header><Bars items={data?.byType||[]}/></article>
      </div>

      <div className="admin-insights-health">
        <div><span className="health-icon"><Facebook/></span><div><b>Nguồn gửi</b><small>Website {summary.source_web||0} · Facebook {summary.source_facebook||0} · tổng {sourceTotal}</small></div></div>
        <div className={Number(summary.maps_failed||0)?'danger':''}><span className="health-icon"><MapPin/></span><div><b>Đồng bộ HOLA Maps</b><small>{summary.maps_pending||0} đang chờ · {summary.maps_failed||0} lỗi cần xử lý</small></div></div>
        <div className={Number(summary.missing_media||0)?'danger':''}><span className="health-icon"><AlertTriangle/></span><div><b>Hồ sơ thiếu media/link</b><small>{summary.missing_media||0} hồ sơ cần kiểm tra</small></div></div>
      </div>
    </>}
  </section>
}
