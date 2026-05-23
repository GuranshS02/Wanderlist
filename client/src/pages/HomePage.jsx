import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itineraryApi } from '../lib/itineraryApi';
import { Link } from 'react-router-dom';
import './HomePage.css';



const STEPS = [
  { n: '01', t: 'Browse curated itineraries', d: 'Filter by destination, budget, duration, or travel style. Find plans made by real travelers.' },
  { n: '02', t: 'Buy instantly, securely', d: 'One-time payment via Stripe. Your full PDF lands in your inbox within 30 seconds.' },
  { n: '03', t: 'Pack and go explore', d: "Follow the day-by-day plan, real costs, insider tips. Skip the research, skip the stress." },
];

const STATS = [
  { n: '12,400+', l: 'Trips Sold' },
  { n: '840', l: 'Active Creators' },
  { n: '4.9', l: 'Average Rating', italic: true },
  { n: '60+', l: 'Countries Covered' },
];

const PERKS = [
  { i: '💰', t: '<strong>Keep 85%</strong> of every sale' },
  { i: '🎉', t: '<strong>Free to publish</strong>, no upfront cost' },
  { i: '♾️', t: '<strong>Sell unlimited</strong> copies forever' },
  { i: '📊', t: '<strong>Real-time</strong> earnings dashboard' },
];

export default function HomePage() {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [searchDest, setSearchDest] = useState('');
  const [searchDuration, setSearchDuration] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

  // Fetch top trending itineraries from the real API
const { data, isLoading } = useQuery({
queryKey: ['itineraries', 'home-featured'],
queryFn: () => itineraryApi.list({ sort: 'popular', limit: 6 }),
staleTime: 5 * 60 * 1000, // Cache for 5 min — featured doesn't change often
});

const ITINERARIES = data?.itineraries || [];
const itemsPerSlide = 3;
const totalSlides = Math.max(1, Math.ceil(ITINERARIES.length / itemsPerSlide));
const visibleItems = ITINERARIES.slice(
carouselIdx * itemsPerSlide,
carouselIdx * itemsPerSlide + itemsPerSlide
);

  return (
    <div className="home">
      {/* HERO */}
      <div className="hero-wrap">
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Finding Your Next<br />
              Adventure <em>Is Simple</em>
            </h1>
            <p className="hero-desc">
              Wanderlist is your go-to destination for travel itineraries crafted by real travelers. Day-by-day plans, real costs, and hidden gems — for every kind of journey across the world.
            </p>
            <div className="hero-search-pill">
              <input placeholder="Search destinations..." />
              <div className="hero-search-icon">→</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <div className="search-field">
          <div className="search-field-label">📍 Destination</div>
          <input
            className="search-field-input"
            placeholder="Where to?"
            value={searchDest}
            onChange={e => setSearchDest(e.target.value)}
          />
        </div>
        <div className="search-field">
          <div className="search-field-label">⏱️ Duration</div>
          <input
            className="search-field-input"
            placeholder="Any length"
            value={searchDuration}
            onChange={e => setSearchDuration(e.target.value)}
          />
        </div>
        <div className="search-field">
          <div className="search-field-label">💰 Budget</div>
          <input
            className="search-field-input"
            placeholder="Up to $30"
            value={searchBudget}
            onChange={e => setSearchBudget(e.target.value)}
          />
        </div>
        <Link to="/browse" className="search-btn">🔍 Search</Link>
      </div>

      {/* FEATURED */}
      <section className="featured">
        <div className="section-eyebrow">Most Loved</div>
        <h2 className="section-title">Featured <em>Itineraries</em></h2>
        <p className="section-sub">
          Discover hand-crafted travel plans from real travelers around the world. Book instantly, travel confidently — for any kind of journey.
        </p>

        <div className="cards-grid">
{isLoading ? (
  // Show skeleton loaders while fetching
  Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="card-skeleton" />
  ))
) : ITINERARIES.length === 0 ? (
  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
    No itineraries yet. Check back soon!
  </div>
) : (
  visibleItems.map(it => (
    <Link
      to={`/itinerary/${it.slug || it._id}`}
      key={it._id}
      className="card"
    >
      <div className="card-img-wrap">
        <img
          src={it.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'}
          alt={it.title}
          className="card-img"
        />
        {it.badge && <div className="card-badge">{it.badge}</div>}
        <div className="card-flag">{it.flag}</div>
      </div>
      <div className="card-info">
        <div className="card-location">
          {it.city ? `${it.city}, ${it.country}` : it.country}
        </div>
        <div className="card-stats">
          <span className="stat">📅 {it.days}d</span>
          <span className="stat">📍 {it.stops}</span>
        </div>
      </div>
      <h3 className="card-title">{it.title}</h3>
      <div className="card-bottom">
        <div>
          <div className="card-price">${it.price}</div>
          <div className="card-price-sub">One-time</div>
        </div>
        {it.averageRating > 0 && (
          <div className="card-rating">★ {it.averageRating.toFixed(1)}</div>
        )}
      </div>
    </Link>
  ))
)}
        </div>

        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              className={`dot${i === carouselIdx ? ' active' : ''}`}
              onClick={() => setCarouselIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* EASIEST METHOD */}
      <section className="easiest">
        <div className="easiest-grid">
          <div className="easiest-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=85"
              alt="Travel planning"
              className="easiest-img"
            />
            <div className="easiest-img-overlay" />
            <div className="easiest-floating">🌿</div>
            <div className="easiest-floating-card">
              <div className="efc-avatar">P</div>
              <div className="efc-text">
                <div className="efc-name">Priya M.</div>
                <div className="efc-desc">Just purchased Kyoto plan</div>
              </div>
              <div className="efc-tag">$18</div>
            </div>
          </div>

          <div className="easiest-content">
            <span className="easiest-eyebrow">How it works</span>
            <h2 className="easiest-title">
              The Easiest Method<br />
              To Plan a <em>Trip</em>
            </h2>
            <p className="easiest-desc">
              No more 47 browser tabs or conflicting Reddit threads. Get a complete day-by-day plan from someone who's actually been there — in 3 simple steps.
            </p>
            <div className="steps">
              {STEPS.map(s => (
                <div className="step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text">
                    <div className="step-title">{s.t}</div>
                    <div className="step-desc">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/browse" className="easiest-btn">Start exploring →</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stats-inner">
          {STATS.map(s => (
            <div className="stat-item" key={s.l}>
              <div className="stat-num">
                {s.italic ? <em>{s.n}</em> : s.n}
              </div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CREATOR CTA */}
      <section className="creator-cta">
        <div className="creator-card">
          <div className="creator-left">
            <span className="creator-eyebrow">For creators</span>
            <h2 className="creator-title">
              You've traveled.<br />
              Now <em>get paid</em> for it.
            </h2>
            <p className="creator-desc">
              Turn that 14-day Bali plan you made for your friends into passive income. Publish once, sell forever — to travelers who'd love to follow your footsteps.
            </p>
            <div className="creator-perks">
              {PERKS.map(p => (
                <div className="perk" key={p.i}>
                  <div className="perk-icon">{p.i}</div>
                  <div className="perk-text" dangerouslySetInnerHTML={{ __html: p.t }} />
                </div>
              ))}
            </div>
            <Link to="/signup" className="creator-btn">Start earning today →</Link>
          </div>
          <div className="creator-right">
            <div className="big-percent">
              <div className="bp-tag">TOP CREATORS</div>
              <div className="bp-num">85%</div>
              <div className="bp-lbl">Yours to keep</div>
              <div className="bp-div" />
              <div className="bp-sub">
                Earn on average
                <strong>$1,200/month</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}