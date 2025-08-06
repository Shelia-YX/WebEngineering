import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../../hooks';
import ThemeSwitch from '../common/ThemeSwitch';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // 添加本地状态来跟踪认证状态
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(isAuthenticated || localStorage.getItem('token') !== null);
  
  // 强制组件在登录状态变化时重新渲染
  const [, forceUpdate] = useState({});
  
  // 检查并更新认证状态
  const checkAuthStatus = useCallback(() => {
    const hasToken = localStorage.getItem('token') !== null;
    const hasUser = !!user;
    const newAuthState = hasToken || hasUser;
    
    if (newAuthState !== localIsAuthenticated) {
      setLocalIsAuthenticated(newAuthState);
      forceUpdate({});
    }
  }, [user, localIsAuthenticated]);
  
  // 监听用户登录事件和存储变化
  useEffect(() => {
    const handleUserLogin = () => {
      checkAuthStatus();
    };
    
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    // 初始检查
    checkAuthStatus();
    
    // 添加事件监听
    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('storage', handleStorageChange);
    
    // 定期检查认证状态（作为备用机制）
    const intervalId = setInterval(checkAuthStatus, 1000);
    
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [checkAuthStatus]);

  // 获取当前路径的key
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/activities') && path.length > 11) return '';
    if (path.startsWith('/activities')) return 'activities';
    if (path.startsWith('/my-activities')) return 'my-activities';
    if (path.startsWith('/my-registrations')) return 'my-registrations';
    if (path.startsWith('/create-activity')) return 'create-activity';
    if (path.startsWith('/admin')) return 'admin';
    return '';
  };

  // 使用useAuth钩子获取登录状态，不需要额外的useEffect

  // 退出登录
  const handleLogout = () => {
    logout();
  };

  // 用户下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'my-activities',
      icon: <SettingOutlined />,
      label: '我的活动',
      onClick: () => navigate('/my-activities'),
    },
    {
      key: 'my-registrations',
      icon: <SettingOutlined />,
      label: '我的报名',
      onClick: () => navigate('/my-registrations'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 管理员菜单项
  const { isAdmin } = useAuth();
  console.log('AppHeader 渲染，当前用户信息:', user);
  console.log('用户角色:', user?.role);
  console.log('是否为管理员(从user.role):', user?.role === 'admin');
  console.log('是否为管理员(从useAuth.isAdmin):', isAdmin);
  
  if (isAdmin) {
    console.log('添加管理后台菜单项');
    userMenuItems.splice(3, 0, {
      key: 'admin',
      icon: <SettingOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin'),
    });
  } else {
    console.log('不添加管理后台菜单项，因为用户不是管理员');
  }

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="logo" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
          体育活动中心
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          style={{ lineHeight: '64px', marginRight: '20px' }}
          items={[
            {
              key: 'home',
              label: <Link to="/">首页</Link>,
            },
            {
              key: 'activities',
              label: <Link to="/activities">活动列表</Link>,
            },
            ...(isAuthenticated && user?.role && (user.role === 'organizer' || user.role === 'admin')
              ? [
                  {
                    key: 'create-activity',
                    label: <Link to="/create-activity">发布活动</Link>,
                  },
                ]
              : []),
          ]}
        />

        <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
          <ThemeSwitch showText={true} />
        </div>
        
        {/* 使用本地状态来决定显示哪个UI */}
        {localIsAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ color: '#fff', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              {user?.username || (() => {
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                  try {
                    return JSON.parse(userInfoStr).username;
                  } catch (error) {
                    console.error('解析用户信息失败:', error);
                    return '用户';
                  }
                }
                return '用户';
              })()}
              {isAdmin && <span style={{ marginLeft: '5px', color: '#f56a00' }}>[管理员]</span>}
              <DownOutlined />
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="primary" onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button onClick={() => navigate('/register')}>注册</Button>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;