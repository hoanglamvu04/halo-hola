import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function localToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCaptureDateInput() {
  return document.querySelector('.submit-page input[type="date"]')
}

function showDateError(input, message = '') {
  const label = input?.closest('label')
  if (!label) return

  let node = label.querySelector('.submission-capture-date-error')
  if (!message) {
    node?.remove()
    return
  }

  if (!node) {
    node = document.createElement('div')
    node.className = 'form-error submission-capture-date-error'
    label.appendChild(node)
  }
  node.textContent = message
}

function configureDateInput() {
  const input = getCaptureDateInput()
  if (!input) return

  const today = localToday()
  if (input.max !== today) input.max = today

  if (input.value && input.value > today) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(input, '')
    else input.value = ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
    showDateError(input, 'Không thể chọn ngày chụp / thực hiện trong tương lai.')
  }
}

export default function SubmissionCaptureDateGuard() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/gui-goc-nhin') return undefined

    const onDateInteraction = event => {
      const input = event.target.closest?.('.submit-page input[type="date"]')
      if (!input) return

      const today = localToday()
      if (input.max !== today) input.max = today

      if (!input.value || input.value <= today) {
        showDateError(input, '')
        return
      }

      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      if (setter) setter.call(input, '')
      else input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
      showDateError(input, 'Không thể chọn ngày chụp / thực hiện trong tương lai.')
    }

    const observer = new MutationObserver(() => configureDateInput())
    observer.observe(document.body, { childList: true, subtree: true })

    document.addEventListener('focusin', onDateInteraction, true)
    document.addEventListener('input', onDateInteraction, true)
    document.addEventListener('change', onDateInteraction, true)
    configureDateInput()

    return () => {
      observer.disconnect()
      document.removeEventListener('focusin', onDateInteraction, true)
      document.removeEventListener('input', onDateInteraction, true)
      document.removeEventListener('change', onDateInteraction, true)
    }
  }, [pathname])

  return null
}
