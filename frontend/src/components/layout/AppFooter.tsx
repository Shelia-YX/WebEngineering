import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', padding: '20px' }}>
      <div className="container">
        <p>体育活动中心 - 让运动更简单</p>
      </div>
    </Footer>
  );
};

export default AppFooter;