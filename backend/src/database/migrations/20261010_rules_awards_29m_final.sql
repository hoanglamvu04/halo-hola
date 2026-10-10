INSERT INTO site_settings (setting_key,value,updated_at)
VALUES (
  'rulesAwards',
  '{
    "totalPrize": "29.000.000đ",
    "totalAwards": 11,
    "prizeSummary": "8 chủ đề · 11 giải",
    "juryWeight": 70,
    "communityWeight": 30,
    "awards": [
      {
        "code": "SPECIAL",
        "label": "Giải đặc biệt",
        "name": "Danh hiệu HALO HOLA 2026",
        "amount": "5.000.000đ + cúp + quà",
        "quantity": "01 giải",
        "description": "Chọn từ 07 tác phẩm đoạt giải chủ đề 01–07; điểm Danh hiệu gồm 70% Hội đồng giám khảo và 30% bình chọn trên Group CHECK IN HOALAC.",
        "tone": "forest",
        "featured": true,
        "enabled": true
      },
      {
        "code": "THEME_01_07",
        "label": "Giải chủ đề",
        "name": "07 giải chủ đề 01–07",
        "amount": "2.000.000đ / giải + quà",
        "quantity": "07 giải",
        "description": "Mỗi chủ đề từ 01 đến 07 có 01 giải, trị giá 2.000.000 đồng và quà.",
        "tone": "terra",
        "featured": false,
        "enabled": true
      },
      {
        "code": "COLOR",
        "label": "Giải Sắc màu · Chủ đề 08",
        "name": "06 giải Sắc màu · 01 là giải chủ đề 08",
        "amount": "1.000.000đ / giải + quà",
        "quantity": "06 giải",
        "description": "06 giải dành cho 06 đặc trưng Sắc màu Hòa Lạc; trong đó 01 giải đồng thời là giải của chủ đề 08. Sắc màu được xét trên mọi tác phẩm hợp lệ.",
        "tone": "sun",
        "featured": false,
        "enabled": true
      },
      {
        "code": "FAVORITE",
        "label": "Giải phụ",
        "name": "Góc nhìn được yêu thích",
        "amount": "2.000.000đ + quà",
        "quantity": "01 giải",
        "description": "Dành cho tác phẩm có kết quả bình chọn hợp lệ cao nhất theo quy định của chương trình.",
        "tone": "green",
        "featured": false,
        "enabled": true
      },
      {
        "code": "SPREAD",
        "label": "Giải phụ",
        "name": "Giải Lan tỏa",
        "amount": "2.000.000đ + quà",
        "quantity": "01 giải",
        "description": "Ghi nhận tác phẩm có sức lan tỏa tự nhiên nổi bật theo tiêu chí của Ban Tổ chức.",
        "tone": "beige",
        "featured": false,
        "enabled": true
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET value = site_settings.value || EXCLUDED.value,
    updated_at = NOW();
