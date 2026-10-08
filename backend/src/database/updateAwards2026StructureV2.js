import { pool } from './pool.js';

const valuePatch={
  totalPrize:'26.000.000đ',
  totalAwards:15,
  prizeSummary:'7 giải chủ đề · 5 giải màu · 2 giải online · 1 giải Nhất',
  intro:'Một trang để bạn xem nhanh điều kiện tham gia, cách gửi tác phẩm, các mốc quan trọng và toàn bộ cơ cấu 15 giải của HALO HOLA 2026.',
  awards:[
    {
      code:'SPECIAL',
      label:'Giải Nhất',
      name:'Giải Nhất HALO HOLA 2026',
      amount:'5.000.000đ + quà',
      quantity:'01 giải',
      description:'Giải cao nhất của HALO HOLA 2026. Giá trị tiền mặt 5.000.000đ kèm quà tặng; kết quả theo cơ chế Hội đồng và bình chọn cộng đồng của chương trình.',
      tone:'forest',
      featured:true,
      enabled:true
    },
    {
      code:'THEME_01_07',
      label:'Giải chủ đề',
      name:'07 giải chủ đề 01–07',
      amount:'2.000.000đ + quà / giải',
      quantity:'07 giải',
      description:'Mỗi chủ đề từ 01 đến 07 có 01 giải. Mỗi giải gồm 2.000.000đ tiền mặt và quà tặng.',
      tone:'terra',
      featured:false,
      enabled:true
    },
    {
      code:'COLOR',
      label:'Giải màu',
      name:'05 giải màu Hòa Lạc',
      amount:'1.000.000đ / giải',
      quantity:'05 giải',
      description:'05 giải thuộc nhóm Sắc màu Hòa Lạc, mỗi giải trị giá 1.000.000đ tiền mặt.',
      tone:'sun',
      featured:false,
      enabled:true
    },
    {
      code:'FAVORITE',
      label:'Giải online',
      name:'Góc nhìn được yêu thích',
      amount:'1.000.000đ + quà',
      quantity:'01 giải',
      description:'Giải online dành cho tác phẩm được cộng đồng yêu thích theo quy định bình chọn; gồm 1.000.000đ tiền mặt và quà tặng.',
      tone:'green',
      featured:false,
      enabled:true
    },
    {
      code:'SPREAD',
      label:'Giải online',
      name:'Giải Lan tỏa',
      amount:'1.000.000đ + quà',
      quantity:'01 giải',
      description:'Giải online ghi nhận khả năng lan tỏa của tác phẩm; gồm 1.000.000đ tiền mặt và quà tặng.',
      tone:'beige',
      featured:false,
      enabled:true
    }
  ]
};

try {
  const currentResult=await pool.query(
    `SELECT value FROM site_settings WHERE setting_key='rulesAwards' LIMIT 1`
  );
  const current=currentResult.rows[0]?.value && typeof currentResult.rows[0].value==='object'
    ? currentResult.rows[0].value
    : {};

  const value={
    enabled:current.enabled!==false,
    title:current.title||'Thể lệ & Giải thưởng HALO HOLA 2026',
    juryWeight:Number.isFinite(Number(current.juryWeight))?Number(current.juryWeight):70,
    communityWeight:Number.isFinite(Number(current.communityWeight))?Number(current.communityWeight):30,
    ...current,
    ...valuePatch
  };

  const {rows}=await pool.query(
    `INSERT INTO site_settings (setting_key,value,updated_at)
     VALUES ('rulesAwards',$1::jsonb,NOW())
     ON CONFLICT (setting_key)
     DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()
     RETURNING setting_key,value,updated_at`,
    [JSON.stringify(value)]
  );

  console.log('HALO HOLA 2026 prize structure v2 applied:', {
    totalPrize:rows[0].value.totalPrize,
    totalAwards:rows[0].value.totalAwards,
    awards:rows[0].value.awards.map(item=>({code:item.code,quantity:item.quantity,amount:item.amount}))
  });
} finally {
  await pool.end();
}
