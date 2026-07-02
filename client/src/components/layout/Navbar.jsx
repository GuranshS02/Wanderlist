import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import './Navbar.css';
import { createPortal } from 'react-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Explore' },
  { to: '/creators', label: 'Creators' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);       // user-dropdown
  const [mobileOpen, setMobileOpen] = useState(false);   // hamburger drawer
  const menuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className={`nav ${isHome ? 'nav--transparent' : 'nav--solid'}`}>
      <Link to="/" className="nav-logo">
        <div className="nav-logo-icon">🌿</div>
        <span>Wanderlist</span>
      </Link>

      {/* ─── DESKTOP LINKS ─── */}
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

      {/* ─── DESKTOP RIGHT (auth / avatar) ─── */}
      <div className="nav-right">
        {isAuthenticated ? (
          <div className="nav-user" ref={menuRef}>
            <button className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>
            {menuOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-name">{user?.name}</div>
                  <div className="nav-dropdown-email">{user?.email}</div>
                </div>
                <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                  My trips
                </Link>
                <Link to="/my-listings" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                  📊 My listings
                </Link>
                <Link to="/create" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                  ✨ Create itinerary
                </Link>
                <div className="nav-dropdown-divider" />
                <button onClick={handleLogout} className="nav-dropdown-item nav-dropdown-logout">
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-auth-buttons">
            <Link to="/login" className="nav-login">Log in</Link>
            <Link to="/signup" className="nav-cta">Sign up →</Link>
          </div>
        )}

        {/* ─── HAMBURGER (mobile only) ─── */}
        <button
          className={`nav-hamburger ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ─── MOBILE DRAWER (portaled to body to escape navbar's stacking context) ─── */}
{mobileOpen && createPortal(
  <>
    <div className="nav-mobile-backdrop" onClick={() => setMobileOpen(false)} />
    <div className="nav-mobile-drawer">
      <div className="nav-mobile-links">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-mobile-link ${isActive ? 'is-active' : ''}`
            }
            end={link.to === '/'}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="nav-mobile-divider" />

      {isAuthenticated ? (
        <div className="nav-mobile-user">
          <div className="nav-mobile-user-info">
            <div className="nav-mobile-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="nav-mobile-name">{user?.name}</div>
              <div className="nav-mobile-email">{user?.email}</div>
            </div>
          </div>
          <Link to="/dashboard" className="nav-mobile-link">My trips</Link>
          <Link to="/my-listings" className="nav-mobile-link">📊 My listings</Link>
          <Link to="/create" className="nav-mobile-link">✨ Create itinerary</Link>
          <button onClick={handleLogout} className="nav-mobile-link nav-mobile-logout">
            Log out
          </button>
        </div>
      ) : (
        <div className="nav-mobile-cta">
          <Link to="/login" className="nav-mobile-login">Log in</Link>
          <Link to="/signup" className="nav-mobile-signup">Sign up →</Link>
        </div>
      )}
    </div>
  </>,
  document.body
)}
    </nav>
  );
}