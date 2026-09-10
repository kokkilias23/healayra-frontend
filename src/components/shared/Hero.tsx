import { Link } from 'react-router-dom'

import heroImage from '../../assets/doctor-hero.jpg'

import '../../styles/Hero.css'

export default function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <div className="hero-text">
                    <div className="hero-badge">
                        Healthcare & Therapy Platform
                    </div>

                    <h1>
                        Trust the
                        <span> Process.</span>
                    </h1>

                    <p className="hero-description">
                        Σύγχρονη πλατφόρμα για επαγγελματίες
                        υγείας και τους θεραπευόμενούς τους.
                    </p>

                    <p className="hero-subtext">
                        Διαχείριση ραντεβού, διαθεσιμότητας
                        και θεραπευτικού ιστορικού σε ένα
                        ασφαλές και οργανωμένο περιβάλλον.
                    </p>

                    <div className="hero-actions">
                        <Link
                            to="/booking"
                            className="hero-button"
                        >
                            Κλείσιμο Ραντεβού
                        </Link>

                        <Link
                            to="/login"
                            className="hero-login-link"
                        >
                            Σύνδεση
                        </Link>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-image-wrapper">
                        <div className="hero-image-glow" />

                        <img
                            src={heroImage}
                            alt="Οπτική ψευδαίσθηση με δύο πρόσωπα και ένα βάζο"
                            className="hero-image"
                        />

                    </div>

                    <p className="hero-image-caption">
                        Δύο πρόσωπα ή ένα βάζο —
                        η αντίληψη είναι θέμα οπτικής.
                    </p>
                </div>
            </div>
        </section>
    )
}