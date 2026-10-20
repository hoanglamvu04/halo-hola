import { useEffect, useState } from 'react'
import {
  CalendarDays, MapPin, Users, Bus, Utensils, Flag, ArrowRight, ArrowLeft,
  CheckCircle2, Compass, Leaf, Camera, Heart, FileText, X, Eye,
  MessageCircle, Quote, Video, Image as ImageIcon, UserRound, Route, Sun, Sunset
} from 'lucide-react'
import { getTours, registerTour } from '../services/api.js'
import { normalizeTour } from '../utils/contentAdapters.js'

const itineraryIcons=[Bus,MapPin,Utensils,Users,Camera,Flag]

const tour01Lenses=[
  {
    label:'BUỔI SÁNG · ĐOÀI',
    title:'Điều gì làm nên chất Đoài?',
    flow:['Đất','Làng','Nghề','Con người','Ký ức'],
    text:'Bắt đầu từ không gian và vật liệu, rồi đi sâu dần tới con người và những ký ức đang sống trong làng.'
  },
  {
    label:'BUỔI CHIỀU · MƯỜNG',
    title:'Điều gì làm nên bản sắc Mường?',
    flow:['Cộng đồng','Nếp sống','Văn hóa','Con người','Ký ức'],
    text:'Một hành trình mới, kể văn hóa Mường bằng chính đời sống và câu chuyện của người Mường — không ép nối với phần Đoài.'
  }
]

const tour01Outputs=[
  ['5–8','Nhân vật tiếp xúc',UserRound],
  ['3–5','Phỏng vấn tương đối sâu',MessageCircle],
  ['5–7','Lead câu chuyện',FileText],
  ['2–4','Góc nhìn mạnh để shortlist',Eye],
  ['≥5','Hero Image tiềm năng',ImageIcon],
  ['≥5','Quote đáng giữ',Quote],
  ['≥3','Video interview',Video],
]

const tour01StoryKit=[
  'Tên nhân vật / nguồn',
  'Tên câu chuyện tạm',
  'Hero Image',
  'Ảnh phụ',
  'Story / ghi chú đủ để biên tập',
  'Quote',
  'Video hoặc B-roll nếu có',
  'Contact + thông tin quyền sử dụng'
]

const tour01Principles=[
  'Không biến tour thành chuyến check-in hoặc cố chạy thật nhiều địa điểm.',
  'Không dựng trước kết luận rồi tìm người nói theo; câu chuyện phải đi từ điều thực sự gặp được.',
  'Không biến người dân thành đạo cụ văn hóa, không yêu cầu biểu diễn hoặc mặc trang phục chỉ để quay đẹp.',
  'Ưu tiên một cuộc trò chuyện tốt và asset bắt buộc trước B-roll, texture hay ảnh phụ.'
]

export default function TourPage(){
  const [selected,setSelected]=useState(0)
  const [tours,setTours]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',email:'',phone:'',roleLabel:'',equipment:'',note:''})
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false)

  useEffect(()=>{
    setLoading(true);setError('')
    getTours().then(data=>setTours((data||[]).map(normalizeTour))).catch(err=>setError(err.message)).finally(()=>setLoading(false))
  },[])

  useEffect(()=>{
    if(!showForm)return undefined
    const previousOverflow=document.body.style.overflow
    const closeOnEscape=(event)=>{
      if(event.key==='Escape')setShowForm(false)
    }
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',closeOnEscape)
    return ()=>{
      document.body.style.overflow=previousOverflow
      window.removeEventListener('keydown',closeOnEscape)
    }
  },[showForm])

  const tour=tours[selected]||tours[0]||null
  const isTour01=String(tour?.no||'').padStart(2,'0')==='01'
  const currentItinerary=(tour?.itinerary||[]).map((item,index)=>[
    item.time||item[0]||'',
    item.title||item[1]||'Điểm dừng',
    itineraryIcons[index%itineraryIcons.length],
    item.description||item.desc||item[3]||''
  ])
  const currentStops=(tour?.stops||[]).map(item=>[
    item.name||item.title||'Điểm dừng',
    item.image||'',
    item.description||item.desc||''
  ])
  const highlights=Array.isArray(tour?.highlights)?tour.highlights:[]
  const displayHighlights=isTour01
    ? [...highlights,{title:'Trải nghiệm thực tế',description:'Đi qua không gian thật, gặp con người thật và chạm vào những lớp văn hóa còn sống.'}]
    : highlights

  const afternoonStartIndex=currentItinerary.findIndex(([time])=>/^(12:45|13:)/.test(String(time)))
  const tour01SplitIndex=afternoonStartIndex>0?afternoonStartIndex:Math.ceil(currentItinerary.length/2)
  const tour01MorningItinerary=currentItinerary.slice(0,tour01SplitIndex)
  const tour01AfternoonItinerary=currentItinerary.slice(tour01SplitIndex)

  const openRegistration=()=>{
    setError('')
    setShowForm(true)
  }

  const submit=async(e)=>{
    e.preventDefault()
    if(!tour)return
    setSubmitting(true);setError('')
    try{
      const data=await registerTour({...form,tourNumber:tour.no})
      setResult(data)
    }catch(err){setError(err.message)}
    finally{setSubmitting(false)}
  }

  return <main className={`tour-page-ref ${isTour01?'tour01-page':''}`}>
    <section className="tour-page-hero">
      <div className="tour-page-contours"/>
      <div className="tour-page-inner tour-page-hero-grid">
        <div className="tour-page-copy">
          <div className="tour-page-kicker">NHỮNG HÀNH TRÌNH CHẠM VÀO HÒA LẠC THẬT</div>
          <h1><span>HOLA</span><em>Tour</em></h1>
          <p>Khám phá Hòa Lạc qua trải nghiệm thực tế – đi, gặp, trải nghiệm và kể lại bằng góc nhìn của bạn.</p>
          <div className="tour-page-actions">
            <button className="btn btn-green" disabled={!tour} onClick={openRegistration}><Compass size={17}/> Chọn hành trình cho bạn <ArrowRight size={16}/></button>
            <a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a>
          </div>
        </div>

        <div className="tour-page-hero-visual">
          <div className="tour-page-hero-image">{tour?.image?<img src={tour.image} alt="HOLA Tour"/>:<div className="theme-card-placeholder"/>}</div>
          <div className="tour-page-handnote">Hòa Lạc<br/>hôm nay<br/>và mai sau...</div>
          <Leaf className="tour-page-leaf"/>
        </div>
      </div>
    </section>

    {loading&&<div className="jw-empty">Đang tải HOLA Tour từ hệ thống...</div>}
    {error&&!showForm&&<div className="form-error">{error}</div>}
    {!loading&&!error&&!tour&&<div className="jw-empty">Chưa có HOLA Tour được công bố.</div>}

    {tour&&<>
    <section className="tour-switch-band">
      <div className="tour-page-inner tour-switch-row">
        <div className="tour-switch-list">
          {tours.map((t,i)=><button
            onClick={()=>{setSelected(i);setResult(null);setShowForm(false)}}
            className={selected===i?'active':''}
            key={t.id||t.no}
          >
            {t.image?<img src={t.image} alt={t.title}/>:<div className="theme-card-placeholder"/>}
            <div>
              <span>Tour #{t.no} · {t.dates}</span>
              <h3>{t.title}</h3>
              <small>{t.kicker}</small>
            </div>
            <b><ArrowRight/></b>
          </button>)}
        </div>
        <div className="tour-switch-nav">
          <button disabled={selected<=0} onClick={()=>setSelected(v=>Math.max(0,v-1))}><ArrowLeft/></button>
          <button className="active" disabled={selected>=tours.length-1} onClick={()=>setSelected(v=>Math.min(tours.length-1,v+1))}><ArrowRight/></button>
        </div>
      </div>
    </section>

    <section className="tour-selected-ref">
      <div className="tour-page-inner tour-selected-grid">
        <div className="tour-selected-copy">
          <span className="eyebrow">HOLA TOUR · #{tour.no}</span>
          <h2>{isTour01?'Đoài · Mường':tour.title}</h2>
          <h3>{isTour01?'Đi tìm Bản sắc':tour.kicker}</h3>
          <div className="tour-selected-facts">
            <span><CalendarDays/> {tour.durationLabel}</span>
            <span><MapPin/> {tour.location}</span>
            <span><Users/> {tour.audienceLabel}</span>
          </div>
          <p>{tour.desc}</p>
          <div className="tour-selected-actions">
            <button className="btn btn-terra" onClick={openRegistration}>Đăng ký hành trình <ArrowRight size={16}/></button>
            <a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a>
          </div>
          {isTour01&&<div className="tour01-tour-links" aria-label="Chọn HOLA Tour">
            {tours.map((item,index)=><button key={item.id||item.no} className={selected===index?'active':''} onClick={()=>setSelected(index)}>
              <small>#{String(item.no).padStart(2,'0')}</small><span>{item.title}</span>
            </button>)}
          </div>}
        </div>

        <div className="tour-selected-visual">
          {tour.image?<img src={tour.image} alt={tour.title}/>:<div className="theme-card-placeholder"/>}
          <div className="tour-selected-note"><span>Hòa Lạc<br/>những câu chuyện<br/>vẫn tiếp tục...</span></div>
        </div>
      </div>
    </section>

    {isTour01&&<>
      <section className="tour01-concept-section">
        <div className="tour-page-inner">
          <div className="tour01-section-head">
            <div><span>HAI MẠCH BẢN SẮC</span><h2>Hai lớp bản sắc.<br/>Hai hành trình khám phá trong một ngày.</h2></div>
            <p>Từ không gian làng, nghề và ký ức của Xứ Đoài đến nếp sống, văn hóa và con người Mường — mỗi phần được kể bằng chính câu chuyện của vùng đó.</p>
          </div>
          <div className="tour01-lens-grid">
            {tour01Lenses.map((lens,index)=><article key={lens.label}>
              <div className="tour01-lens-image">{currentStops[index]?.[1]?<img src={currentStops[index][1]} alt={lens.label}/>:<div className="theme-card-placeholder"/>}</div>
              <div className="tour01-lens-top"><span>{lens.label}</span><b><ArrowRight/></b></div>
              <h3>{lens.title}</h3>
              <p>{lens.text}</p>
              <div className="tour01-flow">{lens.flow.map(item=><span key={item}>{item}</span>)}</div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="tour01-method-section">
        <div className="tour-page-inner tour01-method-grid">
          <div className="tour01-method-copy">
            <span className="eyebrow">PHƯƠNG PHÁP TRẢI NGHIỆM</span>
            <h2>Đi · Nhìn · Gặp · Nghe · Ghi lại</h2>
            <p>Không đo hành trình bằng số địa điểm đã đi qua. Mục tiêu là gặp được người, nghe được điều đáng nhớ và tìm thấy câu chuyện đủ tốt để tiếp tục biên tập.</p>
          </div>
          <div className="tour01-method-steps">
            {[[Route,'ĐI'],[Eye,'NHÌN'],[Users,'GẶP'],[MessageCircle,'NGHE'],[Camera,'GHI LẠI']].map(([Icon,label],index)=><div key={label}><span>{String(index+1).padStart(2,'0')}</span><Icon/><b>{label}</b></div>)}
          </div>
        </div>
      </section>
    </>}

    {showForm&&<div
      className="tour-register-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Đăng ký HOLA Tour ${tour.no}`}
      onMouseDown={event=>{if(event.target===event.currentTarget)setShowForm(false)}}
    >
      <section className="tour-register-panel" onMouseDown={event=>event.stopPropagation()}>
        <button className="tour-register-close" type="button" aria-label="Đóng form đăng ký" onClick={()=>setShowForm(false)}><X/></button>
        <div className="tour-register-modal-grid">
          <div>
            <span className="eyebrow">ĐĂNG KÝ HOLA TOUR #{tour.no}</span>
            <h2>{isTour01?'Đoài · Mường':tour.title}</h2>
            <p>{tour.dates} · {tour.audienceLabel}.</p>
            <div className="tour-register-note"><b>HOLA Tour là hành trình săn câu chuyện.</b><span>Đi, gặp, quan sát và ghi lại những câu chuyện thật để tiếp tục biên tập trong hệ thống HALO HOLA.</span></div>
          </div>
          {result?<div className="tour-register-success"><CheckCircle2/><h3>Đăng ký thành công</h3><p>Mã đăng ký của bạn:</p><strong>{result.code}</strong><small>BTC sẽ liên hệ qua email/điện thoại để xác nhận.</small></div>:
          <form className="tour-register-form" onSubmit={submit}>
            <label>Họ và tên *<input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
            <label>Email *<input required type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
            <label>Số điện thoại *<input required value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
            <label>Vai trò<select value={form.roleLabel} onChange={e=>setForm(v=>({...v,roleLabel:e.target.value}))}><option value="">Chọn vai trò</option><option>Creator / Nhiếp ảnh</option><option>Sinh viên</option><option>Kiến trúc / Thiết kế</option><option>Người địa phương</option><option>Khác</option></select></label>
            <label className="full">Thiết bị sử dụng<input value={form.equipment} onChange={e=>setForm(v=>({...v,equipment:e.target.value}))} placeholder="Điện thoại, máy ảnh..."/></label>
            <label className="full">Lưu ý sức khỏe / ăn uống<textarea value={form.note} onChange={e=>setForm(v=>({...v,note:e.target.value}))}/></label>
            {error&&<div className="form-error full">{error}</div>}
            <button className="btn btn-terra full" disabled={submitting}>{submitting?'Đang đăng ký...':'Xác nhận tham gia'}</button>
          </form>}
        </div>
      </section>
    </div>}

    <section id="lich-trinh" className="tour-detail-ref">
      <div className="tour-page-inner tour-detail-grid">
        {isTour01?<>
          <div className="tour01-reference-timeline">
            <article className="tour01-reference-card morning">
              <header className="tour01-reference-card-head">
                <div className="tour01-reference-head-icon"><Sun/></div>
                <div>
                  <span>BUỔI SÁNG</span>
                  <h2>ĐOÀI</h2>
                  <p>Khám phá không gian, kiến trúc và văn hoá Xứ Đoài</p>
                  <i/>
                </div>
              </header>
              <div className="tour01-reference-list">
                {tour01MorningItinerary.map(([time,title,I,desc],index)=><div className="tour01-reference-item" key={time+title+index}>
                  <div className="tour01-reference-rail"><span>{String(index+1).padStart(2,'0')}</span></div>
                  <div className="tour01-reference-time">{time}</div>
                  <div className="tour01-reference-icon"><I/></div>
                  <div className="tour01-reference-copy"><b>{title}</b><p>{desc}</p></div>
                  <div className="tour01-reference-arrow"><ArrowRight/></div>
                </div>)}
              </div>
            </article>

            <article className="tour01-reference-card afternoon">
              <header className="tour01-reference-card-head">
                <div className="tour01-reference-head-icon"><Sunset/></div>
                <div>
                  <span>BUỔI CHIỀU</span>
                  <h2>MƯỜNG</h2>
                  <p>Khám phá cộng đồng, nếp sống và hành trình văn hoá bản địa</p>
                  <i/>
                </div>
              </header>
              <div className="tour01-reference-list">
                {tour01AfternoonItinerary.map(([time,title,I,desc],index)=><div className="tour01-reference-item" key={time+title+index}>
                  <div className="tour01-reference-rail"><span>{String(tour01SplitIndex+index+1).padStart(2,'0')}</span></div>
                  <div className="tour01-reference-time">{time}</div>
                  <div className="tour01-reference-icon"><I/></div>
                  <div className="tour01-reference-copy"><b>{title}</b><p>{desc}</p></div>
                  <div className="tour01-reference-arrow"><ArrowRight/></div>
                </div>)}
              </div>
            </article>
          </div>
        </>:<div className="tour-itinerary">
          <h2>Lịch trình trải nghiệm</h2>
          {currentItinerary.length===0?<p>BTC đang cập nhật lịch trình chi tiết.</p>:<div className="tour-itinerary-list">
            {currentItinerary.map(([time,title,I,desc],index)=><div key={time+title+index}>
              <span className="tour-time">{time}</span>
              <span className="tour-itinerary-icon"><I/></span>
              <div><b>{title}</b><p>{desc}</p></div>
            </div>)}
          </div>}
        </div>}

        <div className="tour-highlights">
          <div className="tour01-block-title"><h2>Điểm nhấn của hành trình</h2><span>Đi sâu · gặp thật · nghe thật</span></div>
          <div className="tour-highlight-grid">
            {displayHighlights.map((h,index)=><div key={h.title||index}><span>{index%2===0?<Leaf/>:<Heart/>}</span><b>{h.title}</b><p>{h.description}</p></div>)}
          </div>

          <div className="tour-info-ref">
            <div className="tour-info-title"><FileText/><b>Thông tin tour</b></div>
            <div>
              <p><b>Thời gian:</b> {tour.dates}</p>
              <p><b>Hình thức:</b> {tour.audienceLabel}</p>
              <p><b>Địa điểm:</b> {tour.location}</p>
              <p><b>Nguyên tắc:</b> Ưu tiên câu chuyện và nhân vật thật; không chạy địa điểm chỉ để đủ số lượng.</p>
            </div>
          </div>
        </div>

        {currentStops.length>0&&<div className="tour-stops">
          <div className="tour-stops-head"><h2>{isTour01?'03 cụm khám phá':'Các điểm dừng nổi bật'}</h2></div>
          <div className="tour-stop-grid">
            {currentStops.map(([name,image,desc],index)=><div className="tour-stop-card" key={name+index}>
              {image?<img src={image} alt={name}/>:<div className="theme-card-placeholder"/>}
              <div><small>{String(index+1).padStart(2,'0')}</small><h3>{name}</h3><p>{desc}</p><span><ArrowRight/></span></div>
            </div>)}
          </div>
        </div>}
      </div>
    </section>

    {isTour01&&<>
      <section className="tour01-output-section">
        <div className="tour-page-inner">
          <div className="tour01-section-head">
            <div><span>ĐẦU RA MONG MUỐN</span><h2>Mang về ít hơn,<br/>nhưng đủ sâu để kể tiếp.</h2></div>
            <p>KPI không đo bằng số người tham gia hay số điểm check-in, mà bằng số câu chuyện, nhân vật, ảnh, video và tư liệu có thể đi tiếp vào hệ thống 52 góc nhìn.</p>
          </div>
          <div className="tour01-output-grid">
            {tour01Outputs.map(([value,label,Icon])=><article key={label}><Icon/><b>{value}</b><span>{label}</span></article>)}
          </div>
        </div>
      </section>

      <section className="tour01-storykit-section">
        <div className="tour-page-inner tour01-storykit-grid">
          <div>
            <span className="eyebrow">KHI GẶP MỘT CÂU CHUYỆN MẠNH</span>
            <h2>Thu đủ để câu chuyện không bị mất sau chuyến đi.</h2>
            <p>Một góc nhìn không nhất thiết chỉ là một bức ảnh. Nó có thể bắt đầu từ một con người, một nơi chốn, món ăn, nghề, ký ức, câu nói hay khoảnh khắc.</p>
          </div>
          <div className="tour01-storykit-list">
            {tour01StoryKit.map((item,index)=><div key={item}><span>{String(index+1).padStart(2,'0')}</span><b>{item}</b><CheckCircle2/></div>)}
          </div>
        </div>
      </section>

      <section className="tour01-ethics-section">
        <div className="tour-page-inner">
          <div className="tour01-section-head compact">
            <div><span>NGUYÊN TẮC GHI LẠI</span><h2>Không lấy một hình ảnh đẹp bằng cách làm sai câu chuyện.</h2></div>
          </div>
          <div className="tour01-principle-grid">
            {tour01Principles.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,'0')}</span><p>{item}</p></article>)}
          </div>
        </div>
      </section>

      <section className="tour01-confluence-section">
        <div className="tour-page-inner tour01-confluence-card">
          <div>
            <span>17:00 · BA HÀNH TRÌNH HỘI TỤ</span>
            <h2>Không báo cáo đã đi đâu.<br/>Kể điều mình đã tìm thấy.</h2>
            <p>Tour #01 · Bản sắc gặp Tour #02 · Màu sắc và Tour #03 · Cảm xúc để đặt ba lát cắt cạnh nhau thành một bức tranh rộng hơn về Hòa Lạc.</p>
          </div>
          <div className="tour01-confluence-assets">
            {['03 ảnh','01 nhân vật','01 quote','01 câu chuyện','01 điều mới phát hiện'].map(item=><span key={item}><CheckCircle2/>{item}</span>)}
          </div>
        </div>
      </section>
    </>}
    </>}
  </main>
}
