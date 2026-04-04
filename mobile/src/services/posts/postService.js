import apiClient from '../api/apiClient';

export const fetchPosts = async (filters = {}) => {
  try {
    const response = await apiClient.get('/posts', { params: filters });
    return { success: true, posts: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch posts',
    };
  }
};

export const toggleLike = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error toggling like' };
  }
};

export const toggleDislike = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/dislike`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error toggling dislike' };
  }
};

export const toggleSave = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/save`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error toggling save' };
  }
};

export const updatePost = async (postId, payload) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error updating post' };
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error deleting post' };
  }
};