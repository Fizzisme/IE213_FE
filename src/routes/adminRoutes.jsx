import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RoleProtectedRoute } from '@/components/guards/RoleProtectedRoute.jsx';
import AdminLayout from '@/components/pages/Admin/AdminLayout.jsx';

const AdminUsers = React.lazy(() => import('@/components/pages/Admin/AdminUsers.jsx'));
const AdminDashboard = React.lazy(() => import('@/components/pages/Admin/AdminDashboard'));

export const adminRoutes = (
    <>
        <Route
            path="/admin"
            element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                </RoleProtectedRoute>
            }
        >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
        </Route>
    </>
);
