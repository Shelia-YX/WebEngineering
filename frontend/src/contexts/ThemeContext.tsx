import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { STORAGE_KEYS } from '../constants';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// 主题提供者组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从本地存储获取主题设置，默认为light
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      return savedTheme || 'light';
    }
    return 'light';
  });

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 当主题变化时，更新本地存储和文档类名
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // 更新body类名，用于CSS选择器
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        // 强制触发样式更新
        document.body.style.backgroundColor = 'var(--bg-color)';
        document.body.style.color = 'var(--text-color)';
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        // 强制触发样式更新
        document.body.style.backgroundColor = 'var(--bg-color)';
        document.body.style.color = 'var(--text-color)';
      }
      
      // 触发自定义事件，通知其他组件主题已更改
      const event = new CustomEvent('themechange', { detail: { theme } });
      window.dispatchEvent(event);
    }
  }, [theme]);

  // 配置Ant Design主题
  const antdThemeConfig = {
    algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 自定义Hook，用于在组件中访问主题上下文
function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { useTheme };