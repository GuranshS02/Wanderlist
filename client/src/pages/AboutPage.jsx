import { Link } from 'react-router-dom';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="ab-page">
      {/* ─── HERO ─── */}
      <section className="ab-hero">
        <div className="ab-hero-inner">
          <div className="ab-eyebrow">— About Wanderlist —</div>
          <h1 className="ab-hero-title">
            We believe the best trips are <em>built by people, not algorithms.</em>
          </h1>
          <p className="ab-hero-sub">
            Wanderlist is a marketplace for travel itineraries crafted by real travelers
            who've actually been there. No SEO content. No AI-generated guides.
            Just honest, day-by-day plans from people who care.
          </p>
        </div>
      </section>

      {/* ─── THE STORY ─── */}
      <section className="ab-story">
        <div className="ab-story-inner">
          <span className="ab-section-eyebrow">— Our story —</span>
          <h2 className="ab-section-title">
            We were tired of <em>"top 10 things to do"</em> lists.
          </h2>
          <div className="ab-story-body">
            <p>
              Every search for travel advice ends the same way. Lists written by people
              who never went. Recommendations that read like ads. Itineraries built to
              rank in search results, not to actually help you have a great trip.
            </p>
            <p>
              Meanwhile, the people with the real knowledge — the ones who spent weeks
              researching a destination, found the spots locals love, mapped out a
              perfect 7-day flow — they have no platform built for them. Their plans
              live in Notion docs, in Google Maps lists, in text threads with friends.
            </p>
            <p>
              We built Wanderlist to fix that. A marketplace where travelers can
              package what they learned, sell it for fair value, and help other
              travelers skip the research entirely. <strong>Pay a creator for their
              week of work. Save your own.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="ab-values">
        <div className="ab-section-head">
          <span className="ab-section-eyebrow">— What we believe —</span>
          <h2 className="ab-section-title">Our principles, written down so we don't forget.</h2>
        </div>

        <div className="ab-values-grid">
          <div className="ab-value">
            <div className="ab-value-num">01</div>
            <h3>Trust over scale</h3>
            <p>
              We'd rather have 100 itineraries that change lives than 10,000 that change
              nothing. Quality is enforced through community reviews — not promoted listings.
            </p>
          </div>

          <div className="ab-value">
            <div className="ab-value-num">02</div>
            <h3>Creators win, or we don't</h3>
            <p>
              Most platforms take 30–50% of creator earnings. We take 15% — and we'd take
              less if we could. The people doing the work deserve the value they create.
            </p>
          </div>

          <div className="ab-value">
            <div className="ab-value-num">03</div>
            <h3>Real travel, not influencer travel</h3>
            <p>
              We're building for people who travel to learn, not to perform.
              The itineraries that sell best on Wanderlist are the ones with
              actual costs, real bus schedules, and unphotogenic warnings.
            </p>
          </div>

          <div className="ab-value">
            <div className="ab-value-num">04</div>
            <h3>Slow is fine</h3>
            <p>
              We're not trying to be the biggest. We're trying to be the most trusted.
              No growth hacks, no dark patterns, no rushing to ship features that don't help.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BY THE NUMBERS ─── */}
      <section className="ab-stats">
        <div className="ab-stats-inner">
          <div className="ab-stat">
            <div className="ab-stat-num">85<span>%</span></div>
            <div className="ab-stat-label">Creator earnings</div>
          </div>
          <div className="ab-stat">
            <div className="ab-stat-num">0<span>$</span></div>
            <div className="ab-stat-label">Subscription fees</div>
          </div>
          <div className="ab-stat">
            <div className="ab-stat-num">100<span>%</span></div>
            <div className="ab-stat-label">Human-written content</div>
          </div>
          <div className="ab-stat">
            <div className="ab-stat-num">∞</div>
            <div className="ab-stat-label">Lifetime access for buyers</div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="ab-final">
        <div className="ab-final-inner">
          <h2>Building something better for the way <em>we</em> travel.</h2>
          <p>Whether you want to plan a trip or share one — Wanderlist is built for you.</p>
          <div className="ab-final-row">
            <Link to="/browse" className="ab-cta-primary">Explore trips →</Link>
            <Link to="/creators" className="ab-cta-secondary">Become a creator</Link>
          </div>
        </div>
      </section>
    </div>
  );
}