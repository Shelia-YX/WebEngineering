import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Divider } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components';
import { useAuth } from '../hooks';
import { ROUTES } from '../constants';

const { Title, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page" style={{ padding: '40px 0' }}>
      <Row justify="center" align="middle">
        <Col xs={22} sm={16} md={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2}>欢迎回来</Title>
              <Paragraph type="secondary">登录您的账号，探索更多精彩活动</Paragraph>
            </div>
            
            <LoginForm />
            
            <Divider plain>或者</Divider>
            
            <div style={{ textAlign: 'center' }}>
              <Paragraph>
                还没有账号？ <Link to={ROUTES.REGISTER}>立即注册</Link>
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;