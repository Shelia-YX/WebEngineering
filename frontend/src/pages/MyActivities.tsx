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
} from 'antd';
import { message } from '../utils/messageUtils';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Activity {
  _id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  status: string;
  price: number;
}

const MyActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取用户创建的活动
  useEffect(() => {
    const fetchMyActivities = async () => {
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
          `${import.meta.env.VITE_API_URL}/api/activities/user/myactivities`,
          config
        );

        setActivities(response.data);
      } catch (error: any) {
        console.error('获取我的活动失败', error);
        message.error(error.response?.data?.message || '获取我的活动失败');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyActivities();
  }, [navigate]);

  // 删除活动
  const handleDelete = async (id: string) => {
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

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/activities/${id}`,
        config
      );

      message.success('活动删除成功');
      setActivities(activities.filter((activity) => activity._id !== id));
    } catch (error: any) {
      console.error('删除活动失败', error);
      message.error(error.response?.data?.message || '删除活动失败');
    }
  };

  // 获取活动状态对应的标签颜色
  const getStatusColor = (status: string) => {
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
  const getStatusText = (status: string) => {
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

  // 表格列定义
  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Activity) => (
        <Link to={`/activities/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: '活动日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '活动地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: '报名人数',
      key: 'registered',
      render: (record: Activity) => `${record.registered}/${record.capacity}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Activity) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-activity/${record._id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个活动吗？"
            description="删除后将无法恢复，已报名的用户将收到通知。"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
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
            title: '我的活动',
          },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} className="page-title">
          我的活动
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/create-activity')}
        >
          创建新活动
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : activities.length === 0 ? (
        <Card className="card-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>您还没有创建任何活动</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/create-activity')}
            >
              创建新活动
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="card-container">
          <Table
            columns={columns}
            dataSource={activities.map((activity) => ({
              ...activity,
              key: activity._id,
            }))}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default MyActivities;