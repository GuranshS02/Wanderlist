import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itineraryApi } from '../lib/itineraryApi';
import useAuthStore from '../store/authStore';
import './CreateItineraryPage.css';

// ─── VALIDATION ─────────────────────────────────────
const activitySchema = z.object({
  time: z.string().optional(),
  title: z.string().min(1, 'Activity needs a title'),
  description: z.string().optional(),
  location: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  type: z.enum(['food', 'sight', 'activity', 'transport', 'accommodation', 'tip', 'other']).optional(),
});

const daySchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(1, 'Day needs a title'),
  summary: z.string().optional(),
  activities: z.array(activitySchema).optional(),
});

const itinerarySchema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(120),
  description: z.string().min(50, 'At least 50 characters').max(2000),
  highlight: z.string().max(120).optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().optional(),
  flag: z.string().optional(),
  days: z.coerce.number().min(1).max(60),
  price: z.coerce.number().min(0).max(500),
  coverImage: z.string().optional(),
  bestSeason: z.enum(['spring', 'summer', 'fall', 'winter', 'year-round']).optional(),
  estimatedBudget: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  dayPlans: z.array(daySchema).optional(),
  status: z.enum(['draft', 'published']),
});

const AVAILABLE_TAGS = [
  'Culture', 'Adventure', 'Budget', 'Luxury', 'Coast',
  'Nature', 'Food', 'Family', 'Solo', 'Romantic',
  'Trekking', 'Photography', 'Desert', 'Road Trip',
];

const ACTIVITY_TYPES = [
  { value: 'food', label: '🍜 Food' },
  { value: 'sight', label: '🏛️ Sight' },
  { value: 'activity', label: '🎢 Activity' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏨 Stay' },
  { value: 'tip', label: '💡 Tip' },
  { value: 'other', label: '📌 Other' },
];

export default function CreateItineraryPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [submitError, setSubmitError] = useState(null);

  // ─── EDIT MODE DETECTION ─────────────────────────
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const queryClient = useQueryClient();

  // Fetch existing itinerary in edit mode
  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['itinerary-edit', editId],
    queryFn: () => itineraryApi.get(editId),
    enabled: isEditMode,
  });

  const existingItinerary = existingData?.itinerary;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      title: '',
      description: '',
      highlight: '',
      country: '',
      city: '',
      flag: '🌍',
      days: 1,
      price: 15,
      coverImage: '',
      bestSeason: 'year-round',
      tags: [],
      dayPlans: [
        { dayNumber: 1, title: '', summary: '', activities: [] },
      ],
      status: 'draft',
    },
  });

  // useFieldArray gives us reactive add/remove methods for the dayPlans array
  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({ control, name: 'dayPlans' });

  // ─── POPULATE FORM IN EDIT MODE ──────────────────
  useEffect(() => {
    if (isEditMode && existingItinerary) {
      reset({
        title: existingItinerary.title || '',
        description: existingItinerary.description || '',
        highlight: existingItinerary.highlight || '',
        country: existingItinerary.country || '',
        city: existingItinerary.city || '',
        flag: existingItinerary.flag || '🌍',
        days: existingItinerary.days || 1,
        price: existingItinerary.price ?? 15,
        coverImage: existingItinerary.coverImage || '',
        bestSeason: existingItinerary.bestSeason || 'year-round',
        estimatedBudget: existingItinerary.estimatedBudget,
        tags: existingItinerary.tags || [],
        dayPlans: existingItinerary.dayPlans?.length
          ? existingItinerary.dayPlans
          : [{ dayNumber: 1, title: '', summary: '', activities: [] }],
        status: existingItinerary.status || 'draft',
      });
    }
  }, [isEditMode, existingItinerary, reset]);

  const watchedTags = watch('tags') || [];
  const watchedCoverImage = watch('coverImage');

  const toggleTag = (tag) => {
    const current = watchedTags;
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    setValue('tags', next, { shouldValidate: true });
  };

  // ─── MUTATIONS ───────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload) => itineraryApi.create(payload),
    onSuccess: (data) => {
      const itinerary = data.itinerary;
      navigate(`/itinerary/${itinerary.slug || itinerary._id}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to create itinerary';
      setSubmitError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => itineraryApi.update(editId, payload),
    onSuccess: (data) => {
      const itinerary = data.itinerary;
      // Invalidate caches so the detail page and dashboard show fresh data
      queryClient.invalidateQueries({ queryKey: ['itinerary', editId] });
      queryClient.invalidateQueries({ queryKey: ['itinerary-edit', editId] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      navigate(`/itinerary/${itinerary.slug || itinerary._id}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to update itinerary';
      setSubmitError(msg);
    },
  });

  const activeMutation = isEditMode ? updateMutation : createMutation;

  const onSubmit = (data, e) => {
    const action = e.nativeEvent.submitter?.dataset?.action || 'draft';
    setSubmitError(null);
    activeMutation.mutate({
      ...data,
      status: action === 'publish' ? 'published' : 'draft',
    });
  };

  // ─── AUTH GUARD ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="ci-page ci-locked">
        <div className="ci-locked-card">
          <div className="ci-locked-icon">🔐</div>
          <h2>Log in to create itineraries</h2>
          <p>Share your travel plans and earn from every sale.</p>
          <Link to="/login" className="ci-locked-btn">Log in →</Link>
        </div>
      </div>
    );
  }

  // ─── LOADING STATE (edit mode) ──────────────────
  if (isEditMode && isLoadingExisting) {
    return (
      <div className="ci-page ci-locked">
        <div className="ci-locked-card">
          <div className="ci-locked-icon">⏳</div>
          <h2>Loading your itinerary...</h2>
        </div>
      </div>
    );
  }

  // ─── NOT-FOUND STATE (edit mode) ────────────────
  if (isEditMode && !isLoadingExisting && !existingItinerary) {
    return (
      <div className="ci-page ci-locked">
        <div className="ci-locked-card">
          <div className="ci-locked-icon">🤷</div>
          <h2>Itinerary not found</h2>
          <p>It may have been removed, or you may not have access to it.</p>
          <Link to="/my-listings" className="ci-locked-btn">← Back to my listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ci-page">
      <header className="ci-header">
        <div className="ci-header-inner">
          <div>
            <span className="ci-eyebrow">
              {isEditMode ? 'Editing' : 'For creators'}
            </span>
            <h1 className="ci-title">
              {isEditMode ? (
                <>Edit your <em>itinerary</em></>
              ) : (
                <>Create a new <em>itinerary</em></>
              )}
            </h1>
            <p className="ci-sub">
              {isEditMode
                ? 'Update any field and save. Travelers who already bought this plan will see your changes.'
                : 'Share your trip. Help others travel better. Earn 85% of every sale.'}
            </p>
          </div>
          <div className="ci-author">
            <div className="ci-avatar">{user?.name?.charAt(0).toUpperCase() || 'C'}</div>
            <div>
              <div className="ci-author-name">{user?.name}</div>
              <div className="ci-author-role">Creator</div>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="ci-form">

        {/* ─── SECTION: BASICS ─── */}
        <section className="ci-section">
          <div className="ci-section-head">
            <span className="ci-section-num">01</span>
            <div>
              <h2 className="ci-section-title">The basics</h2>
              <p className="ci-section-sub">Tell us what this trip is and where it goes.</p>
            </div>
          </div>

          <div className="ci-grid">
            <div className="ci-field ci-full">
              <label>Trip title</label>
              <input
                {...register('title')}
                placeholder="e.g. Sacred Temples of Kyoto"
                className={errors.title ? 'input-err' : ''}
              />
              {errors.title && <span className="ci-err">{errors.title.message}</span>}
            </div>

            <div className="ci-field ci-full">
              <label>One-line highlight (optional)</label>
              <input
                {...register('highlight')}
                placeholder="e.g. Cherry blossom routes inside"
              />
              <span className="ci-hint">A short phrase that grabs attention on cards</span>
            </div>

            <div className="ci-field">
              <label>Country</label>
              <input
                {...register('country')}
                placeholder="e.g. Japan"
                className={errors.country ? 'input-err' : ''}
              />
              {errors.country && <span className="ci-err">{errors.country.message}</span>}
            </div>

            <div className="ci-field">
              <label>City (optional)</label>
              <input {...register('city')} placeholder="e.g. Kyoto" />
            </div>

            <div className="ci-field">
              <label>Flag emoji</label>
              <input {...register('flag')} placeholder="🇯🇵" maxLength={4} />
              <span className="ci-hint">Pick the country flag</span>
            </div>

            <div className="ci-field">
              <label>Best season</label>
              <select {...register('bestSeason')}>
                <option value="year-round">Year-round</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
              </select>
            </div>

            <div className="ci-field ci-full">
              <label>Full description</label>
              <textarea
                {...register('description')}
                placeholder="Tell travelers what makes this trip special. What's included? What problem does it solve?"
                rows={5}
                className={errors.description ? 'input-err' : ''}
              />
              {errors.description && <span className="ci-err">{errors.description.message}</span>}
              <span className="ci-hint">Minimum 50 characters — this sells your plan</span>
            </div>
          </div>
        </section>

        {/* ─── SECTION: PRICING + LOGISTICS ─── */}
        <section className="ci-section">
          <div className="ci-section-head">
            <span className="ci-section-num">02</span>
            <div>
              <h2 className="ci-section-title">Pricing &amp; logistics</h2>
              <p className="ci-section-sub">How long is the trip, and what's it worth?</p>
            </div>
          </div>

          <div className="ci-grid">
            <div className="ci-field">
              <label>Number of days</label>
              <input
                type="number"
                {...register('days')}
                min={1}
                max={60}
                className={errors.days ? 'input-err' : ''}
              />
              {errors.days && <span className="ci-err">{errors.days.message}</span>}
            </div>

            <div className="ci-field">
              <label>Price (USD)</label>
              <div className="ci-input-prefix">
                <span>$</span>
                <input
                  type="number"
                  step="1"
                  {...register('price')}
                  min={0}
                  max={500}
                  className={errors.price ? 'input-err' : ''}
                />
              </div>
              {errors.price && <span className="ci-err">{errors.price.message}</span>}
              <span className="ci-hint">You keep 85% · Wanderlist takes 15%</span>
            </div>

            <div className="ci-field">
              <label>Estimated trip budget (USD)</label>
              <div className="ci-input-prefix">
                <span>$</span>
                <input
                  type="number"
                  step="50"
                  {...register('estimatedBudget')}
                  placeholder="e.g. 2400"
                  min={0}
                />
              </div>
              <span className="ci-hint">What the traveler will spend on the actual trip</span>
            </div>

            <div className="ci-field ci-full">
              <label>Cover image URL</label>
              <input
                {...register('coverImage')}
                placeholder="https://images.unsplash.com/..."
              />
              <span className="ci-hint">A landscape photo that captures the vibe</span>
              {watchedCoverImage && (
                <div className="ci-cover-preview">
                  <img src={watchedCoverImage} alt="Cover preview" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── SECTION: TAGS ─── */}
        <section className="ci-section">
          <div className="ci-section-head">
            <span className="ci-section-num">03</span>
            <div>
              <h2 className="ci-section-title">Tags</h2>
              <p className="ci-section-sub">Pick all that apply — helps people find your trip.</p>
            </div>
          </div>

          <div className="ci-tags">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`ci-tag${watchedTags.includes(tag) ? ' active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* ─── SECTION: DAY-BY-DAY PLAN ─── */}
        <section className="ci-section">
          <div className="ci-section-head">
            <span className="ci-section-num">04</span>
            <div>
              <h2 className="ci-section-title">Day-by-day plan</h2>
              <p className="ci-section-sub">The actual itinerary content — what travelers are paying for.</p>
            </div>
          </div>

          <div className="ci-days">
            {dayFields.map((day, dayIndex) => (
              <DayCard
                key={day.id}
                dayIndex={dayIndex}
                control={control}
                register={register}
                errors={errors}
                onRemove={() => removeDay(dayIndex)}
                canRemove={dayFields.length > 1}
              />
            ))}

            <button
              type="button"
              className="ci-add-day"
              onClick={() => appendDay({
                dayNumber: dayFields.length + 1,
                title: '',
                summary: '',
                activities: [],
              })}
            >
              + Add another day
            </button>
          </div>
        </section>

        {/* ─── ERROR + SUBMIT ─── */}
        {submitError && <div className="ci-submit-err">{submitError}</div>}

        <div className="ci-submit-row">
          {isEditMode && existingItinerary && (
            <Link
              to={`/itinerary/${existingItinerary.slug || existingItinerary._id}`}
              className="ci-btn-cancel"
            >
              Cancel
            </Link>
          )}
          <button
            type="submit"
            data-action="draft"
            className="ci-btn-draft"
            disabled={activeMutation.isPending}
          >
            {activeMutation.isPending ? 'Saving...' : 'Save as draft'}
          </button>
          <button
            type="submit"
            data-action="publish"
            className="ci-btn-publish"
            disabled={activeMutation.isPending}
          >
            {activeMutation.isPending
              ? (isEditMode ? 'Saving...' : 'Publishing...')
              : (isEditMode ? 'Save changes →' : 'Publish itinerary →')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── SUB-COMPONENT: DAY CARD ─────────────────────────
function DayCard({ dayIndex, control, register, errors, onRemove, canRemove }) {
  const {
    fields: activities,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({
    control,
    name: `dayPlans.${dayIndex}.activities`,
  });

  return (
    <div className="day-card">
      <div className="day-card-head">
        <input
          type="number"
          {...register(`dayPlans.${dayIndex}.dayNumber`)}
          className="day-num-input"
          min={1}
        />
        <input
          {...register(`dayPlans.${dayIndex}.title`)}
          placeholder="Day title (e.g. Arrival in Kyoto)"
          className="day-title-input"
        />
        {canRemove && (
          <button type="button" className="day-remove" onClick={onRemove}>×</button>
        )}
      </div>

      <textarea
        {...register(`dayPlans.${dayIndex}.summary`)}
        placeholder="Short summary of this day"
        rows={2}
        className="day-summary"
      />

      {activities.length > 0 && (
        <div className="activities-list">
          {activities.map((activity, actIndex) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-grid">
                <input
                  {...register(`dayPlans.${dayIndex}.activities.${actIndex}.time`)}
                  placeholder="9:00 AM"
                  className="activity-time-input"
                />
                <select
                  {...register(`dayPlans.${dayIndex}.activities.${actIndex}.type`)}
                  className="activity-type-input"
                >
                  {ACTIVITY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  {...register(`dayPlans.${dayIndex}.activities.${actIndex}.title`)}
                  placeholder="What to do (e.g. Visit Fushimi Inari shrine)"
                  className="activity-title-input"
                />
                <div className="activity-cost-wrap">
                  <span>$</span>
                  <input
                    type="number"
                    {...register(`dayPlans.${dayIndex}.activities.${actIndex}.cost`)}
                    placeholder="0"
                    min={0}
                    className="activity-cost-input"
                  />
                </div>
                <input
                  {...register(`dayPlans.${dayIndex}.activities.${actIndex}.location`)}
                  placeholder="📍 Location (optional)"
                  className="activity-loc-input"
                />
                <button
                  type="button"
                  className="activity-remove"
                  onClick={() => removeActivity(actIndex)}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="add-activity"
        onClick={() => appendActivity({
          time: '',
          title: '',
          description: '',
          location: '',
          cost: 0,
          type: 'sight',
        })}
      >
        + Add activity
      </button>
    </div>
  );
}