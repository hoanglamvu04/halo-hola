import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Link2,
  Plus,
  Save,
  Smartphone,
  Trash2,
  Upload
} from 'lucide-react'
import {
  getAdminHomepageSections,
  getAdminSiteAssets,
  getHomepageContent,
  updateAdminHomepageSection,
  uploadAdminSiteAsset
} from '../services/api.js'
import { img } from '../data/siteData.js'
import './MobileHeroExperience.css'

function usePortalTarget(selector, enabled) {
  const [target, setTarget] = useState(null)

  useEffect(() => {
    setTarget(null)
    if (!enabled) return undefined

    let observer
    let frame
    const findTarget = () => {
      const node = document.querySelector(selector)
      if (node) {
        setTarget(node)
        observer?.disconnect()
        if (frame) cancelAnimationFrame(frame)
        return true
      }
      return false
    }

    if (!findTarget()) {
      frame = requestAnimationFrame(findTarget)
      observer = new MutationObserver(findTarget)
      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      observer?.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [selector, enabled])

  return target
}

function safeHref(raw) {
  const value = String(raw || '').trim()
  if (!value) return ''
  if (value.startsWith('/') || value.startsWith('#')) return value
  try {
    const parsed = new URL(value, window.location.origin)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? value : ''
  } catch {
    return ''
  }
}

function normalizeSlide(slide, index) {
  return {
    id: slide?.id || `slide-${index + 1}`,
    image: String(slide?.image || '').trim(),
    title: String(slide?.title || '').trim(),
    link: safeHref(slide?.link),
    enabled: slide?.enabled !== false,
    newTab: Boolean(slide?.newTab)
  }
}

function fallbackSlides(hero = {}) {
  return [
    {
      id: 'default-discover',
      image: hero.mainImage || img.lake,
      title: 'Khám phá HALO HOLA',
      link: '/top52',
      enabled: true,
      newTab: false
    },
    {
      id: 'default-stories',
      image: hero.floatImageA || img.architecture,
      title: 'Stories Hòa Lạc',
      link: '/stories',
      enabled: true,
      newTab: false
    },
    {
      id: 'default-map',
      image: hero.floatImageB || img.people,
      title: 'Khám phá HOLA Map',
      link: '/hola-map',
      enabled: true,
      newTab: false
    }
  ]
}

function MobileHeroCarousel({ host }) {
  const [hero, setHero] = useState(null)

  useEffect(() => {
    let alive = true
    getHomepageContent()
      .then((data) => {
        if (alive) setHero(data?.hero?.content || {})
      })
      .catch(() => {
        if (alive) setHero({})
      })
    return () => { alive = false }
  }, [])

  const enabled = hero?.mobileCarouselEnabled !== false
  const slides = useMemo(() => {
    if (hero === null) return []
    const configured = Array.isArray(hero.mobileSlides)
      ? hero.mobileSlides.map(normalizeSlide).filter((slide) => slide.enabled && slide.image)
      : []
    return configured.length ? configured : fallbackSlides(hero)
  }, [hero])

  useEffect(() => {
    if (!host) return undefined
    if (enabled && slides.length) host.classList.add('has-mobile-slider')
    else host.classList.remove('has-mobile-slider')
    return () => host.classList.remove('has-mobile-slider')
  }, [host, enabled, slides.length])

  if (!enabled || !slides.length) return null

  return <div className="mobile-hero-runtime-host" aria-label="Banner hero mobile">
    <div className="mobile-hero-slider">
      {slides.map((slide, index) => {
        const shared = <>
          <img src={slide.image} alt={slide.title || `HALO HOLA banner ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async"/>
          <span className="mobile-hero-slide-count">{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          {slide.title && <span className="mobile-hero-slide-title">{slide.title}</span>}
          {slide.link && <span className="mobile-hero-slide-open"><ExternalLink/></span>}
        </>

        return slide.link
          ? <a
              className="mobile-hero-slide"
              href={slide.link}
              target={slide.newTab ? '_blank' : undefined}
              rel={slide.newTab ? 'noopener noreferrer' : undefined}
              key={slide.id}
            >{shared}</a>
          : <div className="mobile-hero-slide" key={slide.id}>{shared}</div>
      })}
    </div>
    {slides.length > 1 && <div className="mobile-hero-swipe-hint"><span/> Lướt để xem thêm <span/></div>}
  </div>
}

function createBlankSlide() {
  const id = globalThis.crypto?.randomUUID?.() || `mobile-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return { id, image: '', title: '', link: '', enabled: true, newTab: false }
}

function MobileHeroManager() {
  const [heroSection, setHeroSection] = useState(null)
  const [slides, setSlides] = useState([])
  const [enabled, setEnabled] = useState(true)
  const [assets, setAssets] = useState([])
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [sections, media] = await Promise.all([
        getAdminHomepageSections(),
        getAdminSiteAssets({ sectionKey: 'hero-mobile' })
      ])
      const hero = (sections || []).find((item) => item.section_key === 'hero')
      setHeroSection(hero || null)
      setEnabled(hero?.content?.mobileCarouselEnabled !== false)
      const configured = Array.isArray(hero?.content?.mobileSlides)
        ? hero.content.mobileSlides.map(normalizeSlide)
        : fallbackSlides(hero?.content || {})
      setSlides(configured)
      setActiveId(configured[0]?.id || '')
      setAssets(media || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateSlide = (id, patch) => {
    setSlides((current) => current.map((slide) => slide.id === id ? { ...slide, ...patch } : slide))
  }

  const addSlide = () => {
    if (slides.length >= 12) {
      setMessage('Hero mobile đang giới hạn tối đa 12 banner để giữ tốc độ tải trang.')
      return
    }
    const slide = createBlankSlide()
    setSlides((current) => [...current, slide])
    setActiveId(slide.id)
  }

  const removeSlide = (id) => {
    setSlides((current) => current.filter((slide) => slide.id !== id))
    if (activeId === id) setActiveId('')
  }

  const move = (id, direction) => {
    setSlides((current) => {
      const index = current.findIndex((slide) => slide.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(nextIndex, 0, item)
      return copy
    })
  }

  const upload = async (id, file) => {
    if (!file) return
    setUploading(id)
    setMessage('')
    try {
      const asset = await uploadAdminSiteAsset('hero-mobile', file)
      updateSlide(id, { image: asset.url })
      setAssets((current) => [asset, ...current])
      setMessage('Đã tải ảnh banner. Bấm “Lưu hero mobile” để áp dụng lên website.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setUploading('')
    }
  }

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      const sections = await getAdminHomepageSections()
      const freshHero = (sections || []).find((item) => item.section_key === 'hero') || heroSection
      if (!freshHero) throw new Error('Không tìm thấy section Hero.')

      const cleanSlides = slides
        .slice(0, 12)
        .map((slide, index) => normalizeSlide({ ...slide, id: slide.id || `slide-${index + 1}` }, index))
        .filter((slide) => slide.image)

      await updateAdminHomepageSection('hero', {
        enabled: freshHero.enabled,
        content: {
          ...(freshHero.content || {}),
          mobileCarouselEnabled: enabled,
          mobileSlides: cleanSlides
        }
      })

      setMessage('Đã lưu Hero mobile. Trang quản trị sẽ tải lại để đồng bộ dữ liệu.')
      setTimeout(() => window.location.reload(), 650)
    } catch (error) {
      setMessage(error.message)
      setSaving(false)
    }
  }

  const activeSlide = slides.find((slide) => slide.id === activeId) || slides[0]

  return <section className="mobile-hero-admin">
    <header className="mobile-hero-admin-head">
      <div>
        <span className="mobile-hero-admin-kicker"><Smartphone/> GIAO DIỆN MOBILE</span>
        <h2>Hero banner dạng khối</h2>
        <p>Quản lý chuỗi banner ở Hero mobile: thêm ảnh, đổi thứ tự và gắn link chuyển hướng cho từng khối.</p>
      </div>
      <div className="mobile-hero-admin-actions">
        <label className="mobile-hero-switch">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)}/>
          <span>{enabled ? 'Đang bật' : 'Đang tắt'}</span>
        </label>
        <button className="btn btn-green btn-sm" onClick={save} disabled={saving || loading}><Save size={16}/>{saving ? 'Đang lưu...' : 'Lưu hero mobile'}</button>
      </div>
    </header>

    {message && <div className="mobile-hero-admin-message">{message}</div>}
    {loading ? <div className="mobile-hero-admin-empty">Đang tải cấu hình Hero mobile...</div> : <>
      <div className="mobile-hero-admin-toolbar">
        <div><b>{slides.length}</b><span>/ 12 banner</span></div>
        <button className="mobile-hero-add" onClick={addSlide}><Plus/> Thêm banner</button>
      </div>

      <div className="mobile-hero-block-list">
        {slides.map((slide, index) => <article className={'mobile-hero-block ' + (activeSlide?.id === slide.id ? 'active' : '')} key={slide.id} onClick={() => setActiveId(slide.id)}>
          <div className="mobile-hero-block-preview">
            {slide.image ? <img src={slide.image} alt=""/> : <div><ImagePlus/><span>Chưa có ảnh</span></div>}
            <b>{String(index + 1).padStart(2, '0')}</b>
          </div>

          <div className="mobile-hero-block-form">
            <label><span>Tên / mô tả banner</span><input value={slide.title || ''} onChange={(event) => updateSlide(slide.id, { title: event.target.value })} placeholder="VD: Khám phá Hòa Lạc"/></label>
            <label className="mobile-hero-image-control"><span>Ảnh banner</span><div><input value={slide.image || ''} onChange={(event) => updateSlide(slide.id, { image: event.target.value })} placeholder="URL ảnh"/><label className="mobile-hero-upload"><Upload/>{uploading === slide.id ? 'Đang tải...' : 'Tải ảnh'}<input hidden type="file" accept="image/*" disabled={uploading === slide.id} onChange={(event) => upload(slide.id, event.target.files?.[0])}/></label></div></label>
            <label><span><Link2/> Link chuyển hướng</span><input value={slide.link || ''} onChange={(event) => updateSlide(slide.id, { link: event.target.value })} placeholder="/stories hoặc https://..."/></label>
            <div className="mobile-hero-block-options">
              <label><input type="checkbox" checked={slide.enabled !== false} onChange={(event) => updateSlide(slide.id, { enabled: event.target.checked })}/> Hiển thị</label>
              <label><input type="checkbox" checked={Boolean(slide.newTab)} onChange={(event) => updateSlide(slide.id, { newTab: event.target.checked })}/> Mở tab mới</label>
            </div>
          </div>

          <div className="mobile-hero-block-actions">
            <button title="Đưa lên" onClick={(event) => { event.stopPropagation(); move(slide.id, -1) }} disabled={index === 0}><ArrowUp/></button>
            <button title="Đưa xuống" onClick={(event) => { event.stopPropagation(); move(slide.id, 1) }} disabled={index === slides.length - 1}><ArrowDown/></button>
            <button className="danger" title="Xóa banner" onClick={(event) => { event.stopPropagation(); removeSlide(slide.id) }}><Trash2/></button>
          </div>
        </article>)}
        {!slides.length && <div className="mobile-hero-admin-empty">Chưa có banner. Bấm “Thêm banner” để tạo khối đầu tiên.</div>}
      </div>

      <div className="mobile-hero-library">
        <div className="mobile-hero-library-head"><div><ImagePlus/><span><b>Ảnh Hero mobile đã tải</b><small>Chọn một banner phía trên rồi bấm ảnh để gán nhanh.</small></span></div></div>
        <div className="mobile-hero-library-grid">
          {assets.slice(0, 12).map((asset) => <button key={asset.id} onClick={() => {
            if (!activeSlide) return setMessage('Hãy chọn hoặc thêm một banner trước.')
            updateSlide(activeSlide.id, { image: asset.url })
            setMessage('Đã gán ảnh vào banner đang chọn. Bấm “Lưu hero mobile” để áp dụng.')
          }}><img src={asset.url} alt={asset.original_name}/><span>{asset.original_name}</span></button>)}
          {!assets.length && <div className="mobile-hero-admin-empty">Chưa có ảnh trong thư viện Hero mobile.</div>}
        </div>
      </div>
    </>}
  </section>
}

export default function MobileHeroExperience() {
  const location = useLocation()
  const publicTarget = usePortalTarget('.hero-collage', location.pathname === '/')
  const adminTarget = usePortalTarget('.cms-editor', location.pathname === '/admin/homepage')

  return <>
    {publicTarget && createPortal(<MobileHeroCarousel host={publicTarget}/>, publicTarget)}
    {adminTarget && createPortal(<MobileHeroManager/>, adminTarget)}
  </>
}
