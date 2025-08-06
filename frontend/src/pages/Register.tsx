import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks';
import { message } from '../utils/messageUtils';

const { Title } = Typography;

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormData) => {
    const { username, email, password } = values;
    
    setLoading(true);
    try {
      // 使用AuthContext中的register方法，确保全局状态更新
      await register(username, email, password);
      // 注册成功后，useAuth钩子会自动更新全局状态并导航到首页
      // 不需要额外的导航或消息提示，这些已在useAuth中处理
    } catch (error: any) {
      console.error('注册失败', error);
      // 错误消息已在useAuth中处理，这里不需要重复显示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Card
        className="form-container"
        style={{ maxWidth: '400px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            用户注册
          </Title>
          <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>创建一个新账号，开始您的体育活动之旅</p>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入您的用户名' },
              { min: 3, message: '用户名至少需要3个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入您的邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入您的密码' },
              { min: 6, message: '密码至少需要6个字符' },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认您的密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>

          <Divider plain>或者</Divider>

          <div style={{ textAlign: 'center' }}>
            <p>
              已有账号？{' '}
              <Link to="/login" style={{ fontWeight: 'bold' }}>
                立即登录
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;