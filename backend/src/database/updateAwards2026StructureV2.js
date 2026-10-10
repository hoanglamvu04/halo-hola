import { pool } from './pool.js';

const valuePatch={
  totalPrize:'56.000.000đ',
  totalAwards:11,
  prizeSummary:'8 giải chủ đề · 2 giải phụ · 1 giải đặc biệt',
  intro:'Điều kiện tham gia, cách gửi tác phẩm, mốc thời gian và cơ cấu giải thưởng chính thức của HALO HOLA 2026.',
  awards:[
    {
      code:'SPECIAL',
      label:'Giải đặc biệt',
      name:'Danh hiệu HALO HOLA 2026',
      amount:'10.000.000đ + cúp + chứng nhận',
      quantity:'01 giải',
      description:'Chọn từ 07 tác phẩm đoạt giải chủ đề 01–07; điểm Danh hiệu gồm 70% Hội đồng giám khảo và 30% bình chọn cộng đồng.',
      tone:'forest',
      featured:true,
      enabled:true
    },
    {
      code:'THEME_01_07',
      label:'Giải chủ đề',
      name:'07 giải chủ đề 01–07',
      amount:'5.000.000đ / giải + chứng nhận',
      quantity:'07 giải',
      description:'Mỗi chủ đề từ 01 đến 07 có 01 giải, trị giá 5.000.000 đồng và chứng nhận.',
      tone:'terra',
      featured:false,
      enabled:true
    },
    {
      code:'COLOR',
      label:'Chủ đề 08',
      name:'Sắc màu Hòa Lạc · 06 chủ nhân',
      amount:'1.000.000đ / chủ nhân + chứng nhận',
      quantity:'06 chủ nhân',
      description:'06 chủ nhân đại diện 06 đặc trưng sắc màu; xét trên mọi tác phẩm hợp lệ ở cả 8 chủ đề.',
      tone:'sun',
      featured:false,
      enabled:true
    },
    {
      code:'FAVORITE',
      label:'Giải phụ',
      name:'Góc nhìn được yêu thích',
      amount:'3.000.000đ + chứng nhận',
      quantity:'01 giải',
      description:'Dành cho tác phẩm có điểm bình chọn hợp lệ cao nhất theo thể lệ chương trình.',
      tone:'green',
      featured:false,
      enabled:true
    },
    {
      code:'SPREAD',
      label:'Giải phụ',
      name:'Giải Lan tỏa',
      amount:'2.000.000đ + chứng nhận',
      quantity:'01 giải',
      description:'Ghi nhận khả năng lan tỏa tự nhiên của tác phẩm theo cách tính tương tác trong thể lệ.',
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

  console.log('HALO HOLA 2026 official prize structure applied:', {
    totalPrize:rows[0].value.totalPrize,
    totalAwards:rows[0].value.totalAwards,
    awards:rows[0].value.awards.map(item=>({code:item.code,quantity:item.quantity,amount:item.amount}))
  });
} finally {
  await pool.end();
}
