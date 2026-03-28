import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.31.65:5000/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const searchUsers = async (query, page = 1, limit = 5) => {
  if (!query) return { users: [], hasMore: false };
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/users/search`, {
      headers,
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error?.response?.data || error.message);
    return { users: [], hasMore: false };
  }
};

export const getUserProfile = async (username) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/users/${username}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error?.response?.data || error.message);
    return null;
  }
};