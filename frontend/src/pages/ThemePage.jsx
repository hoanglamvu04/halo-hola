import { useParams, Link } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, MapPin, Users, BookOpen, Eye, Play,
  Grid2X2, Landmark, Trees, Building2, Image as ImageIcon, Heart
} from 'lucide-react'
import { themes, artworks } from '../data/siteData.js'

const themeMeta = {
  'net-doai': {
    location: 'Thạch Hòa',
    intro: 'Khám phá những dấu ấn Xứ Đoài qua những câu chuyện đời sống, làng xóm, kiến trúc, tập tục và con người Hòa Lạc – nơi quá khứ, hiện tại và tương lai cùng giao hòa.'
  },
  'sac-muong': {
    location: 'Hòa Lạc',
    intro: 'Đi sâu vào đời sống, bản sắc và những lớp văn hóa Mường còn hiện diện trong con người, ký ức và nhịp sống Hòa Lạc hôm nay.'
  },
  'kien-truc': {
    location: 'Khu CNC Hòa Lạc',
    intro: 'Quan sát cách kiến trúc, cảnh quan và không gian sống đang tạo nên diện mạo mới của Hòa Lạc mà vẫn đối thoại với thiên nhiên và con người.'
  },
  'hoa-lac-xanh': {
    location: 'Tiến Xuân',
    intro: 'Khám phá những khoảng xanh, mặt nước, triền đồi và cách con người đang gìn giữ một Hòa Lạc phát triển bền vững.'
  },
  'nang-hoa-lac': {
    location: 'Phía Tây Hòa Lạc',
    intro: 'Theo ánh sáng để kể về Hòa Lạc: nắng sớm, chiều vàng, những triền đồi và khoảnh khắc cảm xúc của vùng đất phía Tây.'
  },
  'cau-chuyen': {
    location: 'Hòa Lạc',
    intro: 'Những ký ức, lát cắt đời sống và câu chuyện nhỏ giúp Hòa Lạc hiện ra gần gũi, chân thật và nhiều chiều hơn.'
  },
  'uoc-mo': {
    location: 'ĐHQG Hà Nội',
    intro: 'Nhìn Hòa Lạc qua góc nhìn của học sinh, sinh viên và người trẻ – những người đang học tập, sáng tạo và hình dung về tương lai nơi đây.'
  },
  'sac-mau': {
    location: 'Hòa Lạc',
    intro: 'Sáu sắc màu đại diện cho thiên nhiên, vật liệu, ánh sáng, tri thức và chuyển động mới của Hòa Lạc.'
  }
}

export default function ThemePage(){
  const {slug}=useParams()
  const theme=themes.find(t=>t.slug===slug)||themes[0]
  const meta=themeMeta[theme.slug]||themeMeta['net-doai']

  const related=[...artworks]
    .sort((a,b)=>{
      const aMatch=(a.theme||'').toLowerCase().includes(theme.title.split(' ')[0].toLowerCase())?1:0
      const bMatch=(b.theme||'').toLowerCase().includes(theme.title.split(' ')[0].toLowerCase())?1:0
      return bMatch-aMatch
    })
    .slice(0,5)

  return <main className="theme-page-ref">
    <section className="theme-hero-ref">
      <div className="theme-hero-contours"/>
      <div className="theme-hero-leaf"/>
      <div className="theme-hero-inner">
        <div className="theme-hero-copy">
          <div className="theme-kicker"><span>CHỦ ĐỀ {String(theme.id).padStart(2,'0')}</span><i/></div>
          <h1>{theme.title}</h1>
          <h3>{theme.desc}</h3>
          <p>{meta.intro}</p>

          <div className="theme-hero-actions">
            <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi tác phẩm <ArrowRight size={17}/></Link>
            <a className="theme-explore-link" href="#kham-pha"><span><Play/></span>Khám phá chủ đề</a>
          </div>

          <div className="theme-hero-stats">
            <div><span><Users/></span><b>52+</b><small>Góc nhìn cộng đồng</small></div>
            <div><span><BookOpen/></span><b>Câu chuyện</b><small>Về một Hòa Lạc rất riêng</small></div>
            <div><span><Trees/></span><b>Di sản</b><small>Vẫn đang tiếp nối</small></div>
          </div>
        </div>

        <div className="theme-hero-visual">
          <div className="theme-hero-image-wrap"><img src={theme.image} alt={theme.title}/></div>
          <div className="theme-location-card"><MapPin/><div><b>{meta.location}</b><small>HÒA LẠC, HÀ NỘI</small></div></div>
          <div className="theme-hero-note">Hòa Lạc<br/>hôm nay<br/>và mai sau...<i/></div>
          <div className="theme-postmark">XỨ ĐOÀI<br/>HÒA LẠC</div>
        </div>
      </div>
    </section>

    <section id="kham-pha" className="theme-story-ref">
      <div className="theme-story-inner">
        <div className="theme-story-copy">
          <div className="theme-kicker"><span>GỢI Ý KHÁM PHÁ</span><i/></div>
          <h2>Nhìn Hòa Lạc qua một lớp câu chuyện riêng</h2>
          <p>Mỗi chủ đề mở ra những góc nhìn từ con người, không gian, ký ức và sự chuyển mình của vùng đất. Người tham gia có thể tiếp cận bằng ảnh, video, story hoặc art &amp; design theo thể lệ.</p>
        </div>

        <div className="theme-tip-panel">
          <div className="theme-tip-head"><i/><div><h3>Gợi ý góc nhìn</h3><p>Đi chậm, quan sát và cảm nhận. Hãy bắt đầu từ những điều gần gũi nhất quanh bạn.</p></div></div>
          <div className="theme-tip-list">
            <div><span><Eye/></span><div><b>Quan sát chi tiết</b><small>Những điều nhỏ bé tạo nên bản sắc Hòa Lạc.</small></div></div>
            <div><span><Users/></span><div><b>Trò chuyện với người địa phương</b><small>Lắng nghe câu chuyện từ những người gắn bó với vùng đất này.</small></div></div>
            <div><span><ImageIcon/></span><div><b>Ghi lại không khí</b><small>Nhịp sống, thiên nhiên, không gian và sự thay đổi qua thời gian.</small></div></div>
            <div><span><BookOpen/></span><div><b>Tìm dấu ấn ký ức</b><small>Những ký ức, câu chuyện xưa và nay của Hòa Lạc.</small></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="theme-related-ref">
      <div className="theme-related-inner">
        <header className="theme-related-head">
          <div>
            <div className="theme-kicker"><span>CÁC BÀI VIẾT &amp; CÂU CHUYỆN KHÁC</span><i/></div>
            <h2>Tác phẩm liên quan</h2>
            <p>Những góc nhìn gần với tinh thần của chủ đề này.</p>
          </div>
          <div className="theme-related-actions">
            <Link className="theme-view-all" to="/top52">Xem tất cả <ArrowRight/></Link>
            <div className="theme-related-nav"><button><ArrowLeft/></button><button className="active"><ArrowRight/></button></div>
          </div>
        </header>

        <div className="theme-filter-row">
          <button className="active"><Grid2X2/>Tất cả</button>
          <button><Landmark/>Văn hóa - Lịch sử</button>
          <button><Trees/>Thiên nhiên</button>
          <button><Users/>Con người</button>
          <button><Building2/>Kiến trúc</button>
        </div>

        <div className="theme-related-grid">
          {related.map(a=><Link to={'/tac-pham/'+a.slug} className="theme-related-card" key={a.slug}>
            <div className="theme-related-media">
              <img src={a.image} alt={a.title}/>
              <span className="theme-top52-badge">TOP52</span>
              <span className="theme-related-heart"><Heart/></span>
            </div>
            <div className="theme-related-body">
              <span className="theme-related-category">{a.theme} · {a.location}</span>
              <h3>{a.title}</h3>
              <div className="theme-related-author"><span className="theme-related-avatar">{a.author?.charAt(0)}</span><b>{a.author}</b></div>
              <div className="theme-related-meta"><span><Eye/> {a.views}</span><i/><span><MapPin/> {a.location}</span></div>
            </div>
          </Link>)}
        </div>
      </div>
    </section>
  </main>
}
