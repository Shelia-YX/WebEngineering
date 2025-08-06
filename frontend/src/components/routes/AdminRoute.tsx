import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * 管理员路由组件，用于保护需要管理员权限的页面
 * 如果用户未登录或不是管理员，将重定向到首页
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  
  console.log('AdminRoute: 渲染');
  console.log('AdminRoute: isAuthenticated =', isAuthenticated);
  console.log('AdminRoute: loading =', loading);
  console.log('AdminRoute: user =', user);
  console.log('AdminRoute: user?.role =', user?.role);
  console.log('AdminRoute: isAdmin =', isAdmin);

  // 如果正在加载，显示加载状态
  if (loading) {
    console.log('AdminRoute: 正在加载，显示加载状态');
    return <div>加载中...</div>;
  }

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    console.log('AdminRoute: 未登录，重定向到登录页');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  // 如果不是管理员，重定向到首页
  if (!isAdmin) {
    console.log('AdminRoute: 不是管理员，重定向到首页');
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 已登录且是管理员，显示子组件
  console.log('AdminRoute: 已登录且是管理员，显示子组件');
  return <>{children}</>;
};

export default AdminRoute;