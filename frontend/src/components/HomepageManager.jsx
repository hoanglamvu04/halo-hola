import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, ImagePlus, Save, Upload, RefreshCw } from 'lucide-react'
import {
  getAdminHomepageSections,
  getAdminSiteAssets,
  updateAdminHomepageSection,
  uploadAdminSiteAsset
} from '../services/api.js'
import { img } from '../data/siteData.js'

const definitions={
  header:{
    label:'Header',
    defaults:{ctaText:'GỬI GÓC NHÌN',logoImage:''},
    fields:[
      ['ctaText','Nút CTA','text'],
      ['logoImage','Logo ảnh (không bắt buộc)','image']
    ]
  },
  hero:{
    label:'Hero',
    defaults:{
      eyebrow:'NƠI NHỮNG CÂU CHUYỆN HÒA LẠC ĐƯỢC KỂ LẠI',
      titleLine1:'HELLO',titleAccent:'HÒA LẠC',tagline:'52 góc nhìn · 1 Hòa Lạc',
      description:'Mỗi tuần một góc nhìn. Mỗi góc nhìn một câu chuyện.',
      mainImage:img.lake,floatImageA:img.architecture,floatImageB:img.people
    },
    fields:[
      ['eyebrow','Eyebrow','text'],
      ['titleLine1','Tiêu đề chính','text'],
      ['titleAccent','Dòng nhấn','text'],
      ['tagline','Tagline','text'],
      ['description','Mô tả','textarea'],
      ['mainImage','Ảnh chính','image'],
      ['floatImageA','Ảnh nổi 1','image'],
      ['floatImageB','Ảnh nổi 2','image']
    ]
  },
  campaign:{
    label:'HALO HOLA đang diễn ra',
    defaults:{
      eyebrow:'HALO HOLA ĐANG DIỄN RA',
      title:'Mỗi ngày thêm một góc nhìn mới.',
      description:'Cùng nhau khám phá, chia sẻ và lưu giữ những câu chuyện, địa điểm và tác phẩm đặc biệt về Hòa Lạc qua lăng kính cộng đồng.',
      ctaText:'Gửi góc nhìn',
      backgroundImage:img.sunset,discoverImage:img.hills,keepImage:img.architecture,shareImage:img.student
    },
    fields:[
      ['eyebrow','Eyebrow','text'],
      ['title','Tiêu đề','text'],
      ['description','Mô tả','textarea'],
      ['ctaText','Tên nút','text'],
      ['backgroundImage','Ảnh nền bên phải','image'],
      ['discoverImage','Ảnh Khám phá','image'],
      ['keepImage','Ảnh Lưu giữ','image'],
      ['shareImage','Ảnh Chia sẻ','image']
    ]
  },
  change:{
    label:'Hòa Lạc đang thay đổi',
    defaults:{
      title:'Hòa Lạc đang thay đổi',
      description:'Từ Xứ Đoài trầm tích, làng xóm yên bình và những viên đá ong mộc mạc, Hòa Lạc hôm nay đang vươn mình thành trung tâm tri thức, công nghệ và đổi mới sáng tạo.',
      image1:img.village,image2:img.student,image3:img.architecture
    },
    fields:[
      ['title','Tiêu đề','text'],
      ['description','Mô tả','textarea'],
      ['image1','Ảnh Cội nguồn','image'],
      ['image2','Ảnh Hôm nay','image'],
      ['image3','Ảnh Tương lai','image']
    ]
  },
  themes:{label:'8 chủ đề',defaults:{eyebrow:'KHÁM PHÁ ĐA DẠNG GÓC NHÌN',title:'8 chủ đề về Hòa Lạc',description:'Tám mảnh ghép, một bức tranh Hòa Lạc đa sắc.'},fields:[['eyebrow','Eyebrow','text'],['title','Tiêu đề','text'],['description','Mô tả','textarea']]},
  colors:{label:'Sắc màu Hòa Lạc',defaults:{eyebrow:'SẮC MÀU HÒA LẠC',title:'Hòa Lạc trong bạn có màu gì?',description:'Mỗi màu sắc là một lát cắt của Hòa Lạc.'},fields:[['eyebrow','Eyebrow','text'],['title','Tiêu đề','text'],['description','Mô tả','textarea']]},
  tours:{label:'HOLA Tour',defaults:{eyebrow:'CÙNG ĐI · CÙNG CẢM · CÙNG KỂ CHUYỆN',title:'HOLA Tour',description:'Những hành trình khám phá Hòa Lạc qua trải nghiệm thực tế.'},fields:[['eyebrow','Eyebrow','text'],['title','Tiêu đề','text'],['description','Mô tả','textarea']]},
  map:{label:'HOLA Map',defaults:{eyebrow:'KHÁM PHÁ MỌI HÒA LẠC',title:'HOLA Map',description:'Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ tương tác.'},fields:[['eyebrow','Eyebrow','text'],['title','Tiêu đề','text'],['description','Mô tả','textarea']]},
  stories:{label:'TOP52 / Stories',defaults:{eyebrow:'NHỮNG CÂU CHUYỆN TRUYỀN CẢM HỨNG',title:'TOP52 / Stories',description:'52 góc nhìn, 52 câu chuyện về Hòa Lạc qua lăng kính cộng đồng.'},fields:[['eyebrow','Eyebrow','text'],['title','Tiêu đề','text'],['description','Mô tả','textarea']]},
  community:{
    label:'WE HOLA',
    defaults:{eyebrow:'CỘNG ĐỒNG · KẾT NỐI · HÀNH ĐỘNG',title:'WE HOLA – Chúng ta là Hòa Lạc',description:'Cùng nhau kể chuyện, lan tỏa giá trị, chung tay làm Hòa Lạc xanh hơn, đẹp hơn và giàu bản sắc hơn.',backgroundImage:img.people},
    fields:[
      ['eyebrow','Eyebrow','text'],['title','Tiêu đề','text'],['description','Mô tả','textarea'],
      ['backgroundImage','Ảnh nền','image']
    ]
  }
}

function Field({field,value,onChange,onUpload,uploading}){
  const [key,label,type]=field
  if(type==='textarea') return <label className="cms-field cms-field-full"><span>{label}</span><textarea rows="4" value={value||''} onChange={e=>onChange(key,e.target.value)}/></label>
  if(type==='image') return <div className="cms-field cms-image-field">
    <span>{label}</span>
    <div className="cms-image-input">
      <input value={value||''} onChange={e=>onChange(key,e.target.value)} placeholder="URL ảnh hoặc chọn file"/>
      <label className="cms-upload-btn"><Upload size={15}/>{uploading?'Đang tải...':'Tải ảnh'}<input hidden type="file" accept="image/*" disabled={uploading} onChange={e=>e.target.files?.[0]&&onUpload(key,e.target.files[0])}/></label>
    </div>
    {value&&<div className="cms-image-preview"><img src={value} alt="Preview"/><small>{value}</small></div>}
  </div>
  return <label className="cms-field"><span>{label}</span><input value={value||''} onChange={e=>onChange(key,e.target.value)}/></label>
}

export default function HomepageManager(){
  const [sections,setSections]=useState([])
  const [active,setActive]=useState('hero')
  const [assets,setAssets]=useState([])
  const [saving,setSaving]=useState(false)
  const [uploading,setUploading]=useState('')
  const [message,setMessage]=useState('')
  const [targetField,setTargetField]=useState('')

  const load=async()=>{
    const data=await getAdminHomepageSections()
    setSections(data)
    const media=await getAdminSiteAssets({sectionKey:active})
    setAssets(media)
  }

  useEffect(()=>{load().catch(err=>setMessage(err.message))},[])
  useEffect(()=>{
    getAdminSiteAssets({sectionKey:active}).then(setAssets).catch(()=>{})
    const firstImage=(definitions[active]?.fields||[]).find(field=>field[2]==='image')
    setTargetField(firstImage?.[0]||'')
  },[active])

  const section=useMemo(()=>sections.find(s=>s.section_key===active),[sections,active])
  const def=definitions[active]||{label:section?.label||active,fields:[]}
  const content={...(def.defaults||{}),...(section?.content||{})}

  const patchContent=(key,value)=>{
    setSections(prev=>prev.map(s=>s.section_key===active?{...s,content:{...(s.content||{}),[key]:value}}:s))
  }

  const toggle=()=>{
    setSections(prev=>prev.map(s=>s.section_key===active?{...s,enabled:!s.enabled}:s))
  }

  const save=async()=>{
    if(!section) return
    setSaving(true);setMessage('')
    try{
      const updated=await updateAdminHomepageSection(active,{enabled:section.enabled,content:section.content||{}})
      setSections(prev=>prev.map(s=>s.section_key===active?updated:s))
      setMessage('Đã lưu thay đổi trang chủ.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  const upload=async(key,file)=>{
    setUploading(key);setMessage('')
    try{
      const asset=await uploadAdminSiteAsset(active,file)
      patchContent(key,asset.url)
      setAssets(prev=>[asset,...prev])
      setMessage('Đã tải ảnh. Bấm "Lưu thay đổi" để áp dụng lên website.')
    }catch(err){setMessage(err.message)}
    finally{setUploading('')}
  }

  return <div className="cms-shell">
    <aside className="cms-sections">
      <div className="cms-sections-head"><div><span className="eyebrow">HOMEPAGE CMS</span><h2>Các section</h2></div><button className="icon-btn" onClick={()=>load()}><RefreshCw size={17}/></button></div>
      {sections.map(s=><button key={s.section_key} className={active===s.section_key?'active':''} onClick={()=>setActive(s.section_key)}>
        <div><b>{s.label}</b><small>{s.section_key}</small></div><span className={s.enabled?'on':'off'}>{s.enabled?'ON':'OFF'}</span>
      </button>)}
    </aside>

    <section className="cms-editor">
      <header className="cms-editor-head">
        <div><span className="eyebrow">CHỈNH NỘI DUNG</span><h2>{def.label}</h2><p>Đổi chữ, bật/tắt section và thay ảnh mà không cần sửa code.</p></div>
        <div className="cms-actions">
          <button className={section?.enabled?'cms-visibility on':'cms-visibility'} onClick={toggle}>{section?.enabled?<><Eye size={16}/> Đang hiển thị</>:<><EyeOff size={16}/> Đang ẩn</>}</button>
          <button className="btn btn-green btn-sm" onClick={save} disabled={saving}><Save size={16}/>{saving?'Đang lưu...':'Lưu thay đổi'}</button>
        </div>
      </header>

      {message&&<div className="cms-message">{message}</div>}

      <div className="cms-fields">
        {def.fields.map(field=><Field key={field[0]} field={field} value={content[field[0]]} onChange={patchContent} onUpload={upload} uploading={uploading===field[0]}/>)}
      </div>

      <div className="cms-library">
        <div className="cms-library-head">
          <div><ImagePlus/><div><b>Media Library của section</b><small>Chọn vị trí ảnh rồi bấm vào ảnh để dùng lại ngay.</small></div></div>
          {(def.fields||[]).some(field=>field[2]==='image')&&<select value={targetField} onChange={e=>setTargetField(e.target.value)}>
            {(def.fields||[]).filter(field=>field[2]==='image').map(field=><option key={field[0]} value={field[0]}>{field[1]}</option>)}
          </select>}
        </div>
        <div className="cms-asset-grid">{assets.length?assets.slice(0,12).map(asset=><button key={asset.id} onClick={()=>{
          if(targetField){
            patchContent(targetField,asset.url)
            setMessage('Đã chọn ảnh từ Media Library. Bấm "Lưu thay đổi" để áp dụng.')
          }else{
            navigator.clipboard?.writeText(asset.url)
            setMessage('Đã copy URL ảnh.')
          }
        }} title="Dùng ảnh này"><img src={asset.url} alt={asset.original_name}/><span>{asset.original_name}</span></button>):<div className="cms-empty-assets">Chưa có ảnh tải lên cho section này.</div>}</div>
      </div>
    </section>
  </div>
}
