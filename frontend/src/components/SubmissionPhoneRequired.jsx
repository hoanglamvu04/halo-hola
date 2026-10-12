import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function getRenderedStep() {
  const label = document.querySelector('.submit-page .wizard-card > .eyebrow')?.textContent || ''
  const match = label.match(/Bước\s+(\d+)\s*\/\s*7/i)
  const step = Number(match?.[1])
  return Number.isInteger(step) ? step : 0
}

function getPhoneField() {
  const labels = [...document.querySelectorAll('.submit-page .form-grid label')]
  const label = labels.find(node => /^Số điện thoại/i.test((node.textContent || '').trim()))
  return { label, input: label?.querySelector('input') || null }
}

function decoratePhoneField() {
  if (getRenderedStep() !== 1) return
  const { label, input } = getPhoneField()
  if (!label || !input) return

  const textNode = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE)
  if (textNode && !String(textNode.nodeValue || '').includes('*')) {
    textNode.nodeValue = 'Số điện thoại *'
  }

  input.type = 'tel'
  input.inputMode = 'tel'
  input.autocomplete = 'tel'
  input.required = true
  input.setAttribute('aria-required', 'true')
}

export default function SubmissionPhoneRequired() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    let frame = 0
    const sync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        decoratePhoneField()
      })
    }

    const onClick = event => {
      if (getRenderedStep() !== 1) return

      const actionButton = event.target.closest?.('.submit-page .wizard-actions button')
      const stepButton = event.target.closest?.('.submit-page .stepper button')
      const stepButtons = stepButton ? [...document.querySelectorAll('.submit-page .stepper button')] : []
      const targetStep = stepButton ? stepButtons.indexOf(stepButton) + 1 : 0
      const attemptsToContinue = (actionButton && /tiếp tục/i.test(actionButton.textContent || '')) || targetStep > 1
      if (!attemptsToContinue) return

      decoratePhoneField()
      const { input } = getPhoneField()
      if (!input || String(input.value || '').trim()) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      input.setCustomValidity('Vui lòng nhập số điện thoại để BTC có thể liên hệ khi cần.')
      input.reportValidity()
      input.focus({ preventScroll: false })
    }

    const onInput = event => {
      const { input } = getPhoneField()
      if (input && event.target === input) input.setCustomValidity('')
    }

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    document.addEventListener('click', onClick, true)
    document.addEventListener('input', onInput, true)
    sync()

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('input', onInput, true)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return null
}
