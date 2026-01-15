/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays a fallback UI.
 */

import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button, Card } from '../ui';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Could send to error reporting service here
    // logErrorToService(error, errorInfo);

    // Expose last error for easier debugging in dev environments
    try {
      // eslint-disable-next-line no-undef
      window.__lastAppError = { error: error?.toString?.() || String(error), stack: errorInfo?.componentStack };
    } catch (e) {
      // ignore
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal fallback for small components
      if (this.props.minimal) {
        return (
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-center gap-2 text-error-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Something went wrong</span>
            </div>
            <button
              onClick={this.handleReset}
              className="mt-2 text-sm text-error-600 hover:text-error-700 underline"
            >
              Try again
            </button>
          </div>
        );
      }

      // Full page error
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full text-center py-12">
            <div className="h-16 w-16 rounded-full bg-error-100 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-error-600" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try again or go back to the dashboard.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-error-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                leftIcon={RefreshCw}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                leftIcon={Home}
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withErrorBoundary(Component, options = {}) {
  const { fallback, minimal } = options;

  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback} minimal={minimal}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Page-level error boundary
 */
export function PageErrorBoundary({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

/**
 * Component-level error boundary (minimal)
 */
export function ComponentErrorBoundary({ children }) {
  return <ErrorBoundary minimal>{children}</ErrorBoundary>;
}
