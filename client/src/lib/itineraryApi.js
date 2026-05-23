import api from './api';

export const itineraryApi = {
  // List itineraries with filters
  list: async (params = {}) => {
    const { data } = await api.get('/itineraries', { params });
    return data;
  },

  // Get one itinerary by slug or ID
  get: async (idOrSlug) => {
    const { data } = await api.get(`/itineraries/${idOrSlug}`);
    return data;
  },

  // Create new itinerary (auth required)
  create: async (payload) => {
    const { data } = await api.post('/itineraries', payload);
    return data;
  },

  // Update one (auth required, owner only)
  update: async (id, payload) => {
    const { data } = await api.put(`/itineraries/${id}`, payload);
    return data;
  },

  // Delete one (auth required, owner only)
  remove: async (id) => {
    const { data } = await api.delete(`/itineraries/${id}`);
    return data;
  },

  // Get current user's itineraries
  myListings: async (params = {}) => {
    const { data } = await api.get('/itineraries/me/listings', { params });
    return data;
  },
};