import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itineraryApi } from '../lib/itineraryApi';
import useAuthStore from '../store/authStore';
import './ItineraryPage.css';

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => itineraryApi.get(id),
  });

  const itinerary = data?.itinerary;

  // ─── LOADING ───
  if (isLoading) {
    return (
      <div className="itin-page">
        <div className="itin-skeleton-hero" />
        <div className="itin-skeleton-body">
          <div className="skeleton-block" style={{ width: '60%', height: 48 }} />
          <div className="skeleton-block" style={{ width: '40%', height: 24 }} />
          <div className="skeleton-block" style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    );
  }

  // ─── ERROR / NOT FOUND ───
  if (isError || !itinerary) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="itin-not-found">
        <div className="not-found-emoji">{is404 ? '🗺️' : '😕'}</div>
        <h1>{is404 ? 'Itinerary not found' : 'Something went wrong'}</h1>
        <p>{is404 ? 'This trip plan might have been removed.' : 'Please try again later.'}</p>
        <Link to="/browse" className="back-to-browse">← Back to explore</Link>
      </div>
    );
  }

  const handleBuy = () => {
    if (!isAuthenticated) {
      // Send them to login, then back here
      navigate('/login', { state: { from: { pathname: `/itinerary/${id}` } } });
      return;
    }
    // TODO: Stripe checkout (next step)
    alert('Checkout coming soon! 🚀');
  };

  // Format date nicely
  const formattedDate = new Date(itinerary.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="itin-page">
      {/* ─── HERO ─── */}
      <div className="itin-hero">
        <img
          src={itinerary.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=85'}
          alt={itinerary.title}
          className="itin-hero-img"
        />
        <div className="itin-hero-overlay" />

        <div className="itin-hero-content">
          <Link to="/browse" className="itin-back">← Back to explore</Link>
          <div className="itin-hero-meta">
            <span className="itin-flag">{itinerary.flag}</span>
            <span className="itin-location-text">
              {itinerary.city ? `${itinerary.city}, ${itinerary.country}` : itinerary.country}
            </span>
            {itinerary.badge && <span className="itin-badge">{itinerary.badge}</span>}
          </div>
          <h1 className="itin-title">{itinerary.title}</h1>
          {itinerary.highlight && <p className="itin-highlight">✦ {itinerary.highlight}</p>}
        </div>
      </div>

      {/* ─── BODY: 2-COLUMN LAYOUT ─── */}
      <div className="itin-body">
        {/* ─── LEFT (main content) ─── */}
        <div className="itin-main">
          {/* Stats bar */}
          <div className="itin-stats">
            <div className="stat-item">
              <div className="stat-value">{itinerary.days}</div>
              <div className="stat-label">Days</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">{itinerary.stops}</div>
              <div className="stat-label">Stops</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">
                {itinerary.averageRating > 0 ? itinerary.averageRating.toFixed(1) : '—'}
              </div>
              <div className="stat-label">
                {itinerary.reviewCount > 0 ? `${itinerary.reviewCount} reviews` : 'No reviews yet'}
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">{itinerary.salesCount}</div>
              <div className="stat-label">Travelers</div>
            </div>
          </div>

          {/* Tags */}
          {itinerary.tags?.length > 0 && (
            <div className="itin-tags">
              {itinerary.tags.map(t => (
                <span key={t} className="itin-tag">{t}</span>
              ))}
            </div>
          )}

          {/* About this trip */}
          <section className="itin-section">
            <h2 className="section-h2">About this trip</h2>
            <p className="itin-description">{itinerary.description}</p>
          </section>

          {/* Day-by-day plan */}
          {itinerary.dayPlans?.length > 0 ? (
            <section className="itin-section">
              <h2 className="section-h2">Day-by-day plan</h2>
              <div className="day-plans">
                {itinerary.dayPlans.map(day => (
                  <div key={day.dayNumber} className="day-card">
                    <div className="day-header">
                      <div className="day-number">Day {day.dayNumber}</div>
                      <h3 className="day-title">{day.title}</h3>
                    </div>
                    {day.summary && <p className="day-summary">{day.summary}</p>}
                    {day.activities?.length > 0 && (
                      <ul className="day-activities">
                        {day.activities.map((act, i) => (
                          <li key={i} className="activity">
                            {act.time && <span className="activity-time">{act.time}</span>}
                            <div className="activity-content">
                              <strong>{act.title}</strong>
                              {act.description && <p>{act.description}</p>}
                              {act.location && <span className="activity-loc">📍 {act.location}</span>}
                            </div>
                            {act.cost > 0 && <span className="activity-cost">${act.cost}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="itin-section">
              <div className="preview-locked">
                <div className="lock-icon">🔒</div>
                <h3>Day-by-day plan locked</h3>
                <p>Get this itinerary to unlock the complete day-by-day breakdown, exact locations, costs, and insider tips.</p>
              </div>
            </section>
          )}
        </div>

        {/* ─── RIGHT (sticky buy card) ─── */}
        <aside className="itin-sidebar">
          <div className="buy-card">
            <div className="buy-price-row">
              <div>
                <div className="buy-price">${itinerary.price}</div>
                <div className="buy-price-sub">One-time payment</div>
              </div>
              {itinerary.averageRating > 0 && (
                <div className="buy-rating">
                  ★ {itinerary.averageRating.toFixed(1)}
                </div>
              )}
            </div>

            <button className="buy-btn" onClick={handleBuy}>
              Get this plan →
            </button>

            <div className="buy-features">
              <div className="buy-feature">
                <span className="feature-icon">✓</span>
                Full day-by-day plan
              </div>
              <div className="buy-feature">
                <span className="feature-icon">✓</span>
                Real costs &amp; budgets
              </div>
              <div className="buy-feature">
                <span className="feature-icon">✓</span>
                Hidden gems included
              </div>
              <div className="buy-feature">
                <span className="feature-icon">✓</span>
                Downloadable PDF
              </div>
              <div className="buy-feature">
                <span className="feature-icon">✓</span>
                Lifetime access
              </div>
            </div>

            <div className="buy-divider" />

            <div className="creator-card">
              <div className="creator-label">Created by</div>
              <div className="creator-info">
                <div className="creator-avatar">
                  {itinerary.creator?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <div className="creator-name">{itinerary.creator?.name || 'Anonymous'}</div>
                  <div className="creator-date">Published {formattedDate}</div>
                </div>
              </div>
            </div>
          </div>

          <p className="trust-line">
            🔒 Secure checkout · 14-day refund guarantee
          </p>
        </aside>
      </div>
    </div>
  );
}