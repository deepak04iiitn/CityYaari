import apiClient from '../api/apiClient';

export const fetchComments = async (postId) => {
  try {
    const response = await apiClient.get(`/comments/post/${postId}`);
    return { success: true, comments: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch comments',
    };
  }
};

export const addComment = async (postId, content) => {
  try {
    const response = await apiClient.post(`/comments/post/${postId}`, { content });
    return { success: true, comment: response.data.comment };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to add comment' };
  }
};

export const replyToComment = async (commentId, content) => {
  try {
    const response = await apiClient.post(`/comments/${commentId}/reply`, { content });
    return { success: true, comment: response.data.comment };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to reply' };
  }
};

export const editComment = async (commentId, content) => {
  try {
    const response = await apiClient.put(`/comments/${commentId}`, { content });
    return { success: true, comment: response.data.comment };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to edit comment' };
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete comment' };
  }
};

export const toggleLikeComment = async (commentId) => {
  try {
    const response = await apiClient.post(`/comments/${commentId}/like`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error toggling like' };
  }
};

export const toggleDislikeComment = async (commentId) => {
  try {
    const response = await apiClient.post(`/comments/${commentId}/dislike`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error toggling dislike' };
  }
};
