import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Tabs, Empty, Tag, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRegistrations, useAuth } from '../hooks';
import { PageTitle, LoadingSpinner, ErrorAlert, StatusTag } from '../components';
import { formatDateTime, formatCurrency } from '../utils';
import { ROUTES } from '../constants';
import { message } from '../utils/messageUtils';

const { Text, Title } = Typography;

interface Registration {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  activity: {
    _id: string;
    title: string;
    date: string;
    image: string;
    coverImage: string;
    startTime: string;
  };
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  registrationDate: string;
  attended: boolean;
  ticketCount: number;
  totalPrice: number;
}

const MyRegistrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    loading, 
    error, 
    fetchUserRegistrations,
    cancelRegistration
  } = useRegistrations();
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  const [activeTab, setActiveTab] = useState('all');

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // 获取用户报名
  useEffect(() => {
    const loadRegistrations = async () => {
      if (user?._id && isAuthenticated) {
        try {
          const data = await fetchUserRegistrations();
          setRegistrations(data);
        } catch (error) {
          console.error('获取报名记录失败', error);
        }
      }
    };
    
    loadRegistrations();
  }, [user, isAuthenticated, fetchUserRegistrations]);

  // 处理取消报名
  const handleCancelRegistration = async (registrationId: string) => {
    try {
      await cancelRegistration(registrationId);
      message.success('报名取消成功');
      // 刷新报名列表
      try {
        const data = await fetchUserRegistrations();
        setRegistrations(data);
      } catch (error) {
        console.error('获取报名记录失败', error);
      }
    } catch (error) {
      console.error('取消报名失败:', error);
      message.error('取消报名失败');
    }
  };

  // 筛选报名
  const getFilteredRegistrations = () => {
    if (activeTab === 'all') {
      return registrations;
    }
    return registrations.filter(registration => registration.status === activeTab);
  };

  // 判断是否可以取消报名
  const canCancelRegistration = (registration: any) => {
    // 只有待确认或已确认的报名可以取消
    if (registration.status !== 'pending' && registration.status !== 'confirmed') {
      return false;
    }
    
    // 检查活动是否已经开始
    const now = new Date();
    const startTime = new Date(registration.activity?.startTime);
    if (now > startTime) {
      return false; // 活动已开始，不能取消
    }
    
    return true;
  };

  if (!user) {
    return null; // 等待重定向
  }

  return (
    <div className="my-registrations-page">
      <PageTitle 
        title="我的报名" 
        subtitle="查看您参与的所有活动"
      />
      
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'all', label: '全部报名' },
            { key: 'pending', label: '待确认' },
            { key: 'confirmed', label: '已确认' },
            { key: 'rejected', label: '已拒绝' },
            { key: 'cancelled', label: '已取消' }
          ]}
        />
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          <div style={{ marginTop: 16 }}>
            {getFilteredRegistrations().length > 0 ? (
              <Row gutter={[16, 16]}>
                {getFilteredRegistrations().map(registration => (
                  <Col xs={24} sm={12} md={8} key={registration._id}>
                    <Card 
                      hoverable 
                      onClick={() => navigate(ROUTES.ACTIVITY_DETAIL.replace(':id', registration.activity?._id))} 
                      cover={
                        registration.activity?.coverImage && (
                          <img 
                            alt={registration.activity?.title} 
                            src={registration.activity?.coverImage} 
                            style={{ height: 200, objectFit: 'cover' }} 
                          />
                        )
                      }
                    >
                      <div style={{ marginBottom: 12 }}>
                        <Title level={5} ellipsis={{ rows: 1 }}>
                          {registration.activity?.title || '未知活动'}
                        </Title>
                        <Text type="secondary">
                          {formatDateTime(registration.activity?.startTime)}
                        </Text>
                      </div>
                      
                      <div style={{ marginBottom: 12 }}>
                        <Space>
                          <StatusTag type="registration" status={registration.status} />
                          <StatusTag type="payment" status={registration.paymentStatus} />
                          <Tag color="blue">{registration.ticketCount || 1} 张票</Tag>
                        </Space>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{formatCurrency(registration.totalPrice)}</Text>
                        
                        {canCancelRegistration(registration) && (
                          <Button 
                            danger 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRegistration(registration._id);
                            }}
                          >
                            取消报名
                          </Button>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description={`暂无${activeTab === 'all' ? '' : activeTab === 'pending' ? '待确认' : activeTab === 'confirmed' ? '已确认' : activeTab === 'rejected' ? '已拒绝' : '已取消'}报名`} 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyRegistrationsPage;