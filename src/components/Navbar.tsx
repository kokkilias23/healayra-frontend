import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" className="brand">Healayra
            </Link>
            
            <div className="nav-links">
                <Link to="/">Αρχική</Link>
                <Link to="/booking">Ραντεβού</Link>
                <Link to="/login">Σύνδεση</Link>
                <Link to="/register" className="btn">Εγγραφή
                </Link>
            </div>
            
            </nav>
        )   
    }