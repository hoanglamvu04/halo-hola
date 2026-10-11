import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import '../styles/submit-flow-v4.css'

const DRAFT_KEY = 'halo_hola_submission_draft_v2'
const STEP_KEY = 'halo_hola_submission_step_v1'
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
      if (!event.target.closest?.('.submit-page .wizard-actions button, .submit-page .stepper button')) return
      window.setTimeout(() => syncFromDom(), 0)
    }

    document.addEventListener('click', onWizardClick, true)
    restoreRequestedStep()

    return () => {
      disposed = true
      observer?.disconnect()
      window.clearTimeout(retryTimer)
      window.clearTimeout(settleTimer)
      document.removeEventListener('click', onWizardClick, true)
    }
  }, [pathname])

  return null
}
