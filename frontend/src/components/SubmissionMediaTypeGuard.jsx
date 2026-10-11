import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

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

function getSelectedType() {
  return document.querySelector('.submit-page .type-grid button.selected b')?.textContent?.trim() || 'Photo'
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
  notice.dataset.tone = tone
  notice.textContent = message
}

function clearNotice() {
  document.querySelector('.submission-media-guard-notice')?.remove()
}

function updateHint(rule) {
  const hint = document.querySelector('.submit-page .upload-box > small')
  if (!hint || !rule) return
  hint.textContent = `Định dạng phù hợp với loại hình đã chọn: ${rule.label} · tối đa theo cấu hình server.`
}

function removeCurrentFiles() {
  const removeButtons = [...document.querySelectorAll('.submit-page .file-chip > button')]
  removeButtons.forEach(button => button.click())
}

export default function SubmissionMediaTypeGuard() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    let lastType = ''
    let observer

    const sync = ({ typeChanged = false } = {}) => {
      const type = getSelectedType()
      const rule = RULES[type] || RULES.Photo
      const input = getFileInput()
      if (!input) return

      input.setAttribute('accept', rule.accept)
      input.dataset.submissionType = type
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

    const onClick = event => {
      const typeButton = event.target.closest?.('.submit-page .type-grid button')
      if (!typeButton) return
      window.setTimeout(() => sync({ typeChanged: true }), 0)
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

    const start = () => {
      sync()
      observer = new MutationObserver(() => {
        const type = getSelectedType()
        if (type !== lastType) sync({ typeChanged: Boolean(lastType) })
        else sync()
      })
      const page = document.querySelector('.submit-page')
      if (page) observer.observe(page, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('change', onFileChangeCapture, true)
    const timer = window.setTimeout(start, 0)

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('change', onFileChangeCapture, true)
      clearNotice()
    }
  }, [pathname])

  return null
}
