import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function polishUploadCopy(){
  const wizard=document.querySelector('.submit-page .wizard-card')
  const eyebrow=wizard?.querySelector(':scope > .eyebrow')?.textContent||''
  if(!/Bước\s+3\s*\/\s*7/i.test(eyebrow)) return

  const heading=wizard.querySelector('h2')
  const intro=heading?.nextElementSibling
  const vault=wizard.querySelector('.vault-note')
  const vaultTitle=vault?.querySelector('b')
  const vaultText=vault?.querySelector('span')

  if(intro && intro.textContent!=='Tải lên file gốc để BTC lưu trữ và đối chiếu tác phẩm khi cần.'){
    intro.textContent='Tải lên file gốc để BTC lưu trữ và đối chiếu tác phẩm khi cần.'
  }
  if(vaultTitle && vaultTitle.textContent!=='Lưu trữ file gốc') vaultTitle.textContent='Lưu trữ file gốc'
  if(vaultText && vaultText.textContent!=='File của bạn được lưu nguyên vẹn và chỉ dùng cho việc xác minh tác phẩm.'){
    vaultText.textContent='File của bạn được lưu nguyên vẹn và chỉ dùng cho việc xác minh tác phẩm.'
  }
}

export default function SubmissionUploadCopyPolish(){
  const { pathname }=useLocation()

  useEffect(()=>{
    if(pathname!=='/gui-goc-nhin') return undefined
    let frame=0
    const sync=()=>{
      if(frame) return
      frame=requestAnimationFrame(()=>{
        frame=0
        polishUploadCopy()
      })
    }
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    sync()
    return()=>{
      observer.disconnect()
      if(frame) cancelAnimationFrame(frame)
    }
  },[pathname])

  return null
}
