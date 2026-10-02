export default function SectionHeading({ eyebrow, title, desc, action }) {
  return <div className="section-heading">
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
    <div className="section-heading-side">{desc && <p>{desc}</p>}{action}</div>
  </div>
}
