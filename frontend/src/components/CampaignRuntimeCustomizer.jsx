import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHomepageContent } from '../services/api.js'

const defaults={
  mainBg:'#0d4934',titleColor:'#ffffff',textColor:'#ffffff',eyebrowColor:'#f1ba73',
  statCardBg:'#184f3d',statCardBorder:'#3a6a59',statNumberColor:'#ffffff',statLabelColor:'#d6e1db',statIconColor:'#f2b84b',
  ctaBg:'#d8582f',ctaTextColor:'#ffffff',timelineBg:'#0f5139',timelineTitleColor:'#ffffff',timelineIconColor:'#f2c261',
  milestoneBg:'#24624d',milestoneBorder:'#3b735f',milestoneDateColor:'#f2b84b',milestoneTextColor:'#ffffff',
  activeMilestoneBg:'#3f6944',activeMilestoneBorder:'#9a8d35',activeMilestoneDateColor:'#ffd05b',
  journeyTitle:'Hành trình 2026',
  milestone1Date:'10.10',milestone1Label:'Mở nhận tác phẩm',
  milestone2Date:'17.10',milestone2Label:'HOLA Tour #01',
  milestone3Date:'24.10',milestone3Label:'HOLA Tour #02',
  milestone4Date:'31.10',milestone4Label:'HOLA Tour #03',
  milestone5Date:'10.11',milestone5Label:'Đóng nhận tác phẩm',
  milestone6Date:'18.11',milestone6Label:'Công bố TOP52',
  milestone7Date:'28.11',milestone7Label:'HOLA DAY'
}

const cssVars={
  mainBg:'--campaign-main-bg',titleColor:'--campaign-title-color',textColor:'--campaign-text-color',eyebrowColor:'--campaign-eyebrow-color',
  statCardBg:'--campaign-stat-bg',statCardBorder:'--campaign-stat-border',statNumberColor:'--campaign-stat-number',statLabelColor:'--campaign-stat-label',statIconColor:'--campaign-stat-icon',
  ctaBg:'--campaign-cta-bg',ctaTextColor:'--campaign-cta-text',timelineBg:'--campaign-timeline-bg',timelineTitleColor:'--campaign-timeline-title',timelineIconColor:'--campaign-timeline-icon',
  milestoneBg:'--campaign-milestone-bg',milestoneBorder:'--campaign-milestone-border',milestoneDateColor:'--campaign-milestone-date',milestoneTextColor:'--campaign-milestone-text',
  activeMilestoneBg:'--campaign-active-bg',activeMilestoneBorder:'--campaign-active-border',activeMilestoneDateColor:'--campaign-active-date'
}

export default function CampaignRuntimeCustomizer(){
  const location=useLocation()

  useEffect(()=>{
    if(location.pathname!=='/') return undefined
    let cancelled=false
    let observer

    const boot=async()=>{
      try{
        const homepage=await getHomepageContent()
        if(cancelled) return
        const campaign={...defaults,...(homepage?.campaign?.content||{})}

        const apply=()=>{
          const root=document.querySelector('.campaign-live')
          if(!root) return

          Object.entries(cssVars).forEach(([key,variable])=>{
            if(campaign[key]) root.style.setProperty(variable,campaign[key])
          })

          const title=root.querySelector('.timeline-title b')
          if(title&&campaign.journeyTitle) title.textContent=campaign.journeyTitle

          const milestones=root.querySelectorAll('.campaign-milestone')
          milestones.forEach((item,index)=>{
            const n=index+1
            const date=item.querySelector('span')
            const label=item.querySelector('b')
            if(date&&campaign[`milestone${n}Date`]) date.textContent=campaign[`milestone${n}Date`]
            if(label&&campaign[`milestone${n}Label`]) label.textContent=campaign[`milestone${n}Label`]
          })
        }

        apply()
        observer=new MutationObserver(apply)
        observer.observe(document.body,{childList:true,subtree:true})
      }catch{
        // Keep the coded defaults when the public homepage configuration is unavailable.
      }
    }

    boot()
    return ()=>{
      cancelled=true
      observer?.disconnect()
    }
  },[location.pathname])

  return null
}
