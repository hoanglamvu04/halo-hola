-- Full public editorial alignment for HALO HOLA 2026–2027.
-- 2026 = đi tìm và biên tập 52 góc nhìn; 2027 = 52 tuần · 52 câu chuyện Hòa Lạc.

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'CHÚNG TA ĐI TÌM HÒA LẠC',
      'tagline', '52 góc nhìn · 1 Hòa Lạc',
      'description', 'Cùng đi, nhìn, gặp, nghe và ghi lại những con người, không gian, ký ức, khoảnh khắc và ý tưởng đáng được giữ lại về Hòa Lạc.'
    ),
    updated_at = NOW()
WHERE section_key = 'hero';

UPDATE site_sections
SET label = '7 mạch nội dung',
    content = content || jsonb_build_object(
      'eyebrow', 'BẢY MẠCH · BA TRỤC XUYÊN SUỐT',
      'title', '7 mạch kể Hòa Lạc',
      'description', 'Bản sắc · Thiên nhiên · Không gian · Con người · Tri thức & Công nghệ · Đời sống & Cảm xúc · Tương lai. Ba trục xuyên suốt: Bản sắc · Sáng tạo · Tương lai.'
    ),
    updated_at = NOW()
WHERE section_key = 'themes';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'ĐI · GẶP · NGHE · GHI LẠI',
      'title', 'HOLA Tour',
      'description', 'Ba hành trình săn câu chuyện: Đi tìm Bản sắc · Đi tìm Màu sắc · Đi tìm Cảm xúc. Đầu ra là nhân vật, câu chuyện, ảnh, video và tư liệu có thể phát triển thành những góc nhìn của HALO HOLA.'
    ),
    updated_at = NOW()
WHERE section_key = 'tours';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'GÓC NHÌN · CÂU CHUYỆN · HÒA LẠC',
      'title', 'Những câu chuyện đáng được giữ lại',
      'description', 'Mỗi góc nhìn là một câu chuyện được tìm thấy, xác minh, biên tập và kể lại để cùng tạo nên chân dung Hòa Lạc năm 2026.'
    ),
    updated_at = NOW()
WHERE section_key = 'stories';

UPDATE site_sections
SET content = content || jsonb_build_object(
      'eyebrow', 'ĐI → NHÌN → GẶP → NGHE → GHI LẠI → BIÊN TẬP → KỂ → LAN TỎA',
      'title', 'Mỗi ngày thêm một góc nhìn mới.',
      'description', 'HALO HOLA cùng cộng đồng chủ động tìm những câu chuyện đáng được giữ lại — từ người dân, chuyên gia, trường học, sinh viên, doanh nghiệp, CLB và những người yêu Hòa Lạc.',
      'ctaText', 'Gửi một góc nhìn'
    ),
    updated_at = NOW()
WHERE section_key = 'campaign';

-- Seven editorial streams for 2026. Keep IDs stable so existing admin references continue working.
UPDATE themes SET slug='ban-sac', title='Bản sắc',
  description='Xứ Đoài · văn hóa Mường · đá ong · làng · phong tục · nghề · ký ức',
  intro='Đi tìm những lớp cội nguồn còn hiện diện trong làng xóm, con người, vật liệu, nghề, phong tục và ký ức của vùng đất Hòa Lạc.',
  location_label='Hòa Lạc', published=TRUE, sort_order=10, updated_at=NOW() WHERE id=1;
UPDATE themes SET slug='thien-nhien', title='Thiên nhiên',
  description='Ba Vì · hồ · rừng · cây xanh · địa hình · khí hậu · cảnh quan',
  intro='Nhìn Hòa Lạc qua hồ, rừng, cây xanh, đồi núi, khí hậu và những mối quan hệ đang hình thành giữa cảnh quan tự nhiên với đời sống con người.',
  location_label='Hòa Lạc', published=TRUE, sort_order=20, updated_at=NOW() WHERE id=2;
UPDATE themes SET slug='khong-gian', title='Không gian',
  description='Kiến trúc · nhà ở · làng · campus · công trình · không gian công cộng · đô thị mới',
  intro='Đọc Hòa Lạc qua những không gian cũ và mới: làng, nhà ở, campus, công trình, cảnh quan và những cấu trúc đô thị đang dần hình thành.',
  location_label='Hòa Lạc', published=TRUE, sort_order=30, updated_at=NOW() WHERE id=3;
UPDATE themes SET slug='con-nguoi', title='Con người',
  description='Người bản địa · người mới đến · người trẻ · chuyên gia · doanh nhân · KTS · công nhân · sinh viên · trẻ em',
  intro='Gặp những con người đang tạo nên Hòa Lạc hôm nay, từ người bản địa đến những cộng đồng mới học tập, làm việc, sáng tạo và sinh sống tại đây.',
  location_label='Hòa Lạc', published=TRUE, sort_order=40, updated_at=NOW() WHERE id=4;
UPDATE themes SET slug='tri-thuc-cong-nghe', title='Tri thức & Công nghệ',
  description='Đại học · nghiên cứu · công nghệ cao · startup · phòng lab · những người tạo nên Hòa Lạc mới',
  intro='Theo dấu tri thức, nghiên cứu, công nghệ và đổi mới sáng tạo để hiểu một lớp Hòa Lạc mới đang được hình thành bởi trường học, phòng lab, startup và con người.',
  location_label='Hòa Lạc', published=TRUE, sort_order=50, updated_at=NOW() WHERE id=5;
UPDATE themes SET slug='doi-song-cam-xuc', title='Đời sống & Cảm xúc',
  description='Ẩm thực · café · chợ · thể thao · vui chơi · buổi sáng · hoàng hôn · nắng · khoảnh khắc đời thường',
  intro='Ghi lại những khoảnh khắc khiến Hòa Lạc trở nên gần gũi: một bữa ăn, quán nhỏ, chợ, buổi sáng, hoàng hôn, ánh nắng hay một nhịp sống rất đời thường.',
  location_label='Hòa Lạc', published=TRUE, sort_order=60, updated_at=NOW() WHERE id=6;
UPDATE themes SET slug='tuong-lai', title='Tương lai',
  description='Quy hoạch · đô thị · kiến trúc · môi trường · công nghệ · giáo dục · mong muốn và ý tưởng',
  intro='Hình dung Hòa Lạc ngày mai qua quy hoạch, đô thị, kiến trúc, môi trường, giáo dục, công nghệ và những mong muốn của người đang sống cùng vùng đất này.',
  location_label='Hòa Lạc', published=TRUE, sort_order=70, updated_at=NOW() WHERE id=7;
UPDATE themes SET published=FALSE, sort_order=80, updated_at=NOW() WHERE id=8;

-- Migrate legacy theme labels on existing submissions so the public filters keep working.
UPDATE submissions SET theme = REPLACE(theme, 'Nét Đoài tại Hòa Lạc', 'Bản sắc') WHERE theme LIKE '%Nét Đoài tại Hòa Lạc%';
UPDATE submissions SET theme = REPLACE(theme, 'Sắc Mường Hòa Lạc', 'Bản sắc') WHERE theme LIKE '%Sắc Mường Hòa Lạc%';
UPDATE submissions SET theme = REPLACE(theme, 'Không gian Kiến trúc Hòa Lạc', 'Không gian') WHERE theme LIKE '%Không gian Kiến trúc Hòa Lạc%';
UPDATE submissions SET theme = REPLACE(theme, 'Hòa Lạc xanh', 'Thiên nhiên') WHERE theme LIKE '%Hòa Lạc xanh%';
UPDATE submissions SET theme = REPLACE(theme, 'Nắng Hòa Lạc', 'Đời sống & Cảm xúc') WHERE theme LIKE '%Nắng Hòa Lạc%';
UPDATE submissions SET theme = REPLACE(theme, 'Câu chuyện Hòa Lạc', 'Con người') WHERE theme LIKE '%Câu chuyện Hòa Lạc%';
UPDATE submissions SET theme = REPLACE(theme, 'Ước mơ Hòa Lạc', 'Tương lai') WHERE theme LIKE '%Ước mơ Hòa Lạc%';
UPDATE submissions SET theme = REPLACE(theme, 'Sắc màu Hòa Lạc', 'Đời sống & Cảm xúc') WHERE theme LIKE '%Sắc màu Hòa Lạc%';

-- HOLA Tour becomes a story-hunting journey, not a contest advantage.
UPDATE tours SET kicker='Đi tìm bản sắc',
  description='Đi tìm những lớp bản sắc Hòa Lạc qua Xứ Đoài, văn hóa Mường, làng, đá ong, con người và ký ức. Mục tiêu là phát hiện nhân vật, câu chuyện và tư liệu đáng được giữ lại.',
  updated_at=NOW() WHERE number='01';
UPDATE tours SET kicker='Đi tìm màu sắc',
  description='Đi tìm Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc trong kiến trúc, cảnh quan, đời sống và con người; từ màu sắc mở ra câu chuyện phía sau vùng đất.',
  updated_at=NOW() WHERE number='02';
UPDATE tours SET title='Cảm xúc Hòa Lạc', kicker='Đi tìm cảm xúc',
  description='Đi tìm con người, đời sống, không gian, nắng chiều và những khoảnh khắc khiến Hòa Lạc được nhớ bằng cảm xúc chứ không chỉ bằng địa danh.',
  updated_at=NOW() WHERE number='03';

-- Rewrite two seeded editorial stories that carried the old contest / 8-theme framing.
UPDATE stories SET
  lead='2026 là năm đầu tiên HALO HOLA đi tìm Hòa Lạc: chủ động gặp, nghe, ghi lại và biên tập những con người, không gian, ký ức, khoảnh khắc và ý tưởng đáng được giữ lại.',
  quote='Không tìm người thắng. Tìm những câu chuyện đáng được giữ lại.',
  excerpt='HALO HOLA 2026 là hành trình cộng đồng và dự án biên tập – khám phá – lưu giữ câu chuyện Hòa Lạc.',
  updated_at=NOW()
WHERE slug='halo-hola-2026-52-goc-nhin-1-hoa-lac';

UPDATE stories SET
  slug='7-mach-noi-dung-ke-hoa-lac',
  title='7 mạch nội dung để kể Hòa Lạc',
  category='Biên tập · 7 mạch nội dung',
  excerpt='Bảy mạch giúp 52 góc nhìn không trở thành một bộ ảnh phong cảnh: Bản sắc, Thiên nhiên, Không gian, Con người, Tri thức & Công nghệ, Đời sống & Cảm xúc và Tương lai.',
  lead='Mỗi câu chuyện có thể đi qua nhiều mạch, nhưng toàn bộ hành trình luôn giữ ba trục xuyên suốt: Bản sắc · Sáng tạo · Tương lai.',
  quote='Một góc nhìn có thể là một con người, một nơi, một ký ức, một món ăn, một nghề, một video, một câu nói hay một ý tưởng về Hòa Lạc tương lai.',
  body=jsonb_build_array(
    jsonb_build_object('heading','01–03 · Bản sắc · Thiên nhiên · Không gian','paragraphs',jsonb_build_array('Bản sắc đi từ Xứ Đoài, văn hóa Mường, đá ong, làng, phong tục, nghề và ký ức. Thiên nhiên đi qua Ba Vì, hồ, rừng, cây xanh, địa hình và khí hậu. Không gian đọc Hòa Lạc bằng kiến trúc, nhà ở, làng, campus, công trình, không gian công cộng và đô thị mới.')),
    jsonb_build_object('heading','04–06 · Con người · Tri thức & Công nghệ · Đời sống & Cảm xúc','paragraphs',jsonb_build_array('Con người là người bản địa, người mới đến, người trẻ, chuyên gia, doanh nhân, KTS, công nhân, sinh viên và trẻ em. Tri thức & Công nghệ đi qua đại học, nghiên cứu, công nghệ cao, startup và phòng lab. Đời sống & Cảm xúc đi qua ẩm thực, café, chợ, thể thao, vui chơi, buổi sáng, hoàng hôn, nắng và những khoảnh khắc đời thường.')),
    jsonb_build_object('heading','07 · Tương lai','paragraphs',jsonb_build_array('Tương lai mở ra từ quy hoạch, đô thị, kiến trúc, môi trường, công nghệ, giáo dục, mong muốn và những ý tưởng về Hòa Lạc ngày mai.'))
  ),
  updated_at=NOW()
WHERE slug='8-chu-de-8-cach-nhin-hoa-lac';

-- Public navigation and SEO.
INSERT INTO site_settings (setting_key,value,updated_at)
VALUES ('header','{}'::jsonb,NOW()) ON CONFLICT (setting_key) DO NOTHING;

UPDATE site_settings
SET value = value || jsonb_build_object(
      'ctaText','GỬI MỘT GÓC NHÌN',
      'ctaUrl','/gui-goc-nhin',
      'searchLabel','Theo dõi góc nhìn',
      'navLinks','[
        {"label":"Khám phá","href":"/"},
        {"label":"7 mạch","href":"/chu-de"},
        {"label":"HOLA Tour","href":"/hola-tour"},
        {"label":"HOLA Map","href":"/hola-map"},
        {"label":"Stories","href":"/stories"},
        {"label":"HOLA DAY","href":"/hola-day"},
        {"label":"52 góc nhìn","href":"/top52"},
        {"label":"Cách đóng góp","href":"/the-le-giai-thuong"},
        {"label":"WE HOLA","href":"/we-hola"}
      ]'::jsonb
    ),
    updated_at = NOW()
WHERE setting_key='header';

INSERT INTO site_settings (setting_key,value,updated_at)
VALUES ('rulesAwards','{}'::jsonb,NOW()) ON CONFLICT (setting_key) DO NOTHING;
UPDATE site_settings
SET value = value || jsonb_build_object(
      'title','Cách đóng góp cho HALO HOLA 2026',
      'intro','Bạn biết một người, một nơi hay một câu chuyện về Hòa Lạc đáng được kể? Hãy gửi một góc nhìn hoặc giới thiệu đầu mối để Ban Biên tập tiếp tục tìm hiểu.'
    ),
    updated_at=NOW()
WHERE setting_key='rulesAwards';

INSERT INTO site_settings (setting_key,value,updated_at)
VALUES ('seo','{}'::jsonb,NOW()) ON CONFLICT (setting_key) DO NOTHING;
UPDATE site_settings
SET value = value || jsonb_build_object(
      'defaultTitle','HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc',
      'defaultDescription','HALO HOLA 2026 là hành trình cộng đồng và dự án biên tập – khám phá – lưu giữ 52 câu chuyện về Hòa Lạc; mở ra HALO HOLA 2027 với 52 tuần · 52 câu chuyện.'
    ),
    updated_at=NOW()
WHERE setting_key='seo';
