import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { reviewApi } from '../../lib/reviewApi';
import StarRating from './StarRating';
import './ReviewForm.css';

/**
 * Shows a review form if the user owns the itinerary but hasn't reviewed it.
 * Shows their existing review with edit/delete if they have.
 * Hides itself entirely if they don't own the itinerary.
 *
 * Pass `userOwnsIt={true}` only when an Order exists for this buyer.
 */
export default function ReviewForm({ itineraryId, userOwnsIt }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  // Fetch current user's existing review (if any)
  const { data: myReviewData, isLoading } = useQuery({
    queryKey: ['my-review', itineraryId],
    queryFn: () => reviewApi.getMine(itineraryId),
    enabled: !!userOwnsIt,
  });

  const existingReview = myReviewData?.review;

  // Populate form when entering edit mode
  useEffect(() => {
    if (isEditing && existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  }, [isEditing, existingReview]);

  // ─── MUTATIONS ───
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['my-review', itineraryId] });
    queryClient.invalidateQueries({ queryKey: ['reviews', itineraryId] });
    queryClient.invalidateQueries({ queryKey: ['itinerary'] });
  };

  const createMutation = useMutation({
    mutationFn: () => reviewApi.create(itineraryId, { rating, comment }),
    onSuccess: () => {
      invalidateAll();
      setRating(0);
      setComment('');
      setError(null);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to submit review');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => reviewApi.update(existingReview._id, { rating, comment }),
    onSuccess: () => {
      invalidateAll();
      setIsEditing(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update review');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewApi.remove(existingReview._id),
    onSuccess: () => {
      invalidateAll();
      setIsEditing(false);
    },
  });

  // ─── HIDDEN IF NOT OWNER ───
  if (!userOwnsIt) return null;

  // ─── LOADING ───
  if (isLoading) {
    return (
      <div className="rf-card">
        <div className="rf-skeleton" />
      </div>
    );
  }

  // ─── EXISTING REVIEW (READ MODE) ───
  if (existingReview && !isEditing) {
    return (
      <div className="rf-card rf-existing">
        <div className="rf-header">
          <div>
            <div className="rf-existing-label">Your review</div>
            <StarRating value={existingReview.rating} readOnly size={22} />
          </div>
          <div className="rf-existing-actions">
            <button className="rf-edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            <button
              className="rf-delete-btn"
              onClick={() => {
                if (window.confirm('Delete your review?')) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        {existingReview.comment && (
          <p className="rf-existing-comment">{existingReview.comment}</p>
        )}
        <div className="rf-existing-date">
          Posted {new Date(existingReview.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    );
  }

  // ─── EDIT OR CREATE FORM ───
  const isUpdating = isEditing && existingReview;
  const mutation = isUpdating ? updateMutation : createMutation;

  return (
    <div className="rf-card">
      <h3 className="rf-title">
        {isUpdating ? 'Edit your review' : 'Share your experience'}
      </h3>
      <p className="rf-sub">
        {isUpdating
          ? 'Update your rating or comment.'
          : 'Help other travelers by leaving an honest review.'}
      </p>

      <div className="rf-rating-row">
        <span className="rf-rating-label">Your rating</span>
        <StarRating value={rating} onChange={setRating} size={32} />
      </div>

      <textarea
        className="rf-textarea"
        placeholder="Tell others what was great (or what could be better)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={1000}
      />
      <div className="rf-char-count">{comment.length} / 1000</div>

      {error && <div className="rf-error">{error}</div>}

      <div className="rf-actions">
        {isUpdating && (
          <button
            className="rf-cancel"
            onClick={() => { setIsEditing(false); setError(null); }}
          >
            Cancel
          </button>
        )}
        <button
          className="rf-submit"
          onClick={() => mutation.mutate()}
          disabled={rating === 0 || mutation.isPending}
        >
          {mutation.isPending
            ? 'Submitting...'
            : isUpdating
              ? 'Save changes'
              : 'Post review →'}
        </button>
      </div>
    </div>
  );
}