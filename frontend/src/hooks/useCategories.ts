import { useState, useEffect, useCallback } from 'react';
import { message } from '../utils/messageUtils';
import { categoryApi } from '../services/api';

interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 类别Hook
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有类别
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getAllCategories();
      setCategories(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取类别失败');
      message.error(err.response?.data?.message || '获取类别失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时获取类别
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 创建类别（管理员）
  const createCategory = async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.createCategory({ name, description });
      // 更新本地状态
      setCategories(prev => [...prev, response.data]);
      message.success('类别创建成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '创建类别失败');
      message.error(err.response?.data?.message || '创建类别失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新类别（管理员）
  const updateCategory = async (id: string, name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.updateCategory(id, { name, description });
      // 更新本地状态
      setCategories(prev =>
        prev.map(category => (category._id === id ? { ...category, name, description } : category))
      );
      message.success('类别更新成功');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || '更新类别失败');
      message.error(err.response?.data?.message || '更新类别失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 删除类别（管理员）
  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await categoryApi.deleteCategory(id);
      // 更新本地状态
      setCategories(prev => prev.filter(category => category._id !== id));
      message.success('类别删除成功');
    } catch (err: any) {
      setError(err.response?.data?.message || '删除类别失败');
      message.error(err.response?.data?.message || '删除类别失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

export default useCategories;