export function normalizeStory(item){
  if(!item) return item
  return {
    ...item,
    role:item.role||'Người kể chuyện',
    category:item.category||'Câu chuyện Hòa Lạc',
    location:item.location||'Hòa Lạc',
    readTime:item.readTime||item.read_time||'5 phút đọc',
    date:item.date||formatDate(item.created_at||item.createdAt),
    cover:item.cover||item.image,
    lead:item.lead||item.excerpt||'',
    quote:item.quote||'',
    body:Array.isArray(item.body)?item.body:parseJson(item.body,[]),
    gallery:Array.isArray(item.gallery)?item.gallery:parseJson(item.gallery,[])
  }
}

export function normalizeTour(item){
  if(!item) return item
  return {
    ...item,
    no:item.no||item.number,
    desc:item.desc||item.description||'',
    image:item.image||'',
    capacity:Number(item.capacity||20),
    itinerary:Array.isArray(item.itinerary)?item.itinerary:parseJson(item.itinerary,[]),
    highlights:Array.isArray(item.highlights)?item.highlights:parseJson(item.highlights,[]),
    stops:Array.isArray(item.stops)?item.stops:parseJson(item.stops,[]),
    location:item.location||'Hòa Lạc, Hà Nội',
    durationLabel:item.durationLabel||item.duration_label||'2 ngày',
    audienceLabel:item.audienceLabel||item.audience_label||'15–20 người'
  }
}

export function normalizePlace(item){
  if(!item) return item
  return {
    ...item,
    id:item.id||item.slug,
    position:item.position||[Number(item.lat),Number(item.lng)],
    desc:item.desc||item.description||'',
    tags:Array.isArray(item.tags)?item.tags:parseJson(item.tags,[])
  }
}

function parseJson(value,fallback){
  if(value==null) return fallback
  if(typeof value!=='string') return value
  try{return JSON.parse(value)}catch{return fallback}
}

function formatDate(value){
  if(!value) return ''
  const date=new Date(value)
  if(Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('vi-VN')
}
