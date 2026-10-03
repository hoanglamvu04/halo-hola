import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, Leaf, BookOpen, Users, Sun, Map, HeartHandshake, CalendarDays, Camera, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading.jsx'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { themes, colorStories, tours, artworks, img } from '../data/siteData.js'
import { getCampaignStats, getHomepageContent } from '../services/api.js'

export default function HomePage() {
  const [stats,setStats]=useState({submissions:0,creators:0,locations:0,top52:0})
  const [homepage,setHomepage]=useState({})

  useEffect(()=>{
    getCampaignStats().then(setStats).catch(()=>{})
    getHomepageContent().then(setHomepage).catch(()=>{})
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
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon terra"><BookOpen/></span>
            <div><b>Tri thức</b><small>Nơi ươm mầm tương lai</small></div>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon green"><Users/></span>
            <div><b>Con người</b><small>Những câu chuyện thật</small></div>
          </div>
          <div className="hero-pillar-item">
            <span className="pillar-icon terra"><Sun/></span>
            <div><b>Tương lai</b><small>Một Hòa Lạc đang lớn lên</small></div>
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
            <h2>
              <span>8 chủ đề về</span>
              <em>Hòa Lạc</em>
            </h2>
            <span className="themes-title-stroke"/>
          </div>

          <div className="themes-showcase-side">
            <p>{themesCopy.description}</p>
            <Link className="themes-all-link" to="/chu-de/net-doai">
              Xem tất cả chủ đề <ArrowRight size={17}/>
            </Link>
          </div>
        </header>

        <div className="themes-card-grid">
          {themes.map((t,index) => <Link to={'/chu-de/'+t.slug} className="theme-card theme-card-reference" key={t.id}>
            <div className="theme-card-media">
              <img src={t.image} alt={t.title}/>
              <span className="theme-card-glow"/>
            </div>
            <div className="theme-card-body">
              <div className="theme-card-number">
                <b>{String(index+1).padStart(2,'0')}</b>
                <i/>
              </div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <span className="theme-card-arrow"><ArrowRight/></span>
              <Leaf className="theme-card-leaf"/>
            </div>
          </Link>)}
        </div>
      </div>
    </section>}

    {sectionOn('colors')&&<section className="color-section paper-bg">
      <div className="container color-row"><div><span className="eyebrow">{colorsCopy.eyebrow}</span><h2>{colorsCopy.title}</h2><p>{colorsCopy.description}</p></div><div className="swatches">{colorStories.map(c => <div className="swatch" key={c.name}><span style={{background:c.color}}/><b>{c.name}</b><small>{c.story}</small></div>)}</div></div>
    </section>}

    {sectionOn('tours')&&<section className="section container">
      <SectionHeading eyebrow={toursCopy.eyebrow} title={toursCopy.title} desc={toursCopy.description} />
      <div className="tour-grid">{tours.map(t => <Link to="/hola-tour" className="tour-card" key={t.no}><img src={t.image}/><div><span>Tour #{t.no}</span><h3>{t.title}</h3><p>{t.desc}</p><b>{t.dates}</b></div></Link>)}</div>
    </section>}

    {sectionOn('map')&&<section className="map-teaser paper-bg">
      <div className="container map-teaser-grid"><div><span className="eyebrow">{mapCopy.eyebrow}</span><h2>{mapCopy.title}</h2><p>{mapCopy.description}</p><Link className="btn btn-green" to="/hola-map"><Map size={17}/> Mở HOLA Map</Link></div><div className="fake-map"><div className="map-road r1"/><div className="map-road r2"/><span className="pin p1"><MapPin/></span><span className="pin p2"><MapPin/></span><span className="pin p3"><MapPin/></span><span className="map-label l1">Hồ Đồng Mô</span><span className="map-label l2">Khu CNC Hòa Lạc</span><span className="map-label l3">ĐHQG Hà Nội</span></div><div className="place-preview"><img src={img.lake}/><h3>Hồ Đồng Mô</h3><small>Thiên nhiên · Trải nghiệm</small><p>Một khoảng xanh rộng lớn, điểm hẹn cho những hành trình khám phá Hòa Lạc.</p></div></div>
    </section>}

    {sectionOn('stories')&&<section className="section container">
      <SectionHeading eyebrow={storiesCopy.eyebrow} title={storiesCopy.title} desc={storiesCopy.description} action={<Link className="text-link" to="/top52">Xem TOP52 <ArrowRight size={15}/></Link>} />
      <div className="art-grid compact">{artworks.slice(0,5).map(a => <ArtworkCard key={a.slug} item={a}/>)}</div>
    </section>}

    {sectionOn('community')&&<section className="we-banner"><img src={community.backgroundImage}/><div className="container we-overlay"><div><span className="eyebrow">{community.eyebrow}</span><h2>{community.title}</h2><p>{community.description}</p><Link className="btn btn-green" to="/we-hola"><HeartHandshake size={17}/> Tham gia cộng đồng</Link></div><span className="hand-note">Nhiều góc nhìn<br/>Một cộng đồng<br/>Một Hòa Lạc</span></div></section>}
  </main>
}
