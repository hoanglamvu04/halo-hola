import { useEffect, useState } from 'react'
import { Save, Settings, Search, PanelBottom, PanelTop, Palette, Upload, Image as ImageIcon, X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { getAdminCmsSettings, updateAdminCmsSetting, uploadAdminSiteAsset } from '../services/api.js'
import './SiteSettingsManager.css'

const DEFAULT_HEADER_LINKS=[
  {label:'Khám phá',href:'/'},
  {label:'Chủ đề',href:'/chu-de'},
  {label:'HOLA Tour',href:'/hola-tour'},
  {label:'HOLA Map',href:'/hola-map'},
  {label:'Stories',href:'/stories'},
  {label:'TOP52',href:'/top52'},
  {label:'WE HOLA',href:'/we-hola'}
]

const sections=[
  ['brand','Thương hiệu',Palette],
  ['header','Header & điều hướng',PanelTop],
  ['seo','SEO mặc định',Search],
  ['footer','Footer & liên hệ',PanelBottom]
]

function BrandAssetField({label,field,value,accept='image/*',hint,onChange,onUpload,uploading}){
  return <div className="settings-brand-asset">
    <div className="settings-brand-asset-head">
      <div><b>{label}</b>{hint&&<small>{hint}</small>}</div>
      {value&&<button type="button" className="settings-brand-clear" onClick={()=>onChange(field,'')} title={'Bỏ '+label}><X/></button>}
    </div>

    <div className={'settings-brand-preview '+(field==='favicon'?'favicon':'')}>
      {value?<img src={value} alt={label}/>:<div><ImageIcon/><span>Chưa có {label.toLowerCase()}</span></div>}
    </div>

    <div className="settings-brand-actions">
      <label className={'settings-upload-btn '+(uploading?'loading':'')}>
        <Upload/>
        <span>{uploading?'Đang tải lên...':'Tải ảnh từ máy'}</span>
        <input hidden type="file" accept={accept} disabled={uploading} onChange={e=>{
          const file=e.target.files?.[0]
          if(file) onUpload(field,file)
          e.target.value=''
        }}/>
      </label>
    </div>

    <label className="settings-brand-url">
      <span>Hoặc dùng URL</span>
      <input value={value||''} onChange={e=>onChange(field,e.target.value)} placeholder="https://..."/>
    </label>
  </div>
}

function RangeField({label,value,min,max,step=1,onChange,hint}){
  const safe=Number(value)||min
  return <label className="settings-range-field">
    <span className="settings-range-head"><b>{label}</b><strong>{safe}px</strong></span>
    {hint&&<small>{hint}</small>}
    <input type="range" min={min} max={max} step={step} value={safe} onChange={e=>onChange(Number(e.target.value))}/>
  </label>
}

function ColorField({label,value,fallback,onChange,hint}){
  const current=value||fallback
  return <label className="settings-color-field">
    <span><b>{label}</b>{hint&&<small>{hint}</small>}</span>
    <div>
      <input className="settings-color-picker" type="color" value={current} onChange={e=>onChange(e.target.value)}/>
      <input value={current} onChange={e=>onChange(e.target.value)} placeholder={fallback}/>
    </div>
  </label>
}

export default function SiteSettingsManager(){
  const [data,setData]=useState({})
  const [active,setActive]=useState('brand')
  const [draft,setDraft]=useState({})
  const [message,setMessage]=useState('')
  const [saving,setSaving]=useState(false)
  const [uploading,setUploading]=useState('')

  useEffect(()=>{
    getAdminCmsSettings().then(result=>{
      setData(result)
      setDraft(result.brand||{})
    }).catch(err=>setMessage(err.message))
  },[])

  useEffect(()=>{
    const current=data[active]||{}
    if(active==='header'){
      setDraft({
        enabled:current.enabled!==false,
        menuTitle:current.menuTitle||'Khám phá HALO HOLA',
        ctaText:current.ctaText||'GỬI GÓC NHÌN',
        ctaUrl:current.ctaUrl||'/gui-goc-nhin',
        ctaNewTab:Boolean(current.ctaNewTab),
        showSearch:current.showSearch!==false,
        searchLabel:current.searchLabel||'Tra cứu tác phẩm',
        searchUrl:current.searchUrl||'/tra-cuu',
        navLinks:Array.isArray(current.navLinks)?current.navLinks:DEFAULT_HEADER_LINKS
      })
      return
    }
    setDraft(current)
  },[active,data])

  const patch=(key,value)=>setDraft(v=>({...v,[key]:value}))
  const navLinks=Array.isArray(draft.navLinks)?draft.navLinks:[]
  const patchNav=(index,key,value)=>patch('navLinks',navLinks.map((item,i)=>i===index?{...item,[key]:value}:item))
  const addNav=()=>patch('navLinks',[...navLinks,{label:'Menu mới',href:'/'}])
  const removeNav=index=>patch('navLinks',navLinks.filter((_,i)=>i!==index))
  const moveNav=(index,direction)=>{
    const target=index+direction
    if(target<0||target>=navLinks.length) return
    const next=[...navLinks]
    const [item]=next.splice(index,1)
    next.splice(target,0,item)
    patch('navLinks',next)
  }

  const uploadBrandAsset=async(field,file)=>{
    if(!file) return
    setUploading(field)
    setMessage('')
    try{
      const asset=await uploadAdminSiteAsset('brand-'+field,file)
      patch(field,asset.url)
      setMessage(`Đã tải ${field==='logo'?'logo':'favicon'} lên Media Library. Bấm “Lưu thay đổi” để áp dụng lên website.`)
    }catch(err){
      setMessage(err.message)
    }finally{
      setUploading('')
    }
  }

  const save=async()=>{
    setSaving(true);setMessage('')
    try{
      const result=await updateAdminCmsSetting(active,draft)
      setData(v=>({...v,[active]:result.value}))
      setMessage('Đã lưu cài đặt và áp dụng lên website.')
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

      {active==='brand'&&<div className="settings-fields settings-brand-fields">
        <label>Tên website<input value={draft.siteName||''} onChange={e=>patch('siteName',e.target.value)}/></label>
        <label>Tagline<input value={draft.tagline||''} onChange={e=>patch('tagline',e.target.value)}/></label>

        <BrandAssetField
          label="Logo"
          field="logo"
          value={draft.logo||''}
          hint="Khuyên dùng PNG nền trong suốt hoặc SVG ngang."
          accept="image/*,.svg"
          onChange={patch}
          onUpload={uploadBrandAsset}
          uploading={uploading==='logo'}
        />
        <BrandAssetField
          label="Favicon"
          field="favicon"
          value={draft.favicon||''}
          hint="Khuyên dùng ảnh vuông 512×512, PNG hoặc ICO."
          accept="image/*,.ico"
          onChange={patch}
          onUpload={uploadBrandAsset}
          uploading={uploading==='favicon'}
        />

        <RangeField label="Chiều rộng logo desktop" value={draft.logoWidth||190} min={80} max={320} onChange={value=>patch('logoWidth',value)} hint="Độ rộng khung logo trên desktop."/>
        <RangeField label="Chiều cao logo desktop" value={draft.logoHeight||52} min={24} max={96} onChange={value=>patch('logoHeight',value)} hint="Độ cao khung logo trên desktop; ảnh luôn giữ đúng tỉ lệ bên trong khung."/>
        <RangeField label="Chiều rộng logo mobile" value={draft.logoWidthMobile||145} min={70} max={240} onChange={value=>patch('logoWidthMobile',value)} hint="Độ rộng khung logo trên điện thoại."/>
        <RangeField label="Chiều cao logo mobile" value={draft.logoHeightMobile||42} min={22} max={72} onChange={value=>patch('logoHeightMobile',value)} hint="Độ cao khung logo trên điện thoại; ảnh luôn giữ đúng tỉ lệ bên trong khung."/>

        <ColorField label="Màu nền chính website" value={draft.backgroundColor} fallback="#fbf7ef" onChange={value=>patch('backgroundColor',value)} hint="Áp dụng cho nền chung và các vùng dùng nền mặc định."/>
        <ColorField label="Màu thương hiệu" value={draft.primaryColor} fallback="#173d2d" onChange={value=>patch('primaryColor',value)}/>
        <ColorField label="Màu nhấn" value={draft.accentColor} fallback="#c45b32" onChange={value=>patch('accentColor',value)}/>
      </div>}

      {active==='header'&&<div className="settings-fields settings-header-fields">
        <label className="settings-switch full"><input type="checkbox" checked={draft.enabled!==false} onChange={e=>patch('enabled',e.target.checked)}/><span><b>Hiển thị Header</b><small>Tắt nếu muốn ẩn toàn bộ header public.</small></span></label>
        <label>Tiêu đề menu mobile<input value={draft.menuTitle||''} onChange={e=>patch('menuTitle',e.target.value)} placeholder="Khám phá HALO HOLA"/></label>
        <label>Nhãn nút CTA<input value={draft.ctaText||''} onChange={e=>patch('ctaText',e.target.value)} placeholder="GỬI GÓC NHÌN"/></label>
        <label>Link nút CTA<input value={draft.ctaUrl||''} onChange={e=>patch('ctaUrl',e.target.value)} placeholder="/gui-goc-nhin hoặc https://..."/></label>
        <label className="settings-inline-check"><input type="checkbox" checked={Boolean(draft.ctaNewTab)} onChange={e=>patch('ctaNewTab',e.target.checked)}/><span>Mở CTA ở tab mới</span></label>
        <label className="settings-switch"><input type="checkbox" checked={draft.showSearch!==false} onChange={e=>patch('showSearch',e.target.checked)}/><span><b>Hiện nút tra cứu</b><small>Hiện icon tra cứu trên desktop và nút trong menu mobile.</small></span></label>
        <label>Nhãn tra cứu<input value={draft.searchLabel||''} onChange={e=>patch('searchLabel',e.target.value)} placeholder="Tra cứu tác phẩm"/></label>
        <label>Link tra cứu<input value={draft.searchUrl||''} onChange={e=>patch('searchUrl',e.target.value)} placeholder="/tra-cuu"/></label>

        <div className="settings-header-links full">
          <div className="settings-header-links-head">
            <div><b>Menu điều hướng</b><small>Thêm link nội bộ dạng /chu-de hoặc URL ngoài dạng https://...</small></div>
            <button type="button" className="btn btn-green btn-sm" onClick={addNav}><Plus/> Thêm link</button>
          </div>
          <div className="settings-header-link-list">
            {navLinks.map((item,index)=><div className="settings-header-link-row" key={index}>
              <span className="settings-link-order">{String(index+1).padStart(2,'0')}</span>
              <label><span>Tên menu</span><input value={item.label||''} onChange={e=>patchNav(index,'label',e.target.value)} placeholder="Ví dụ: Chủ đề"/></label>
              <label><span>Đường dẫn</span><input value={item.href||''} onChange={e=>patchNav(index,'href',e.target.value)} placeholder="/chu-de hoặc https://..."/></label>
              <label className="settings-link-newtab"><input type="checkbox" checked={Boolean(item.newTab)} onChange={e=>patchNav(index,'newTab',e.target.checked)}/><span>Tab mới</span></label>
              <div className="settings-link-actions">
                <button type="button" onClick={()=>moveNav(index,-1)} disabled={index===0} title="Đưa lên"><ArrowUp/></button>
                <button type="button" onClick={()=>moveNav(index,1)} disabled={index===navLinks.length-1} title="Đưa xuống"><ArrowDown/></button>
                <button type="button" className="danger" onClick={()=>removeNav(index)} title="Xóa link"><Trash2/></button>
              </div>
            </div>)}
            {!navLinks.length&&<div className="settings-header-empty">Chưa có link nào. Bấm “Thêm link” để tạo menu.</div>}
          </div>
        </div>
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
        <label>YouTube<input value={draft.youtube||''} onChange={e=>patch('youtube',e.target.value)}/></label>
        <label>TikTok<input value={draft.tiktok||''} onChange={e=>patch('tiktok',e.target.value)}/></label>
        <label className="full">Địa chỉ<textarea rows="3" value={draft.address||''} onChange={e=>patch('address',e.target.value)}/></label>
        <label className="full">Dòng giới thiệu footer<textarea rows="3" value={draft.description||''} onChange={e=>patch('description',e.target.value)}/></label>
      </div>}
    </section>
  </div>
}
