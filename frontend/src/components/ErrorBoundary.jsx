import React from 'react'

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
      <section className="app-crash-card">
        <span>HALO HOLA</span>
        <h1>Trang vừa gặp sự cố.</h1>
        <p>Dữ liệu của bạn chưa bị gửi lại. Hãy tải lại trang; nếu lỗi còn xuất hiện, vui lòng thử lại sau.</p>
        <div>
          <button onClick={()=>window.location.reload()}>Tải lại trang</button>
          <a href="/">Về trang chủ</a>
        </div>
      </section>
    </main>
  }
}
