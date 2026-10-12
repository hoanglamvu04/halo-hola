import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DRAFT_KEY = 'halo_hola_submission_draft_v2'
const RECEIPT_PREFIX = 'halo_hola_submission_receipt_v1_'

const REVIEW_KEYS = {
  'Tác phẩm': 'artwork',
  'Họ tên tác giả': 'author',
  'Email': 'email',
  'Số điện thoại': 'phone',
  'Chủ đề': 'theme',
  'Sắc màu': 'color',
  'File / link': 'media',
  'Địa điểm': 'location',
  'HOLA Map': 'map',
  'Tọa độ': 'coords',
  'Câu chuyện': 'story',
  'Quyền tác giả': 'rights'
}

function clean(value) {
  return String(value ?? '').trim()
}

function readForm() {
  try {
    const params = new URLSearchParams(window.location.search)
    const code = clean(params.get('code')).toUpperCase()
    if (code) {
      const receipt = JSON.parse(localStorage.getItem(`${RECEIPT_PREFIX}${code}`) || 'null')
      if (receipt?.form) return receipt.form
    }
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || {}
  } catch {
    return {}
  }
}

function decorateItem(item) {
  if (!(item instanceof HTMLElement)) return ''
  const label = clean(item.querySelector(':scope > small')?.textContent)
  const key = REVIEW_KEYS[label] || ''
  if (key) item.dataset.reviewKey = key
  return key
}

function insertPhoneItem(grid, itemsByKey) {
  if (itemsByKey.phone) return
  const phone = clean(readForm()?.phone)
  if (!phone) return

  const item = document.createElement('div')
  item.dataset.reviewKey = 'phone'
  item.innerHTML = '<small>Số điện thoại</small><b></b>'
  item.querySelector('b').textContent = phone

  const emailItem = itemsByKey.email
  if (emailItem?.nextSibling) grid.insertBefore(item, emailItem.nextSibling)
  else grid.appendChild(item)
  itemsByKey.phone = item
}

function ensureCompletion(grid) {
  const host = grid.parentElement
  if (!host || host.querySelector(':scope > .submission-review-complete')) return

  const node = document.createElement('div')
  node.className = 'submission-review-complete'
  node.innerHTML = '<span class="submission-review-complete-icon">✓</span><div><b>7/7 bước đã hoàn tất</b><small>Rà soát nhanh thông tin bên dưới trước khi gửi chính thức.</small></div>'
  host.insertBefore(node, grid)
}

function ensureSubmitNote(grid) {
  const host = grid.parentElement
  if (!host || host.querySelector(':scope > .submission-review-submit-note')) return

  const node = document.createElement('div')
  node.className = 'submission-review-submit-note'
  node.innerHTML = '<b>Sẵn sàng gửi tác phẩm?</b><span>Bạn vẫn có thể quay lại chỉnh sửa trước khi gửi chính thức.</span>'
  host.appendChild(node)
}

function polishReview() {
  const grid = document.querySelector('.submit-page .review-grid')
  if (!grid) return

  grid.classList.add('review-grid-v2')
  const itemsByKey = {}
  ;[...grid.children].forEach(item => {
    const key = decorateItem(item)
    if (key) itemsByKey[key] = item
  })

  insertPhoneItem(grid, itemsByKey)

  const coordsValue = clean(itemsByKey.coords?.querySelector('b')?.textContent)
  if (itemsByKey.location) {
    if (coordsValue && coordsValue !== 'Chưa có') itemsByKey.location.dataset.coords = `Tọa độ · ${coordsValue}`
    else delete itemsByKey.location.dataset.coords
  }

  if (itemsByKey.map) {
    const valueNode = itemsByKey.map.querySelector('b')
    const value = clean(valueNode?.textContent)
    if (valueNode && /ghim tọa độ/i.test(value)) valueNode.textContent = 'Đã ghim trên HOLA Map'
  }

  if (itemsByKey.rights) {
    const valueNode = itemsByKey.rights.querySelector('b')
    if (valueNode && /đã xác nhận/i.test(clean(valueNode.textContent))) {
      valueNode.textContent = 'Đã xác nhận quyền tác giả'
    }
  }

  ensureCompletion(grid)
  ensureSubmitNote(grid)

  const card = grid.closest('.wizard-card')
  const actions = card?.querySelector('.wizard-actions')
  const buttons = actions ? [...actions.querySelectorAll('button')] : []
  const backButton = buttons[0]
  const submitButton = buttons[1]

  if (backButton) {
    const textNode = [...backButton.childNodes].find(node => node.nodeType === Node.TEXT_NODE)
    if (textNode && clean(textNode.textContent) !== 'Quay lại chỉnh sửa') textNode.textContent = ' Quay lại chỉnh sửa'
  }
  if (submitButton && /đang lưu original/i.test(clean(submitButton.textContent))) {
    const textNode = [...submitButton.childNodes].find(node => node.nodeType === Node.TEXT_NODE)
    if (textNode) textNode.textContent = ' Đang gửi tác phẩm...'
  }
}

export default function SubmissionReviewRuntime() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    let frame = 0
    const sync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        polishReview()
      })
    }

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    sync()

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return null
}
