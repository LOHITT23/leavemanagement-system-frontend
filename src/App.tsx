import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Main pages
import DashboardPage from "./pages/DashboardPage";
import CreateLeavePage from "./pages/CreateLeavePage";
import LeaveHistoryPage from "./pages/LeaveHistoryPage";
import LeaveDetailPage from "./pages/LeaveDetailPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpPage from "./pages/HelpPage";

// Admin pages
import PendingRequestsPage from "./pages/admin/PendingRequestsPage";
import ApprovalPage from "./pages/admin/ApprovalPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import LeaveTypesPage from "./pages/admin/LeaveTypesPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import OrgSettingsPage from "./pages/admin/OrgSettingsPage";

const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="loading-page">
        <div
          className="spinner"
          style={{ borderColor: "#e2e8f0", borderTopColor: "#2563eb" }}
        ></div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      }
    />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="leaves/new" element={<CreateLeavePage />} />
      <Route path="leaves/:id" element={<LeaveDetailPage />} />
      <Route path="leaves/history" element={<LeaveHistoryPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="help" element={<HelpPage />} />

      <Route
        path="admin/pending"
        element={
          <ProtectedRoute roles={["admin", "manager"]}>
            <PendingRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/approve/:id"
        element={
          <ProtectedRoute roles={["admin", "manager"]}>
            <ApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/leave-types"
        element={
          <ProtectedRoute roles={["admin"]}>
            <LeaveTypesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/reports"
        element={
          <ProtectedRoute roles={["admin", "manager"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/audit"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/settings"
        element={
          <ProtectedRoute roles={["admin"]}>
            <OrgSettingsPage />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: "DM Sans, sans-serif", fontSize: "14px" },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
