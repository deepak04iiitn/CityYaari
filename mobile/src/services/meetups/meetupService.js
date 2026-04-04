import apiClient from '../api/apiClient';

export const fetchMeetups = async () => {
  try {
    const response = await apiClient.get('/meetups');
    return { success: true, meetups: response.data || [] };
  } catch (error) {
    return { success: false, meetups: [], message: error.response?.data?.message || 'Error fetching meetups' };
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