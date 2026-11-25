import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  declare state: ErrorBoundaryState;
  declare readonly props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Une erreur inattendue est survenue.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl p-6 shadow-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Une interruption technique s'est produite
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vos données sauvegardées sur le serveur et dans Firestore restent protégées. Vous pouvez recharger l'interface pour continuer.
            </p>
            {this.state.errorMessage && (
              <div className="p-3 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-700 text-left break-all max-h-32 overflow-y-auto">
                {this.state.errorMessage}
              </div>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Recharger la page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
