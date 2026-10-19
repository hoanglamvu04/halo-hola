import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, MapPin, Leaf, BookOpen, Users, Sun, Map, HeartHandshake, CalendarDays, Camera, FileText, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeCard from '../components/ThemeCard.jsx'
import { img } from '../data/siteData.js'
import { getCampaignStats, getHomepageContent, getThemes, getColors, getTours, getPublicArtworks } from '../services/api.js'
import { getHolaMapConfig } from '../services/holaMapsApi.js'
import { normalizeTour } from '../utils/contentAdapters.js'
import { campaignCssVars, normalizeCampaignConfig, OFFICIAL_CAMPAIGN_MILESTONES } from '../utils/campaignConfig.js'

export default function HomePage() {
  const [stats,setStats]=useState({submissions:0,creators:0,locations:0,top52:0})
  const [homepage,setHomepage]=useState({})
  const [themes,setThemes]=useState([])
  const [colors,setColors]=useState([])
  const [tours,setTours]=useState([])
  const [holaMapEmbedUrl,setHolaMapEmbedUrl]=useState('')
  const [artworks,setArtworks]=useState([])
  const [heroSlide,setHeroSlide]=useState(0)

  useEffect(()=>{
    getCampaignStats().then(setStats).catch(()=>{})
    getHomepageContent().then(setHomepage).catch(()=>{})
    getThemes().then(data=>setThemes(Array.isArray(data)?data:[])).catch(()=>{})
    getColors().then(data=>setColors(Array.isArray(data)?data:[])).catch(()=>{})
    getTours().then(data=>setTours((data||[]).map(normalizeTour))).catch(()=>{})
    getHolaMapConfig().then(config=>setHolaMapEmbedUrl(config?.embedUrl||'https://maps.dothihoalac.vn/embed')).catch(()=>setHolaMapEmbedUrl('https://maps.dothihoalac.vn/embed'))
    getPublicArtworks({limit:5}).then(data=>setArtworks(Array.isArray(data)?data:[])).catch(()=>{})
  },[])

  const sectionOn=(key)=>homepage[key]?.enabled!==false
  const sectionData=(key,defaults)=>({...defaults,...(homepage[key]?.content||{})})

  const hero=sectionData('hero',{
    eyebrow:'CHÚNG TA ĐI TÌM HÒA LẠC',
    titleLine1:'HELLO',
    titleAccent:'HÒA LẠC',
    tagline:'52 góc nhìn · 1 Hòa Lạc',
    description:'Cùng đi, nhìn, gặp, nghe và ghi lại những con người, không gian, ký ức, khoảnh khắc và ý tưởng đáng được giữ lại về Hòa Lạc.',
    mainImage:img.lake,
    floatImageA:img.architecture,
    floatImageB:img.people
  })
  const heroSlides=[
    {src:hero.mainImage||img.lake,alt:'Phong cảnh Hòa Lạc'},
    {src:hero.floatImageA||img.architecture,alt:'Không gian Hòa Lạc'},
    {src:hero.floatImageB||img.people,alt:'Con người Hòa Lạc'},
    {src:img.green,alt:'Thiên nhiên Hòa Lạc'},
    {src:img.sunset,alt:'Đời sống và cảm xúc Hòa Lạc'}
  ]
  const campaign=normalizeCampaignConfig(sectionData('campaign',{
    eyebrow:'ĐI → NHÌN → GẶP → NGHE → GHI LẠI → BIÊN TẬP → KỂ → LAN TỎA',
    title:'Mỗi ngày thêm một góc nhìn mới.',
    description:'HALO HOLA cùng cộng đồng chủ động tìm những câu chuyện đáng được giữ lại — từ người dân, chuyên gia, trường học, sinh viên, doanh nghiệp, CLB và những người yêu Hòa Lạc.',
    ctaText:'Gửi một góc nhìn',
    backgroundImage:img.sunset,
    discoverImage:img.hills,
    keepImage:img.architecture,
    shareImage:img.student
  }))
  const change=sectionData('change',{
    title:'Hòa Lạc đang thay đổi',
    description:'Từ Xứ Đoài trầm tích, văn hóa Mường, làng xóm và đá ong đến tri thức, công nghệ, kiến trúc và những cộng đồng mới — Hòa Lạc đang lớn lên bằng nhiều lớp thời gian cùng tồn tại.',
    image1:img.village,
    image2:img.student,
    image3:img.architecture
  })
  const themesCopy=sectionData('themes',{
    eyebrow:'7 CHỦ ĐỀ · BA TRỤC XUYÊN SUỐT',
    title:'7 chủ đề Hòa Lạc',
    description:'Bản sắc · Thiên nhiên · Không gian · Con người · Tri thức & Công nghệ · Đời sống & Cảm xúc · Tương lai. Ba trục xuyên suốt: Bản sắc · Sáng tạo · Tương lai.'
  })
  const colorsCopy=sectionData('colors',{
    eyebrow:'SẮC MÀU HÒA LẠC',
    title:'Hòa Lạc trong bạn có màu gì?',
    description:'Sắc màu là một lớp nhận diện xuyên suốt, không phải một chủ đề riêng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc.',
    storyImagePrimary:img.hills,
    storyImageSecondary:img.lake,
    colorImage1:img.village,
    colorImage2:img.sunset,
    colorImage3:img.green,
    colorImage4:img.architecture,
    colorImage5:img.village,
    colorImage6:img.lake
  })
  const toursCopy=sectionData('tours',{
    eyebrow:'ĐI · GẶP · NGHE · GHI LẠI',
    title:'HOLA Tour',
    description:'Ba hành trình săn câu chuyện: Đi tìm Bản sắc · Đi tìm Màu sắc · Đi tìm Cảm xúc. KPI không phải số người tham gia mà là số câu chuyện, nhân vật, ảnh, video và tư liệu có thể phát triển tiếp.'
  })
  const mapCopy=sectionData('map',{eyebrow:'NHỮNG CÂU CHUYỆN GẮN VỚI NƠI CHỐN',title:'HOLA Map',description:'Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ tương tác.'})
  const storiesCopy=sectionData('stories',{
    eyebrow:'GÓC NHÌN · CÂU CHUYỆN · HÒA LẠC',
    title:'Những câu chuyện đáng được giữ lại',
    description:'Mỗi góc nhìn là một câu chuyện được tìm thấy, xác minh, biên tập và kể lại để cùng tạo nên chân dung Hòa Lạc năm 2026.'
  })
  const community=sectionData('community',{
    eyebrow:'HALO HOLA KỂ · WE HOLA LÀM',
    title:'WE HOLA – Chúng ta là Hòa Lạc',
    description:'Từ những câu chuyện được kể, cộng đồng cùng biến điều đáng quan tâm thành những hành động nhỏ, cụ thể và có ích cho Hòa Lạc.',
    backgroundImage:img.people
  })

  const colorImages=[
    colorsCopy.colorImage1,
    colorsCopy.colorImage2,
    colorsCopy.colorImage3,
    colorsCopy.colorImage4,
    colorsCopy.colorImage5,
    colorsCopy.colorImage6
  ]

  const milestones=OFFICIAL_CAMPAIGN_MILESTONES
  const previousHeroSlide=()=>setHeroSlide(current=>(current-1+heroSlides.length)%heroSlides.length)
  const nextHeroSlide=()=>setHeroSlide(current=>(current+1)%heroSlides.length)

  return <main>
    {sectionOn('hero')&&<section className="home-hero home-hero-reference">
      <div className="home-hero-art">
        <div className="home-hero-copy">
          <div className="hero-eyebrow-row">
            <span className="eyebrow">{hero.eyebrow}</span>
            <i/>
          </div>
          <h1><span>{hero.titleLine1}</span><em>{hero.titleAccent}</em></h1>
          <span className="hero-title-stroke"/>
          <h3>{hero.tagline}</h3>
          <p>{hero.description}</p>

          <div className="hero-actions">
            <Link to="/kham-pha" className="btn btn-green">Khám phá Hòa Lạc <ArrowRight size={17}/></Link>
            <Link to="/gui-goc-nhin" className="btn btn-outline"><Camera size={17}/> Gửi một góc nhìn</Link>
          </div>
        </div>

        <div className="hero-collage">
          <span className="hero-orbit orbit-a"/>
          <span className="hero-orbit orbit-b"/>
          <Leaf className="hero-leaf leaf-a"/>
          <Leaf className="hero-leaf leaf-b"/>

          <div className="hero-main-frame">
            <img className="hero-main-img" src={hero.mainImage} alt="Hòa Lạc"/>
            <span className="hero-mobile-place"><MapPin/> <b>Hòa Lạc</b><small>hôm nay</small></span>
          </div>

          <div className="hero-float hero-float-a"><img src={hero.floatImageA} alt="Không gian Hòa Lạc"/></div>
          <div className="hero-float hero-float-b"><img src={hero.floatImageB} alt="Con người Hòa Lạc"/></div>

          <div className="hero-desktop-carousel" aria-label="Bộ ảnh Hòa Lạc">
            <img key={heroSlide} src={heroSlides[heroSlide].src} alt={heroSlides[heroSlide].alt}/>
            <div className="hero-carousel-controls">
              <button type="button" onClick={previousHeroSlide} aria-label="Ảnh Hòa Lạc trước"><ArrowLeft/></button>
              <span>{String(heroSlide+1).padStart(2,'0')} / {String(heroSlides.length).padStart(2,'0')}</span>
              <button type="button" onClick={nextHeroSlide} aria-label="Ảnh Hòa Lạc tiếp theo"><ArrowRight/></button>
            </div>
            <div className="hero-carousel-dots" aria-label="Chọn ảnh Hòa Lạc">
              {heroSlides.map((slide,index)=><button
                type="button"
                key={slide.src+index}
                className={index===heroSlide?'active':''}
                onClick={()=>setHeroSlide(index)}
                aria-label={`Xem ảnh ${index+1}: ${slide.alt}`}
              />)}
            </div>
          </div>

          <div className="hero-stone">
            <b>HÒA LẠC</b>
            <span>NƠI NHỮNG CÂU CHUYỆN ĐƯỢC TÌM THẤY</span>
            <i/>
          </div>

          <span className="hand-note home-note">Đi<br/>Gặp<br/>Nghe<br/>Kể...</span>
        </div>

        <div className="hero-pillar-band">
          <div className="hero-pillar-item">
            <span className="pillar-icon green"><Leaf/></span>
            <div><b>Bản sắc</b><small>Xứ Đoài · Mường · ký ức</small></div>
            <ArrowRight className="mobile-pillar-arrow"/>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon terra"><BookOpen/></span>
            <div><b>Tri thức</b><small>Đại học · nghiên cứu · công nghệ</small></div>
            <ArrowRight className="mobile-pillar-arrow"/>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon green"><Users/></span>
            <div><b>Con người</b><small>Những người tạo nên Hòa Lạc</small></div>
            <ArrowRight className="mobile-pillar-arrow"/>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon terra"><Sun/></span>
            <div><b>Tương lai</b><small>Một Hòa Lạc đang lớn lên</small></div>
            <ArrowRight className="mobile-pillar-arrow"/>
          </div>
        </div>
      </div>
    </section>}

    {sectionOn('campaign')&&<section className="campaign-live" style={campaignCssVars(campaign)}>
      <div className="campaign-live-grid">
        <div className="live-counter">
          <div className="campaign-kicker"><span className="eyebrow">{campaign.eyebrow}</span><i/></div>
          <h2>{campaign.title}</h2>
          <span className="campaign-accent-line"/>
          <p className="campaign-desc">{campaign.description}</p>
          <div className="live-stats">
            <Link to="/kham-pha" className="live-stat stat-camera" aria-label="Xem các góc nhìn đã công bố"><Camera/><b>{stats.submissions}</b><small>Góc nhìn đã gửi</small></Link>
            <Link to="/stories" className="live-stat stat-people" aria-label="Xem các câu chuyện"><Users/><b>{stats.creators}</b><small>Người cùng kể</small></Link>
            <Link to="/hola-map" className="live-stat stat-place" aria-label="Khám phá các địa điểm trên HOLA Map"><MapPin/><b>{stats.locations}</b><small>Địa điểm được ghi lại</small></Link>
            <Link to="/top52" className="live-stat stat-top52" aria-label="Xem 52 góc nhìn 2026"><FileText/><b>{stats.top52}</b><small>Góc nhìn trong bộ 52</small></Link>
          </div>
          <Link className="campaign-cta" to="/gui-goc-nhin">{campaign.ctaText} <ArrowRight size={22}/></Link>
          <div className="campaign-signature">Không tìm người thắng · Tìm những câu chuyện đáng được giữ lại</div>
        </div>

        <div className="campaign-timeline">
          <div className="timeline-title"><CalendarDays/><b>{campaign.journeyTitle||'Hành trình biên tập 2026'}</b></div>
          <div className="campaign-milestones">
            {milestones.map(([date,label],i)=><div className="campaign-milestone" key={date}>
              <span>{date}</span><i className={i===0?'active':''}/><b>{label}</b>
            </div>)}
          </div>
        </div>

        <div className="campaign-visual" aria-label="Hòa Lạc qua những góc nhìn">
          <img className="campaign-visual-bg" src={campaign.backgroundImage} alt="Phong cảnh Hòa Lạc"/>
          <div className="campaign-visual-shade"/>
          <div className="campaign-visual-glow"/>

          <div className="campaign-place-sign"><MapPin/><span>Hòa Lạc</span></div>

          <div className="campaign-photo-main">
            <img src={campaign.discoverImage} alt="Khám phá Hòa Lạc"/>
            <span>Đi tìm</span>
          </div>

          <div className="campaign-photo-secondary">
            <img src={campaign.keepImage} alt="Lưu giữ Hòa Lạc"/>
            <span>Ghi lại</span>
          </div>

          <div className="campaign-note-card">
            <img src={campaign.shareImage} alt="Kể chuyện Hòa Lạc"/>
            <div>
              <small>Ban Biên tập + cộng đồng</small>
              <b>Biên tập · kể · lan tỏa</b>
            </div>
          </div>
        </div>
      </div>
    </section>}

    {sectionOn('change')&&<section className="change-band change-band-reference">
      <div className="change-decor change-decor-left"/>
      <div className="change-decor change-decor-right"/>
      <div className="change-grid">
        <div className="change-copy">
          <div className="change-eyebrow-row">
            <span className="eyebrow">BẢN SẮC · SÁNG TẠO · TƯƠNG LAI</span>
            <i/>
          </div>
          <h2>{change.title}</h2>
          <p>{change.description}</p>
          <Link to="/stories" className="change-cta">Đọc những câu chuyện Hòa Lạc <ArrowRight size={17}/></Link>
        </div>

        <Link to="/stories" className="era-card era-card-reference">
          <img src={change.image1} alt="Cội nguồn Hòa Lạc"/>
          <div className="era-shade"/>
          <span className="era-content">
            <b>Cội nguồn</b>
            <i/>
            <small>Xứ Đoài · Mường · Làng · Đá ong</small>
          </span>
          <span className="era-arrow"><ArrowRight/></span>
        </Link>

        <Link to="/stories" className="era-card era-card-reference">
          <img src={change.image2} alt="Hòa Lạc hôm nay"/>
          <div className="era-shade"/>
          <span className="era-content">
            <b>Hôm nay</b>
            <i/>
            <small>Con người · Tri thức · Công nghệ</small>
          </span>
          <span className="era-arrow"><ArrowRight/></span>
        </Link>

        <Link to="/stories" className="era-card era-card-reference">
          <img src={change.image3} alt="Tương lai Hòa Lạc"/>
          <div className="era-shade"/>
          <span className="era-content">
            <b>Tương lai</b>
            <i/>
            <small>Quy hoạch · Môi trường · Giáo dục · Ý tưởng</small>
          </span>
          <span className="era-arrow"><ArrowRight/></span>
        </Link>
      </div>
    </section>}

    {sectionOn('themes')&&<section className="themes-showcase">
      <div className="themes-decor themes-decor-left"><Leaf/></div>
      <div className="themes-decor themes-decor-right"><Leaf/></div>
      <div className="themes-showcase-inner">
        <header className="themes-showcase-head">
          <div className="themes-showcase-title">
            <div className="themes-eyebrow-row">
              <span className="eyebrow">{themesCopy.eyebrow}</span>
              <i/>
            </div>
            <h2><span>7 chủ đề</span><em>Hòa Lạc</em></h2>
            <span className="themes-title-stroke"/>
          </div>

          <div className="themes-showcase-side">
            <p>{themesCopy.description}</p>
            <Link className="themes-all-link" to="/chu-de">Khám phá 7 chủ đề <ArrowRight size={17}/></Link>
          </div>
        </header>

        <div className="themes-card-grid">
          {themes.map((t,index)=><ThemeCard theme={t} index={index} key={t.id||t.slug}/>)}
        </div>
      </div>
    </section>}

    {sectionOn('colors')&&<section className="color-section color-section-v3">
      <div className="color-v3-contours"/>
      <div className="color-v3-blur color-v3-blur-left"/>
      <div className="color-v3-blur color-v3-blur-right"/>

      <div className="color-v3-top">
        <div className="color-copy">
          <div className="colors-eyebrow-row"><span className="eyebrow">{colorsCopy.eyebrow}</span><i/></div>
          <h2><span>Hòa Lạc trong bạn</span><em>có màu gì?</em></h2>
          <p>{colorsCopy.description}</p>
        </div>

        <div className="color-v3-story">
          <span className="color-v3-script">Hòa Lạc</span>
          <div className="color-v3-window color-v3-window-a"><img src={colorsCopy.storyImagePrimary||colors[0]?.image||themes[0]?.image||img.hills} alt="Phong cảnh Hòa Lạc" loading="lazy" decoding="async"/></div>
          <div className="color-v3-window color-v3-window-b"><img src={colorsCopy.storyImageSecondary||colors[1]?.image||themes[4]?.image||img.lake} alt="Không gian Hòa Lạc" loading="lazy" decoding="async"/></div>
          <div className="color-v3-note"><MapPin/><span>Đá ong<br/>Nắng<br/>Xanh rêu<br/>Be</span><i/></div>
        </div>
      </div>

      <div className="color-v3-cards">
        {colors.map((c,index)=><Link to="/kham-pha" className="color-v3-card" key={c.id||c.slug}>
          <div className="color-v3-card-head"><span className="color-v3-dot" style={{background:c.color}}/><div><b>{c.name}</b><small>{c.story}</small></div><span className="color-v3-arrow"><ArrowRight/></span></div>
          <img src={colorImages[index%colorImages.length]||c.image||img.lake} alt={c.name} loading="lazy" decoding="async"/>
        </Link>)}
      </div>
    </section>}

    {sectionOn('tours')&&<section className="home-tour-section">
      <div className="home-tour-contour"/>
      <div className="home-tour-sun"/>
      <Leaf className="home-tour-leaf home-tour-leaf-left"/>
      <Leaf className="home-tour-leaf home-tour-leaf-right"/>

      <div className="home-tour-inner">
        <header className="home-tour-head">
          <div className="home-tour-title"><span className="eyebrow">{toursCopy.eyebrow}</span><h2>HOLA Tour</h2><span className="home-tour-stroke"/></div>
          <div className="home-tour-desc"><i/><p>{toursCopy.description}</p></div>
        </header>

        <div className="home-tour-grid">
          {tours.map(t => <Link to="/hola-tour" className="home-tour-card" key={t.id||t.no}>
            <div className="home-tour-media">{t.image?<img src={t.image} alt={t.title}/>:<div className="theme-card-placeholder"/>}<span className="home-tour-image-shade"/></div>
            <div className="home-tour-card-body">
              <div className="home-tour-card-top"><span>Hành trình #{t.no}</span><Leaf/></div>
              <h3>{t.title}</h3><span className="home-tour-card-line"/><p>{t.desc}</p>
              <div className="home-tour-date"><CalendarDays/><b>{t.dates}</b></div>
              <div className="home-tour-card-footer"><span>Đi tìm câu chuyện <i>⟶</i></span><b><ArrowRight/></b></div>
            </div>
          </Link>)}
        </div>
      </div>
    </section>}

    {sectionOn('map')&&<section className="map-teaser paper-bg home-map-live-section">
      <div className="container map-teaser-grid home-map-live-grid">
        <div className="home-map-live-copy">
          <span className="eyebrow">{mapCopy.eyebrow}</span>
          <h2>{mapCopy.title}</h2>
          <p>{mapCopy.description}</p>
          <div className="home-map-live-meta"><MapPin size={15}/><span>Địa điểm thật · câu chuyện thật · dữ liệu trực tiếp từ Hola Maps</span></div>
          <Link className="btn btn-green" to="/hola-map"><Map size={17}/> Mở HOLA Map</Link>
        </div>

        <div className="home-map-live-frame">
          {holaMapEmbedUrl
            ? <iframe
                src={holaMapEmbedUrl}
                title="Hola Maps - Bản đồ Hòa Lạc"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            : <div className="home-map-live-loading"><MapPin/><span>Đang tải Hola Maps…</span></div>}
          <div className="home-map-live-badge"><span className="home-map-live-dot"/>LIVE · HOLA MAPS</div>
        </div>
      </div>
    </section>}

    {sectionOn('stories')&&<section className="home-story-showcase">
      <div className="home-story-inner">
        <header className="home-story-head">
          <div className="home-story-title">
            <div className="home-story-eyebrow-row"><span className="eyebrow">{storiesCopy.eyebrow}</span><i/></div>
            <h2>Những góc nhìn <em>đã được kể.</em></h2>
            <p>{storiesCopy.description}</p>
          </div>
          <div className="home-story-head-side">
            <p>Mỗi góc nhìn có thể đến từ cộng đồng, chuyên gia, đối tác hoặc quá trình Ban Biên tập chủ động đi tìm — điều quan trọng là câu chuyện đủ thật và đủ đáng để giữ lại.</p>
            <Link className="home-story-all-link" to="/kham-pha">Xem tất cả góc nhìn <ArrowRight/></Link>
          </div>
        </header>

        <div className="home-story-grid">
          {artworks.length===0&&<div className="home-story-empty">Các góc nhìn đã công bố sẽ xuất hiện tại đây.</div>}
          {artworks.slice(0,5).map(a=><Link to={'/tac-pham/'+a.slug} className="home-story-card" key={a.id||a.slug}>
            <div className="home-story-media">
              {a.image?<img src={a.image} alt={a.title||a.code}/>:<div className="theme-card-placeholder"/>}
              <span className={`home-story-badge ${a.status==='AWARDED'?'awarded':''}`}>{a.status==='AWARDED'?'ĐƯỢC GHI NHẬN':a.status==='TOP52'?'52 GÓC NHÌN':'GÓC NHÌN'}</span>
              <span className="home-story-heart"><Heart/></span>
            </div>
            <div className="home-story-card-body">
              <span className="home-story-category">{a.theme||'Góc nhìn Hòa Lạc'} · {a.location||'Hòa Lạc'}</span>
              <h3>{a.title||a.code}</h3>
              <div className="home-story-author-row">
                <span className="home-story-avatar">{String(a.author||'?').trim().charAt(0)||'?'}</span>
                <b>{a.author||'HALO HOLA Editorial'}</b>
              </div>
              <div className="home-story-card-meta">
                <span><FileText/> {a.type||'Góc nhìn'}</span>
                <span><MapPin/> {a.location||'Hòa Lạc'}</span>
              </div>
            </div>
          </Link>)}
        </div>
      </div>
    </section>}

    <section className="we-banner"><img src={img.sunset} alt="HALO HOLA 2027"/><div className="container we-overlay"><div><span className="eyebrow">WHAT'S NEXT?</span><h2>HALO HOLA 2027 · 52 tuần · 52 câu chuyện Hòa Lạc</h2><p>24.11 là điểm chuyển từ chiến dịch khám phá 2026 sang hành trình kể chuyện đều đặn trong năm 2027. Mỗi tuần một câu chuyện; Calendar là cánh cửa vật lý dẫn trở lại HALO HOLA.</p><Link className="btn btn-green" to="/calendar-2027"><CalendarDays size={17}/> Khám phá Calendar 2027</Link></div><span className="hand-note">Mỗi tuần<br/>một câu chuyện.</span></div></section>

    {sectionOn('community')&&<section className="we-banner"><img src={community.backgroundImage} alt="WE HOLA"/><div className="container we-overlay"><div><span className="eyebrow">{community.eyebrow}</span><h2>{community.title}</h2><p>{community.description}</p><Link className="btn btn-green" to="/we-hola"><HeartHandshake size={17}/> Tham gia WE HOLA</Link></div><span className="hand-note">HALO HOLA kể.<br/>WE HOLA làm.</span></div></section>}
  </main>
}
