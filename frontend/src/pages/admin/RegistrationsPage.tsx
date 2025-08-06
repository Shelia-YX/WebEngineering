import React, { useEffect } from 'react';
import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageTitle, RegistrationManager } from '../../components';
import { ROUTES } from '../../constants';

const AdminRegistrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  // 如果未登录或不是管理员，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    } else if (!isAdmin) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return null; // 等待重定向
  }

  return (
    <div className="admin-registrations-page">
      <PageTitle 
        title="报名管理" 
        subtitle="管理活动报名"
        onBack={() => navigate(ROUTES.ADMIN_DASHBOARD)}
      />
      
      <Card>
        <RegistrationManager />
      </Card>
    </div>
  );
};

export default AdminRegistrationsPage;