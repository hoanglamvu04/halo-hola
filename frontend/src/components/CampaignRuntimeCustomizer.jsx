import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHomepageContent } from '../services/api.js'

const officialMilestones=[
  ['11.10','Mở nhận tác phẩm'],
  ['17–18.10','HOLA Tour #01'],
  ['25.10','HOLA Tour #02'],
  ['31.10–01.11','HOLA Tour #03'],
  ['10.11 · 23:59','Đóng nhận tác phẩm'],
  ['16.11','Công bố TOP52 · mở bình chọn'],
  ['24.11','HOLA DAY']
]

const defaults={
  mainBg:'#fbf7ef',titleColor:'#103f31',textColor:'#52675e',eyebrowColor:'#e55329',
  statCardBg:'#fffdf7',statCardBorder:'#eadfcd',statNumberColor:'#103f31',statLabelColor:'#40564d',statIconColor:'#0f6a4a',
  ctaBg:'#e95f25',ctaTextColor:'#ffffff',timelineBg:'#074c37',timelineTitleColor:'#ffffff',timelineIconColor:'#f2b84b',
  milestoneBg:'#145e49',milestoneBorder:'#4f826f',milestoneDateColor:'#ff9c45',milestoneTextColor:'#ffffff',
  activeMilestoneBg:'#1b684f',activeMilestoneBorder:'#e2b34f',activeMilestoneDateColor:'#ffd15c',
  backgroundImage:'',
  journeyTitle:'Hành trình 2026',
  milestone1Date:officialMilestones[0][0],milestone1Label:officialMilestones[0][1],
  milestone2Date:officialMilestones[1][0],milestone2Label:officialMilestones[1][1],
  milestone3Date:officialMilestones[2][0],milestone3Label:officialMilestones[2][1],
  milestone4Date:officialMilestones[3][0],milestone4Label:officialMilestones[3][1],
  milestone5Date:officialMilestones[4][0],milestone5Label:officialMilestones[4][1],
  milestone6Date:officialMilestones[5][0],milestone6Label:officialMilestones[5][1],
  milestone7Date:officialMilestones[6][0],milestone7Label:officialMilestones[6][1]
}

/* Auto-upgrade only the exact old defaults that were saved before the mobile redesign.
   Any genuinely custom color selected in Admin is left untouched. */
const legacyPalette={
  mainBg:['#0d4934','#fbf7ef'],
  titleColor:['#ffffff','#103f31'],
  textColor:['#ffffff','#52675e'],
  eyebrowColor:['#f1ba73','#e55329'],
  statCardBg:['#184f3d','#fffdf7'],
  statCardBorder:['#3a6a59','#eadfcd'],
  statNumberColor:['#ffffff','#103f31'],
  statLabelColor:['#d6e1db','#40564d'],
  statIconColor:['#f2b84b','#0f6a4a'],
  ctaBg:['#d8582f','#e95f25'],
  timelineBg:['#0f5139','#074c37'],
  milestoneBg:['#24624d','#145e49'],
  milestoneBorder:['#3b735f','#4f826f'],
  milestoneDateColor:['#f2b84b','#ff9c45'],
  activeMilestoneBg:['#3f6944','#1b684f'],
  activeMilestoneBorder:['#9a8d35','#e2b34f'],
  activeMilestoneDateColor:['#ffd05b','#ffd15c']
}

const cssVars={
  mainBg:'--campaign-main-bg',titleColor:'--campaign-title-color',textColor:'--campaign-text-color',eyebrowColor:'--campaign-eyebrow-color',
  statCardBg:'--campaign-stat-bg',statCardBorder:'--campaign-stat-border',statNumberColor:'--campaign-stat-number',statLabelColor:'--campaign-stat-label',statIconColor:'--campaign-stat-icon',
  ctaBg:'--campaign-cta-bg',ctaTextColor:'--campaign-cta-text',timelineBg:'--campaign-timeline-bg',timelineTitleColor:'--campaign-timeline-title',timelineIconColor:'--campaign-timeline-icon',
  milestoneBg:'--campaign-milestone-bg',milestoneBorder:'--campaign-milestone-border',milestoneDateColor:'--campaign-milestone-date',milestoneTextColor:'--campaign-milestone-text',
  activeMilestoneBg:'--campaign-active-bg',activeMilestoneBorder:'--campaign-active-border',activeMilestoneDateColor:'--campaign-active-date'
}

const statLinks=[
  ['.stat-camera','/top52','Xem các góc nhìn đã gửi'],
  ['.stat-people','/stories','Xem các câu chuyện cộng đồng'],
  ['.stat-place','/hola-map','Khám phá địa điểm trên HOLA Map'],
  ['.stat-top52','/top52','Xem tác phẩm TOP52']
]

function normalizePalette(content){
  const campaign={...defaults,...content}
  Object.entries(legacyPalette).forEach(([key,[oldValue,newValue]])=>{
    if(String(campaign[key]||'').trim().toLowerCase()===oldValue){
      campaign[key]=newValue
    }
  })

  // Timeline dates are campaign-wide official dates, so stale CMS values must not override them.
  officialMilestones.forEach(([date,label],index)=>{
    const n=index+1
    campaign[`milestone${n}Date`]=date
    campaign[`milestone${n}Label`]=label
  })
  return campaign
}

export default function CampaignRuntimeCustomizer(){
  const location=useLocation()

  useEffect(()=>{
    if(location.pathname!=='/') return undefined
    let cancelled=false
    let observer
    let boundRoot=null

    const getStatPath=(target)=>target?.closest?.('.live-stat[data-stat-link]')?.dataset?.statLink||''
    const goToStatPath=(path)=>{
      if(!path) return
      window.location.assign(path)
    }
    const onStatClick=(event)=>{
      const path=getStatPath(event.target)
      if(path) goToStatPath(path)
    }
    const onStatKeyDown=(event)=>{
      if(event.key!=='Enter'&&event.key!==' ') return
      const path=getStatPath(event.target)
      if(!path) return
      event.preventDefault()
      goToStatPath(path)
    }

    const bindStatLinks=(root)=>{
      statLinks.forEach(([selector,path,label])=>{
        const card=root.querySelector(selector)
        if(!card) return
        card.dataset.statLink=path
        card.setAttribute('role','link')
        card.setAttribute('tabindex','0')
        card.setAttribute('aria-label',label)
      })

      if(boundRoot!==root){
        boundRoot?.removeEventListener('click',onStatClick)
        boundRoot?.removeEventListener('keydown',onStatKeyDown)
        root.addEventListener('click',onStatClick)
        root.addEventListener('keydown',onStatKeyDown)
        boundRoot=root
      }
    }

    const setText=(node,value)=>{
      if(node&&value&&node.textContent!==value) node.textContent=value
    }

    const syncOfficialTimeline=()=>{
      const root=document.querySelector('.campaign-live')
      if(!root) return
      const milestones=root.querySelectorAll('.campaign-milestone')
      milestones.forEach((item,index)=>{
        const data=officialMilestones[index]
        if(!data) return
        setText(item.querySelector('span'),data[0])
        setText(item.querySelector('b'),data[1])
      })
    }

    // Apply the official schedule immediately so the old hard-coded dates do not flash on screen.
    syncOfficialTimeline()

    const boot=async()=>{
      try{
        const homepage=await getHomepageContent()
        if(cancelled) return
        const campaign=normalizePalette(homepage?.campaign?.content||{})

        const apply=()=>{
          const root=document.querySelector('.campaign-live')
          if(!root) return

          Object.entries(cssVars).forEach(([key,variable])=>{
            if(campaign[key]&&root.style.getPropertyValue(variable)!==campaign[key]){
              root.style.setProperty(variable,campaign[key])
            }
          })

          if(campaign.backgroundImage){
            const backgroundValue=`url(${JSON.stringify(String(campaign.backgroundImage))})`
            if(root.style.getPropertyValue('--campaign-background-image')!==backgroundValue){
              root.style.setProperty('--campaign-background-image',backgroundValue)
            }
          }else{
            root.style.removeProperty('--campaign-background-image')
          }

          setText(root.querySelector('.timeline-title b'),campaign.journeyTitle)

          const milestones=root.querySelectorAll('.campaign-milestone')
          milestones.forEach((item,index)=>{
            const n=index+1
            setText(item.querySelector('span'),campaign[`milestone${n}Date`])
            setText(item.querySelector('b'),campaign[`milestone${n}Label`])
          })

          bindStatLinks(root)
        }

        apply()
        observer=new MutationObserver(apply)
        observer.observe(document.body,{childList:true,subtree:true})
      }catch{
        // Keep the coded defaults when the public homepage configuration is unavailable.
        syncOfficialTimeline()
      }
    }

    boot()
    return ()=>{
      cancelled=true
      observer?.disconnect()
      boundRoot?.removeEventListener('click',onStatClick)
      boundRoot?.removeEventListener('keydown',onStatKeyDown)
    }
  },[location.pathname])

  return null
}
