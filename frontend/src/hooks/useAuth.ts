import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from '../utils/messageUtils';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '../services/auth';
import type { UserInfo } from '../services/auth';
import { userApi } from '../services/api';

// 认证Hook
export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 初始化时从localStorage获取用户信息
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    
    // 添加事件监听器，处理localStorage变化和自定义登录事件
    const handleStorageChange = (event: Event) => {
      try {
        // 检查是否是CustomEvent并且有detail属性
        if (event instanceof CustomEvent && event.detail) {
          // 如果有用户信息，直接使用它
          if (event.detail.user) {
            // 验证用户对象是否有效
            const userObj = event.detail.user;
            if (userObj && typeof userObj === 'object') {
              console.log('从CustomEvent获取用户信息:', userObj);
              setUser(userObj);
            } else {
              console.error('CustomEvent中的用户信息无效:', userObj);
            }
          } else {
            // 否则从localStorage获取
            console.log('CustomEvent中没有用户信息，尝试从localStorage获取');
            const updatedUser = getCurrentUser();
            if (updatedUser) {
              setUser(updatedUser);
            }
          }
        } else {
          // 兼容处理普通storage事件
          console.log('处理普通storage事件，尝试从localStorage获取用户信息');
          const updatedUser = getCurrentUser();
          if (updatedUser) {
            setUser(updatedUser);
          }
        }
      } catch (error) {
        console.error('处理storage事件时出错:', error);
      }
    };
    
    // 监听storage事件
    window.addEventListener('storage', handleStorageChange);
    // 同时监听自定义的userLogin事件
    window.addEventListener('userLogin', (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        setUser(e.detail);
      }
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange as EventListener);
    };
  }, []);

  // 登录
  const login = async (email: string, password: string, remember?: boolean) => {
    setLoading(true);
    try {
      console.log('开始登录，邮箱:', email);
      
      // 检查登录前的localStorage状态
      console.log('登录前localStorage状态:', {
        token: localStorage.getItem('token'),
        userInfo: localStorage.getItem('userInfo')
      });
      
      // 清除可能存在的无效数据
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr === 'undefined' || userInfoStr === 'null') {
        console.log('登录前清除无效的userInfo');
        localStorage.removeItem('userInfo');
      }
      
      const userData = await loginApi(email, password, remember);
      console.log('登录API返回的用户数据:', userData);
      
      // 验证userData是否有效
      if (!userData) {
        console.error('登录API返回的用户数据为空');
        throw new Error('登录失败：服务器返回的用户数据为空');
      }
      
      if (typeof userData !== 'object') {
        console.error('登录API返回的用户数据类型无效:', typeof userData, userData);
        throw new Error('登录失败：服务器返回的用户数据类型无效');
      }
      
      // 检查必要的用户属性
      if (!userData._id || !userData.username || !userData.email || !userData.role) {
        console.error('登录API返回的用户数据缺少必要属性:', userData);
        throw new Error('登录失败：用户数据不完整');
      }
      
      // 确保立即更新用户状态
      setUser(userData);
      console.log('更新后的用户状态:', userData);
      
      // 再次检查localStorage中的用户信息
      console.log('设置用户状态后检查localStorage:', {
        token: localStorage.getItem('token'),
        userInfo: localStorage.getItem('userInfo')
      });
      
      // 手动触发一个自定义事件，通知应用其他部分用户已登录
      const loginEvent = new CustomEvent('userLogin', { detail: userData });
      window.dispatchEvent(loginEvent);
      console.log('已触发userLogin事件');
      
      message.success('登录成功');
      
      // 使用 Promise 和 setTimeout 确保状态更新后再导航
      // 这比 requestAnimationFrame 更可靠，因为它给React更多时间来更新状态
      await new Promise(resolve => {
        setTimeout(() => {
          // 安全地访问用户状态
          console.log('延迟后检查用户状态:', user);
          
          // 检查localStorage中的用户信息
          const userInfoStr = localStorage.getItem('userInfo');
          console.log('延迟后检查localStorage:', userInfoStr);
          
          // 安全地访问用户角色
          const userRole = userData?.role || '未知';
          console.log('准备导航到首页，当前用户角色:', userRole);
          
          // 强制重新检查管理员状态，添加空值检查
          const isAdminCheck = userData?.role === 'admin';
          console.log('最终确认用户是否为管理员:', isAdminCheck);
          
          // 再次确认localStorage中的用户信息是否正确
          try {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
              const parsedUserInfo = JSON.parse(storedUserInfo);
              console.log('最终确认localStorage中的用户信息:', parsedUserInfo);
              
              // 如果localStorage中的用户信息与当前用户不一致，重新设置
              if (parsedUserInfo._id !== userData._id) {
                console.log('localStorage中的用户信息与当前用户不一致，重新设置');
                localStorage.setItem('userInfo', JSON.stringify(userData));
              }
            } else {
              console.log('localStorage中没有用户信息，重新设置');
              localStorage.setItem('userInfo', JSON.stringify(userData));
            }
          } catch (error) {
            console.error('检查localStorage中的用户信息时出错:', error);
            // 重新设置用户信息
            localStorage.setItem('userInfo', JSON.stringify(userData));
          }
          
          resolve(true);
          navigate('/');
        }, 1000); // 给予1000ms的延迟，确保状态更新完成
      });
      
      return userData;
    } catch (error: any) {
      console.error('登录过程中捕获到错误:', error);
      message.error(error.message || '登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (username: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      const userData = await registerApi(username, email, password, phone);
      setUser(userData);
      
      // 手动触发一个自定义事件，通知应用其他部分用户已注册
      const registerEvent = new CustomEvent('userLogin', { detail: userData });
      window.dispatchEvent(registerEvent);
      
      message.success('注册成功');
      
      // 使用 requestAnimationFrame 确保状态更新后再导航
      requestAnimationFrame(() => {
        navigate('/');
      });
      
      return userData;
    } catch (error: any) {
      message.error(error.message || '注册失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = () => {
    logoutApi();
    setUser(null);
    message.success('已退出登录');
    navigate('/');
  };

  // 更新用户资料
  const updateProfile = async (profileData: {
    username?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
  }) => {
    setLoading(true);
    try {
      // 调用API更新用户资料
      const response = await userApi.updateProfile(profileData);
      const updatedUser = response.data;
      
      // 更新本地状态和localStorage
      const newUserInfo = { ...user, ...updatedUser };
      setUser(newUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      
      return updatedUser;
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新资料失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      message.success('密码修改成功');
      return true;
    } catch (error: any) {
      message.error(error.response?.data?.message || '密码修改失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 检查是否已认证，优先使用React状态，确保一致性
  const checkIsAuthenticated = () => {
    console.log('checkIsAuthenticated: 检查用户认证状态');
    
    // 优先使用React状态中的user，这样可以确保组件重新渲染时状态一致
    if (user) {
      console.log('checkIsAuthenticated: 从React状态确认用户已认证');
      return true;
    }
    
    // 如果React状态中没有user，则检查localStorage
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    
    console.log('checkIsAuthenticated: localStorage中的token:', token ? '存在' : '不存在');
    console.log('checkIsAuthenticated: localStorage中的userInfo:', userInfoStr ? '存在' : '不存在');
    
    // 只有当token和userInfo都存在时才认为用户已认证
    const isAuth = token !== null && userInfoStr !== null;
    console.log('checkIsAuthenticated: 用户认证状态:', isAuth);
    
    // 如果localStorage中有有效的用户信息但React状态中没有，立即更新React状态
    if (isAuth && userInfoStr && !user) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && typeof userInfo === 'object' && userInfo._id) {
          console.log('checkIsAuthenticated: 立即从localStorage更新用户状态:', userInfo);
          // 使用setTimeout确保在React渲染周期外更新状态
          setTimeout(() => {
            setUser(userInfo);
          }, 0);
        }
      } catch (error) {
        console.error('checkIsAuthenticated: 解析用户信息失败:', error);
        localStorage.removeItem('userInfo');
        return false;
      }
    }
    
    return isAuth;
  };
  
  // 添加一个useEffect来处理从localStorage更新用户状态
  useEffect(() => {
    // 如果已认证但React状态中没有user，尝试从localStorage更新用户状态
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    const isAuth = token !== null && userInfoStr !== null;
    
    if (isAuth && userInfoStr && !user) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log('useEffect: 从localStorage更新用户状态:', userInfo);
        setUser(userInfo);
      } catch (error) {
        console.error('useEffect: 解析用户信息失败:', error);
        localStorage.removeItem('userInfo');
      }
    }
  }, []); // 只在组件挂载时执行一次，确保用户状态初始化
  
  // 计算当前认证状态
  const isAuthenticated = checkIsAuthenticated();
  
  // 计算管理员状态，确保从最新的用户信息中获取
  const checkIsAdmin = () => {
    // 优先使用React状态中的user
    if (user?.role === 'admin') {
      console.log('useAuth: 用户是管理员 (从React状态)');
      return true;
    }
    
    // 如果React状态中没有user或role不是admin，则检查localStorage
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const isAdminFromStorage = userInfo?.role === 'admin';
        console.log('useAuth: 用户是管理员 (从localStorage):', isAdminFromStorage);
        return isAdminFromStorage;
      } catch (error) {
        console.error('useAuth: 解析localStorage中的用户信息失败:', error);
        // 如果解析失败，清除可能损坏的数据
        localStorage.removeItem('userInfo');
      }
    }
    
    console.log('useAuth: 用户不是管理员');
    return false;
  };
  
  const isAdmin = checkIsAdmin();
  console.log('useAuth: 最终isAdmin状态:', isAdmin);
  
  // 计算组织者状态，与管理员状态类似的安全检查
  const checkIsOrganizer = () => {
    // 优先使用React状态中的user
    if (user?.role === 'organizer') {
      console.log('useAuth: 用户是组织者 (从React状态)');
      return true;
    }
    
    // 如果React状态中没有user或role不是organizer，则检查localStorage
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        const isOrganizerFromStorage = userInfo?.role === 'organizer';
        console.log('useAuth: 用户是组织者 (从localStorage):', isOrganizerFromStorage);
        return isOrganizerFromStorage;
      } catch (error) {
        console.error('useAuth: 解析localStorage中的用户信息失败:', error);
      }
    }
    
    return false;
  };
  
  const isOrganizer = checkIsOrganizer();
  const isOrganizerOrAdmin = isOrganizer || isAdmin;
  console.log('useAuth: 最终isOrganizer状态:', isOrganizer);
  console.log('useAuth: 最终isOrganizerOrAdmin状态:', isOrganizerOrAdmin);
  
  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    isOrganizerOrAdmin,
  };
};

export default useAuth;