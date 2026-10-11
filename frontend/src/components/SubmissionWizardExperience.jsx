import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import '../styles/submit-flow-v4.css'

const DRAFT_KEY = 'halo_hola_submission_draft_v2'
const STEP_KEY = 'halo_hola_submission_step_v1'
const TYPE_KEY = 'halo_hola_submission_type_v1'
const FILE_TYPE_KEY = 'halo_hola_submission_file_type_v1'
const CLEAR_FILES_KEY = 'halo_hola_submission_clear_files_v1'
const STEP_SLUGS = [
  'thong-tin',
  'tac-pham',
  'tai-tac-pham',
  'chu-de-sac-mau',
  'dia-diem-cau-chuyen',
  'quyen-su-dung',
  'xac-nhan'
]
const STEP_BY_SLUG = Object.fromEntries(STEP_SLUGS.map((slug, index) => [slug, index + 1]))

const UPLOAD_RULES = {
  Photo: {
    accept: 'image/jpeg,image/png,image/webp,image/tiff,.dng,.cr2,.nef,.arw',
    extensions: ['.jpg','.jpeg','.png','.webp','.tif','.tiff','.dng','.cr2','.nef','.arw'],
    hint: 'PHOTO · Chỉ nhận file ảnh: JPG/JPEG, PNG, WEBP, TIFF và file ảnh gốc RAW được hỗ trợ.'
  },
  Video: {
    accept: 'video/mp4,video/quicktime,.mp4,.mov',
    extensions: ['.mp4','.mov'],
    hint: 'VIDEO · Chỉ nhận file video MP4 hoặc MOV. Có thể dùng link tác phẩm nếu file quá lớn.'
  },
  'Story & Creative': {
    accept: '.pdf,.doc,.docx,.mp3,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/mpeg',
    extensions: ['.pdf','.doc','.docx','.mp3'],
    hint: 'STORY & CREATIVE · Chỉ nhận PDF, DOC/DOCX hoặc MP3.'
  },
  'Art & Design': {
    accept: 'image/jpeg,image/png,image/webp,image/tiff,.pdf,.dng,.cr2,.nef,.arw',
    extensions: ['.jpg','.jpeg','.png','.webp','.tif','.tiff','.pdf','.dng','.cr2','.nef','.arw'],
    hint: 'ART & DESIGN · Chỉ nhận file ảnh hoặc PDF.'
  }
}

function normalizeStep(value) {
  const step = Number(value)
  return Number.isInteger(step) && step >= 1 && step <= 7 ? step : 0
}

function getRenderedStep() {
  const label = document.querySelector('.submit-page .wizard-card > .eyebrow')?.textContent || ''
  const match = label.match(/Bước\s+(\d+)\s*\/\s*7/i)
  return normalizeStep(match?.[1])
}

function getStepFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const slug = String(params.get('buoc') || '').trim().toLowerCase()
  return STEP_BY_SLUG[slug] || normalizeStep(params.get('step'))
}

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || null
  } catch {
    return null
  }
}

function getSubmissionType() {
  const stored = sessionStorage.getItem(TYPE_KEY)
  if (UPLOAD_RULES[stored]) return stored

  const draftType = readDraft()?.type
  if (UPLOAD_RULES[draftType]) return draftType
  return 'Photo'
}

function getSafeRequestedStep() {
  const draft = readDraft()
  const requested = getStepFromUrl() || (draft ? normalizeStep(localStorage.getItem(STEP_KEY)) : 1) || 1

  // Browser security does not restore selected local files after a reload. If the
  // user had moved past upload without an external link, reopen the upload step
  // instead of throwing a validation error immediately after refresh.
  if (requested > 3 && draft && !String(draft.externalLink || '').trim()) return 3
  if (requested > 1 && !draft) return 1
  return requested
}

function replaceStepInUrl(step) {
  const slug = STEP_SLUGS[step - 1]
  if (!slug) return

  const url = new URL(window.location.href)
  if (url.searchParams.get('buoc') === slug && !url.searchParams.has('step')) return

  url.searchParams.set('buoc', slug)
  url.searchParams.delete('step')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

function decorateStep(step) {
  const page = document.querySelector('.submit-page')
  const card = document.querySelector('.submit-page .wizard-card')
  page?.setAttribute('data-current-step', String(step))
  card?.setAttribute('data-current-step', String(step))
}

function scrollToWizard() {
  const target = document.querySelector('.submit-page .wizard-card')
  if (!target) return

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
}

function fileExtension(name = '') {
  const cleanName = String(name).toLowerCase().split('?')[0]
  const dot = cleanName.lastIndexOf('.')
  return dot >= 0 ? cleanName.slice(dot) : ''
}

function isFileAllowed(file, type) {
  const rule = UPLOAD_RULES[type] || UPLOAD_RULES.Photo
  return rule.extensions.includes(fileExtension(file?.name))
}

function showUploadFormatError(message = '') {
  const box = document.querySelector('.submit-page .upload-box')
  if (!box) return

  let node = box.querySelector('.submission-upload-format-error')
  if (!message) {
    node?.remove()
    return
  }

  if (!node) {
    node = document.createElement('div')
    node.className = 'form-error submission-upload-format-error'
    box.appendChild(node)
  }
  node.textContent = message
}

function configureUploadStep() {
  const input = document.querySelector('.submit-page .upload-box input[type="file"]')
  if (!input) return

  const type = getSubmissionType()
  const rule = UPLOAD_RULES[type] || UPLOAD_RULES.Photo
  input.setAttribute('accept', rule.accept)
  input.setAttribute('data-artwork-type', type)

  const hint = input.closest('.upload-box')?.querySelector('small')
  if (hint) hint.textContent = rule.hint

  if (sessionStorage.getItem(CLEAR_FILES_KEY) === '1') {
    sessionStorage.removeItem(CLEAR_FILES_KEY)
    sessionStorage.removeItem(FILE_TYPE_KEY)
    input.value = ''
    const removeButtons = [...document.querySelectorAll('.submit-page .upload-thumbs .file-chip > button')]
    removeButtons.forEach(button => button.click())
    if (removeButtons.length) {
      showUploadFormatError(`Bạn vừa đổi loại hình sang ${type}. File đã chọn trước đó được bỏ để tránh gửi sai định dạng.`)
    }
  }
}

export default function SubmissionWizardExperience() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    let observer
    let retryTimer
    let settleTimer
    let lastStep = 0
    let disposed = false

    const syncFromDom = ({ scroll = true } = {}) => {
      const current = getRenderedStep()
      if (!current) return

      const previous = lastStep
      lastStep = current
      localStorage.setItem(STEP_KEY, String(current))
      replaceStepInUrl(current)
      decorateStep(current)
      configureUploadStep()

      if (scroll && previous && previous !== current) {
        window.requestAnimationFrame(scrollToWizard)
      }
    }

    const restoreRequestedStep = () => {
      if (disposed) return
      const card = document.querySelector('.submit-page .wizard-card')
      const buttons = [...document.querySelectorAll('.submit-page .stepper button')]

      if (!card || buttons.length < 7) {
        retryTimer = window.setTimeout(restoreRequestedStep, 60)
        return
      }

      const current = getRenderedStep() || 1
      const requested = getSafeRequestedStep()
      lastStep = current
      decorateStep(current)
      configureUploadStep()

      observer = new MutationObserver(() => syncFromDom())
      observer.observe(card, { childList: true, subtree: true, characterData: true })

      if (requested !== current && buttons[requested - 1]) {
        buttons[requested - 1].click()
        settleTimer = window.setTimeout(() => {
          syncFromDom({ scroll: false })
          scrollToWizard()
        }, 40)
      } else {
        replaceStepInUrl(current)
      }
    }

    const onWizardClick = event => {
      const typeButton = event.target.closest?.('.submit-page .type-grid button')
      if (typeButton) {
        const selectedType = String(typeButton.querySelector('b')?.textContent || '').trim()
        if (UPLOAD_RULES[selectedType]) {
          const previousFileType = sessionStorage.getItem(FILE_TYPE_KEY)
          if (previousFileType && previousFileType !== selectedType) {
            sessionStorage.setItem(CLEAR_FILES_KEY, '1')
          }
          sessionStorage.setItem(TYPE_KEY, selectedType)
        }
      }

      if (!event.target.closest?.('.submit-page .wizard-actions button, .submit-page .stepper button')) return
      window.setTimeout(() => syncFromDom(), 0)
    }

    const onFileChange = event => {
      const input = event.target.closest?.('.submit-page .upload-box input[type="file"]')
      if (!input) return

      const type = getSubmissionType()
      const files = [...(input.files || [])]
      const invalid = files.filter(file => !isFileAllowed(file, type))

      if (invalid.length) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation?.()
        input.value = ''
        showUploadFormatError(`Loại hình ${type} không nhận: ${invalid.map(file => file.name).join(', ')}. Hãy chọn đúng định dạng được hướng dẫn.`)
        return
      }

      showUploadFormatError('')
      if (files.length) sessionStorage.setItem(FILE_TYPE_KEY, type)
    }

    document.addEventListener('click', onWizardClick, true)
    document.addEventListener('change', onFileChange, true)
    restoreRequestedStep()

    return () => {
      disposed = true
      observer?.disconnect()
      window.clearTimeout(retryTimer)
      window.clearTimeout(settleTimer)
      document.removeEventListener('click', onWizardClick, true)
      document.removeEventListener('change', onFileChange, true)
    }
  }, [pathname])

  return null
}
