import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Browse', to: '/browse' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Mobile app', to: '/app' },
    ],
  },
  {
    title: 'For creators',
    links: [
      { label: 'Become a creator', to: '/creator' },
      { label: 'Creator guide', to: '/guide' },
      { label: 'Payouts', to: '/payouts' },
      { label: 'Success stories', to: '/stories' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">🌿</div>
            <span>Wanderlist</span>
          </Link>
          <p className="footer-tagline">Made for explorers, by explorers</p>
        </div>

        {FOOTER_LINKS.map(col => (
          <div key={col.title}>
            <div className="footer-col-title">{col.title}</div>
            {col.links.map(l => (
              <Link key={l.label} to={l.to} className="footer-link">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© 2026 Wanderlist · All rights reserved</span>
        <span>Made with 🌿 for travelers everywhere</span>
      </div>
    </footer>
  );
}