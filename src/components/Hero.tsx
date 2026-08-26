import { Link } from 'react-router-dom'
import heroImage from '../assets/doctor-hero.jpg'
import "./Hero.css"


export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-label">Healayra</p>

      <h1>
        Trust the Process.

      </h1>

      <p className="hero-description">
        Σύγχρονη πλατφόρμα για επαγγελματίες υγείας και τους ασθενείς τους.
      </p>

      <Link to="/booking" className="hero-button">
        Κλείσιμο Ραντεβού
        </Link>
      </div>

          <div className="hero-image-wrapper">
           <img 
          src={heroImage} 
          alt="Hero Image" 
          className="hero-image" 
          />
          </div>
          </div>
    
  
    </section>
    )
  }