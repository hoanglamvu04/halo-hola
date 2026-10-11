import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CheckCircle2, Loader2, Link2, Send, Sparkles } from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

function clean(value) {
  return String(value ?? '').trim()
}

function readIdentity(shareCard) {
  const stack = shareCard?.closest('.success-stack')
  const code = clean(stack?.querySelector('.submit-success-code strong')?.textContent)
  const reminderStrong = stack?.querySelectorAll('.submit-success-reminder strong') || []
  const email = clean(reminderStrong[1]?.textContent)
  return { stack, code, email }
}

function storageKey(prefix, code) {
  return code ? `halo_hola_${prefix}_${code}` : ''
}

function updatePostSubmissionLabels(stack) {
  if (!stack) return

  const codeLabel = stack.querySelector('.submit-success-code small')
  const lookupAction = stack.querySelector('.success-actions a')
  const resetAction = stack.querySelector('.success-actions button')

  if (codeLabel && codeLabel.textContent !== 'Mã dự thi') codeLabel.textContent = 'Mã dự thi'
  if (lookupAction && lookupAction.textContent !== 'Tra cứu bài dự thi') lookupAction.textContent = 'Tra cứu bài dự thi'
  if (resetAction && resetAction.textContent !== 'Gửi bài dự thi khác') resetAction.textContent = 'Gửi bài dự thi khác'
}

function updateReceiptCopy(stack, completed) {
  if (!stack) return

  const wrapper = stack.parentElement
  const pageHeading = wrapper?.querySelector(':scope > h2')
  const kicker = stack.querySelector('.submit-success-kicker')
  const title = stack.querySelector('.submit-success-receipt h3')
  const description = stack.querySelector('.submit-success-receipt > p')

  updatePostSubmissionLabels(stack)

  const copy = completed
    ? {
        pageHeading: 'Bài dự thi đã hoàn tất',
        kicker: 'HOÀN TẤT · HALO HOLA 2026',
        title: 'Bài dự thi đã hoàn tất đủ 3 bước',
        description: 'Thông tin, tác phẩm và link bài Facebook đã được ghi nhận. Hãy lưu Mã dự thi bên dưới để tra cứu trạng thái sau này.'
      }
    : {
        pageHeading: 'Sắp hoàn tất bài dự thi',
        kicker: 'BƯỚC 1 ĐÃ XONG · TIẾP TỤC VỚI FACEBOOK',
        title: 'Đăng bài lên CHECK IN HOALAC để hoàn tất bài dự thi',
        description: 'Thông tin và tác phẩm của bạn đã được lưu. Chỉ còn bước đăng lên Facebook và dán lại link bài viết để hệ thống ghi nhận đầy đủ.'
      }

  if (pageHeading && pageHeading.textContent !== copy.pageHeading) pageHeading.textContent = copy.pageHeading
  if (kicker && kicker.textContent !== copy.kicker) kicker.textContent = copy.kicker
  if (title && title.textContent !== copy.title) title.textContent = copy.title
  if (description && description.textContent !== copy.description) description.textContent = copy.description
}

export default function SubmissionFacebookGate() {
  const [target, setTarget] = useState(null)
  const [identity, setIdentity] = useState({ code: '', email: '' })
  const [facebookOpened, setFacebookOpened] = useState(false)
  const [facebookPostUrl, setFacebookPostUrl] = useState('')
  const [completed, setCompleted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const sync = () => {
      const shareCard = document.querySelector('.submit-facebook-share')
      if (!shareCard) {
        setTarget(null)
        return
      }

      const { stack, code, email } = readIdentity(shareCard)
      setTarget(current => current === shareCard ? current : shareCard)
      setIdentity(current => current.code === code && current.email === email ? current : { code, email })

      const openedKey = storageKey('facebook_opened', code)
      const completedKey = storageKey('facebook_completed', code)
      const urlKey = storageKey('facebook_url', code)
      const storedUrl = urlKey ? clean(localStorage.getItem(urlKey)) : ''
      if (openedKey && localStorage.getItem(openedKey) === '1') setFacebookOpened(true)
      if (storedUrl) setFacebookPostUrl(storedUrl)
      if (completedKey && storedUrl && localStorage.getItem(completedKey) === '1') setCompleted(true)

      stack?.classList.add('facebook-required-flow')
      updatePostSubmissionLabels(stack)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })

    const onShareAction = event => {
      const button = event.target.closest?.('.submit-facebook-actions button')
      if (!button) return
      const shareCard = button.closest('.submit-facebook-share')
      const { code } = readIdentity(shareCard)
      if (code) localStorage.setItem(storageKey('facebook_opened', code), '1')
      setFacebookOpened(true)
      setError('')
    }

    document.addEventListener('click', onShareAction, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onShareAction, true)
    }
  }, [])

  useEffect(() => {
    if (!target) return
    const { stack } = readIdentity(target)
    const page = stack?.closest('.submit-page')

    stack?.classList.toggle('facebook-confirmed', completed)
    stack?.classList.toggle('facebook-opened', facebookOpened)
    page?.classList.toggle('submission-facebook-stage', !completed)
    page?.classList.toggle('submission-complete-stage', completed)
    updateReceiptCopy(stack, completed)
  }, [target, facebookOpened, completed])

  const confirmCompleted = async () => {
    if (!facebookOpened || busy || completed) return
    if (!identity.code || !identity.email) {
      setError('Không đọc được Mã dự thi hoặc email. Hãy tải lại trang và thử lại.')
      return
    }
    if (!clean(facebookPostUrl)) {
      setError('Hãy dán link bài Facebook vừa đăng để BTC gắn đúng bài với Mã dự thi và theo dõi Giải Lan tỏa.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/submissions/facebook-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: identity.code, email: identity.email, facebookPostUrl: clean(facebookPostUrl) })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error || payload?.message || 'Chưa thể xác nhận bước Facebook.')

      localStorage.setItem(storageKey('facebook_url', identity.code), payload.facebookPostUrl || clean(facebookPostUrl))
      localStorage.setItem(storageKey('facebook_completed', identity.code), '1')
      setCompleted(true)
    } catch (requestError) {
      setError(requestError.message || 'Chưa thể xác nhận bước Facebook. Vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  if (!target) return null

  const intro = <div className={`facebook-required-intro ${completed ? 'is-complete' : ''}`}>
    <div className="facebook-required-progress" aria-label="Tiến trình gửi bài dự thi">
      <div className="is-done"><span><Check size={15}/></span><b>Gửi thông tin</b><small>Đã lưu</small></div>
      <i />
      <div className={completed ? 'is-done' : 'is-active'}><span>{completed ? <Check size={15}/> : '2'}</span><b>Đăng Facebook</b><small>{completed ? 'Đã gắn link' : 'Tiếp theo'}</small></div>
      <i />
      <div className={completed ? 'is-done' : 'is-locked'}><span>{completed ? <Check size={15}/> : '3'}</span><b>Hoàn tất</b><small>{completed ? 'Đã hoàn tất' : 'Nhận mã dự thi'}</small></div>
    </div>

    {completed ? <>
      <div className="facebook-required-badge success"><CheckCircle2 size={17}/> ĐÃ HOÀN TẤT BÀI DỰ THI</div>
      <h3>Cảm ơn bạn đã hoàn tất bài dự thi HALO HOLA 2026.</h3>
      <p>Hệ thống đã ghi nhận link bài Facebook. Mã dự thi của bạn đã sẵn sàng để tra cứu.</p>
    </> : <>
      <div className="facebook-required-badge"><Sparkles size={17}/> SẮP HOÀN TẤT · BƯỚC 2 / 3</div>
      <h3>Chỉ còn một bước: đăng bài lên CHECK IN HOALAC</h3>
      <p>Nội dung đã được chuẩn bị sẵn. Bạn mở nhóm, đăng bài như bình thường rồi quay lại dán link bài viết để hoàn tất hồ sơ.</p>
      <div className="facebook-required-callout"><Send size={19}/><span><b>Sau khi đăng xong, hãy dán link bài viết.</b> Link giúp BTC đối chiếu đúng bài và ghi nhận dữ liệu cho Giải Lan tỏa.</span></div>
    </>}
  </div>

  const confirmation = <div className={`facebook-required-confirm ${completed ? 'is-complete' : ''}`}>
    {completed ? <div className="facebook-required-complete"><CheckCircle2 size={24}/><div><b>Đã ghi nhận Facebook</b><span>Bài dự thi đã chuyển sang bước hoàn tất.</span></div></div> : <>
      <div className="facebook-required-confirm-copy">
        <b>{facebookOpened ? 'Dán link bài Facebook để hoàn tất' : 'Mở nhóm CHECK IN HOALAC để đăng bài'}</b>
        <span>{facebookOpened ? 'Mở bài viết vừa đăng, chọn Sao chép liên kết rồi dán vào ô bên dưới.' : 'Nội dung đã được sao chép sẵn. Bạn chỉ cần mở nhóm, đăng bài rồi quay lại đây.'}</span>
      </div>
      {facebookOpened&&<div className="facebook-post-url-field">
        <label><Link2 size={16}/> Link bài Facebook</label>
        <input value={facebookPostUrl} onChange={event=>{setFacebookPostUrl(event.target.value);setError('')}} placeholder="Dán link bài Facebook vừa đăng..." inputMode="url" autoCapitalize="none"/>
        <small>Link được lưu cùng Mã dự thi để BTC xác minh và theo dõi Giải Lan tỏa.</small>
      </div>}
      <button type="button" className="facebook-required-finish" disabled={!facebookOpened || !clean(facebookPostUrl) || busy} onClick={confirmCompleted}>
        {busy ? <><Loader2 className="spin" size={18}/> Đang ghi nhận...</> : facebookOpened ? <><CheckCircle2 size={19}/> Hoàn tất bài dự thi</> : <><Send size={18}/> Đăng bài Facebook trước</>}
      </button>
      {error && <div className="facebook-required-error">{error}</div>}
    </>}
  </div>

  return <>
    {createPortal(intro, target)}
    {createPortal(confirmation, target)}
  </>
}
