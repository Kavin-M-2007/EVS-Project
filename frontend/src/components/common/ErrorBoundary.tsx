import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F5F6F4] flex items-center justify-center p-6 text-[#17231C]">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-[#E7EBE7] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-wider uppercase bg-red-100 text-red-800 px-3 py-1 rounded-full">
                Application Error Encountered
              </span>
              <h2 className="text-xl font-bold text-[#17231C] mt-2">
                Something went wrong
              </h2>
              <p className="text-xs text-[#747D75] leading-relaxed">
                An unexpected runtime exception was intercepted by the EcoSort safety boundary.
                Your session is preserved, but this view cannot be displayed.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 max-h-36 overflow-y-auto">
                <span className="font-bold text-red-600 block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.trim().split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

