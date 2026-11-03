import { useEffect, useState } from 'react'
import { ExternalLink, LoaderCircle, MapPinned, ShieldAlert } from 'lucide-react'
import { getPublicHolaEmbedConfig } from '../services/api.js'
import { getHolaEmbedViewState, HOLA_MAPS_HOME_URL } from '../../../shared/holaEmbedUrl.js'
import '../styles/hola-map-page.css'

export default function MapPage(){
  const [config,setConfig]=useState({mode:'loading',embedUrl:''})
  const [framePending,setFramePending]=useState(false)

  useEffect(()=>{
    let active=true
    const controller=new AbortController()
    getPublicHolaEmbedConfig({signal:controller.signal}).then(result=>{
      if(!active)return
      // Always revalidate public settings in the browser: no legacy keyless iframe.
      setConfig(getHolaEmbedViewState(result?.embedUrl))
    }).catch(()=>{
      if(active)setConfig({mode:'waiting',embedUrl:''})
    })
    return ()=>{active=false;controller.abort()}
  },[])

  useEffect(()=>{
    if(config.mode!=='embed')return undefined
    setFramePending(true)
    // onLoad can fire for a CSP-blocked/403 frame. Never infer success from it.
    // This small status chip times out and NEVER blocks pointer interaction.
    const timeout=window.setTimeout(()=>setFramePending(false),8000)
    return ()=>window.clearTimeout(timeout)
  },[config.mode,config.embedUrl])

  return <main className="hm-page hm-official-page">
    <section className="hm-official-shell" aria-label="HOLA Maps">
      {config.mode==='embed'?<>
        <div className="hm-map-crop">
          <iframe
            key={config.embedUrl}
            className="hm-official-frame"
            src={config.embedUrl}
            title="HOLA Maps — Bản đồ Hòa Lạc tương tác"
            loading="eager"
            referrerPolicy="no-referrer"
            allow="geolocation; fullscreen"
            onLoad={()=>setFramePending(false)}
          />
        </div>

        {framePending&&<div className="hm-official-loading" role="status">
          <LoaderCircle aria-hidden="true"/> <span>Đang mở khung bản đồ…</span>
        </div>}

        <div className="hm-official-actions">
          <div className="hm-embed-assistance">
            Nếu bản đồ báo từ chối kết nối, hãy kiểm tra quyền nhúng của halohola.xspace.vn trên HOLA Maps hoặc mở lớp ảnh trực tiếp.
          </div>
          <a className="hm-official-open hm-official-open-secondary"
            href={config.embedUrl} target="_blank" rel="noopener noreferrer">
            Mở bản đồ ở tab mới <ExternalLink aria-hidden="true"/>
          </a>
          <a className="hm-official-open"
            href={HOLA_MAPS_HOME_URL + 'halo'} target="_blank" rel="noopener noreferrer">
            Xem ảnh Góc nhìn <ExternalLink aria-hidden="true"/>
          </a>
        </div>
      </>:config.mode==='loading'?<div className="hm-standby">
        <LoaderCircle className="hm-standby-spinner" aria-hidden="true"/>
        <p role="status">Đang kiểm tra cấu hình HOLA Maps…</p>
        <a className="hm-official-open hm-standby-open"
          href={HOLA_MAPS_HOME_URL} target="_blank" rel="noopener noreferrer">
          Mở HOLA Maps <ExternalLink aria-hidden="true"/>
        </a>
      </div>:<div className="hm-standby">
        <div className="hm-standby-symbol"><MapPinned aria-hidden="true"/></div>
        <span className="hm-standby-kicker"><ShieldAlert aria-hidden="true"/> HOLA MAPS · TÍCH HỢP</span>
        <h1>HOLA Maps đang chờ kết nối</h1>
        <p>HALO HOLA chưa có URL nhúng hợp lệ do HOLA Maps cấp. Bạn vẫn có thể khám phá bản đồ trực tiếp trong lúc chúng tôi hoàn tất đăng ký quyền nhúng.</p>
        <a className="hm-official-open hm-standby-open"
          href={HOLA_MAPS_HOME_URL} target="_blank" rel="noopener noreferrer">
          Mở HOLA Maps <ExternalLink aria-hidden="true"/>
        </a>
      </div>}
    </section>
  </main>
}
