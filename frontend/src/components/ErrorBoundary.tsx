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
          <div className="card max-w-sm w-full text-center p-6">
            <div className="mx-auto inline-flex rounded-xl p-2.5 mb-3" style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="text-base font-bold" style={{ color: 'var(--ink-900)' }}>Something went wrong</h1>
            <p className="mt-1.5 text-xs leading-5" style={{ color: 'var(--ink-600)' }}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="mt-3 rounded-lg p-2.5 text-[11px] text-left overflow-auto max-h-24" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                <code className="break-all">{this.state.error.message}</code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-brand mt-4 w-full text-[13px]"
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
