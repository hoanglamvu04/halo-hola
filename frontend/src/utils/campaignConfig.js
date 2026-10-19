export const OFFICIAL_CAMPAIGN_MILESTONES=[
  ['17.10–05.11','DISCOVER · đi tìm nguyên liệu'],
  ['05.11–15.11','CURATE · chọn và biên tập 52 góc nhìn'],
  ['15.11–23.11','BUILD · triển lãm · Calendar · HOLA DAY'],
  ['24.11','REVEAL · HOLA DAY · mở ra HALO HOLA 2027']
]

const defaults={
  mainBg:'#fbf7ef',titleColor:'#103f31',textColor:'#52675e',eyebrowColor:'#e55329',
  statCardBg:'#fffdf7',statCardBorder:'#eadfcd',statNumberColor:'#103f31',statLabelColor:'#40564d',statIconColor:'#0f6a4a',
  ctaBg:'#e95f25',ctaTextColor:'#ffffff',timelineBg:'#074c37',timelineTitleColor:'#ffffff',timelineIconColor:'#f2b84b',
  milestoneBg:'#145e49',milestoneBorder:'#4f826f',milestoneDateColor:'#ff9c45',milestoneTextColor:'#ffffff',
  activeMilestoneBg:'#1b684f',activeMilestoneBorder:'#e2b34f',activeMilestoneDateColor:'#ffd15c',
  journeyTitle:'Hành trình biên tập 2026'
}

const legacy={
  mainBg:['#0d4934','#fbf7ef'],titleColor:['#ffffff','#103f31'],textColor:['#ffffff','#52675e'],eyebrowColor:['#f1ba73','#e55329'],
  statCardBg:['#184f3d','#fffdf7'],statCardBorder:['#3a6a59','#eadfcd'],statNumberColor:['#ffffff','#103f31'],
  statLabelColor:['#d6e1db','#40564d'],statIconColor:['#f2b84b','#0f6a4a'],ctaBg:['#d8582f','#e95f25'],
  timelineBg:['#0f5139','#074c37'],milestoneBg:['#24624d','#145e49'],milestoneBorder:['#3b735f','#4f826f'],
  milestoneDateColor:['#f2b84b','#ff9c45'],activeMilestoneBg:['#3f6944','#1b684f'],activeMilestoneBorder:['#9a8d35','#e2b34f'],
  activeMilestoneDateColor:['#ffd05b','#ffd15c']
}

export function normalizeCampaignConfig(content={}){
  const result={...defaults,...content}
  Object.entries(legacy).forEach(([key,[oldValue,newValue]])=>{
    if(String(result[key]||'').trim().toLowerCase()===oldValue) result[key]=newValue
  })
  return result
}

export function campaignCssVars(campaign={}){
  const c=normalizeCampaignConfig(campaign)
  return {
    '--campaign-main-bg':c.mainBg,
    '--campaign-title-color':c.titleColor,
    '--campaign-text-color':c.textColor,
    '--campaign-eyebrow-color':c.eyebrowColor,
    '--campaign-stat-bg':c.statCardBg,
    '--campaign-stat-border':c.statCardBorder,
    '--campaign-stat-number':c.statNumberColor,
    '--campaign-stat-label':c.statLabelColor,
    '--campaign-stat-icon':c.statIconColor,
    '--campaign-cta-bg':c.ctaBg,
    '--campaign-cta-text':c.ctaTextColor,
    '--campaign-timeline-bg':c.timelineBg,
    '--campaign-timeline-title':c.timelineTitleColor,
    '--campaign-timeline-icon':c.timelineIconColor,
    '--campaign-milestone-bg':c.milestoneBg,
    '--campaign-milestone-border':c.milestoneBorder,
    '--campaign-milestone-date':c.milestoneDateColor,
    '--campaign-milestone-text':c.milestoneTextColor,
    '--campaign-active-bg':c.activeMilestoneBg,
    '--campaign-active-border':c.activeMilestoneBorder,
    '--campaign-active-date':c.activeMilestoneDateColor,
    ...(c.backgroundImage?{'--campaign-background-image':`url(${JSON.stringify(String(c.backgroundImage))})`}:{})
  }
}
