import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../lib/orderApi';
import useAuthStore from '../store/authStore';
import './MyTripsPage.css';

export default function MyTripsPage() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.myOrders(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="mt-page mt-locked">
        <div className="mt-locked-card">
          <div className="mt-locked-icon">🔐</div>
          <h2>Log in to see your trips</h2>
          <p>Your purchased itineraries will live here.</p>
          <Link to="/login" className="mt-locked-btn">Log in →</Link>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];

  const stats = {
    total: orders.length,
    countries: new Set(orders.map(o => o.itinerary?.country).filter(Boolean)).size,
    daysOfPlans: orders.reduce((sum, o) => sum + (o.itinerary?.days || 0), 0),
    invested: orders.reduce((sum, o) => sum + (o.amountTotal || 0), 0) / 100,
  };

  return (
    <div className="mt-page">
      {/* ─── HEADER ─── */}
      <header className="mt-header">
        <div className="mt-header-inner">
          <div>
            <span className="mt-eyebrow">My trips</span>
            <h1 className="mt-title">Your <em>travel</em> library</h1>
            <p className="mt-sub">
              Welcome back, {user?.name?.split(' ')[0]}.
              {orders.length > 0
                ? ' Here are all the itineraries you own.'
                : ' Find a trip and start collecting plans.'}
            </p>
          </div>
          <Link to="/browse" className="mt-browse-btn">Explore plans →</Link>
        </div>
      </header>

      {/* ─── STATS (only if there are trips) ─── */}
      {orders.length > 0 && (
        <section className="mt-stats">
          <div className="mt-stat-grid">
            <div className="mt-stat-card">
              <div className="mt-stat-icon">📋</div>
              <div className="mt-stat-value">{stats.total}</div>
              <div className="mt-stat-label">Trip plans owned</div>
            </div>
            <div className="mt-stat-card">
              <div className="mt-stat-icon">🌍</div>
              <div className="mt-stat-value">{stats.countries}</div>
              <div className="mt-stat-label">Countries to explore</div>
            </div>
            <div className="mt-stat-card">
              <div className="mt-stat-icon">📅</div>
              <div className="mt-stat-value">{stats.daysOfPlans}</div>
              <div className="mt-stat-label">Days of adventure</div>
            </div>
            <div className="mt-stat-card mt-stat-highlight">
              <div className="mt-stat-icon">💰</div>
              <div className="mt-stat-value">
                <span className="mt-stat-currency">$</span>
                {stats.invested.toFixed(2)}
              </div>
              <div className="mt-stat-label">Invested in trips</div>
            </div>
          </div>
        </section>
      )}

      {/* ─── RESULTS ─── */}
      <section className="mt-results">
        {isLoading ? (
          <div className="mt-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mt-skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-empty">
            <div className="mt-empty-icon">⚠️</div>
            <h3>Couldn't load your trips</h3>
            <p>Try refreshing the page.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-empty">
            <div className="mt-empty-icon">🗺️</div>
            <h3>No trips yet — your adventure starts here</h3>
            <p>
              Browse the marketplace, find an itinerary that calls to you,
              and start collecting plans for your next journey.
            </p>
            <Link to="/browse" className="mt-empty-btn">Explore the marketplace →</Link>
          </div>
        ) : (
          <div className="mt-grid">
            {orders.map(order => {
              const it = order.itinerary;
              if (!it) return null; // safety: itinerary might be archived
              return (
                <Link
                  to={`/itinerary/${it.slug || it._id}`}
                  key={order._id}
                  className="mt-card"
                >
                  <div className="mt-card-img-wrap">
                    <img
                      src={it.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'}
                      alt={it.title}
                      className="mt-card-img"
                    />
                    <div className="mt-card-owned">✓ Owned</div>
                    <div className="mt-card-flag">{it.flag}</div>
                  </div>
                  <div className="mt-card-body">
                    <div className="mt-card-loc">
                      {it.city ? `${it.city}, ${it.country}` : it.country}
                    </div>
                    <h3 className="mt-card-title">{it.title}</h3>
                    <div className="mt-card-meta">
                      <span>📅 {it.days} days</span>
                      <span>·</span>
                      <span>by {order.creator?.name || 'Anonymous'}</span>
                    </div>
                    <div className="mt-card-footer">
                      <div className="mt-card-paid">
                        Owned since {new Date(order.paidAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="mt-card-amount">
                        ${(order.amountTotal / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}