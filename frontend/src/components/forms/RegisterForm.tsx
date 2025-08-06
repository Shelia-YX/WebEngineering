import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants';
import { message } from '../../utils/messageUtils';

const { Title, Text } = Typography;

interface RegisterFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  redirectPath = ROUTES.HOME,
  onSuccess 
}) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { 
    username: string; 
    email: string; 
    password: string; 
    phone?: string;
    agreeToTerms: boolean;
  }) => {
    try {
      setLoading(true);
      await register(values.username, values.email, values.password, values.phone);
      message.success('注册成功');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('注册失败:', error);
      if (error instanceof Error) {
        message.error(error.message || '注册失败，请稍后重试');
      } else {
        message.error('注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
        用户注册
      </Title>
      
      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        size="large"
        layout="vertical"
        scrollToFirstError
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 2, message: '用户名至少2个字符' },
            { max: 20, message: '用户名最多20个字符' },
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="邮箱" 
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', validateTrigger: 'onBlur' },
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="手机号码（选填）" 
            autoComplete="tel"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
          hasFeedback
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请确认密码' },
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
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="确认密码" 
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="agreeToTerms"
          valuePropName="checked"
          rules={[
            { 
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意条款')),
            },
          ]}
        >
          <Checkbox>我已阅读并同意<a href="#">服务条款</a>和<a href="#">隐私政策</a></Checkbox>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
          >
            注册
          </Button>
        </Form.Item>

        <Divider plain>或者</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text>已有账号? </Text>
          <Link to={ROUTES.LOGIN}>立即登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;