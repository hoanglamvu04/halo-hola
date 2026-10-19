import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2, Trophy } from 'lucide-react'
import { getAdminCmsSettings, updateAdminCmsSetting } from '../services/api.js'
import './AwardsManager.css'

// Legacy recognition configuration stays available to admins for historical data,
// but the public /the-le-giai-thuong page no longer renders an awards structure.
const DEFAULT_AWARDS=[]

const DEFAULT_CONFIG={
  enabled:false,
  title:'Ghi nhận nội bộ HALO HOLA 2026',
  intro:'Cấu hình tương thích cho dữ liệu cũ. Website public hiện vận hành theo mô hình biên tập – khám phá – lưu giữ câu chuyện.',
  officialPdfUrl:'',
  totalPrize:'',
  totalAwards:0,
  prizeSummary:'Không hiển thị cơ cấu giải trên public',
  juryWeight:0,
  communityWeight:0,
  awards:DEFAULT_AWARDS
}

const blankAward=()=>({
  code:'RECOGNITION_'+Date.now(),
  label:'Ghi nhận',
  name:'Hạng mục mới',
  amount:'',
  quantity:'',
  description:'',
  tone:'forest',
  featured:false,
  enabled:false
})

export default function AwardsManager(){
  const [draft,setDraft]=useState(DEFAULT_CONFIG)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    let alive=true
    getAdminCmsSettings().then(settings=>{
      if(!alive) return
      const current=settings?.rulesAwards||{}
      setDraft({
        ...DEFAULT_CONFIG,
        ...current,
        awards:Array.isArray(current.awards)?current.awards:DEFAULT_AWARDS
      })
    }).catch(err=>setMessage(err.message)).finally(()=>alive&&setLoading(false))
    return()=>{alive=false}
  },[])

  const awards=Array.isArray(draft.awards)?draft.awards:[]
  const visibleCount=useMemo(()=>awards.filter(item=>item.enabled!==false).length,[awards])
  const patch=(key,value)=>setDraft(v=>({...v,[key]:value}))
  const patchAward=(index,key,value)=>patch('awards',awards.map((item,i)=>i===index?{...item,[key]:value}:item))
  const addAward=()=>patch('awards',[...awards,blankAward()])
  const removeAward=index=>patch('awards',awards.filter((_,i)=>i!==index))
  const moveAward=(index,direction)=>{
    const target=index+direction
    if(target<0||target>=awards.length) return
    const next=[...awards]
    const [item]=next.splice(index,1)
    next.splice(target,0,item)
    patch('awards',next)
  }

  const save=async()=>{
    setSaving(true);setMessage('')
    try{
      const result=await updateAdminCmsSetting('rulesAwards',draft)
      setDraft(v=>({...v,...result.value,awards:Array.isArray(result.value?.awards)?result.value.awards:v.awards}))
      setMessage('Đã lưu cấu hình ghi nhận nội bộ. Trang public “Cách đóng góp” không hiển thị cơ cấu giải.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  if(loading) return <div className="admin-panel"><p>Đang tải cấu hình ghi nhận…</p></div>

  return <div className="awards-admin">
    <div className="awards-admin-head">
      <div>
        <span className="eyebrow">CẤU HÌNH TƯƠNG THÍCH</span>
        <h2><Trophy/> Ghi nhận nội bộ</h2>
        <p>Dữ liệu này được giữ để tương thích với trạng thái và lịch sử cũ. Trang public <b>/the-le-giai-thuong</b> hiện là hướng dẫn “Cách đóng góp” và không còn trình bày HALO HOLA như một cuộc thi.</p>
      </div>
      <button className="btn btn-green" onClick={save} disabled={saving}><Save/>{saving?'Đang lưu…':'Lưu thay đổi'}</button>
    </div>

    {message&&<div className="cms-message">{message}</div>}

    <div className="awards-admin-summary">
      <label className="awards-switch"><input type="checkbox" checked={draft.enabled!==false} onChange={e=>patch('enabled',e.target.checked)}/><span><b>Bật dữ liệu ghi nhận legacy</b><small>Không điều khiển trang public “Cách đóng góp”.</small></span></label>
      <label><span>Tiêu đề nội bộ</span><input value={draft.title||''} onChange={e=>patch('title',e.target.value)}/></label>
      <label className="wide"><span>Ghi chú</span><textarea rows="3" value={draft.intro||''} onChange={e=>patch('intro',e.target.value)}/></label>
      <label className="wide"><span>URL tài liệu tham khảo</span><input value={draft.officialPdfUrl||''} onChange={e=>patch('officialPdfUrl',e.target.value)} placeholder="https://..."/></label>
      <label><span>Giá trị legacy</span><input value={draft.totalPrize||''} onChange={e=>patch('totalPrize',e.target.value)}/></label>
      <label><span>Số hạng mục legacy</span><input type="number" min="0" value={draft.totalAwards??0} onChange={e=>patch('totalAwards',Number(e.target.value))}/></label>
      <label className="wide"><span>Tóm tắt</span><input value={draft.prizeSummary||''} onChange={e=>patch('prizeSummary',e.target.value)}/></label>
      <label><span>Trọng số legacy 1 (%)</span><input type="number" min="0" max="100" value={draft.juryWeight??0} onChange={e=>patch('juryWeight',Number(e.target.value))}/></label>
      <label><span>Trọng số legacy 2 (%)</span><input type="number" min="0" max="100" value={draft.communityWeight??0} onChange={e=>patch('communityWeight',Number(e.target.value))}/></label>
    </div>

    <div className="awards-admin-list-head">
      <div><h3>Các hạng mục dữ liệu cũ</h3><p>{awards.length} hạng mục · {visibleCount} đang bật</p></div>
      <button className="btn btn-outline btn-sm" onClick={addAward}><Plus/> Thêm hạng mục</button>
    </div>

    <div className="awards-admin-list">
      {awards.map((award,index)=><article key={award.code||index} className={award.enabled===false?'is-hidden':''}>
        <div className="award-admin-index">{String(index+1).padStart(2,'0')}</div>
        <div className="award-admin-fields">
          <div className="award-admin-row three">
            <label><span>Nhãn</span><input value={award.label||''} onChange={e=>patchAward(index,'label',e.target.value)}/></label>
            <label><span>Tên hạng mục</span><input value={award.name||''} onChange={e=>patchAward(index,'name',e.target.value)}/></label>
            <label><span>Mã nội bộ</span><input value={award.code||''} onChange={e=>patchAward(index,'code',e.target.value)}/></label>
          </div>
          <div className="award-admin-row three">
            <label><span>Giá trị</span><input value={award.amount||''} onChange={e=>patchAward(index,'amount',e.target.value)}/></label>
            <label><span>Số lượng</span><input value={award.quantity||''} onChange={e=>patchAward(index,'quantity',e.target.value)}/></label>
            <label><span>Phong cách màu</span><select value={award.tone||'forest'} onChange={e=>patchAward(index,'tone',e.target.value)}><option value="forest">Xanh đậm</option><option value="terra">Cam đất</option><option value="sun">Vàng nắng</option><option value="green">Xanh non</option><option value="beige">Be</option></select></label>
          </div>
          <label className="award-admin-description"><span>Mô tả</span><textarea rows="3" value={award.description||''} onChange={e=>patchAward(index,'description',e.target.value)}/></label>
          <div className="award-admin-toggles">
            <label><input type="checkbox" checked={award.enabled!==false} onChange={e=>patchAward(index,'enabled',e.target.checked)}/><span>{award.enabled!==false?<><Eye/> Đang bật</>:<><EyeOff/> Đang tắt</>}</span></label>
            <label><input type="checkbox" checked={Boolean(award.featured)} onChange={e=>patchAward(index,'featured',e.target.checked)}/><span>Nổi bật nội bộ</span></label>
          </div>
        </div>
        <div className="award-admin-actions">
          <button onClick={()=>moveAward(index,-1)} disabled={index===0} title="Đưa lên"><ArrowUp/></button>
          <button onClick={()=>moveAward(index,1)} disabled={index===awards.length-1} title="Đưa xuống"><ArrowDown/></button>
          <button className="danger" onClick={()=>removeAward(index)} title="Xóa"><Trash2/></button>
        </div>
      </article>)}
    </div>

    <div className="awards-admin-footer">
      <p><b>Lưu ý:</b> HALO HOLA 2026 public vận hành theo định hướng chương trình sáng tạo cộng đồng và dự án biên tập. Các trường ở đây chỉ phục vụ tương thích dữ liệu lịch sử nếu cần.</p>
      <button className="btn btn-green" onClick={save} disabled={saving}><Save/>{saving?'Đang lưu…':'Lưu thay đổi'}</button>
    </div>
  </div>
}
