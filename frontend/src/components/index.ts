// 导出所有组件

// 布局组件
export { default as AppHeader } from './layout/AppHeader';
export { default as AppFooter } from './layout/AppFooter';

// 通用组件
export { default as ActivityCard } from './common/ActivityCard';
export { default as CommentList } from './common/CommentList';
export { default as CommentForm } from './common/CommentForm';
export { default as CategorySelect } from './common/CategorySelect';
export { default as UserAvatar } from './common/UserAvatar';
export { default as LoadingSpinner } from './common/LoadingSpinner';
export { default as ErrorAlert } from './common/ErrorAlert';
export { default as EmptyState } from './common/EmptyState';
export { default as PageTitle } from './common/PageTitle';
export { default as StatusTag } from './common/StatusTag';
export { default as ImageUpload } from './common/ImageUpload';
export { default as SearchInput } from './common/SearchInput';
export { default as ConfirmModal } from './common/ConfirmModal';
export { default as ThemeSwitch } from './common/ThemeSwitch';

// 表单组件
export { default as LoginForm } from './forms/LoginForm';
export { default as RegisterForm } from './forms/RegisterForm';
export { default as ActivityForm } from './forms/ActivityForm';
export { default as ProfileForm } from './forms/ProfileForm';
export { default as PasswordForm } from './forms/PasswordForm';
// export { default as RegistrationForm } from './forms/RegistrationForm'; // 文件不存在

// 管理组件
export { default as UserTable } from './admin/UserTable';
export { default as ActivityTable } from './admin/ActivityTable';
export { default as CategoryManager } from './admin/CategoryManager';
export { default as RegistrationManager } from './admin/RegistrationManager';
export { default as StatisticsPanel } from './admin/StatisticsPanel';

// 路由组件
export { PrivateRoute, AdminRoute } from './routes';