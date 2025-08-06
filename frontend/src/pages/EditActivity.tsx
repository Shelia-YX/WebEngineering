import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Upload,
  Card,
  Typography,
  Spin,
  Breadcrumb,
} from 'antd';
import { message } from '../utils/messageUtils';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ActivityFormData {
  title: string;
  description: string;
  location: string;
  date: dayjs.Dayjs;
  duration: number;
  capacity: number;
  price: number;
  category: string;
  image: string;
  status: string;
}

const EditActivity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [initialValues, setInitialValues] = useState<any>(null);

  // 获取活动详情
  useEffect(() => {
    const fetchActivityDetail = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('请先登录');
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/activities/${id}`,
          config
        );

        const activity = response.data;
        
        // 设置初始值
        const initialData = {
          ...activity,
          date: dayjs(activity.date),
        };

        setInitialValues(initialData);
        form.setFieldsValue(initialData);
        setImageUrl(activity.image);

        // 如果有图片，设置文件列表
        if (activity.image) {
          setFileList([
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: activity.image,
            },
          ]);
        }

        setFetching(false);
      } catch (error: any) {
        console.error('获取活动详情失败', error);
        message.error(error.response?.data?.message || '获取活动详情失败');
        navigate('/activities');
      }
    };

    fetchActivityDetail();
  }, [id, navigate, form]);

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    // 这里应该实现图片上传到服务器或云存储的逻辑
    // 为了演示，我们使用一个假的URL
    try {
      // 模拟上传
      const fakeUrl = URL.createObjectURL(file);
      setImageUrl(fakeUrl);
      
      // 实际项目中，应该使用以下代码上传到服务器
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData);
      // setImageUrl(response.data.imageUrl);
      
      return fakeUrl;
    } catch (error) {
      console.error('上传图片失败', error);
      message.error('上传图片失败');
      return '';
    }
  };

  // 处理表单提交
  const onFinish = async (values: ActivityFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // 格式化日期
      const formattedValues = {
        ...values,
        date: values.date.toISOString(),
        image: imageUrl || initialValues.image,
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/activities/${id}`,
        formattedValues,
        config
      );

      message.success('活动更新成功');
      navigate(`/activities/${id}`);
    } catch (error: any) {
      console.error('更新活动失败', error);
      message.error(error.response?.data?.message || '更新活动失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 上传按钮
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  // 处理上传前的操作
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    return isImage && isLt2M;
  };

  // 处理上传变化
  const handleChange = async ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const url = await handleImageUpload(fileList[0].originFileObj);
      setImageUrl(url);
    } else if (fileList.length > 0 && fileList[0].url) {
      setImageUrl(fileList[0].url);
    } else {
      setImageUrl('');
    }
  };

  if (fetching) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: <Link to="/">首页</Link>,
          },
          {
            title: <Link to="/activities">活动列表</Link>,
          },
          {
            title: <Link to={`/activities/${id}`}>{initialValues?.title}</Link>,
          },
          {
            title: '编辑活动',
          },
        ]}
      />

      <Title level={2} className="page-title">
        编辑活动
      </Title>

      <Card className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
          >
            <Input placeholder="请输入活动标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea rows={6} placeholder="请详细描述活动内容、要求等信息" />
          </Form.Item>

          <Form.Item
            name="location"
            label="活动地点"
            rules={[{ required: true, message: '请输入活动地点' }]}
          >
            <Input placeholder="请输入活动地点" />
          </Form.Item>

          <Form.Item
            name="date"
            label="活动日期时间"
            rules={[{ required: true, message: '请选择活动日期时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder="请选择活动日期时间"
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="活动时长（小时）"
            rules={[{ required: true, message: '请输入活动时长' }]}
          >
            <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="活动人数上限"
            rules={[{ required: true, message: '请输入活动人数上限' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="活动费用（元）"
            rules={[{ required: true, message: '请输入活动费用' }]}
          >
            <InputNumber min={0} step={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="category"
            label="活动类别"
            rules={[{ required: true, message: '请选择活动类别' }]}
          >
            <Select placeholder="请选择活动类别">
              <Option value="足球">足球</Option>
              <Option value="篮球">篮球</Option>
              <Option value="排球">排球</Option>
              <Option value="网球">网球</Option>
              <Option value="羽毛球">羽毛球</Option>
              <Option value="乒乓球">乒乓球</Option>
              <Option value="游泳">游泳</Option>
              <Option value="跑步">跑步</Option>
              <Option value="健身">健身</Option>
              <Option value="瑜伽">瑜伽</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="活动状态"
            rules={[{ required: true, message: '请选择活动状态' }]}
          >
            <Select placeholder="请选择活动状态">
              <Option value="upcoming">即将开始</Option>
              <Option value="ongoing">进行中</Option>
              <Option value="completed">已结束</Option>
              <Option value="canceled">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item label="活动图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            <div style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.45)' }}>
              建议上传16:9比例的图片，大小不超过2MB
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              更新活动
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditActivity;