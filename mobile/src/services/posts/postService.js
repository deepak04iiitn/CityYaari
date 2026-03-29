import apiClient from '../api/apiClient';

export const fetchPosts = async () => {
  try {
    const response = await apiClient.get('/posts');
    return { success: true, posts: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch posts',
    };
  }
};