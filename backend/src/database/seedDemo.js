import { pool } from './pool.js';

const mediaImages = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=88',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=88'
];

const demoSubmissions = [
  {
    code:'HH26-DEMO01',name:'Nguyễn Minh An',display:'Minh An · dữ liệu mẫu',email:'demo01@halohola.invalid',phone:'0900000001',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Nắng đi qua bờ hồ',captured:'2026-09-28',
    type:'Photo',theme:'Nắng Hòa Lạc',color:'Nắng',location:'Hồ Đồng Mô',status:'TOP52',
    story:'Một buổi sớm, lớp nắng mỏng trải trên mặt hồ tạo nên cảm giác Hòa Lạc vừa tĩnh vừa mở. Tác phẩm thử nghiệm cách kể câu chuyện vùng đất bằng ánh sáng thay vì chỉ ghi lại phong cảnh.',
    jury:'Bố cục tốt, cảm xúc rõ, phù hợp tinh thần Nắng Hòa Lạc.',image:mediaImages[5]
  },
  {
    code:'HH26-DEMO02',name:'Trần Mai Anh',display:'Mai Anh · dữ liệu mẫu',email:'demo02@halohola.invalid',phone:'0900000002',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Một khoảng xanh đang lớn lên',captured:'2026-09-29',
    type:'Photo',theme:'Hòa Lạc xanh',color:'Xanh rêu',location:'Hòa Lạc',status:'TOP52',
    story:'Cây xanh, mặt nước và những công trình mới cùng xuất hiện trong một khung hình. Góc nhìn đặt câu hỏi về cách một đô thị mới có thể lớn lên mà vẫn giữ được lớp thiên nhiên bản địa.',
    jury:'Hình ảnh giàu lớp, đúng trục thiên nhiên – tương lai.',image:mediaImages[4]
  },
  {
    code:'HH26-DEMO03',name:'Lê Quang Huy',display:'Quang Huy · dữ liệu mẫu',email:'demo03@halohola.invalid',phone:'0900000003',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Nhịp mới trong một khoảng cũ',captured:'2026-09-27',
    type:'Photo',theme:'Không gian Kiến trúc Hòa Lạc',color:'Be',location:'Khu Công nghệ cao Hòa Lạc',status:'SHORTLIST',
    story:'Những mảng kính, đường đi và khoảng cây xanh cho thấy một nhịp sống mới đang hình thành. Tác phẩm tập trung vào mối quan hệ giữa kiến trúc, con người và cảnh quan.',
    jury:'Có câu chuyện, cần thêm chi tiết con người để tăng chiều sâu.',image:mediaImages[3]
  },
  {
    code:'HH26-DEMO04',name:'Đinh Thị Mai',display:'Thị Mai · dữ liệu mẫu',email:'demo04@halohola.invalid',phone:'0900000004',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Chuyện bên hiên nhà',captured:'2026-09-26',
    type:'Story & Creative',theme:'Câu chuyện Hòa Lạc',color:'Đá ong',location:'Thạch Hòa',status:'TOP52',
    story:'Một cuộc trò chuyện ngắn bên hiên nhà mở ra những ký ức về đường làng, mùa vụ, những lần đổi nghề và cách một gia đình nhìn thấy Hòa Lạc thay đổi qua nhiều năm.',
    jury:'Chân thật, có nhân vật và chi tiết địa phương.',image:mediaImages[2]
  },
  {
    code:'HH26-DEMO05',name:'Phạm Gia Bảo',display:'Gia Bảo · dữ liệu mẫu',email:'demo05@halohola.invalid',phone:'0900000005',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Đá ong còn kể chuyện',captured:'2026-09-25',
    type:'Photo',theme:'Nét Đoài tại Hòa Lạc',color:'Đá ong',location:'Hạ Bằng',status:'AWARDED',
    story:'Bề mặt đá ong không chỉ là vật liệu. Những vệt thời gian trên tường gợi ra một Hòa Lạc từng được dựng nên từ những thứ rất gần với đất và đời sống địa phương.',
    jury:'Mạnh về bản sắc, hình ảnh và câu chuyện thống nhất.',image:mediaImages[2]
  },
  {
    code:'HH26-DEMO06',name:'Vũ Hoàng Linh',display:'Hoàng Linh · dữ liệu mẫu',email:'demo06@halohola.invalid',phone:'0900000006',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Một ngày của sinh viên Hòa Lạc',captured:'2026-09-30',
    type:'Video',theme:'Ước mơ Hòa Lạc',color:'Xanh non',location:'ĐHQG Hà Nội tại Hòa Lạc',status:'TOP52',
    story:'Video theo chân một sinh viên từ ký túc xá, lớp học, thư viện đến khoảng sân cuối ngày. Ước mơ về tri thức hiện ra qua những việc rất nhỏ và nhịp sống thật.',
    jury:'Nhân vật rõ, nhịp kể tự nhiên, phù hợp trục Tri thức.',image:mediaImages[8]
  },
  {
    code:'HH26-DEMO07',name:'Nguyễn Minh An',display:'Minh An · dữ liệu mẫu',email:'demo01@halohola.invalid',phone:'0900000001',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Chiều chạm vào Ba Vì',captured:'2026-10-01',
    type:'Photo',theme:'Nắng Hòa Lạc',color:'Nắng',location:'Phía Tây Hòa Lạc',status:'VALID',
    story:'Khoảnh khắc chiều muộn khi lớp núi phía Tây chuyển dần từ xanh sang vàng nhạt. Tác phẩm ghi lại sự thay đổi rất ngắn của ánh sáng trên đường chân trời.',
    jury:'Đủ điều kiện, cần thêm câu chuyện để vào shortlist.',image:mediaImages[1]
  },
  {
    code:'HH26-DEMO08',name:'Hoàng Minh Đức',display:'Minh Đức · dữ liệu mẫu',email:'demo07@halohola.invalid',phone:'0900000007',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Kiến trúc cho con người',captured:'2026-10-01',
    type:'Art & Design',theme:'Không gian Kiến trúc Hòa Lạc',color:'Be',location:'Hòa Lạc',status:'TOP52',
    story:'Một bộ minh họa hình dung không gian làm việc, học tập và ở tại Hòa Lạc theo hướng nhiều bóng mát, khoảng gặp gỡ và kết nối với cảnh quan.',
    jury:'Ý tưởng phù hợp tinh thần tương lai, trình bày rõ.',image:mediaImages[3]
  },
  {
    code:'HH26-DEMO09',name:'Bùi Khánh Vy',display:'Khánh Vy · dữ liệu mẫu',email:'demo08@halohola.invalid',phone:'0900000008',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Sắc Mường giữa đại ngàn',captured:'2026-09-24',
    type:'Photo',theme:'Sắc Mường Hòa Lạc',color:'Sắc Hòa Lạc',location:'Vùng văn hóa Mường',status:'AWARDED',
    story:'Trang phục, nhịp trống và nụ cười trong một buổi sinh hoạt cộng đồng tạo nên một mảng màu sống động. Tác phẩm chọn con người làm trung tâm của bản sắc.',
    jury:'Cảm xúc mạnh, màu sắc và con người hòa quyện tốt.',image:mediaImages[7]
  },
  {
    code:'HH26-DEMO10',name:'Đỗ Nhật Nam',display:'Nhật Nam · dữ liệu mẫu',email:'demo09@halohola.invalid',phone:'0900000009',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Bản đồ của những ký ức nhỏ',captured:'2026-09-23',
    type:'Story & Creative',theme:'Câu chuyện Hòa Lạc',color:'Be',location:'Hòa Lạc',status:'SHORTLIST',
    story:'Một bản đồ cá nhân đánh dấu những nơi tác giả từng đi qua: quán nước, đường đất cũ, bờ hồ, ngã ba và một căn nhà đã thay đổi. Mỗi điểm là một câu chuyện ngắn.',
    jury:'Cấu trúc tốt, có tiềm năng kết nối HOLA Map.',image:mediaImages[6]
  },
  {
    code:'HH26-DEMO11',name:'Ngô Thanh Hà',display:'Thanh Hà · dữ liệu mẫu',email:'demo10@halohola.invalid',phone:'0900000010',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Màu xanh sau cơn mưa',captured:'2026-10-02',
    type:'Photo',theme:'Hòa Lạc xanh',color:'Xanh non',location:'Yên Xuân',status:'VALID',
    story:'Sau cơn mưa, những khoảng cây và mặt đường trở nên trong hơn. Tác phẩm tập trung vào cảm giác dịu, tươi và gần gũi của một Hòa Lạc xanh.',
    jury:'Hợp lệ, màu sắc tốt.',image:mediaImages[4]
  },
  {
    code:'HH26-DEMO12',name:'Phan Thu Trang',display:'Thu Trang · dữ liệu mẫu',email:'demo11@halohola.invalid',phone:'0900000011',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Ước mơ có một địa chỉ',captured:'2026-10-02',
    type:'Video',theme:'Ước mơ Hòa Lạc',color:'Xanh non',location:'ĐHQG Hà Nội tại Hòa Lạc',status:'SHORTLIST',
    story:'Ba nhân vật trẻ nói về lý do họ chọn học, làm việc và ở lại Hòa Lạc. Những câu trả lời khác nhau gặp nhau ở mong muốn tạo dựng tương lai tại đây.',
    jury:'Có nhân vật và thông điệp rõ, cần rút gọn nhịp dựng.',image:mediaImages[8]
  },
  {
    code:'HH26-DEMO13',name:'Lương Quốc Khánh',display:'Quốc Khánh · dữ liệu mẫu',email:'demo12@halohola.invalid',phone:'0900000012',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Những đường cong của một đô thị mới',captured:'2026-10-03',
    type:'Art & Design',theme:'Không gian Kiến trúc Hòa Lạc',color:'Sắc Hòa Lạc',location:'Khu Công nghệ cao Hòa Lạc',status:'VALID',
    story:'Bộ poster sử dụng đường địa hình, tuyến giao thông và mảng xanh như ngôn ngữ thị giác để mô tả một Hòa Lạc đang kết nối ngày càng nhiều lớp chức năng.',
    jury:'Ý tưởng tốt, cần hoàn thiện typography.',image:mediaImages[3]
  },
  {
    code:'HH26-DEMO14',name:'Trần Mai Anh',display:'Mai Anh · dữ liệu mẫu',email:'demo02@halohola.invalid',phone:'0900000002',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Một chiều ở Hạ Bằng',captured:'2026-10-03',
    type:'Photo',theme:'Nét Đoài tại Hòa Lạc',color:'Đá ong',location:'Hạ Bằng',status:'PENDING',
    story:'Từ con đường nhỏ đến hàng cây và mái nhà, tác phẩm ghi lại một buổi chiều bình thường nhưng chứa nhiều dấu hiệu của sự chuyển mình.',
    jury:'Chờ kiểm tra quyền hình ảnh.',image:mediaImages[2]
  },
  {
    code:'HH26-DEMO15',name:'Đặng Hải Yến',display:'Hải Yến · dữ liệu mẫu',email:'demo13@halohola.invalid',phone:'0900000013',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Người giữ chuyện làng',captured:'2026-10-04',
    type:'Story & Creative',theme:'Nét Đoài tại Hòa Lạc',color:'Đá ong',location:'Thạch Thất',status:'PENDING',
    story:'Chân dung một người lớn tuổi thường kể chuyện làng cho con cháu. Tác phẩm đặt ký ức cá nhân bên cạnh nhịp thay đổi của không gian xung quanh.',
    jury:'Chờ kiểm tra hồ sơ.',image:mediaImages[7]
  },
  {
    code:'HH26-DEMO16',name:'Vũ Hoàng Linh',display:'Hoàng Linh · dữ liệu mẫu',email:'demo06@halohola.invalid',phone:'0900000006',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Sáu màu trong một ngày',captured:'2026-10-04',
    type:'Video',theme:'Sắc màu Hòa Lạc',color:'Sắc Hòa Lạc',location:'Hòa Lạc',status:'SHORTLIST',
    story:'Video đi qua sáu lớp màu Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc trong cùng một ngày, nối cảnh quan với kiến trúc và con người.',
    jury:'Đúng concept Tour #02, cấu trúc rõ.',image:mediaImages[9]
  },
  {
    code:'HH26-DEMO17',name:'Nguyễn Hồng Phúc',display:'Hồng Phúc · dữ liệu mẫu',email:'demo14@halohola.invalid',phone:'0900000014',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Khoảng thở giữa công nghệ',captured:'2026-10-04',
    type:'Photo',theme:'Hòa Lạc xanh',color:'Xanh rêu',location:'Khu Công nghệ cao Hòa Lạc',status:'REJECTED',
    story:'Tác phẩm tìm một khoảng xanh giữa các không gian làm việc mới.',
    jury:'Ảnh chưa đạt yêu cầu độ phân giải của hồ sơ mẫu.',image:mediaImages[4]
  },
  {
    code:'HH26-DEMO18',name:'Bùi Khánh Vy',display:'Khánh Vy · dữ liệu mẫu',email:'demo08@halohola.invalid',phone:'0900000008',
    bio:'Tác giả dữ liệu mẫu phục vụ kiểm thử hệ thống HALO HOLA 2026.',title:'Mường trong chuyển động',captured:'2026-10-05',
    type:'Video',theme:'Sắc Mường Hòa Lạc',color:'Sắc Hòa Lạc',location:'Hòa Lạc',status:'PENDING',
    story:'Một video ngắn thử nghiệm chuyển động, âm thanh và màu sắc để kể về nét văn hóa Mường trong bối cảnh Hòa Lạc hôm nay.',
    jury:'Chờ kiểm tra hồ sơ và quyền âm thanh.',image:mediaImages[7]
  }
];

const tourRegistrations = [
  ['HT26-DEMO01','01','Minh An · mẫu','tour01@halohola.invalid','0901000001','Nhiếp ảnh','Sony A7C','Muốn tập trung vào làng xóm và ánh sáng','CONFIRMED'],
  ['HT26-DEMO02','01','Mai Anh · mẫu','tour02@halohola.invalid','0901000002','Người kể chuyện','Điện thoại + ghi âm','Quan tâm ký ức địa phương','REGISTERED'],
  ['HT26-DEMO03','01','Quang Huy · mẫu','tour03@halohola.invalid','0901000003','Kiến trúc','Fujifilm X-T5','Quan sát vật liệu và nếp nhà','WAITLIST'],
  ['HT26-DEMO04','02','Thị Mai · mẫu','tour04@halohola.invalid','0901000004','Content creator','iPhone + gimbal','Theo concept 6 sắc màu','CONFIRMED'],
  ['HT26-DEMO05','02','Gia Bảo · mẫu','tour05@halohola.invalid','0901000005','Nhiếp ảnh','Canon R6','Tìm màu Đá ong và Be','REGISTERED'],
  ['HT26-DEMO06','02','Hoàng Linh · mẫu','tour06@halohola.invalid','0901000006','Video','Sony FX30','Quay kiến trúc và con người','REGISTERED'],
  ['HT26-DEMO07','03','Khánh Vy · mẫu','tour07@halohola.invalid','0901000007','Nhiếp ảnh','Nikon Z6','Chụp nắng sớm và hoàng hôn','CONFIRMED'],
  ['HT26-DEMO08','03','Nhật Nam · mẫu','tour08@halohola.invalid','0901000008','Storyteller','Điện thoại','Ghi chép câu chuyện theo ánh sáng','REGISTERED'],
  ['HT26-DEMO09','03','Thanh Hà · mẫu','tour09@halohola.invalid','0901000009','Sinh viên','Fujifilm X-S20','Muốn trải nghiệm HOLA Tour lần đầu','WAITLIST']
];

async function upsertSubmission(client, item, index) {
  const result = await client.query(
    `INSERT INTO submissions
      (code,name,display_name,email,phone,bio,title,captured_at,external_link,previous_award,previous_award_note,
       rights_confirmed,image_consent_confirmed,is_minor,guardian_name,guardian_consent,type,theme,color,location,story,
       status,allow_media_use,allow_newsletter,jury_note,is_demo,created_at,updated_at)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,NULL,FALSE,NULL,TRUE,TRUE,FALSE,NULL,FALSE,$9,$10,$11,$12,$13,$14,TRUE,TRUE,$15,TRUE,
       NOW() - ($16::int || ' hours')::interval,NOW())
     ON CONFLICT (code) DO UPDATE SET
       name=EXCLUDED.name,display_name=EXCLUDED.display_name,email=EXCLUDED.email,phone=EXCLUDED.phone,bio=EXCLUDED.bio,
       title=EXCLUDED.title,captured_at=EXCLUDED.captured_at,type=EXCLUDED.type,theme=EXCLUDED.theme,color=EXCLUDED.color,
       location=EXCLUDED.location,story=EXCLUDED.story,status=EXCLUDED.status,jury_note=EXCLUDED.jury_note,is_demo=TRUE,updated_at=NOW()
     RETURNING id,code`,
    [item.code,item.name,item.display,item.email,item.phone,item.bio,item.title,item.captured,item.type,item.theme,item.color,item.location,item.story,item.status,item.jury,(demoSubmissions.length-index)*3]
  );
  const submission = result.rows[0];
  const existing = await client.query('SELECT id FROM submission_media WHERE submission_id=$1 LIMIT 1',[submission.id]);
  if (!existing.rowCount) {
    await client.query(
      `INSERT INTO submission_media
        (submission_id,url,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,sha256,revision)
       VALUES ($1,$2,$3,'image/jpeg',$4,'SEED',NULL,NULL,$5,1)`,
      [submission.id,item.image,`${item.code.toLowerCase()}-preview.jpg`,1200000 + index*47000,`${String(index+1).padStart(2,'0')}`.repeat(32).slice(0,64)]
    );
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index=0; index<demoSubmissions.length; index+=1) {
      await upsertSubmission(client,demoSubmissions[index],index);
    }

    for (const [code,tour,name,email,phone,role,equipment,note,status] of tourRegistrations) {
      await client.query(
        `INSERT INTO tour_registrations
          (code,tour_number,name,email,phone,role_label,equipment,note,status,is_demo,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,NOW() - interval '12 hours',NOW())
         ON CONFLICT (code) DO UPDATE SET
          tour_number=EXCLUDED.tour_number,name=EXCLUDED.name,email=EXCLUDED.email,phone=EXCLUDED.phone,
          role_label=EXCLUDED.role_label,equipment=EXCLUDED.equipment,note=EXCLUDED.note,status=EXCLUDED.status,is_demo=TRUE,updated_at=NOW()`,
        [code,tour,name,email,phone,role,equipment,note,status]
      );
    }

    await client.query('COMMIT');
    console.log(`HALO HOLA full demo seed complete: ${demoSubmissions.length} submissions, ${new Set(demoSubmissions.map(x=>x.email)).size} creators, ${demoSubmissions.filter(x=>['TOP52','AWARDED'].includes(x.status)).length} TOP52/AWARDED, ${tourRegistrations.length} tour registrations.`);
    console.log('All seeded participant records are marked is_demo=true and use .invalid email addresses.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error)=>{
  console.error(error);
  process.exit(1);
});
