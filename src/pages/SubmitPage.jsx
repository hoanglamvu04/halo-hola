import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Video, FileText, Palette, Upload, MapPin, Check, Copy, Image as ImageIcon } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { themes, colorStories, img } from '../data/siteData.js'

const steps = ['Thông tin tác giả','Loại hình','Tải tác phẩm','Chọn chủ đề','Chọn sắc màu','Địa điểm & câu chuyện','Xác nhận']

export default function SubmitPage(){
  const [step,setStep]=useState(1)
  const [form,setForm]=useState({name:'',display:'',email:'',phone:'',bio:'',type:'Ảnh',theme:'Nắng Hòa Lạc',color:'Nắng',location:'Hồ Đồng Mô',story:''})
  const code=useMemo(()=>`HH26-${String(428).padStart(5,'0')}`,[])
  const next=()=>setStep(v=>Math.min(7,v+1)), prev=()=>setStep(v=>Math.max(1,v-1))
  const upd=(k,v)=>setForm(s=>({...s,[k]:v}))
  const types=[['Ảnh',Camera],['Video',Video],['Story & Creative',FileText],['Art & Design',Palette]]
  return <main>
    <PageHero eyebrow="GÓC NHÌN CỦA BẠN" title="Gửi góc nhìn" accent="của bạn" desc="Chia sẻ những câu chuyện, khoảnh khắc, góc nhìn của bạn về Hòa Lạc — nơi những điều bình dị cũng có thể trở thành cảm hứng." image={img.lake}/>
    <section className="submit-page container section">
      <div className="stepper">{steps.map((s,i)=><button key={s} className={step===i+1?'active':step>i+1?'done':''} onClick={()=>setStep(i+1)}><span>{step>i+1?<Check size={15}/>:i+1}</span><b>{s}</b></button>)}</div>
      <div className="submit-layout">
        <div className="wizard-card">
          <span className="eyebrow">Bước {step} / 7</span>
          {step===1&&<div><h2>Thông tin tác giả</h2><p>Hãy bắt đầu bằng việc giới thiệu một chút về bạn.</p><div className="form-grid"><label>Họ và tên *<input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Nguyễn Minh An"/></label><label>Tên hiển thị<input value={form.display} onChange={e=>upd('display',e.target.value)} placeholder="Minh An"/></label><label>Email *<input value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="an.nguyen@gmail.com"/></label><label>Số điện thoại<input value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="0987 654 321"/></label><label className="full">Giới thiệu ngắn<textarea value={form.bio} onChange={e=>upd('bio',e.target.value)} placeholder="Một vài dòng về bạn..."/></label></div></div>}
          {step===2&&<div><h2>Loại hình tác phẩm</h2><p>Chọn định dạng phù hợp với góc nhìn của bạn.</p><div className="type-grid">{types.map(([n,I])=><button key={n} onClick={()=>upd('type',n)} className={form.type===n?'selected':''}><I/><b>{n}</b><small>{n==='Ảnh'?'Ảnh đơn, bộ ảnh, photo story':'Một hình thức sáng tạo về Hòa Lạc'}</small></button>)}</div></div>}
          {step===3&&<div><h2>Tải tác phẩm</h2><p>Hỗ trợ JPG, PNG; video và tài liệu có thể nhập bằng liên kết.</p><div className="upload-box"><Upload size={34}/><b>Kéo thả tệp vào đây hoặc</b><button className="btn btn-terra">Chọn tệp từ thiết bị</button><small>Prototype giao diện; API upload sẽ nối ở backend.</small></div><div className="upload-thumbs"><img src={img.lake}/><img src={img.village}/><img src={img.architecture}/><button><ImageIcon/> Thêm ảnh</button></div></div>}
          {step===4&&<div><h2>Chọn chủ đề</h2><p>Chọn chủ đề phù hợp nhất với tác phẩm.</p><div className="theme-select-grid">{themes.map(t=><button key={t.id} onClick={()=>upd('theme',t.title)} className={form.theme===t.title?'selected':''}><img src={t.image}/><span>{t.title}</span></button>)}</div></div>}
          {step===5&&<div><h2>Chọn sắc màu Hòa Lạc</h2><p>Mỗi sắc màu là một lớp câu chuyện về vùng đất.</p><div className="color-select-grid">{colorStories.map(c=><button key={c.name} onClick={()=>upd('color',c.name)} className={form.color===c.name?'selected':''}><span style={{background:c.color}}/>{form.color===c.name&&<i><Check size={14}/></i>}<b>{c.name}</b><small>{c.story}</small></button>)}</div></div>}
          {step===6&&<div><h2>Địa điểm & câu chuyện</h2><div className="form-grid"><label className="full">Địa điểm *<div className="input-icon"><MapPin size={17}/><input value={form.location} onChange={e=>upd('location',e.target.value)} /></div></label><label className="full">Câu chuyện 50–150 chữ<textarea rows="7" value={form.story} onChange={e=>upd('story',e.target.value)} placeholder="Kể câu chuyện đằng sau tác phẩm..."/></label></div><div className="mini-map"><span><MapPin/> {form.location}</span></div></div>}
          {step===7&&<div><h2>Xác nhận và gửi tác phẩm</h2><div className="confirm-list"><label><input type="checkbox" defaultChecked/> Tôi cam kết tác phẩm là do tôi sáng tạo và sở hữu quyền tác giả.</label><label><input type="checkbox" defaultChecked/> Tôi đồng ý cho HALO HOLA sử dụng tác phẩm cho mục đích truyền thông theo thể lệ.</label><label><input type="checkbox"/> Tôi đồng ý nhận tin về HALO HOLA và các hoạt động cộng đồng.</label></div><div className="success-preview"><Check/><div><b>Sẵn sàng gửi góc nhìn</b><p>Kiểm tra lại thông tin trước khi hoàn tất.</p></div></div></div>}
          <div className="wizard-actions"><button className="btn btn-outline" onClick={prev} disabled={step===1}><ArrowLeft size={16}/> Quay lại</button>{step<7?<button className="btn btn-terra" onClick={next}>Tiếp tục <ArrowRight size={16}/></button>:<button className="btn btn-terra" onClick={()=>alert('Đã lưu prototype. Backend sẽ xử lý gửi thật ở bước tích hợp API.')}>Gửi tác phẩm <ArrowRight size={16}/></button>}</div>
        </div>
        <aside className="submission-preview"><span className="eyebrow">XEM TRƯỚC TÁC PHẨM</span><div className="preview-card"><img src={img.sunset}/><div className="preview-body"><div className="preview-tags"><span>{form.type}</span><span>{form.theme}</span></div><h3>{form.story?'Góc nhìn của bạn':'Chiều vàng bên hồ Đồng Mô'}</h3><p>{form.display||form.name||'Minh An'}</p><p>{form.story||'Buổi chiều cuối tuần, mình có dịp chậm lại một chút để cảm nhận Hòa Lạc...'}</p><div className="preview-tags"><span>{form.location}</span><span>{form.color}</span></div></div></div><div className="submission-code"><small>Mã tác phẩm (dự kiến)</small><strong>{code}</strong><button onClick={()=>navigator.clipboard?.writeText(code)}><Copy size={16}/></button></div><blockquote>“Mỗi góc nhìn của bạn đều góp phần tạo nên một bức tranh Hòa Lạc đa sắc màu.”</blockquote></aside>
      </div>
    </section>
  </main>
}
