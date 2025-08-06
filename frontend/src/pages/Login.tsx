import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks';
import { message } from '../utils/messageUtils';

const { Title } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // 使用AuthContext中的login方法，确保全局状态更新
      await login(values.email, values.password);
      // 登录成功后，useAuth钩子会自动更新全局状态并导航到首页
      // 不需要额外的导航或消息提示，这些已在useAuth中处理
    } catch (error: any) {
      console.error('登录失败', error);
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
            用户登录
          </Title>
          <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>欢迎回来，请登录您的账号</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入您的邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入您的密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <Divider plain>或者</Divider>

          <div style={{ textAlign: 'center' }}>
            <p>
              还没有账号？{' '}
              <Link to="/register" style={{ fontWeight: 'bold' }}>
                立即注册
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;