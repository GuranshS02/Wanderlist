import api from './api';

export const reviewApi = {
  // List all reviews for an itinerary (public)
  list: async (itineraryId) => {
    const { data } = await api.get(`/itineraries/${itineraryId}/reviews`);
    return data;
  },

  // Get the current user's review for this itinerary (if any)
  getMine: async (itineraryId) => {
    const { data } = await api.get(`/itineraries/${itineraryId}/my-review`);
    return data;
  },

  // Create a new review
  create: async (itineraryId, { rating, comment }) => {
    const { data } = await api.post(`/itineraries/${itineraryId}/reviews`, { rating, comment });
    return data;
  },

  // Update existing review
  update: async (reviewId, { rating, comment }) => {
    const { data } = await api.put(`/reviews/${reviewId}`, { rating, comment });
    return data;
  },

  // Delete review
  remove: async (reviewId) => {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    return data;
  },
};