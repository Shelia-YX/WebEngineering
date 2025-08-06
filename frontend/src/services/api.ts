import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL:', API_URL);

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 添加withCredentials以支持跨域请求携带凭证
  withCredentials: false,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.url, config);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.config.url, response);
    return response;
  },
  (error) => {
    console.error('响应拦截器错误:', error);
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      console.log('API响应拦截器: 收到401错误，清除本地存储并重定向到登录页');
      
      // 检查当前是否已经有token和userInfo
      const hadToken = localStorage.getItem('token') !== null;
      const hadUserInfo = localStorage.getItem('userInfo') !== null;
      
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // 如果之前有token或userInfo，触发自定义事件通知应用其他部分用户已登出
      if (hadToken || hadUserInfo) {
        console.log('API响应拦截器: 触发登出事件');
        const logoutEvent = new CustomEvent('storage', { detail: { user: null, action: 'logout' } });
        window.dispatchEvent(logoutEvent);
        
        // 同时触发userLogin事件，但传递null值
        const loginEvent = new CustomEvent('userLogin', { detail: null });
        window.dispatchEvent(loginEvent);
      }
      
      // 使用setTimeout确保事件处理完成后再重定向
      setTimeout(() => {
        console.log('API响应拦截器: 重定向到登录页');
        window.location.href = '/login';
      }, 100);
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  // 用户注册
  register: (userData: { username: string; email: string; password: string; phone?: string }) =>
    api.post('/api/users/register', userData),

  // 用户登录
  login: (credentials: { email: string; password: string; remember?: boolean }) =>
    api.post('/api/users/login', credentials),

  // 获取当前用户信息
  getCurrentUser: () => api.get('/api/users/profile'),

  // 更新用户信息
  updateProfile: (userData: { username?: string; email?: string; phone?: string; avatar?: string; bio?: string }) =>
    api.put('/api/users/profile', userData),

  // 更改密码
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    api.put('/api/users/password', passwordData),

  // 获取所有用户（管理员）
  getAllUsers: () => api.get('/api/users'),

  // 更新用户角色（管理员）
  updateUserRole: (userId: string, role: string) =>
    api.put(`/api/users/${userId}/role`, { role }),

  // 删除用户（管理员）
  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),
};

// 活动相关API
export const activityApi = {
  // 获取所有活动
  getAllActivities: (params?: { category?: string; search?: string }) =>
    api.get('/api/activities', { params }),

  // 获取活动详情
  getActivityById: (id: string) => api.get(`/api/activities/${id}`),

  // 创建活动
  createActivity: (activityData: any) => api.post('/api/activities', activityData),

  // 更新活动
  updateActivity: (id: string, activityData: any) =>
    api.put(`/api/activities/${id}`, activityData),

  // 删除活动
  deleteActivity: (id: string) => api.delete(`/api/activities/${id}`),

  // 获取用户创建的活动
  getUserActivities: () => api.get('/api/activities/my-activities'),

  // 获取所有活动（管理员）
  getAllActivitiesAdmin: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/activities/admin', { params }),
};

// 报名相关API
export const registrationApi = {
  // 报名活动
  registerForActivity: (activityId: string) =>
    api.post(`/api/registrations`, { activityId }),

  // 取消报名
  cancelRegistration: (registrationId: string) =>
    api.put(`/api/registrations/${registrationId}`, { status: 'canceled' }),

  // 获取用户的报名
  getUserRegistrations: () => api.get('/api/registrations/user'),

  // 获取活动的报名
  getActivityRegistrations: (activityId: string) =>
    api.get(`/api/activities/${activityId}/registrations`),

  // 更新报名状态（管理员/组织者）
  updateRegistrationStatus: (registrationId: string, status: string) =>
    api.put(`/api/registrations/${registrationId}`, { status }),

  // 更新支付状态（管理员/组织者）
  updatePaymentStatus: (registrationId: string, paymentStatus: string) =>
    api.put(`/api/registrations/${registrationId}/payment`, { paymentStatus }),

  // 删除报名（管理员/组织者）
  deleteRegistration: (registrationId: string) =>
    api.delete(`/api/registrations/${registrationId}`),

  // 获取所有报名（管理员）
  getAllRegistrationsAdmin: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/registrations/admin', { params }),
};

// 评论相关API
export const commentApi = {
  // 获取活动评论
  getActivityComments: (activityId: string) =>
    api.get(`/api/comments/activity/${activityId}`),

  // 添加评论
  createComment: (activityId: string, content: string, rating: number) =>
    api.post(`/api/comments`, { activityId, content, rating }),

  // 更新评论
  updateComment: (commentId: string, content: string) =>
    api.put(`/api/comments/${commentId}`, { content }),

  // 删除评论
  deleteComment: (commentId: string) =>
    api.delete(`/api/comments/${commentId}`),

  // 获取所有评论（管理员）
  getAllComments: () => api.get('/api/comments/admin'),

  // 审核评论（管理员）
  approveComment: (commentId: string) =>
    api.put(`/api/comments/${commentId}/approve`),
};

// 类别相关API
export const categoryApi = {
  // 获取所有类别
  getAllCategories: () => api.get('/api/categories'),
  
  // 创建类别
  createCategory: (categoryData: { name: string; description?: string }) => 
    api.post('/api/categories', categoryData),
  
  // 更新类别
  updateCategory: (id: string, categoryData: { name: string; description?: string }) => 
    api.put(`/api/categories/${id}`, categoryData),
  
  // 删除类别
  deleteCategory: (id: string) => api.delete(`/api/categories/${id}`),
};

// 上传相关API
export const uploadApi = {
  // 上传图片
  uploadImage: (formData: FormData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 上传文件
  uploadFile: (formData: FormData) => api.post('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export { api };

export default {
  userApi,
  activityApi,
  registrationApi,
  commentApi,
  categoryApi,
  uploadApi,
};