import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LoadingState } from '@dhemeira/ui';
import { useAuth } from '~/context/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isAdmin, isAllowed, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
