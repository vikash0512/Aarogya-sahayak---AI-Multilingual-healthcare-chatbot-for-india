import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import HealthTopics from './pages/HealthTopics';
import Article from './pages/Article';
import MyHistory from './pages/MyHistory';
import NearbyPHC from './pages/NearbyPHC';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminIngestion from './pages/AdminIngestion';
import AdminLLMConfig from './pages/AdminLLMConfig';
import AdminVectorIndex from './pages/AdminVectorIndex';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminKnowledgeBase from './pages/AdminKnowledgeBase';
import AdminGuardrails from './pages/AdminGuardrails';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminSettings from './pages/AdminSettings';
import AdminSupabaseConfig from './pages/AdminSupabaseConfig';
import AdminWhatsAppConfig from './pages/AdminWhatsAppConfig';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/topics" element={<HealthTopics />} />
              <Route path="/article/:topicId?" element={<Article />} />
              <Route path="/history" element={<MyHistory />} />
              <Route path="/phc" element={<NearbyPHC />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/knowledge" element={<AdminKnowledgeBase />} />
              <Route path="/admin/ingestion" element={<AdminIngestion />} />
              <Route path="/admin/vector" element={<AdminVectorIndex />} />
              <Route path="/admin/llm" element={<AdminLLMConfig />} />
              <Route path="/admin/guardrails" element={<AdminGuardrails />} />
              <Route path="/admin/audit" element={<AdminAuditLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/supabase" element={<AdminSupabaseConfig />} />
              <Route path="/admin/whatsapp" element={<AdminWhatsAppConfig />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
