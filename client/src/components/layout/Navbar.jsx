import { Link, NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Explore' },
  { to: '/creator', label: 'Creators' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className={`nav ${isHome ? 'nav--transparent' : 'nav--solid'}`}>
      <Link to="/" className="nav-logo">
        <div className="nav-logo-icon">🌿</div>
        <span>Wanderlist</span>
      </Link>

      <div className="nav-links">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link--active' : ''}`
            }
            end={link.to === '/'}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <Link to="/signup" className="nav-cta">
        Sign up →
      </Link>
    </nav>
  );
}