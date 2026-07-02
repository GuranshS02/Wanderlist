import api from './api';

export const orderApi = {
  // Get the current user's purchased itineraries
  myOrders: async () => {
    const { data } = await api.get('/orders/me');
    return data;
  },

  // Get a single order by ID
  get: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  // TEMPORARY: claim an itinerary for free (test mode)
  claim: async (itineraryId) => {
    const { data } = await api.post(`/orders/claim/${itineraryId}`);
    return data;
  },
};