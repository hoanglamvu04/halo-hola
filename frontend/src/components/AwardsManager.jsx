import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2, Trophy } from 'lucide-react'
import { getAdminCmsSettings, updateAdminCmsSetting } from '../services/api.js'
import { DEFAULT_AWARDS } from '../pages/RulesAwardsPage.jsx'
import './AwardsManager.css'

const DEFAULT_CONFIG={
  enabled:true,
  title:'Thể lệ & Giải thưởng HALO HOLA 2026',
  intro:'Một trang để bạn xem nhanh điều kiện tham gia, cách gửi tác phẩm, các mốc quan trọng và toàn bộ cơ cấu 11 giải của HALO HOLA 2026.',
  totalPrize:'56.000.000đ',
  juryWeight:70,
  communityWeight:30,
  awards:DEFAULT_AWARDS
}

const blankAward=()=>({
  code:'AWARD_'+Date.now(),
  label:'Giải thưởng',
  name:'Giải mới',
  amount:'',
  quantity:'01 giải',
  description:'',
  tone:'forest',
  featured:false,
  enabled:true
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
        awards:Array.isArray(current.awards)&&current.awards.length?current.awards:DEFAULT_AWARDS
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
      setMessage('Đã lưu cơ cấu giải thưởng và áp dụng lên trang public.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  if(loading) return <div className="admin-panel"><p>Đang tải cấu hình giải thưởng…</p></div>

  return <div className="awards-admin">
    <div className="awards-admin-head">
      <div>
        <span className="eyebrow">THỂ LỆ & GIẢI THƯỞNG</span>
        <h2><Trophy/> Quản lý giải thưởng</h2>
        <p>Chỉnh nội dung hiển thị tại <b>/the-le-giai-thuong</b>. Thay đổi ở đây không ảnh hưởng dữ liệu chấm giải hay trạng thái tác phẩm.</p>
      </div>
      <button className="btn btn-green" onClick={save} disabled={saving}><Save/>{saving?'Đang lưu…':'Lưu thay đổi'}</button>
    </div>

    {message&&<div className="cms-message">{message}</div>}

    <div className="awards-admin-summary">
      <label className="awards-switch"><input type="checkbox" checked={draft.enabled!==false} onChange={e=>patch('enabled',e.target.checked)}/><span><b>Hiển thị khối giải thưởng</b><small>Có thể tạm ẩn toàn bộ giải thưởng trên trang public.</small></span></label>
      <label><span>Tiêu đề trang</span><input value={draft.title||''} onChange={e=>patch('title',e.target.value)}/></label>
      <label className="wide"><span>Mô tả đầu trang</span><textarea rows="3" value={draft.intro||''} onChange={e=>patch('intro',e.target.value)}/></label>
      <label><span>Tổng giải thưởng</span><input value={draft.totalPrize||''} onChange={e=>patch('totalPrize',e.target.value)} placeholder="56.000.000đ"/></label>
      <label><span>Tỷ trọng Hội đồng (%)</span><input type="number" min="0" max="100" value={draft.juryWeight??70} onChange={e=>patch('juryWeight',Number(e.target.value))}/></label>
      <label><span>Tỷ trọng cộng đồng (%)</span><input type="number" min="0" max="100" value={draft.communityWeight??30} onChange={e=>patch('communityWeight',Number(e.target.value))}/></label>
    </div>

    <div className="awards-admin-list-head">
      <div><h3>Cơ cấu giải thưởng</h3><p>{awards.length} hạng mục · {visibleCount} đang hiển thị</p></div>
      <button className="btn btn-outline btn-sm" onClick={addAward}><Plus/> Thêm hạng mục</button>
    </div>

    <div className="awards-admin-list">
      {awards.map((award,index)=><article key={award.code||index} className={award.enabled===false?'is-hidden':''}>
        <div className="award-admin-index">{String(index+1).padStart(2,'0')}</div>
        <div className="award-admin-fields">
          <div className="award-admin-row three">
            <label><span>Nhãn</span><input value={award.label||''} onChange={e=>patchAward(index,'label',e.target.value)} placeholder="Giải đặc biệt"/></label>
            <label><span>Tên giải</span><input value={award.name||''} onChange={e=>patchAward(index,'name',e.target.value)} placeholder="Danh hiệu HALO HOLA 2026"/></label>
            <label><span>Mã nội bộ</span><input value={award.code||''} onChange={e=>patchAward(index,'code',e.target.value)} placeholder="SPECIAL"/></label>
          </div>
          <div className="award-admin-row three">
            <label><span>Giá trị</span><input value={award.amount||''} onChange={e=>patchAward(index,'amount',e.target.value)} placeholder="10.000.000đ + cúp"/></label>
            <label><span>Số lượng</span><input value={award.quantity||''} onChange={e=>patchAward(index,'quantity',e.target.value)} placeholder="01 giải"/></label>
            <label><span>Phong cách màu</span><select value={award.tone||'forest'} onChange={e=>patchAward(index,'tone',e.target.value)}><option value="forest">Xanh đậm</option><option value="terra">Cam đất</option><option value="sun">Vàng nắng</option><option value="green">Xanh non</option><option value="beige">Be</option></select></label>
          </div>
          <label className="award-admin-description"><span>Mô tả / điều kiện</span><textarea rows="3" value={award.description||''} onChange={e=>patchAward(index,'description',e.target.value)}/></label>
          <div className="award-admin-toggles">
            <label><input type="checkbox" checked={award.enabled!==false} onChange={e=>patchAward(index,'enabled',e.target.checked)}/><span>{award.enabled!==false?<><Eye/> Đang hiển thị</>:<><EyeOff/> Đang ẩn</>}</span></label>
            <label><input type="checkbox" checked={Boolean(award.featured)} onChange={e=>patchAward(index,'featured',e.target.checked)}/><span>Nổi bật card lớn</span></label>
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
      <p><b>Lưu ý:</b> cơ cấu mặc định đang theo bộ tài liệu HALO HOLA 2026: 11 giải, tổng 56.000.000đ; giải được cộng dồn.</p>
      <button className="btn btn-green" onClick={save} disabled={saving}><Save/>{saving?'Đang lưu…':'Lưu thay đổi'}</button>
    </div>
  </div>
}
