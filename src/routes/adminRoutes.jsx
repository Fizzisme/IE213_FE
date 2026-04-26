import React from 'react';
import { Route } from 'react-router-dom';
import AdminRoute from '@/components/guards/AdminRoute';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import AdminLayout from '@/components/pages/Admin/AdminLayout.jsx';
import AdminUsers from '@/components/pages/Admin/AdminUsers.jsx';

const AdminLogin = React.lazy(() => import('@/components/pages/Admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('@/components/pages/Admin/AdminDashboard'));
const AdminUserDetail = React.lazy(() => import('@/components/pages/Admin/AdminUserDetail'));

export const adminRoutes = (
    <>
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
            path="/admin"
            element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                </RoleProtectedRoute>
            }
        >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
        </Route>
    </>
);
