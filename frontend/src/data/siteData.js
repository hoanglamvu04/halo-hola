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
      { heading: 'Đi chậm để nhìn thấy', paragraphs: ['Lần đầu tôi đến Hòa Lạc, mọi thứ giống như một chuyến đi ngắn ra khỏi thành phố. Nhưng khi quay lại nhiều lần, tôi bắt đầu nhận ra những thay đổi nhỏ của ánh sáng, mặt nước và nhịp sống quanh mình.', 'Những buổi chiều bên hồ, các con đường giữa triền cây và những khoảng trời rộng khiến trải nghiệm ở đây khác với cảm giác chỉ ghé qua một địa điểm du lịch.'] },
      { heading: 'Những khoảng trống đáng nhớ', paragraphs: ['Điều tôi nhớ nhất không phải là một công trình cụ thể mà là khoảng cách giữa các điểm đến: nơi có thể dừng xe, nhìn xa, nghe tiếng gió và để mọi thứ chậm xuống.', 'Chính những khoảng trống ấy khiến Hòa Lạc trở nên dễ gắn với ký ức cá nhân.'] }
    ],
    gallery: [img.lake, img.hills, img.sunset]
  },
  {
    slug: 'giu-sac-muong-giua-nhip-song-moi',
    title: 'Giữ sắc Mường giữa nhịp sống mới',
    author: 'Bùi Thị Hoa',
    role: 'Người địa phương',
    image: img.people,
    cover: img.people,
    category: 'Con người · Bản sắc',
    location: 'Hòa Lạc',
    date: '28.09.2026',
    readTime: '7 phút đọc',
    excerpt: 'Với tôi, bản sắc không đứng yên; nó tiếp tục sống khi người trẻ hiểu và kể lại.',
    lead: 'Bản sắc không chỉ nằm trong những gì được lưu giữ. Nó còn nằm trong cách thế hệ sau lựa chọn tiếp tục một câu chuyện.',
    quote: 'Giữ bản sắc không có nghĩa là giữ mọi thứ nguyên trạng.',
    body: [
      { heading: 'Bản sắc nằm trong đời sống', paragraphs: ['Những câu chuyện văn hóa chỉ thực sự sống khi còn xuất hiện trong sinh hoạt, trong cách người ta gọi tên món ăn, nhắc về gia đình, kể lại một phong tục hay cùng nhau chuẩn bị cho một dịp quan trọng.', 'Điều đó khiến bản sắc trở thành một phần của hiện tại, thay vì chỉ là ký ức được trưng bày.'] },
      { heading: 'Người trẻ là một phần của câu chuyện', paragraphs: ['Khi người trẻ chụp lại, viết lại hoặc kể lại những điều mình nhìn thấy bằng ngôn ngữ mới, họ không làm mất đi giá trị cũ. Ngược lại, đó có thể là cách để câu chuyện tiếp tục được nghe thấy.'] }
    ],
    gallery: [img.people, img.village, img.crafts]
  },
  {
    slug: 'nhung-cong-trinh-biet-lang-nghe-con-nguoi',
    title: 'Những công trình biết lắng nghe con người',
    author: 'Lê Quang Huy',
    role: 'Kiến trúc sư',
    image: img.architecture,
    cover: img.architecture,
    category: 'Kiến trúc · Đời sống',
    location: 'Hòa Lạc',
    date: '24.09.2026',
    readTime: '6 phút đọc',
    excerpt: 'Kiến trúc ở Hòa Lạc đang thay đổi từng ngày, nhưng điều quan trọng vẫn là cách con người sử dụng nó.',
    lead: 'Một công trình có thể mới, nhưng cảm giác mà nó tạo ra cho người sử dụng mới là thứ quyết định nó có thuộc về nơi này hay không.',
    quote: 'Kiến trúc tốt không chỉ được nhìn thấy. Nó phải được sống cùng.',
    body: [
      { heading: 'Không gian bắt đầu từ cách sử dụng', paragraphs: ['Những công trình mới ở Hòa Lạc ngày càng đa dạng về quy mô và hình thức. Nhưng với tôi, điều quan trọng là chúng có tạo ra bóng mát, khoảng gặp gỡ, lối đi dễ chịu và cảm giác gần với cảnh quan hay không.', 'Khi một không gian khiến người ta muốn ở lại lâu hơn, nó bắt đầu trở thành một phần của đời sống.'] },
      { heading: 'Đối thoại với cảnh quan', paragraphs: ['Hòa Lạc có lợi thế của những khoảng xanh và tầm nhìn rộng. Kiến trúc ở đây sẽ thú vị hơn khi không cố tách mình khỏi cảnh quan mà biết tận dụng ánh sáng, gió, cây xanh và địa hình như một phần của thiết kế.'] }
    ],
    gallery: [img.architecture, img.green, img.student]
  },
  {
    slug: 'noi-binh-minh-cham-vao-uoc-mo',
    title: 'Nơi bình minh chạm vào ước mơ',
    author: 'Phạm Thảo Vy',
    role: 'Sinh viên',
    image: img.sunset,
    cover: img.sunset,
    category: 'Tuổi trẻ · Tương lai',
    location: 'Hòa Lạc',
    date: '20.09.2026',
    readTime: '5 phút đọc',
    excerpt: 'Có những buổi sáng, Hòa Lạc khiến ta cảm nhận rất rõ một nguồn năng lượng mới.',
    lead: 'Tôi đến Hòa Lạc vì việc học, nhưng dần nhận ra mình đang chứng kiến một nơi thay đổi từng ngày.',
    quote: 'Có những ước mơ bắt đầu rất đơn giản: một buổi sáng, một con đường và cảm giác mình muốn ở lại.',
    body: [
      { heading: 'Một nhịp sống khác', paragraphs: ['Buổi sáng ở Hòa Lạc cho tôi cảm giác rộng hơn, thoáng hơn và có nhiều khoảng để suy nghĩ. Những ngày đầu còn lạ, sau đó các con đường và điểm dừng dần trở thành một phần của lịch học và đời sống.', 'Không gian mới cũng mang theo nhiều cơ hội để gặp những người có cùng mối quan tâm và cùng hình dung về tương lai.'] },
      { heading: 'Tương lai từ những điều đang diễn ra', paragraphs: ['Tương lai của Hòa Lạc với tôi không phải một hình ảnh quá xa. Nó nằm trong những hoạt động đang diễn ra mỗi ngày: học tập, nghiên cứu, làm việc, gặp gỡ và thử nghiệm những ý tưởng mới.'] }
    ],
    gallery: [img.sunset, img.student, img.hills]
  },
  {
    slug: 'nhung-mang-xanh-o-lai',
    title: 'Những mảng xanh ở lại',
    author: 'Vũ Quốc Bảo',
    role: 'Nhiếp ảnh gia',
    image: img.green,
    cover: img.green,
    category: 'Thiên nhiên · Cảnh quan',
    location: 'Tiến Xuân',
    date: '16.09.2026',
    readTime: '4 phút đọc',
    excerpt: 'Giữa nhịp phát triển, những khoảng xanh vẫn là phần khiến Hòa Lạc giữ được cảm giác rất riêng.',
    lead: 'Mỗi lần quay lại, tôi đều tìm những khoảng cây, mặt nước và đường chân trời trước khi nhìn vào các công trình mới.',
    quote: 'Một vùng đất phát triển đẹp khi vẫn còn chỗ cho mắt nhìn đi xa.',
    body: [
      { heading: 'Khoảng xanh là một phần của bản sắc', paragraphs: ['Cảnh quan ở Hòa Lạc tạo nên cảm giác nhận diện rất mạnh: những triền cây, khoảng nước, nền núi xa và bầu trời rộng. Đây không chỉ là phông nền cho phát triển mà còn là yếu tố tạo nên chất lượng sống.', 'Với người chụp ảnh, những mảng xanh giúp mọi câu chuyện về con người và kiến trúc có thêm chiều sâu.'] }
    ],
    gallery: [img.green, img.lake, img.hills]
  },
  {
    slug: 'mot-ngay-theo-nhip-hoa-lac',
    title: 'Một ngày theo nhịp Hòa Lạc',
    author: 'Nguyễn Khánh Linh',
    role: 'Creator',
    image: img.student,
    cover: img.student,
    category: 'Đời sống · Cộng đồng',
    location: 'Hòa Lạc',
    date: '12.09.2026',
    readTime: '6 phút đọc',
    excerpt: 'Từ sáng sớm đến khi thành phố lên đèn, Hòa Lạc có nhiều nhịp sống chồng lên nhau hơn ta tưởng.',
    lead: 'Một ngày ở Hòa Lạc có thể bắt đầu bằng đường vắng, đi qua những không gian học tập đông người và kết thúc ở một khoảng trời rất rộng.',
    quote: 'Nhịp sống ở đây không ồn ào, nhưng không hề đứng yên.',
    body: [
      { heading: 'Buổi sáng của những hành trình', paragraphs: ['Từ rất sớm, các tuyến đường bắt đầu có nhiều chuyển động: người đi học, đi làm, những chuyến xe kết nối các khu vực và những quán nhỏ bắt đầu mở cửa.', 'Nhịp sống ấy dần tạo nên cảm giác về một cộng đồng đang lớn lên thay vì một điểm đến tách biệt.'] },
      { heading: 'Khi ngày chậm lại', paragraphs: ['Cuối ngày, nhịp sống dịu xuống. Đây là lúc dễ cảm nhận nhất sự song song giữa một Hòa Lạc mới và cảnh quan vốn có của vùng đất.'] }
    ],
    gallery: [img.student, img.architecture, img.night]
  },
  {
    slug: 'hoa-lac-len-den',
    title: 'Hòa Lạc lên đèn',
    author: 'Lê Anh Tuấn',
    role: 'Nhiếp ảnh gia',
    image: img.night,
    cover: img.night,
    category: 'Đô thị · Đêm',
    location: 'Hòa Lạc',
    date: '08.09.2026',
    readTime: '5 phút đọc',
    excerpt: 'Khi ánh sáng xuất hiện, một diện mạo khác của Hòa Lạc bắt đầu lộ ra.',
    lead: 'Ban đêm là lúc tôi nhận thấy rõ nhất tốc độ thay đổi của một nơi: những đường sáng mới, công trình mới và những điểm gặp gỡ mới.',
    quote: 'Ánh sáng không chỉ cho thấy công trình. Nó cho thấy nơi nào con người đang hiện diện.',
    body: [
      { heading: 'Một diện mạo khác sau hoàng hôn', paragraphs: ['Khi trời tối, những điểm sáng phân bố trên nền cảnh quan tạo ra một bản đồ khác của Hòa Lạc. Một số nơi yên tĩnh hẳn, trong khi những khu vực học tập, làm việc và dịch vụ lại bắt đầu rõ nét hơn.', 'Sự tương phản ấy khiến câu chuyện đô thị ở Hòa Lạc trở nên dễ quan sát theo một cách rất khác.'] }
    ],
    gallery: [img.night, img.architecture, img.sunset]
  }
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
