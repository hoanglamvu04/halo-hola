CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'EDITOR' CHECK (role IN ('EDITOR','MODERATOR','ADMIN')),
  account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE','SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  display_name VARCHAR(160),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(60),
  bio TEXT,
  title VARCHAR(280),
  captured_at DATE,
  external_link TEXT,
  previous_award BOOLEAN NOT NULL DEFAULT FALSE,
  previous_award_note TEXT,
  rights_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  image_consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  is_minor BOOLEAN NOT NULL DEFAULT FALSE,
  guardian_name VARCHAR(180),
  guardian_consent BOOLEAN NOT NULL DEFAULT FALSE,
  type VARCHAR(80) NOT NULL,
  theme VARCHAR(180) NOT NULL,
  color VARCHAR(120),
  location VARCHAR(255) NOT NULL,
  story TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','VALID','SHORTLIST','TOP52','AWARDED','REJECTED')),
  allow_media_use BOOLEAN NOT NULL DEFAULT TRUE,
  allow_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
  jury_note TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS title VARCHAR(280);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS captured_at DATE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS previous_award BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS previous_award_note TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rights_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS image_consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_minor BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(180);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS guardian_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS jury_note TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS submission_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
  bucket VARCHAR(180),
  object_key TEXT,
  sha256 VARCHAR(64),
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE submission_media ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE submission_media ADD COLUMN IF NOT EXISTS bucket VARCHAR(180);
ALTER TABLE submission_media ADD COLUMN IF NOT EXISTS object_key TEXT;
ALTER TABLE submission_media ADD COLUMN IF NOT EXISTS sha256 VARCHAR(64);
ALTER TABLE submission_media ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(180) NOT NULL UNIQUE,
  name VARCHAR(220) NOT NULL,
  category VARCHAR(120) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  image TEXT,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(220) NOT NULL,
  dates VARCHAR(120) NOT NULL,
  kicker VARCHAR(220) NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','PUBLISHED','CLOSED')),
  capacity INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 20;

CREATE TABLE IF NOT EXISTS tour_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  tour_number VARCHAR(20) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  role_label VARCHAR(120),
  equipment VARCHAR(220),
  note TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED'
    CHECK (status IN ('REGISTERED','CONFIRMED','WAITLIST','ATTENDED','CANCELLED')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE tour_registrations ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(220) NOT NULL UNIQUE,
  title VARCHAR(280) NOT NULL,
  author VARCHAR(180) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_code_email ON submissions(code, email);
CREATE INDEX IF NOT EXISTS idx_media_submission ON submission_media(submission_id);
CREATE INDEX IF NOT EXISTS idx_tour_registrations_tour ON tour_registrations(tour_number, status);
CREATE INDEX IF NOT EXISTS idx_places_published_name ON places(published, name);
CREATE INDEX IF NOT EXISTS idx_stories_published_created ON stories(published, created_at DESC);

CREATE TABLE IF NOT EXISTS site_sections (
  section_key VARCHAR(80) PRIMARY KEY,
  label VARCHAR(160) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key VARCHAR(80),
  original_name TEXT NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
  bucket VARCHAR(180),
  object_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_sections_sort ON site_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_site_assets_section ON site_assets(section_key, created_at DESC);

INSERT INTO site_sections (section_key,label,enabled,sort_order,content) VALUES
  ('header','Header',TRUE,10,'{}'::jsonb),
  ('hero','Hero',TRUE,20,'{}'::jsonb),
  ('campaign','HALO HOLA đang diễn ra',TRUE,30,'{}'::jsonb),
  ('change','Hòa Lạc đang thay đổi',TRUE,40,'{}'::jsonb),
  ('themes','8 chủ đề',TRUE,50,'{}'::jsonb),
  ('colors','Sắc màu Hòa Lạc',TRUE,60,'{}'::jsonb),
  ('tours','HOLA Tour',TRUE,70,'{}'::jsonb),
  ('map','HOLA Map',TRUE,80,'{}'::jsonb),
  ('stories','TOP52 / Stories',TRUE,90,'{}'::jsonb),
  ('community','WE HOLA',TRUE,100,'{}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- CMS V2 enrichments
ALTER TABLE stories ADD COLUMN IF NOT EXISTS role VARCHAR(160);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS category VARCHAR(180);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS location VARCHAR(220);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS read_time VARCHAR(80);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS lead TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS body JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS stops JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS location VARCHAR(220) DEFAULT 'Hòa Lạc, Hà Nội';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS duration_label VARCHAR(80) DEFAULT '2 ngày';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS audience_label VARCHAR(120) DEFAULT '15–20 người';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE places ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE site_assets ADD COLUMN IF NOT EXISTS title VARCHAR(220);
ALTER TABLE site_assets ADD COLUMN IF NOT EXISTS alt_text VARCHAR(280);
ALTER TABLE site_assets ADD COLUMN IF NOT EXISTS folder VARCHAR(120) DEFAULT 'general';
ALTER TABLE site_assets ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '';
ALTER TABLE site_assets ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(220) NOT NULL,
  tier VARCHAR(80) NOT NULL DEFAULT 'PARTNER',
  description TEXT,
  logo TEXT,
  website TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS themes (
  id SMALLINT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(220) NOT NULL,
  description TEXT NOT NULL,
  intro TEXT NOT NULL,
  image TEXT,
  color VARCHAR(40),
  location_label VARCHAR(220) DEFAULT 'Hòa Lạc',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO themes (id,slug,title,description,intro,image,color,location_label,published,sort_order) VALUES
  (1,'net-doai','Nét Đoài tại Hòa Lạc','Văn hóa, làng xóm, trầm tích Xứ Đoài','Khám phá những dấu ấn Xứ Đoài qua những câu chuyện đời sống, làng xóm, kiến trúc, tập tục và con người Hòa Lạc – nơi quá khứ, hiện tại và tương lai cùng giao hòa.','https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85','#9d6c46','Thạch Thất',TRUE,10),
  (2,'sac-muong','Sắc Mường Hòa Lạc','Bản sắc, con người, đời sống văn hóa','Đi sâu vào đời sống, bản sắc và những lớp văn hóa Mường còn hiện diện trong con người, ký ức và nhịp sống Hòa Lạc hôm nay.','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85','#7d553b','Hòa Lạc',TRUE,20),
  (3,'kien-truc','Không gian Kiến trúc Hòa Lạc','Công trình, cảnh quan, không gian sống','Quan sát cách kiến trúc, cảnh quan và không gian sống đang tạo nên diện mạo mới của Hòa Lạc mà vẫn đối thoại với thiên nhiên và con người.','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85','#b57b4d','Hòa Lạc',TRUE,30),
  (4,'hoa-lac-xanh','Hòa Lạc xanh','Thiên nhiên, mặt nước, phát triển bền vững','Khám phá những khoảng xanh, mặt nước, triền đồi và cách con người đang gìn giữ một Hòa Lạc phát triển bền vững.','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85','#557a45','Hòa Lạc',TRUE,40),
  (5,'nang-hoa-lac','Nắng Hòa Lạc','Ánh sáng, cảm xúc, khoảnh khắc phía Tây','Theo ánh sáng để kể về Hòa Lạc: nắng sớm, chiều vàng, những triền đồi và khoảnh khắc cảm xúc của vùng đất phía Tây.','https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85','#e9a541','Phía Tây Hòa Lạc',TRUE,50),
  (6,'cau-chuyen','Câu chuyện Hòa Lạc','Con người, ký ức, những câu chuyện đáng kể','Những ký ức, lát cắt đời sống và câu chuyện nhỏ giúp Hòa Lạc hiện ra gần gũi, chân thật và nhiều chiều hơn.','https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=85','#7a5a44','Hòa Lạc',TRUE,60),
  (7,'uoc-mo','Ước mơ Hòa Lạc','Góc nhìn học sinh – sinh viên về tương lai','Nhìn Hòa Lạc qua góc nhìn của học sinh, sinh viên và người trẻ – những người đang học tập, sáng tạo và hình dung về tương lai nơi đây.','https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85','#91b653','Hòa Lạc',TRUE,70),
  (8,'sac-mau','Sắc màu Hòa Lạc','06 đặc trưng sắc màu của vùng đất','Sáu sắc màu đại diện cho thiên nhiên, vật liệu, ánh sáng, tri thức và chuyển động mới của Hòa Lạc.','https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85','#c45b32','Hòa Lạc',TRUE,80)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_themes_published_sort ON themes(published, sort_order, id);

-- Review Workspace V2: one scorecard per juror per submission.
CREATE TABLE IF NOT EXISTS jury_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  juror_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quality NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (quality >= 0 AND quality <= 10),
  representation NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (representation >= 0 AND representation <= 10),
  story NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (story >= 0 AND story <= 10),
  creativity NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (creativity >= 0 AND creativity <= 10),
  weighted_total NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (weighted_total >= 0 AND weighted_total <= 100),
  recommendation VARCHAR(30) NOT NULL DEFAULT 'NONE'
    CHECK (recommendation IN ('NONE','SHORTLIST','TOP52','RESERVE','AWARD')),
  conflict_of_interest BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, juror_id)
);

CREATE INDEX IF NOT EXISTS idx_stories_sort ON stories(featured DESC, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tours_sort ON tours(sort_order ASC, number ASC);
CREATE INDEX IF NOT EXISTS idx_places_sort ON places(sort_order ASC, name ASC);
CREATE INDEX IF NOT EXISTS idx_site_assets_library ON site_assets(archived, folder, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partners_sort ON partners(published, sort_order ASC, name ASC);
CREATE INDEX IF NOT EXISTS idx_submissions_demo ON submissions(is_demo, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_registrations_demo ON tour_registrations(is_demo, tour_number, status);
CREATE INDEX IF NOT EXISTS idx_jury_scores_submission ON jury_scores(submission_id, submitted, conflict_of_interest);
CREATE INDEX IF NOT EXISTS idx_jury_scores_juror ON jury_scores(juror_id, submitted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_jury_scores_total ON jury_scores(weighted_total DESC) WHERE submitted = TRUE AND conflict_of_interest = FALSE;

INSERT INTO site_settings (setting_key,value) VALUES
  ('brand','{"siteName":"HALO HOLA","tagline":"52 góc nhìn · 1 Hòa Lạc"}'::jsonb),
  ('seo','{"defaultTitle":"HALO HOLA","defaultDescription":"Cùng kể những câu chuyện về Hòa Lạc."}'::jsonb),
  ('footer','{}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
