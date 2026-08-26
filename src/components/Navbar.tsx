import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav>
            <Link to="/">Healayra</Link>
            
            <div>
                
                <Link to="/">Αρχική</Link>
                <Link to="/booking">Ραντεβού</Link>
                <Link to="/login">Σύνδεση</Link>
                <Link to="/register">Εγγραφή</Link>
            </div>
            
            </nav>
        )   
    }