import { useEffect } from 'react'

const DRAFT_KEY = 'halo_hola_submission_draft_v2'
const LAST_STEP_KEY = 'halo_hola_submission_last_step_v1'

const STEP_SLUGS = [
  'thong-tin-tac-gia',
  'tac-pham',
  'tai-tac-pham',
  'chu-de-sac-mau',
  'dia-diem-cau-chuyen',
  'quyen-dong-thuan',
  'kiem-tra'
]

const clean = value => String(value ?? '').trim()
const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))
const isValidUrl = value => {
  if (!clean(value)) return true
  try { new URL(clean(value)); return true } catch { return false }
}
const hasCoordinate = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value))

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || {} } catch { return {} }
}

function parseStep(value) {
  const raw = clean(value).toLowerCase()
  const numeric = Number(raw)
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 7) return numeric
  const index = STEP_SLUGS.indexOf(raw)
  return index >= 0 ? index + 1 : null
}

function getSafeReloadStep(requested) {
  const draft = readDraft()
  let safe = 1

  if (clean(draft.name).length >= 2 && isValidEmail(draft.email)) safe = 2
  else return Math.min(requested, safe)

  if (clean(draft.title).length >= 2 && isValidUrl(draft.externalLink)) safe = 3
  else return Math.min(requested, safe)

  // Browser security never restores a selected File object after refresh.
  // A public/external link is the only step-3 value that can safely survive reload.
  if (clean(draft.externalLink)) safe = 4
  else return Math.min(requested, safe)

  if (clean(draft.theme)) safe = 5
  else return Math.min(requested, safe)

  const locationReady = clean(draft.location).length >= 2
    && hasCoordinate(draft.locationLat) === hasCoordinate(draft.locationLng)
    && clean(draft.story).length >= 20
  if (locationReady) safe = 6
  else return Math.min(requested, safe)

  const rightsReady = Boolean(draft.rightsConfirmed)
    && (!draft.isMinor || (clean(draft.guardianName).length >= 2 && draft.guardianConsent))
  if (rightsReady) safe = 7

  return Math.min(requested, safe)
}

function updateUrl(step, mode = 'replace') {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('step', STEP_SLUGS[step - 1])
  const next = `${url.pathname}${url.search}${url.hash}`
  if (mode === 'push') window.history.pushState({ haloHolaStep: step }, '', next)
  else window.history.replaceState({ ...window.history.state, haloHolaStep: step }, '', next)
  localStorage.setItem(LAST_STEP_KEY, String(step))
}

function scrollWizardIntoView(behavior = 'smooth') {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const card = document.querySelector('.submit-page .wizard-card')
      if (!card) return
      const mobile = window.matchMedia('(max-width: 900px)').matches
      const offset = mobile ? 118 : 112
      const top = Math.max(0, card.getBoundingClientRect().top + window.scrollY - offset)
      window.scrollTo({ top, behavior })
    })
  })
}

function getActiveStep() {
  const buttons = [...document.querySelectorAll('.submit-page .stepper > button')]
  const index = buttons.findIndex(button => button.classList.contains('active'))
  return index >= 0 ? index + 1 : null
}

function clickStep(step) {
  const button = document.querySelector(`.submit-page .stepper > button:nth-child(${step})`)
  button?.click()
}

export default function SubmissionWizardExperience() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/gui-goc-nhin')) return undefined

    let lastActive = null
    let bootstrapped = false
    let restoreTimer = null

    const bootstrap = () => {
      const buttons = document.querySelectorAll('.submit-page .stepper > button')
      if (!buttons.length || bootstrapped) return false

      const params = new URLSearchParams(window.location.search)
      const urlStep = parseStep(params.get('step'))
      const savedStep = parseStep(localStorage.getItem(LAST_STEP_KEY))
      const requested = urlStep || savedStep || 1
      const target = getSafeReloadStep(requested)

      bootstrapped = true
      lastActive = getActiveStep() || 1

      if (target !== lastActive) {
        clickStep(target)
        window.setTimeout(() => {
          const actual = getActiveStep() || target
          lastActive = actual
          updateUrl(actual)
          scrollWizardIntoView('auto')
        }, 80)
      } else {
        updateUrl(target)
        if (urlStep && target > 1) scrollWizardIntoView('auto')
      }
      return true
    }

    const syncActiveStep = () => {
      if (!bootstrapped) {
        bootstrap()
        return
      }
      const active = getActiveStep()
      if (!active || active === lastActive) return
      lastActive = active
      updateUrl(active, 'push')
      scrollWizardIntoView()
    }

    const observer = new MutationObserver(syncActiveStep)
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class']
    })

    if (!bootstrap()) restoreTimer = window.setInterval(() => bootstrap() && window.clearInterval(restoreTimer), 80)

    const onPopState = () => {
      const requested = parseStep(new URLSearchParams(window.location.search).get('step')) || 1
      const target = getSafeReloadStep(requested)
      if (target !== getActiveStep()) clickStep(target)
      lastActive = target
      updateUrl(target)
      scrollWizardIntoView('auto')
    }
    window.addEventListener('popstate', onPopState)

    return () => {
      observer.disconnect()
      if (restoreTimer) window.clearInterval(restoreTimer)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  return null
}
