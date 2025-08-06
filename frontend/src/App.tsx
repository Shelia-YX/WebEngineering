import React, { useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { Outlet } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from './contexts';
import { initMessage } from './utils/messageUtils';
import { MainLayout } from './layouts';
import './styles/index.css';
import './styles/theme.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
};

// 内部组件，用于获取App.useApp()的静态方法
const AppContent: React.FC = () => {
  const { message } = AntdApp.useApp();
  
  // 初始化消息实例
  useEffect(() => {
    initMessage(message);
  }, [message]);
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
