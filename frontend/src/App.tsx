import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/SkeletonLoader';

// Code-split pages via React.lazy for optimized bundle size & fast TTI
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const CitizenPortalPage = lazy(() => import('./pages/CitizenPortalPage').then(m => ({ default: m.CitizenPortalPage })));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CollectorDashboard = lazy(() => import('./pages/CollectorDashboard').then(m => ({ default: m.CollectorDashboard })));
const MonitorDashboard = lazy(() => import('./pages/MonitorDashboard').then(m => ({ default: m.MonitorDashboard })));
const AIScannerPage = lazy(() => import('./pages/AIScannerPage').then(m => ({ default: m.AIScannerPage })));
const SmartBinsPage = lazy(() => import('./pages/SmartBinsPage').then(m => ({ default: m.SmartBinsPage })));
const LiveCityMapPage = lazy(() => import('./pages/LiveCityMapPage').then(m => ({ default: m.LiveCityMapPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const PredictionsPage = lazy(() => import('./pages/PredictionsPage').then(m => ({ default: m.PredictionsPage })));
const RouteOptimizationPage = lazy(() => import('./pages/RouteOptimizationPage').then(m => ({ default: m.RouteOptimizationPage })));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4]">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/dashboard/super-admin" replace />;
    case 'ADMIN':
      return <Navigate to="/dashboard/admin" replace />;
    case 'GARBAGE_COLLECTOR':
      return <Navigate to="/dashboard/collector" replace />;
    case 'MUNICIPALITY_MONITOR':
      return <Navigate to="/dashboard/monitor" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/citizen-portal" element={<CitizenPortalPage />} />

                {/* Root Dispatcher */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/dashboard" element={<RootRedirect />} />
                <Route path="/dashboard/" element={<RootRedirect />} />

                {/* Protected Routes Layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Role Dashboards */}
                  <Route
                    path="/dashboard/super-admin"
                    element={
                      <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/collector"
                    element={
                      <ProtectedRoute allowedRoles={['GARBAGE_COLLECTOR', 'ADMIN', 'SUPER_ADMIN']}>
                        <CollectorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/monitor"
                    element={
                      <ProtectedRoute allowedRoles={['MUNICIPALITY_MONITOR', 'SUPER_ADMIN']}>
                        <MonitorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Core Feature Modules */}
                  <Route path="/ai-scanner" element={<AIScannerPage />} />
                  <Route path="/smart-bins" element={<SmartBinsPage />} />
                  <Route path="/map" element={<LiveCityMapPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/predictions" element={<PredictionsPage />} />
                  <Route path="/route-optimization" element={<RouteOptimizationPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Bespoke 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
