import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, MapPin, Leaf, BookOpen, Users, Sun, Map, HeartHandshake, CalendarDays, Camera, FileText, Heart, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { img } from '../data/siteData.js'
import { getCampaignStats, getHomepageContent, getThemes, getColors, getTours, getPublicArtworks } from '../services/api.js'
import { getHolaMapConfig } from '../services/holaMapsApi.js'
import { normalizeTour } from '../utils/contentAdapters.js'

export default function HomePage() {
  const [stats,setStats]=useState({submissions:0,creators:0,locations:0,top52:0})
  const [homepage,setHomepage]=useState({})
  const [themes,setThemes]=useState([])
  const [colors,setColors]=useState([])
  const [tours,setTours]=useState([])
  const [holaMapEmbedUrl,setHolaMapEmbedUrl]=useState('')
  const [artworks,setArtworks]=useState([])

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
    eyebrow:'NƠI NHỮNG CÂU CHUYỆN HÒA LẠC ĐƯỢC KỂ LẠI',
    titleLine1:'HELLO',
    titleAccent:'HÒA LẠC',
    tagline:'52 góc nhìn · 1 Hòa Lạc',
    description:'Mỗi tuần một góc nhìn. Mỗi góc nhìn một câu chuyện.',
    mainImage:img.lake,
    floatImageA:img.architecture,
    floatImageB:img.people
  })
  const campaign=sectionData('campaign',{
    eyebrow:'HALO HOLA ĐANG DIỄN RA',
    title:'Mỗi ngày thêm một góc nhìn mới.',
    description:'Cùng nhau khám phá, chia sẻ và lưu giữ những câu chuyện, địa điểm và tác phẩm đặc biệt về Hòa Lạc qua lăng kính cộng đồng.',
    ctaText:'Gửi góc nhìn',
    backgroundImage:img.sunset,
    discoverImage:img.hills,
    keepImage:img.architecture,
    shareImage:img.student
  })
  const change=sectionData('change',{
    title:'Hòa Lạc đang thay đổi',
    description:'Từ Xứ Đoài trầm tích, làng xóm yên bình và những viên đá ong mộc mạc, Hòa Lạc hôm nay đang vươn mình thành trung tâm tri thức, công nghệ và đổi mới sáng tạo.',
    image1:img.village,
    image2:img.student,
    image3:img.architecture
  })
  const themesCopy=sectionData('themes',{eyebrow:'KHÁM PHÁ ĐA DẠNG GÓC NHÌN',title:'8 chủ đề về Hòa Lạc',description:'Tám mảnh ghép, một bức tranh Hòa Lạc đa sắc. Khám phá những câu chuyện và vẻ đẹp riêng qua 8 chủ đề.'})
  const colorsCopy=sectionData('colors',{eyebrow:'SẮC MÀU HÒA LẠC',title:'Hòa Lạc trong bạn có màu gì?',description:'Mỗi màu sắc là một lát cắt của Hòa Lạc. Cùng khám phá và tạo nên sắc màu của riêng bạn.'})
  const toursCopy=sectionData('tours',{eyebrow:'CÙNG ĐI · CÙNG CẢM · CÙNG KỂ CHUYỆN',title:'HOLA Tour',description:'Những hành trình khám phá Hòa Lạc qua trải nghiệm thực tế và những câu chuyện sống động.'})
  const mapCopy=sectionData('map',{eyebrow:'KHÁM PHÁ MỌI HÒA LẠC',title:'HOLA Map',description:'Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ tương tác.'})
  const storiesCopy=sectionData('stories',{eyebrow:'NHỮNG CÂU CHUYỆN TRUYỀN CẢM HỨNG',title:'TOP52 / Stories',description:'52 góc nhìn, 52 câu chuyện về Hòa Lạc qua lăng kính cộng đồng.'})
  const community=sectionData('community',{
    eyebrow:'CỘNG ĐỒNG · KẾT NỐI · HÀNH ĐỘNG',
    title:'WE HOLA – Chúng ta là Hòa Lạc',
    description:'Cùng nhau kể chuyện, lan tỏa giá trị, chung tay làm Hòa Lạc xanh hơn, đẹp hơn và giàu bản sắc hơn.',
    backgroundImage:img.people
  })

  const colorImages=[img.village,img.sunset,img.green,img.architecture,img.village,img.lake]

  const milestones=[
    ['10.10','Mở nhận tác phẩm'],
    ['17.10','HOLA Tour #01'],
    ['24.10','HOLA Tour #02'],
    ['31.10','HOLA Tour #03'],
    ['10.11','Đóng nhận tác phẩm'],
    ['18.11','Công bố TOP52'],
    ['28.11','HOLA DAY']
  ]

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
            <Link to="/top52" className="btn btn-green">Khám phá chương trình <ArrowRight size={17}/></Link>
            <Link to="/hola-map" className="btn btn-outline"><MapPin size={17}/> Xem HOLA Map</Link>
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

          <div className="hero-float hero-float-a"><img src={hero.floatImageA} alt="Kiến trúc Hòa Lạc"/></div>
          <div className="hero-float hero-float-b"><img src={hero.floatImageB} alt="Con người Hòa Lạc"/></div>

          <div className="hero-stone">
            <b>HÒA LẠC</b>
            <span>NƠI NHỮNG ƯỚC MƠ BẮT ĐẦU</span>
            <i/>
          </div>

          <span className="hand-note home-note">Hòa Lạc<br/>hôm nay<br/>và mai sau...</span>
        </div>

        <div className="hero-pillar-band">
          <div className="hero-pillar-item">
            <span className="pillar-icon green"><Leaf/></span>
            <div><b>Thiên nhiên</b><small>Màu xanh bền vững</small></div>
            <ArrowRight className="mobile-pillar-arrow"/>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon terra"><BookOpen/></span>
            <div><b>Tri thức</b><small>Nơi ươm mầm tương lai</small></div>
            <ArrowRight className="mobile-pillar-arrow"/>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon green"><Users/></span>
            <div><b>Con người</b><small>Những câu chuyện thật</small></div>
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

    {sectionOn('campaign')&&<section className="campaign-live">
      <div className="campaign-live-grid">
        <div className="live-counter">
          <div className="campaign-kicker"><span className="eyebrow">{campaign.eyebrow}</span><i/></div>
          <h2>{campaign.title}</h2>
          <span className="campaign-accent-line"/>
          <p className="campaign-desc">{campaign.description}</p>
          <div className="live-stats">
            <div className="live-stat stat-camera"><Camera/><b>{stats.submissions}</b><small>Góc nhìn đã gửi</small></div>
            <div className="live-stat stat-people"><Users/><b>{stats.creators}</b><small>Người kể chuyện</small></div>
            <div className="live-stat stat-place"><MapPin/><b>{stats.locations}</b><small>Địa điểm được ghi lại</small></div>
            <div className="live-stat stat-top52"><FileText/><b>{stats.top52}</b><small>Tác phẩm TOP52</small></div>
          </div>
          <Link className="campaign-cta" to="/gui-goc-nhin">{campaign.ctaText} <ArrowRight size={22}/></Link>
          <div className="campaign-signature">52 góc nhìn · 1 Hòa Lạc · cùng nhau lưu giữ một vùng đất đang chuyển mình</div>
        </div>

        <div className="campaign-timeline">
          <div className="timeline-title"><CalendarDays/><b>Hành trình 2026</b></div>
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
            <span>Khám phá</span>
          </div>

          <div className="campaign-photo-secondary">
            <img src={campaign.keepImage} alt="Lưu giữ Hòa Lạc"/>
            <span>Lưu giữ</span>
          </div>

          <div className="campaign-note-card">
            <img src={campaign.shareImage} alt="Chia sẻ Hòa Lạc"/>
            <div>
              <small>Góc nhìn cộng đồng</small>
              <b>Chia sẻ một Hòa Lạc đang chuyển mình</b>
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
            <span className="eyebrow">HÒA LẠC – HÀNH TRÌNH KIẾN TẠO TƯƠNG LAI</span>
            <i/>
          </div>
          <h2>{change.title}</h2>
          <p>{change.description}</p>
          <Link to="/stories" className="change-cta">Xem câu chuyện hành trình <ArrowRight size={17}/></Link>
        </div>

        <Link to="/stories" className="era-card era-card-reference">
          <img src={change.image1} alt="Cội nguồn Hòa Lạc"/>
          <div className="era-shade"/>
          <span className="era-content">
            <b>Cội nguồn</b>
            <i/>
            <small>Xứ Đoài · Làng xóm · Đá ong</small>
          </span>
          <span className="era-arrow"><ArrowRight/></span>
        </Link>

        <Link to="/stories" className="era-card era-card-reference">
          <img src={change.image2} alt="Hòa Lạc hôm nay"/>
          <div className="era-shade"/>
          <span className="era-content">
            <b>Hôm nay</b>
            <i/>
            <small>Tri thức · Kiến trúc · Con người</small>
          </span>
          <span className="era-arrow"><ArrowRight/></span>
        </Link>

        <Link to="/stories" className="era-card era-card-reference">
          <img src={change.image3} alt="Tương lai Hòa Lạc"/>
          <div className="era-shade"/>
          <span className="era-content">
            <b>Tương lai</b>
            <i/>
            <small>Đô thị sáng tạo · Kết nối</small>
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
            <h2><span>8 chủ đề về</span><em>Hòa Lạc</em></h2>
            <span className="themes-title-stroke"/>
          </div>

          <div className="themes-showcase-side">
            <p>{themesCopy.description}</p>
            <Link className="themes-all-link" to="/chu-de">Xem tất cả chủ đề <ArrowRight size={17}/></Link>
          </div>
        </header>

        <div className="themes-card-grid">
          {themes.map((t,index) => <Link to={'/chu-de/'+t.slug} className="theme-card theme-card-reference" key={t.id||t.slug}>
            <div className="theme-card-media">
              {t.image?<img src={t.image} alt={t.title}/>:<div className="theme-card-placeholder"/>}
              <span className="theme-card-glow"/>
            </div>
            <div className="theme-card-body">
              <div className="theme-card-number"><b>{String(t.id||index+1).padStart(2,'0')}</b><i/></div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <span className="theme-card-arrow"><ArrowRight/></span>
              <Leaf className="theme-card-leaf"/>
            </div>
          </Link>)}
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
          <div className="color-v3-window color-v3-window-a"><img src={colors[0]?.image||themes[0]?.image||img.hills} alt="Phong cảnh Hòa Lạc"/></div>
          <div className="color-v3-window color-v3-window-b"><img src={colors[1]?.image||themes[4]?.image||img.lake} alt="Không gian Hòa Lạc"/></div>
          <div className="color-v3-note"><MapPin/><span>Thiên nhiên<br/>Con người<br/>Trí thức<br/>Đổi mới</span><i/></div>
        </div>
      </div>

      <div className="color-v3-cards">
        {colors.map((c,index)=><Link to="/chu-de/sac-mau" className="color-v3-card" key={c.id||c.slug}>
          <div className="color-v3-card-head"><span className="color-v3-dot" style={{background:c.color}}/><div><b>{c.name}</b><small>{c.story}</small></div><span className="color-v3-arrow"><ArrowRight/></span></div>
          <img src={c.image||colorImages[index%colorImages.length]} alt={c.name}/>
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
              <div className="home-tour-card-top"><span>Tour #{t.no}</span><Leaf/></div>
              <h3>{t.title}</h3><span className="home-tour-card-line"/><p>{t.desc}</p>
              <div className="home-tour-date"><CalendarDays/><b>{t.dates}</b></div>
              <div className="home-tour-card-footer"><span>Khám phá tour <i>⟶</i></span><b><ArrowRight/></b></div>
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
          <div className="home-map-live-meta"><MapPin size={15}/><span>Địa điểm thật · dữ liệu trực tiếp từ Hola Maps</span></div>
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

    {sectionOn('stories')&&<section className="top52-showcase">
      <div className="top52-contours"/>
      <div className="top52-blur top52-blur-right"/>
      <div className="top52-inner">
        <header className="top52-head">
          <div className="top52-title-block"><div className="top52-eyebrow-row"><span className="eyebrow">{storiesCopy.eyebrow}</span><i/></div><h2>TOP52 <span>/ Stories</span></h2><p>{storiesCopy.description}</p></div>
          <div className="top52-head-side"><p>Những con người, địa điểm và trải nghiệm chân thật tạo nên một Hòa Lạc đầy màu sắc, đang đổi mới mỗi ngày.</p><Link className="top52-all-link" to="/top52">Xem tất cả TOP52 <ArrowRight/></Link></div>
          <div className="top52-nav"><Link to="/top52" aria-label="Xem TOP52"><ArrowLeft/></Link><Link to="/top52" className="active" aria-label="Xem tất cả TOP52"><ArrowRight/></Link></div>
        </header>

        <div className="top52-card-grid">
          {artworks.slice(0,5).map(a=><Link to={'/tac-pham/'+a.slug} className="top52-card" key={a.id||a.slug}>
            <div className="top52-card-media">{a.image?<img src={a.image} alt={a.title||a.code}/>:<div className="theme-card-placeholder"/>}<span className="top52-badge">{a.status==='AWARDED'?'ĐẠT GIẢI':'TOP52'}</span><span className="top52-heart"><Heart/></span></div>
            <div className="top52-card-body">
              <span className="top52-category">{a.theme} · {a.location}</span>
              <h3>{a.title||a.code}</h3>
              <p><b>{a.author}</b><br/>{a.story?.slice(0,90)}{a.story?.length>90?'…':''}</p>
              <div className="top52-card-meta"><span><Eye/> {Number(a.juryScore||0).toFixed(1)} điểm BGK</span><i/><span className="top52-author">{a.image&&<img src={a.image} alt=""/>}{a.author}</span></div>
            </div>
          </Link>)}
        </div>
      </div>
    </section>}

    {sectionOn('community')&&<section className="we-banner"><img src={community.backgroundImage}/><div className="container we-overlay"><div><span className="eyebrow">{community.eyebrow}</span><h2>{community.title}</h2><p>{community.description}</p><Link className="btn btn-green" to="/we-hola"><HeartHandshake size={17}/> Tham gia cộng đồng</Link></div><span className="hand-note">Nhiều góc nhìn<br/>Một cộng đồng<br/>Một Hòa Lạc</span></div></section>}
  </main>
}
