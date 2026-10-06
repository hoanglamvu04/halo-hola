const API_URL=(import.meta.env.VITE_API_URL||'http://localhost:5000/api').replace(/\/$/,'')
const SESSION_KEY='halo_hola_analytics_session'

function getSessionId(){
  try{
    let id=sessionStorage.getItem(SESSION_KEY)
    if(!id){
      id=globalThis.crypto?.randomUUID?.()||('hh-'+Date.now()+'-'+Math.random().toString(36).slice(2,10))
      sessionStorage.setItem(SESSION_KEY,id)
    }
    return id
  }catch{return 'anonymous'}
}

export function trackEvent(eventType,{path,target,metadata}={}){
  if(typeof window==='undefined') return
  const body={
    eventType,
    path:path||window.location.pathname,
    target:target||null,
    sessionId:getSessionId(),
    referrer:document.referrer||null,
    metadata:metadata||{}
  }
  fetch(API_URL+'/analytics/events',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body),
    keepalive:true,
    credentials:'omit'
  }).catch(()=>{})
}

export function classifyClick(element){
  const href=element?.closest?.('a')?.getAttribute?.('href')||''
  const text=(element?.closest?.('a,button')?.textContent||'').replace(/\s+/g,' ').trim().slice(0,160)
  if(href==='/gui-goc-nhin'||href.startsWith('/gui-goc-nhin')) return ['submit_cta',href||text]
  if(href==='/hola-map'||href.startsWith('/hola-map')) return ['map_open',href||text]
  if(href==='/top52'||href.startsWith('/top52')) return ['top52_open',href||text]
  if(/chia sẻ|share/i.test(text)) return ['share_click',href||text]
  if(/^https?:\/\//i.test(href)&&!href.startsWith(window.location.origin)) return ['outbound_click',href]
  return ['cta_click',href||text]
}
