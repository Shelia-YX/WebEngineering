import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks';
import ImageUpload from '../common/ImageUpload';
import { message } from '../../utils/messageUtils';

interface ProfileFormData {
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

interface ProfileFormProps {
  onSuccess?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess }) => {
  const { user, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 设置初始值
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: ProfileFormData) => {
    if (!user) return;

    try {
      setSubmitting(true);
      await updateProfile(values);
      message.success('个人资料更新成功');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      message.error('更新个人资料失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱" 
              disabled // 邮箱通常不允许修改
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', validateTrigger: 'onBlur' },
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="手机号码（选填）" 
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
          >
            <Input.TextArea 
              placeholder="介绍一下自己吧（选填）" 
              rows={4} 
              maxLength={200} 
              showCount 
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="avatar"
            label="头像"
            extra="建议尺寸: 200x200px, 最大2MB"
          >
            <ImageUpload />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={submitting}
        >
          保存修改
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileForm;