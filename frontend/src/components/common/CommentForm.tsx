import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useAuth } from '../../hooks';
import { message } from '../../utils/messageUtils';

interface CommentFormProps {
  activityId?: string;
  onSubmit: (content: string) => Promise<void | boolean>;
  buttonText?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  activityId: _activityId, 
  onSubmit,
  buttonText = '提交评论'
}) => {
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: { content: string }) => {
    if (!isAuthenticated) {
      message.error('请先登录后再评论');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(values.content);
      form.resetFields();
      message.success('评论成功');
    } catch (error) {
      console.error('评论失败:', error);
      message.error('评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        请先登录后再评论
      </div>
    );
  }

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        name="content"
        rules={[
          { required: true, message: '请输入评论内容' },
          { max: 500, message: '评论内容不能超过500个字符' },
        ]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="写下你的评论..."
          maxLength={500}
          showCount
        />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={submitting}
        >
          {buttonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CommentForm;