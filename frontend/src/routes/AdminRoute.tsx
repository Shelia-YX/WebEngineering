import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { USER_ROLES } from '../constants';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // 如果正在加载认证状态，可以显示加载中
  if (loading) {
    return <div>加载中...</div>;
  }

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 如果不是管理员，重定向到首页
  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 已认证且是管理员，渲染子路由
  return <Outlet />;
};

export default AdminRoute;