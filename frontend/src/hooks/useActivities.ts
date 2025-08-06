import { useState, useEffect, useCallback } from 'react';
import { message } from '../utils/messageUtils';
import { activityApi } from '../services/api';

interface Activity {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  price: number;
  image: string;
  status: string;
  organizer: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActivityFilters {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  sort?: string;
}

// 活动Hook
export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({});

  // 获取所有活动
  const fetchActivities = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.getAllActivities(currentFilters);
      setActivities(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取活动列表失败');
      message.error(err.response?.data?.message || '获取活动列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时获取活动
  useEffect(() => {
    fetchActivities(filters);
  }, [fetchActivities, filters]);

  // 获取单个活动
  const fetchActivityById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.getActivityById(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取活动详情失败');
      message.error(err.response?.data?.message || '获取活动详情失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 创建活动
  const createActivity = async (activityData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.createActivity(activityData);
      message.success('活动创建成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '创建活动失败');
      message.error(err.response?.data?.message || '创建活动失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新活动
  const updateActivity = async (id: string, activityData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.updateActivity(id, activityData);
      message.success('活动更新成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '更新活动失败');
      message.error(err.response?.data?.message || '更新活动失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 删除活动
  const deleteActivity = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await activityApi.deleteActivity(id);
      message.success('活动删除成功');
      // 更新本地状态
      setActivities(activities.filter(activity => activity._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || '删除活动失败');
      message.error(err.response?.data?.message || '删除活动失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取用户创建的活动
  const fetchUserActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityApi.getUserActivities();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取我的活动失败');
      message.error(err.response?.data?.message || '获取我的活动失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新筛选条件
  const updateFilters = (newFilters: ActivityFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 获取活动统计数据
  const fetchActivityStats = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      // 获取所有活动数据
      const response = await activityApi.getAllActivities({});
      const allActivities = response.data;
      
      // 计算统计数据
      const totalActivities = allActivities.length;
      const pendingActivities = allActivities.filter((activity: any) => 
        activity.status === 'pending' || activity.status === 'draft'
      ).length;
      
      return {
        totalActivities,
        pendingActivities
      };
    } catch (err: any) {
      setError(err.response?.data?.message || '获取活动统计数据失败');
      message.error(err.response?.data?.message || '获取活动统计数据失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    error,
    filters,
    fetchActivities,
    fetchActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
    fetchUserActivities,
    updateFilters,
    fetchActivityStats
  };
};

export default useActivities;