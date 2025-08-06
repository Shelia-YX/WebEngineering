import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Tabs,
  Table,
  Tag,
  Space,
  Popconfirm,
  Breadcrumb,
  Spin,
  Select,
  Input,
  Modal,
} from 'antd';
import { message } from '../utils/messageUtils';
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { activityApi, registrationApi } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Activity {
  _id: string;
  title: string;
  organizer: {
    _id: string;
    username: string;
  };
  date: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  status: string;
  price: number;
}

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
  };
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  registrationDate: string;
  attended: boolean;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 使用 useAuth 钩子获取管理员状态，不再需要手动检查
  useEffect(() => {
    // 直接从 isAdmin 状态获取，这个状态已经在 AdminRoute 组件中被验证过了
    setIsAdmin(true);
  }, []);

  // 获取用户列表
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
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
          `${import.meta.env.VITE_API_URL}/api/users`,
          config
        );

        setUsers(response.data);
      } catch (error: any) {
        console.error('获取用户列表失败', error);
        message.error(error.response?.data?.message || '获取用户列表失败');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === '1') {
      fetchUsers();
    }
  }, [navigate, activeTab, isAdmin]);

  // 获取活动列表
  useEffect(() => {
    if (!isAdmin) return;

    const fetchActivities = async (page = currentPage, limit = pageSize) => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('请先登录');
          navigate('/login');
          return;
        }

        console.log('正在获取活动列表...');
        console.log('使用 activityApi.getAllActivitiesAdmin 获取活动列表');
        
        const response = await activityApi.getAllActivitiesAdmin({
          page,
          limit,
          search: activitySearch || undefined
        });

        console.log('获取活动列表成功:', response.data);
        // 后端返回的是包含activities字段的对象
        if (response.data.activities) {
          setActivities(response.data.activities);
          setTotalActivities(response.data.total || 0);
          setCurrentPage(response.data.page || 1);
        } else {
          // 如果后端直接返回了数组，也能正确处理
          setActivities(response.data);
        }
      } catch (error: any) {
        console.error('获取活动列表失败', error);
        console.error('错误详情:', error.response || error.message || error);
        message.error(error.response?.data?.message || '获取活动列表失败');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === '2') {
      fetchActivities(currentPage, pageSize);
    }
  }, [navigate, activeTab, isAdmin, currentPage, pageSize, activitySearch]);
  
  // 处理活动列表分页变化
  const handleActivityPaginationChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // 获取报名列表
  const [totalRegistrations, setTotalRegistrations] = useState<number>(0);
  const [registrationCurrentPage, setRegistrationCurrentPage] = useState<number>(1);
  const [registrationPageSize, setRegistrationPageSize] = useState<number>(10);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchRegistrations = async (page = registrationCurrentPage, limit = registrationPageSize) => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('请先登录');
          navigate('/login');
          return;
        }

        console.log('正在获取报名列表...');
        console.log('使用 registrationApi.getAllRegistrationsAdmin 获取报名列表');
        
        const response = await registrationApi.getAllRegistrationsAdmin({
          page,
          limit,
          search: registrationSearch || undefined
        });


        console.log('获取报名列表成功:', response.data);
        // 后端返回的是包含registrations字段的对象，而不是直接的报名数组
        if (response.data.registrations) {
          setRegistrations(response.data.registrations);
          setTotalRegistrations(response.data.total || 0);
          setRegistrationCurrentPage(response.data.page || 1);
        } else {
          // 如果后端直接返回了数组，也能正确处理
          setRegistrations(response.data);
        }
      } catch (error: any) {
        console.error('获取报名列表失败', error);
        console.error('错误详情:', error.response || error.message || error);
        message.error(error.response?.data?.message || '获取报名列表失败');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === '3') {
      fetchRegistrations(registrationCurrentPage, registrationPageSize);
    }
  }, [navigate, activeTab, isAdmin, registrationCurrentPage, registrationPageSize, registrationSearch]);
  
  // 处理报名列表分页变化
  const handleRegistrationPaginationChange = (page: number, pageSize?: number) => {
    setRegistrationCurrentPage(page);
    if (pageSize) setRegistrationPageSize(pageSize);
  };

  // 更新用户角色
  const handleUpdateUserRole = async (userId: string, role: string) => {
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
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/role`,
        { role },
        config
      );

      message.success('用户角色更新成功');
      // 更新本地状态
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role } : user
        )
      );
    } catch (error: any) {
      console.error('更新用户角色失败', error);
      message.error(error.response?.data?.message || '更新用户角色失败');
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
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
        `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
        config
      );

      message.success('用户删除成功');
      // 更新本地状态
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error: any) {
      console.error('删除用户失败', error);
      message.error(error.response?.data?.message || '删除用户失败');
    }
  };

  // 删除活动
  const handleDeleteActivity = async (activityId: string) => {
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
        `${import.meta.env.VITE_API_URL}/api/activities/${activityId}`,
        config
      );

      message.success('活动删除成功');
      // 更新本地状态
      setActivities(activities.filter((activity) => activity._id !== activityId));
    } catch (error: any) {
      console.error('删除活动失败', error);
      message.error(error.response?.data?.message || '删除活动失败');
    }
  };

  // 更新活动状态
  const handleUpdateActivityStatus = async (activityId: string, status: string) => {
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
        `${import.meta.env.VITE_API_URL}/api/activities/${activityId}`,
        { status },
        config
      );

      message.success('活动状态更新成功');
      // 更新本地状态
      setActivities(
        activities.map((activity) =>
          activity._id === activityId ? { ...activity, status } : activity
        )
      );
    } catch (error: any) {
      console.error('更新活动状态失败', error);
      message.error(error.response?.data?.message || '更新活动状态失败');
    }
  };

  // 更新报名状态
  const handleUpdateRegistrationStatus = async (registrationId: string, status: string) => {
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
        `${import.meta.env.VITE_API_URL}/api/registrations/${registrationId}`,
        { status },
        config
      );

      message.success('报名状态更新成功');
      // 更新本地状态
      setRegistrations(
        registrations.map((registration) =>
          registration._id === registrationId ? { ...registration, status } : registration
        )
      );
    } catch (error: any) {
      console.error('更新报名状态失败', error);
      message.error(error.response?.data?.message || '更新报名状态失败');
    }
  };

  // 更新支付状态
  const handleUpdatePaymentStatus = async (registrationId: string, paymentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      console.log('更新支付状态', registrationId, paymentStatus);
      
      // 使用 registrationApi 而不是直接使用 axios
      await registrationApi.updatePaymentStatus(registrationId, paymentStatus);

      message.success('支付状态更新成功');
      // 更新本地状态
      setRegistrations(
        registrations.map((registration) =>
          registration._id === registrationId ? { ...registration, paymentStatus } : registration
        )
      );
    } catch (error: any) {
      console.error('更新支付状态失败', error);
      message.error(error.response?.data?.message || '更新支付状态失败');
    }
  };

  // 删除报名
  const handleDeleteRegistration = async (registrationId: string) => {
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
        `${import.meta.env.VITE_API_URL}/api/registrations/${registrationId}`,
        config
      );

      message.success('报名删除成功');
      // 更新本地状态
      setRegistrations(registrations.filter((registration) => registration._id !== registrationId));
    } catch (error: any) {
      console.error('删除报名失败', error);
      message.error(error.response?.data?.message || '删除报名失败');
    }
  };

  // 获取角色对应的标签颜色
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'organizer':
        return 'blue';
      case 'user':
        return 'green';
      default:
        return 'default';
    }
  };

  // 获取角色的中文名称
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'organizer':
        return '组织者';
      case 'user':
        return '普通用户';
      default:
        return '未知角色';
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

  // 获取报名状态对应的标签颜色
  const getRegistrationStatusColor = (status: string) => {
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
  const getRegistrationStatusText = (status: string) => {
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

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{getRoleText(role)}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: User) => (
        <Space size="middle">
          <Select
            defaultValue={record.role}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateUserRole(record._id, value)}
            disabled={record.role === 'admin'}
          >
            <Option value="user">普通用户</Option>
            <Option value="organizer">组织者</Option>
            <Option value="admin">管理员</Option>
          </Select>
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="删除后将无法恢复，用户的所有数据将被删除。"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="确定"
            cancelText="取消"
            disabled={record.role === 'admin'}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.role === 'admin'}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 活动表格列定义
  const activityColumns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Activity) => (
        <Link to={`/activities/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: '组织者',
      dataIndex: ['organizer', 'username'],
      key: 'organizer',
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
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateActivityStatus(record._id, value)}
          >
            <Option value="upcoming">即将开始</Option>
            <Option value="ongoing">进行中</Option>
            <Option value="completed">已结束</Option>
            <Option value="canceled">已取消</Option>
          </Select>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-activity/${record._id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个活动吗？"
            description="删除后将无法恢复，所有相关的报名和评论也将被删除。"
            onConfirm={() => handleDeleteActivity(record._id)}
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

  // 报名表格列定义
  const registrationColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: '活动',
      dataIndex: ['activity', 'title'],
      key: 'activity',
      render: (text: string, record: Registration) => (
        <Link to={`/activities/${record.activity._id}`}>{text}</Link>
      ),
    },
    {
      title: '活动日期',
      dataIndex: ['activity', 'date'],
      key: 'activityDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getRegistrationStatusColor(status)}>
          {getRegistrationStatusText(status)}
        </Tag>
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
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateRegistrationStatus(record._id, value)}
          >
            <Option value="confirmed">已确认</Option>
            <Option value="pending">待确认</Option>
            <Option value="canceled">已取消</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
          <Select
            defaultValue={record.paymentStatus}
            style={{ width: 120 }}
            onChange={(value) => handleUpdatePaymentStatus(record._id, value)}
          >
            <Option value="paid">已支付</Option>
            <Option value="unpaid">未支付</Option>
            <Option value="refunded">已退款</Option>
          </Select>
          <Popconfirm
            title="确定要删除这个报名记录吗？"
            description="删除后将无法恢复，活动的报名人数将相应减少。"
            onConfirm={() => handleDeleteRegistration(record._id)}
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

  // 过滤用户数据
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // 过滤活动数据
  const filteredActivities = activities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      activity.location.toLowerCase().includes(activitySearch.toLowerCase()) ||
      activity.category.toLowerCase().includes(activitySearch.toLowerCase())
  );

  // 过滤报名数据
  const filteredRegistrations = registrations.filter(
    (registration) =>
      registration.user.username
        .toLowerCase()
        .includes(registrationSearch.toLowerCase()) ||
      registration.user.email
        .toLowerCase()
        .includes(registrationSearch.toLowerCase()) ||
      registration.activity.title
        .toLowerCase()
        .includes(registrationSearch.toLowerCase())
  );

  if (!isAdmin) {
    return null; // 非管理员不显示内容
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
            title: '管理员面板',
          },
        ]}
      />

      <Title level={2} className="page-title">
        管理员面板
      </Title>

      <Card className="card-container">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <span>
                  <UserOutlined /> 用户管理
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Input
                      placeholder="搜索用户名或邮箱"
                      prefix={<SearchOutlined />}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ width: 300 }}
                    />
                  </div>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Table
                      columns={userColumns}
                      dataSource={filteredUsers.map((user) => ({
                        ...user,
                        key: user._id,
                      }))}
                      pagination={{
                        pageSize: 10,
                        showTotal: (total) => `共 ${total} 条记录`,
                      }}
                    />
                  )}
                </>
              )
            },
            {
              key: '2',
              label: (
                <span>
                  <CalendarOutlined /> 活动管理
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Input.Search
                      placeholder="搜索活动名称、地点或类别"
                      prefix={<SearchOutlined />}
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      onSearch={(value) => {
                        setActivitySearch(value);
                        setCurrentPage(1); // 重置页码
                      }}
                      style={{ width: 300 }}
                      enterButton
                    />
                  </div>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Table
                      columns={activityColumns}
                      dataSource={activities.map((activity) => ({
                        ...activity,
                        key: activity._id,
                      }))}
                      pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalActivities,
                        onChange: handleActivityPaginationChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                      }}
                    />
                  )}
                </>
              )
            },
            {
              key: '3',
              label: (
                <span>
                  <TeamOutlined /> 报名管理
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Input.Search
                      placeholder="搜索报名用户或活动"
                      prefix={<SearchOutlined />}
                      value={registrationSearch}
                      onChange={(e) => setRegistrationSearch(e.target.value)}
                      onSearch={() => {
                        setRegistrationCurrentPage(1); // 重置页码
                      }}
                      style={{ width: 300 }}
                      enterButton
                    />
                  </div>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Table
                      columns={registrationColumns}
                      dataSource={registrations.map((registration) => ({
                        ...registration,
                        key: registration._id,
                      }))}
                      pagination={{
                        current: registrationCurrentPage,
                        pageSize: registrationPageSize,
                        total: totalRegistrations,
                        onChange: handleRegistrationPaginationChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                      }}
                    />
                  )}
                </>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default AdminPanel;