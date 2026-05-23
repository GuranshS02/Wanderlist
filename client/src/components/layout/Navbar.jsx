import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Explore' },
  { to: '/creator', label: 'Creators' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

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
              <Link to="/creator" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                Become a creator
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
    </nav>
  );
}