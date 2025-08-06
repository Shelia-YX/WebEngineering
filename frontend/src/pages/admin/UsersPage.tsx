import React, { useEffect } from 'react';
import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageTitle, UserTable } from '../../components';
import { ROUTES } from '../../constants';

const AdminUsersPage: React.FC = () => {
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
    <div className="admin-users-page">
      <PageTitle 
        title="用户管理" 
        subtitle="管理系统用户"
        onBack={() => navigate(ROUTES.ADMIN_DASHBOARD)}
      />
      
      <Card>
        <UserTable />
      </Card>
    </div>
  );
};

export default AdminUsersPage;