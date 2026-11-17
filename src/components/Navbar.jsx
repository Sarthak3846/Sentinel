import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <span className="navbar__mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 5.5V11C4 16.2 7.4 20.9 12 22C16.6 20.9 20 16.2 20 11V5.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M8 12.5L10.3 14.8L15.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Sentinel
          </Link>

          <nav className="navbar__links" aria-label="Primary">
            <Link to="/#product">Product</Link>
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/#research">Research</Link>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'is-active' : '')}>About</NavLink>
          </nav>

          <div className="navbar__actions">
            <span className="navbar__badge">
              <i /> Prototype
            </span>
            <Link to="/demo" className="btn btn--primary">
              View live demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}