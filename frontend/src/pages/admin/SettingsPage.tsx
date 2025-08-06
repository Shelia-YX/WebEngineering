import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tabs, Switch, InputNumber, Select, Typography, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageTitle, LoadingSpinner, ErrorAlert } from '../../components';
import { ROUTES } from '../../constants';
import { message } from '../../utils/messageUtils';

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;
const { Option } = Select;

// 模拟系统设置服务
const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 模拟获取系统设置
  const getSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 返回模拟数据
      return {
        site: {
          siteName: '活动管理系统',
          siteDescription: '一个现代化的活动管理和报名平台',
          contactEmail: 'admin@example.com',
          logoUrl: '/logo.png',
          faviconUrl: '/favicon.ico',
          enableRegistration: true,
          requireEmailVerification: true
        },
        payment: {
          enablePayment: true,
          currency: 'CNY',
          paymentMethods: ['alipay', 'wechat', 'bank'],
          bankAccount: '6222 0000 0000 0000',
          bankName: '示例银行',
          alipayAccount: 'payment@example.com',
          wechatAccount: 'wxpay123'
        },
        email: {
          smtpServer: 'smtp.example.com',
          smtpPort: 587,
          smtpUsername: 'noreply@example.com',
          smtpPassword: '********',
          senderName: '活动管理系统',
          senderEmail: 'noreply@example.com',
          enableEmailNotifications: true
        },
        activity: {
          requireApproval: true,
          maxParticipantsDefault: 100,
          allowComments: true,
          requireCommentApproval: true,
          maxImagesPerActivity: 5,
          maxFileSizeMB: 5
        }
      };
    } catch (err) {
      setError('获取系统设置失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 模拟更新系统设置
  const updateSettings = async (settings: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟成功响应
      return { success: true, message: '设置更新成功' };
    } catch (err) {
      setError('更新系统设置失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, error, getSettings, updateSettings };
};

const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { loading, error, getSettings, updateSettings } = useSettings();
  
  const [activeTab, setActiveTab] = useState('site');
  const [settings, setSettings] = useState<any>(null);
  
  // 表单实例
  const [siteForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [activityForm] = Form.useForm();

  // 如果未登录或不是管理员，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    } else if (!isAdmin) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 获取系统设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        
        // 设置表单初始值
        siteForm.setFieldsValue(data.site);
        paymentForm.setFieldsValue(data.payment);
        emailForm.setFieldsValue(data.email);
        activityForm.setFieldsValue(data.activity);
      } catch (error) {
        console.error('获取设置失败:', error);
      }
    };

    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin, getSettings, siteForm, paymentForm, emailForm, activityForm]);

  // 处理表单提交
  const handleSubmit = async (values: any, section: string) => {
    try {
      // 更新设置对象
      const updatedSettings = { ...settings };
      updatedSettings[section] = values;
      
      // 调用API更新设置
      await updateSettings(updatedSettings);
      message.success('设置更新成功');
    } catch (error) {
      console.error('更新设置失败:', error);
      message.error('更新设置失败');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // 等待重定向
  }

  return (
    <div className="admin-settings-page">
      <PageTitle 
        title="系统设置" 
        subtitle="配置系统参数"
        onBack={() => navigate(ROUTES.ADMIN_DASHBOARD)}
      />
      
      <Card>
        {loading && !settings ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* 站点设置 */}
            <TabPane tab="站点设置" key="site">
              <Form
                form={siteForm}
                layout="vertical"
                onFinish={(values) => handleSubmit(values, 'site')}
                initialValues={settings?.site}
              >
                <Title level={5}>基本信息</Title>
                <Form.Item
                  name="siteName"
                  label="站点名称"
                  rules={[{ required: true, message: '请输入站点名称' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="siteDescription"
                  label="站点描述"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                
                <Form.Item
                  name="contactEmail"
                  label="联系邮箱"
                  rules={[{ required: true, message: '请输入联系邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
                >
                  <Input />
                </Form.Item>
                
                <Divider />
                <Title level={5}>站点外观</Title>
                
                <Form.Item
                  name="logoUrl"
                  label="Logo URL"
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="faviconUrl"
                  label="Favicon URL"
                >
                  <Input />
                </Form.Item>
                
                <Divider />
                <Title level={5}>用户设置</Title>
                
                <Form.Item
                  name="enableRegistration"
                  label="允许新用户注册"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="requireEmailVerification"
                  label="要求邮箱验证"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* 支付设置 */}
            <TabPane tab="支付设置" key="payment">
              <Form
                form={paymentForm}
                layout="vertical"
                onFinish={(values) => handleSubmit(values, 'payment')}
                initialValues={settings?.payment}
              >
                <Form.Item
                  name="enablePayment"
                  label="启用支付功能"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="currency"
                  label="货币单位"
                  rules={[{ required: true, message: '请选择货币单位' }]}
                >
                  <Select>
                    <Option value="CNY">人民币 (CNY)</Option>
                    <Option value="USD">美元 (USD)</Option>
                    <Option value="EUR">欧元 (EUR)</Option>
                    <Option value="GBP">英镑 (GBP)</Option>
                    <Option value="JPY">日元 (JPY)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="paymentMethods"
                  label="支付方式"
                  rules={[{ required: true, message: '请选择至少一种支付方式' }]}
                >
                  <Select mode="multiple">
                    <Option value="alipay">支付宝</Option>
                    <Option value="wechat">微信支付</Option>
                    <Option value="bank">银行转账</Option>
                    <Option value="cash">现场支付</Option>
                  </Select>
                </Form.Item>
                
                <Divider />
                <Title level={5}>支付宝设置</Title>
                
                <Form.Item
                  name="alipayAccount"
                  label="支付宝账号"
                >
                  <Input />
                </Form.Item>
                
                <Divider />
                <Title level={5}>微信支付设置</Title>
                
                <Form.Item
                  name="wechatAccount"
                  label="微信支付账号"
                >
                  <Input />
                </Form.Item>
                
                <Divider />
                <Title level={5}>银行转账设置</Title>
                
                <Form.Item
                  name="bankName"
                  label="银行名称"
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="bankAccount"
                  label="银行账号"
                >
                  <Input />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* 邮件设置 */}
            <TabPane tab="邮件设置" key="email">
              <Form
                form={emailForm}
                layout="vertical"
                onFinish={(values) => handleSubmit(values, 'email')}
                initialValues={settings?.email}
              >
                <Form.Item
                  name="enableEmailNotifications"
                  label="启用邮件通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Divider />
                <Title level={5}>SMTP 设置</Title>
                
                <Form.Item
                  name="smtpServer"
                  label="SMTP 服务器"
                  rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="smtpPort"
                  label="SMTP 端口"
                  rules={[{ required: true, message: '请输入SMTP端口' }]}
                >
                  <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item
                  name="smtpUsername"
                  label="SMTP 用户名"
                  rules={[{ required: true, message: '请输入SMTP用户名' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="smtpPassword"
                  label="SMTP 密码"
                  rules={[{ required: true, message: '请输入SMTP密码' }]}
                >
                  <Input.Password />
                </Form.Item>
                
                <Divider />
                <Title level={5}>发件人设置</Title>
                
                <Form.Item
                  name="senderName"
                  label="发件人名称"
                  rules={[{ required: true, message: '请输入发件人名称' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="senderEmail"
                  label="发件人邮箱"
                  rules={[{ required: true, message: '请输入发件人邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存设置
                  </Button>
                  <Button 
                    style={{ marginLeft: 8 }} 
                    onClick={() => message.success('测试邮件发送成功')}
                  >
                    发送测试邮件
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* 活动设置 */}
            <TabPane tab="活动设置" key="activity">
              <Form
                form={activityForm}
                layout="vertical"
                onFinish={(values) => handleSubmit(values, 'activity')}
                initialValues={settings?.activity}
              >
                <Form.Item
                  name="requireApproval"
                  label="活动需要审核"
                  valuePropName="checked"
                  extra="启用后，新创建的活动需要管理员审核才能发布"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="maxParticipantsDefault"
                  label="默认最大参与人数"
                  rules={[{ required: true, message: '请输入默认最大参与人数' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                
                <Divider />
                <Title level={5}>评论设置</Title>
                
                <Form.Item
                  name="allowComments"
                  label="允许评论"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="requireCommentApproval"
                  label="评论需要审核"
                  valuePropName="checked"
                  extra="启用后，新评论需要管理员审核才能显示"
                >
                  <Switch />
                </Form.Item>
                
                <Divider />
                <Title level={5}>上传设置</Title>
                
                <Form.Item
                  name="maxImagesPerActivity"
                  label="每个活动最大图片数量"
                  rules={[{ required: true, message: '请输入每个活动最大图片数量' }]}
                >
                  <InputNumber min={1} max={20} style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item
                  name="maxFileSizeMB"
                  label="最大文件大小 (MB)"
                  rules={[{ required: true, message: '请输入最大文件大小' }]}
                >
                  <InputNumber min={1} max={20} style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default AdminSettingsPage;