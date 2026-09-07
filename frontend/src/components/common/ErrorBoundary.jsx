import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

/**
 * Catches JavaScript errors anywhere in the child component tree and
 * shows a friendly fallback UI instead of an unrecoverable blank screen.
 * Class component because React error boundaries currently require it.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real production app this would report to an error-tracking
    // service (Sentry, LogRocket, etc.) instead of just the console.
    console.error('Uncaught render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred while rendering this page. You can try going back to the homepage.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
