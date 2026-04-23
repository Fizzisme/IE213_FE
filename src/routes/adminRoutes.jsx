import React from 'react';
import { Route } from 'react-router-dom';
import AdminRoute from '@/components/guards/AdminRoute';

const AdminLogin = React.lazy(() => import('@/components/pages/Admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('@/components/pages/Admin/AdminDashboard'));
const AdminUserDetail = React.lazy(() => import('@/components/pages/Admin/AdminUserDetail'));

export const adminRoutes = (
    <>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
            path="/admin"
            element={
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
            }
        />
        <Route
            path="/admin/users/:id"
            element={
                <AdminRoute>
                    <AdminUserDetail />
                </AdminRoute>
            }
        />
    </>
);
