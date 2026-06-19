import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="card p-6 max-w-sm w-full text-center">
            <h1 className="text-lg font-black" style={{ color: 'var(--brand-700)' }}>Something went wrong</h1>
            <p className="mt-2 text-xs" style={{ color: 'var(--ink-600)' }}>
              We're sorry, but the application encountered an unexpected error.
            </p>
            {this.state.error && (
              <div className="mt-3 rounded-xl p-3 text-xs overflow-auto max-h-32" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                <code>{this.state.error.message}</code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-brand mt-4 w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
