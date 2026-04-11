import apiClient from '../api/apiClient';

export const fetchMeetups = async (params = {}) => {
  try {
    const response = await apiClient.get('/meetups', { params });
    return { success: true, meetups: response.data || [] };
  } catch (error) {
    return { success: false, meetups: [], message: error.response?.data?.message || 'Error fetching meetups' };
  }
};

export const fetchMeetupById = async (id) => {
  try {
    const response = await apiClient.get(`/meetups/${id}`);
    return { success: true, meetup: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error fetching meetup' };
  }
};

export const fetchMyMeetups = async () => {
  try {
    const response = await apiClient.get('/meetups/my');
    return { success: true, meetups: response.data || [] };
  } catch (error) {
    return { success: false, meetups: [], message: error.response?.data?.message || 'Error fetching my meetups' };
  }
};

export const createMeetupWithImage = async (formData) => {
  try {
    const response = await apiClient.post('/meetups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error creating meetup' };
  }
};

export const createMeetup = async (payload) => {
  try {
    const response = await apiClient.post('/meetups', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error creating meetup' };
  }
};

export const updateMeetup = async (meetupId, payload) => {
  try {
    const response = await apiClient.put(`/meetups/${meetupId}`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error updating meetup' };
  }
};

export const deleteMeetup = async (meetupId) => {
  try {
    const response = await apiClient.delete(`/meetups/${meetupId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error deleting meetup' };
  }
};

export const rsvpMeetup = async (meetupId) => {
  try {
    const response = await apiClient.post(`/meetups/${meetupId}/rsvp`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error joining meetup' };
  }
};

export const leaveMeetup = async (meetupId) => {
  try {
    const response = await apiClient.delete(`/meetups/${meetupId}/rsvp`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error leaving meetup' };
  }
};
