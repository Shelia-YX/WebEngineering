import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Tabs, Tag, Divider, Typography, Space, Modal, Empty } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  DollarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useActivities, useAuth, useRegistrations, useComments } from '../hooks';
import { registrationApi } from '../services/api';
import { message } from '../utils/messageUtils';

import { 
  LoadingSpinner, 
  ErrorAlert, 
  PageTitle, 
  StatusTag, 
  UserAvatar,
  CommentList,
  CommentForm,
  ConfirmModal
} from '../components';
import RegistrationForm from '../components/forms/RegistrationForm';
import { formatDateTime, formatCurrency } from '../utils';
import { ROUTES } from '../constants';

const { Paragraph, Title, Text } = Typography;

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { loading: activitiesLoading, error: activitiesError, fetchActivityById, deleteActivity } = useActivities();
  const { registrations, loading: registrationsLoading, error: registrationsError } = useRegistrations();
  const { comments, fetchComments, addComment, deleteComment } = useComments(id);
  
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('details');
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  
  // 获取活动详情
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchActivityById(id)
        .then(data => {
          setActivity(data);
          setError(null);
        })
        .catch(err => {
          setError(err.message || '获取活动详情失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, fetchActivityById]);

  // 获取报名信息
  const fetchRegistrationsByActivity = useCallback(async (activityId: string) => {
    try {
      const response = await registrationApi.getActivityRegistrations(activityId);
      return { registrations: response.data };
    } catch (error) {
      console.error('获取报名信息失败:', error);
      return { registrations: [] };
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchRegistrationsByActivity(id).then((data: any) => {
        // 查找当前用户的报名信息
        if (isAuthenticated && user?._id) {
          const userReg = data?.registrations?.find((reg: any) => 
            reg.user && reg.user._id === user._id
          );
          setUserRegistration(userReg || null);
        }
      });
    }
  }, [id, fetchRegistrationsByActivity, isAuthenticated, user]);

  // 获取评论信息
  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [fetchComments]);

  // 处理删除活动
  const handleDeleteActivity = async () => {
    try {
      await deleteActivity(id!);
      message.success('活动删除成功');
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('删除活动失败:', error);
      message.error('删除活动失败');
    }
  };

  // 处理分享活动
  const handleShareActivity = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => message.success('活动链接已复制到剪贴板'))
      .catch(() => message.error('复制链接失败'));
  };

  // 处理提交评论
  const handleAddComment = async (content: string) => {
    try {
      await addComment(content);
      return true;
    } catch (error) {
      console.error('发布评论失败:', error);
      return false;
    }
  };

  // 处理删除评论
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      message.success('评论删除成功');
    } catch (error) {
      console.error('删除评论失败:', error);
      message.error('删除评论失败');
    }
  };

  // 处理报名成功
  const handleRegistrationSuccess = () => {
    setRegistrationModalVisible(false);
    message.success('报名成功！');
    // 刷新报名信息
    if (id) {
      fetchRegistrationsByActivity(id);
      fetchActivityById(id); // 刷新活动信息（报名人数等）
    }
  };

  // 判断是否可以报名
  const canRegister = () => {
    if (!activity) return false;
    if (!isAuthenticated) return false;
    if (userRegistration) return false; // 已经报名
    if (activity.status !== 'published') return false; // 活动未发布
    if (activity.capacity && activity.registrationsCount >= activity.capacity) return false; // 已满
    
    // 检查活动是否已经开始
    const now = new Date();
    const startTime = new Date(activity.startTime);
    if (now > startTime) return false; // 活动已开始
    
    return true;
  };

  // 判断是否是活动组织者
  const isOrganizer = () => {
    if (!activity || !isAuthenticated || !user) return false;
    return activity.organizer?._id === user._id;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !activity) {
    return (
      <div style={{ padding: '24px' }}>
        <ErrorAlert error={error || '活动不存在'} />
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-detail-page">
      <PageTitle 
        title={activity.title} 
        subtitle={`由 ${activity.organizer?.username || '未知用户'} 组织`}
        extra={
          <Space>
            <StatusTag type="activity" status={activity.status} />
            {isOrganizer() && (
              <>
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`${ROUTES.EDIT_ACTIVITY.replace(':id', activity._id)}`)}
                >
                  编辑
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => Modal.confirm({
                    title: '确认删除',
                    content: '确定要删除此活动吗？此操作不可恢复。',
                    onOk: handleDeleteActivity,
                    okText: '删除',
                    okButtonProps: { danger: true },
                    cancelText: '取消',
                  })}
                >
                  删除
                </Button>
              </>
            )}
            <Button 
              icon={<ShareAltOutlined />} 
              onClick={handleShareActivity}
            >
              分享
            </Button>
          </Space>
        }
      />
      
      <Row gutter={[24, 24]}>
        {/* 左侧内容区 */}
        <Col xs={24} md={16}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'details',
                  label: '活动详情',
                  children: (
                    <>
                      {/* 活动封面图 */}
                      {activity.coverImage && (
                        <div style={{ marginBottom: 16 }}>
                          <img 
                            src={activity.coverImage} 
                            alt={activity.title} 
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} 
                          />
                        </div>
                      )}
                      
                      {/* 活动描述 */}
                      <Title level={4}>活动介绍</Title>
                      <Paragraph>
                        {activity.description || '暂无描述'}
                      </Paragraph>
                      
                      <Divider />
                      
                      {/* 活动组织者 */}
                      <Title level={4}>组织者信息</Title>
                      <Space>
                        <UserAvatar 
                          user={activity.organizer} 
                          size={40} 
                        />
                        <div>
                          <div>{activity.organizer?.username || '未知用户'}</div>
                          <Text type="secondary">{activity.organizer?.email || ''}</Text>
                        </div>
                      </Space>
                    </>
                  )
                },
                {
                  key: 'comments',
                  label: `评论 (${comments?.length || 0})`,
                  children: (
                    <>
                      <CommentForm 
                        onSubmit={handleAddComment} 
                      />
                      <Divider />
                      <CommentList 
                        comments={comments || []} 
                        onDelete={handleDeleteComment} 
                      />
                    </>
                  )
                },
                {
                  key: 'registrations',
                  label: `报名 (${registrations?.length || 0})`,
                  children: (
                    <>
                      {isOrganizer() ? (
                        registrations && registrations.length > 0 ? (
                          <div>
                            {registrations.map(reg => (
                              <Card key={reg._id} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Space>
                                    <UserAvatar user={reg.user} size={40} />
                                    <div>
                                      <div>{reg.name}</div>
                                      <Text type="secondary">{reg.email} | {reg.phone}</Text>
                                    </div>
                                  </Space>
                                  <Space>
                                    <StatusTag type="registration" status={reg.status} />
                                    <StatusTag type="payment" status={reg.paymentStatus} />
                                    <Tag color="blue">{reg.ticketCount || 1} 张票</Tag>
                                  </Space>
                                </div>
                                {reg.note && (
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">备注: {reg.note}</Text>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Empty description="暂无报名信息" />
                        )
                      ) : (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                          <Text type="secondary">只有活动组织者可以查看报名详情</Text>
                        </div>
                      )}
                    </>
                  )
                }
              ]}
            />
          </Card>
        </Col>
        
        {/* 右侧信息栏 */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <span>开始时间：{formatDateTime(activity.startTime)}</span>
                </div>
                {activity.endTime && (
                  <div>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    <span>结束时间：{formatDateTime(activity.endTime)}</span>
                  </div>
                )}
                <div>
                  <EnvironmentOutlined style={{ marginRight: 8 }} />
                  <span>地点：{activity.location || '线上活动'}</span>
                </div>
                <div>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  <span>人数：{activity.registrationsCount || 0}/{activity.capacity || '不限'}</span>
                </div>
                <div>
                  <DollarOutlined style={{ marginRight: 8 }} />
                  <span>价格：{formatCurrency(activity.price || 0)}</span>
                </div>
                {activity.category && (
                  <div>
                    <Tag color="blue">{activity.category.name}</Tag>
                  </div>
                )}
              </Space>
            </div>
            
            <Divider />
            
            {/* 报名状态和按钮 */}
            <div style={{ textAlign: 'center' }}>
              {userRegistration ? (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Tag color="green" style={{ padding: '4px 8px', fontSize: 16 }}>
                      已报名
                    </Tag>
                  </div>
                  <div>
                    <StatusTag type="registration" status={userRegistration.status} />
                    <StatusTag type="payment" status={userRegistration.paymentStatus} />
                  </div>
                </div>
              ) : (
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  disabled={!canRegister()}
                  onClick={() => setRegistrationModalVisible(true)}
                >
                  {!isAuthenticated ? '登录后报名' : 
                   activity.status !== 'published' ? '活动未发布' :
                   (activity.capacity && activity.registrationsCount >= activity.capacity) ? '名额已满' :
                   new Date() > new Date(activity.startTime) ? '活动已开始' :
                   '立即报名'}
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 报名表单模态框 */}
      <Modal
        title="活动报名"
        open={registrationModalVisible}
        onCancel={() => setRegistrationModalVisible(false)}
        footer={null}
        width={600}
      >
        <RegistrationForm 
          activityId={activity._id}
          activityTitle={activity.title}
          price={activity.price}
          onSubmit={async (data) => {
            try {
              await registrationApi.registerForActivity(activity._id);
              handleRegistrationSuccess();
            } catch (error) {
              console.error('报名失败', error);
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default ActivityDetailPage;