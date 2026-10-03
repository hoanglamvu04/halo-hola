import { useEffect, useState } from 'react'
import { Save, Settings, Globe2, Search, PanelBottom, Palette } from 'lucide-react'
import { getAdminCmsSettings, updateAdminCmsSetting } from '../services/api.js'

const sections=[
  ['brand','Thương hiệu',Palette],
  ['seo','SEO mặc định',Search],
  ['footer','Footer & liên hệ',PanelBottom]
]

export default function SiteSettingsManager(){
  const [data,setData]=useState({})
  const [active,setActive]=useState('brand')
  const [draft,setDraft]=useState({})
  const [message,setMessage]=useState('')
  const [saving,setSaving]=useState(false)

  useEffect(()=>{
    getAdminCmsSettings().then(result=>{
      setData(result)
      setDraft(result.brand||{})
    }).catch(err=>setMessage(err.message))
  },[])

  useEffect(()=>setDraft(data[active]||{}),[active,data])

  const patch=(key,value)=>setDraft(v=>({...v,[key]:value}))
  const save=async()=>{
    setSaving(true);setMessage('')
    try{
      const result=await updateAdminCmsSetting(active,draft)
      setData(v=>({...v,[active]:result.value}))
      setMessage('Đã lưu cài đặt.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  return <div className="settings-admin">
    <aside>
      <span className="eyebrow">SITE SETTINGS</span>
      <h2><Settings/> Cài đặt</h2>
      {sections.map(([key,label,I])=><button key={key} className={active===key?'active':''} onClick={()=>setActive(key)}><I/>{label}</button>)}
    </aside>

    <section>
      <header><div><span className="eyebrow">{active.toUpperCase()}</span><h2>{sections.find(x=>x[0]===active)?.[1]}</h2><p>Cấu hình dùng chung toàn website.</p></div><button className="btn btn-green btn-sm" onClick={save} disabled={saving}><Save/>{saving?'Đang lưu':'Lưu thay đổi'}</button></header>
      {message&&<div className="cms-message">{message}</div>}

      {active==='brand'&&<div className="settings-fields">
        <label>Tên website<input value={draft.siteName||''} onChange={e=>patch('siteName',e.target.value)}/></label>
        <label>Tagline<input value={draft.tagline||''} onChange={e=>patch('tagline',e.target.value)}/></label>
        <label>Logo URL<input value={draft.logo||''} onChange={e=>patch('logo',e.target.value)}/></label>
        <label>Favicon URL<input value={draft.favicon||''} onChange={e=>patch('favicon',e.target.value)}/></label>
        <label>Màu thương hiệu<input value={draft.primaryColor||'#174a38'} onChange={e=>patch('primaryColor',e.target.value)}/></label>
        <label>Màu nhấn<input value={draft.accentColor||'#c75a32'} onChange={e=>patch('accentColor',e.target.value)}/></label>
      </div>}

      {active==='seo'&&<div className="settings-fields">
        <label>Default title<input value={draft.defaultTitle||''} onChange={e=>patch('defaultTitle',e.target.value)}/></label>
        <label className="full">Default description<textarea rows="4" value={draft.defaultDescription||''} onChange={e=>patch('defaultDescription',e.target.value)}/></label>
        <label>OG Image URL<input value={draft.ogImage||''} onChange={e=>patch('ogImage',e.target.value)}/></label>
        <label>Canonical domain<input value={draft.canonicalDomain||'https://halohola.vn'} onChange={e=>patch('canonicalDomain',e.target.value)}/></label>
      </div>}

      {active==='footer'&&<div className="settings-fields">
        <label>Email liên hệ<input value={draft.email||''} onChange={e=>patch('email',e.target.value)}/></label>
        <label>Số điện thoại<input value={draft.phone||''} onChange={e=>patch('phone',e.target.value)}/></label>
        <label>Facebook<input value={draft.facebook||''} onChange={e=>patch('facebook',e.target.value)}/></label>
        <label>Instagram<input value={draft.instagram||''} onChange={e=>patch('instagram',e.target.value)}/></label>
        <label className="full">Địa chỉ<textarea rows="3" value={draft.address||''} onChange={e=>patch('address',e.target.value)}/></label>
        <label className="full">Dòng giới thiệu footer<textarea rows="3" value={draft.description||''} onChange={e=>patch('description',e.target.value)}/></label>
      </div>}
    </section>
  </div>
}
