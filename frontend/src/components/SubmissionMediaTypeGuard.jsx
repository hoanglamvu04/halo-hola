import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DRAFT_KEY = 'halo_hola_submission_draft_v2'
const TYPE_KEY = 'halo_hola_submission_type_v1'

const RULES = {
  Photo: {
    accept: 'image/jpeg,image/png,image/webp',
    label: 'JPG, PNG, WEBP',
    test: file => /^image\/(jpeg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name)
  },
  Video: {
    accept: 'video/mp4,video/quicktime,video/webm',
    label: 'MP4, MOV, WEBM',
    test: file => /^video\/(mp4|quicktime|webm)$/i.test(file.type) || /\.(mp4|mov|webm)$/i.test(file.name)
  },
  'Story & Creative': {
    accept: '.pdf,.doc,.docx,.mp3,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/mpeg',
    label: 'PDF, DOC, DOCX, MP3',
    test: file => /\.(pdf|docx?|mp3)$/i.test(file.name) || /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|audio\/mpeg)$/i.test(file.type)
  },
  'Art & Design': {
    accept: 'image/jpeg,image/png,image/webp,.pdf,application/pdf',
    label: 'JPG, PNG, WEBP, PDF',
    test: file => /^image\/(jpeg|png|webp)$/i.test(file.type) || file.type === 'application/pdf' || /\.(jpe?g|png|webp|pdf)$/i.test(file.name)
  }
}

function readDraftType() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')?.type || ''
  } catch {
    return ''
  }
}

function getSelectedType() {
  const fromDom = document.querySelector('.submit-page .type-grid button.selected b')?.textContent?.trim()
  if (RULES[fromDom]) {
    sessionStorage.setItem(TYPE_KEY, fromDom)
    return fromDom
  }

  const stored = sessionStorage.getItem(TYPE_KEY)
  if (RULES[stored]) return stored

  const draftType = readDraftType()
  if (RULES[draftType]) return draftType

  return 'Photo'
}

function getFileInput() {
  return document.querySelector('.submit-page .upload-box input[type="file"]')
}

function showNotice(message, tone = 'info') {
  const upload = document.querySelector('.submit-page .upload-box')
  if (!upload) return

  let notice = document.querySelector('.submission-media-guard-notice')
  if (!notice) {
    notice = document.createElement('div')
    notice.className = 'submission-media-guard-notice'
    upload.insertAdjacentElement('afterend', notice)
  }

  if (notice.dataset.tone !== tone) notice.dataset.tone = tone
  if (notice.textContent !== message) notice.textContent = message
}

function clearNotice() {
  document.querySelector('.submission-media-guard-notice')?.remove()
}

function updateHint(rule) {
  const hint = document.querySelector('.submit-page .upload-box > small')
  if (!hint || !rule) return

  const nextText = `Định dạng phù hợp với loại hình đã chọn: ${rule.label} · tối đa theo cấu hình server.`
  if (hint.textContent !== nextText) hint.textContent = nextText
}

function removeCurrentFiles() {
  const removeButtons = [...document.querySelectorAll('.submit-page .file-chip > button')]
  removeButtons.forEach(button => button.click())
}

export default function SubmissionMediaTypeGuard() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    let lastType = getSelectedType()
    let syncTimer = 0

    const sync = ({ typeChanged = false } = {}) => {
      const type = getSelectedType()
      const rule = RULES[type] || RULES.Photo
      const input = getFileInput()

      if (!input) {
        lastType = type
        return
      }

      if (input.getAttribute('accept') !== rule.accept) input.setAttribute('accept', rule.accept)
      if (input.dataset.submissionType !== type) input.dataset.submissionType = type
      updateHint(rule)

      if (typeChanged && lastType && type !== lastType) {
        const hasFiles = document.querySelectorAll('.submit-page .file-chip').length > 0
        if (hasFiles) {
          removeCurrentFiles()
          input.value = ''
          showNotice(`Bạn vừa đổi loại hình sang “${type}”. File đã chọn trước đó được bỏ để tránh sai định dạng. Hãy chọn lại file ${rule.label}.`, 'info')
        } else {
          showNotice(`Đã chuyển sang “${type}”. Bước tải file sẽ chỉ nhận ${rule.label}.`, 'info')
        }
      }

      lastType = type
    }

    const scheduleSync = options => {
      window.clearTimeout(syncTimer)
      syncTimer = window.setTimeout(() => sync(options), 0)
    }

    const onClick = event => {
      const typeButton = event.target.closest?.('.submit-page .type-grid button')
      if (typeButton) {
        const selectedType = String(typeButton.querySelector('b')?.textContent || '').trim()
        if (RULES[selectedType]) sessionStorage.setItem(TYPE_KEY, selectedType)
        scheduleSync({ typeChanged: true })
        return
      }

      if (event.target.closest?.('.submit-page .wizard-actions button, .submit-page .stepper button')) {
        scheduleSync()
      }
    }

    const onFileChangeCapture = event => {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || input.type !== 'file' || !input.closest('.submit-page .upload-box')) return

      const type = getSelectedType()
      const rule = RULES[type] || RULES.Photo
      const files = [...(input.files || [])]
      if (!files.length) return

      const invalid = files.filter(file => !rule.test(file))
      if (!invalid.length) {
        clearNotice()
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      input.value = ''
      const names = invalid.slice(0, 2).map(file => file.name).join(', ')
      showNotice(`File không phù hợp với loại hình “${type}”${names ? `: ${names}` : ''}. Chỉ chọn ${rule.label}.`, 'error')
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('change', onFileChangeCapture, true)
    scheduleSync()

    return () => {
      window.clearTimeout(syncTimer)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('change', onFileChangeCapture, true)
      clearNotice()
    }
  }, [pathname])

  return null
}
