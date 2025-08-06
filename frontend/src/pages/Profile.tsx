import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Spin,
  Tabs,
  Avatar,
  Row,
  Col,
  Breadcrumb,
  Divider,
} from 'antd';
import { message } from '../utils/messageUtils';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks';

const { Title } = Typography;

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user: authUser, isAuthenticated, updateProfile } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('1');

  // 使用 useAuth 中的用户信息
  useEffect(() => {
    console.log('Profile: useEffect 执行，检查认证状态');
    console.log('Profile: isAuthenticated =', isAuthenticated);
    console.log('Profile: authUser =', authUser);
    
    // 如果未登录，重定向到登录页
    if (!isAuthenticated) {
      console.log('Profile: 用户未认证，重定向到登录页');
      message.error('请先登录');
      navigate('/login');
      return;
    }

    // 如果 authUser 存在，直接使用它
    if (authUser) {
      console.log('Profile: 使用 authUser 数据');
      setUserData(authUser);
      form.setFieldsValue({
        username: authUser.username,
        email: authUser.email,
      });
      return;
    }
    
    // 定义获取用户信息的函数
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // 使用 API 获取最新的用户信息
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        console.log('Profile: API 获取用户信息成功', response.data);
        setUserData(response.data);
        form.setFieldsValue({
          username: response.data.username,
          email: response.data.email,
        });
      } catch (error: any) {
        console.error('Profile: 获取用户信息失败', error);
        message.error(error.response?.data?.message || '获取用户信息失败');
        if (error.response?.status === 401) {
          console.log('Profile: 401 错误，清除本地存储并重定向到登录页');
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // 如果已认证但没有用户信息，则从API获取
    fetchUserProfile();

    // 如果 authUser 不存在，但已认证，则从 API 获取用户信息
    // 这种情况应该很少发生，因为 useAuth 应该已经处理了用户信息的获取
    console.log('Profile: authUser 不存在但已认证，尝试从 API 获取用户信息');
  }, [navigate, form, authUser, isAuthenticated]);

  // 更新个人信息
  const handleUpdateProfile = async (values: { username: string; email: string }) => {
    setLoading(true);
    try {
      // 使用 useAuth 中的 updateProfile 函数
      const updatedUser = await updateProfile(values);
      setUserData(updatedUser);
      message.success('个人信息更新成功');
    } catch (error: any) {
      console.error('更新个人信息失败', error);
      message.error(error.message || '更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新密码
  const handleUpdatePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    try {
      console.log('Profile: 更新密码');
      
      // 使用 useAuth 中的 changePassword 函数
      if (!isAuthenticated) {
        console.log('Profile: 用户未认证，无法更新密码');
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      // 直接使用 axios 调用 API
      // 这里可以改为使用 useAuth 中的 changePassword 函数，如果它存在的话
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/password`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log('Profile: 密码更新成功');
      message.success('密码更新成功，请重新登录');
      passwordForm.resetFields();
      
      // 清除登录信息，重新登录
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/login');
    } catch (error: any) {
      console.error('Profile: 更新密码失败', error);
      message.error(error.response?.data?.message || '更新密码失败');
      
      // 如果是 401 错误，清除本地存储并重定向到登录页
      if (error.response?.status === 401) {
        console.log('Profile: 401 错误，清除本地存储并重定向到登录页');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if ((loading && !userData) || !isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
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
            title: '个人中心',
          },
        ]}
      />

      <Title level={2} className="page-title">
        个人中心
      </Title>

      <Row gutter={24}>
        <Col xs={24} sm={24} md={8} lg={6}>
          <Card className="card-container" style={{ marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={80} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '4px' }}>
                {userData?.username}
              </Title>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{userData?.email}</div>
              <Divider />
              <div style={{ textAlign: 'left' }}>
                <p>
                  <strong>角色：</strong> {userData?.role === 'admin' ? '管理员' : userData?.role === 'organizer' ? '组织者' : '普通用户'}
                </p>
                <p>
                  <strong>注册时间：</strong> {new Date(userData?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={16} lg={18}>
          <Card className="card-container">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: '1',
                  label: '个人信息',
                  children: (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                      initialValues={{
                        username: userData?.username,
                        email: userData?.email,
                      }}
                    >
                      <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="用户名" />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="邮箱" />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                        >
                          更新信息
                        </Button>
                      </Form.Item>
                    </Form>
                  )
                },
                {
                  key: '2',
                  label: '修改密码',
                  children: (
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleUpdatePassword}
                    >
                      <Form.Item
                        name="currentPassword"
                        label="当前密码"
                        rules={[{ required: true, message: '请输入当前密码' }]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="当前密码"
                        />
                      </Form.Item>

                      <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                          { required: true, message: '请输入新密码' },
                          { min: 6, message: '密码长度不能少于6个字符' },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="新密码"
                        />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        label="确认新密码"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: '请确认新密码' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="确认新密码"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                        >
                          更新密码
                        </Button>
                      </Form.Item>
                    </Form>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;