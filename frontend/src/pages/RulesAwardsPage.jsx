import { Link } from 'react-router-dom'
import {
  ArrowRight, Brush, Camera, Check, FileText,
  MapPin, PenTool, ShieldCheck, Users, Video
} from 'lucide-react'
import '../styles/contribution-campaign.css'

const FORMATS = [
  {icon:Camera,title:'PHOTO',detail:'Ảnh đơn, bộ ảnh, photo story',spec:'JPG/PNG · ảnh rõ nét · tối đa 10 ảnh cho một góc nhìn'},
  {icon:Video,title:'VIDEO',detail:'Reel, video ngắn, timelapse',spec:'MP4 hoặc link video · ưu tiên chất lượng từ 1080p'},
  {icon:PenTool,title:'STORY',detail:'Câu chuyện, ký ức, ghi chép, tản văn',spec:'Có thể gửi riêng hoặc đi cùng ảnh và video'},
  {icon:Brush,title:'ART & DESIGN',detail:'Ký họa, illustration, poster, postcard, digital art',spec:'JPG/PNG/PDF · ưu tiên file đủ nét để lưu trữ và trưng bày'}
]

const THEMES = [
  ['01','Bản sắc'],
  ['02','Thiên nhiên'],
  ['03','Không gian'],
  ['04','Con người'],
  ['05','Tri thức & Công nghệ'],
  ['06','Đời sống & Cảm xúc'],
  ['07','Tương lai']
]

const TIMELINE = [
  ['11.10','Mở chiến dịch đóng góp góc nhìn'],
  ['25.10','HOLA Tour · cùng đi, cùng nhìn, cùng ghi lại'],
  ['10.11 · 10:11','Khép đợt đóng góp cộng đồng 2026'],
  ['16.11','Bắt đầu giới thiệu các góc nhìn cộng đồng'],
  ['24.11','HOLA DAY · gặp nhau · xem lại · kể tiếp']
]

const COMMUNES = ['Yên Xuân','Hòa Lạc','Yên Bài','Đoài Phương','Thạch Thất','Hạ Bằng','Tây Phương','Kiều Phú','Phú Cát']

const RULE_NOTES = [
  'Nội dung nên do chính bạn ghi lại hoặc sáng tạo từ trải nghiệm thật; không dùng AI để tạo hoặc ghép sai lệch hiện thực.',
  'Ưu tiên cung cấp đúng địa điểm, thời gian và vài dòng bối cảnh để góc nhìn có giá trị lưu trữ lâu dài.',
  'Người xuất hiện rõ mặt cần đồng ý; người dưới 18 tuổi cần sự đồng ý của phụ huynh hoặc người giám hộ.',
  'Không sử dụng nhạc, hình ảnh hoặc tư liệu vi phạm bản quyền; tuân thủ quy định khi dùng flycam hoặc thiết bị ghi hình đặc thù.',
  'Người đóng góp giữ quyền tác giả. HALO HOLA có thể giới thiệu, triển lãm và lưu trữ phi thương mại cho hoạt động cộng đồng, luôn ghi tên tác giả.',
  'Nếu một góc nhìn được đề xuất dùng cho Calendar, ấn phẩm hoặc sản phẩm thương mại, HALO HOLA sẽ xin chấp thuận riêng từ tác giả.',
  'HALO HOLA có thể liên hệ để xác minh thông tin hoặc làm rõ câu chuyện trước khi công bố.'
]

const NAV = [
  ['I.','Chiến dịch là gì','gioi-thieu'],
  ['II.','Ai có thể đóng góp','tham-gia'],
  ['III.','Bạn có thể gửi gì','loai-hinh'],
  ['IV.','7 mạch nội dung','chu-de'],
  ['V.','Cách gửi góc nhìn','cach-tham-gia'],
  ['VI.','Mốc hành trình','moc-thoi-gian'],
  ['VII.','Nguyên tắc','luu-y']
]

export default function RulesAwardsPage(){
  return <main className="rules4-page">
    <section className="rules4-hero">
      <div className="container rules4-hero-inner">
        <div>
          <span className="rules4-kicker">CHIẾN DỊCH CỘNG ĐỒNG · HALO HOLA 2026</span>
          <h1>Góp một góc nhìn.<br/>Cùng kể một Hòa Lạc.</h1>
          <p>HALO HOLA mở lời mời cộng đồng cùng ghi lại Hòa Lạc bằng ảnh, video, câu chuyện và sáng tạo thị giác. Đây không phải một cuộc thi — mỗi đóng góp là một mảnh tư liệu để cùng hiểu hơn về vùng đất đang thay đổi từng ngày.</p>
          <div className="rules4-hero-actions">
            <a className="btn btn-green" href="#cach-tham-gia">Xem cách đóng góp <ArrowRight/></a>
            <Link className="btn btn-outline" to="/gui-goc-nhin">Gửi một góc nhìn</Link>
          </div>
        </div>
        <div className="rules4-hero-meta" aria-label="Thông tin nhanh">
          <div><span>Tinh thần</span><b>Không phải cuộc thi</b></div>
          <div><span>Cách kể</span><b>Ảnh · Video · Story · Art</b></div>
          <div><span>Đợt 2026 đến</span><b>10.11 · 10:11</b></div>
        </div>
      </div>
    </section>

    <div className="rules4-wrap">
      <div className="container rules4-layout">
        <aside className="rules4-sidebar" aria-label="Mục lục chiến dịch đóng góp">
          <div className="rules4-sidebar-card">
            <div className="rules4-sidebar-head"><span>Mục lục</span><b>Góp góc nhìn về Hòa Lạc</b></div>
            <nav className="rules4-nav">
              {NAV.map(([roman,label,id])=><a key={id} href={'#'+id}><span>{roman}</span>{label}</a>)}
            </nav>
            <div className="rules4-sidebar-foot">
              Đi · nhìn · gặp · nghe · ghi lại.
            </div>
          </div>
        </aside>

        <article className="rules4-paper">
          <header className="rules4-paper-head">
            <div><span>HALO HOLA 2026</span><h2>Một lời mời cùng ghi lại Hòa Lạc</h2></div>
            <div className="rules4-paper-stamp"><strong>Không xếp hạng</strong><small>Mỗi góc nhìn đều có giá trị</small></div>
          </header>

          <section id="gioi-thieu" className="rules4-section">
            <div className="rules4-roman">I.</div>
            <div>
              <span className="rules4-section-kicker">Một lời mời từ HALO HOLA</span>
              <h3>Không phải cuộc thi. Đây là chiến dịch cùng lưu giữ Hòa Lạc.</h3>
              <p className="rules4-lead">Một vùng đất thay đổi rất nhanh thường để lại nhiều điều chưa kịp được ghi lại. HALO HOLA mong muốn cộng đồng cùng góp những lát cắt thật về con người, nơi chốn, ký ức, thiên nhiên, tri thức và nhịp sống hôm nay để tạo nên một kho tư liệu chung về Hòa Lạc.</p>
              <dl className="rules4-facts">
                <div className="rules4-fact"><Camera/><dt>Nhìn thật</dt><dd>Ghi lại những điều bạn thực sự thấy, sống cùng hoặc quan tâm.</dd></div>
                <div className="rules4-fact"><Users/><dt>Gặp thật</dt><dd>Con người và câu chuyện địa phương là trung tâm của hành trình.</dd></div>
                <div className="rules4-fact"><FileText/><dt>Lưu lại</dt><dd>Mỗi đóng góp giúp làm đầy kho tư liệu cộng đồng về Hòa Lạc.</dd></div>
              </dl>
            </div>
          </section>

          <section id="tham-gia" className="rules4-section">
            <div className="rules4-roman">II.</div>
            <div>
              <span className="rules4-section-kicker">Ai cũng có thể tham gia</span>
              <h3>Bạn không cần là nhiếp ảnh gia hay người làm nội dung chuyên nghiệp</h3>
              <p className="rules4-lead">Người dân, sinh viên, kiến trúc sư, photographer, filmmaker, designer, creator, người đang sống, học tập, làm việc hoặc chỉ đơn giản là yêu Hòa Lạc đều có thể đóng góp. Điện thoại hay máy ảnh đều được — điều quan trọng là góc nhìn của bạn.</p>
              <dl className="rules4-facts">
                <div className="rules4-fact"><Users/><dt>Người tham gia</dt><dd>Cá nhân hoặc nhóm; đóng góp hoàn toàn miễn phí.</dd></div>
                <div className="rules4-fact"><MapPin/><dt>Không gian</dt><dd>{COMMUNES.join(', ')}</dd></div>
                <div className="rules4-fact"><ShieldCheck/><dt>Dưới 18 tuổi</dt><dd>Cần có sự đồng ý của phụ huynh hoặc người giám hộ.</dd></div>
              </dl>
            </div>
          </section>

          <section id="loai-hinh" className="rules4-section">
            <div className="rules4-roman">III.</div>
            <div>
              <span className="rules4-section-kicker">Bốn cách để kể</span>
              <h3>Gửi theo cách phù hợp nhất với câu chuyện của bạn</h3>
              <p className="rules4-lead">Không có một khuôn mẫu cố định. Một góc nhìn có thể là một bức ảnh, một đoạn video, một câu chuyện ngắn hoặc một sáng tạo thị giác miễn là nó giúp người khác nhìn thấy thêm một lớp của Hòa Lạc.</p>
              <table className="rules4-table">
                <thead><tr><th>Loại hình</th><th>Bạn có thể gửi</th><th>Gợi ý chuẩn bị</th></tr></thead>
                <tbody>{FORMATS.map(({icon:I,title,detail,spec})=><tr key={title}>
                  <td><div className="rules4-format-name"><span><I/></span><strong>{title}</strong></div></td>
                  <td>{detail}</td><td>{spec}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="chu-de" className="rules4-section">
            <div className="rules4-roman">IV.</div>
            <div>
              <span className="rules4-section-kicker">7 mạch nội dung Hòa Lạc</span>
              <h3>Một góc nhìn có thể bắt đầu từ bất kỳ điều gì gần bạn</h3>
              <p className="rules4-lead">Bạn có thể chọn một hoặc nhiều mạch nội dung: Bản sắc, Thiên nhiên, Không gian, Con người, Tri thức & Công nghệ, Đời sống & Cảm xúc và Tương lai.</p>
              <div className="rules4-theme-grid">
                {THEMES.map(([number,title])=><div className="rules4-theme" key={number}><span className="num">{number}</span><b>{title}</b></div>)}
              </div>
              <div className="rules4-note">Không cần cố gắng “đúng chủ đề”. Hãy bắt đầu từ điều bạn thật sự nhìn thấy, quan tâm hoặc muốn lưu lại.</div>
            </div>
          </section>

          <section id="cach-tham-gia" className="rules4-section">
            <div className="rules4-roman">V.</div>
            <div>
              <span className="rules4-section-kicker">Cách đóng góp</span>
              <h3>Gửi một góc nhìn trong 4 bước đơn giản</h3>
              <ol className="rules4-steps">
                <li><span className="num">01</span><b>Chọn điều bạn muốn kể</b><p>Một nơi chốn, một con người, một thay đổi, một ký ức hoặc một khoảnh khắc bạn thấy đáng giữ lại.</p></li>
                <li><span className="num">02</span><b>Chuẩn bị nội dung</b><p>Chọn ảnh, video, câu chuyện hoặc tác phẩm phù hợp và thêm vài dòng bối cảnh nếu có.</p></li>
                <li><span className="num">03</span><b>Gửi trên HALO HOLA</b><p>Điền form, chọn địa điểm, chủ đề và tải nội dung lên. Bạn có thể bổ sung thông tin sau nếu cần.</p></li>
                <li><span className="num">04</span><b>Cùng kể tiếp</b><p>HALO HOLA sẽ sắp xếp, lưu trữ và có thể giới thiệu góc nhìn của bạn trên website, HOLA DAY hoặc các nội dung cộng đồng liên quan.</p></li>
              </ol>

              <dl className="rules4-facts">
                <div className="rules4-fact"><FileText/><dt>Được lưu trong kho chung</dt><dd>Góc nhìn trở thành một phần của tư liệu cộng đồng về Hòa Lạc.</dd></div>
                <div className="rules4-fact"><Users/><dt>Có thể được giới thiệu</dt><dd>Trên HALO HOLA, HOLA DAY, Stories hoặc các nội dung biên tập phù hợp.</dd></div>
                <div className="rules4-fact"><ShieldCheck/><dt>Quyền tác giả vẫn thuộc về bạn</dt><dd>Mọi sử dụng cho ấn phẩm hoặc mục đích thương mại sẽ được xin phép riêng.</dd></div>
              </dl>
            </div>
          </section>

          <section id="moc-thoi-gian" className="rules4-section">
            <div className="rules4-roman">VI.</div>
            <div>
              <span className="rules4-section-kicker">Mốc hành trình 2026</span>
              <h3>Một chiến dịch có điểm bắt đầu, nhưng câu chuyện có thể tiếp tục lâu hơn</h3>
              <p className="rules4-lead">Các mốc dưới đây giúp cộng đồng cùng theo một nhịp trong năm 2026. Sau đợt đóng góp đầu tiên, kho tư liệu và các câu chuyện về Hòa Lạc vẫn tiếp tục được bổ sung và kể tiếp.</p>
              <div className="rules4-timeline">
                {TIMELINE.map(([date,title],index)=><div key={date} className={'rules4-time-row '+(index===TIMELINE.length-1?'is-final':'')}><time>{date}</time><b>{title}</b></div>)}
              </div>
            </div>
          </section>

          <section id="luu-y" className="rules4-section">
            <div className="rules4-roman">VII.</div>
            <div>
              <span className="rules4-section-kicker">Nguyên tắc đóng góp</span>
              <h3>Tôn trọng sự thật, con người và quyền tác giả</h3>
              <ul className="rules4-checks">
                {RULE_NOTES.map(note=><li key={note}><Check/><span>{note}</span></li>)}
              </ul>
            </div>
          </section>

          <footer className="rules4-footer-action">
            <div><span>HALO HOLA 2026</span><h3>Hòa Lạc được kể hay hơn khi có thêm góc nhìn của bạn.</h3></div>
            <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi một góc nhìn <ArrowRight/></Link>
          </footer>
        </article>
      </div>
    </div>
  </main>
}
