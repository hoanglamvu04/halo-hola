import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Video, FileText, Palette, Upload, MapPin, Check, Copy, Image as ImageIcon, Loader2 } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { themes, colorStories, img } from '../data/siteData.js'
import { submitArtwork } from '../services/api.js'

const steps = ['Thông tin tác giả','Loại hình','Tải tác phẩm','Chọn chủ đề','Chọn sắc màu','Địa điểm & câu chuyện','Xác nhận']

export default function SubmitPage(){
  const [step,setStep]=useState(1)
  const [form,setForm]=useState({name:'',display:'',email:'',phone:'',bio:'',type:'Ảnh',theme:'Nắng Hòa Lạc',color:'Nắng',location:'Hồ Đồng Mô',story:'',allowMediaUse:true,allowNewsletter:false})
  const [files,setFiles]=useState([])
  const [submitting,setSubmitting]=useState(false)
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const inputRef=useRef(null)
  const code=useMemo(()=>result?.code || 'HH26-00428',[result])
  const next=()=>setStep(v=>Math.min(7,v+1)), prev=()=>setStep(v=>Math.max(1,v-1))
  const upd=(k,v)=>setForm(s=>({...s,[k]:v}))
  const types=[['Ảnh',Camera],['Video',Video],['Story & Creative',FileText],['Art & Design',Palette]]

  const submit = async () => {
    setError('')
    if (!form.name || !form.email || !form.story || !form.location) {
      setError('Vui lòng điền đủ họ tên, email, địa điểm và câu chuyện trước khi gửi.')
      return
    }
    setSubmitting(true)
    try {
      const data = await submitArtwork({
        fields: {
          ...form,
          displayName: form.display
        },
        files
      })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi tác phẩm')
    } finally {
      setSubmitting(false)
    }
  }

  return <main>
    <PageHero eyebrow="GÓC NHÌN CỦA BẠN" title="Gửi góc nhìn" accent="của bạn" desc="Chia sẻ những câu chuyện, khoảnh khắc, góc nhìn của bạn về Hòa Lạc — nơi những điều bình dị cũng có thể trở thành cảm hứng." image={img.lake}/>
    <section className="submit-page container section">
      <div className="stepper">{steps.map((s,i)=><button key={s} className={step===i+1?'active':step>i+1?'done':''} onClick={()=>setStep(i+1)}><span>{step>i+1?<Check size={15}/>:i+1}</span><b>{s}</b></button>)}</div>
      <div className="submit-layout">
        <div className="wizard-card">
          <span className="eyebrow">Bước {step} / 7</span>
          {step===1&&<div><h2>Thông tin tác giả</h2><p>Hãy bắt đầu bằng việc giới thiệu một chút về bạn.</p><div className="form-grid"><label>Họ và tên *<input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Nguyễn Minh An"/></label><label>Tên hiển thị<input value={form.display} onChange={e=>upd('display',e.target.value)} placeholder="Minh An"/></label><label>Email *<input value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="an.nguyen@gmail.com"/></label><label>Số điện thoại<input value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="0987 654 321"/></label><label className="full">Giới thiệu ngắn<textarea value={form.bio} onChange={e=>upd('bio',e.target.value)} placeholder="Một vài dòng về bạn..."/></label></div></div>}
          {step===2&&<div><h2>Loại hình tác phẩm</h2><p>Chọn định dạng phù hợp với góc nhìn của bạn.</p><div className="type-grid">{types.map(([n,I])=><button key={n} onClick={()=>upd('type',n)} className={form.type===n?'selected':''}><I/><b>{n}</b><small>{n==='Ảnh'?'Ảnh đơn, bộ ảnh, photo story':'Một hình thức sáng tạo về Hòa Lạc'}</small></button>)}</div></div>}
          {step===3&&<div><h2>Tải tác phẩm</h2><p>Hỗ trợ tối đa 10 tệp, mỗi tệp tối đa 25MB.</p><div className="upload-box" onClick={()=>inputRef.current?.click()}><Upload size={34}/><b>Kéo thả tệp vào đây hoặc</b><button type="button" className="btn btn-terra">Chọn tệp từ thiết bị</button><small>Ảnh, video và tài liệu được gửi cùng hồ sơ dự thi.</small><input ref={inputRef} hidden multiple type="file" accept="image/*,video/*,.pdf,.doc,.docx,.mp3" onChange={e=>setFiles(Array.from(e.target.files || []).slice(0,10))}/></div><div className="upload-thumbs">{files.length?files.map((file,i)=><div className="file-chip" key={`${file.name}-${i}`}><ImageIcon/><span>{file.name}</span><button onClick={()=>setFiles(v=>v.filter((_,idx)=>idx!==i))}>×</button></div>):<><img src={img.lake}/><img src={img.village}/><img src={img.architecture}/><button onClick={()=>inputRef.current?.click()}><ImageIcon/> Thêm tệp</button></>}</div></div>}
          {step===4&&<div><h2>Chọn chủ đề</h2><p>Chọn chủ đề phù hợp nhất với tác phẩm.</p><div className="theme-select-grid">{themes.map(t=><button key={t.id} onClick={()=>upd('theme',t.title)} className={form.theme===t.title?'selected':''}><img src={t.image}/><span>{t.title}</span></button>)}</div></div>}
          {step===5&&<div><h2>Chọn sắc màu Hòa Lạc</h2><p>Mỗi sắc màu là một lớp câu chuyện về vùng đất.</p><div className="color-select-grid">{colorStories.map(c=><button key={c.name} onClick={()=>upd('color',c.name)} className={form.color===c.name?'selected':''}><span style={{background:c.color}}/>{form.color===c.name&&<i><Check size={14}/></i>}<b>{c.name}</b><small>{c.story}</small></button>)}</div></div>}
          {step===6&&<div><h2>Địa điểm & câu chuyện</h2><div className="form-grid"><label className="full">Địa điểm *<div className="input-icon"><MapPin size={17}/><input value={form.location} onChange={e=>upd('location',e.target.value)} /></div></label><label className="full">Câu chuyện 50–150 chữ<textarea rows="7" value={form.story} onChange={e=>upd('story',e.target.value)} placeholder="Kể câu chuyện đằng sau tác phẩm..."/></label></div><div className="mini-map"><span><MapPin/> {form.location}</span></div></div>}
          {step===7&&<div><h2>{result?'Gửi tác phẩm thành công':'Xác nhận và gửi tác phẩm'}</h2>{result?<div className="success-preview"><Check/><div><b>Mã tác phẩm: {result.code}</b><p>BTC đã nhận hồ sơ của bạn. Hãy lưu mã này để tra cứu khi hệ thống mở chức năng tra cứu.</p></div></div>:<><div className="confirm-list"><label><input type="checkbox" checked={form.allowMediaUse} onChange={e=>upd('allowMediaUse',e.target.checked)}/> Tôi cam kết tác phẩm là do tôi sáng tạo và đồng ý quyền truyền thông theo thể lệ.</label><label><input type="checkbox" checked={form.allowNewsletter} onChange={e=>upd('allowNewsletter',e.target.checked)}/> Tôi đồng ý nhận tin về HALO HOLA và các hoạt động cộng đồng.</label></div>{error&&<div className="form-error">{error}</div>}</>}</div>}
          {!result&&<div className="wizard-actions"><button className="btn btn-outline" onClick={prev} disabled={step===1}><ArrowLeft size={16}/> Quay lại</button>{step<7?<button className="btn btn-terra" onClick={next}>Tiếp tục <ArrowRight size={16}/></button>:<button className="btn btn-terra" disabled={submitting} onClick={submit}>{submitting?<><Loader2 className="spin" size={16}/> Đang gửi...</>:<>Gửi tác phẩm <ArrowRight size={16}/></>}</button>}</div>}
        </div>
        <aside className="submission-preview"><span className="eyebrow">XEM TRƯỚC TÁC PHẨM</span><div className="preview-card"><img src={img.sunset}/><div className="preview-body"><div className="preview-tags"><span>{form.type}</span><span>{form.theme}</span></div><h3>{form.story?'Góc nhìn của bạn':'Chiều vàng bên hồ Đồng Mô'}</h3><p>{form.display||form.name||'Minh An'}</p><p>{form.story||'Buổi chiều cuối tuần, mình có dịp chậm lại một chút để cảm nhận Hòa Lạc...'}</p><div className="preview-tags"><span>{form.location}</span><span>{form.color}</span></div></div></div><div className="submission-code"><small>{result?'Mã tác phẩm':'Mã tác phẩm (dự kiến)'}</small><strong>{code}</strong><button onClick={()=>navigator.clipboard?.writeText(code)}><Copy size={16}/></button></div><blockquote>“Mỗi góc nhìn của bạn đều góp phần tạo nên một bức tranh Hòa Lạc đa sắc màu.”</blockquote></aside>
      </div>
    </section>
  </main>
}
