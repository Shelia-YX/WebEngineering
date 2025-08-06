import { useState } from 'react';
import { Form, Input, Button, Rate } from 'antd';
import axios from 'axios';
import { message } from '../../utils/messageUtils';

const { TextArea } = Input;

interface CommentFormProps {
  activityId: string;
  onCommentAdded: () => void;
}

interface CommentFormData {
  content: string;
  rating: number;
}

const CommentForm = ({ activityId, onCommentAdded }: CommentFormProps) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: CommentFormData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comments`,
        {
          activityId: activityId,
          content: values.content,
          rating: values.rating,
        },
        config
      );

      message.success('评论发表成功');
      form.resetFields();
      onCommentAdded();
    } catch (error: any) {
      console.error('发表评论失败', error);
      message.error(error.response?.data?.message || '发表评论失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="rating"
        label="评分"
        rules={[{ required: true, message: '请给出评分' }]}
      >
        <Rate allowHalf />
      </Form.Item>
      <Form.Item
        name="content"
        label="评论内容"
        rules={[{ required: true, message: '请输入评论内容' }]}
      >
        <TextArea rows={4} placeholder="分享您对这个活动的看法和体验..." />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          提交评论
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CommentForm;