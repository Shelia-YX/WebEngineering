import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TagsOutlined,
  CommentOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { ROUTES } from '../constants';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  console.log('AdminLayout: 渲染');
  console.log('AdminLayout: isAuthenticated =', isAuthenticated);
  console.log('AdminLayout: isAdmin =', isAdmin);
  console.log('AdminLayout: user =', user);
  
  // 检查用户是否有权限访问管理界面
  useEffect(() => {
    console.log('AdminLayout useEffect: 检查管理员权限');
    console.log('AdminLayout useEffect: isAdmin =', isAdmin);
    
    if (!isAdmin) {
      console.log('AdminLayout useEffect: 用户不是管理员，准备重定向');
      // 如果不是管理员，重定向到首页
      navigate(ROUTES.HOME);
    }
  }, [isAdmin, navigate]);
  
  // 如果用户未登录或不是管理员，重定向到首页
  if (!isAuthenticated) {
    console.log('AdminLayout: 用户未登录，重定向到登录页');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  if (!isAdmin) {
    console.log('AdminLayout: 用户不是管理员，重定向到首页');
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return '2';
    if (path.includes('/admin/activities')) return '3';
    if (path.includes('/admin/registrations')) return '4';
    if (path.includes('/admin/categories')) return '5';
    if (path.includes('/admin/comments')) return '6';
    if (path.includes('/admin/settings')) return '7';
    return '1'; // 默认选中仪表盘
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div className="admin-logo" style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          {!collapsed ? '活动管理系统' : '活动'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: '仪表盘',
              onClick: () => navigate(ROUTES.ADMIN_DASHBOARD),
            },
            {
              key: '2',
              icon: <UserOutlined />,
              label: '用户管理',
              onClick: () => navigate(ROUTES.ADMIN_USERS),
            },
            {
              key: '3',
              icon: <CalendarOutlined />,
              label: '活动管理',
              onClick: () => navigate(ROUTES.ADMIN_ACTIVITIES),
            },
            {
              key: '4',
              icon: <FileTextOutlined />,
              label: '报名管理',
              onClick: () => navigate(ROUTES.ADMIN_REGISTRATIONS),
            },
            {
              key: '5',
              icon: <TagsOutlined />,
              label: '类别管理',
              onClick: () => navigate(ROUTES.ADMIN_CATEGORIES),
            },
            {
              key: '6',
              icon: <CommentOutlined />,
              label: '评论管理',
              onClick: () => navigate(ROUTES.ADMIN_COMMENTS),
            },
            {
              key: '7',
              icon: <SettingOutlined />,
              label: '系统设置',
              onClick: () => navigate(ROUTES.ADMIN_SETTINGS),
            },
            {
              key: '8',
              icon: <HomeOutlined />,
              label: '返回前台',
              onClick: () => navigate(ROUTES.HOME),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;