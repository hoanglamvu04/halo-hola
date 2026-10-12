import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function isValidEmail(value) {
  const email = String(value || '').trim()
  if (!email || email.length > 254 || /\s/.test(email)) return false

  const parts = email.split('@')
  if (parts.length !== 2) return false

  const [local, domain] = parts
  if (!local || local.length > 64 || !domain || !domain.includes('.')) return false
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false

  const labels = domain.split('.')
  if (labels.some(label => !label || label.length > 63 || label.startsWith('-') || label.endsWith('-') || !/^[A-Za-z0-9-]+$/.test(label))) {
    return false
  }

  return labels.at(-1)?.length >= 2
}

function getEmailInput() {
  return document.querySelector('.submit-page .wizard-card input[type="email"]')
}

function getRenderedStep() {
  const text = document.querySelector('.submit-page .wizard-card > .eyebrow')?.textContent || ''
  const match = text.match(/Bước\s+(\d+)\s*\/\s*7/i)
  return Number(match?.[1] || 0)
}

function ensureStatus(input) {
  const label = input?.closest('label')
  if (!label) return null

  label.classList.add('submission-email-field')
  let status = label.querySelector('.submission-email-status')
  if (!status) {
    status = document.createElement('span')
    status.className = 'submission-email-status'
    status.setAttribute('aria-live', 'polite')
    input.insertAdjacentElement('afterend', status)
  }
  return status
}

function paintEmailState(input, { force = false } = {}) {
  if (!input) return false
  const status = ensureStatus(input)
  if (!status) return false

  const value = String(input.value || '').trim()
  const valid = isValidEmail(value)
  const shouldShow = force || value.length > 0

  input.classList.toggle('is-email-valid', shouldShow && valid)
  input.classList.toggle('is-email-invalid', shouldShow && !valid)
  input.setAttribute('aria-invalid', shouldShow && !valid ? 'true' : 'false')

  if (!shouldShow) {
    status.textContent = ''
    status.className = 'submission-email-status'
    return false
  }

  if (valid) {
    status.textContent = '✓ Email hợp lệ'
    status.className = 'submission-email-status is-valid'
    return true
  }

  status.textContent = value
    ? 'Email chưa hợp lệ. Kiểm tra lại tên hộp thư và tên miền.'
    : 'Vui lòng nhập email để tiếp tục.'
  status.className = 'submission-email-status is-invalid'
  return false
}

export default function SubmissionEmailValidation() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    let observer
    let frame = 0

    const sync = () => {
      frame = 0
      const input = getEmailInput()
      if (input) paintEmailState(input)
    }

    const queueSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(sync)
    }

    const onInput = event => {
      const input = event.target.closest?.('.submit-page .wizard-card input[type="email"]')
      if (!input) return
      paintEmailState(input)
    }

    const onBlur = event => {
      const input = event.target.closest?.('.submit-page .wizard-card input[type="email"]')
      if (!input) return
      paintEmailState(input, { force: true })
    }

    const onClick = event => {
      if (getRenderedStep() !== 1) return

      const action = event.target.closest?.('.submit-page .wizard-actions button, .submit-page .stepper button')
      if (!action) return

      const input = getEmailInput()
      if (!input) return

      const stepButtons = [...document.querySelectorAll('.submit-page .stepper button')]
      const targetStep = stepButtons.includes(action) ? stepButtons.indexOf(action) + 1 : 2
      const movingForward = action.closest('.wizard-actions') || targetStep > 1
      if (!movingForward) return

      if (!paintEmailState(input, { force: true })) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation?.()
        input.focus({ preventScroll: true })
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    document.addEventListener('input', onInput, true)
    document.addEventListener('blur', onBlur, true)
    document.addEventListener('click', onClick, true)

    observer = new MutationObserver(queueSync)
    observer.observe(document.body, { childList: true, subtree: true })
    queueSync()

    return () => {
      observer?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('blur', onBlur, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [pathname])

  return null
}
