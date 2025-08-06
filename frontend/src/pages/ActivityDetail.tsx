import { useState, useEffect } from 'react';
import { Comment } from '@ant-design/compatible';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Descriptions,
  Divider,
  Spin,
  Modal,
  Breadcrumb,
  Tabs,
  Avatar,
  Rate,
  Empty,
} from 'antd';
import { message } from '../utils/messageUtils';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import CommentForm from '../components/comment/CommentForm';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

interface Activity {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  duration: number;
  capacity: number;
  registeredCount: number;
  price: number;
  category: string;
  image: string;
  status: string;
  organizer: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  activity: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface Registration {
  _id: string;
  user: string;
  activity: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasCommented, setHasCommented] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // 获取活动详情
  useEffect(() => {
    const fetchActivityDetail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/activities/${id}`);
        setActivity(response.data);
      } catch (error) {
        console.error('获取活动详情失败', error);
        message.error('获取活动详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [id]);

  // 获取活动评论
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/activity/${id}`);
        setComments(response.data);
        
        // 检查用户是否已评论
        if (user) {
          const userComment = response.data.find((comment: Comment) => comment.user._id === user._id);
          setHasCommented(!!userComment);
        }
      } catch (error) {
        console.error('获取评论失败', error);
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id, user]);

  // 获取用户报名状态
  useEffect(() => {
    const fetchUserRegistration = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/registrations/user`,
          config
        );

        const registration = response.data.find(
          (reg: Registration) => reg.activity === id
        );

        setUserRegistration(registration || null);
      } catch (error) {
        console.error('获取用户报名状态失败', error);
      }
    };

    fetchUserRegistration();
  }, [id, user]);

  // 报名活动
  const handleRegister = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.warning('请先登录');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/registrations`,
        { activityId: id },
        config
      );

      message.success('报名成功');
      
      // 更新活动信息和用户报名状态
      const activityResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/activities/${id}`);
      setActivity(activityResponse.data);
      
      const registrationsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/registrations/user`,
        config
      );
      
      const registration = registrationsResponse.data.find(
        (reg: Registration) => reg.activity === id
      );
      
      setUserRegistration(registration || null);
    } catch (error: any) {
      console.error('报名失败', error);
      message.error(error.response?.data?.message || '报名失败，请稍后再试');
    } finally {
      setRegistering(false);
    }
  };

  // 取消报名
  const handleCancelRegistration = async () => {
    if (!userRegistration) return;

    confirm({
      title: '确认取消报名',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要取消报名吗？',
      onOk: async () => {
        setCancelling(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            message.warning('请先登录');
            navigate('/login');
            return;
          }

          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/registrations/${userRegistration._id}`,
            { status: 'canceled' },
            config
          );

          message.success('已取消报名');
          
          // 更新活动信息和用户报名状态
          const activityResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/activities/${id}`);
          setActivity(activityResponse.data);
          
          setUserRegistration(null);
        } catch (error: any) {
          console.error('取消报名失败', error);
          message.error(error.response?.data?.message || '取消报名失败，请稍后再试');
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  // 删除活动
  const handleDeleteActivity = () => {
    confirm({
      title: '确认删除活动',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，您确定要删除此活动吗？',
      onOk: async () => {
        setDeleting(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            message.warning('请先登录');
            navigate('/login');
            return;
          }

          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/activities/${id}`,
            config
          );

          message.success('活动已删除');
          navigate('/activities');
        } catch (error: any) {
          console.error('删除活动失败', error);
          message.error(error.response?.data?.message || '删除活动失败，请稍后再试');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  // 添加评论后刷新评论列表
  const handleCommentAdded = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/activity/${id}`);
      setComments(response.data);
      setHasCommented(true);
    } catch (error) {
      console.error('获取评论失败', error);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取活动类别对应的颜色
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      '足球': 'green',
      '篮球': 'orange',
      '排球': 'blue',
      '网球': 'purple',
      '羽毛球': 'cyan',
      '乒乓球': 'magenta',
      '游泳': 'geekblue',
      '跑步': 'red',
      '健身': 'volcano',
      '瑜伽': 'gold',
      '其他': 'default',
    };
    
    return categoryColors[category] || 'default';
  };

  // 获取活动状态对应的颜色
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'upcoming': 'blue',
      'ongoing': 'green',
      'completed': 'gray',
      'canceled': 'red',
    };
    
    return statusColors[status] || 'default';
  };

  // 获取活动状态对应的中文名称
  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'upcoming': '即将开始',
      'ongoing': '进行中',
      'completed': '已结束',
      'canceled': '已取消',
    };
    
    return statusTexts[status] || status;
  };

  // 计算平均评分
  const calculateAverageRating = () => {
    if (comments.length === 0) return 0;
    const sum = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return (sum / comments.length).toFixed(1);
  };

  // 检查用户是否是活动组织者或管理员
  const isOrganizerOrAdmin = () => {
    if (!user || !activity) return false;
    return user._id === activity.organizer._id || user.role === 'admin';
  };

  // 检查活动是否已满
  const isActivityFull = () => {
    if (!activity) return false;
    return activity.registeredCount >= activity.capacity;
  };

  // 检查活动是否已结束或取消
  const isActivityEndedOrCanceled = () => {
    if (!activity) return false;
    return activity.status === 'completed' || activity.status === 'canceled';
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <Empty description="活动不存在或已被删除" />
        <Button type="primary" style={{ marginTop: '16px' }} onClick={() => navigate('/activities')}>
          返回活动列表
        </Button>
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: <Link to="/">首页</Link>,
          },
          {
            title: <Link to="/activities">活动列表</Link>,
          },
          {
            title: activity.title,
          },
        ]}
      />

      <Card>
        <Row gutter={[24, 24]}>
          {/* 活动图片 */}
          <Col xs={24} md={12}>
            <div
              style={{
                width: '100%',
                height: '300px',
                backgroundImage: `url(${activity.image || 'https://via.placeholder.com/600x300?text=No+Image'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
              }}
            />
          </Col>

          {/* 活动信息 */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Tag color={getCategoryColor(activity.category)} style={{ marginRight: '8px' }}>
                    {activity.category}
                  </Tag>
                  <Tag color={getStatusColor(activity.status)}>
                    {getStatusText(activity.status)}
                  </Tag>
                </div>
                <Title level={3} style={{ marginTop: 0 }}>
                  {activity.title}
                </Title>
              </div>

              {/* 编辑和删除按钮 */}
              {isOrganizerOrAdmin() && (
                <div>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    style={{ marginRight: '8px' }}
                    onClick={() => navigate(`/edit-activity/${activity._id}`)}
                  >
                    编辑
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteActivity}
                    loading={deleting}
                  >
                    删除
                  </Button>
                </div>
              )}
            </div>

            <Descriptions column={1} style={{ marginTop: '16px' }}>
              <Descriptions.Item label={<><CalendarOutlined /> 活动时间</>}>
                {formatDate(activity.date)}
              </Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> 活动地点</>}>
                {activity.location}
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> 报名情况</>}>
                {activity.registeredCount}/{activity.capacity} 人已报名
              </Descriptions.Item>
              {activity.price > 0 && (
                <Descriptions.Item label={<><DollarOutlined /> 活动费用</>}>
                  ¥{activity.price.toFixed(2)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={<><UserOutlined /> 组织者</>}>
                {activity.organizer.username}
              </Descriptions.Item>
            </Descriptions>

            {/* 报名按钮 */}
            <div style={{ marginTop: '24px' }}>
              {userRegistration && userRegistration.status === 'confirmed' ? (
                <Button
                  danger
                  size="large"
                  onClick={handleCancelRegistration}
                  loading={cancelling}
                  disabled={isActivityEndedOrCanceled()}
                  block
                >
                  取消报名
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleRegister}
                  loading={registering}
                  disabled={
                    isActivityFull() ||
                    isActivityEndedOrCanceled() ||
                    !!(userRegistration && userRegistration.status === 'canceled')
                  }
                  block
                >
                  {isActivityFull()
                    ? '名额已满'
                    : isActivityEndedOrCanceled()
                    ? '活动已结束'
                    : userRegistration && userRegistration.status === 'canceled'
                    ? '已取消报名'
                    : '立即报名'}
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 活动详情和评论 */}
      <Card style={{ marginTop: '24px' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="活动详情" key="1">
            <div style={{ padding: '16px 0' }}>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {activity.description}
              </Paragraph>
            </div>
          </TabPane>
          <TabPane tab={`评论 (${comments.length})`} key="2">
            <div style={{ padding: '16px 0' }}>
              {/* 评分统计 */}
              {comments.length > 0 && (
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1890ff' }}>
                    {calculateAverageRating()}
                  </div>
                  <Rate disabled defaultValue={Number(calculateAverageRating())} allowHalf />
                  <div style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.45)' }}>
                    {comments.length} 人评价
                  </div>
                </div>
              )}

              {/* 评论表单 */}
              {user && !isOrganizerOrAdmin() && !isActivityEndedOrCanceled() && !hasCommented && (
                <div style={{ marginBottom: '24px' }}>
                  <Divider>发表评论</Divider>
                  <CommentForm activityId={activity._id} onCommentAdded={handleCommentAdded} />
                </div>
              )}

              {/* 评论列表 */}
              <Divider orientation="left">全部评论</Divider>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment
                    key={comment._id}
                    author={<a>{comment.user.username}</a>}
                    avatar={<Avatar icon={<UserOutlined />} />}
                    content={
                      <div>
                        <Rate disabled defaultValue={Number(comment.rating)} />
                        <p style={{ marginTop: '8px' }}>{comment.content}</p>
                      </div>
                    }
                    datetime={<span>{formatDate(comment.createdAt)}</span>}
                  />
                ))
              ) : (
                <Empty description="暂无评论" />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ActivityDetail;