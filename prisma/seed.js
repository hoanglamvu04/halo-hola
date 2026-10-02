import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const places = [
  { slug: 'ho-dong-mo', name: 'Hồ Đồng Mô', category: 'Thiên nhiên', lat: 21.051, lng: 105.445, desc: 'Mặt nước rộng, đồi xanh và những khoảng trời phía Tây.' },
  { slug: 'khu-cong-nghe-cao-hoa-lac', name: 'Khu Công nghệ cao Hòa Lạc', category: 'Kiến trúc', lat: 21.012, lng: 105.525, desc: 'Không gian công nghệ và đổi mới sáng tạo.' },
  { slug: 'dhqg-ha-noi', name: 'Đại học Quốc gia Hà Nội', category: 'Tri thức', lat: 21.037, lng: 105.527, desc: 'Không gian học tập, tri thức và tuổi trẻ.' },
  { slug: 'thach-hoa', name: 'Thạch Hòa', category: 'Văn hóa', lat: 21.03, lng: 105.56, desc: 'Làng xóm, đời sống và những dấu vết Xứ Đoài.' },
  { slug: 'ha-bang', name: 'Hạ Bằng', category: 'Con người', lat: 20.999, lng: 105.535, desc: 'Nhịp sống địa phương và những câu chuyện bình dị.' },
]

const tours = [
  { number: '01', title: 'Đoài – Mường', dates: '17–18.10.2026', kicker: 'Đi tìm bản sắc', desc: 'Làng xóm · kiến trúc · con người · Nét Đoài · văn hóa Mường · ký ức.', status: 'PUBLISHED' },
  { number: '02', title: 'Sắc màu Hòa Lạc', dates: '24–25.10.2026', kicker: 'Đi tìm màu sắc', desc: 'Tìm 6 sắc màu qua cảnh quan, kiến trúc, con người, công nghệ và đời sống.', status: 'PUBLISHED' },
  { number: '03', title: 'Nắng Hòa Lạc', dates: '31.10–01.11.2026', kicker: 'Đi tìm cảm xúc', desc: 'Nắng sớm · chiều vàng · Ba Vì · hoàng hôn phía Tây.', status: 'PUBLISHED' },
]

for (const place of places) {
  await prisma.place.upsert({ where: { slug: place.slug }, update: place, create: place })
}

for (const tour of tours) {
  await prisma.tour.upsert({ where: { number: tour.number }, update: tour, create: tour })
}

console.log('HALO HOLA seed complete')
await prisma.$disconnect()
