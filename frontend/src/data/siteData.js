export const COLORS = {
  forest: '#173d2d',
  moss: '#557a45',
  terracotta: '#c45b32',
  sun: '#eba84a',
  ivory: '#f7f0e2',
  sand: '#e7dbc3',
}

export const img = {
  lake: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85',
  hills: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  village: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85',
  people: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
  student: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85',
  architecture: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
  green: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85',
  sunset: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85',
  camera: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=85',
  kid: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=85',
  mural: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85',
  event: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85',
  talk: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85',
  award: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=85',
  crafts: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85',
  night: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=85',
}

export const themes = [
  { id: 1, slug: 'net-doai', title: 'Nét Đoài tại Hòa Lạc', desc: 'Văn hóa, làng xóm, trầm tích Xứ Đoài', image: img.village, color: '#9d6c46' },
  { id: 2, slug: 'sac-muong', title: 'Sắc Mường Hòa Lạc', desc: 'Bản sắc, con người, đời sống văn hóa', image: img.people, color: '#7d553b' },
  { id: 3, slug: 'kien-truc', title: 'Không gian Kiến trúc Hòa Lạc', desc: 'Công trình, cảnh quan, không gian sống', image: img.architecture, color: '#b57b4d' },
  { id: 4, slug: 'hoa-lac-xanh', title: 'Hòa Lạc xanh', desc: 'Thiên nhiên, mặt nước, phát triển bền vững', image: img.green, color: '#557a45' },
  { id: 5, slug: 'nang-hoa-lac', title: 'Nắng Hòa Lạc', desc: 'Ánh sáng, cảm xúc, khoảnh khắc phía Tây', image: img.sunset, color: '#e9a541' },
  { id: 6, slug: 'cau-chuyen', title: 'Câu chuyện Hòa Lạc', desc: 'Con người, ký ức, những câu chuyện đáng kể', image: img.camera, color: '#7a5a44' },
  { id: 7, slug: 'uoc-mo', title: 'Ước mơ Hòa Lạc', desc: 'Góc nhìn học sinh – sinh viên về tương lai', image: img.kid, color: '#91b653' },
  { id: 8, slug: 'sac-mau', title: 'Sắc màu Hòa Lạc', desc: '06 đặc trưng sắc màu của vùng đất', image: img.mural, color: '#c45b32' },
]

export const colorStories = [
  { name: 'Đá ong', color: '#9c643d', story: 'Bền bỉ · trầm tích' },
  { name: 'Nắng', color: '#efb54f', story: 'Ấm áp · hy vọng' },
  { name: 'Xanh rêu', color: '#405c36', story: 'Thiên nhiên · lâu đời' },
  { name: 'Xanh non', color: '#9cbd58', story: 'Tri thức · đổi mới' },
  { name: 'Be', color: '#dccdaf', story: 'Dung dị · bản địa' },
  { name: 'Sắc Hòa Lạc', color: 'linear-gradient(135deg,#d25b3e 0 33%,#efb54f 33% 55%,#75a164 55% 75%,#5d8aaa 75%)', story: 'Hòa sắc · tương lai' },
]

export const artworks = [
  { slug: 'cong-lang-trong-nang-som', title: 'Cổng làng trong nắng sớm', author: 'Nguyễn Hoàng Nam', image: img.village, theme: 'Nét Đoài', location: 'Thạch Hòa', views: '12.4K' },
  { slug: 'chieu-buong-ho-dong-mo', title: 'Chiều buông trên hồ Đồng Mô', author: 'Trần Minh Anh', image: img.lake, theme: 'Nắng Hòa Lạc', location: 'Hồ Đồng Mô', views: '28.1K' },
  { slug: 'nhip-song-moi', title: 'Nhịp sống mới ở Hòa Lạc', author: 'Lê Quang Huy', image: img.architecture, theme: 'Kiến trúc', location: 'Hòa Lạc', views: '18.7K' },
  { slug: 'sac-muong-giua-dai-ngan', title: 'Sắc Mường giữa đại ngàn', author: 'Đinh Thị Mai', image: img.people, theme: 'Sắc Mường', location: 'Hòa Lạc', views: '16.3K' },
  { slug: 'kien-truc-cho-con-nguoi', title: 'Kiến trúc cho con người', author: 'Hoàng Minh Đức', image: img.student, theme: 'Kiến trúc', location: 'Khu CNC Hòa Lạc', views: '22.1K' },
  { slug: 'tuoi-tre-va-uoc-mo', title: 'Tuổi trẻ và những ước mơ', author: 'Nguyễn Khánh Linh', image: img.people, theme: 'Ước mơ Hòa Lạc', location: 'Hòa Lạc', views: '14.9K' },
  { slug: 'hoa-lac-xanh', title: 'Hòa Lạc xanh – những mảng lành', author: 'Vũ Quốc Bảo', image: img.green, theme: 'Hòa Lạc xanh', location: 'Tiến Xuân', views: '19.5K' },
  { slug: 'nhung-gam-mau-ke-chuyen', title: 'Những gam màu kể chuyện', author: 'Phan Thu Hà', image: img.mural, theme: 'Sắc màu Hòa Lạc', location: 'Hòa Lạc', views: '11.2K' },
  { slug: 'nang-tren-trien-co-lau', title: 'Nắng trên triền cỏ lau', author: 'Trần Gia Hân', image: img.sunset, theme: 'Nắng Hòa Lạc', location: 'Đồng Trúc', views: '13.6K' },
  { slug: 'hoa-lac-len-den', title: 'Hòa Lạc lên đèn', author: 'Lê Anh Tuấn', image: img.night, theme: 'Câu chuyện Hòa Lạc', location: 'Hòa Lạc', views: '21.4K' },
]

export const stories = [
  {
    slug: 'mot-hoa-lac-dang-lon-len',
    title: 'Một Hòa Lạc đang lớn lên',
    author: 'HALO HOLA Editorial',
    role: 'Ban biên tập',
    image: img.village,
    cover: img.village,
    category: 'Văn hóa · Chuyển mình',
    location: 'Hòa Lạc',
    date: '03.10.2026',
    readTime: '6 phút đọc',
    excerpt: 'Những lớp ký ức Xứ Đoài, văn hóa Mường, cảnh quan tự nhiên đang đồng thời đón nhận tri thức, công nghệ, đô thị và những cộng đồng mới.',
    lead: 'Hòa Lạc không chỉ lớn lên bằng những công trình mới. Vùng đất này đang thay đổi trong cách con người gặp nhau, kể chuyện, học tập và nhìn về tương lai.',
    quote: 'Một vùng đất chỉ thực sự thay đổi khi những câu chuyện cũ và mới có thể đứng cạnh nhau.',
    body: [
      {
        heading: 'Một vùng đất có nhiều lớp thời gian',
        paragraphs: [
          'Ở Hòa Lạc, cảm giác về thời gian không chạy theo một đường thẳng. Một con đường mới có thể nằm rất gần một xóm làng cũ; một không gian học tập hiện đại có thể mở ra từ nền cảnh quan vốn gắn với đồi, hồ và những nếp sống lâu đời.',
          'Chính sự đan xen ấy tạo nên điều thú vị nhất: quá khứ không biến mất khi cái mới xuất hiện. Nó trở thành một lớp nền để người trẻ, người địa phương và những cộng đồng mới tiếp tục đọc lại vùng đất bằng góc nhìn của mình.'
        ]
      },
      {
        heading: 'Khi tri thức và cộng đồng gặp nhau',
        paragraphs: [
          'Sự hiện diện của các không gian học tập, nghiên cứu, sáng tạo và những nhóm cộng đồng mới khiến Hòa Lạc ngày càng có nhiều nhịp sống khác nhau. Người đến đây không chỉ để đi qua, mà bắt đầu ở lại lâu hơn, làm việc, học tập, sáng tạo và hình thành những mối liên kết mới.',
          'Điều đáng kể không nằm ở việc Hòa Lạc giống một đô thị khác, mà ở cách vùng đất này có thể phát triển mà vẫn giữ được chất riêng: khoảng xanh, nhịp sống chậm, tính bản địa và cảm giác gần gũi giữa con người với cảnh quan.'
        ]
      },
      {
        heading: 'Kể lại Hòa Lạc từ những điều gần nhất',
        paragraphs: [
          'Một bức ảnh về buổi chiều, một câu chuyện của người hàng xóm, một công trình được sử dụng mỗi ngày hay một ký ức nhỏ về con đường quen đều có thể trở thành chất liệu để kể về Hòa Lạc.',
          'HALO HOLA chọn bắt đầu từ những điều như vậy: những góc nhìn thật, những câu chuyện đủ gần để người xem nhận ra mình trong đó, và đủ mở để nhiều người cùng tham gia kể tiếp.'
        ]
      }
    ],
    gallery: [img.village, img.green, img.architecture]
  },
  {
    slug: 'toi-tim-thay-mot-hoa-lac-rat-khac',
    title: 'Tôi tìm thấy một Hòa Lạc rất khác',
    author: 'Trần Minh Anh',
    role: 'Người kể chuyện',
    image: img.camera,
    cover: img.lake,
    category: 'Trải nghiệm · Thiên nhiên',
    location: 'Hồ Đồng Mô',
    date: '01.10.2026',
    readTime: '5 phút đọc',
    excerpt: 'Từ những lần lang thang bên hồ đến những buổi chiều trên đồi, Hòa Lạc hiện ra chậm và gần hơn.',
    lead: 'Có những nơi chỉ thật sự hiện ra khi mình chịu đi chậm. Với tôi, Hòa Lạc là một nơi như thế.',
    quote: 'Tôi không tìm thấy Hòa Lạc trong một điểm đến. Tôi tìm thấy nó trong những khoảng dừng.',
    body: [
      { heading: 'Đi chậm để nhìn thấy', paragraphs: ['Lần đầu tôi đến Hòa Lạc, mọi thứ giống như một chuyến đi ngắn ra khỏi thành phố. Nhưng khi quay lại nhiều lần, tôi bắt đầu nhận ra những thay đổi nhỏ của ánh sáng, mặt nước và nhịp sống quanh mình.'] },
      { heading: 'Một vùng đất không chỉ có một khuôn hình', paragraphs: ['Hòa Lạc có thể là mặt hồ, một con đường, một khoảng nắng, một mái nhà, một buổi trò chuyện hoặc một công trình đang được hoàn thiện. Mỗi lát cắt đều nhỏ nhưng khi đặt cạnh nhau lại tạo thành một vùng đất có chiều sâu.'] }
    ],
    gallery: [img.lake, img.sunset, img.green]
  }
]

// Fallback data only. Production HOLA Tour content is loaded from the API/CMS.
// Keep this aligned with the authoritative 25/10/2026 three-tour schedule.
export const tours = [
  { no: '01', title: 'Đoài · Mường', dates: '25.10.2026', kicker: 'Đi tìm bản sắc', image: img.village, desc: 'Làng xóm · kiến trúc · con người · Nét Đoài · văn hóa Mường · ký ức.' },
  { no: '02', title: 'Sắc màu Hòa Lạc', dates: '25.10.2026', kicker: 'Đi tìm màu sắc', image: img.student, desc: 'Tìm 6 sắc màu qua cảnh quan, kiến trúc, con người, công nghệ và đời sống.' },
  { no: '03', title: 'Làng nghề Hòa Lạc', dates: '25.10.2026', kicker: 'Đi tìm nghề và ký ức', image: img.crafts, desc: 'Làng nghề · người làm nghề · vật liệu · kỹ thuật thủ công · ký ức · sinh kế.' },
]
