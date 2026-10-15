UPDATE tours
SET dates = '25.10.2026',
    duration_label = '1 ngày · 25/10/2026',
    updated_at = NOW()
WHERE number IN ('01','02','03');

UPDATE stories
SET body = jsonb_build_array(
      jsonb_build_object(
        'heading','Tour #01 · Đoài · Mường · 25/10',
        'paragraphs',jsonb_build_array('Đi tìm bản sắc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.')
      ),
      jsonb_build_object(
        'heading','Tour #02 · Sắc màu Hòa Lạc · 25/10',
        'paragraphs',jsonb_build_array('Đi tìm 6 sắc màu qua kiến trúc, cảnh quan và con người. kientruchoalac.com đồng hành chuyên môn kiến trúc.')
      ),
      jsonb_build_object(
        'heading','Tour #03 · Làng nghề Hòa Lạc · 25/10',
        'paragraphs',jsonb_build_array('Đi vào không gian làng nghề, gặp người làm nghề, quan sát vật liệu, kỹ thuật thủ công và ghi lại những câu chuyện về ký ức, sinh kế và sự tiếp nối của nghề truyền thống quanh Hòa Lạc.')
      )
    ),
    excerpt = 'Ba hành trình HOLA Tour cùng diễn ra trong một ngày 25/10/2026, giúp người tham gia chạm vào bản sắc, màu sắc và làng nghề Hòa Lạc bằng trải nghiệm thực tế.',
    updated_at = NOW()
WHERE slug = 'hola-tour-di-nhin-gap-trai-nghiem-ke';

UPDATE site_sections
SET content = COALESCE(content, '{}'::jsonb) || jsonb_build_object(
      'description',
      'Ba hành trình HOLA Tour cùng diễn ra trong một ngày 25/10/2026 — ba hướng khám phá khác nhau về Hòa Lạc.'
    ),
    updated_at = NOW()
WHERE section_key = 'tours';
