import React, { useState } from 'react';
import { Row, Col, Card, Tabs, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProfileForm, PasswordForm, UserAvatar, PageTitle } from '../components';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';
import { message } from '../utils/messageUtils';

const { Title, Paragraph } = Typography;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // 如果未登录，重定向到登录页
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      message.success('退出登录成功');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('退出登录失败:', error);
      message.error('退出登录失败');
    }
  };

  if (!user) {
    return null; // 等待重定向
  }

  return (
    <div className="profile-page">
      <PageTitle 
        title="个人中心" 
        subtitle="管理您的个人信息和账户设置"
      />
      
      <Row gutter={[24, 24]}>
        {/* 左侧用户信息卡片 */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <UserAvatar user={user} size={100} />
              <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                {user.username}
              </Title>
              <Paragraph type="secondary">{user.email}</Paragraph>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <Button 
                type="primary" 
                block 
                onClick={() => navigate(ROUTES.MY_ACTIVITIES)}
              >
                我的活动
              </Button>
              <Button 
                style={{ marginTop: 12 }} 
                block
                onClick={() => navigate(ROUTES.MY_REGISTRATIONS)}
              >
                我的报名
              </Button>
              <Button 
                danger 
                style={{ marginTop: 12 }} 
                block
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </div>
          </Card>
        </Col>
        
        {/* 右侧设置选项卡 */}
        <Col xs={24} md={16}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'profile',
                  label: '个人资料',
                  children: <ProfileForm />
                },
                {
                  key: 'password',
                  label: '修改密码',
                  children: <PasswordForm />
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;