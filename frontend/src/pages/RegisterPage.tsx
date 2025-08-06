import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Divider } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';

const { Title, Paragraph } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="register-page" style={{ padding: '40px 0' }}>
      <Row justify="center" align="middle">
        <Col xs={22} sm={16} md={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2}>创建账号</Title>
              <Paragraph type="secondary">加入我们，开始您的社交活动之旅</Paragraph>
            </div>
            
            <RegisterForm />
            
            <Divider plain>或者</Divider>
            
            <div style={{ textAlign: 'center' }}>
              <Paragraph>
                已有账号？ <Link to={ROUTES.LOGIN}>立即登录</Link>
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;