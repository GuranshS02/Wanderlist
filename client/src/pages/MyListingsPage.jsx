import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itineraryApi } from '../lib/itineraryApi';
import useAuthStore from '../store/authStore';
import './MyListingsPage.css';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ─── FETCH MY LISTINGS ───
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => itineraryApi.myListings(),
    enabled: isAuthenticated,
  });

  // ─── DELETE MUTATION ───
  const deleteMutation = useMutation({
    mutationFn: (id) => itineraryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setConfirmDelete(null);
    },
  });

  // ─── AUTH GUARD ───
  if (!isAuthenticated) {
    return (
      <div className="ml-page ml-locked">
        <div className="ml-locked-card">
          <div className="ml-locked-icon">🔐</div>
          <h2>Log in to see your listings</h2>
          <Link to="/login" className="ml-locked-btn">Log in →</Link>
        </div>
      </div>
    );
  }

  const allItineraries = data?.itineraries || [];

  // Filter by tab
  const filteredItineraries = allItineraries.filter(it => {
    if (activeTab === 'all') return it.status !== 'archived';
    if (activeTab === 'published') return it.status === 'published';
    if (activeTab === 'drafts') return it.status === 'draft';
    return true;
  });

  // Compute summary stats
  const stats = {
    total: allItineraries.filter(it => it.status !== 'archived').length,
    published: allItineraries.filter(it => it.status === 'published').length,
    drafts: allItineraries.filter(it => it.status === 'draft').length,
    sales: allItineraries.reduce((sum, it) => sum + (it.salesCount || 0), 0),
    earnings: allItineraries.reduce((sum, it) =>
      sum + (it.salesCount || 0) * (it.price || 0) * 0.85, 0
    ),
  };

  return (
    <div className="ml-page">
      {/* ─── HEADER ─── */}
      <header className="ml-header">
        <div className="ml-header-inner">
          <div>
            <span className="ml-eyebrow">Creator dashboard</span>
            <h1 className="ml-title">Your <em>listings</em></h1>
            <p className="ml-sub">Welcome back, {user?.name?.split(' ')[0]} — here's how your travel plans are doing.</p>
          </div>
          <Link to="/create" className="ml-new-btn">+ New itinerary</Link>
        </div>
      </header>

      {/* ─── STATS ─── */}
      <section className="ml-stats">
        <div className="ml-stat-grid">
          <div className="ml-stat-card">
            <div className="ml-stat-label">Total listings</div>
            <div className="ml-stat-value">{stats.total}</div>
          </div>
          <div className="ml-stat-card">
            <div className="ml-stat-label">Published</div>
            <div className="ml-stat-value">{stats.published}</div>
          </div>
          <div className="ml-stat-card">
            <div className="ml-stat-label">Drafts</div>
            <div className="ml-stat-value">{stats.drafts}</div>
          </div>
          <div className="ml-stat-card ml-stat-highlight">
            <div className="ml-stat-label">Total sales</div>
            <div className="ml-stat-value">{stats.sales}</div>
          </div>
          <div className="ml-stat-card ml-stat-highlight">
            <div className="ml-stat-label">Earnings (85%)</div>
            <div className="ml-stat-value">
              <span className="ml-stat-currency">$</span>
              {stats.earnings.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TABS ─── */}
      <section className="ml-tabs">
        {[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'drafts', label: 'Drafts' },
        ].map(tab => (
          <button
            key={tab.value}
            className={`ml-tab${activeTab === tab.value ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {tab.value === 'all' && (
              <span className="ml-tab-count">{stats.total}</span>
            )}
            {tab.value === 'published' && (
              <span className="ml-tab-count">{stats.published}</span>
            )}
            {tab.value === 'drafts' && (
              <span className="ml-tab-count">{stats.drafts}</span>
            )}
          </button>
        ))}
      </section>

      {/* ─── LISTINGS ─── */}
      <section className="ml-results">
        {isLoading ? (
          <div className="ml-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ml-skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="ml-empty">
            <div className="ml-empty-icon">⚠️</div>
            <h3>Couldn't load your listings</h3>
            <p>Try refreshing the page.</p>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="ml-empty">
            <div className="ml-empty-icon">🌿</div>
            <h3>
              {activeTab === 'all' && 'No listings yet'}
              {activeTab === 'published' && 'Nothing published yet'}
              {activeTab === 'drafts' && 'No drafts'}
            </h3>
            <p>
              {activeTab === 'all' && "Create your first itinerary and start earning."}
              {activeTab === 'published' && "Publish a draft to see it here."}
              {activeTab === 'drafts' && "Save an itinerary as a draft to come back to it later."}
            </p>
            {activeTab !== 'drafts' && (
              <Link to="/create" className="ml-empty-btn">+ Create itinerary</Link>
            )}
          </div>
        ) : (
          <div className="ml-grid">
            {filteredItineraries.map(it => (
              <div key={it._id} className="ml-card">
                <Link to={`/itinerary/${it.slug || it._id}`} className="ml-card-link">
                  <div className="ml-card-img-wrap">
                    <img
                      src={it.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'}
                      alt={it.title}
                      className="ml-card-img"
                    />
                    <div className={`ml-status ml-status-${it.status}`}>
                      {it.status === 'published' ? '● Live' : '○ Draft'}
                    </div>
                  </div>
                </Link>

                <div className="ml-card-body">
                  <div className="ml-card-loc">
                    {it.flag} {it.city ? `${it.city}, ${it.country}` : it.country}
                  </div>
                  <Link to={`/itinerary/${it.slug || it._id}`} className="ml-card-title-link">
                    <h3 className="ml-card-title">{it.title}</h3>
                  </Link>

                  <div className="ml-card-metrics">
                    <div className="ml-metric">
                      <span className="ml-metric-label">Price</span>
                      <span className="ml-metric-value">${it.price}</span>
                    </div>
                    <div className="ml-metric">
                      <span className="ml-metric-label">Sales</span>
                      <span className="ml-metric-value">{it.salesCount || 0}</span>
                    </div>
                    <div className="ml-metric">
                      <span className="ml-metric-label">Earned</span>
                      <span className="ml-metric-value">
                        ${((it.salesCount || 0) * (it.price || 0) * 0.85).toFixed(2)}
                      </span>
                    </div>
                  </div>

                <div className="ml-card-actions">
  <Link
    to={`/itinerary/${it.slug || it._id}`}
    className="ml-action ml-action-view"
  >
    View
  </Link>
  <Link
    to={`/edit/${it._id}`}
    className="ml-action ml-action-edit"
  >
    Edit
  </Link>
  <button
    className="ml-action ml-action-delete"
    onClick={() => setConfirmDelete(it)}
  >
    Archive
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {confirmDelete && (
        <div className="ml-modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ml-modal-icon">🗑️</div>
            <h3>Archive this itinerary?</h3>
            <p>
              "<strong>{confirmDelete.title}</strong>" will be hidden from the marketplace.
              You can still see it in your dashboard, but no one else will.
            </p>
            <div className="ml-modal-actions">
              <button
                className="ml-modal-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="ml-modal-confirm"
                onClick={() => deleteMutation.mutate(confirmDelete._id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Archiving...' : 'Yes, archive it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}