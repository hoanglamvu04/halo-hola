CREATE TABLE IF NOT EXISTS theme_colors (
  id SMALLINT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  color_value VARCHAR(180) NOT NULL,
  story VARCHAR(220) NOT NULL,
  image TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE theme_colors ADD COLUMN IF NOT EXISTS image TEXT;

INSERT INTO theme_colors (id,slug,name,color_value,story,image,published,sort_order) VALUES
  (1,'da-ong','Đá ong','#9c643d','Bền bỉ · trầm tích','https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=82',TRUE,10),
  (2,'nang','Nắng','#efb54f','Ấm áp · hy vọng','https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82',TRUE,20),
  (3,'xanh-reu','Xanh rêu','#405c36','Thiên nhiên · lâu đời','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82',TRUE,30),
  (4,'xanh-non','Xanh non','#9cbd58','Tri thức · đổi mới','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82',TRUE,40),
  (5,'be','Be','#dccdaf','Dung dị · bản địa','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82',TRUE,50),
  (6,'sac-hoa-lac','Sắc Hòa Lạc','linear-gradient(135deg,#d25b3e 0 33%,#efb54f 33% 55%,#75a164 55% 75%,#5d8aaa 75%)','Hòa sắc · tương lai','https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=82',TRUE,60)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name,
  color_value=EXCLUDED.color_value,
  story=EXCLUDED.story,
  image=EXCLUDED.image,
  published=EXCLUDED.published,
  sort_order=EXCLUDED.sort_order,
  updated_at=NOW();

CREATE INDEX IF NOT EXISTS idx_theme_colors_published_sort ON theme_colors(published,sort_order,id);
