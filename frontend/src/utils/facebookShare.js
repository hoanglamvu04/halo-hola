const clean = value => String(value ?? '').trim()

export const CHECKIN_GROUP_SEARCH_URL = 'https://www.facebook.com/search/groups/?q=CHECK%20IN%20HOALAC'

export function buildSubmissionFacebookCaption({ form = {}, code = '' } = {}) {
  const author = clean(form.display) || clean(form.name) || 'Tác giả HALO HOLA'
  const title = clean(form.title) || 'Góc nhìn Hòa Lạc'
  const theme = clean(form.theme)
  const type = clean(form.type)
  const location = clean(form.locationAddress) || clean(form.location)
  const story = clean(form.story)

  return [
    title.toUpperCase(),
    '',
    `📸 Tác giả: ${author}`,
    theme ? `🎨 Chủ đề: ${theme}` : '',
    type ? `🖼 Loại hình: ${type}` : '',
    location ? `📍 Địa điểm: ${location}` : '',
    '',
    story,
    '',
    'Tôi vừa gửi góc nhìn của mình tới HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc.',
    code ? `Mã tác phẩm: ${code}` : '',
    '',
    '#HaloHola #52GocNhin1HoaLac #HelloHoaLac'
  ].filter((line, index, rows) => line || (index > 0 && rows[index - 1])).join('\n').trim()
}

export function resolveCheckinGroupUrl(siteSettings = {}) {
  const explicit = clean(siteSettings?.footer?.checkinGroupUrl) || clean(import.meta.env.VITE_CHECKIN_HOALAC_GROUP_URL)
  if (explicit) return explicit

  const footerFacebook = clean(siteSettings?.footer?.facebook)
  if (/facebook\.com\/groups\//i.test(footerFacebook)) return footerFacebook

  return ''
}

export function copyTextSynchronously(text) {
  if (!text || typeof document === 'undefined' || !document.body) return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }

  textarea.remove()
  return copied
}

export function primeCaptionClipboard(text) {
  const copied = copyTextSynchronously(text)
  if (!copied && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return copied
}

export async function shareSubmission({ caption, url, files = [] } = {}) {
  primeCaptionClipboard(caption)

  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return { openedShareSheet: false, filesIncluded: false }
  }

  const mediaFiles = files.filter(file => /^image\//i.test(file?.type || '') || /^video\//i.test(file?.type || ''))
  const canShareFiles = mediaFiles.length > 0 && typeof navigator.canShare === 'function' && navigator.canShare({ files: mediaFiles })
  const payload = {
    title: 'HALO HOLA 2026',
    text: caption,
    ...(url ? { url } : {}),
    ...(canShareFiles ? { files: mediaFiles } : {})
  }

  await navigator.share(payload)
  return { openedShareSheet: true, filesIncluded: canShareFiles }
}
