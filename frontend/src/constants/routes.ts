/**
 * 应用路由常量
 */

export const ROUTES = {
  // 主页面
  HOME: '/',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
  CREATE_ACTIVITY: '/activities/create',
  EDIT_ACTIVITY: '/activities/edit/:id',
  MY_ACTIVITIES: '/my-activities',
  MY_REGISTRATIONS: '/my-registrations',
  
  // 认证页面
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/forgot-password',
  
  // 管理员页面
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ACTIVITIES: '/admin/activities',
  ADMIN_REGISTRATIONS: '/admin/registrations',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PANEL: '/admin',
  
  // 其他
  NOT_FOUND: '*',
};