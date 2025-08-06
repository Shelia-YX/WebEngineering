import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useActivities, useAuth } from '../hooks';
import { ActivityForm, PageTitle, LoadingSpinner, ErrorAlert } from '../components';
import { ROUTES } from '../constants';
import { message } from '../utils/messageUtils';

const ActivityEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchActivityById, loading, error, updateActivity } = useActivities();
  const [activity, setActivity] = useState<any>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // 获取活动详情
  useEffect(() => {
    const fetchActivity = async () => {
      if (id) {
        try {
          const activityData = await fetchActivityById(id);
          setActivity(activityData);
          
          // 检查是否是活动创建者
          if (user?._id !== activityData.organizer._id) {
            setUnauthorized(true);
            message.error('您没有权限编辑此活动');
            navigate(ROUTES.HOME);
          }
        } catch (error) {
          console.error('获取活动失败:', error);
          message.error('获取活动失败');
        }
      }
    };

    if (user) {
      fetchActivity();
    }
  }, [id, fetchActivityById, user, navigate]);

  // 处理表单提交
  const handleSubmit = async (data: any) => {
    if (id) {
      await updateActivity(id, data);
    }
  };

  // 处理更新成功
  const handleUpdateSuccess = () => {
    message.success('活动更新成功');
    navigate(ROUTES.ACTIVITY_DETAIL.replace(':id', id as string));
  };

  if (unauthorized) {
    return null; // 等待重定向
  }

  return (
    <div className="activity-edit-page">
      <PageTitle 
        title="编辑活动" 
        subtitle="更新活动信息"
        onBack={() => navigate(-1)}
      />
      
      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert error={error} />
        ) : activity ? (
          <ActivityForm 
            initialValues={activity} 
            onSubmit={handleSubmit}
            onSuccess={handleUpdateSuccess} 
            isEdit 
          />
        ) : (
          <ErrorAlert error="未找到活动" />
        )}
      </Card>
    </div>
  );
};

export default ActivityEditPage;