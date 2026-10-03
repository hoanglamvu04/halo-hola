import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Save, Trash2, RefreshCw, Search, Eye, EyeOff, ImagePlus, Upload,
  BookOpen, MapPin, CalendarDays, Handshake, X
} from 'lucide-react'
import {
  getAdminCmsStories, createAdminCmsStory, updateAdminCmsStory, deleteAdminCmsStory,
  getAdminCmsTours, createAdminCmsTour, updateAdminCmsTour, deleteAdminCmsTour,
  getAdminCmsPlaces, createAdminCmsPlace, updateAdminCmsPlace, deleteAdminCmsPlace,
  getAdminCmsPartners, createAdminCmsPartner, updateAdminCmsPartner, deleteAdminCmsPartner,
  uploadAdminSiteAsset, getAdminMediaLibrary
} from '../services/api.js'

const configs={
  stories:{
    label:'Stories',
    icon:BookOpen,
    get:getAdminCmsStories,create:createAdminCmsStory,update:updateAdminCmsStory,remove:deleteAdminCmsStory,
    titleKey:'title',subtitle:(x)=>[x.category,x.author].filter(Boolean).join(' · '),
    empty:{title:'Story mới',slug:'',author:'HALO HOLA Editorial',role:'Ban biên tập',category:'Văn hóa · Hòa Lạc',location:'Hòa Lạc',read_time:'5 phút đọc',excerpt:'',lead:'',quote:'',image:'',body:[],gallery:[],featured:false,published:true,sort_order:0},
    fields:[
      ['title','Tiêu đề','text'],['slug','Slug','text'],['author','Tác giả','text'],['role','Vai trò','text'],
      ['category','Chuyên mục','text'],['location','Địa điểm','text'],['read_time','Thời gian đọc','text'],
      ['excerpt','Mô tả ngắn','textarea'],['lead','Mở bài','textarea'],['quote','Trích dẫn nổi bật','textarea'],
      ['image','Ảnh cover','image'],['body','Nội dung sections (JSON)','json'],['gallery','Gallery URL (JSON)','json'],
      ['featured','Featured Story','boolean'],['published','Xuất bản','boolean'],['sort_order','Thứ tự','number']
    ]
  },
  tours:{
    label:'HOLA Tour',
    icon:CalendarDays,
    get:getAdminCmsTours,create:createAdminCmsTour,update:updateAdminCmsTour,remove:deleteAdminCmsTour,
    titleKey:'title',subtitle:(x)=>['Tour #'+x.number,x.dates,x.status].filter(Boolean).join(' · '),
    empty:{number:'04',title:'Tour mới',dates:'',kicker:'',description:'',image:'',status:'DRAFT',capacity:20,location:'Hòa Lạc, Hà Nội',duration_label:'2 ngày',audience_label:'15–20 người',itinerary:[],highlights:[],stops:[],sort_order:0},
    fields:[
      ['number','Số Tour','text'],['title','Tên Tour','text'],['dates','Ngày diễn ra','text'],['kicker','Tagline','text'],
      ['description','Mô tả','textarea'],['image','Ảnh chính','image'],['status','Trạng thái','tourStatus'],
      ['capacity','Sức chứa','number'],['location','Địa điểm','text'],['duration_label','Thời lượng','text'],
      ['audience_label','Quy mô nhóm','text'],['itinerary','Lịch trình (JSON)','json'],['highlights','Điểm nhấn (JSON)','json'],
      ['stops','Điểm dừng (JSON)','json'],['sort_order','Thứ tự','number']
    ]
  },
  places:{
    label:'HOLA Map',
    icon:MapPin,
    get:getAdminCmsPlaces,create:createAdminCmsPlace,update:updateAdminCmsPlace,remove:deleteAdminCmsPlace,
    titleKey:'name',subtitle:(x)=>[x.category,x.lat&&Number(x.lat).toFixed(4),x.lng&&Number(x.lng).toFixed(4)].filter(Boolean).join(' · '),
    empty:{name:'Địa điểm mới',slug:'',category:'Điểm đến',lat:21.02,lng:105.51,image:'',description:'',tags:[],published:true,sort_order:0},
    fields:[
      ['name','Tên địa điểm','text'],['slug','Slug','text'],['category','Danh mục','text'],
      ['lat','Latitude','number'],['lng','Longitude','number'],['image','Ảnh đại diện','image'],
      ['description','Mô tả','textarea'],['tags','Tags (JSON)','json'],['published','Hiển thị','boolean'],['sort_order','Thứ tự','number']
    ]
  },
  partners:{
    label:'Đối tác',
    icon:Handshake,
    get:getAdminCmsPartners,create:createAdminCmsPartner,update:updateAdminCmsPartner,remove:deleteAdminCmsPartner,
    titleKey:'name',subtitle:(x)=>[x.tier,x.website].filter(Boolean).join(' · '),
    empty:{name:'Đối tác mới',tier:'PARTNER',description:'',logo:'',website:'',published:true,sort_order:0},
    fields:[
      ['name','Tên đối tác','text'],['tier','Nhóm/Tier','text'],['description','Mô tả','textarea'],
      ['logo','Logo','image'],['website','Website','text'],['published','Hiển thị','boolean'],['sort_order','Thứ tự','number']
    ]
  }
}

function JsonField({value,onChange}){
  const [text,setText]=useState(()=>JSON.stringify(value??[],null,2))
  useEffect(()=>setText(JSON.stringify(value??[],null,2)),[value])
  return <textarea rows="8" value={text} onChange={e=>{
    setText(e.target.value)
    try{onChange(JSON.parse(e.target.value))}catch{}
  }}/>
}

function EditorField({field,value,onChange,onPickImage,onUpload,uploading}){
  const [key,label,type]=field
  if(type==='boolean') return <label className="cmsv2-toggle"><input type="checkbox" checked={Boolean(value)} onChange={e=>onChange(key,e.target.checked)}/><span>{label}</span></label>
  if(type==='textarea') return <label className="cmsv2-field cmsv2-full"><span>{label}</span><textarea rows="4" value={value||''} onChange={e=>onChange(key,e.target.value)}/></label>
  if(type==='json') return <label className="cmsv2-field cmsv2-full"><span>{label}</span><JsonField value={value} onChange={v=>onChange(key,v)}/></label>
  if(type==='tourStatus') return <label className="cmsv2-field"><span>{label}</span><select value={value||'DRAFT'} onChange={e=>onChange(key,e.target.value)}><option>DRAFT</option><option>PUBLISHED</option><option>CLOSED</option></select></label>
  if(type==='image') return <div className="cmsv2-field cmsv2-full">
    <span>{label}</span>
    <div className="cmsv2-image-row">
      <input value={value||''} onChange={e=>onChange(key,e.target.value)} placeholder="URL ảnh"/>
      <button type="button" onClick={()=>onPickImage(key)}><ImagePlus/> Media Library</button>
      <label><Upload/>{uploading?'Đang tải':'Upload'}<input hidden type="file" accept="image/*" disabled={uploading} onChange={e=>e.target.files?.[0]&&onUpload(key,e.target.files[0])}/></label>
    </div>
    {value&&<img className="cmsv2-image-preview" src={value} alt="Preview"/>}
  </div>
  return <label className="cmsv2-field"><span>{label}</span><input type={type==='number'?'number':'text'} value={value??''} onChange={e=>onChange(key,type==='number'?Number(e.target.value):e.target.value)}/></label>
}

export default function AdminContentManager({type}){
  const config=configs[type]
  const Icon=config.icon
  const [items,setItems]=useState([])
  const [selectedId,setSelectedId]=useState(null)
  const [draft,setDraft]=useState(config.empty)
  const [q,setQ]=useState('')
  const [loading,setLoading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [uploading,setUploading]=useState('')
  const [pickerField,setPickerField]=useState('')
  const [assets,setAssets]=useState([])

  const load=async()=>{
    setLoading(true);setMessage('')
    try{
      const data=await config.get()
      setItems(data)
      if(selectedId){
        const current=data.find(x=>x.id===selectedId)
        if(current) setDraft(current)
      }
    }catch(err){setMessage(err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{setSelectedId(null);setDraft(config.empty);load()},[type])

  const filtered=useMemo(()=>{
    const needle=q.trim().toLowerCase()
    if(!needle) return items
    return items.filter(item=>JSON.stringify(item).toLowerCase().includes(needle))
  },[items,q])

  const select=(item)=>{setSelectedId(item.id);setDraft({...item});setMessage('')}
  const createNew=()=>{setSelectedId(null);setDraft({...config.empty});setMessage('Đang tạo bản ghi mới.')}

  const save=async()=>{
    setSaving(true);setMessage('')
    try{
      const item=selectedId?await config.update(selectedId,draft):await config.create(draft)
      setSelectedId(item.id);setDraft(item)
      await load()
      setMessage('Đã lưu '+config.label+'.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  const remove=async()=>{
    if(!selectedId||!window.confirm('Xóa mục này? Hành động không thể hoàn tác.')) return
    try{
      await config.remove(selectedId)
      setSelectedId(null);setDraft({...config.empty})
      await load();setMessage('Đã xóa.')
    }catch(err){setMessage(err.message)}
  }

  const patch=(key,value)=>setDraft(v=>({...v,[key]:value}))

  const upload=async(key,file)=>{
    setUploading(key)
    try{
      const asset=await uploadAdminSiteAsset(type,file)
      patch(key,asset.url)
      setMessage('Đã upload ảnh và gắn vào trường '+key+'.')
    }catch(err){setMessage(err.message)}
    finally{setUploading('')}
  }

  const openPicker=async(field)=>{
    setPickerField(field)
    try{setAssets(await getAdminMediaLibrary({archived:false}))}catch(err){setMessage(err.message)}
  }

  return <div className="cmsv2-shell">
    <aside className="cmsv2-list">
      <header>
        <div><span className="eyebrow">CMS V2</span><h2><Icon/> {config.label}</h2></div>
        <button className="icon-btn" onClick={load}><RefreshCw className={loading?'spin':''}/></button>
      </header>
      <div className="cmsv2-toolbar">
        <div><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={'Tìm '+config.label+'...'}/></div>
        <button onClick={createNew}><Plus/> Thêm mới</button>
      </div>
      <div className="cmsv2-items">
        {filtered.map(item=><button key={item.id} className={selectedId===item.id?'active':''} onClick={()=>select(item)}>
          {(item.image||item.logo)?<img src={item.image||item.logo} alt=""/>:<span className="cmsv2-placeholder"><Icon/></span>}
          <div><b>{item[config.titleKey]||'Chưa đặt tên'}</b><small>{config.subtitle(item)}</small></div>
          <span className={(item.published===false||item.status==='DRAFT')?'off':'on'}>{item.published===false||item.status==='DRAFT'?<EyeOff/>:<Eye/>}</span>
        </button>)}
        {!filtered.length&&<div className="cmsv2-empty">Chưa có dữ liệu. Bấm “Thêm mới”.</div>}
      </div>
    </aside>

    <section className="cmsv2-editor">
      <header className="cmsv2-editor-head">
        <div><span className="eyebrow">{selectedId?'CHỈNH SỬA':'TẠO MỚI'}</span><h2>{draft[config.titleKey]||config.label}</h2><p>Quản trị nội dung thật, ảnh và trạng thái hiển thị từ một nơi.</p></div>
        <div>
          {selectedId&&<button className="cmsv2-danger" onClick={remove}><Trash2/> Xóa</button>}
          <button className="btn btn-green btn-sm" onClick={save} disabled={saving}><Save/>{saving?'Đang lưu':'Lưu'}</button>
        </div>
      </header>
      {message&&<div className="cms-message">{message}</div>}
      <div className="cmsv2-fields">
        {config.fields.map(field=><EditorField
          key={field[0]} field={field} value={draft[field[0]]} onChange={patch}
          onPickImage={openPicker} onUpload={upload} uploading={uploading===field[0]}
        />)}
      </div>
    </section>

    {pickerField&&<div className="cmsv2-modal" onClick={()=>setPickerField('')}>
      <div className="cmsv2-picker" onClick={e=>e.stopPropagation()}>
        <header><div><span className="eyebrow">MEDIA LIBRARY</span><h2>Chọn ảnh</h2></div><button onClick={()=>setPickerField('')}><X/></button></header>
        <div className="cmsv2-picker-grid">
          {assets.map(asset=><button key={asset.id} onClick={()=>{patch(pickerField,asset.url);setPickerField('');setMessage('Đã chọn ảnh từ Media Library.')}}>
            <img src={asset.url} alt={asset.alt_text||asset.original_name}/>
            <span>{asset.title||asset.original_name}</span>
          </button>)}
        </div>
      </div>
    </div>}
  </div>
}
