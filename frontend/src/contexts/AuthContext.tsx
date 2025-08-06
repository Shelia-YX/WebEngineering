import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks';
import type { UserInfo } from '../services/auth';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<UserInfo>;
  register: (username: string, email: string, password: string, phone?: string) => Promise<UserInfo>;
  updateProfile: (profileData: {
    username?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
  }) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isOrganizerOrAdmin: boolean;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthHook();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// 自定义Hook，用于在组件中访问认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};