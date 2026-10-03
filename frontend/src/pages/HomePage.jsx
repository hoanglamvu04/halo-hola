import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, Leaf, BookOpen, Users, Sun, Map, HeartHandshake, CalendarDays, Camera, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading.jsx'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { themes, colorStories, tours, artworks, img } from '../data/siteData.js'
import { getCampaignStats } from '../services/api.js'

export default function HomePage() {
  const [stats,setStats]=useState({submissions:0,creators:0,locations:0,top52:0})

  useEffect(()=>{
    getCampaignStats().then(setStats).catch(()=>{})
  },[])

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
    <section className="home-hero paper-bg">
      <div className="container home-hero-grid">
        <div className="home-hero-copy">
          <span className="eyebrow">NƠI NHỮNG CÂU CHUYỆN HÒA LẠC ĐƯỢC KỂ LẠI</span>
          <h1>HELLO<br/><em>HÒA LẠC</em></h1>
          <h3>52 góc nhìn · 1 Hòa Lạc</h3>
          <p>Mỗi tuần một góc nhìn. Mỗi góc nhìn một câu chuyện.</p>
          <div className="actions"><Link to="/top52" className="btn btn-green">Khám phá chương trình <ArrowRight size={17}/></Link><Link to="/hola-map" className="btn btn-outline"><MapPin size={17}/> Xem HOLA Map</Link></div>
          <div className="pillar-row">
            <div><Leaf/><b>Thiên nhiên</b><small>Màu xanh bền vững</small></div>
            <div><BookOpen/><b>Tri thức</b><small>Nơi ươm mầm tương lai</small></div>
            <div><Users/><b>Con người</b><small>Những câu chuyện thật</small></div>
            <div><Sun/><b>Tương lai</b><small>Một Hòa Lạc đang lớn lên</small></div>
          </div>
        </div>
        <div className="hero-collage">
          <img className="hero-main-img" src={img.lake} alt="Hòa Lạc"/>
          <img className="hero-float hero-float-a" src={img.architecture} alt="Kiến trúc Hòa Lạc"/>
          <img className="hero-float hero-float-b" src={img.people} alt="Con người Hòa Lạc"/>
          <div className="hero-stone">HÒA LẠC<br/><span>NƠI NHỮNG ƯỚC MƠ BẮT ĐẦU</span></div>
          <span className="hand-note home-note">Hòa Lạc<br/>Hôm nay<br/>và mai sau...</span>
        </div>
      </div>
    </section>

    <section className="campaign-live">
      <div className="campaign-live-grid">
        <div className="live-counter">
          <div className="campaign-kicker"><span className="eyebrow">HALO HOLA ĐANG DIỄN RA</span><i/></div>
          <h2>Mỗi ngày thêm<br/>một góc nhìn mới.</h2>
          <span className="campaign-accent-line"/>
          <p className="campaign-desc">Cùng nhau khám phá, chia sẻ và lưu giữ những câu chuyện, địa điểm và tác phẩm đặc biệt về Hòa Lạc qua lăng kính cộng đồng.</p>

          <div className="live-stats">
            <div className="live-stat stat-camera"><Camera/><b>{stats.submissions}</b><small>Góc nhìn đã gửi</small></div>
            <div className="live-stat stat-people"><Users/><b>{stats.creators}</b><small>Người kể chuyện</small></div>
            <div className="live-stat stat-place"><MapPin/><b>{stats.locations}</b><small>Địa điểm được ghi lại</small></div>
            <div className="live-stat stat-top52"><FileText/><b>{stats.top52}</b><small>Tác phẩm TOP52</small></div>
          </div>

          <Link className="campaign-cta" to="/gui-goc-nhin">Gửi góc nhìn <ArrowRight size={22}/></Link>
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
          <img className="campaign-visual-bg" src={img.sunset} alt="Phong cảnh Hòa Lạc"/>
          <div className="campaign-visual-shade"/>
          <div className="campaign-place-sign"><MapPin/><span>Hòa Lạc</span></div>

          <div className="campaign-polaroid polaroid-discover">
            <img src={img.hills} alt="Khám phá Hòa Lạc"/>
            <span>Khám phá</span>
          </div>
          <div className="campaign-polaroid polaroid-keep">
            <img src={img.architecture} alt="Lưu giữ Hòa Lạc"/>
            <span>Lưu giữ</span>
          </div>
          <div className="campaign-polaroid polaroid-share">
            <img src={img.student} alt="Chia sẻ Hòa Lạc"/>
            <span>Chia sẻ</span>
          </div>
        </div>
      </div>
    </section>

    <section className="change-band">
      <div className="container change-grid">
        <div className="change-copy"><h2>Hòa Lạc đang thay đổi</h2><p>Từ Xứ Đoài trầm tích, làng xóm yên bình và những viên đá ong mộc mạc, Hòa Lạc hôm nay đang vươn mình thành trung tâm tri thức, công nghệ và đổi mới sáng tạo.</p><Link to="/stories" className="text-link">Xem câu chuyện hành trình <ArrowRight size={16}/></Link></div>
        <div className="era-card"><img src={img.village}/><span><b>Cội nguồn</b><small>Xứ Đoài · Làng xóm · Đá ong</small></span></div>
        <div className="era-card"><img src={img.student}/><span><b>Hôm nay</b><small>Tri thức · Kiến trúc · Con người</small></span></div>
        <div className="era-card"><img src={img.architecture}/><span><b>Tương lai</b><small>Đô thị sáng tạo · Kết nối</small></span></div>
      </div>
    </section>

    <section className="section container">
      <SectionHeading eyebrow="KHÁM PHÁ ĐA DẠNG GÓC NHÌN" title="8 chủ đề về Hòa Lạc" desc="Tám mảnh ghép, một bức tranh Hòa Lạc đa sắc. Khám phá những câu chuyện và vẻ đẹp riêng qua 8 chủ đề." action={<Link className="text-link" to="/chu-de/net-doai">Xem tất cả chủ đề <ArrowRight size={15}/></Link>} />
      <div className="theme-grid">{themes.map(t => <Link to={`/chu-de/${t.slug}`} className="theme-card" key={t.id}><img src={t.image}/><div><h3>{t.title}</h3><p>{t.desc}</p><span>↗</span></div></Link>)}</div>
    </section>

    <section className="color-section paper-bg">
      <div className="container color-row"><div><span className="eyebrow">SẮC MÀU HÒA LẠC</span><h2>Hòa Lạc trong bạn có màu gì?</h2><p>Mỗi màu sắc là một lát cắt của Hòa Lạc. Cùng khám phá và tạo nên sắc màu của riêng bạn.</p></div><div className="swatches">{colorStories.map(c => <div className="swatch" key={c.name}><span style={{background:c.color}}/><b>{c.name}</b><small>{c.story}</small></div>)}</div></div>
    </section>

    <section className="section container">
      <SectionHeading eyebrow="CÙNG ĐI · CÙNG CẢM · CÙNG KỂ CHUYỆN" title="HOLA Tour" desc="Những hành trình khám phá Hòa Lạc qua trải nghiệm thực tế và những câu chuyện sống động." />
      <div className="tour-grid">{tours.map(t => <Link to="/hola-tour" className="tour-card" key={t.no}><img src={t.image}/><div><span>Tour #{t.no}</span><h3>{t.title}</h3><p>{t.desc}</p><b>{t.dates}</b></div></Link>)}</div>
    </section>

    <section className="map-teaser paper-bg">
      <div className="container map-teaser-grid"><div><span className="eyebrow">KHÁM PHÁ MỌI HÒA LẠC</span><h2>HOLA Map</h2><p>Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ tương tác.</p><Link className="btn btn-green" to="/hola-map"><Map size={17}/> Mở HOLA Map</Link></div><div className="fake-map"><div className="map-road r1"/><div className="map-road r2"/><span className="pin p1"><MapPin/></span><span className="pin p2"><MapPin/></span><span className="pin p3"><MapPin/></span><span className="map-label l1">Hồ Đồng Mô</span><span className="map-label l2">Khu CNC Hòa Lạc</span><span className="map-label l3">ĐHQG Hà Nội</span></div><div className="place-preview"><img src={img.lake}/><h3>Hồ Đồng Mô</h3><small>Thiên nhiên · Trải nghiệm</small><p>Một khoảng xanh rộng lớn, điểm hẹn cho những hành trình khám phá Hòa Lạc.</p></div></div>
    </section>

    <section className="section container">
      <SectionHeading eyebrow="NHỮNG CÂU CHUYỆN TRUYỀN CẢM HỨNG" title="TOP52 / Stories" desc="52 góc nhìn, 52 câu chuyện về Hòa Lạc qua lăng kính cộng đồng." action={<Link className="text-link" to="/top52">Xem TOP52 <ArrowRight size={15}/></Link>} />
      <div className="art-grid compact">{artworks.slice(0,5).map(a => <ArtworkCard key={a.slug} item={a}/>)}</div>
    </section>

    <section className="we-banner"><img src={img.people}/><div className="container we-overlay"><div><span className="eyebrow">CỘNG ĐỒNG · KẾT NỐI · HÀNH ĐỘNG</span><h2>WE HOLA – Chúng ta là Hòa Lạc</h2><p>Cùng nhau kể chuyện, lan tỏa giá trị, chung tay làm Hòa Lạc xanh hơn, đẹp hơn và giàu bản sắc hơn.</p><Link className="btn btn-green" to="/we-hola"><HeartHandshake size={17}/> Tham gia cộng đồng</Link></div><span className="hand-note">Nhiều góc nhìn<br/>Một cộng đồng<br/>Một Hòa Lạc</span></div></section>
  </main>
}
