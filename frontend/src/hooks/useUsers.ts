import { useState, useCallback } from 'react';
import { message } from '../utils/messageUtils';
import { userApi, api } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户管理Hook（管理员使用）
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有用户
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取用户列表失败');
      message.error(err.response?.data?.message || '获取用户列表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取用户详情
  const fetchUserById = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // 使用api.get直接调用API端点，因为userApi中没有getUserById方法
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取用户详情失败');
      message.error(err.response?.data?.message || '获取用户详情失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新用户角色
  const updateUserRole = async (userId: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.updateUserRole(userId, role);
      // 更新本地状态
      setUsers(prev =>
        prev.map(user => (user._id === userId ? { ...user, role } : user))
      );
      message.success('用户角色更新成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '更新用户角色失败');
      message.error(err.response?.data?.message || '更新用户角色失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const deleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await userApi.deleteUser(userId);
      // 更新本地状态
      setUsers(prev => prev.filter(user => user._id !== userId));
      message.success('用户删除成功');
    } catch (err: any) {
      setError(err.response?.data?.message || '删除用户失败');
      message.error(err.response?.data?.message || '删除用户失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取用户统计数据
  const fetchUserStats = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      // 获取所有用户数据
      const allUsers = await fetchAllUsers();
      
      // 计算统计数据
      const totalUsers = allUsers.length;
      // 假设活跃用户是最近30天内注册的用户
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = allUsers.filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= thirtyDaysAgo;
      }).length;
      
      return {
        totalUsers,
        activeUsers
      };
    } catch (err: any) {
      setError(err.response?.data?.message || '获取用户统计数据失败');
      message.error(err.response?.data?.message || '获取用户统计数据失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    fetchUserById,
    updateUserRole,
    deleteUser,
    fetchUserStats
  };
};

export default useUsers;