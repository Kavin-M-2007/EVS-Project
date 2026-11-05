import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CollectorDashboard } from './pages/CollectorDashboard';
import { MonitorDashboard } from './pages/MonitorDashboard';
import { AIScannerPage } from './pages/AIScannerPage';
import { SmartBinsPage } from './pages/SmartBinsPage';
import { LiveCityMapPage } from './pages/LiveCityMapPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { RouteOptimizationPage } from './pages/RouteOptimizationPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CitizenPortalPage } from './pages/CitizenPortalPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

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
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/citizen-portal" element={<CitizenPortalPage />} />

            {/* Root Dispatcher */}
            <Route path="/" element={<RootRedirect />} />

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
