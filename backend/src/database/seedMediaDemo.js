import { pool } from './pool.js';

const assets = [
  ['demo-ho-dong-mo.jpg','Hồ Đồng Mô','Phong cảnh mặt nước dùng cho HOLA Map và Stories','map','map,ho-dong-mo,thien-nhien','https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=88'],
  ['demo-nang-hoa-lac.jpg','Nắng Hòa Lạc','Ánh sáng và đồi núi phía Tây','stories','nang,anh-sang,hoa-lac','https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=88'],
  ['demo-net-doai.jpg','Nét Đoài','Không gian gợi ký ức và bản sắc','themes','net-doai,van-hoa,ky-uc','https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=88'],
  ['demo-kien-truc.jpg','Kiến trúc Hòa Lạc','Không gian kiến trúc hiện đại','themes','kien-truc,khong-gian,tuong-lai','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=88'],
  ['demo-hoa-lac-xanh.jpg','Hòa Lạc xanh','Mảng xanh và thiên nhiên','themes','hoa-lac-xanh,thien-nhien','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=88'],
  ['demo-con-nguoi.jpg','Con người Hòa Lạc','Hình ảnh cộng đồng và kết nối','community','con-nguoi,cong-dong','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=88'],
  ['demo-tri-thuc.jpg','Tri thức Hòa Lạc','Hình ảnh sinh viên và không gian tri thức','community','tri-thuc,sinh-vien,dhqg','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=88'],
  ['demo-camera.jpg','Góc nhìn sáng tạo','Máy ảnh và hành trình ghi lại Hòa Lạc','stories','photo,camera,sang-tao','https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1600&q=88'],
  ['demo-hola-tour.jpg','HOLA Tour','Hình đại diện trải nghiệm và hành trình','tours','tour,trai-nghiem,hanh-trinh','https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=88'],
  ['demo-hero.jpg','HALO HOLA Hero','Ảnh phong cảnh dùng thử cho Hero','hero','hero,hoa-lac,phong-canh','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=88']
];

async function main(){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    for(const [name,title,alt,folder,tags,url] of assets){
      const existing=await client.query('SELECT id FROM site_assets WHERE original_name=$1 LIMIT 1',[name]);
      if(existing.rowCount){
        await client.query(
          `UPDATE site_assets SET section_key=$2,mime_type='image/jpeg',size_bytes=1200000,storage_provider='EXTERNAL',
           bucket=NULL,object_key=$3,title=$4,alt_text=$5,folder=$6,tags=$7,archived=FALSE WHERE id=$1`,
          [existing.rows[0].id,folder,url,title,alt,folder,tags]
        );
      }else{
        await client.query(
          `INSERT INTO site_assets
           (section_key,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,title,alt_text,folder,tags,archived)
           VALUES ($1,$2,'image/jpeg',1200000,'EXTERNAL',NULL,$3,$4,$5,$6,$7,FALSE)`,
          [folder,name,url,title,alt,folder,tags]
        );
      }
    }
    await client.query('COMMIT');
    console.log(`HALO HOLA demo Media Library seed complete: ${assets.length} assets.`);
  }catch(error){
    await client.query('ROLLBACK');
    throw error;
  }finally{
    client.release();
    await pool.end();
  }
}

main().catch(error=>{console.error(error);process.exit(1);});
