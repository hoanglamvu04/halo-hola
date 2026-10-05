import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, LoaderCircle, MapPin } from 'lucide-react'
import { getHolaMapConfig } from '../services/holaMapsApi.js'
import '../styles/hola-map-page.css'

const DEFAULT_EMBED_URL = 'https://maps.dothihoalac.vn/embed'
const DEFAULT_MAP_URL = 'https://maps.dothihoalac.vn/map'

export default function MapPage(){
  const [config,setConfig]=useState(null)
  const [loading,setLoading]=useState(true)
  const [frameLoading,setFrameLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    const controller=new AbortController()
    getHolaMapConfig({signal:controller.signal})
      .then(value=>{
        if(value) setConfig(value)
      })
      .catch(err=>{
        if(err?.name!=='AbortError') {
          setError('Không tải được cấu hình SDK Hola Maps. Đang dùng địa chỉ embed mặc định.')
        }
      })
      .finally(()=>setLoading(false))
    return ()=>controller.abort()
  },[])

  const embedUrl=useMemo(()=>config?.embedUrl||DEFAULT_EMBED_URL,[config])
  const fullMapUrl=useMemo(()=>{
    try {
      const url=new URL(embedUrl)
      url.pathname='/map'
      url.search=''
      return url.toString()
    } catch {
      return DEFAULT_MAP_URL
    }
  },[embedUrl])

  return <main className="hm-page hm-official-page">
    <section className="hm-official-shell" aria-label="HOLA Map">
      <iframe
        className="hm-official-frame"
        src={embedUrl}
        title="Hola Maps — Bản đồ Hòa Lạc"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="geolocation; fullscreen"
        onLoad={()=>setFrameLoading(false)}
      />

      {(loading||frameLoading)&&<div className="hm-official-loading">
        <LoaderCircle/> <span>Đang mở bản đồ Hola Maps…</span>
      </div>}

      <div className="hm-official-brand">
        <MapPin/>
        <span><b>HOLA Map</b><small>Official Hola Maps SDK · vùng Hòa Lạc</small></span>
      </div>

      <a className="hm-official-open" href={fullMapUrl} target="_blank" rel="noreferrer">
        Mở toàn màn hình <ExternalLink/>
      </a>

      {error&&<div className="hm-official-warning">{error}</div>}
    </section>
  </main>
}
