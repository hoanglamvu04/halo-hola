import { useEffect, useState } from 'react'
import { Palette, Save } from 'lucide-react'
import { getAdminColors, updateAdminColor } from '../services/colorAdminApi.js'
import './ColorPaletteManager.css'

export default function ColorPaletteManager(){
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')

  const load=async()=>{
    setLoading(true);setMessage('')
    try{
      const data=await getAdminColors()
      setItems(Array.isArray(data)?data:[])
    }catch(err){setMessage(err.message)}
    finally{setLoading(false)}
  }

  useEffect(()=>{load()},[])

  const patch=(index,key,value)=>{
    setItems(prev=>prev.map((item,i)=>i===index?{...item,[key]:value}:item))
  }

  const saveAll=async()=>{
    setSaving(true);setMessage('')
    try{
      const updated=[]
      for(const item of items){
        const row=await updateAdminColor(item.id,{name:item.name,color:item.color})
        updated.push(row)
      }
      setItems(updated)
      setMessage('Đã lưu tên và mã màu. Website công khai sẽ dùng bảng màu mới.')
    }catch(err){setMessage(err.message)}
    finally{setSaving(false)}
  }

  return <section className="color-palette-admin">
    <div className="color-palette-admin-head">
      <div><span className="eyebrow">BẢNG MÀU</span><h3><Palette size={20}/> Tên màu & mã màu</h3><p>Đổi tên hiển thị và mã HEX của 6 sắc màu. Thay đổi này dùng chung cho website và form gửi tác phẩm.</p></div>
      <button className="btn btn-green btn-sm" onClick={saveAll} disabled={saving||loading}><Save size={15}/>{saving?'Đang lưu...':'Lưu bảng màu'}</button>
    </div>

    {message&&<div className="color-palette-message">{message}</div>}
    {loading?<div className="color-palette-loading">Đang tải bảng màu…</div>:<div className="color-palette-grid">
      {items.map((item,index)=><div className="color-palette-row" key={item.id||item.slug}>
        <div className="color-palette-preview" style={{background:item.color||'#CCCCCC'}}/>
        <label><span>Tên màu {index+1}</span><input value={item.name||''} onChange={e=>patch(index,'name',e.target.value)}/></label>
        <label><span>Mã màu HEX</span><div className="color-palette-code"><input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(item.color||'')?item.color:'#CCCCCC'} onChange={e=>patch(index,'color',e.target.value.toUpperCase())}/><input value={item.color||''} placeholder="#2F5A3D" onChange={e=>patch(index,'color',e.target.value)}/></div></label>
      </div>)}
    </div>}
  </section>
}
