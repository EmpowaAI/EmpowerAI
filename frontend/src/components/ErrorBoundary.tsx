import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays fallback UI instead of crashing the entire app
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 p-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            {/* Error Title and Message */}
            <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
              Oops! Something went wrong
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              We encountered an unexpected error. Our team has been notified and we're working on a fix.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6 max-h-32 overflow-y-auto">
                <p className="text-xs font-mono text-destructive break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col">
              <button
                onClick={this.resetError}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go Home
              </a>
            </div>

            {/* Support Info */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>If this problem persists, please contact support at</p>
              <a
                href="mailto:support@empowerai.io"
                className="text-primary hover:underline font-medium"
              >
                support@empowerai.io
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
