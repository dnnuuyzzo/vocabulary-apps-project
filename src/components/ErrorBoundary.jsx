import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary.jsx
 * 
 * " The Airbag" of the application.
 * If any component crashes (throws an error), this component catches it
 * and shows a friendly "Oops" screen instead of a blank white page.
 * 
 * Usage: Wrap the entire App in <ErrorBoundary> (done in App.jsx).
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Error caught by boundary:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // You can also log to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-8 text-center shadow-xl">
                            {/* Error Icon */}
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>

                            {/* Error Message */}
                            <h1 className="text-2xl font-black text-[var(--text-main)] mb-2">
                                Recalibrating Gengo
                            </h1>
                            <div className="space-y-1 mb-8">
                                <p className="text-[var(--text-muted)] text-sm font-medium">
                                    Learning is a journey, and every journey has bumps. Let's smooth this out.
                                </p>
                            </div>

                            {/* Error Details (in development only) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] mb-2">
                                        Error Details
                                    </summary>
                                    <div className="bg-[var(--input-bg)] p-4 rounded-xl text-xs font-mono overflow-auto max-h-40">
                                        <p className="text-red-500 font-bold mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        <pre className="text-[var(--text-muted)] whitespace-pre-wrap">
                                            {this.state.errorInfo?.componentStack}
                                        </pre>
                                    </div>
                                </details>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={this.handleReload}
                                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <RefreshCw size={20} />
                                    Refresh Session
                                </button>
                                <button
                                    onClick={this.handleReset}
                                    className="w-full bg-[var(--bg-hover)] hover:bg-[var(--input-bg)] text-[var(--text-main)] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                                >
                                    <Home size={20} />
                                    Back to Dashboard
                                </button>
                            </div>


                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
