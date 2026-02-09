import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-red-500 mb-2">Ops, algo deu errado.</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              O aplicativo encontrou um erro inesperado.
            </p>
            <pre className="bg-gray-100 dark:bg-gray-950 p-2 rounded text-xs text-left overflow-auto mb-4 max-h-32 text-red-400">
                {this.state.error?.message}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-500 transition-colors w-full"
            >
              Limpar dados e recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}