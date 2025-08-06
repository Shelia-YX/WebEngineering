import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // 如果正在加载认证状态，可以显示加载中
  if (loading) {
    return <div>加载中...</div>;
  }

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 已认证，渲染子路由
  return <Outlet />;
};

export default PrivateRoute;