import { useEffect } from 'react'
import { getSiteSettings } from '../services/api.js'
import {
  CHECKIN_GROUP_SEARCH_URL,
  primeCaptionClipboard,
  resolveCheckinGroupUrl
} from '../utils/facebookShare.js'

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  return /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function clean(value) {
  return String(value ?? '').trim()
}

export default function IosSubmissionExperience() {
  useEffect(() => {
    if (!isIOSDevice()) return undefined

    let groupUrl = ''
    let active = true

    getSiteSettings()
      .then(settings => {
        if (active) groupUrl = resolveCheckinGroupUrl(settings || {})
      })
      .catch(() => {})

    const onPrimaryFacebookClick = event => {
      const button = event.target.closest?.('.submit-facebook-primary')
      if (!button) return

      const shareCard = button.closest('.submit-facebook-share')
      const stack = button.closest('.success-stack')
      const caption = clean(shareCard?.querySelector('.submit-facebook-caption pre')?.textContent)
      const code = clean(stack?.querySelector('.submit-success-code strong')?.textContent)

      // iOS Web Share opens the generic Share Sheet and does not reliably land
      // in the intended Facebook Group. Keep the prepared caption, mark this
      // step as opened, then follow the Group URL directly from the user tap.
      if (caption) primeCaptionClipboard(caption)
      if (code) localStorage.setItem(`halo_hola_facebook_opened_${code}`, '1')

      event.preventDefault()
      event.stopPropagation()

      window.location.assign(groupUrl || CHECKIN_GROUP_SEARCH_URL)
    }

    document.addEventListener('click', onPrimaryFacebookClick, true)
    return () => {
      active = false
      document.removeEventListener('click', onPrimaryFacebookClick, true)
    }
  }, [])

  return null
}
