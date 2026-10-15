const WIDTHS=[480,960,1600]
const SOURCE_TYPES=new Set(['image/jpeg','image/png','image/webp'])

function canvasBlob(canvas,type,quality){
  return new Promise(resolve=>canvas.toBlob(blob=>resolve(blob&&blob.size?blob:null),type,quality))
}

async function renderVariant(bitmap,width,type,quality){
  if(bitmap.width<width)return null
  const height=Math.max(1,Math.round(bitmap.height*(width/bitmap.width)))
  const canvas=document.createElement('canvas')
  canvas.width=width;canvas.height=height
  const ctx=canvas.getContext('2d',{alpha:false})
  if(!ctx)return null
  ctx.drawImage(bitmap,0,0,width,height)
  const blob=await canvasBlob(canvas,type,quality)
  if(!blob||blob.type!==type)return null
  return blob
}

export async function buildSubmissionImageVariants(files=[]){
  if(typeof document==='undefined'||typeof createImageBitmap!=='function')return[]
  const output=[]
  for(let index=0;index<files.length;index+=1){
    const file=files[index]
    if(!SOURCE_TYPES.has(String(file?.type||'').toLowerCase()))continue
    let bitmap
    try{
      bitmap=await createImageBitmap(file,{imageOrientation:'from-image'})
      for(const width of WIDTHS){
        const webp=await renderVariant(bitmap,width,'image/webp',.82)
        if(webp)output.push({blob:webp,name:`variant-${index}-${width}.webp`})
        const avif=await renderVariant(bitmap,width,'image/avif',.68)
        if(avif)output.push({blob:avif,name:`variant-${index}-${width}.avif`})
      }
    }catch{
      // RAW/TIFF/unsupported browser codecs keep the immutable original only.
    }finally{
      bitmap?.close?.()
    }
  }
  return output
}
