import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * 私有路由组件，用于保护需要登录的页面
 * 如果用户未登录，将重定向到登录页面
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 如果正在加载，显示加载状态
  if (loading) {
    return <div>加载中...</div>;
  }

  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 已登录，显示子组件
  return <>{children}</>;
};

export default PrivateRoute;