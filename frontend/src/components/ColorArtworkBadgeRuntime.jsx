import { useEffect } from 'react'
import { API_URL } from '../services/api.js'
import './ColorArtworkBadgeRuntime.css'

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('vi')
}

export default function ColorArtworkBadgeRuntime() {
  useEffect(() => {
    let active = true
    let counts = new Map()
    let raf = 0

    const sync = () => {
      raf = 0
      if (!active) return

      document.querySelectorAll('.color-v3-card').forEach(card => {
        const name = card.querySelector('.color-v3-card-head b')?.textContent || ''
        const count = counts.get(normalize(name)) || 0
        let badge = card.querySelector('.color-v3-artwork-badge')

        if (!badge) {
          badge = document.createElement('span')
          badge.className = 'color-v3-artwork-badge'
          card.appendChild(badge)
        }

        const label = `${count} tác phẩm`
        if (badge.textContent !== label) badge.textContent = label
      })
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(sync)
    }

    fetch(`${API_URL}/artworks?limit=100`, {
      headers: { Accept: 'application/json' }
    })
      .then(response => response.ok ? response.json() : [])
      .then(rows => {
        if (!active) return
        counts = new Map()
        ;(Array.isArray(rows) ? rows : []).forEach(item => {
          const key = normalize(item?.color)
          if (!key) return
          counts.set(key, (counts.get(key) || 0) + 1)
        })
        schedule()
      })
      .catch(() => schedule())

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      active = false
      observer.disconnect()
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
