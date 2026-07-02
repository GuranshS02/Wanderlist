import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '../../lib/reviewApi';
import StarRating from './StarRating';
import './ReviewList.css';

export default function ReviewList({ itineraryId, averageRating, reviewCount }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', itineraryId],
    queryFn: () => reviewApi.list(itineraryId),
  });

  const reviews = data?.reviews || [];
  const distribution = data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = reviews.length || reviewCount || 0;

  if (isLoading) {
    return <div className="rl-skeleton" />;
  }

  if (totalReviews === 0) {
    return (
      <div className="rl-empty">
        <div className="rl-empty-icon">⭐</div>
        <h3>No reviews yet</h3>
        <p>Be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <div className="rl-wrapper">
      {/* ─── SUMMARY ─── */}
      <div className="rl-summary">
        <div className="rl-summary-score">
          <div className="rl-score-number">
            {averageRating ? averageRating.toFixed(1) : '—'}
          </div>
          <StarRating
            value={Math.round(averageRating || 0)}
            readOnly
            size={20}
          />
          <div className="rl-score-count">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        <div className="rl-summary-bars">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="rl-bar-row">
                <span className="rl-bar-label">{star} ★</span>
                <div className="rl-bar-track">
                  <div className="rl-bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="rl-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── REVIEW LIST ─── */}
      <div className="rl-list">
        {reviews.map(review => (
          <div key={review._id} className="rl-item">
            <div className="rl-item-head">
              <div className="rl-avatar">
                {review.buyerName?.charAt(0).toUpperCase() ||
                 review.buyer?.name?.charAt(0).toUpperCase() ||
                 '?'}
              </div>
              <div className="rl-item-meta">
                <div className="rl-item-name">
                  {review.buyerName || review.buyer?.name || 'Anonymous'}
                </div>
                <div className="rl-item-rating-row">
                  <StarRating value={review.rating} readOnly size={14} />
                  <span className="rl-item-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="rl-item-comment">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}