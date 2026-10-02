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
  { title: 'Tôi tìm thấy một Hòa Lạc rất khác', author: 'Trần Minh Anh', image: img.camera, excerpt: 'Từ những lần lang thang bên hồ đến những buổi chiều trên đồi, Hòa Lạc hiện ra chậm và gần hơn.' },
  { title: 'Giữ sắc Mường giữa nhịp sống mới', author: 'Bùi Thị Hoa', image: img.people, excerpt: 'Với tôi, bản sắc không đứng yên; nó tiếp tục sống khi người trẻ hiểu và kể lại.' },
  { title: 'Những công trình biết lắng nghe con người', author: 'Lê Quang Huy', image: img.architecture, excerpt: 'Kiến trúc ở Hòa Lạc đang thay đổi từng ngày, nhưng điều quan trọng vẫn là cách con người sử dụng nó.' },
  { title: 'Nơi bình minh chạm vào ước mơ', author: 'Phạm Thảo Vy', image: img.sunset, excerpt: 'Có những buổi sáng, Hòa Lạc khiến ta cảm nhận rất rõ một nguồn năng lượng mới.' },
]

export const tours = [
  { no: '01', title: 'Đoài – Mường', dates: '17–18.10', kicker: 'Đi tìm bản sắc', image: img.village, desc: 'Làng xóm · kiến trúc · con người · Nét Đoài · văn hóa Mường · ký ức.' },
  { no: '02', title: 'Sắc màu Hòa Lạc', dates: '24–25.10', kicker: 'Đi tìm màu sắc', image: img.student, desc: 'Tìm 6 sắc màu qua cảnh quan, kiến trúc, con người, công nghệ và đời sống.' },
  { no: '03', title: 'Nắng Hòa Lạc', dates: '31.10–01.11', kicker: 'Đi tìm cảm xúc', image: img.sunset, desc: 'Nắng sớm · chiều vàng · Ba Vì · hoàng hôn phía Tây.' },
]

export const mapPlaces = [
  { id: 1, name: 'Hồ Đồng Mô', category: 'Thiên nhiên', position: [21.051, 105.445], image: img.lake, desc: 'Mặt nước rộng, đồi xanh và những khoảng trời phía Tây.' },
  { id: 2, name: 'Khu Công nghệ cao Hòa Lạc', category: 'Kiến trúc', position: [21.012, 105.525], image: img.architecture, desc: 'Không gian công nghệ và đổi mới sáng tạo.' },
  { id: 3, name: 'Đại học Quốc gia Hà Nội', category: 'Tri thức', position: [21.037, 105.527], image: img.student, desc: 'Không gian học tập, tri thức và tuổi trẻ.' },
  { id: 4, name: 'Thạch Hòa', category: 'Văn hóa', position: [21.03, 105.56], image: img.village, desc: 'Làng xóm, đời sống và những dấu vết Xứ Đoài.' },
  { id: 5, name: 'Hạ Bằng', category: 'Con người', position: [20.999, 105.535], image: img.people, desc: 'Nhịp sống địa phương và những câu chuyện bình dị.' },
]

export const agenda = [
  { time: '15:00', title: '52 góc nhìn', image: img.event, desc: 'Check-in · triển lãm TOP52 · Sắc màu Hòa Lạc · Live Art.' },
  { time: '16:00', title: 'HOLA TALK', image: img.talk, desc: '52 góc nhìn – Một Hòa Lạc đang chuyển mình.' },
  { time: '16:45', title: 'Nắng Hòa Lạc', image: img.sunset, desc: 'Ngắm hoàng hôn · photobooth · tiệc trà.' },
  { time: '17:15', title: 'Main Event', image: img.event, desc: 'Opening · trao giải · HELLO HÒA LẠC.' },
  { time: '18:48', title: 'Hello Hòa Lạc', image: img.night, desc: 'Giao lưu · Calendar · Collection · kết nối cộng đồng.' },
]
