import { useEffect } from 'react'
import { client } from '../services/api.js'

const BUTTON_ID = 'admin-reset-all-submissions'
const CONFIRM_TEXT = 'XOA TAT CA'

function removeButton() {
  document.getElementById(BUTTON_ID)?.remove()
}

export default function AdminSubmissionResetRuntime() {
  useEffect(() => {
    let busy = false

    const sync = () => {
      if (window.location.pathname !== '/admin/submissions') {
        removeButton()
        return
      }

      const toolbar = document.querySelector('.submissions-panel .admin-toolbar')
      if (!toolbar || document.getElementById(BUTTON_ID)) return

      const button = document.createElement('button')
      button.id = BUTTON_ID
      button.type = 'button'
      button.className = 'btn btn-outline btn-sm'
      button.textContent = 'Xóa toàn bộ tác phẩm'
      button.title = 'Làm trống toàn bộ danh sách tác phẩm đã gửi'
      button.style.marginLeft = 'auto'
      button.style.color = '#b42318'
      button.style.borderColor = 'rgba(180,35,24,.35)'
      button.style.background = '#fff7f5'

      button.addEventListener('click', async () => {
        if (busy) return

        const typed = window.prompt(
          `Thao tác này sẽ xóa toàn bộ tác phẩm hiện có và không thể hoàn tác.\n\nNhập ${CONFIRM_TEXT} để xác nhận:`
        )
        if (typed === null) return
        if (typed.trim().toUpperCase() !== CONFIRM_TEXT) {
          window.alert('Chưa đúng nội dung xác nhận nên chưa có dữ liệu nào bị xóa.')
          return
        }

        busy = true
        button.disabled = true
        const originalText = button.textContent
        button.textContent = 'Đang xóa...'

        try {
          const response = await client.post('/admin/submissions/reset-all', {
            confirm: 'RESET_ALL_SUBMISSIONS'
          })
          const removed = Number(response?.data?.removed || 0)
          window.alert(`Đã xóa ${removed} tác phẩm. Danh sách đã được làm trống.`)
          window.location.reload()
        } catch (error) {
          const message = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Không thể xóa toàn bộ tác phẩm.'
          window.alert(message)
          button.disabled = false
          button.textContent = originalText
          busy = false
        }
      })

      toolbar.appendChild(button)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('popstate', sync)

    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', sync)
      removeButton()
    }
  }, [])

  return null
}
