import React from 'react'
import '../styles/error-boundary-modern.css'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state={error:null}
  }

  static getDerivedStateFromError(error){
    return {error}
  }

  componentDidCatch(error,info){
    console.error('HALO HOLA frontend error',error,info)
  }

  render(){
    if(!this.state.error) return this.props.children

    return <main className="app-crash-page">
      <section className="app-crash-card" role="alert" aria-live="assertive">
        <div className="app-crash-brand">
          <div className="app-crash-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v2"/>
              <path d="M12 19v2"/>
              <path d="m4.22 4.22 1.42 1.42"/>
              <path d="m18.36 18.36 1.42 1.42"/>
              <path d="M3 12h2"/>
              <path d="M19 12h2"/>
              <path d="m4.22 19.78 1.42-1.42"/>
              <path d="m18.36 5.64 1.42-1.42"/>
              <circle cx="12" cy="12" r="4.1"/>
            </svg>
          </div>
          <div className="app-crash-brand-copy">
            <span className="app-crash-eyebrow">HALO HOLA</span>
            <strong>52 góc nhìn · 1 Hòa Lạc</strong>
          </div>
        </div>

        <h1>Có một chút gián đoạn.</h1>
        <p className="app-crash-lead">
          Trang chưa tải được nội dung như bình thường. Bạn có thể tải lại ngay hoặc quay về trang chủ để tiếp tục khám phá.
        </p>

        <div className="app-crash-status">
          <span className="app-crash-status-icon" aria-hidden="true">✓</span>
          <div>
            <strong>Dữ liệu chưa được gửi lại</strong>
            <span>Nếu bạn đang điền biểu mẫu, hệ thống chưa tự gửi lại thao tác vừa rồi.</span>
          </div>
        </div>

        <div className="app-crash-actions">
          <button type="button" onClick={()=>window.location.reload()}>
            Tải lại trang
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 11a8.1 8.1 0 1 0 2.5 5.8"/>
              <path d="M20 4v7h-7"/>
            </svg>
          </button>
          <a href="/">
            Về trang chủ
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"/>
              <path d="m13 6 6 6-6 6"/>
            </svg>
          </a>
        </div>

        <p className="app-crash-footnote">Nếu lỗi vẫn xuất hiện sau khi tải lại, hãy thử lại sau ít phút.</p>
      </section>
    </main>
  }
}
