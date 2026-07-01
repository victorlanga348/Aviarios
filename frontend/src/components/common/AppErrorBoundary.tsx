import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Algo correu mal
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Ocorreu um erro inesperado nesta página. Recarregue a aplicação para
              voltar ao fluxo normal.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 font-black text-black transition-colors hover:bg-emerald-500"
            >
              Recarregar aplicação
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
