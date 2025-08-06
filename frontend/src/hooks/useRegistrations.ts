import { useState, useCallback } from 'react';
import { message } from '../utils/messageUtils';
import { registrationApi } from '../services/api';

interface Registration {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  activity: {
    _id: string;
    title: string;
    date: string;
    image: string;
  };
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  registrationDate: string;
  attended: boolean;
}

// 报名Hook
export const useRegistrations = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 报名活动
  const registerForActivity = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.registerForActivity(activityId);
      message.success('报名成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '报名失败');
      message.error(err.response?.data?.message || '报名失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 取消报名
  const cancelRegistration = async (registrationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await registrationApi.cancelRegistration(registrationId);
      message.success('已取消报名');
    } catch (err: any) {
      setError(err.response?.data?.message || '取消报名失败');
      message.error(err.response?.data?.message || '取消报名失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取用户的报名
  const fetchUserRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.getUserRegistrations();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取报名记录失败');
      message.error(err.response?.data?.message || '获取报名记录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取活动的报名
  const fetchActivityRegistrations = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.getActivityRegistrations(activityId);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取活动报名记录失败');
      message.error(err.response?.data?.message || '获取活动报名记录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新报名状态（管理员/组织者）
  const updateRegistrationStatus = async (registrationId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.updateRegistrationStatus(registrationId, status);
      message.success('报名状态更新成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '更新报名状态失败');
      message.error(err.response?.data?.message || '更新报名状态失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新支付状态（管理员/组织者）
  const updatePaymentStatus = async (registrationId: string, paymentStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.updatePaymentStatus(registrationId, paymentStatus);
      message.success('支付状态更新成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '更新支付状态失败');
      message.error(err.response?.data?.message || '更新支付状态失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 删除报名（管理员/组织者）
  const deleteRegistration = async (registrationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await registrationApi.deleteRegistration(registrationId);
      message.success('报名记录删除成功');
    } catch (err: any) {
      setError(err.response?.data?.message || '删除报名记录失败');
      message.error(err.response?.data?.message || '删除报名记录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取所有报名（管理员）
  const fetchAllRegistrationsAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.getAllRegistrationsAdmin();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '获取所有报名记录失败');
      message.error(err.response?.data?.message || '获取所有报名记录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取报名列表（管理员/组织者）
  const fetchRegistrations = async (filters: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationApi.getAllRegistrationsAdmin();
      // 如果需要过滤，可以在前端进行
      const filteredRegistrations = filters ? response.data.registrations.filter((reg: any) => {
        // 根据filters实现过滤逻辑
        return true; // 默认返回所有
      }) : response.data.registrations;
      
      setRegistrations(filteredRegistrations || []);
      return { registrations: filteredRegistrations };
    } catch (err: any) {
      setError(err.response?.data?.message || '获取报名列表失败');
      message.error(err.response?.data?.message || '获取报名列表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 导出报名数据（管理员/组织者）
  const exportRegistrations = async (filters: any) => {
    setLoading(true);
    setError(null);
    try {
      // 获取所有报名数据
      const response = await registrationApi.getAllRegistrationsAdmin();
      
      // 如果需要过滤，可以在前端进行
      const filteredRegistrations = filters ? response.data.registrations.filter((reg: any) => {
        // 根据filters实现过滤逻辑
        return true; // 默认返回所有
      }) : response.data.registrations;
      
      // 返回过滤后的数据，前端可以处理导出逻辑
      return { registrations: filteredRegistrations };
    } catch (err: any) {
      setError(err.response?.data?.message || '导出报名数据失败');
      message.error(err.response?.data?.message || '导出报名数据失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取报名统计数据
  const fetchRegistrationStats = async (dateRange?: [string, string]) => {
    setLoading(true);
    setError(null);
    try {
      // 这里应该调用后端API获取统计数据，但目前后端可能没有提供该接口
      // 临时方案：获取所有报名数据，然后在前端计算统计信息
      const response = await registrationApi.getAllRegistrationsAdmin();
      const registrations = response.data.registrations || [];
      
      // 计算统计数据
      const totalRegistrations = registrations.length;
      const pendingRegistrations = registrations.filter((reg: any) => reg.status === 'pending').length;
      const totalRevenue = registrations.reduce((sum: number, reg: any) => sum + (reg.paymentAmount || 0), 0);
      
      return {
        totalRegistrations,
        pendingRegistrations,
        totalRevenue
      };
    } catch (err: any) {
      setError(err.response?.data?.message || '获取报名统计数据失败');
      message.error(err.response?.data?.message || '获取报名统计数据失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registrations,
    loading,
    error,
    registerForActivity,
    cancelRegistration,
    fetchUserRegistrations,
    fetchActivityRegistrations,
    updateRegistrationStatus,
    updatePaymentStatus,
    deleteRegistration,
    fetchAllRegistrationsAdmin,
    fetchRegistrations,
    exportRegistrations,
    fetchRegistrationStats
  };
};

export default useRegistrations;