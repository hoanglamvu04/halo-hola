import { pool } from './pool.js';

const NEW_TOTAL='31.500.000đ';

const DEFAULT_AWARDS=[
  {
    code:'SPECIAL',
    label:'Giải đặc biệt',
    name:'Danh hiệu HALO HOLA 2026',
    amount:'5.000.000đ + cúp',
    quantity:'01 giải',
    description:'Chọn từ 07 tác phẩm đoạt giải chủ đề 01–07. Kết quả vòng Danh hiệu gồm 70% Hội đồng và 30% bình chọn cộng đồng.',
    tone:'forest',
    featured:true,
    enabled:true
  },
  {
    code:'THEME_01_07',
    label:'Giải chủ đề',
    name:'07 giải chủ đề 01–07',
    amount:'2.500.000đ / giải',
    quantity:'07 giải',
    description:'Mỗi chủ đề từ 01 đến 07 có 01 giải chính. Các tác phẩm thắng 07 chủ đề cùng đi tiếp vào vòng Danh hiệu HALO HOLA 2026.',
    tone:'terra',
    enabled:true
  },
  {
    code:'COLOR',
    label:'Chủ đề 08',
    name:'Sắc màu Hòa Lạc',
    amount:'1.000.000đ / chủ nhân',
    quantity:'06 chủ nhân',
    description:'06 đặc trưng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc. Mọi tác phẩm hợp lệ ở cả 8 chủ đề đều được xét.',
    tone:'sun',
    enabled:true
  },
  {
    code:'FAVORITE',
    label:'Giải phụ',
    name:'Góc nhìn được yêu thích',
    amount:'2.000.000đ',
    quantity:'01 giải',
    description:'Dành cho tác phẩm có lượt cảm xúc cao nhất trên bài đăng gốc theo quy định bình chọn của chương trình.',
    tone:'green',
    enabled:true
  },
  {
    code:'SPREAD',
    label:'Giải phụ',
    name:'Giải Lan tỏa',
    amount:'1.000.000đ',
    quantity:'01 giải',
    description:'Ghi nhận khả năng lan tỏa tự nhiên của tác phẩm theo cách quy đổi được Ban Tổ chức công bố.',
    tone:'beige',
    enabled:true
  }
];

const amountByCode={
  SPECIAL:'5.000.000đ + cúp',
  THEME_01_07:'2.500.000đ / giải',
  COLOR:'1.000.000đ / chủ nhân',
  FAVORITE:'2.000.000đ',
  SPREAD:'1.000.000đ'
};

try {
  const currentResult=await pool.query(
    `SELECT value FROM site_settings WHERE setting_key='rulesAwards' LIMIT 1`
  );

  const current=currentResult.rows[0]?.value && typeof currentResult.rows[0].value==='object'
    ? currentResult.rows[0].value
    : {};

  const currentAwards=Array.isArray(current.awards)&&current.awards.length
    ? current.awards
    : DEFAULT_AWARDS;

  const awards=currentAwards.map((award,index)=>{
    const fallback=DEFAULT_AWARDS[index];
    const code=award?.code||fallback?.code;
    const nextAmount=amountByCode[code];
    return nextAmount ? {...award,amount:nextAmount} : award;
  });

  // Ensure the official five award groups are present if the setting had never been saved.
  const existingCodes=new Set(awards.map(item=>item?.code).filter(Boolean));
  for(const item of DEFAULT_AWARDS){
    if(!existingCodes.has(item.code)) awards.push(item);
  }

  const value={
    enabled:current.enabled!==false,
    title:current.title||'Thể lệ & Giải thưởng HALO HOLA 2026',
    intro:current.intro||'Một trang để bạn xem nhanh điều kiện tham gia, cách gửi tác phẩm, các mốc quan trọng và toàn bộ cơ cấu 11 giải của HALO HOLA 2026.',
    juryWeight:Number.isFinite(Number(current.juryWeight))?Number(current.juryWeight):70,
    communityWeight:Number.isFinite(Number(current.communityWeight))?Number(current.communityWeight):30,
    ...current,
    totalPrize:NEW_TOTAL,
    awards
  };

  const {rows}=await pool.query(
    `INSERT INTO site_settings (setting_key,value,updated_at)
     VALUES ('rulesAwards',$1::jsonb,NOW())
     ON CONFLICT (setting_key)
     DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()
     RETURNING setting_key,value,updated_at`,
    [JSON.stringify(value)]
  );

  console.log('HALO HOLA 2026 prize values updated:', {
    totalPrize:rows[0].value.totalPrize,
    awards:rows[0].value.awards.map(item=>({code:item.code,amount:item.amount}))
  });
} finally {
  await pool.end();
}
