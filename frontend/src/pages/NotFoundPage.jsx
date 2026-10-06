import { ArrowLeft, Home, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage(){
  return <main className="not-found-page">
    <section className="container not-found-card">
      <span className="not-found-code">404</span>
      <div><span className="eyebrow">KHÔNG TÌM THẤY TRANG</span><h1>Góc nhìn này chưa tồn tại.</h1><p>Đường dẫn có thể đã thay đổi hoặc nội dung chưa được công bố. Bạn có thể quay về HALO HOLA hoặc tra cứu tác phẩm.</p><div className="not-found-actions"><Link className="btn btn-green" to="/"><Home/> Về trang chủ</Link><Link className="btn btn-outline" to="/tra-cuu"><Search/> Tra cứu tác phẩm</Link><button className="btn btn-outline" onClick={()=>history.back()}><ArrowLeft/> Quay lại</button></div></div>
    </section>
  </main>
}
