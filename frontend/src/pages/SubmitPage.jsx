import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Camera, Video, FileText, Palette, Upload, MapPin,
  Check, Copy, Image as ImageIcon, Loader2, Save, ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { themes, colorStories, img } from '../data/siteData.js'
import { submitArtwork } from '../services/api.js'

const steps = ['Thông tin tác giả','Tác phẩm','Tải tác phẩm','Chủ đề & sắc màu','Câu chuyện','Quyền sử dụng','Xác nhận']
const DRAFT_KEY = 'halo_hola_submission_draft_v2'

const initialForm = {
  name:'', display:'', email:'', phone:'', bio:'',
  title:'', capturedAt:'', externalLink:'', previousAward:false, previousAwardNote:'',
  type:'Ảnh', theme:'Nắng Hòa Lạc', color:'Nắng',
  location:'Hồ Đồng Mô', story:'',
  rightsConfirmed:false, imageConsentConfirmed:false,
  isMinor:false, guardianName:'', guardianConsent:false,
  allowMediaUse:true, allowNewsletter:false
}

export default function SubmitPage(){
  const [step,setStep]=useState(1)
  const [form,setForm]=useState(()=>{
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      return saved ? {...initialForm,...saved} : initialForm
    } catch { return initialForm }
  })
  const [files,setFiles]=useState([])
  const [submitting,setSubmitting]=useState(false)
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [savedAt,setSavedAt]=useState(null)
  const inputRef=useRef(null)
  const saveTimer=useRef(null)
  const code=useMemo(()=>result?.code || 'HH26-XXXXX',[result])
  const types=[['Ảnh',Camera],['Video',Video],['Story & Creative',FileText],['Art & Design',Palette]]

  useEffect(()=>{
    if(result) return undefined
    window.clearTimeout(saveTimer.current)
    saveTimer.current=window.setTimeout(()=>{
      localStorage.setItem(DRAFT_KEY,JSON.stringify(form))
      setSavedAt(new Date())
    },500)
    return ()=>window.clearTimeout(saveTimer.current)
  },[form,result])

  const upd=(k,v)=>setForm(s=>({...s,[k]:v}))
  const next=()=>{ setError(''); setStep(v=>Math.min(7,v+1)) }
  const prev=()=>{ setError(''); setStep(v=>Math.max(1,v-1)) }

  const resetDraft=()=>{
    localStorage.removeItem(DRAFT_KEY)
    setForm(initialForm)
    setFiles([])
    setStep(1)
    setResult(null)
  }

  const submit = async () => {
    setError('')
    if (!form.name || !form.email || !form.title || !form.story || !form.location) {
      setError('Vui lòng điền đủ họ tên, email, tên tác phẩm, địa điểm và câu chuyện.')
      return
    }
    if (!form.rightsConfirmed) {
      setError('Bạn cần xác nhận quyền tác giả trước khi gửi.')
      return
    }
    if (form.isMinor && (!form.guardianName || !form.guardianConsent)) {
      setError('Người dưới 18 tuổi cần thông tin và xác nhận của người giám hộ.')
      return
    }
    if (!files.length && !form.externalLink) {
      setError('Hãy tải ít nhất một file gốc hoặc nhập link tác phẩm.')
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
      localStorage.removeItem(DRAFT_KEY)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi tác phẩm')
    } finally {
      setSubmitting(false)
    }
  }

  return <main>
    <PageHero eyebrow="GÓC NHÌN CỦA BẠN" title="Gửi góc nhìn" accent="của bạn" desc="Gửi tác phẩm gốc, câu chuyện và thông tin bản quyền trong một luồng an toàn. File original được giữ nguyên chất lượng." image={img.lake}>
      <div className="draft-status"><Save size={15}/>{savedAt ? 'Đã lưu nháp lúc ' + savedAt.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : 'Tự động lưu nháp'}</div>
    </PageHero>

    <section className="submit-page container section">
      <div className="stepper">{steps.map((s,i)=><button key={s} className={step===i+1?'active':step>i+1?'done':''} onClick={()=>setStep(i+1)}><span>{step>i+1?<Check size={15}/>:i+1}</span><b>{s}</b></button>)}</div>

      <div className="submit-layout">
        <div className="wizard-card">
          <span className="eyebrow">Bước {step} / 7</span>

          {step===1&&<div>
            <h2>Thông tin tác giả</h2><p>Thông tin này dùng để BTC liên hệ và xác minh tác phẩm.</p>
            <div className="form-grid">
              <label>Họ và tên *<input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Nguyễn Minh An"/></label>
              <label>Tên hiển thị<input value={form.display} onChange={e=>upd('display',e.target.value)} placeholder="Minh An"/></label>
              <label>Email *<input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="an.nguyen@gmail.com"/></label>
              <label>Số điện thoại<input value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="0987 654 321"/></label>
              <label className="full">Giới thiệu ngắn<textarea value={form.bio} onChange={e=>upd('bio',e.target.value)} placeholder="Một vài dòng về bạn..."/></label>
            </div>
          </div>}

          {step===2&&<div>
            <h2>Thông tin tác phẩm</h2><p>Đặt tên và cho BTC biết tác phẩm được tạo khi nào.</p>
            <div className="form-grid">
              <label className="full">Tên tác phẩm *<input value={form.title} onChange={e=>upd('title',e.target.value)} placeholder="Bình minh trên hồ Đồng Mô"/></label>
              <label>Thời gian chụp / thực hiện<input type="date" value={form.capturedAt} onChange={e=>upd('capturedAt',e.target.value)}/></label>
              <label>Link tác phẩm (nếu có)<input value={form.externalLink} onChange={e=>upd('externalLink',e.target.value)} placeholder="https://..."/></label>
            </div>
            <h3 className="form-subtitle">Loại hình</h3>
            <div className="type-grid">{types.map(([n,I])=><button key={n} onClick={()=>upd('type',n)} className={form.type===n?'selected':''}><I/><b>{n}</b><small>{n==='Ảnh'?'Ảnh đơn, bộ ảnh, photo story':'Một hình thức sáng tạo về Hòa Lạc'}</small></button>)}</div>
          </div>}

          {step===3&&<div>
            <h2>Tải file gốc</h2><p>File original được lưu riêng, không resize và không nén lại.</p>
            <div className="vault-note"><ShieldCheck/><div><b>Original Vault</b><span>Giữ nguyên byte file gốc · checksum SHA-256 · tối đa 10 file</span></div></div>
            <div className="upload-box" onClick={()=>inputRef.current?.click()}>
              <Upload size={34}/><b>Kéo thả tệp vào đây hoặc</b>
              <button type="button" className="btn btn-terra">Chọn tệp từ thiết bị</button>
              <small>JPG, PNG, WEBP, MP4, MOV, PDF, DOC/DOCX, MP3 · tối đa theo cấu hình server.</small>
              <input ref={inputRef} hidden multiple type="file" accept="image/*,video/*,.pdf,.doc,.docx,.mp3" onChange={e=>setFiles(Array.from(e.target.files || []).slice(0,10))}/>
            </div>
            <div className="upload-thumbs">{files.length?files.map((file,i)=><div className="file-chip" key={file.name + '-' + i}><ImageIcon/><span title={file.name}>{file.name}<small>{(file.size/1024/1024).toFixed(2)} MB</small></span><button onClick={(e)=>{e.stopPropagation();setFiles(v=>v.filter((_,idx)=>idx!==i))}}>×</button></div>):<><img src={img.lake}/><img src={img.village}/><img src={img.architecture}/><button onClick={()=>inputRef.current?.click()}><ImageIcon/> Thêm tệp</button></>}</div>
          </div>}

          {step===4&&<div>
            <h2>Chủ đề & sắc màu</h2><p>Chọn lớp câu chuyện phù hợp nhất với góc nhìn của bạn.</p>
            <div className="theme-select-grid">{themes.map(t=><button key={t.id} onClick={()=>upd('theme',t.title)} className={form.theme===t.title?'selected':''}><img src={t.image}/><span>{t.title}</span></button>)}</div>
            <h3 className="form-subtitle">Sắc màu Hòa Lạc</h3>
            <div className="color-select-grid">{colorStories.map(c=><button key={c.name} onClick={()=>upd('color',c.name)} className={form.color===c.name?'selected':''}><span style={{background:c.color}}/>{form.color===c.name&&<i><Check size={14}/></i>}<b>{c.name}</b><small>{c.story}</small></button>)}</div>
          </div>}

          {step===5&&<div>
            <h2>Địa điểm & câu chuyện</h2>
            <div className="form-grid">
              <label className="full">Địa điểm *<div className="input-icon"><MapPin size={17}/><input value={form.location} onChange={e=>upd('location',e.target.value)}/></div></label>
              <label className="full">Câu chuyện 50–150 chữ *<textarea rows="7" value={form.story} onChange={e=>upd('story',e.target.value)} placeholder="Kể câu chuyện đằng sau tác phẩm..."/></label>
              <label className="full check-row"><input type="checkbox" checked={form.previousAward} onChange={e=>upd('previousAward',e.target.checked)}/> Tác phẩm này từng tham gia/đạt giải ở chương trình khác</label>
              {form.previousAward&&<label className="full">Thông tin giải/chương trình<textarea value={form.previousAwardNote} onChange={e=>upd('previousAwardNote',e.target.value)} placeholder="Tên chương trình, năm, giải thưởng..."/></label>}
            </div>
            <div className="mini-map"><span><MapPin/> {form.location}</span></div>
          </div>}

          {step===6&&<div>
            <h2>Quyền tác giả & đồng thuận</h2><p>Những xác nhận này giúp bảo vệ tác giả, người xuất hiện trong tác phẩm và BTC.</p>
            <div className="confirm-list">
              <label><input type="checkbox" checked={form.rightsConfirmed} onChange={e=>upd('rightsConfirmed',e.target.checked)}/> <b>Tôi xác nhận mình có quyền gửi và sử dụng tác phẩm này.</b></label>
              <label><input type="checkbox" checked={form.imageConsentConfirmed} onChange={e=>upd('imageConsentConfirmed',e.target.checked)}/> Tôi đã có sự đồng ý phù hợp của người có thể nhận diện trong ảnh/video (nếu có).</label>
              <label><input type="checkbox" checked={form.allowMediaUse} onChange={e=>upd('allowMediaUse',e.target.checked)}/> Tôi đồng ý cho HALO HOLA sử dụng tác phẩm cho mục đích truyền thông theo thể lệ.</label>
              <label><input type="checkbox" checked={form.allowNewsletter} onChange={e=>upd('allowNewsletter',e.target.checked)}/> Tôi đồng ý nhận tin về HALO HOLA và các hoạt động cộng đồng.</label>
              <label><input type="checkbox" checked={form.isMinor} onChange={e=>upd('isMinor',e.target.checked)}/> Tôi chưa đủ 18 tuổi.</label>
            </div>
            {form.isMinor&&<div className="guardian-box">
              <label>Họ tên người giám hộ<input value={form.guardianName} onChange={e=>upd('guardianName',e.target.value)} placeholder="Họ và tên"/></label>
              <label className="check-row"><input type="checkbox" checked={form.guardianConsent} onChange={e=>upd('guardianConsent',e.target.checked)}/> Người giám hộ đồng ý cho tôi tham gia và gửi tác phẩm.</label>
            </div>}
          </div>}

          {step===7&&<div>
            <h2>{result?'Gửi tác phẩm thành công':'Kiểm tra lần cuối'}</h2>
            {result?<div className="success-stack">
              <div className="success-preview"><Check/><div><b>Mã tác phẩm: {result.code}</b><p>BTC đã nhận hồ sơ và file của bạn.</p></div></div>
              <div className="success-actions"><Link to="/tra-cuu" className="btn btn-green">Tra cứu trạng thái</Link><button className="btn btn-outline" onClick={resetDraft}>Gửi tác phẩm khác</button></div>
              {result.media?.length>0&&<div className="vault-result"><b>Original Vault</b>{result.media.map(m=><div key={m.id}><span>{m.originalName}</span><small>{m.provider} · SHA256 {m.sha256?.slice(0,12)}…</small></div>)}</div>}
            </div>:<>
              <div className="review-grid">
                <div><small>Tác phẩm</small><b>{form.title||'Chưa nhập'}</b></div>
                <div><small>Tác giả</small><b>{form.display||form.name||'Chưa nhập'}</b></div>
                <div><small>Chủ đề</small><b>{form.theme}</b></div>
                <div><small>File gốc</small><b>{files.length} file</b></div>
                <div><small>Địa điểm</small><b>{form.location}</b></div>
                <div><small>Quyền tác giả</small><b>{form.rightsConfirmed?'Đã xác nhận':'Chưa xác nhận'}</b></div>
              </div>
              {error&&<div className="form-error">{error}</div>}
            </>}
          </div>}

          {!result&&<div className="wizard-actions">
            <button className="btn btn-outline" onClick={prev} disabled={step===1}><ArrowLeft size={16}/> Quay lại</button>
            {step<7?<button className="btn btn-terra" onClick={next}>Tiếp tục <ArrowRight size={16}/></button>:<button className="btn btn-terra" disabled={submitting} onClick={submit}>{submitting?<><Loader2 className="spin" size={16}/> Đang lưu original...</>:<>Gửi tác phẩm <ArrowRight size={16}/></>}</button>}
          </div>}
        </div>

        <aside className="submission-preview">
          <span className="eyebrow">XEM TRƯỚC TÁC PHẨM</span>
          <div className="preview-card"><img src={img.sunset}/><div className="preview-body"><div className="preview-tags"><span>{form.type}</span><span>{form.theme}</span></div><h3>{form.title||'Tên tác phẩm của bạn'}</h3><p>{form.display||form.name||'Tên tác giả'}</p><p>{form.story||'Câu chuyện phía sau tác phẩm sẽ xuất hiện tại đây...'}</p><div className="preview-tags"><span>{form.location}</span><span>{form.color}</span></div></div></div>
          <div className="submission-code"><small>{result?'Mã tác phẩm':'Mã sẽ tạo sau khi gửi'}</small><strong>{code}</strong>{result&&<button onClick={()=>navigator.clipboard?.writeText(code)}><Copy size={16}/></button>}</div>
          <blockquote>“Mỗi góc nhìn của bạn đều góp phần tạo nên một bức tranh Hòa Lạc đa sắc màu.”</blockquote>
          <Link className="text-link" to="/tra-cuu">Đã gửi trước đó? Tra cứu tác phẩm →</Link>
        </aside>
      </div>
    </section>
  </main>
}
