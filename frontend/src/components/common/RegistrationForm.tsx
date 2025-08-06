import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Checkbox, Divider, Space, Typography } from 'antd';
import { useAuth } from '../../hooks';
import { formatCurrency } from '../../utils';
import { message } from '../../utils/messageUtils';

const { Text, Title } = Typography;

interface RegistrationFormProps {
  activityId: string;
  activityTitle: string;
  price: number;
  onSubmit: (data: RegistrationData) => Promise<void>;
  buttonText?: string;
}

export interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  numberOfTickets: number;
  agreeToTerms: boolean;
  remarks?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  activityId,
  activityTitle,
  price,
  onSubmit,
  buttonText = '提交报名',
}) => {
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm<RegistrationData>();
  const [submitting, setSubmitting] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);

  // 计算总价
  const totalPrice = price * ticketCount;

  // 初始化表单数据
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.username,
        email: user.email || '',
        phone: user.phone || '',
        numberOfTickets: 1,
        agreeToTerms: false,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: RegistrationData) => {
    if (!isAuthenticated) {
      message.error('请先登录后再报名');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(values);
      message.success('报名成功');
    } catch (error) {
      console.error('报名失败:', error);
      message.error('报名失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 票数变化时更新状态
  const handleTicketCountChange = (value: number | null) => {
    if (value !== null) {
      setTicketCount(value);
      form.setFieldValue('numberOfTickets', value);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        请先登录后再报名
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        numberOfTickets: 1,
        agreeToTerms: false,
      }}
    >
      <Title level={4}>报名信息</Title>
      <Text type="secondary">活动：{activityTitle}</Text>
      
      <Divider />
      
      <Form.Item
        label="姓名"
        name="name"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入您的姓名" />
      </Form.Item>

      <Form.Item
        label="手机号码"
        name="phone"
        rules={[
          { required: true, message: '请输入手机号码' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
        ]}
      >
        <Input placeholder="请输入您的手机号码" />
      </Form.Item>

      <Form.Item
        label="邮箱"
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input placeholder="请输入您的邮箱" />
      </Form.Item>

      <Form.Item
        label="票数"
        name="numberOfTickets"
        rules={[{ required: true, message: '请选择票数' }]}
      >
        <InputNumber 
          min={1} 
          max={10} 
          onChange={handleTicketCountChange} 
          style={{ width: '100%' }} 
        />
      </Form.Item>

      <Form.Item
        label="备注"
        name="remarks"
      >
        <Input.TextArea 
          rows={4} 
          placeholder="如有特殊需求，请在此说明" 
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Divider />
      
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical">
          <Text>票价: {formatCurrency(price)} × {ticketCount} = {formatCurrency(totalPrice)}</Text>
          {price > 0 && (
            <Text type="secondary">提交报名后，请按照系统提示完成支付</Text>
          )}
        </Space>
      </div>

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
        <Checkbox>我已阅读并同意<a href="#">活动条款</a>和<a href="#">隐私政策</a></Checkbox>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={submitting}
          block
        >
          {buttonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegistrationForm;