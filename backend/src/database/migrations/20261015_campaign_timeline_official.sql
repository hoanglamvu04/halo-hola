UPDATE site_sections
SET content = (
      COALESCE(content, '{}'::jsonb)
      - 'milestone6Date'
      - 'milestone6Label'
      - 'milestone7Date'
      - 'milestone7Label'
    ) || jsonb_build_object(
      'journeyTitle','Hành trình 2026',
      'milestone1Date','11.10',
      'milestone1Label','Mở nhận tác phẩm',
      'milestone2Date','25.10',
      'milestone2Label','HOLA Tour #01 · #02 · #03',
      'milestone3Date','10.11 · 10:11',
      'milestone3Label','Đóng nhận tác phẩm',
      'milestone4Date','16.11',
      'milestone4Label','Công bố TOP52 · mở bình chọn',
      'milestone5Date','24.11',
      'milestone5Label','HOLA DAY'
    ),
    updated_at = NOW()
WHERE section_key = 'campaign';
