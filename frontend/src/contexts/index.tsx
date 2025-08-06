import React from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';

interface AppProvidersProps {
  children: ReactNode;
}

// 组合所有上下文提供者
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};

// 导出所有上下文Hook和Provider
export { useAuth, AuthProvider } from './AuthContext';
export { useTheme, ThemeProvider } from './ThemeContext';