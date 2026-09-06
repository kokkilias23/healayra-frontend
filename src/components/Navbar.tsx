import { Link } from 'react-router-dom'

import logo from '../assets/healayra-logo.png'

import '../styles/Navbar.css'

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link
                    to="/"
                    className="navbar-brand"
                >
                    <img
                        src={logo}
                        alt="Healayra"
                        className="navbar-logo"
                    />

                    <span>
                        HEALAYRA
                    </span>
                </Link>

                <div className="nav-links">
                    <Link to="/">
                        Αρχική
                    </Link>

                    <Link to="/booking">
                        Ραντεβού
                    </Link>

                    <Link to="/login">
                        Σύνδεση
                    </Link>

                    <Link
                        to="/register"
                        className="nav-register-btn"
                    >
                        Εγγραφή
                    </Link>
                </div>
            </div>
        </nav>
    )
}