import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Eye, MapPin, MousePointerClick, RefreshCw, Share2, Users } from 'lucide-react'
import { client } from '../services/api.js'
import './AnalyticsManager.css'

const labels={
  page_view:'Lượt xem trang',cta_click:'Click điều hướng',submit_cta:'Gửi góc nhìn',map_open:'Mở HOLA Map',
  top52_open:'Mở TOP52',share_click:'Chia sẻ',outbound_click:'Click ra ngoài'
}

export default function AnalyticsManager(){
  const [days,setDays]=useState(30)
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  const load=async()=>{
    setLoading(true);setError('')
    try{const res=await client.get('/admin/analytics/summary',{params:{days}});setData(res.data)}
    catch(err){setError(err.response?.data?.error||err.message||'Không tải được analytics.')}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[days])

  const maxDaily=useMemo(()=>Math.max(1,...(data?.daily||[]).map(x=>Number(x.pageviews||0))),[data])
  const overview=data?.overview||{}

  return <div className="analytics-shell">
    <section className="analytics-hero">
      <div><span><Activity/> FIRST-PARTY ANALYTICS</span><h2>Hiệu quả website HALO HOLA</h2><p>Đo page view và các hành vi chính mà không cần cookie quảng cáo hay gửi dữ liệu người dùng sang nền tảng bên thứ ba.</p></div>
      <div className="analytics-controls"><select value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>7 ngày</option><option value={14}>14 ngày</option><option value={30}>30 ngày</option><option value={90}>90 ngày</option></select><button onClick={load} disabled={loading}><RefreshCw className={loading?'spin':''}/> Làm mới</button></div>
    </section>

    {error&&<div className="form-error">{error}</div>}

    <section className="analytics-stats">
      <article><Eye/><div><small>Page view / 30 ngày</small><b>{overview.pageviews30||0}</b></div></article>
      <article><Users/><div><small>Phiên truy cập / 30 ngày</small><b>{overview.visitors30||0}</b></div></article>
      <article><MousePointerClick/><div><small>Click Gửi góc nhìn</small><b>{overview.submitClicks30||0}</b></div></article>
      <article><MapPin/><div><small>Mở HOLA Map</small><b>{overview.mapOpens30||0}</b></div></article>
      <article><BarChart3/><div><small>Mở TOP52</small><b>{overview.top52Opens30||0}</b></div></article>
      <article><Share2/><div><small>Lượt chia sẻ</small><b>{overview.shares30||0}</b></div></article>
    </section>

    <section className="analytics-grid">
      <div className="analytics-panel analytics-trend">
        <header><div><span>TRAFFIC</span><h3>Lượt xem theo ngày</h3></div><small>{data?.days||days} ngày gần nhất</small></header>
        <div className="analytics-bars">{(data?.daily||[]).map(row=><div key={row.date} title={`${row.date}: ${row.pageviews} lượt xem · ${row.visitors} phiên`}><span style={{height:`${Math.max(4,Number(row.pageviews||0)/maxDaily*100)}%`}}/><small>{row.date.slice(5)}</small></div>)}</div>
        {!loading&&!data?.daily?.length&&<p className="analytics-empty">Chưa có dữ liệu traffic.</p>}
      </div>

      <div className="analytics-panel">
        <header><div><span>HÀNH VI</span><h3>Sự kiện nổi bật</h3></div></header>
        <div className="analytics-list">{(data?.events||[]).map((row,index)=><div key={row.event}><b>{String(index+1).padStart(2,'0')}</b><span>{labels[row.event]||row.event}</span><strong>{row.count}</strong></div>)}</div>
      </div>

      <div className="analytics-panel analytics-pages">
        <header><div><span>NỘI DUNG</span><h3>Trang được xem nhiều</h3></div></header>
        <div className="analytics-list">{(data?.paths||[]).map((row,index)=><div key={row.path}><b>{String(index+1).padStart(2,'0')}</b><span title={row.path}>{row.path}</span><small>{row.visitors} phiên</small><strong>{row.views}</strong></div>)}</div>
      </div>
    </section>

    <p className="analytics-note">Không lưu IP, email, số điện thoại hay nội dung form trong analytics. Session ID chỉ tồn tại trong phiên trình duyệt.</p>
  </div>
}
