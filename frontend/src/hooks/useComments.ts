import { useState, useCallback } from 'react';
import { message } from '../utils/messageUtils';
import { commentApi } from '../services/api';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
  };
  activity: string | {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
  approved?: boolean;
}

// 评论Hook
export const useComments = (activityId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取活动评论
  const fetchComments = useCallback(async () => {
    if (!activityId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await commentApi.getActivityComments(activityId);
      setComments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取评论失败');
      message.error(err.response?.data?.message || '获取评论失败');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // 获取所有评论（管理员）
  const fetchAllComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentApi.getAllComments();
      setComments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取评论失败');
      message.error(err.response?.data?.message || '获取评论失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 添加评论
  const addComment = async (content: string, rating: number = 5) => {
    if (!activityId) {
      message.error('活动ID不能为空');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await commentApi.createComment(activityId, content, rating);
      // 更新本地状态
      setComments(prev => [response.data, ...prev]);
      message.success('评论发布成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '发布评论失败');
      message.error(err.response?.data?.message || '发布评论失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const deleteComment = async (commentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await commentApi.deleteComment(commentId);
      // 更新本地状态
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      message.success('评论删除成功');
    } catch (err: any) {
      setError(err.response?.data?.message || '删除评论失败');
      message.error(err.response?.data?.message || '删除评论失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新评论
  const updateComment = async (commentId: string, content: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentApi.updateComment(commentId, content);
      // 更新本地状态
      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId ? { ...comment, content, updatedAt: new Date().toISOString() } : comment
        )
      );
      message.success('评论更新成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '更新评论失败');
      message.error(err.response?.data?.message || '更新评论失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 审核评论（管理员）
  const approveComment = async (commentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await commentApi.approveComment(commentId);
      // 更新本地状态
      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId ? { ...comment, approved: true } : comment
        )
      );
      message.success('评论已审核通过');
    } catch (err: any) {
      setError(err.response?.data?.message || '审核评论失败');
      message.error(err.response?.data?.message || '审核评论失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    fetchAllComments,
    addComment,
    deleteComment,
    updateComment,
    approveComment,
  };
};

export default useComments;