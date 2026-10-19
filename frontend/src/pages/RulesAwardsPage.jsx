import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Camera, ExternalLink, FileText, MapPin, MessageCircle, ShieldCheck, Users, Video } from 'lucide-react'
import { getSiteSettings } from '../services/api.js'
import '../styles/rules-awards-document-v4.css'
import '../styles/rules-awards-document-v5.css'
import '../styles/rules-awards-desktop-reading.css'

const NAV=[
  ['I.','HALO HOLA đang tìm gì','tim-gi'],
  ['II.','Ai có thể đóng góp','tham-gia'],
  ['III.','7 mạch nội dung','mach-noi-dung'],
  ['IV.','Gửi một góc nhìn','gui-goc-nhin'],
  ['V.','Ban Biên tập làm gì','bien-tap'],
  ['VI.','Quyền nội dung','quyen'],
  ['VII.','Hành trình đến HOLA DAY','hanh-trinh']
]

const streams=[
  ['01','Bản sắc','Xứ Đoài · văn hóa Mường · đá ong · làng · phong tục · nghề · ký ức'],
  ['02','Thiên nhiên','Ba Vì · hồ · rừng · cây xanh · địa hình · khí hậu · cảnh quan'],
  ['03','Không gian','Kiến trúc · nhà ở · làng · campus · công trình · không gian công cộng · đô thị mới'],
  ['04','Con người','Người bản địa · người mới đến · người trẻ · chuyên gia · doanh nhân · KTS · công nhân · sinh viên · trẻ em'],
  ['05','Tri thức & Công nghệ','Đại học · nghiên cứu · công nghệ cao · startup · phòng lab · những người tạo nên Hòa Lạc mới'],
  ['06','Đời sống & Cảm xúc','Ẩm thực · café · chợ · thể thao · vui chơi · buổi sáng · hoàng hôn · nắng · khoảnh khắc đời thường'],
  ['07','Tương lai','Quy hoạch · đô thị · kiến trúc · môi trường · công nghệ · giáo dục · mong muốn và ý tưởng']
]

export default function RulesAwardsPage(){
  const [config,setConfig]=useState({})

  useEffect(()=>{
    let alive=true
    getSiteSettings().then(settings=>{if(alive)setConfig(settings?.rulesAwards||{})}).catch(()=>{})
    return()=>{alive=false}
  },[])

  const pageTitle=config.title||'Cách đóng góp cho HALO HOLA 2026'
  const intro=config.intro||'Bạn biết một người, một nơi hay một câu chuyện về Hòa Lạc đáng được kể? Hãy gửi một góc nhìn hoặc giới thiệu đầu mối để Ban Biên tập tiếp tục tìm hiểu.'
  const officialPdfUrl=(config.officialPdfUrl||'').trim()

  return <main className="rules4-page">
    <section className="rules4-hero">
      <div className="container rules4-hero-inner">
        <div>
          <span className="rules4-kicker">CHƯƠNG TRÌNH SÁNG TẠO CỘNG ĐỒNG · HALO HOLA 2026</span>
          <h1>{pageTitle}</h1>
          <p>{intro}</p>
          <div className="rules4-hero-actions">
            <Link className="btn btn-green" to="/gui-goc-nhin">Gửi một góc nhìn <ArrowRight/></Link>
            <a className="btn btn-outline" href="#tim-gi">Hiểu cách chương trình vận hành</a>
            {officialPdfUrl&&<a className="btn btn-outline" href={officialPdfUrl} target="_blank" rel="noreferrer"><FileText/> Tài liệu chương trình <ExternalLink/></a>}
          </div>
        </div>
        <div className="rules4-hero-meta" aria-label="Thông tin nhanh">
          <div><span>Mục tiêu 2026</span><b>52 góc nhìn</b></div>
          <div><span>Ngày hội công bố</span><b>24.11 · HOLA DAY</b></div>
          <div><span>Tinh thần</span><b>Đi · gặp · nghe · kể</b></div>
        </div>
      </div>
    </section>

    <div className="rules4-wrap">
      <div className="container rules4-layout">
        <aside className="rules4-sidebar" aria-label="Mục lục cách đóng góp">
          <div className="rules4-sidebar-card">
            <div className="rules4-sidebar-head"><span>Mục lục</span><b>Gửi một góc nhìn về Hòa Lạc</b></div>
            <nav className="rules4-nav">{NAV.map(([roman,label,id])=><a key={id} href={'#'+id}><span>{roman}</span>{label}</a>)}</nav>
            <div className="rules4-sidebar-foot">Không tìm người thắng. Tìm những câu chuyện đáng được giữ lại.</div>
          </div>
        </aside>

        <article className="rules4-paper">
          <header className="rules4-paper-head">
            <div><span>HALO HOLA 2026</span><h2>Hướng dẫn tham gia hành trình tìm Hòa Lạc</h2></div>
            <div className="rules4-paper-stamp"><strong>52 góc nhìn</strong><small>1 Hòa Lạc</small></div>
          </header>

          <section id="tim-gi" className="rules4-section">
            <div className="rules4-roman">I.</div>
            <div>
              <span className="rules4-section-kicker">Chúng ta đi tìm Hòa Lạc</span>
              <h3>Một góc nhìn không nhất thiết là một bức ảnh</h3>
              <p className="rules4-lead">Một góc nhìn có thể là một con người, một nơi, một công trình, một ký ức, một món ăn, một nghề, một video, một bức tranh, một khoảnh khắc, một câu nói hoặc một ý tưởng về Hòa Lạc tương lai.</p>
              <dl className="rules4-facts">
                <div className="rules4-fact"><Users/><dt>Con người</dt><dd>Ai đang tạo nên Hòa Lạc hôm nay?</dd></div>
                <div className="rules4-fact"><MapPin/><dt>Nơi chốn</dt><dd>Điều gì đáng nhớ, đang đổi thay hoặc có nguy cơ biến mất?</dd></div>
                <div className="rules4-fact"><BookOpen/><dt>Câu chuyện</dt><dd>Điều gì đáng được lưu giữ và kể tiếp?</dd></div>
              </dl>
            </div>
          </section>

          <section id="tham-gia" className="rules4-section">
            <div className="rules4-roman">II.</div>
            <div>
              <span className="rules4-section-kicker">Open Call cộng đồng</span>
              <h3>Ai cũng có thể giới thiệu một điều đáng để team tìm hiểu</h3>
              <p className="rules4-lead">Người dân, học sinh, sinh viên, chuyên gia, KTS, creator, doanh nghiệp, CLB, trường học và những người yêu Hòa Lạc đều có thể đóng góp. Bạn có thể gửi nội dung đã có hoặc chỉ đơn giản giới thiệu một người, một nơi hay một câu chuyện đáng được kể.</p>
              <div className="rules4-format-grid">
                <div><Camera/><b>Ảnh / bộ ảnh</b><p>Một khoảnh khắc, một nhân vật, một nơi chốn hoặc một lớp cảnh quan.</p></div>
                <div><Video/><b>Video / audio</b><p>Phỏng vấn, reel, phim ngắn, âm thanh, tư liệu hiện trường.</p></div>
                <div><MessageCircle/><b>Đầu mối câu chuyện</b><p>Giới thiệu người, nơi, nghề, ký ức, công trình hoặc ý tưởng để Ban Biên tập tiếp tục tìm hiểu.</p></div>
              </div>
            </div>
          </section>

          <section id="mach-noi-dung" className="rules4-section">
            <div className="rules4-roman">III.</div>
            <div>
              <span className="rules4-section-kicker">Khung biên tập</span>
              <h3>7 mạch nội dung · 3 trục xuyên suốt</h3>
              <p className="rules4-lead">Bảy mạch giúp 52 góc nhìn không lệch thành một bộ ảnh phong cảnh. Một câu chuyện có thể giao thoa nhiều mạch. Ba trục xuyên suốt là <b>Bản sắc · Sáng tạo · Tương lai</b>.</p>
              <div className="rules4-awards-grid">{streams.map(([no,name,desc])=><article key={no} className="rules4-award-card"><span>{no}</span><h4>{name}</h4><p>{desc}</p></article>)}</div>
            </div>
          </section>

          <section id="gui-goc-nhin" className="rules4-section">
            <div className="rules4-roman">IV.</div>
            <div>
              <span className="rules4-section-kicker">Gửi một góc nhìn về Hòa Lạc</span>
              <h3>Gửi điều bạn có, không cần biến nó thành “bài thi”</h3>
              <p className="rules4-lead">Nếu đã có ảnh, video hoặc câu chuyện, hãy gửi file gốc và thông tin nguồn. Nếu mới có một đầu mối, hãy mô tả điều khiến bạn nghĩ câu chuyện đó đáng được giữ lại. Ban Biên tập sẽ liên hệ khi cần tìm hiểu sâu hơn.</p>
              <div className="rules4-steps">
                <div><span>01</span><b>Gửi người / nơi / câu chuyện</b><p>Cho biết bạn đang muốn HALO HOLA nhìn thấy điều gì.</p></div>
                <div><span>02</span><b>Thêm tư liệu nếu có</b><p>Ảnh, video, link, quote, địa điểm và thông tin nguồn.</p></div>
                <div><span>03</span><b>Ban Biên tập xác minh</b><p>Liên hệ nhân vật, đi thực địa hoặc xin thêm quyền nội dung khi cần.</p></div>
                <div><span>04</span><b>Biên tập & công bố</b><p>Câu chuyện phù hợp sẽ được phát triển thành góc nhìn trên HALO HOLA.</p></div>
              </div>
              <Link className="btn btn-green" to="/gui-goc-nhin">Gửi một góc nhìn <ArrowRight/></Link>
            </div>
          </section>

          <section id="bien-tap" className="rules4-section">
            <div className="rules4-roman">V.</div>
            <div>
              <span className="rules4-section-kicker">Ban Biên tập / Curator</span>
              <h3>HALO HOLA không chờ nội dung tự đến</h3>
              <p className="rules4-lead">Khoảng một nửa nguồn nội dung được team chủ động nghiên cứu, đi thực địa, tìm nhân vật, phỏng vấn, quay, chụp và viết; khoảng 30% đến từ chuyên gia, đối tác, CLB, trường học và địa phương; open call cộng đồng là một nguồn bổ sung quan trọng.</p>
              <blockquote>“Không tìm người thắng. Tìm những câu chuyện đáng được giữ lại.”</blockquote>
            </div>
          </section>

          <section id="quyen" className="rules4-section">
            <div className="rules4-roman">VI.</div>
            <div>
              <span className="rules4-section-kicker">Nguồn & quyền sử dụng</span>
              <h3>Tôn trọng người kể và người xuất hiện trong câu chuyện</h3>
              <p className="rules4-lead">Mỗi góc nhìn cần rõ nguồn, nhân vật, tác giả và quyền sử dụng nội dung. Khi có người có thể nhận diện trong ảnh/video, người gửi cần có sự đồng thuận phù hợp. Việc đưa nội dung vào sản phẩm thương mại hoặc Calendar chỉ thực hiện theo phạm vi quyền được chấp thuận.</p>
              <div className="rules4-note"><ShieldCheck/><div><b>Ưu tiên minh bạch</b><p>HALO HOLA có thể liên hệ lại để xác minh nguồn, bổ sung thông tin hoặc xin quyền sử dụng phù hợp trước khi công bố.</p></div></div>
            </div>
          </section>

          <section id="hanh-trinh" className="rules4-section">
            <div className="rules4-roman">VII.</div>
            <div>
              <span className="rules4-section-kicker">2026 → 2027</span>
              <h3>Từ 52 góc nhìn đến 52 tuần · 52 câu chuyện</h3>
              <p className="rules4-lead">Từ 17/10 đến 24/11, chương trình đi qua DISCOVER → CURATE → BUILD → REVEAL. Ngày 24/11 tại HOLA DAY, 52 góc nhìn được giới thiệu cùng Calendar 2027 và định hướng năm mới. Từ 2027, HALO HOLA tiếp tục kể đều đặn mỗi tuần một câu chuyện về Hòa Lạc.</p>
              <div className="rules4-hero-actions">
                <Link className="btn btn-green" to="/hola-day">Khám phá HOLA DAY <ArrowRight/></Link>
                <Link className="btn btn-outline" to="/calendar-2027">Xem Calendar 2027</Link>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  </main>
}
