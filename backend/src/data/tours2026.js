const imageVillage='https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85';
const imagePeople='https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85';
const imageStudent='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85';
const imageArchitecture='https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85';
const imageGreen='https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85';
const imageSunset='https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85';

export const HOLA_TOURS_2026 = [
  {
    number:'01',
    title:'Đi tìm Bản sắc',
    dates:'25.10.2026',
    durationLabel:'07:30–18:30 · 25/10/2026',
    kicker:'Đoài · Mường — đất · làng · nghề · con người · ký ức',
    description:'Một ngày đi sâu vào hai lớp văn hóa Đoài và Mường qua không gian, làng xóm, nghề, đời sống, con người và ký ức. Không chạy thật nhiều điểm; ưu tiên gặp người thật, nghe câu chuyện thật và mang về tư liệu đủ sâu để tiếp tục biên tập.',
    image:imageVillage,
    location:'Tây Phương · Thạch Xá · Yên Xuân/Tiến Xuân',
    audienceLabel:'Hành trình săn câu chuyện HALO HOLA',
    sortOrder:10,
    itinerary:[
      {time:'07:30–08:00',title:'Tập trung · Briefing',description:'Gặp nhau tại điểm chung, chia nhóm, thống nhất vai trò và mục tiêu: Đi → Nhìn → Gặp → Nghe → Ghi lại.'},
      {time:'08:00–09:15',title:'Cụm 01 · Tây Phương',description:'Khám phá không gian, đá, kiến trúc và chất Đoài qua cảnh rộng, con người trong không gian và các chi tiết vật liệu, mái, cửa, tường, cây cối.'},
      {time:'09:15–09:35',title:'Di chuyển + buffer',description:'Giữ khoảng dự phòng cho di chuyển, phát sinh và hoàn thiện những asset còn thiếu ở cụm đầu.'},
      {time:'09:35–11:15',title:'Cụm 02 · Thạch Xá',description:'Từ làng đến nghề, từ nghề đến con người. Ưu tiên 1–2 nhân vật có câu chuyện đủ tốt thay vì chạy qua nhiều hộ gia đình.'},
      {time:'11:15–11:30',title:'Buffer buổi sáng',description:'Hoàn tất quote, contact, ảnh chân dung hoặc B-roll còn thiếu trước khi nghỉ trưa.'},
      {time:'11:30–12:45',title:'Ăn trưa',description:'Nghỉ và trao đổi nhanh những câu chuyện đã gặp trong nửa ngày đầu.'},
      {time:'12:45–13:00',title:'Review tư liệu',description:'Kiểm tra cảnh rộng, con người, chi tiết, quote, lead câu chuyện và những nhân vật cần quay lại.'},
      {time:'13:00–13:40',title:'Di chuyển sang khu vực Mường',description:'Đóng phần Đoài và chuyển sang một hành trình mới, không cố nối hai lớp văn hóa bằng một kết luận có sẵn.'},
      {time:'13:40–15:50',title:'Cụm 03 · Mường',description:'Khám phá cộng đồng, nếp sống, văn hóa, con người và ký ức tại khu vực Yên Xuân/Tiến Xuân bằng chính đời sống và câu chuyện của người Mường.'},
      {time:'15:50–16:15',title:'Buffer · Follow-up · Chốt tư liệu',description:'Tiếp tục nếu đang có câu chuyện tốt; nếu đã đủ thì lấy thêm B-roll, contact, tên nhân vật, quote và review nhanh.'},
      {time:'16:15–17:00',title:'Di chuyển về điểm hội tụ',description:'16:15 là mốc đóng hành trình riêng của Tour #01 để ba tour có thể gặp nhau đúng kế hoạch.'},
      {time:'17:00–18:30',title:'03 HOLA TOUR hội tụ',description:'Mỗi nhóm chia sẻ 03 ảnh, 01 nhân vật, 01 quote, 01 câu chuyện và 01 điều mới phát hiện trong ngày.'}
    ],
    highlights:[
      {title:'ĐOÀI · Buổi sáng',description:'Đất → Làng → Nghề → Con người → Ký ức. Câu hỏi dẫn đường: Điều gì làm nên chất Đoài?'},
      {title:'MƯỜNG · Buổi chiều',description:'Cộng đồng → Nếp sống → Văn hóa → Con người → Ký ức. Câu hỏi dẫn đường: Điều gì làm nên bản sắc Mường?'},
      {title:'Đi sâu thay vì đi nhiều',description:'Ba cụm chính đủ để quan sát, gặp gỡ, nghe chuyện và thu tư liệu có chiều sâu.'},
      {title:'Con người là trung tâm',description:'Ưu tiên nhân vật, ký ức, quote và câu chuyện thật; không biến người dân thành đạo cụ văn hóa.'},
      {title:'Lịch cứng 70% · linh hoạt 30%',description:'Cứng ở giờ tập trung, thứ tự ba cụm, 16:15 đóng tour riêng và 17:00 hội tụ; linh hoạt ở câu chuyện nào cần đào sâu.'}
    ],
    stops:[
      {name:'Cụm 01 · Tây Phương',description:'Không gian · Đá · Kiến trúc · Chất Đoài. Bắt đầu bằng việc nhìn thấy Đoài qua làng xóm, vật liệu và dấu vết thời gian.',image:imageVillage},
      {name:'Cụm 02 · Thạch Xá',description:'Làng · Nghề · Con người · Ký ức. Tìm 1–2 nhân vật có câu chuyện đủ tốt thay vì chỉ giới thiệu một làng nghề.',image:imageArchitecture},
      {name:'Cụm 03 · Mường · Yên Xuân/Tiến Xuân',description:'Cộng đồng · Nếp sống · Văn hóa · Con người · Ký ức. Khám phá văn hóa Mường bằng chính đời sống và câu chuyện của người Mường.',image:imagePeople}
    ]
  },
  {
    number:'02',
    title:'Đi tìm Màu sắc',
    dates:'25.10.2026',
    durationLabel:'1 ngày · 25/10/2026',
    kicker:'Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc',
    description:'Khám phá Hòa Lạc qua 6 sắc màu: Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc — từ cảnh quan, kiến trúc đến con người và đời sống.',
    image:imageArchitecture,
    location:'Hòa Lạc',
    audienceLabel:'Hành trình săn câu chuyện HALO HOLA',
    sortOrder:20,
    itinerary:[
      {time:'Bắt đầu',title:'Nhận diện 6 sắc màu Hòa Lạc',description:'Đọc màu sắc như một lớp câu chuyện: màu của vật liệu, ánh sáng, cảnh quan, con người và nhịp sống.'},
      {time:'Trong tour',title:'Đá ong · Be · kiến trúc',description:'Quan sát nhà ở, công trình, vật liệu và những không gian thể hiện bảng màu đặc trưng của vùng đất.'},
      {time:'Trong tour',title:'Xanh rêu · Xanh non · cảnh quan',description:'Tìm màu sắc trong hồ, cây xanh, mặt nước, địa hình và những không gian Hòa Lạc đang chuyển mình.'},
      {time:'Kết thúc',title:'Tìm câu chuyện phía sau màu sắc',description:'Chọn một sắc màu và phát triển nó thành ảnh, video, quote hoặc câu chuyện có nhân vật và bối cảnh.'}
    ],
    highlights:[
      {title:'06 sắc màu',description:'Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc.'},
      {title:'Màu sắc có câu chuyện',description:'Không chỉ tìm màu trong cảnh vật mà tìm con người, ký ức và chuyển động phía sau màu sắc.'},
      {title:'Không gian & đời sống',description:'Kết nối kiến trúc, cảnh quan, công nghệ và nhịp sống Hòa Lạc trong cùng một hành trình.'}
    ],
    stops:[
      {name:'Kiến trúc & vật liệu',description:'Đá ong, tông Be, nhà ở, công trình mới và không gian sống.',image:imageArchitecture},
      {name:'Cảnh quan xanh',description:'Xanh rêu, Xanh non, hồ, cây xanh, mặt nước và địa hình.',image:imageGreen},
      {name:'Con người & Sắc Hòa Lạc',description:'Tìm những màu sắc mới từ sinh viên, người dân, công nghệ và đời sống hiện đại.',image:imageStudent}
    ]
  },
  {
    number:'03',
    title:'Đi tìm Cảm xúc',
    dates:'25.10.2026',
    durationLabel:'1 ngày · 25/10/2026',
    kicker:'Con người · đời sống · không gian · nắng chiều · khoảnh khắc',
    description:'Đi tìm cảm xúc Hòa Lạc qua con người, đời sống, không gian, nắng chiều và những khoảnh khắc đời thường đáng được giữ lại.',
    image:imageSunset,
    location:'Hòa Lạc',
    audienceLabel:'Hành trình săn câu chuyện HALO HOLA',
    sortOrder:30,
    itinerary:[
      {time:'Bắt đầu',title:'Gặp một Hòa Lạc đời thường',description:'Bắt đầu từ những nhịp sống gần gũi: người đi làm, sinh viên, quán xá, đường làng, khoảng sân và những cuộc gặp bất ngờ.'},
      {time:'Trong tour',title:'Theo dấu con người & đời sống',description:'Gặp nhân vật, quan sát sinh hoạt và tìm những khoảnh khắc có cảm xúc thay vì chỉ săn một khung hình đẹp.'},
      {time:'Chiều',title:'Không gian & nắng chiều',description:'Theo ánh sáng cuối ngày qua kiến trúc, cây xanh, mặt nước và những khoảng mở để ghi lại cảm xúc Hòa Lạc.'},
      {time:'Kết thúc',title:'Chọn một khoảnh khắc muốn kể lại',description:'Tổng hợp ảnh, video, quote và câu chuyện ngắn để đưa vào hệ thống 52 góc nhìn.'}
    ],
    highlights:[
      {title:'Con người thật · cảm xúc thật',description:'Nhân vật và khoảnh khắc đời thường là trung tâm của hành trình.'},
      {title:'Đời sống Hòa Lạc',description:'Tìm câu chuyện trong những điều nhỏ: quán xá, đường đi, sinh hoạt, gặp gỡ và chuyển động mỗi ngày.'},
      {title:'Nắng chiều & khoảnh khắc',description:'Ánh sáng cuối ngày giúp kể những câu chuyện mềm, gần gũi và giàu cảm xúc.'}
    ],
    stops:[
      {name:'Nhịp sống cộng đồng',description:'Gặp người, quan sát sinh hoạt và tìm một khoảnh khắc đời thường có câu chuyện.',image:imagePeople},
      {name:'Không gian Hòa Lạc hôm nay',description:'Ghi lại cách con người tương tác với kiến trúc, đường phố và những không gian mới.',image:imageArchitecture},
      {name:'Nắng chiều Hòa Lạc',description:'Theo ánh sáng cuối ngày để kết thúc hành trình bằng một cảm xúc muốn giữ lại.',image:imageSunset}
    ]
  }
];

export const HOLA_TOUR_STORY_2026 = {
  excerpt:'HOLA Tour chuyển từ tour sáng tác thành hành trình săn câu chuyện với ba hướng: Đi tìm Bản sắc · Đi tìm Màu sắc · Đi tìm Cảm xúc.',
  body:[
    {heading:'Tour #01 · Đi tìm Bản sắc · 25/10',paragraphs:['Đoài · Mường — buổi sáng đi qua đất, làng, nghề, con người và ký ức Xứ Đoài; buổi chiều bước vào cộng đồng, nếp sống, văn hóa, con người và ký ức Mường. Mục tiêu không phải đi nhiều nơi mà tìm được những câu chuyện đáng giữ lại.']},
    {heading:'Tour #02 · Đi tìm Màu sắc · 25/10',paragraphs:['Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc — tìm câu chuyện phía sau màu sắc trong cảnh quan, kiến trúc, con người và đời sống.']},
    {heading:'Tour #03 · Đi tìm Cảm xúc · 25/10',paragraphs:['Con người · đời sống · không gian · nắng chiều · những khoảnh khắc Hòa Lạc — ghi lại cảm xúc thật và những câu chuyện đời thường có thể đưa vào hệ thống 52 góc nhìn.']}
  ]
};
