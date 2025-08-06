import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants';
import { message } from '../../utils/messageUtils';

const { Title, Text } = Typography;

interface LoginFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  redirectPath = ROUTES.HOME,
  onSuccess 
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    try {
      setLoading(true);
      await login(values.email, values.password, values.remember);
      
      // 登录成功消息已在useAuth中处理
      // 使用requestAnimationFrame确保状态更新后再执行回调或导航
      requestAnimationFrame(() => {
        if (onSuccess) {
          onSuccess();
        } else if (redirectPath !== ROUTES.HOME) {
          // 只有当重定向路径不是首页时才导航，避免与useAuth中的导航冲突
          navigate(redirectPath);
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      // 错误消息已在useAuth中处理，这里不需要重复显示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
        用户登录
      </Title>
      
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="邮箱" 
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Link to={ROUTES.FORGOT_PASSWORD}>忘记密码?</Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
          >
            登录
          </Button>
        </Form.Item>

        <Divider plain>或者</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text>还没有账号? </Text>
          <Link to={ROUTES.REGISTER}>立即注册</Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;