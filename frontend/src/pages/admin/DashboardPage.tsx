import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Statistic, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  CommentOutlined,
  SettingOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageTitle, StatisticsPanel } from '../../components';
import { ROUTES } from '../../constants';

const { Title, Paragraph } = Typography;

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // 不再需要重复检查权限，因为 AdminRoute 组件已经处理了权限验证
  // 这里只保留对 user 的引用，用于显示管理员信息

  // 管理功能卡片配置
  const adminFeatures = [
    {
      title: '用户管理',
      icon: <UserOutlined />,
      description: '管理系统用户，包括查看、编辑和删除用户',
      route: ROUTES.ADMIN_USERS,
      color: '#1890ff'
    },
    {
      title: '活动管理',
      icon: <CalendarOutlined />,
      description: '管理所有活动，包括审核、编辑和删除活动',
      route: ROUTES.ADMIN_ACTIVITIES,
      color: '#52c41a'
    },
    {
      title: '报名管理',
      icon: <TeamOutlined />,
      description: '管理活动报名，包括确认、拒绝和导出报名信息',
      route: ROUTES.ADMIN_REGISTRATIONS,
      color: '#faad14'
    },
    {
      title: '类别管理',
      icon: <TagsOutlined />,
      description: '管理活动类别，包括添加、编辑和删除类别',
      route: ROUTES.ADMIN_CATEGORIES,
      color: '#722ed1'
    },
    {
      title: '评论管理',
      icon: <CommentOutlined />,
      description: '管理用户评论，包括审核和删除不当评论',
      route: ROUTES.ADMIN_COMMENTS,
      color: '#eb2f96'
    },
    {
      title: '系统设置',
      icon: <SettingOutlined />,
      description: '配置系统参数，包括支付设置、邮件模板等',
      route: ROUTES.ADMIN_SETTINGS,
      color: '#13c2c2'
    }
  ];

  if (!isAuthenticated || !isAdmin) {
    return null; // 等待重定向
  }

  return (
    <div className="admin-dashboard-page">
      <PageTitle 
        title="管理员仪表板" 
        subtitle={`欢迎回来，${user?.username || '管理员'}！`}
      />
      
      {/* 统计面板 */}
      <StatisticsPanel />
      
      {/* 管理功能入口 */}
      <div style={{ marginTop: 24 }}>
        <Title level={4}>管理功能</Title>
        <Row gutter={[16, 16]}>
          {adminFeatures.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card 
                hoverable 
                onClick={() => navigate(feature.route)}
                style={{ height: '100%' }}
              >
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div 
                    style={{ 
                      fontSize: 36, 
                      color: feature.color,
                      marginBottom: 16
                    }}
                  >
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 8 }}>{feature.title}</Title>
                  <Paragraph type="secondary">{feature.description}</Paragraph>
                </div>
                <Button type="primary" block>
                  进入管理
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default AdminDashboardPage;