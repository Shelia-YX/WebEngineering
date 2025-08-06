import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, AdminLayout } from '../layouts';
import {
  HomePage,
  ActivityDetailPage,
  MyActivitiesPage,
  MyRegistrationsPage,
  ActivityEditPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminActivitiesPage,
  AdminRegistrationsPage,
  AdminCategoriesPage,
  AdminCommentsPage,
  AdminSettingsPage
} from '../pages';
import { ROUTES } from '../constants';
import { PrivateRoute, AdminRoute } from '../components';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 主布局路由 */}
      <Route element={<MainLayout />}>
        {/* 公共页面 */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ACTIVITIES} element={<HomePage />} />
        <Route path={ROUTES.ACTIVITY_DETAIL} element={<ActivityDetailPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        
        {/* 需要登录的页面 */}
        <Route 
          path={ROUTES.PROFILE} 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path={ROUTES.MY_ACTIVITIES} 
          element={
            <PrivateRoute>
              <MyActivitiesPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path={ROUTES.MY_REGISTRATIONS} 
          element={
            <PrivateRoute>
              <MyRegistrationsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path={ROUTES.CREATE_ACTIVITY} 
          element={
            <PrivateRoute>
              <ActivityEditPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path={ROUTES.EDIT_ACTIVITY} 
          element={
            <PrivateRoute>
              <ActivityEditPage />
            </PrivateRoute>
          } 
        />
      </Route>

      {/* 管理员布局路由 */}
      <Route element={<AdminLayout />}>
        <Route 
          path={ROUTES.ADMIN_DASHBOARD} 
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_USERS} 
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_ACTIVITIES} 
          element={
            <AdminRoute>
              <AdminActivitiesPage />
            </AdminRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_REGISTRATIONS} 
          element={
            <AdminRoute>
              <AdminRegistrationsPage />
            </AdminRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_CATEGORIES} 
          element={
            <AdminRoute>
              <AdminCategoriesPage />
            </AdminRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_COMMENTS} 
          element={
            <AdminRoute>
              <AdminCommentsPage />
            </AdminRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_SETTINGS} 
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          } 
        />
      </Route>

      {/* 重定向 */}
      <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;