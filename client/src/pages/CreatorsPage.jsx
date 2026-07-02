import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './CreatorsPage.css';

export default function CreatorsPage() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const ctaPath = isAuthenticated ? '/create' : '/signup';
  const ctaLabel = isAuthenticated ? 'Create your first itinerary' : 'Become a creator';

  return (
    <div className="cr-page">
      {/* ─── HERO ─── */}
      <section className="cr-hero">
        <div className="cr-hero-bg" />
        <div className="cr-hero-inner">
          <div className="cr-eyebrow">For travelers · For storytellers · For creators</div>
          <h1 className="cr-hero-title">
            Turn your travels into <em>income.</em>
          </h1>
          <p className="cr-hero-sub">
            You did the research. You found the places nobody talks about.
            You spent weeks building the perfect trip.
            Wanderlist lets you sell that knowledge — and keep 85% of every sale.
          </p>
          <div className="cr-hero-cta-row">
            <Link to={ctaPath} className="cr-hero-cta">{ctaLabel} →</Link>
            <Link to="/browse" className="cr-hero-cta-secondary">See what creators are making</Link>
          </div>

          <div className="cr-hero-proof">
            <div className="cr-proof-item">
              <div className="cr-proof-num">85%</div>
              <div className="cr-proof-label">Of every sale, yours</div>
            </div>
            <div className="cr-proof-divider" />
            <div className="cr-proof-item">
              <div className="cr-proof-num">$0</div>
              <div className="cr-proof-label">To start. No fees, ever.</div>
            </div>
            <div className="cr-proof-divider" />
            <div className="cr-proof-item">
              <div className="cr-proof-num">∞</div>
              <div className="cr-proof-label">Lifetime royalties per plan</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY WANDERLIST ─── */}
      <section className="cr-why">
        <div className="cr-section-head">
          <span className="cr-section-eyebrow">— Why Wanderlist —</span>
          <h2 className="cr-section-title">
            Built for travelers who <em>already know</em> what works.
          </h2>
        </div>

        <div className="cr-why-grid">
          <div className="cr-why-card">
            <div className="cr-why-icon">🌿</div>
            <h3>Authentic over algorithmic</h3>
            <p>
              No SEO-farm content. No AI fluff. Every plan is written by someone
              who actually traveled the trip — and travelers feel the difference.
            </p>
          </div>

          <div className="cr-why-card">
            <div className="cr-why-icon">💸</div>
            <h3>You keep 85%</h3>
            <p>
              Industry-leading split. Most platforms take 30–50%. We take 15% to
              cover hosting, support, and growth. The rest is yours.
            </p>
          </div>

          <div className="cr-why-card">
            <div className="cr-why-icon">🛠️</div>
            <h3>Built for the work</h3>
            <p>
              Day-by-day editor, dynamic activity blocks, reviews, drafts, dashboards.
              Made by builders who've shipped real products — not a Notion template.
            </p>
          </div>

          <div className="cr-why-card">
            <div className="cr-why-icon">∞</div>
            <h3>Lifetime royalties</h3>
            <p>
              Sell the same plan a thousand times. Update it as the destination
              changes. Your knowledge keeps earning, long after the trip ends.
            </p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="cr-how">
        <div className="cr-section-head">
          <span className="cr-section-eyebrow">— How it works —</span>
          <h2 className="cr-section-title">
            From idea to first sale in <em>under an hour.</em>
          </h2>
        </div>

        <div className="cr-steps">
          <div className="cr-step">
            <div className="cr-step-num">01</div>
            <div className="cr-step-content">
              <h3>Sign up free</h3>
              <p>
                No application, no waitlist. Create an account in 30 seconds and
                you're ready to publish.
              </p>
            </div>
            <div className="cr-step-visual">→</div>
          </div>

          <div className="cr-step">
            <div className="cr-step-num">02</div>
            <div className="cr-step-content">
              <h3>Build your itinerary</h3>
              <p>
                Use the day-by-day editor. Add activities, costs, locations, and
                photos. Save drafts. Publish when ready.
              </p>
            </div>
            <div className="cr-step-visual">→</div>
          </div>

          <div className="cr-step">
            <div className="cr-step-num">03</div>
            <div className="cr-step-content">
              <h3>Earn while you travel</h3>
              <p>
                Travelers discover your plan in the marketplace. Each purchase
                pays you 85% — passively, forever.
              </p>
            </div>
          </div>
        </div>

        <div className="cr-how-cta">
          <Link to={ctaPath} className="cr-btn-primary">{ctaLabel} →</Link>
        </div>
      </section>

      {/* ─── THE 85/15 SPLIT ─── */}
      <section className="cr-split">
        <div className="cr-split-card">
          <div className="cr-split-left">
            <span className="cr-section-eyebrow">— The split —</span>
            <h2 className="cr-section-title cr-section-title-light">
              The most creator-friendly split <em>in travel.</em>
            </h2>
            <p className="cr-split-desc">
              Most travel content platforms take 30–50% of your earnings.
              We take 15% to keep the lights on — hosting, payment processing,
              fraud protection, support. Everything else is yours, forever.
            </p>
            <ul className="cr-split-list">
              <li>✓ No subscription fees. Ever.</li>
              <li>✓ No upload limits.</li>
              <li>✓ Withdraw earnings whenever.</li>
              <li>✓ Keep your audience. Keep your rights.</li>
            </ul>
          </div>

          <div className="cr-split-right">
            <div className="cr-split-pie">
              <div className="cr-split-pie-num">85<span>%</span></div>
              <div className="cr-split-pie-label">Yours</div>
              <div className="cr-split-pie-divider" />
              <div className="cr-split-pie-sub">15% covers platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EXAMPLE EARNINGS ─── */}
      <section className="cr-earnings">
        <div className="cr-section-head">
          <span className="cr-section-eyebrow">— Example earnings —</span>
          <h2 className="cr-section-title">
            What a single great plan can earn you.
          </h2>
          <p className="cr-section-sub">
            One creator. One trip. Many travelers. Hypothetical projections — your results depend on demand and quality.
          </p>
        </div>

        <div className="cr-earnings-grid">
          <div className="cr-earning-card">
            <div className="cr-earning-tier">Casual creator</div>
            <div className="cr-earning-amount">$170/mo</div>
            <div className="cr-earning-detail">
              1 plan at $20 · 10 buyers/month · You keep 85%
            </div>
          </div>
          <div className="cr-earning-card cr-earning-highlight">
            <div className="cr-earning-tier">Dedicated creator</div>
            <div className="cr-earning-amount">$1,360/mo</div>
            <div className="cr-earning-detail">
              4 plans at $20 · 20 buyers each/month · You keep 85%
            </div>
            <div className="cr-earning-badge">Most common</div>
          </div>
          <div className="cr-earning-card">
            <div className="cr-earning-tier">Power creator</div>
            <div className="cr-earning-amount">$5,100/mo</div>
            <div className="cr-earning-detail">
              10 plans at $25 · 30 buyers each/month · You keep 85%
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="cr-final">
        <div className="cr-final-inner">
          <h2>Your next trip could be funded by your last one.</h2>
          <p>Join Wanderlist and start earning from the knowledge you've already collected.</p>
          <Link to={ctaPath} className="cr-final-cta">{ctaLabel} →</Link>
        </div>
      </section>
    </div>
  );
}