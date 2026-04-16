import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'doctor' | 'patient';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated? Redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Has role requirement but user doesn't match? Redirect to dashboard
  if (requiredRole && role && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Optionally waiting for role to be fetched before rendering admin content
  if (requiredRole && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Outlet />;
}
