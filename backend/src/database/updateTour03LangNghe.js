import { pool } from './pool.js';

const imageVillage='https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85';
const imagePeople='https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85';
const imageArchitecture='https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85';

const itinerary=[
  {time:'Bắt đầu',title:'Gặp làng nghề & câu chuyện bản địa',description:'Mở hành trình bằng câu chuyện về nghề, không gian làng và những người đang giữ nhịp sống thủ công tại Hòa Lạc.'},
  {time:'Trong tour',title:'Theo dấu bàn tay người thợ',description:'Quan sát quy trình làm nghề, thao tác thủ công, công cụ và những chi tiết tạo nên dấu ấn riêng của từng sản phẩm.'},
  {time:'Trong tour',title:'Vật liệu · kỹ thuật · sản phẩm',description:'Tìm câu chuyện trong vật liệu, kỹ thuật, không gian xưởng và cách nghề truyền thống thích nghi với đời sống hôm nay.'},
  {time:'Kết thúc',title:'Kể lại một nghề bằng góc nhìn của bạn',description:'Tổng hợp ảnh, video, ghi chú và câu chuyện nhân vật để phát triển thành tác phẩm HALO HOLA.'}
];

const highlights=[
  {title:'Người thật · nghề thật',description:'Ưu tiên gặp gỡ người làm nghề và ghi lại câu chuyện từ chính trải nghiệm thực tế.'},
  {title:'Từ vật liệu đến sản phẩm',description:'Theo dõi hành trình của vật liệu, bàn tay người thợ và những kỹ thuật tạo nên sản phẩm.'},
  {title:'Ký ức & sinh kế',description:'Nhìn làng nghề như một phần của ký ức địa phương, đời sống cộng đồng và sinh kế đang tiếp tục chuyển mình.'}
];

const stops=[
  {name:'Không gian làng nghề',description:'Quan sát cấu trúc làng, nhịp sống và những dấu vết nghề còn hiện diện trong không gian địa phương.',image:imageVillage},
  {name:'Xưởng thủ công địa phương',description:'Tiếp cận quy trình, công cụ, vật liệu và cách người thợ làm ra sản phẩm.',image:imageArchitecture},
  {name:'Câu chuyện người làm nghề',description:'Gặp gỡ, trò chuyện và ghi lại chân dung những người đang gìn giữ hoặc làm mới nghề truyền thống.',image:imagePeople}
];

try {
  const result=await pool.query(
    `UPDATE tours SET
      title=$2,
      kicker=$3,
      description=$4,
      image=$5,
      itinerary=$6::jsonb,
      highlights=$7::jsonb,
      stops=$8::jsonb,
      updated_at=NOW()
     WHERE number=$1
     RETURNING number,title`,
    [
      '03',
      'Làng nghề Hòa Lạc',
      'Đi tìm bàn tay nghề',
      'Khám phá những lớp nghề thủ công quanh Hòa Lạc qua không gian làng, vật liệu, bàn tay người thợ, câu chuyện sinh kế và cách các nghề truyền thống đang tiếp tục sống trong nhịp hiện đại.',
      imageVillage,
      JSON.stringify(itinerary),
      JSON.stringify(highlights),
      JSON.stringify(stops)
    ]
  );

  if(result.rowCount===0){
    console.log('Tour #03 not found; no content changed.');
  }else{
    console.log('Tour #03 updated:',result.rows[0]);
  }

  const storyResult=await pool.query(
    `UPDATE stories
     SET body = CASE
       WHEN slug='hola-tour-di-nhin-gap-trai-nghiem-ke' THEN jsonb_build_array(
         jsonb_build_object('heading','Tour #01 · Đoài · Mường · 17–18/10','paragraphs',jsonb_build_array('Đi tìm bản sắc qua làng xóm, kiến trúc truyền thống, con người, Nét Đoài, văn hóa Mường và ký ức địa phương.')),
         jsonb_build_object('heading','Tour #02 · Sắc màu Hòa Lạc · 24–25/10','paragraphs',jsonb_build_array('Đi tìm 6 sắc màu qua kiến trúc, cảnh quan và con người. kientruchoalac.com đồng hành chuyên môn kiến trúc.')),
         jsonb_build_object('heading','Tour #03 · Làng nghề Hòa Lạc · 31/10–01/11','paragraphs',jsonb_build_array('Đi vào không gian làng nghề, gặp người làm nghề, quan sát vật liệu, kỹ thuật thủ công và ghi lại những câu chuyện về ký ức, sinh kế và sự tiếp nối của nghề truyền thống quanh Hòa Lạc.'))
       )
       ELSE body
     END,
     excerpt = CASE
       WHEN slug='hola-tour-di-nhin-gap-trai-nghiem-ke' THEN 'Ba hành trình cuối tuần giúp người tham gia chạm vào bản sắc, màu sắc và làng nghề Hòa Lạc bằng trải nghiệm thực tế.'
       ELSE excerpt
     END,
     updated_at=NOW()
     WHERE slug='hola-tour-di-nhin-gap-trai-nghiem-ke'
     RETURNING slug`,
    []
  );

  if(storyResult.rowCount>0) console.log('HOLA Tour editorial story updated.');
} finally {
  await pool.end();
}
