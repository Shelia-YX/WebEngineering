import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Select, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks';
import { ROUTES } from '../../constants';
import ImageUpload from '../common/ImageUpload';
import dayjs from 'dayjs';
import { message } from '../../utils/messageUtils';

const { TextArea } = Input;
const { Option } = Select;

export interface ActivityFormData {
  title: string;
  description: string;
  date: string | dayjs.Dayjs;
  location: string;
  category: string;
  capacity: number;
  price: number;
  image?: string;
  status?: string;
}

interface ActivityFormProps {
  initialValues?: Partial<ActivityFormData>;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  submitButtonText?: string;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialValues,
  onSubmit,
  submitButtonText = '提交',
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();
  const [submitting, setSubmitting] = useState(false);

  // 获取类别数据
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 设置初始值
  useEffect(() => {
    if (initialValues) {
      const formValues = { ...initialValues };
      
      // 转换日期格式
      if (formValues.date) {
        formValues.date = dayjs(formValues.date);
      }
      
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      // 转换日期格式
      const formattedValues: ActivityFormData = {
        ...values,
        date: values.date ? values.date.toISOString() : '',
      };

      await onSubmit(formattedValues);
      message.success(`活动${isEdit ? '更新' : '创建'}成功`);
      
      if (!isEdit) {
        form.resetFields();
      }
      
      // 如果是创建活动，跳转到活动列表页
      if (!isEdit) {
        navigate(ROUTES.MY_ACTIVITIES);
      }
    } catch (error) {
      console.error(`活动${isEdit ? '更新' : '创建'}失败:`, error);
      message.error(`活动${isEdit ? '更新' : '创建'}失败，请稍后重试`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        capacity: 20,
        price: 0,
        status: 'draft',
      }}
    >
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
          >
            <Input placeholder="请输入活动标题" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea 
              placeholder="请输入活动描述" 
              rows={6} 
              maxLength={2000} 
              showCount 
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date"
                label="活动日期时间"
                rules={[{ required: true, message: '请选择活动日期时间' }]}
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm" 
                  style={{ width: '100%' }} 
                  placeholder="选择日期和时间"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="活动地点"
                rules={[{ required: true, message: '请输入活动地点' }]}
              >
                <Input placeholder="请输入活动地点" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="category"
                label="活动类别"
                rules={[{ required: true, message: '请选择活动类别' }]}
              >
                <Select 
                  placeholder="选择类别" 
                  loading={categoriesLoading}
                >
                  {categories.map(category => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="capacity"
                label="人数上限"
                rules={[{ required: true, message: '请输入人数上限' }]}
              >
                <InputNumber 
                  min={1} 
                  max={10000} 
                  style={{ width: '100%' }} 
                  placeholder="人数上限"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="price"
                label="活动价格"
                rules={[{ required: true, message: '请输入活动价格' }]}
                extra="0表示免费"
              >
                <InputNumber 
                  min={0} 
                  precision={2} 
                  style={{ width: '100%' }} 
                  placeholder="活动价格"
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          {isEdit && (
            <Form.Item
              name="status"
              label="活动状态"
              rules={[{ required: true, message: '请选择活动状态' }]}
            >
              <Select placeholder="选择状态">
                <Option value="draft">草稿</Option>
                <Option value="published">已发布</Option>
                <Option value="cancelled">已取消</Option>
                <Option value="completed">已结束</Option>
              </Select>
            </Form.Item>
          )}
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="image"
            label="活动封面图"
            extra="建议尺寸: 800x600px, 最大2MB"
          >
            <ImageUpload />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {submitButtonText}
        </Button>
        <Button 
          style={{ marginLeft: 8 }} 
          onClick={() => navigate(-1)}
        >
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ActivityForm;