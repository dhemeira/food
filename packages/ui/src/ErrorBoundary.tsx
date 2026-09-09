import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorState from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  retryLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary catches errors thrown while rendering its children and shows
 * an ErrorState instead.
 *
 * ```tsx
 * <ErrorBoundary>
 *   <RecipeView />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          message={this.state.error.message}
          title={this.props.title}
          retryLabel={this.props.retryLabel}
          onRetry={() => {
            this.setState({ error: null });
          }}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
