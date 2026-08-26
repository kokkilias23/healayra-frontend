import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <h1>Healayra</h1>

      <p>Trust the Process.</p>

      <p>
        Σύγχρονη πλατφόρμα για επαγγελματίες υγείας και τους ασθενείς τους.
      </p>

      <Link to="/booking">
        Κλείσιμο Ραντεβού
      </Link>
    </section>
  )
}