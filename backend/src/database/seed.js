import { pool } from './pool.js';
import { env } from '../config/env.js';

const img = {
  lake: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85',
  hills: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  village: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85',
  people: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85',
  student: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85',
  architecture: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85',
  green: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85',
  sunset: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85',
  camera: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=85',
  event: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85'
};

const places = [
  {slug:'ho-dong-mo',name:'Hồ Đồng Mô',category:'Thiên nhiên',lat:21.051,lng:105.445,image:img.lake,description:'Một lớp cảnh quan mặt nước và khoảng trời phía Tây, phù hợp với các góc nhìn về Hòa Lạc xanh, ánh sáng và trải nghiệm cuối tuần.',tags:['Hòa Lạc xanh','Nắng Hòa Lạc','mặt nước','cảnh quan'],sort:10},
  {slug:'khu-cong-nghe-cao-hoa-lac',name:'Khu Công nghệ cao Hòa Lạc',category:'Tương lai',lat:21.012,lng:105.525,image:img.architecture,description:'Không gian đại diện cho lớp Hòa Lạc đang chuyển mình: công nghệ, đổi mới sáng tạo, kiến trúc và những cộng đồng làm việc mới.',tags:['Tương lai','công nghệ','kiến trúc','đổi mới sáng tạo'],sort:20},
  {slug:'dhqg-ha-noi',name:'Đại học Quốc gia Hà Nội tại Hòa Lạc',category:'Tri thức',lat:21.037,lng:105.527,image:img.student,description:'Một điểm chạm của tri thức và tuổi trẻ, gợi mở các câu chuyện về sinh viên, học tập, nghiên cứu và những ước mơ dành cho Hòa Lạc.',tags:['Tri thức','Ước mơ Hòa Lạc','sinh viên','campus'],sort:30},
  {slug:'thach-hoa',name:'Thạch Hòa',category:'Văn hóa',lat:21.03,lng:105.56,image:img.village,description:'Không gian làng xóm và đời sống địa phương, phù hợp với những câu chuyện về Nét Đoài, ký ức, kiến trúc truyền thống và nhịp sống bản địa.',tags:['Nét Đoài','làng xóm','ký ức','văn hóa'],sort:40},
  {slug:'ha-bang',name:'Hạ Bằng',category:'Con người',lat:20.999,lng:105.535,image:img.people,description:'Nhịp sống địa phương và những câu chuyện bình dị về con người, nơi chốn và sự thay đổi của vùng đất Hòa Lạc.',tags:['Con người','Câu chuyện Hòa Lạc','đời sống'],sort:50}
];

const tours = [
  {
    number:'01',title:'Đoài · Mường',dates:'17–18.10.2026',kicker:'Đi tìm bản sắc',
    description:'Khám phá lớp giá trị cội nguồn của Hòa Lạc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.',
    image:img.village,location:'Hòa Lạc',duration:'17–18/10/2026',audience:'Đăng ký theo form HOLA Tour',sort:10,
    itinerary:[
      {time:'Bắt đầu',title:'Check-in & giới thiệu hành trình',description:'Giới thiệu câu chuyện địa điểm, nguyên tắc sáng tạo và tinh thần đi – nhìn – gặp – trải nghiệm – kể.'},
      {time:'Trong tour',title:'Khám phá làng xóm & kiến trúc truyền thống',description:'Quan sát những lớp không gian gắn với Nét Đoài, ký ức địa phương và đời sống cộng đồng.'},
      {time:'Trong tour',title:'Gặp gỡ & ghi lại câu chuyện',description:'Giao lưu nhân vật địa phương, chụp ảnh, quay video và thu thập tư liệu.'},
      {time:'Kết thúc',title:'Tổng kết tư liệu',description:'Gợi ý phát triển photo story, video phỏng vấn hoặc Story & Creative và cập nhật tư liệu cho HOLA Map.'}
    ],
    highlights:[
      {title:'Cội nguồn',description:'Làng xóm, ký ức và những lớp bản sắc còn hiện diện.'},
      {title:'Người thật · chuyện thật',description:'Ưu tiên câu chuyện từ người gắn bó với vùng đất.'},
      {title:'Tư liệu đa định dạng',description:'Ảnh, video, câu chuyện và địa điểm cho HOLA Map.'}
    ],
    stops:[
      {name:'Làng xóm Xứ Đoài',description:'Tìm một câu chuyện mà bạn muốn Hòa Lạc giữ lại.',image:img.village},
      {name:'Không gian văn hóa Mường',description:'Quan sát con người, đời sống và không gian văn hóa.',image:img.people},
      {name:'Dấu vết kiến trúc truyền thống',description:'Nhìn vật liệu, nếp nhà và những chi tiết gợi ký ức.',image:img.architecture}
    ]
  },
  {
    number:'02',title:'Sắc màu Hòa Lạc',dates:'24–25.10.2026',kicker:'Đi tìm màu sắc',
    description:'Khám phá Hòa Lạc qua 6 đặc trưng sắc màu: Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc; từ kiến trúc, cảnh quan đến con người và đời sống.',
    image:img.architecture,location:'Hòa Lạc',duration:'24–25/10/2026',audience:'Đăng ký theo form HOLA Tour',sort:20,
    itinerary:[
      {time:'Bắt đầu',title:'Nhận diện 6 sắc màu',description:'Giới thiệu cách đọc màu sắc như một lớp câu chuyện thay vì chỉ là màu của cảnh vật.'},
      {time:'Trong tour',title:'Kiến trúc & vật liệu',description:'Quan sát nhà ở, công trình mới, vật liệu và không gian sống.'},
      {time:'Trong tour',title:'Cảnh quan & con người',description:'Tìm màu sắc trong hồ, cây xanh, mặt nước, đô thị mới, sinh viên, người dân và người làm việc tại Hòa Lạc.'},
      {time:'Kết thúc',title:'Chọn câu chuyện phía sau màu sắc',description:'Tổng hợp tư liệu và gợi ý phát triển tác phẩm Sắc màu Hòa Lạc.'}
    ],
    highlights:[
      {title:'06 sắc màu',description:'Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc.'},
      {title:'Kiến trúc đồng hành',description:'kientruchoalac.com đồng hành chuyên môn cho Tour #02.'},
      {title:'Không chỉ là màu',description:'Mỗi sắc màu cần dẫn tới một câu chuyện về vùng đất.'}
    ],
    stops:[
      {name:'Kiến trúc & vật liệu',description:'Nhà ở, công trình mới, vật liệu, không gian sống.',image:img.architecture},
      {name:'Cảnh quan xanh',description:'Hồ, cây xanh, mặt nước và đô thị mới.',image:img.green},
      {name:'Con người Hòa Lạc',description:'Sinh viên, người dân và người đang làm việc tại Hòa Lạc.',image:img.student}
    ]
  },
  {
    number:'03',title:'Nắng Hòa Lạc',dates:'31.10–01.11.2026',kicker:'Đi tìm cảm xúc',
    description:'Khai thác vẻ đẹp ánh sáng và cảm xúc của Hòa Lạc qua bình minh, nắng trên kiến trúc, nắng qua làng xóm, chiều vàng, Ba Vì và hoàng hôn phía Tây.',
    image:img.sunset,location:'Hòa Lạc',duration:'31/10–01/11/2026',audience:'Đăng ký theo form HOLA Tour',sort:30,
    itinerary:[
      {time:'Sớm',title:'Khoảnh khắc nắng đầu ngày',description:'Quan sát ánh sáng sớm trên cảnh quan, con đường và khoảng xanh.'},
      {time:'Trong ngày',title:'Nắng trên kiến trúc & làng xóm',description:'Tìm những lớp bóng, chất liệu và nhịp sống thay đổi theo ánh sáng.'},
      {time:'Chiều',title:'Chiều vàng & phía Tây',description:'Theo dõi ánh sáng cuối ngày, Ba Vì và những khoảng trời mở.'},
      {time:'Kết thúc',title:'Chọn một cảm xúc để kể',description:'Tổng hợp ảnh, video và ghi chú cho tác phẩm Nắng Hòa Lạc.'}
    ],
    highlights:[
      {title:'Ánh sáng là câu chuyện',description:'Không chỉ chụp đẹp mà ghi lại cảm xúc và thời điểm.'},
      {title:'Từ sớm đến chiều',description:'Bình minh, nắng qua kiến trúc, chiều vàng và hoàng hôn.'},
      {title:'Khoảnh khắc phía Tây',description:'Tận dụng địa hình và khoảng trời để kể câu chuyện Hòa Lạc bằng ánh sáng.'}
    ],
    stops:[
      {name:'Nắng sớm',description:'Khoảnh khắc đầu ngày trên khoảng xanh.',image:img.hills},
      {name:'Ánh sáng trên công trình',description:'Nắng, bóng và vật liệu trong không gian kiến trúc.',image:img.architecture},
      {name:'Hoàng hôn phía Tây',description:'Chiều vàng và cảm xúc cuối ngày.',image:img.sunset}
    ]
  }
];

const stories = [
  {
    slug:'halo-hola-2026-52-goc-nhin-1-hoa-lac',title:'HALO HOLA 2026: 52 góc nhìn · 1 Hòa Lạc',author:'Ban biên tập HALO HOLA',role:'Nội dung chính thức',category:'HALO HOLA 2026',location:'Hòa Lạc',readTime:'5 phút đọc',image:img.lake,featured:true,sort:10,
    excerpt:'HALO HOLA 2026 là chương trình sáng tạo cộng đồng để mọi người đi – nhìn – gặp – trải nghiệm – kể – sáng tạo về Hòa Lạc.',
    lead:'Mỗi tuần một góc nhìn. Mỗi góc nhìn một câu chuyện. Từ những lát cắt ấy, HALO HOLA xây dựng một hình ảnh Hòa Lạc vừa có bản sắc, vừa đang chuyển mình.',
    quote:'Không chỉ một cuộc thi — HALO HOLA là một chuỗi hoạt động để khám phá và kể lại Hòa Lạc.',
    body:[
      {heading:'Một chương trình sáng tạo cộng đồng',paragraphs:['HALO HOLA 2026 tìm kiếm hình ảnh và câu chuyện về Hòa Lạc qua bốn loại hình: Photo, Video, Story & Creative, Art & Design. Người tham gia có thể bắt đầu từ một nơi chốn, một ký ức, một con người, một khoảnh khắc ánh sáng hay một thay đổi đang diễn ra.']},
      {heading:'Bốn giá trị xuyên suốt',paragraphs:['Thiên nhiên, Tri thức, Con người và Tương lai là bốn lớp giá trị kết nối những câu chuyện khác nhau. Chương trình đặt truyền thống bên cạnh đô thị, giáo dục và công nghệ để ghi lại Hòa Lạc trong trạng thái đang chuyển mình.']},
      {heading:'Từ nội dung thành tài sản dài hạn',paragraphs:['Sau mùa 2026, các nội dung được tuyển chọn tiếp tục sống trong TOP52, Image Bank, HOLA Map, Calendar 2027 và các hoạt động cộng đồng — theo đúng phạm vi quyền tác giả đã được cấp.']}
    ],gallery:[img.village,img.architecture,img.people]
  },
  {
    slug:'8-chu-de-8-cach-nhin-hoa-lac',title:'8 chủ đề, 8 cách nhìn Hòa Lạc',author:'Ban biên tập HALO HOLA',role:'Nội dung chính thức',category:'Thể lệ · Chủ đề',location:'Hòa Lạc',readTime:'6 phút đọc',image:img.camera,featured:false,sort:20,
    excerpt:'Tám chủ đề mở ra tám hướng tiếp cận: từ Nét Đoài, Sắc Mường, kiến trúc, thiên nhiên đến câu chuyện, ước mơ và sắc màu.',
    lead:'Bạn không cần bắt đầu bằng một bức ảnh “hoàn hảo”. Hãy bắt đầu bằng câu hỏi: mình đang nhìn thấy lớp nào của Hòa Lạc?',quote:'Một góc nhìn không chỉ là một bức ảnh.',
    body:[
      {heading:'01–04 · Bản sắc, con người, không gian và thiên nhiên',paragraphs:['01. Nét Đoài tại Hòa Lạc: con người, làng xóm, kiến trúc, ký ức Xứ Đoài. 02. Sắc Mường Hòa Lạc: con người, đời sống, không gian và văn hóa Mường. 03. Không gian Kiến trúc Hòa Lạc: nhà ở, công trình công cộng, campus, cảnh quan, không gian sống và đô thị đang hình thành. 04. Hòa Lạc xanh: thiên nhiên, cây xanh, mặt nước, môi trường, lối sống xanh và phát triển bền vững.']},
      {heading:'05–07 · Ánh sáng, câu chuyện và ước mơ',paragraphs:['05. Nắng Hòa Lạc: nắng sớm, ánh sáng trên làng xóm và kiến trúc, chiều vàng, hoàng hôn phía Tây. 06. Câu chuyện Hòa Lạc: con người, nơi chốn, ký ức, trải nghiệm và những thay đổi đáng được kể. 07. Ước mơ Hòa Lạc dành cho học sinh – sinh viên.']},
      {heading:'08 · Sắc màu Hòa Lạc',paragraphs:['Sắc màu Hòa Lạc gồm 6 đặc trưng: Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc. Tác phẩm ở mọi chủ đề đều có thể khai báo sắc màu để được xét theo cơ chế của thể lệ.']}
    ],gallery:[img.village,img.green,img.sunset]
  },
  {
    slug:'hola-tour-di-nhin-gap-trai-nghiem-ke',title:'HOLA Tour: đi – nhìn – gặp – trải nghiệm – kể',author:'Ban biên tập HALO HOLA',role:'Nội dung chính thức',category:'HOLA Tour',location:'Hòa Lạc',readTime:'5 phút đọc',image:img.people,featured:false,sort:30,
    excerpt:'Ba hành trình cuối tuần giúp người tham gia chạm vào bản sắc, màu sắc và cảm xúc của Hòa Lạc bằng trải nghiệm thực tế.',
    lead:'HOLA Tour không chỉ là chuyến đi chụp ảnh. Mỗi hành trình được thiết kế để tạo ra hình ảnh, video, câu chuyện và địa điểm cho HOLA Map.',quote:'Tham gia tour không tạo lợi thế khi chấm giải; tác phẩm từ tour vẫn tuân thủ đầy đủ thể lệ HALO HOLA.',
    body:[
      {heading:'Tour #01 · Đoài · Mường · 17–18/10',paragraphs:['Đi tìm bản sắc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.']},
      {heading:'Tour #02 · Sắc màu Hòa Lạc · 24–25/10',paragraphs:['Đi tìm 6 sắc màu qua kiến trúc, cảnh quan và con người. kientruchoalac.com đồng hành chuyên môn kiến trúc.']},
      {heading:'Tour #03 · Nắng Hòa Lạc · 31/10–01/11',paragraphs:['Đi tìm cảm xúc qua bình minh, nắng trên kiến trúc, nắng qua làng xóm, chiều vàng, Ba Vì và hoàng hôn phía Tây.']}
    ],gallery:[img.village,img.architecture,img.sunset]
  },
  {
    slug:'hoa-lac-trong-ban-co-mau-gi',title:'Hòa Lạc trong bạn có màu gì?',author:'Ban biên tập HALO HOLA',role:'Nội dung chính thức',category:'Sắc màu Hòa Lạc',location:'Hòa Lạc',readTime:'4 phút đọc',image:img.green,featured:false,sort:40,
    excerpt:'Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc — sáu đặc trưng để kể một vùng đất bằng màu sắc và câu chuyện.',
    lead:'Màu sắc trong HALO HOLA không chỉ là bảng màu thị giác. Mỗi sắc cần gắn với một lát cắt, một cảm xúc hoặc một câu chuyện của Hòa Lạc.',quote:'Không chỉ tìm màu sắc trong cảnh vật — hãy tìm câu chuyện phía sau màu sắc.',
    body:[
      {heading:'06 đặc trưng sắc màu',paragraphs:['Sắc Đá ong · Sắc Nắng · Sắc Xanh rêu · Sắc Xanh non · Sắc Be · Sắc Hòa Lạc.']},
      {heading:'Khác với chủ đề Nắng Hòa Lạc',paragraphs:['Chủ đề 05 Nắng Hòa Lạc tập trung vào ánh sáng và khoảnh khắc. Sắc Nắng là câu chuyện của màu nắng và có thể xuất hiện trong tác phẩm thuộc bất kỳ chủ đề nào.']},
      {heading:'Một chiến dịch cộng đồng',paragraphs:['“Hòa Lạc trong bạn có màu gì?” cũng được dùng như một câu hỏi cộng đồng để thu nhận insight; bình chọn màu sắc không thay thế kết quả xét giải.']}
    ],gallery:[img.village,img.sunset,img.green]
  },
  {
    slug:'hola-day-2026-noi-52-goc-nhin-hoi-tu',title:'HOLA DAY 2026: nơi 52 góc nhìn hội tụ',author:'Ban biên tập HALO HOLA',role:'Nội dung chính thức',category:'HOLA DAY',location:'Hòa Lạc',readTime:'5 phút đọc',image:img.event,featured:false,sort:50,
    excerpt:'Ngày 28/11/2026, HOLA DAY hội tụ triển lãm TOP52, HOLA TALK, trao giải, cộng đồng và những sản phẩm dài hạn của mùa 2026.',
    lead:'HOLA DAY là ngày hội sáng tạo và khám phá Hòa Lạc, nơi những nội dung được tạo ra trong hành trình từ 10/10 đến 28/11 gặp nhau trong một không gian chung.',quote:'Hôm nay, 52 góc nhìn tiêu biểu cùng hội tụ về đây.',
    body:[
      {heading:'15:00–16:00 · 52 góc nhìn',paragraphs:['Mở cửa, check-in, installation CHECK IN HOALAC, tham quan TOP52 theo 8 khu, khu Sắc màu Hòa Lạc và các hoạt động tương tác.']},
      {heading:'16:00–16:45 · HOLA TALK',paragraphs:['HOLA TALK với chủ đề “52 góc nhìn – Một Hòa Lạc đang chuyển mình”, kết nối các lớp Thiên nhiên, Tri thức, Con người và Tương lai.']},
      {heading:'Sau ngày 28/11',paragraphs:['TOP52 tiếp tục được phát triển thành album online, Calendar 2027, Digital Archive, HOLA Map, Collection, Creator Network và WE HOLA.']}
    ],gallery:[img.event,img.people,img.camera]
  },
  {
    slug:'hoa-lac-thien-nhien-tri-thuc-con-nguoi-tuong-lai',title:'Hòa Lạc: Thiên nhiên · Tri thức · Con người · Tương lai',author:'Ban biên tập HALO HOLA',role:'Nội dung chính thức',category:'Câu chuyện Hòa Lạc',location:'Hòa Lạc',readTime:'5 phút đọc',image:img.hills,featured:false,sort:60,
    excerpt:'Bốn lớp giá trị là khung để HALO HOLA kể một Hòa Lạc vừa có ký ức, vừa có những cộng đồng mới và tương lai đang hình thành.',
    lead:'Hòa Lạc không được kể bằng một hình ảnh duy nhất. Chương trình chọn bốn lớp giá trị để các câu chuyện cũ và mới có thể đứng cạnh nhau.',quote:'Truyền thống bên cạnh đô thị, giáo dục và công nghệ.',
    body:[
      {heading:'Thiên nhiên',paragraphs:['Đồi, hồ, cây xanh, mặt nước và những khoảng trời tạo nên nền cảnh quan cho các câu chuyện về Hòa Lạc xanh, ánh sáng và trải nghiệm.']},
      {heading:'Tri thức',paragraphs:['Các không gian học tập, nghiên cứu, công nghệ và sáng tạo tạo nên một lớp Hòa Lạc mới — nơi tri thức trở thành một phần của đời sống địa phương.']},
      {heading:'Con người & Tương lai',paragraphs:['Người dân, học sinh – sinh viên, creator, kiến trúc sư, doanh nghiệp và những cộng đồng mới cùng tạo nên một Hòa Lạc đang thay đổi.']}
    ],gallery:[img.green,img.student,img.architecture]
  }
];

const partners = [
  {name:'HOLA space',tier:'Tổ chức tổng thể',description:'Tổ chức tổng thể HALO HOLA 2026 và kết nối các nhóm vận hành.',website:null,sort:10},
  {name:'HOLA Media',tier:'Truyền thông & nội dung',description:'Phụ trách truyền thông, nội dung và lan tỏa câu chuyện Hòa Lạc.',website:null,sort:20},
  {name:'CHECK IN HOALAC',tier:'Cộng đồng mở',description:'Điểm chạm cộng đồng mở để chia sẻ góc nhìn, check-in và kết nối người quan tâm đến Hòa Lạc.',website:null,sort:30},
  {name:'Kiến Trúc Hòa Lạc',tier:'Đồng hành chuyên môn',description:'Đồng hành chuyên môn kiến trúc, đặc biệt ở trục Không gian Kiến trúc Hòa Lạc và HOLA Tour #02.',website:'https://kientruchoalac.com',sort:40},
  {name:'Đô Thị Hòa Lạc',tier:'Thông tin đô thị',description:'Kênh thông tin về đô thị và những thay đổi đang diễn ra tại Hòa Lạc.',website:'https://dothihoalac.vn',sort:50}
];

const sections = {
  header:{ctaText:'GỬI GÓC NHÌN'},
  hero:{eyebrow:'NƠI NHỮNG CÂU CHUYỆN HÒA LẠC ĐƯỢC KỂ LẠI',titleLine1:'HELLO',titleAccent:'HÒA LẠC',tagline:'52 góc nhìn · 1 Hòa Lạc',description:'Mỗi tuần một góc nhìn. Mỗi góc nhìn một câu chuyện.'},
  campaign:{eyebrow:'HALO HOLA 2026',title:'Mỗi ngày thêm một góc nhìn mới.',description:'Cùng khám phá, ghi lại và kể những câu chuyện về Hòa Lạc qua hình ảnh, video, câu chuyện và thiết kế.',ctaText:'Gửi góc nhìn'},
  change:{title:'Hòa Lạc đang thay đổi',description:'Từ những lớp bản sắc Xứ Đoài, văn hóa Mường và cảnh quan tự nhiên, Hòa Lạc hôm nay đang đón nhận tri thức, công nghệ, đô thị và những cộng đồng mới.'},
  themes:{eyebrow:'8 CHỦ ĐỀ · 4 LOẠI HÌNH SÁNG TẠO',title:'8 chủ đề về Hòa Lạc',description:'Từ Nét Đoài, Sắc Mường, kiến trúc và thiên nhiên đến nắng, câu chuyện, ước mơ và 6 đặc trưng Sắc màu Hòa Lạc.'},
  colors:{eyebrow:'SẮC MÀU HÒA LẠC',title:'Hòa Lạc trong bạn có màu gì?',description:'Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc — mỗi màu là một lát cắt và một câu chuyện.'},
  tours:{eyebrow:'CÙNG ĐI · CÙNG CẢM · CÙNG KỂ CHUYỆN',title:'HOLA Tour',description:'Ba hành trình trải nghiệm giúp người tham gia đi – nhìn – gặp – trải nghiệm – sáng tạo về Hòa Lạc.'},
  map:{eyebrow:'ĐỊA ĐIỂM · CÂU CHUYỆN · GÓC NHÌN',title:'HOLA Map',description:'Lưu lại những điểm chạm của Hòa Lạc từ cảnh quan, tri thức, văn hóa, kiến trúc đến những câu chuyện cộng đồng.'},
  stories:{eyebrow:'NHỮNG CÂU CHUYỆN TRUYỀN CẢM HỨNG',title:'TOP52 / Stories',description:'Nội dung chính thức, câu chuyện cộng đồng và những góc nhìn được tuyển chọn trong hành trình HALO HOLA 2026.'},
  community:{eyebrow:'CỘNG ĐỒNG · KẾT NỐI · HÀNH ĐỘNG',title:'WE HOLA – Chúng ta là Hòa Lạc',description:'Cộng đồng hành động tiếp nối HALO HOLA, cùng lan tỏa giá trị và đóng góp cho một Hòa Lạc xanh hơn, đẹp hơn và giàu bản sắc hơn.'}
};

const settings = {
  brand:{siteName:'HALO HOLA',tagline:'52 góc nhìn · 1 Hòa Lạc'},
  seo:{defaultTitle:'HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc',defaultDescription:'Chương trình sáng tạo cộng đồng khám phá, ghi lại và kể những câu chuyện về Hòa Lạc qua Photo, Video, Story & Creative, Art & Design.',canonicalDomain:env.publicBaseUrl},
  footer:{email:'admin@halohola.vn',description:'HALO HOLA — nơi những câu chuyện về Hòa Lạc được khám phá, ghi lại và kể tiếp.'}
};

const client = await pool.connect();

try {
  await client.query('BEGIN');

  for (const p of places) {
    await client.query(
      `INSERT INTO places (slug,name,category,lat,lng,image,description,published,tags,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE,$8::jsonb,$9)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,category=EXCLUDED.category,lat=EXCLUDED.lat,lng=EXCLUDED.lng,
       image=COALESCE(places.image,EXCLUDED.image),description=EXCLUDED.description,published=TRUE,tags=EXCLUDED.tags,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
      [p.slug,p.name,p.category,p.lat,p.lng,p.image,p.description,JSON.stringify(p.tags),p.sort]
    );
  }

  for (const t of tours) {
    await client.query(
      `INSERT INTO tours (number,title,dates,kicker,description,image,status,capacity,itinerary,highlights,stops,location,duration_label,audience_label,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,'PUBLISHED',20,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12,$13)
       ON CONFLICT (number) DO UPDATE SET title=EXCLUDED.title,dates=EXCLUDED.dates,kicker=EXCLUDED.kicker,description=EXCLUDED.description,
       image=COALESCE(tours.image,EXCLUDED.image),status='PUBLISHED',itinerary=EXCLUDED.itinerary,highlights=EXCLUDED.highlights,stops=EXCLUDED.stops,
       location=EXCLUDED.location,duration_label=EXCLUDED.duration_label,audience_label=EXCLUDED.audience_label,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
      [t.number,t.title,t.dates,t.kicker,t.description,t.image,JSON.stringify(t.itinerary),JSON.stringify(t.highlights),JSON.stringify(t.stops),t.location,t.duration,t.audience,t.sort]
    );
  }

  for (const s of stories) {
    const content=s.body.flatMap(x=>[x.heading,...x.paragraphs]).join('\n\n');
    await client.query(
      `INSERT INTO stories (slug,title,author,role,category,location,read_time,excerpt,lead,quote,content,image,body,gallery,featured,published,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15,TRUE,$16)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,author=EXCLUDED.author,role=EXCLUDED.role,category=EXCLUDED.category,location=EXCLUDED.location,
       read_time=EXCLUDED.read_time,excerpt=EXCLUDED.excerpt,lead=EXCLUDED.lead,quote=EXCLUDED.quote,content=EXCLUDED.content,
       image=COALESCE(stories.image,EXCLUDED.image),body=EXCLUDED.body,gallery=CASE WHEN jsonb_array_length(stories.gallery)>0 THEN stories.gallery ELSE EXCLUDED.gallery END,
       featured=EXCLUDED.featured,published=TRUE,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
      [s.slug,s.title,s.author,s.role,s.category,s.location,s.readTime,s.excerpt,s.lead,s.quote,content,s.image,JSON.stringify(s.body),JSON.stringify(s.gallery),s.featured,s.sort]
    );
  }

  const names=partners.map(x=>x.name);
  await client.query('DELETE FROM partners WHERE name = ANY($1::text[])',[names]);
  for (const p of partners) {
    await client.query('INSERT INTO partners (name,tier,description,website,published,sort_order) VALUES ($1,$2,$3,$4,TRUE,$5)',[p.name,p.tier,p.description,p.website,p.sort]);
  }

  for (const [key,content] of Object.entries(sections)) {
    await client.query(`UPDATE site_sections SET content=COALESCE(content,'{}'::jsonb) || $2::jsonb,enabled=TRUE,updated_at=NOW() WHERE section_key=$1`,[key,JSON.stringify(content)]);
  }

  for (const [key,value] of Object.entries(settings)) {
    await client.query(`INSERT INTO site_settings (setting_key,value,updated_at) VALUES ($1,$2::jsonb,NOW()) ON CONFLICT (setting_key) DO UPDATE SET value=site_settings.value || EXCLUDED.value,updated_at=NOW()`,[key,JSON.stringify(value)]);
  }

  await client.query('COMMIT');
  console.log(`HALO HOLA official content seed complete: ${stories.length} stories, ${tours.length} tours, ${places.length} places, ${partners.length} ecosystem partners.`);
  console.log('Submission/TOP52 data is intentionally not fabricated; it should come from real participant submissions.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
