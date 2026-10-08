import { useState } from 'react'
import { ExternalLink, LoaderCircle } from 'lucide-react'
import '../styles/hola-map-page.css'

const HOLA_MAPS_URL = 'https://maps.dothihoalac.vn/'
const HOLA_MAPS_EMBED_URL = 'https://maps.dothihoalac.vn/embed'

export default function MapPage(){
  const [frameLoading,setFrameLoading]=useState(true)

  return <main className="hm-page hm-official-page">
    <section className="hm-official-shell" aria-label="HOLA Maps">
      <div className="hm-map-crop">
        <iframe
          className="hm-official-frame"
          src={HOLA_MAPS_EMBED_URL}
          title="HOLA Maps — Bản đồ Hòa Lạc"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="geolocation; fullscreen"
          onLoad={()=>setFrameLoading(false)}
        />
      </div>

      {frameLoading&&<div className="hm-official-loading">
        <LoaderCircle/> <span>Đang mở bản đồ HOLA Maps…</span>
      </div>}

      <a
        className="hm-official-open"
        href={HOLA_MAPS_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Truy cập HOLA Maps"
      >
        Truy cập HOLA Maps <ExternalLink/>
      </a>
    </section>
  </main>
}
