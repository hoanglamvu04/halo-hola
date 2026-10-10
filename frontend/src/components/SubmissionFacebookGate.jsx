import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CheckCircle2, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'

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

function updateReceiptCopy(stack, completed) {
  if (!stack) return

  const wrapper = stack.parentElement
  const pageHeading = wrapper?.querySelector(':scope > h2')
  const kicker = stack.querySelector('.submit-success-kicker')
  const title = stack.querySelector('.submit-success-receipt h3')
  const description = stack.querySelector('.submit-success-receipt > p')

  const copy = completed
    ? {
        pageHeading: 'Bài dự thi đã hoàn tất',
        kicker: 'HOÀN TẤT · HALO HOLA 2026',
        title: 'Tác phẩm của bạn đã hoàn tất đủ các bước dự thi',
        description: 'HALO HOLA đã ghi nhận phần nộp trên hệ thống và xác nhận bạn đã thực hiện bước đăng Facebook.'
      }
    : {
        pageHeading: 'Bước cuối · Đăng Facebook',
        kicker: 'BƯỚC 1 ĐÃ XONG · CÒN 1 BƯỚC BẮT BUỘC',
        title: 'Tác phẩm đã được lưu an toàn — chưa hoàn tất bài dự thi',
        description: 'Mã tác phẩm và file gốc đã được lưu. Hãy hoàn thành bước đăng lên CHECK IN HOALAC bên dưới để kết thúc quy trình dự thi.'
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
      if (openedKey && localStorage.getItem(openedKey) === '1') setFacebookOpened(true)
      if (completedKey && localStorage.getItem(completedKey) === '1') setCompleted(true)

      stack?.classList.add('facebook-required-flow')
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
    stack?.classList.toggle('facebook-confirmed', completed)
    stack?.classList.toggle('facebook-opened', facebookOpened)
    updateReceiptCopy(stack, completed)
  }, [target, facebookOpened, completed])

  const confirmCompleted = async () => {
    if (!facebookOpened || busy || completed) return
    if (!identity.code || !identity.email) {
      setError('Không đọc được mã tác phẩm hoặc email. Hãy tải lại trang tra cứu và thử lại.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/submissions/facebook-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: identity.code, email: identity.email })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error || payload?.message || 'Chưa thể xác nhận bước Facebook.')

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
    <div className="facebook-required-progress" aria-label="Tiến trình hoàn tất bài dự thi">
      <div className="is-done"><span><Check size={15}/></span><b>Gửi tác phẩm</b><small>Đã lưu</small></div>
      <i />
      <div className={completed ? 'is-done' : 'is-active'}><span>{completed ? <Check size={15}/> : '2'}</span><b>Đăng Facebook</b><small>{completed ? 'Đã xác nhận' : 'Bắt buộc'}</small></div>
      <i />
      <div className={completed ? 'is-done' : 'is-locked'}><span>{completed ? <Check size={15}/> : '3'}</span><b>Hoàn tất</b><small>{completed ? 'Hợp lệ' : 'Chờ bước 2'}</small></div>
    </div>

    {completed ? <>
      <div className="facebook-required-badge success"><CheckCircle2 size={17}/> ĐÃ HOÀN TẤT BÀI DỰ THI</div>
      <h3>Cảm ơn bạn đã cùng lan tỏa một góc nhìn về Hòa Lạc.</h3>
      <p>Hệ thống đã ghi nhận bước Facebook. Bạn có thể tra cứu mã tác phẩm hoặc gửi thêm một góc nhìn khác.</p>
    </> : <>
      <div className="facebook-required-badge"><LockKeyhole size={17}/> BƯỚC CUỐI CÙNG · BẮT BUỘC</div>
      <h3>Đăng tác phẩm lên CHECK IN HOALAC để hoàn tất bài dự thi</h3>
      <p>Chỉ còn một bước. Nội dung đã được chuẩn bị sẵn; bạn mở Facebook, kiểm tra bài rồi bấm Đăng. Không cần quay lại copy link bài viết.</p>
      <div className="facebook-required-callout"><ShieldCheck size={20}/><span><b>Tác phẩm hiện đã được lưu nhưng chưa được đánh dấu hoàn tất.</b> Bước Facebook giúp bài dự thi xuất hiện trong cộng đồng và tạo tương tác cho chương trình.</span></div>
    </>}
  </div>

  const confirmation = <div className={`facebook-required-confirm ${completed ? 'is-complete' : ''}`}>
    {completed ? <div className="facebook-required-complete"><CheckCircle2 size={24}/><div><b>Hoàn tất rồi</b><span>Trạng thái Facebook đã được lưu vào hệ thống HALO HOLA.</span></div></div> : <>
      <div className="facebook-required-confirm-copy">
        <b>{facebookOpened ? 'Đã đăng xong trên Facebook?' : 'Bước tiếp theo'}</b>
        <span>{facebookOpened ? 'Quay lại đây và bấm nút dưới để hệ thống ghi nhận bài dự thi đã hoàn tất.' : 'Hãy dùng nút “Đăng bài lên Facebook” hoặc “Mở CHECK IN HOALAC” ở phía trên trước.'}</span>
      </div>
      <button type="button" className="facebook-required-finish" disabled={!facebookOpened || busy} onClick={confirmCompleted}>
        {busy ? <><Loader2 className="spin" size={18}/> Đang xác nhận...</> : facebookOpened ? <><CheckCircle2 size={19}/> Tôi đã đăng · Hoàn tất bài dự thi</> : <><LockKeyhole size={18}/> Hãy mở Facebook trước</>}
      </button>
      {error && <div className="facebook-required-error">{error}</div>}
    </>}
  </div>

  return <>
    {createPortal(intro, target)}
    {createPortal(confirmation, target)}
  </>
}
