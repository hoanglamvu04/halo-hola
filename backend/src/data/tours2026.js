const imageVillage='https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85';
const imagePeople='https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85';
const imageStudent='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85';
const imageArchitecture='https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85';
const imageGreen='https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85';

export const HOLA_TOURS_2026 = [
  {
    number:'01',
    title:'Đoài · Mường',
    dates:'25.10.2026',
    durationLabel:'1 ngày · 25/10/2026',
    kicker:'Đi tìm bản sắc',
    description:'Khám phá lớp giá trị cội nguồn của Hòa Lạc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.',
    image:imageVillage,
    location:'Hòa Lạc',
    audienceLabel:'Đăng ký theo form HOLA Tour',
    sortOrder:10,
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
      {name:'Làng xóm Xứ Đoài',description:'Tìm một câu chuyện mà bạn muốn Hòa Lạc giữ lại.',image:imageVillage},
      {name:'Không gian văn hóa Mường',description:'Quan sát con người, đời sống và không gian văn hóa.',image:imagePeople},
      {name:'Dấu vết kiến trúc truyền thống',description:'Nhìn vật liệu, nếp nhà và những chi tiết gợi ký ức.',image:imageArchitecture}
    ]
  },
  {
    number:'02',
    title:'Sắc màu Hòa Lạc',
    dates:'25.10.2026',
    durationLabel:'1 ngày · 25/10/2026',
    kicker:'Đi tìm màu sắc',
    description:'Khám phá Hòa Lạc qua 6 đặc trưng sắc màu: Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc; từ kiến trúc, cảnh quan đến con người và đời sống.',
    image:imageArchitecture,
    location:'Hòa Lạc',
    audienceLabel:'Đăng ký theo form HOLA Tour',
    sortOrder:20,
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
      {name:'Kiến trúc & vật liệu',description:'Nhà ở, công trình mới, vật liệu, không gian sống.',image:imageArchitecture},
      {name:'Cảnh quan xanh',description:'Hồ, cây xanh, mặt nước và đô thị mới.',image:imageGreen},
      {name:'Con người Hòa Lạc',description:'Sinh viên, người dân và người đang làm việc tại Hòa Lạc.',image:imageStudent}
    ]
  },
  {
    number:'03',
    title:'Làng nghề Hòa Lạc',
    dates:'25.10.2026',
    durationLabel:'1 ngày · 25/10/2026',
    kicker:'Đi tìm bàn tay nghề',
    description:'Khám phá những lớp nghề thủ công quanh Hòa Lạc qua không gian làng, vật liệu, bàn tay người thợ, câu chuyện sinh kế và cách các nghề truyền thống đang tiếp tục sống trong nhịp hiện đại.',
    image:imageVillage,
    location:'Hòa Lạc',
    audienceLabel:'Đăng ký theo form HOLA Tour',
    sortOrder:30,
    itinerary:[
      {time:'Bắt đầu',title:'Gặp làng nghề & câu chuyện bản địa',description:'Mở hành trình bằng câu chuyện về nghề, không gian làng và những người đang giữ nhịp sống thủ công tại Hòa Lạc.'},
      {time:'Trong tour',title:'Theo dấu bàn tay người thợ',description:'Quan sát quy trình làm nghề, thao tác thủ công, công cụ và những chi tiết tạo nên dấu ấn riêng của từng sản phẩm.'},
      {time:'Trong tour',title:'Vật liệu · kỹ thuật · sản phẩm',description:'Tìm câu chuyện trong vật liệu, kỹ thuật, không gian xưởng và cách nghề truyền thống thích nghi với đời sống hôm nay.'},
      {time:'Kết thúc',title:'Kể lại một nghề bằng góc nhìn của bạn',description:'Tổng hợp ảnh, video, ghi chú và câu chuyện nhân vật để phát triển thành tác phẩm HALO HOLA.'}
    ],
    highlights:[
      {title:'Người thật · nghề thật',description:'Ưu tiên gặp gỡ người làm nghề và ghi lại câu chuyện từ chính trải nghiệm thực tế.'},
      {title:'Từ vật liệu đến sản phẩm',description:'Theo dõi hành trình của vật liệu, bàn tay người thợ và những kỹ thuật tạo nên sản phẩm.'},
      {title:'Ký ức & sinh kế',description:'Nhìn làng nghề như một phần của ký ức địa phương, đời sống cộng đồng và sinh kế đang tiếp tục chuyển mình.'}
    ],
    stops:[
      {name:'Không gian làng nghề',description:'Quan sát cấu trúc làng, nhịp sống và những dấu vết nghề còn hiện diện trong không gian địa phương.',image:imageVillage},
      {name:'Xưởng thủ công địa phương',description:'Tiếp cận quy trình, công cụ, vật liệu và cách người thợ làm ra sản phẩm.',image:imageArchitecture},
      {name:'Câu chuyện người làm nghề',description:'Gặp gỡ, trò chuyện và ghi lại chân dung những người đang gìn giữ hoặc làm mới nghề truyền thống.',image:imagePeople}
    ]
  }
];

export const HOLA_TOUR_STORY_2026 = {
  excerpt:'Ba hành trình HOLA Tour cùng diễn ra trong một ngày 25/10/2026, giúp người tham gia chạm vào bản sắc, màu sắc và làng nghề Hòa Lạc bằng trải nghiệm thực tế.',
  body:[
    {heading:'Tour #01 · Đoài · Mường · 25/10',paragraphs:['Đi tìm bản sắc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.']},
    {heading:'Tour #02 · Sắc màu Hòa Lạc · 25/10',paragraphs:['Đi tìm 6 sắc màu qua kiến trúc, cảnh quan và con người. kientruchoalac.com đồng hành chuyên môn kiến trúc.']},
    {heading:'Tour #03 · Làng nghề Hòa Lạc · 25/10',paragraphs:['Đi vào không gian làng nghề, gặp người làm nghề, quan sát vật liệu, kỹ thuật thủ công và ghi lại những câu chuyện về ký ức, sinh kế và sự tiếp nối của nghề truyền thống quanh Hòa Lạc.']}
  ]
};
