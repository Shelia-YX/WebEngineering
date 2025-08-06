import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Tabs, Empty, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useActivities, useAuth } from '../hooks';
import { ActivityCard, ActivityForm, PageTitle, LoadingSpinner, ErrorAlert } from '../components';
import { ROUTES } from '../constants';
import { message } from '../utils/messageUtils';



const MyActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    loading, 
    error, 
    fetchUserActivities 
  } = useActivities();
  
  const [myActivities, setMyActivities] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  // 获取用户活动
  useEffect(() => {
    const loadUserActivities = async () => {
      if (user?._id && isAuthenticated) {
        try {
          const data = await fetchUserActivities();
          setMyActivities(data);
        } catch (error) {
          console.error('获取活动失败', error);
        }
      }
    };
    
    loadUserActivities();
  }, [user, isAuthenticated, fetchUserActivities]);

  // 处理创建活动成功
  const handleCreateSuccess = async () => {
    setModalVisible(false);
    message.success('活动创建成功');
    // 刷新活动列表
    if (user?._id && isAuthenticated) {
      try {
        const data = await fetchUserActivities();
        setMyActivities(data);
      } catch (error) {
        console.error('获取活动失败', error);
      }
    }
  };

  // 筛选活动
  const getFilteredActivities = () => {
    if (activeTab === 'all') {
      return myActivities;
    }
    return myActivities.filter(activity => activity.status === activeTab);
  };

  if (!user) {
    return null; // 等待重定向
  }

  return (
    <div className="my-activities-page">
      <PageTitle 
        title="我的活动" 
        subtitle="管理您创建的所有活动"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            创建活动
          </Button>
        }
      />
      
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'all', label: '全部活动' },
            { key: 'draft', label: '草稿' },
            { key: 'published', label: '已发布' },
            { key: 'ended', label: '已结束' },
            { key: 'cancelled', label: '已取消' }
          ]}
        />
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          <div style={{ marginTop: 16 }}>
            {getFilteredActivities().length > 0 ? (
              <Row gutter={[16, 16]}>
                {getFilteredActivities().map(activity => (
                  <Col xs={24} sm={12} md={8} lg={6} key={activity._id}>
                    <ActivityCard 
                      activity={activity} 
                      actions={[
                        <Button 
                          key="edit" 
                          size="small" 
                          onClick={() => navigate(ROUTES.EDIT_ACTIVITY.replace(':id', activity._id))}
                        >
                          编辑
                        </Button>,
                        <Button 
                          key="view" 
                          type="primary" 
                          size="small" 
                          onClick={() => navigate(ROUTES.ACTIVITY_DETAIL.replace(':id', activity._id))}
                        >
                          查看
                        </Button>
                      ]}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description={`暂无${activeTab === 'all' ? '' : activeTab === 'draft' ? '草稿' : activeTab === 'published' ? '已发布' : activeTab === 'ended' ? '已结束' : '已取消'}活动`} 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </Card>
      
      {/* 创建活动模态框 */}
      <Modal
        title="创建活动"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <ActivityForm onSubmit={async (_) => {
          try {
            await fetchUserActivities();
            handleCreateSuccess();
          } catch (error) {
            console.error('创建活动失败', error);
            message.error('创建活动失败');
          }
        }} />
      </Modal>
    </div>
  );
};

export default MyActivitiesPage;