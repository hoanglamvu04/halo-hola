export default function PageHero({ eyebrow, title, accent, desc, image, children }) {
  return <section className="page-hero paper-bg">
    <div className="container page-hero-grid">
      <div className="page-hero-copy"><span className="eyebrow">{eyebrow}</span><h1>{title} {accent && <em>{accent}</em>}</h1><p>{desc}</p>{children}</div>
      <div className="page-hero-visual">{image?<img src={image} alt="Hòa Lạc"/>:<div className="theme-card-placeholder"/>}<div className="brush-edge"/><span className="hand-note">Hòa Lạc<br/>hôm nay<br/>và mai sau...</span></div>
    </div>
  </section>
}
