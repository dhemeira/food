import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@dhemeira/ui';

interface RoutedErrorBoundaryProps {
  children: ReactNode;
}

function RoutedErrorBoundary({ children }: RoutedErrorBoundaryProps) {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname + location.search}>{children}</ErrorBoundary>;
}

export default RoutedErrorBoundary;
