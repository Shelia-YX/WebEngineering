import { userApi } from './api';

// 用户信息接口
export interface UserInfo {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

// 登录响应接口
interface LoginResponse {
  token: string;
  user: UserInfo;
}

// 直接登录响应接口（适配后端直接返回的格式）
interface DirectLoginResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
  createdAt?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

// 登录函数
export const login = async (email: string, password: string, remember?: boolean): Promise<UserInfo> => {
  try {
    console.log('auth.ts: 开始登录请求');
    const response = await userApi.login({ email, password, remember });
    console.log('auth.ts: 登录API响应:', response);
    
    // 检查响应数据是否存在
    if (!response || !response.data) {
      console.error('auth.ts: 登录API响应无效:', response);
      throw new Error('登录失败：服务器响应无效');
    }
    
    const responseData = response.data;
    console.log('auth.ts: 登录返回原始数据:', responseData);
    
    let userData: UserInfo;
    let token: string;
    
    // 检查返回的数据格式，适配两种可能的格式
    if (responseData.token && responseData._id) {
      // 直接返回格式 (DirectLoginResponse)
      console.log('auth.ts: 检测到直接返回格式');
      const directData = responseData as DirectLoginResponse;
      token = directData.token;
      
      // 构造用户信息对象
      userData = {
        _id: directData._id,
        username: directData.username,
        email: directData.email,
        role: directData.role,
        createdAt: directData.createdAt || new Date().toISOString(),
        phone: directData.phone,
        avatar: directData.avatar,
        bio: directData.bio
      };
    } else if (responseData.token && responseData.user) {
      // 嵌套返回格式 (LoginResponse)
      console.log('auth.ts: 检测到嵌套返回格式');
      const nestedData = responseData as LoginResponse;
      token = nestedData.token;
      userData = nestedData.user;
    } else {
      console.error('auth.ts: 登录返回数据无效:', responseData);
      throw new Error('登录失败：服务器返回的数据无效');
    }
    
    // 验证必要的用户数据
    if (!userData._id || !userData.username || !userData.email || !userData.role) {
      console.error('auth.ts: 用户数据缺少必要属性:', userData);
      throw new Error('登录失败：用户数据不完整');
    }
    
    // 保存token和用户信息到localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    console.log('auth.ts: 已保存用户信息到localStorage:', userData);
    
    // 使用CustomEvent替代Event，可以传递更多信息
    // 这样可以确保其他组件能够检测到用户登录状态的变化
    const loginEvent = new CustomEvent('storage', { detail: { user: userData, action: 'login' } });
    window.dispatchEvent(loginEvent);
    console.log('auth.ts: 已触发storage事件');
    
    // 同时触发userLogin事件
    const userLoginEvent = new CustomEvent('userLogin', { detail: userData });
    window.dispatchEvent(userLoginEvent);
    console.log('auth.ts: 已触发userLogin事件');
    
    return userData;
  } catch (error: any) {
    console.error('auth.ts: 登录失败:', error);
    throw new Error(error.response?.data?.message || error.message || '登录失败');
  }
};

// 注册函数
export const register = async (
  username: string,
  email: string,
  password: string,
  phone?: string
): Promise<UserInfo> => {
  try {
    console.log('auth.ts: 开始注册请求');
    const response = await userApi.register({ username, email, password, phone });
    console.log('auth.ts: 注册API响应:', response);
    
    // 检查响应数据是否存在
    if (!response || !response.data) {
      console.error('auth.ts: 注册API响应无效:', response);
      throw new Error('注册失败：服务器响应无效');
    }
    
    const responseData = response.data;
    console.log('auth.ts: 注册返回原始数据:', responseData);
    
    let userData: UserInfo;
    let token: string;
    
    // 检查返回的数据格式，适配两种可能的格式
    if (responseData.token && responseData._id) {
      // 直接返回格式 (DirectLoginResponse)
      console.log('auth.ts: 检测到直接返回格式');
      const directData = responseData as DirectLoginResponse;
      token = directData.token;
      
      // 构造用户信息对象
      userData = {
        _id: directData._id,
        username: directData.username,
        email: directData.email,
        role: directData.role,
        createdAt: directData.createdAt || new Date().toISOString(),
        phone: directData.phone,
        avatar: directData.avatar,
        bio: directData.bio
      };
    } else if (responseData.token && responseData.user) {
      // 嵌套返回格式 (LoginResponse)
      console.log('auth.ts: 检测到嵌套返回格式');
      const nestedData = responseData as LoginResponse;
      token = nestedData.token;
      userData = nestedData.user;
    } else {
      console.error('auth.ts: 注册返回数据无效:', responseData);
      throw new Error('注册失败：服务器返回的数据无效');
    }
    
    // 验证必要的用户数据
    if (!userData._id || !userData.username || !userData.email || !userData.role) {
      console.error('auth.ts: 用户数据缺少必要属性:', userData);
      throw new Error('注册失败：用户数据不完整');
    }
    
    // 保存token和用户信息到localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    console.log('auth.ts: 已保存用户信息到localStorage:', userData);
    
    // 使用CustomEvent通知应用其他部分用户已注册
    const registerEvent = new CustomEvent('storage', { detail: { user: userData, action: 'register' } });
    window.dispatchEvent(registerEvent);
    console.log('auth.ts: 已触发storage事件');
    
    // 同时触发userLogin事件
    const userLoginEvent = new CustomEvent('userLogin', { detail: userData });
    window.dispatchEvent(userLoginEvent);
    console.log('auth.ts: 已触发userLogin事件');
    
    return userData;
  } catch (error: any) {
    console.error('auth.ts: 注册失败:', error);
    throw new Error(error.response?.data?.message || error.message || '注册失败');
  }
};

// 登出函数
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  
  // 使用CustomEvent通知应用其他部分用户已登出
  const logoutEvent = new CustomEvent('storage', { detail: { user: null, action: 'logout' } });
  window.dispatchEvent(logoutEvent);
  
  // 移除直接的页面跳转，由useAuth处理导航
};

// 获取当前用户信息
export const getCurrentUser = (): UserInfo | null => {
  console.log('getCurrentUser: 尝试从localStorage获取用户信息');
  
  // 检查token是否存在
  const token = localStorage.getItem('token');
  console.log('getCurrentUser: localStorage中的token:', token ? '存在' : '不存在');
  
  if (!token) {
    console.log('getCurrentUser: localStorage中没有token，清除可能存在的用户信息');
    // 确保清除可能存在的用户信息
    localStorage.removeItem('userInfo');
    return null;
  }
  
  const userInfoStr = localStorage.getItem('userInfo');
  console.log('getCurrentUser: localStorage中的userInfo字符串:', userInfoStr);
  
  if (!userInfoStr) {
    console.log('getCurrentUser: localStorage中没有用户信息，但token存在，这是不一致的状态');
    // 如果token存在但userInfo不存在，这是一个不一致的状态
    // 可以考虑清除token，因为没有用户信息的token没有用处
    console.log('getCurrentUser: 清除无效的token');
    localStorage.removeItem('token');
    return null;
  }
  
  try {
    // 确保userInfoStr是有效的JSON字符串
    if (userInfoStr === 'undefined' || userInfoStr === 'null') {
      console.error('getCurrentUser: userInfo是无效的字符串:', userInfoStr);
      // 清除无效数据
      console.log('getCurrentUser: 清除无效的userInfo和token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return null;
    }
    
    // 尝试解析JSON
    let userInfo: any;
    try {
      userInfo = JSON.parse(userInfoStr);
      console.log('getCurrentUser: JSON解析成功');
    } catch (parseError) {
      console.error('getCurrentUser: JSON解析失败:', parseError);
      console.log('getCurrentUser: 清除无效的userInfo和token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return null;
    }
    
    console.log('getCurrentUser: 解析后的用户信息:', userInfo);
    
    // 验证解析后的对象是否有效
    if (!userInfo || typeof userInfo !== 'object') {
      console.error('getCurrentUser: 解析后的userInfo不是有效对象');
      console.log('getCurrentUser: 清除无效的userInfo和token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return null;
    }
    
    // 验证必要的用户属性
    if (!userInfo._id || !userInfo.username || !userInfo.email || !userInfo.role) {
      console.error('getCurrentUser: 用户数据缺少必要属性:', userInfo);
      console.log('getCurrentUser: 清除无效的userInfo和token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return null;
    }
    
    console.log('getCurrentUser: 验证通过，用户角色:', userInfo.role);
    console.log('getCurrentUser: 返回有效的用户信息');
    return userInfo as UserInfo;
  } catch (error) {
    console.error('getCurrentUser: 处理用户信息时发生错误:', error);
    // 如果处理失败，清除可能损坏的数据
    console.log('getCurrentUser: 清除无效的userInfo和token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    return null;
  }
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// 检查用户是否为管理员
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// 检查用户是否为组织者或管理员
export const isOrganizerOrAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'organizer' || user?.role === 'admin';
};

// 更新用户资料
export const updateProfile = async (profileData: {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}): Promise<UserInfo> => {
  try {
    const response = await userApi.updateProfile(profileData);
    const updatedUser = response.data as UserInfo;
    
    // 更新localStorage中的用户信息
    const currentUser = getCurrentUser();
    if (currentUser) {
      const newUserInfo = { ...currentUser, ...updatedUser };
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    }
    
    return updatedUser;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '更新资料失败');
  }
};

// 修改密码
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await userApi.changePassword({ currentPassword, newPassword });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '修改密码失败');
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  isOrganizerOrAdmin,
  updateProfile,
  changePassword,
};