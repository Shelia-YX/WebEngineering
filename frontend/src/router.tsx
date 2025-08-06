import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from './layouts';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivityList from './pages/ActivityList';
import ActivityDetail from './pages/ActivityDetail';
import Profile from './pages/Profile';
import MyActivities from './pages/MyActivities';
import MyRegistrations from './pages/MyRegistrations';
import CreateActivity from './pages/CreateActivity';
import EditActivity from './pages/EditActivity';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// 导入useAuth钩子
import { useAuth } from './hooks';

// 使用AuthContext的状态检查函数
const AuthCheck = ({ children, checkFn }: { children: React.ReactNode, checkFn: () => boolean }) => {
  const result = checkFn();
  return result ? children : null;
};


// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // 使用useEffect进行日志输出，避免在渲染函数中进行可能导致状态更新的操作
  useEffect(() => {
    console.log('ProtectedRoute: 检查认证状态');
    console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
    console.log('ProtectedRoute: loading =', loading);
    console.log('ProtectedRoute: user =', user);
    
    // 检查localStorage中的token和userInfo
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    console.log('ProtectedRoute: localStorage中的token:', token ? '存在' : '不存在');
    console.log('ProtectedRoute: localStorage中的userInfo:', userInfoStr ? '存在' : '不存在');
  }, [isAuthenticated, loading, user]);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    console.log('ProtectedRoute: 正在加载中...');
    return <div>加载中...</div>;
  }
  
  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    console.log('ProtectedRoute: 用户未认证，重定向到登录页');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute: 用户已认证，显示受保护的内容');
  return children;
};

// 组织者或管理员路由组件
const OrganizerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isOrganizerOrAdmin, loading } = useAuth();
  
  // 使用useEffect进行日志输出，避免在渲染函数中进行可能导致状态更新的操作
  useEffect(() => {
    console.log('OrganizerRoute: 检查认证状态和权限');
    console.log('OrganizerRoute: isAuthenticated =', isAuthenticated);
    console.log('OrganizerRoute: isOrganizerOrAdmin =', isOrganizerOrAdmin);
    console.log('OrganizerRoute: loading =', loading);
  }, [isAuthenticated, isOrganizerOrAdmin, loading]);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isOrganizerOrAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// 管理员路由组件
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  // 使用useEffect进行日志输出，避免在渲染函数中进行可能导致状态更新的操作
  useEffect(() => {
    console.log('AdminRoute: 检查认证状态和管理员权限');
    console.log('AdminRoute: isAuthenticated =', isAuthenticated);
    console.log('AdminRoute: isAdmin =', isAdmin);
    console.log('AdminRoute: loading =', loading);
  }, [isAuthenticated, isAdmin, loading]);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// 公共路由组件（已登录用户不能访问）
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // 使用useEffect进行日志输出，避免在渲染函数中进行可能导致状态更新的操作
  useEffect(() => {
    console.log('PublicRoute: 检查认证状态');
    console.log('PublicRoute: isAuthenticated =', isAuthenticated);
    console.log('PublicRoute: loading =', loading);
  }, [isAuthenticated, loading]);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: 'activities',
        element: <ActivityList />,
      },
      {
        path: 'activities/:id',
        element: <ActivityDetail />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-activities',
        element: (
          <OrganizerRoute>
            <MyActivities />
          </OrganizerRoute>
        ),
      },
      {
        path: 'my-registrations',
        element: (
          <ProtectedRoute>
            <MyRegistrations />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-activity',
        element: (
          <OrganizerRoute>
            <CreateActivity />
          </OrganizerRoute>
        ),
      },
      {
        path: 'edit-activity/:id',
        element: (
          <OrganizerRoute>
            <EditActivity />
          </OrganizerRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      }
        ]}
    ]
  }
]);

export { router };