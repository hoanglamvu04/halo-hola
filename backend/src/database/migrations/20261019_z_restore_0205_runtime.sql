-- Restore the persisted CMS/taxonomy values expected by commit 0205f650.
-- Later editorial migrations may already have run in production; moving the Git ref
-- backwards does not undo those database writes, so this migration restores the
-- public data that the 0205 frontend expects.

-- Restore the original eight public themes exactly.
DELETE FROM themes WHERE id BETWEEN 1 AND 8;

INSERT INTO themes (id,slug,title,description,intro,image,color,location_label,published,sort_order) VALUES
  (1,'net-doai','Nét Đoài tại Hòa Lạc','Văn hóa, làng xóm, trầm tích Xứ Đoài','Khám phá những dấu ấn Xứ Đoài qua những câu chuyện đời sống, làng xóm, kiến trúc, tập tục và con người Hòa Lạc – nơi quá khứ, hiện tại và tương lai cùng giao hòa.','https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85','#9d6c46','Thạch Thất',TRUE,10),
  (2,'sac-muong','Sắc Mường Hòa Lạc','Bản sắc, con người, đời sống văn hóa','Đi sâu vào đời sống, bản sắc và những lớp văn hóa Mường còn hiện diện trong con người, ký ức và nhịp sống Hòa Lạc hôm nay.','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85','#7d553b','Hòa Lạc',TRUE,20),
  (3,'kien-truc','Không gian Kiến trúc Hòa Lạc','Công trình, cảnh quan, không gian sống','Quan sát cách kiến trúc, cảnh quan và không gian sống đang tạo nên diện mạo mới của Hòa Lạc mà vẫn đối thoại với thiên nhiên và con người.','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85','#b57b4d','Hòa Lạc',TRUE,30),
  (4,'hoa-lac-xanh','Hòa Lạc xanh','Thiên nhiên, mặt nước, phát triển bền vững','Khám phá những khoảng xanh, mặt nước, triền đồi và cách con người đang gìn giữ một Hòa Lạc phát triển bền vững.','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85','#557a45','Hòa Lạc',TRUE,40),
  (5,'nang-hoa-lac','Nắng Hòa Lạc','Ánh sáng, cảm xúc, khoảnh khắc phía Tây','Theo ánh sáng để kể về Hòa Lạc: nắng sớm, chiều vàng, những triền đồi và khoảnh khắc cảm xúc của vùng đất phía Tây.','https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85','#e9a541','Phía Tây Hòa Lạc',TRUE,50),
  (6,'cau-chuyen','Câu chuyện Hòa Lạc','Con người, ký ức, những câu chuyện đáng kể','Những ký ức, lát cắt đời sống và câu chuyện nhỏ giúp Hòa Lạc hiện ra gần gũi, chân thật và nhiều chiều hơn.','https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=85','#7a5a44','Hòa Lạc',TRUE,60),
  (7,'uoc-mo','Ước mơ Hòa Lạc','Góc nhìn học sinh – sinh viên về tương lai','Nhìn Hòa Lạc qua góc nhìn của học sinh, sinh viên và người trẻ – những người đang học tập, sáng tạo và hình dung về tương lai nơi đây.','https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85','#91b653','Hòa Lạc',TRUE,70),
  (8,'sac-mau','Sắc màu Hòa Lạc','06 đặc trưng sắc màu của vùng đất','Sáu sắc màu đại diện cho thiên nhiên, vật liệu, ánh sáng, tri thức và chuyển động mới của Hòa Lạc.','https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85','#c45b32','Hòa Lạc',TRUE,80);

-- Restore the 0205 homepage/CMS copy while preserving uploaded media fields.
UPDATE site_sections
SET content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','NƠI NHỮNG CÂU CHUYỆN HÒA LẠC ĐƯỢC KỂ LẠI',
      'titleLine1','HELLO',
      'titleAccent','HÒA LẠC',
      'tagline','52 góc nhìn · 1 Hòa Lạc',
      'description','Cùng đóng góp hình ảnh, câu chuyện và trải nghiệm để tạo nên một Hòa Lạc được kể bởi chính cộng đồng.'
    ), updated_at=NOW()
WHERE section_key='hero';

UPDATE site_sections
SET content = (
      COALESCE(content,'{}'::jsonb)
      - 'milestone6Date' - 'milestone6Label'
      - 'milestone7Date' - 'milestone7Label'
    ) || jsonb_build_object(
      'eyebrow','CỘNG ĐỒNG ĐANG CÙNG GÓP NHỮNG GÓC NHÌN',
      'title','Mỗi ngày thêm một góc nhìn mới.',
      'description','Cùng khám phá, ghi lại và đóng góp những góc nhìn, câu chuyện, địa điểm và trải nghiệm để xây dựng kho tư liệu cộng đồng về Hòa Lạc hôm nay và mai sau.',
      'ctaText','Gửi góc nhìn',
      'journeyTitle','Hành trình 2026',
      'milestone1Date','11.10',
      'milestone1Label','Mở nhận góc nhìn',
      'milestone2Date','25.10',
      'milestone2Label','HOLA Tour #01 · #02 · #03',
      'milestone3Date','10.11 · 10:11',
      'milestone3Label','Đóng đợt nhận góc nhìn',
      'milestone4Date','16.11',
      'milestone4Label','Công bố TOP52 · mở bình chọn cộng đồng',
      'milestone5Date','24.11',
      'milestone5Label','HOLA DAY · triển lãm · vinh danh'
    ), updated_at=NOW()
WHERE section_key='campaign';

UPDATE site_sections
SET content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'title','Hòa Lạc đang thay đổi',
      'description','Từ những lớp bản sắc Xứ Đoài, văn hóa Mường và cảnh quan tự nhiên, Hòa Lạc hôm nay đang đón nhận tri thức, công nghệ, đô thị và những cộng đồng mới.'
    ), updated_at=NOW()
WHERE section_key='change';

UPDATE site_sections
SET label='8 chủ đề',
    content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','8 CHỦ ĐỀ · 4 LOẠI HÌNH SÁNG TẠO',
      'title','8 chủ đề về Hòa Lạc',
      'description','Từ Nét Đoài, Sắc Mường, kiến trúc và thiên nhiên đến nắng, câu chuyện, ước mơ và 6 đặc trưng Sắc màu Hòa Lạc.'
    ), updated_at=NOW()
WHERE section_key='themes';

UPDATE site_sections
SET content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','SẮC MÀU HÒA LẠC',
      'title','Hòa Lạc trong bạn có màu gì?',
      'description','Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc — mỗi màu là một lát cắt và một câu chuyện.'
    ), updated_at=NOW()
WHERE section_key='colors';

UPDATE site_sections
SET content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','CÙNG ĐI · CÙNG CẢM · CÙNG KỂ CHUYỆN',
      'title','HOLA Tour',
      'description','Ba hành trình HOLA Tour cùng diễn ra trong một ngày 25/10/2026 — ba hướng khám phá khác nhau về Hòa Lạc.'
    ), updated_at=NOW()
WHERE section_key='tours';

UPDATE site_sections
SET content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','ĐỊA ĐIỂM · CÂU CHUYỆN · GÓC NHÌN',
      'title','HOLA Map',
      'description','Lưu lại những điểm chạm của Hòa Lạc từ cảnh quan, tri thức, văn hóa, kiến trúc đến những câu chuyện cộng đồng.'
    ), updated_at=NOW()
WHERE section_key='map';

UPDATE site_sections
SET label='Góc nhìn & Stories',
    content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','GÓC NHÌN · CÂU CHUYỆN · HÒA LẠC',
      'title','Những góc nhìn đã được kể',
      'description','Những đóng góp đã được công bố — mỗi hình ảnh, video, câu chuyện và sáng tạo cùng làm đầy thêm bức tranh Hòa Lạc từ chính cộng đồng.'
    ), updated_at=NOW()
WHERE section_key='stories';

UPDATE site_sections
SET content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','CỘNG ĐỒNG · KẾT NỐI · HÀNH ĐỘNG',
      'title','WE HOLA – Chúng ta là Hòa Lạc',
      'description','Cùng kể chuyện, chia sẻ dữ liệu, kết nối con người và chung tay xây dựng một Hòa Lạc xanh hơn, đẹp hơn, giàu bản sắc hơn.'
    ), updated_at=NOW()
WHERE section_key='community';

-- Undo the later tour copy changes that persisted in the database.
UPDATE tours SET title='Đoài · Mường', kicker='Đi tìm bản sắc',
  description='Khám phá lớp giá trị cội nguồn của Hòa Lạc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.', updated_at=NOW()
WHERE number='01';
UPDATE tours SET title='Sắc màu Hòa Lạc', kicker='Đi tìm màu sắc',
  description='Khám phá Hòa Lạc qua 6 đặc trưng sắc màu: Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc; từ kiến trúc, cảnh quan đến con người và đời sống.', updated_at=NOW()
WHERE number='02';
UPDATE tours SET title='Nắng Hòa Lạc', kicker='Đi tìm cảm xúc',
  description='Khai thác vẻ đẹp ánh sáng và cảm xúc của Hòa Lạc qua bình minh, nắng trên kiến trúc, nắng qua làng xóm, chiều vàng, Ba Vì và hoàng hôn phía Tây.', updated_at=NOW()
WHERE number='03';

-- Restore the two seeded stories that the later editorial migration rewrote.
UPDATE stories SET
  excerpt='HALO HOLA 2026 là chương trình sáng tạo cộng đồng để mọi người đi – nhìn – gặp – trải nghiệm – kể – sáng tạo về Hòa Lạc.',
  lead='Mỗi tuần một góc nhìn. Mỗi góc nhìn một câu chuyện. Từ những lát cắt ấy, HALO HOLA xây dựng một hình ảnh Hòa Lạc vừa có bản sắc, vừa đang chuyển mình.',
  quote='Không chỉ một cuộc thi — HALO HOLA là một chuỗi hoạt động để khám phá và kể lại Hòa Lạc.',
  updated_at=NOW()
WHERE slug='halo-hola-2026-52-goc-nhin-1-hoa-lac';

UPDATE stories SET
  slug='8-chu-de-8-cach-nhin-hoa-lac',
  title='8 chủ đề, 8 cách nhìn Hòa Lạc',
  category='Thể lệ · Chủ đề',
  excerpt='Tám chủ đề mở ra tám hướng tiếp cận: từ Nét Đoài, Sắc Mường, kiến trúc, thiên nhiên đến câu chuyện, ước mơ và sắc màu.',
  lead='Bạn không cần bắt đầu bằng một bức ảnh “hoàn hảo”. Hãy bắt đầu bằng câu hỏi: mình đang nhìn thấy lớp nào của Hòa Lạc?',
  quote='Một góc nhìn không chỉ là một bức ảnh.',
  body=jsonb_build_array(
    jsonb_build_object('heading','01–04 · Bản sắc, con người, không gian và thiên nhiên','paragraphs',jsonb_build_array('01. Nét Đoài tại Hòa Lạc: con người, làng xóm, kiến trúc, ký ức Xứ Đoài. 02. Sắc Mường Hòa Lạc: con người, đời sống, không gian và văn hóa Mường. 03. Không gian Kiến trúc Hòa Lạc: nhà ở, công trình công cộng, campus, cảnh quan, không gian sống và đô thị đang hình thành. 04. Hòa Lạc xanh: thiên nhiên, cây xanh, mặt nước, môi trường, lối sống xanh và phát triển bền vững.')),
    jsonb_build_object('heading','05–07 · Ánh sáng, câu chuyện và ước mơ','paragraphs',jsonb_build_array('05. Nắng Hòa Lạc: nắng sớm, ánh sáng trên làng xóm và kiến trúc, chiều vàng, hoàng hôn phía Tây. 06. Câu chuyện Hòa Lạc: con người, nơi chốn, ký ức, trải nghiệm và những thay đổi đáng được kể. 07. Ước mơ Hòa Lạc dành cho học sinh – sinh viên.')),
    jsonb_build_object('heading','08 · Sắc màu Hòa Lạc','paragraphs',jsonb_build_array('Sắc màu Hòa Lạc gồm 6 đặc trưng: Đá ong, Nắng, Xanh rêu, Xanh non, Be và Sắc Hòa Lạc. Tác phẩm ở mọi chủ đề đều có thể khai báo sắc màu để được xét theo cơ chế của thể lệ.'))
  ), updated_at=NOW()
WHERE slug IN ('7-mach-noi-dung-ke-hoa-lac','8-chu-de-8-cach-nhin-hoa-lac');

-- Restore the 0205 settings changed by later CMS migrations.
INSERT INTO site_settings(setting_key,value,updated_at) VALUES
  ('footer','{}'::jsonb,NOW()),
  ('seo','{}'::jsonb,NOW()),
  ('rulesAwards','{}'::jsonb,NOW())
ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET value = value || jsonb_build_object(
      'description','Nơi cộng đồng cùng khám phá, ghi lại, đóng góp và kể tiếp những câu chuyện về Hòa Lạc.'
    ), updated_at=NOW()
WHERE setting_key='footer';

UPDATE site_settings
SET value = value || jsonb_build_object(
      'defaultTitle','HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc',
      'defaultDescription','HALO HOLA 2026 là chương trình cộng đồng cùng khám phá, ghi lại và đóng góp những góc nhìn, câu chuyện, địa điểm và trải nghiệm về Hòa Lạc.'
    ), updated_at=NOW()
WHERE setting_key='seo';

UPDATE site_settings
SET value = value || jsonb_build_object(
      'title','Cách tham gia & Ghi nhận HALO HOLA 2026',
      'intro','Hướng dẫn gửi góc nhìn, nguyên tắc đóng góp, mốc thời gian và các hạng mục ghi nhận của chương trình cộng đồng HALO HOLA 2026.'
    ), updated_at=NOW()
WHERE setting_key='rulesAwards';
