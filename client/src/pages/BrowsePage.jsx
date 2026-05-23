import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itineraryApi } from '../lib/itineraryApi';
import './BrowsePage.css';

const TAGS = [
  { label: '✨ All', value: '' },
  { label: '🏛️ Culture', value: 'Culture' },
  { label: '🏔️ Adventure', value: 'Adventure' },
  { label: '💰 Budget', value: 'Budget' },
  { label: '🌊 Coast', value: 'Coast' },
  { label: '🌲 Nature', value: 'Nature' },
  { label: '🍜 Food', value: 'Food' },
  { label: '📸 Photography', value: 'Photography' },
  { label: '🥾 Trekking', value: 'Trekking' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL (so they persist on refresh + are shareable)
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  // Local state for search input (debounced)
  const [searchInput, setSearchInput] = useState(search);

  // Debounce search input — only fire API call after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateFilter('search', searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Helper to update a single filter in URL
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    // Reset to page 1 when filters change
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams);
  };

  // The actual data fetch via React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['itineraries', { search, tag, sort, minPrice, maxPrice, page }],
    queryFn: () => itineraryApi.list({
      search,
      tag,
      sort,
      minPrice,
      maxPrice,
      page,
      limit: 12,
    }),
    keepPreviousData: true,
  });

  const itineraries = data?.itineraries || [];
  const pagination = data?.pagination;

  const hasActiveFilters = search || tag || minPrice || maxPrice;
  const clearFilters = () => setSearchParams({});

  return (
    <div className="browse-page">
      {/* HERO */}
      <section className="browse-hero">
        <div className="browse-hero-content">
          <span className="browse-eyebrow">Marketplace</span>
          <h1 className="browse-title">
            Explore <em>real</em> travel plans
          </h1>
          <p className="browse-sub">
            From day-by-day blueprints crafted by people who've actually been there.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="browse-filter-bar">
        <div className="search-input-wrap">
          <span className="search-input-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search destinations, countries, vibes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="search-clear" onClick={() => setSearchInput('')}>×</button>
          )}
        </div>

        <select
          className="sort-select"
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
          ))}
        </select>
      </section>

      {/* TAG PILLS */}
      <section className="browse-tags">
        <div className="tags-row">
          {TAGS.map(t => (
            <button
              key={t.value}
              className={`tag-pill${tag === t.value ? ' active' : ''}`}
              onClick={() => updateFilter('tag', t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear all filters ×
          </button>
        )}
      </section>

      {/* RESULTS */}
      <section className="browse-results">
        {isLoading && !data ? (
          <div className="loading-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="error-state">
            <div className="error-emoji">😕</div>
            <h3>Something went wrong</h3>
            <p>{error?.response?.data?.error || 'Could not load itineraries'}</p>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🗺️</div>
            <h3>No itineraries match your filters</h3>
            <p>Try a different search or clear your filters.</p>
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-meta">
              <span>
                <strong>{pagination?.total}</strong> {pagination?.total === 1 ? 'itinerary' : 'itineraries'} found
              </span>
            </div>

            <div className="cards-grid">
              {itineraries.map(it => (
                <Link
                  to={`/itinerary/${it.slug || it._id}`}
                  key={it._id}
                  className="browse-card"
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
                  {it.highlight && <div className="card-highlight">✦ {it.highlight}</div>}
                  <div className="card-bottom">
                    <div>
                      <div className="card-price">${it.price}</div>
                      <div className="card-price-sub">One-time</div>
                    </div>
                    {it.averageRating > 0 && (
                      <div className="card-rating">
                        ★ {it.averageRating.toFixed(1)}
                        <span className="card-reviews">({it.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => updateFilter('page', String(page - 1))}
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={!pagination.hasNext}
                  onClick={() => updateFilter('page', String(page + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}