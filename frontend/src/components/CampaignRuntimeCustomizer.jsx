import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHomepageContent } from '../services/api.js'

const defaults={
  mainBg:'#fbf7ef',titleColor:'#103f31',textColor:'#52675e',eyebrowColor:'#e55329',
  statCardBg:'#fffdf7',statCardBorder:'#eadfcd',statNumberColor:'#103f31',statLabelColor:'#40564d',statIconColor:'#0f6a4a',
  ctaBg:'#e95f25',ctaTextColor:'#ffffff',timelineBg:'#074c37',timelineTitleColor:'#ffffff',timelineIconColor:'#f2b84b',
  milestoneBg:'#145e49',milestoneBorder:'#4f826f',milestoneDateColor:'#ff9c45',milestoneTextColor:'#ffffff',
  activeMilestoneBg:'#1b684f',activeMilestoneBorder:'#e2b34f',activeMilestoneDateColor:'#ffd15c',
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

        const setText=(node,value)=>{
          if(node&&value&&node.textContent!==value) node.textContent=value
        }

        const apply=()=>{
          const root=document.querySelector('.campaign-live')
          if(!root) return

          Object.entries(cssVars).forEach(([key,variable])=>{
            if(campaign[key]&&root.style.getPropertyValue(variable)!==campaign[key]){
              root.style.setProperty(variable,campaign[key])
            }
          })

          if(campaign.backgroundImage){
            const backgroundValue=`url("${String(campaign.backgroundImage).replace(/"/g,'\\"')}")`
            if(root.style.getPropertyValue('--campaign-background-image')!==backgroundValue){
              root.style.setProperty('--campaign-background-image',backgroundValue)
            }
          }

          setText(root.querySelector('.timeline-title b'),campaign.journeyTitle)

          const milestones=root.querySelectorAll('.campaign-milestone')
          milestones.forEach((item,index)=>{
            const n=index+1
            setText(item.querySelector('span'),campaign[`milestone${n}Date`])
            setText(item.querySelector('b'),campaign[`milestone${n}Label`])
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
