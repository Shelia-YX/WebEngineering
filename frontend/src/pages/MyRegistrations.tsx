import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Table,
  Tag,
  Space,
  Popconfirm,
  Breadcrumb,
  Spin,
  Rate,
  Modal,
  Form,
  Input,
} from 'antd';
import { message } from '../utils/messageUtils';
import { DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface Registration {
  _id: string;
  activity: {
    _id: string;
    title: string;
    date: string;
    location: string;
    category: string;
    status: string;
    price: number;
  };
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  registrationDate: string;
  attended: boolean;
}

const MyRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState('');
  const [form] = Form.useForm();

  // 获取用户报名的活动
  useEffect(() => {
    const fetchMyRegistrations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('请先登录');
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/registrations/user`,
          config
        );

        setRegistrations(response.data);
      } catch (error: any) {
        console.error('获取我的报名失败', error);
        message.error(error.response?.data?.message || '获取我的报名失败');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyRegistrations();
  }, [navigate]);

  // 取消报名
  const handleCancelRegistration = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/registrations/${id}`,
        { status: 'canceled' },
        config
      );

      message.success('报名取消成功');
      // 更新本地状态
      setRegistrations(
        registrations.map((reg) =>
          reg._id === id ? { ...reg, status: 'canceled' } : reg
        )
      );
    } catch (error: any) {
      console.error('取消报名失败', error);
      message.error(error.response?.data?.message || '取消报名失败');
    }
  };

  // 提交评论
  const handleSubmitComment = async (values: { content: string; rating: number }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comments`,
        {
          activityId: currentActivityId,
          content: values.content,
          rating: values.rating,
        },
        config
      );

      message.success('评论提交成功');
      setCommentModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error('提交评论失败', error);
      message.error(error.response?.data?.message || '提交评论失败');
    }
  };

  // 打开评论模态框
  const openCommentModal = (activityId: string) => {
    setCurrentActivityId(activityId);
    setCommentModalVisible(true);
  };

  // 获取报名状态对应的标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'canceled':
        return 'red';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  // 获取报名状态的中文名称
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'pending':
        return '待确认';
      case 'canceled':
        return '已取消';
      case 'rejected':
        return '已拒绝';
      default:
        return '未知状态';
    }
  };

  // 获取活动状态对应的标签颜色
  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'blue';
      case 'ongoing':
        return 'green';
      case 'completed':
        return 'gray';
      case 'canceled':
        return 'red';
      default:
        return 'default';
    }
  };

  // 获取活动状态的中文名称
  const getActivityStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '即将开始';
      case 'ongoing':
        return '进行中';
      case 'completed':
        return '已结束';
      case 'canceled':
        return '已取消';
      default:
        return '未知状态';
    }
  };

  // 获取支付状态对应的标签颜色
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'unpaid':
        return 'orange';
      case 'refunded':
        return 'gray';
      default:
        return 'default';
    }
  };

  // 获取支付状态的中文名称
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return '已支付';
      case 'unpaid':
        return '未支付';
      case 'refunded':
        return '已退款';
      default:
        return '未知状态';
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '活动名称',
      dataIndex: ['activity', 'title'],
      key: 'title',
      render: (text: string, record: Registration) => (
        <Link to={`/activities/${record.activity._id}`}>{text}</Link>
      ),
    },
    {
      title: '活动日期',
      dataIndex: ['activity', 'date'],
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '活动地点',
      dataIndex: ['activity', 'location'],
      key: 'location',
    },
    {
      title: '类别',
      dataIndex: ['activity', 'category'],
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: '活动状态',
      dataIndex: ['activity', 'status'],
      key: 'activityStatus',
      render: (status: string) => (
        <Tag color={getActivityStatusColor(status)}>
          {getActivityStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string, record: Registration) => (
        <Space>
          <Tag color={getPaymentStatusColor(status)}>
            {getPaymentStatusText(status)}
          </Tag>
          {record.paymentAmount > 0 && (
            <span>¥{record.paymentAmount.toFixed(2)}</span>
          )}
        </Space>
      ),
    },
    {
      title: '报名日期',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Registration) => (
        <Space size="middle">
          {record.status !== 'canceled' &&
            record.activity.status !== 'canceled' &&
            record.activity.status !== 'completed' && (
              <Popconfirm
                title="确定要取消报名吗？"
                description="取消后可能无法再次报名，具体取决于活动设置。"
                onConfirm={() => handleCancelRegistration(record._id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  取消报名
                </Button>
              </Popconfirm>
            )}
          {record.activity.status === 'completed' && (
            <Button
              type="text"
              icon={<CommentOutlined />}
              onClick={() => openCommentModal(record.activity._id)}
            >
              评价
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: <Link to="/">首页</Link>,
          },
          {
            title: '我的报名',
          },
        ]}
      />

      <Title level={2} className="page-title">
        我的报名
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : registrations.length === 0 ? (
        <Card className="card-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>您还没有报名任何活动</p>
            <Button type="primary" onClick={() => navigate('/activities')}>
              浏览活动
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="card-container">
          <Table
            columns={columns}
            dataSource={registrations.map((registration) => ({
              ...registration,
              key: registration._id,
            }))}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      )}

      {/* 评论模态框 */}
      <Modal
        title="评价活动"
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitComment}>
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请给活动评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="content"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请分享您对活动的感受、建议或意见"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交评价
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyRegistrations;