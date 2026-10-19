-- Align the persisted HALO HOLA taxonomy with the 17.10.2026 internal direction:
-- seven editorial content streams instead of the previous eight contest themes.

-- Preserve existing submissions by mapping the legacy taxonomy to the closest
-- editorial stream. Multiple selections keep their original order and are deduplicated.
WITH mapped_parts AS (
  SELECT
    s.id,
    parts.ord,
    CASE BTRIM(parts.value)
      WHEN 'Nét Đoài tại Hòa Lạc' THEN 'Bản sắc'
      WHEN 'Sắc Mường Hòa Lạc' THEN 'Bản sắc'
      WHEN 'Không gian Kiến trúc Hòa Lạc' THEN 'Không gian'
      WHEN 'Hòa Lạc xanh' THEN 'Thiên nhiên'
      WHEN 'Nắng Hòa Lạc' THEN 'Đời sống & Cảm xúc'
      WHEN 'Câu chuyện Hòa Lạc' THEN 'Con người'
      WHEN 'Ước mơ Hòa Lạc' THEN 'Tương lai'
      WHEN 'Sắc màu Hòa Lạc' THEN 'Đời sống & Cảm xúc'
      ELSE BTRIM(parts.value)
    END AS mapped_value
  FROM submissions s
  CROSS JOIN LATERAL unnest(string_to_array(s.theme, ' • ')) WITH ORDINALITY AS parts(value, ord)
), deduped AS (
  SELECT id, mapped_value, MIN(ord) AS first_ord
  FROM mapped_parts
  WHERE mapped_value <> ''
  GROUP BY id, mapped_value
), rebuilt AS (
  SELECT id, string_agg(mapped_value, ' • ' ORDER BY first_ord) AS theme
  FROM deduped
  GROUP BY id
)
UPDATE submissions s
SET theme = rebuilt.theme,
    updated_at = NOW()
FROM rebuilt
WHERE s.id = rebuilt.id
  AND s.theme IS DISTINCT FROM rebuilt.theme;

-- Replace the public taxonomy with the seven content streams in the new brief.
DELETE FROM themes
WHERE id BETWEEN 1 AND 8
   OR slug IN (
     'net-doai','sac-muong','kien-truc','hoa-lac-xanh','nang-hoa-lac','cau-chuyen','uoc-mo','sac-mau',
     'ban-sac','thien-nhien','khong-gian','con-nguoi','tri-thuc-cong-nghe','doi-song-cam-xuc','tuong-lai'
   );

INSERT INTO themes (id,slug,title,description,intro,image,color,location_label,published,sort_order) VALUES
  (1,'ban-sac','Bản sắc','Xứ Đoài · văn hóa Mường · đá ong · làng · phong tục · nghề · ký ức.','Đi tìm những lớp bản sắc Hòa Lạc qua Xứ Đoài, văn hóa Mường, đá ong, làng, phong tục, nghề và ký ức.','https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85','#9d6c46','Hòa Lạc',TRUE,10),
  (2,'thien-nhien','Thiên nhiên','Ba Vì · hồ · rừng · cây xanh · địa hình · khí hậu · cảnh quan.','Khám phá Hòa Lạc qua Ba Vì, hồ, rừng, cây xanh, địa hình, khí hậu và những lớp cảnh quan tự nhiên.','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85','#557a45','Hòa Lạc',TRUE,20),
  (3,'khong-gian','Không gian','Kiến trúc · nhà ở · làng · campus · công trình · không gian công cộng · đô thị mới.','Quan sát Hòa Lạc qua kiến trúc, nhà ở, làng, campus, công trình, không gian công cộng và đô thị mới.','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85','#b57b4d','Hòa Lạc',TRUE,30),
  (4,'con-nguoi','Con người','Người bản địa · người mới đến · người trẻ · chuyên gia · doanh nhân · KTS · công nhân · sinh viên · trẻ em.','Gặp những con người đang tạo nên Hòa Lạc hôm nay: người bản địa, người mới đến, người trẻ, chuyên gia, doanh nhân, KTS, công nhân, sinh viên và trẻ em.','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85','#7d553b','Hòa Lạc',TRUE,40),
  (5,'tri-thuc-cong-nghe','Tri thức & Công nghệ','Đại học · nghiên cứu · công nghệ cao · startup · phòng lab · những người đang tạo nên Hòa Lạc mới.','Theo dấu đại học, nghiên cứu, công nghệ cao, startup, phòng lab và những người đang tạo nên một Hòa Lạc mới.','https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85','#4f6f6a','Hòa Lạc',TRUE,50),
  (6,'doi-song-cam-xuc','Đời sống & Cảm xúc','Ẩm thực · café · chợ · thể thao · vui chơi · buổi sáng · hoàng hôn · nắng · khoảnh khắc đời thường.','Kể Hòa Lạc từ ẩm thực, café, chợ, thể thao, vui chơi, buổi sáng, hoàng hôn, nắng và những khoảnh khắc đời thường.','https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85','#e9a541','Hòa Lạc',TRUE,60),
  (7,'tuong-lai','Tương lai','Quy hoạch · đô thị · kiến trúc · môi trường · công nghệ · giáo dục · mong muốn và ý tưởng về Hòa Lạc tương lai.','Nhìn về Hòa Lạc tương lai qua quy hoạch, đô thị, kiến trúc, môi trường, công nghệ, giáo dục, những mong muốn và ý tưởng mới.','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85','#91b653','Hòa Lạc',TRUE,70);

UPDATE site_sections
SET label = '7 chủ đề',
    content = COALESCE(content,'{}'::jsonb) || jsonb_build_object(
      'eyebrow','7 MẠCH NỘI DUNG · 1 HÒA LẠC',
      'title','7 chủ đề về Hòa Lạc',
      'description','Bản sắc · Thiên nhiên · Không gian · Con người · Tri thức & Công nghệ · Đời sống & Cảm xúc · Tương lai.'
    ),
    updated_at = NOW()
WHERE section_key = 'themes';

-- Rewrite the seeded editorial explainer so public Stories no longer describes
-- the retired eight-theme taxonomy.
UPDATE stories
SET slug='7-mach-noi-dung-7-cach-nhin-hoa-lac',
    title='7 mạch nội dung, 7 cách nhìn Hòa Lạc',
    category='Nội dung · Chủ đề',
    excerpt='Bảy mạch nội dung giúp 52 góc nhìn không bị lệch thành một bộ ảnh phong cảnh và cùng kể một Hòa Lạc nhiều lớp.',
    lead='Bản sắc, Thiên nhiên, Không gian, Con người, Tri thức & Công nghệ, Đời sống & Cảm xúc và Tương lai là bảy hướng biên tập của HALO HOLA 2026.',
    quote='Ba trục xuyên suốt: Bản sắc · Sáng tạo · Tương lai.',
    body=jsonb_build_array(
      jsonb_build_object('heading','01–03 · Bản sắc · Thiên nhiên · Không gian','paragraphs',jsonb_build_array('01. Bản sắc — Xứ Đoài, văn hóa Mường, đá ong, làng, phong tục, nghề, ký ức. 02. Thiên nhiên — Ba Vì, hồ, rừng, cây xanh, địa hình, khí hậu, cảnh quan. 03. Không gian — kiến trúc, nhà ở, làng, campus, công trình, không gian công cộng, đô thị mới.')),
      jsonb_build_object('heading','04–05 · Con người · Tri thức & Công nghệ','paragraphs',jsonb_build_array('04. Con người — người bản địa, người mới đến, người trẻ, chuyên gia, doanh nhân, KTS, công nhân, sinh viên, trẻ em. 05. Tri thức & Công nghệ — đại học, nghiên cứu, công nghệ cao, startup, phòng lab và những người đang tạo nên Hòa Lạc mới.')),
      jsonb_build_object('heading','06–07 · Đời sống & Cảm xúc · Tương lai','paragraphs',jsonb_build_array('06. Đời sống & Cảm xúc — ẩm thực, café, chợ, thể thao, vui chơi, buổi sáng, hoàng hôn, nắng, khoảnh khắc đời thường. 07. Tương lai — quy hoạch, đô thị, kiến trúc, môi trường, công nghệ, giáo dục, mong muốn và ý tưởng về Hòa Lạc tương lai.'))
    ),
    updated_at=NOW()
WHERE slug IN ('8-chu-de-8-cach-nhin-hoa-lac','7-mach-noi-dung-ke-hoa-lac','7-mach-noi-dung-7-cach-nhin-hoa-lac');
