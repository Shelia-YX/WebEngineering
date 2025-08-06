import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks';
import { message } from '../../utils/messageUtils';

interface PasswordFormProps {
  onSuccess?: () => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSuccess }) => {
  const { changePassword } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: { 
    currentPassword: string; 
    newPassword: string; 
  }) => {
    try {
      setSubmitting(true);
      await changePassword(values.currentPassword, values.newPassword);
      message.success('密码修改成功');
      form.resetFields();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('密码修改失败:', error);
      if (error instanceof Error) {
        message.error(error.message || '密码修改失败，请稍后重试');
      } else {
        message.error('密码修改失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="currentPassword"
        label="当前密码"
        rules={[{ required: true, message: '请输入当前密码' }]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="当前密码" 
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="新密码"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
        hasFeedback
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="新密码" 
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="确认新密码"
        dependencies={['newPassword']}
        hasFeedback
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
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={submitting}
        >
          修改密码
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PasswordForm;