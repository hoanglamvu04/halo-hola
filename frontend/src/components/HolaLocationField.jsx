import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Crosshair, ExternalLink, Loader2, MapPin, Search, X } from 'lucide-react'
import {
  getHolaNearbyPlaces,
  normalizeHolaPlace,
  searchHolaPlaces
} from '../services/holaMapsApi.js'

const HOLA_MAPS_ORIGIN='https://maps.dothihoalac.vn'
const clean=value=>String(value??'').trim()
const finite=value=>Number.isFinite(Number(value))

function normalizeList(result){
  return (Array.isArray(result?.items)?result.items:[])
    .map(normalizeHolaPlace)
    .filter(item=>item&&finite(item.lat)&&finite(item.lng))
}

export default function HolaLocationField({form,setForm}){
  const [query,setQuery]=useState(()=>clean(form.location))
  const [results,setResults]=useState([])
  const [searching,setSearching]=useState(false)
  const [locating,setLocating]=useState(false)
  const [pickerOpen,setPickerOpen]=useState(false)
  const [error,setError]=useState('')
  const searchAbort=useRef(null)

  useEffect(()=>{
    if(clean(form.location)!==query&&form.locationSource!=='manual'){
      setQuery(clean(form.location))
    }
    // query is intentionally omitted: we only sync when a structured location changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[form.location,form.locationSource])

  const applyLocation=(payload={})=>{
    const lat=finite(payload.lat)?String(Number(payload.lat)):''
    const lng=finite(payload.lng)?String(Number(payload.lng)):''
    const label=clean(payload.label)||clean(payload.name)||clean(payload.address)||'Vị trí ghim trên HOLA Maps'
    const address=clean(payload.address)
    setForm(current=>({
      ...current,
      location:label,
      locationLat:lat,
      locationLng:lng,
      locationPlaceId:clean(payload.placeId||payload.id),
      locationPlaceSlug:clean(payload.placeSlug||payload.slug),
      locationAddress:address,
      locationSource:clean(payload.source)||'hola_picker'
    }))
    setQuery(label)
    setResults([])
    setError('')
  }

  useEffect(()=>{
    const onMessage=(event)=>{
      if(event.origin!==HOLA_MAPS_ORIGIN) return
      if(event.data?.type!=='HOLA_MAP_LOCATION_SELECTED') return
      const payload=event.data?.payload||{}
      if(!finite(payload.lat)||!finite(payload.lng)) return
      applyLocation(payload)
      setPickerOpen(false)
    }
    window.addEventListener('message',onMessage)
    return()=>window.removeEventListener('message',onMessage)
    // applyLocation only writes current payload into state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    const term=clean(query)
    if(term.length<2||term===clean(form.location)&&form.locationSource!=='manual'){
      setResults([])
      setSearching(false)
      return undefined
    }

    searchAbort.current?.abort()
    const controller=new AbortController()
    searchAbort.current=controller
    const timer=window.setTimeout(async()=>{
      setSearching(true)
      setError('')
      try{
        const result=await searchHolaPlaces(term,{limit:7},{signal:controller.signal})
        setResults(normalizeList(result))
      }catch(nextError){
        if(nextError?.name!=='AbortError') setError(nextError.message||'Không tìm được địa điểm trên HOLA Maps.')
      }finally{
        if(!controller.signal.aborted) setSearching(false)
      }
    },280)

    return()=>{
      window.clearTimeout(timer)
      controller.abort()
    }
  },[query,form.location,form.locationSource])

  const pickerUrl=useMemo(()=>{
    if(typeof window==='undefined') return `${HOLA_MAPS_ORIGIN}/picker`
    const params=new URLSearchParams({origin:window.location.origin})
    if(finite(form.locationLat)) params.set('lat',String(form.locationLat))
    if(finite(form.locationLng)) params.set('lng',String(form.locationLng))
    if(clean(form.location)) params.set('label',clean(form.location))
    return `${HOLA_MAPS_ORIGIN}/picker?${params.toString()}`
  },[form.location,form.locationLat,form.locationLng])

  const onManualChange=value=>{
    setQuery(value)
    setError('')
    setForm(current=>({
      ...current,
      location:value,
      locationLat:'',
      locationLng:'',
      locationPlaceId:'',
      locationPlaceSlug:'',
      locationAddress:'',
      locationSource:'manual'
    }))
  }

  const choosePlace=place=>{
    applyLocation({
      label:place.name,
      address:place.address,
      lat:place.lat,
      lng:place.lng,
      placeId:place.id,
      placeSlug:place.slug,
      source:'hola_place'
    })
  }

  const useCurrentLocation=()=>{
    if(!navigator.geolocation){
      setError('Trình duyệt không hỗ trợ định vị.')
      return
    }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(async position=>{
      const lat=Number(position.coords.latitude)
      const lng=Number(position.coords.longitude)
      let nearest=null
      try{
        const nearby=await getHolaNearbyPlaces(lat,lng,2500,{limit:5})
        nearest=normalizeList(nearby)[0]||null
      }catch{}
      applyLocation({
        label:nearest?.name?`${nearest.name} · vị trí hiện tại`:'Vị trí hiện tại',
        address:nearest?.address||'',
        lat,lng,
        placeId:nearest?.id||'',
        placeSlug:nearest?.slug||'',
        source:'current_location'
      })
      setLocating(false)
    },geoError=>{
      const message=geoError?.code===1
        ? 'Bạn chưa cấp quyền vị trí. Hãy cho phép Location rồi thử lại.'
        : geoError?.code===3
          ? 'Định vị mất quá nhiều thời gian. Hãy thử lại.'
          : 'Thiết bị chưa xác định được vị trí hiện tại.'
      setError(message)
      setLocating(false)
    },{enableHighAccuracy:true,maximumAge:0,timeout:10000})
  }

  const hasCoordinates=finite(form.locationLat)&&finite(form.locationLng)
  const sourceLabel={
    hola_place:'Địa điểm HOLA Maps',
    current_location:'Vị trí hiện tại',
    hola_picker:'Ghim trên HOLA Maps',
    halo_hola:'Ghim trên HOLA Maps',
    manual:'Nhập thủ công'
  }[form.locationSource]||'Địa điểm'

  return <div className="hola-location-field full">
    <label>Địa điểm *</label>
    <div className="hola-location-search">
      <MapPin size={18}/>
      <input
        value={query}
        onChange={e=>onManualChange(e.target.value)}
        onFocus={()=>{ if(clean(query).length>=2&&form.locationSource==='manual') setResults(results) }}
        placeholder="Tìm địa điểm trên HOLA Maps hoặc nhập tên địa điểm"
        autoComplete="off"
      />
      {searching?<Loader2 className="spin" size={17}/>:query?<button type="button" aria-label="Xóa địa điểm" onClick={()=>onManualChange('')}><X size={16}/></button>:null}
      <span className="hola-location-brand">HOLA Maps</span>
    </div>

    {results.length>0&&<div className="hola-location-results">
      {results.map(place=><button type="button" key={place.id||place.slug} onClick={()=>choosePlace(place)}>
        <MapPin size={16}/>
        <span><b>{place.name}</b><small>{place.address||place.category||'Hòa Lạc'}</small></span>
      </button>)}
    </div>}

    <div className="hola-location-actions">
      <button type="button" onClick={useCurrentLocation} disabled={locating}>
        {locating?<Loader2 className="spin" size={16}/>:<Crosshair size={16}/>} Vị trí hiện tại
      </button>
      <button type="button" className="primary" onClick={()=>setPickerOpen(true)}>
        <MapPin size={16}/> Chọn / ghim trên HOLA Maps
      </button>
      <a href={HOLA_MAPS_ORIGIN} target="_blank" rel="noreferrer">Mở HOLA Maps <ExternalLink size={14}/></a>
    </div>

    {clean(form.location)&&<div className={hasCoordinates?'hola-location-selected structured':'hola-location-selected'}>
      <div className="hola-location-selected-icon">{hasCoordinates?<Check size={17}/>:<MapPin size={17}/>}</div>
      <div>
        <small>{sourceLabel}</small>
        <b>{form.location}</b>
        {form.locationAddress&&form.locationAddress!==form.location&&<span>{form.locationAddress}</span>}
        {hasCoordinates&&<code>{Number(form.locationLat).toFixed(6)}, {Number(form.locationLng).toFixed(6)}</code>}
      </div>
      {form.locationPlaceId&&<span className="hola-location-linked">Đã liên kết địa điểm</span>}
    </div>}

    {error&&<div className="hola-location-error">{error}</div>}
    <small className="hola-location-help">Bạn có thể chọn một địa điểm có sẵn, lấy vị trí hiện tại hoặc ghim chính xác vị trí chụp trên bản đồ.</small>

    {pickerOpen&&<div className="hola-map-picker-modal" role="dialog" aria-modal="true" aria-label="Chọn vị trí trên HOLA Maps">
      <div className="hola-map-picker-panel">
        <header>
          <div><span>HOLA MAPS</span><b>Ghim vị trí thực hiện tác phẩm</b></div>
          <button type="button" onClick={()=>setPickerOpen(false)} aria-label="Đóng"><X size={20}/></button>
        </header>
        <iframe
          src={pickerUrl}
          title="Chọn vị trí trên HOLA Maps"
          allow="geolocation; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <footer>Di chuyển bản đồ tới đúng điểm rồi bấm <b>“Dùng vị trí này”</b> trong HOLA Maps.</footer>
      </div>
    </div>}
  </div>
}
