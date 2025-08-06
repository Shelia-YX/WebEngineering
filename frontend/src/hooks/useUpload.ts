import { useState } from 'react';
import { message } from '../utils/messageUtils';
import { uploadApi } from '../services/api';

// 文件上传Hook
export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 上传图片
  const uploadImage = async (file: File) => {
    // 检查文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return null;
    }

    // 检查文件大小（限制为5MB）
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB！');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await uploadApi.uploadImage(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      message.success('图片上传成功');
      
      return response.data.imageUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || '图片上传失败');
      message.error(err.response?.data?.message || '图片上传失败');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 上传文件
  const uploadFile = async (file: File) => {
    // 检查文件大小（限制为10MB）
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件大小不能超过10MB！');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await uploadApi.uploadFile(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      message.success('文件上传成功');
      
      return response.data.fileUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || '文件上传失败');
      message.error(err.response?.data?.message || '文件上传失败');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 将文件转换为Base64（用于预览）
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return {
    uploading,
    progress,
    error,
    uploadImage,
    uploadFile,
    fileToBase64,
  };
};

export default useUpload;