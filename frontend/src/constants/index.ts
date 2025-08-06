// 应用常量

// 上传文件限制
export const UPLOAD_FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const UPLOAD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_info',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
};

// API路径
export const API_PATHS = {
  // 认证相关
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/auth/me',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/password',
  
  // 用户相关
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  USER_ROLE: '/users/:id/role',
  
  // 活动相关
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
  USER_ACTIVITIES: '/activities/user',
  
  // 报名相关
  REGISTRATIONS: '/registrations',
  USER_REGISTRATIONS: '/registrations/user',
  ACTIVITY_REGISTRATIONS: '/registrations/activity/:id',
  REGISTRATION_DETAIL: '/registrations/:id',
  REGISTRATION_STATUS: '/registrations/:id/status',
  PAYMENT_STATUS: '/registrations/:id/payment',
  
  // 评论相关
  COMMENTS: '/comments',
  ACTIVITY_COMMENTS: '/comments/activity/:id',
  COMMENT_DETAIL: '/comments/:id',
  
  // 类别相关
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:id',
  
  // 上传相关
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_FILE: '/upload/file',
};

// 活动状态
export const ACTIVITY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
};

// 报名状态
export const REGISTRATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  ATTENDED: 'attended',
  ABSENT: 'absent',
};

// 支付状态
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// 用户角色
export const USER_ROLES = {
  USER: 'user',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

// 分页默认值
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
};

// 上传文件限制
export const UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// 默认图片
export const DEFAULT_IMAGES = {
  AVATAR: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  ACTIVITY: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
};

// 路由路径在routes.ts中定义

// 表单验证规则
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

// 主题颜色
export const THEME_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#1890ff',
};

// 响应式断点
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
};

// 导出路由常量
export { ROUTES } from './routes';