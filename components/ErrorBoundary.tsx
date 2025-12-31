import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the component tree
 * Prevents the entire app from crashing and shows a friendly error UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page to reset the app state
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#0f1c3a] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full mx-auto mb-6 flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl"></i>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-orbitron font-black text-[#0f1c3a] mb-3 uppercase tracking-tight">
              Oops! Something Went Wrong
            </h1>

            {/* Description */}
            <p className="text-slate-600 font-inter text-sm mb-6 leading-relaxed">
              Don't worry, this happens sometimes. We've logged the error and you can restart the game.
            </p>

            {/* Error Details (Dev Mode Only) */}
            {this.state.error && import.meta.env.DEV && (
              <details className="text-left mb-6 bg-slate-50 rounded-xl p-4">
                <summary className="cursor-pointer text-xs font-orbitron font-black text-slate-700 uppercase tracking-wide mb-2">
                  Technical Details
                </summary>
                <div className="text-xs font-mono text-slate-600 overflow-auto max-h-32">
                  <p className="mb-2 text-red-600 font-semibold">{this.state.error.toString()}</p>
                  <pre className="whitespace-pre-wrap text-[10px]">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-[#0f1c3a] text-white font-orbitron font-black text-xs tracking-[0.3em] rounded-2xl shadow-lg hover:bg-[#1a2b4d] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase"
              >
                <i className="fa-solid fa-rotate-right text-xs"></i>
                Restart Game
              </button>

              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-transparent text-slate-600 font-orbitron font-black text-[10px] tracking-[0.3em] rounded-2xl hover:bg-slate-50 active:scale-95 transition-all uppercase"
              >
                Report Issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
