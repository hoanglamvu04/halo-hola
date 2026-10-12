import { useEffect } from 'react'

function imageSource(node) {
  return node?.currentSrc || node?.getAttribute?.('src') || ''
}

export default function ColorStoryDesktopExperience() {
  useEffect(() => {
    let raf = 0

    const sync = () => {
      raf = 0
      const story = document.querySelector('.color-v3-story')
      if (!story) return

      story.classList.add('color-v3-story-four-images')

      const cardImages = Array.from(document.querySelectorAll('.color-v3-card > img'))
      const fallbackImages = Array.from(story.querySelectorAll('.color-v3-window img'))
      const sources = [
        imageSource(cardImages[2]) || imageSource(fallbackImages[0]),
        imageSource(cardImages[3]) || imageSource(fallbackImages[1]) || imageSource(fallbackImages[0])
      ]

      ;['c', 'd'].forEach((suffix, index) => {
        let frame = story.querySelector(`.color-v3-window-${suffix}`)
        if (!frame) {
          frame = document.createElement('div')
          frame.className = `color-v3-window color-v3-window-${suffix} color-v3-runtime-extra`
          const image = document.createElement('img')
          image.alt = 'Sắc màu Hòa Lạc'
          image.loading = 'lazy'
          image.decoding = 'async'
          frame.appendChild(image)
          story.appendChild(frame)
        }

        const image = frame.querySelector('img')
        const nextSrc = sources[index]
        if (image && nextSrc && image.getAttribute('src') !== nextSrc) image.src = nextSrc
      })
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(sync)
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })
    window.addEventListener('resize', schedule)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return null
}
