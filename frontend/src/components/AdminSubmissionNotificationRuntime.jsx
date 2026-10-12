import { useEffect } from 'react'
import { client } from '../services/api.js'

const WRAP_ID='admin-submission-notify-runtime-wrap'

function removeControl(){
  document.getElementById(WRAP_ID)?.remove()
}

export default function AdminSubmissionNotificationRuntime(){
  useEffect(()=>{
    let busy=false

    const sync=()=>{
      if(window.location.pathname!=='/admin/submissions'){
        removeControl()
        return
      }

      const detail=document.querySelector('.admin-detail')
      const eyebrow=detail?.querySelector('.eyebrow')
      const code=String(eyebrow?.textContent||'').trim().toUpperCase()
      if(!detail||!/^HH26-[A-Z0-9-]{3,}$/i.test(code)){
        removeControl()
        return
      }

      const existing=document.getElementById(WRAP_ID)
      if(existing?.dataset.code===code) return
      removeControl()

      const wrap=document.createElement('div')
      wrap.id=WRAP_ID
      wrap.dataset.code=code

      const button=document.createElement('button')
      button.type='button'
      button.className='admin-submission-notify-runtime'
      button.innerHTML='<span aria-hidden="true">✉</span><span>Gửi lại email trạng thái</span>'
      button.title='Gửi lại email trạng thái hiện tại cho người dự thi'

      const note=document.createElement('div')
      note.className='admin-submission-notify-runtime-note'
      note.textContent='Email dùng trạng thái hiện tại của tác phẩm và kèm link tra cứu.'

      button.addEventListener('click',async()=>{
        if(busy) return
        busy=true
        button.disabled=true
        const original=button.innerHTML
        button.textContent='Đang gửi email...'
        try{
          const response=await client.post('/admin/submissions/notify',{code})
          const delivery=response?.data?.delivery||{}
          if(delivery.skipped){
            const message=delivery.reason==='SMTP_NOT_CONFIGURED'
              ? 'Chưa cấu hình SMTP nên email chưa được gửi. Hãy kiểm tra SMTP_HOST / SMTP_USER / SMTP_PASS / MAIL_FROM trên server.'
              : 'Email chưa được gửi: '+String(delivery.reason||'không xác định')
            window.alert(message)
          }else{
            window.alert(`Đã gửi lại email trạng thái cho tác phẩm ${code}.`)
          }
        }catch(error){
          window.alert(error?.response?.data?.error||error?.response?.data?.message||error?.message||'Không thể gửi email trạng thái.')
        }finally{
          busy=false
          button.disabled=false
          button.innerHTML=original
        }
      })

      wrap.append(button,note)
      const rights=detail.querySelector('.admin-rights')
      if(rights) rights.insertAdjacentElement('afterend',wrap)
      else detail.appendChild(wrap)
    }

    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true,characterData:true})
    window.addEventListener('popstate',sync)
    return()=>{
      observer.disconnect()
      window.removeEventListener('popstate',sync)
      removeControl()
    }
  },[])

  return null
}
