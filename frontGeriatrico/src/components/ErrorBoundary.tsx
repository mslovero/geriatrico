import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isDev = import.meta.env.MODE === "development";

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertOctagon className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              Algo salió mal
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Ocurrió un error inesperado en la aplicación. Reintentá la operación o volvé al
              inicio. El equipo técnico fue notificado.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={this.handleHome}>
                <Home className="h-4 w-4" />
                Volver al inicio
              </Button>
              <Button variant="outline" onClick={this.handleReload}>
                <RotateCcw className="h-4 w-4" />
                Recargar página
              </Button>
            </div>

            {isDev && this.state.error && (
              <details className="mt-6 w-full rounded-lg border border-border bg-muted/40 p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  Detalles técnicos (sólo en desarrollo)
                </summary>
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <p className="mb-1 font-semibold text-muted-foreground">Error</p>
                    <pre className="overflow-auto rounded bg-background p-3 text-destructive">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <p className="mb-1 font-semibold text-muted-foreground">Stack</p>
                      <pre className="max-h-64 overflow-auto rounded bg-background p-3 text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }
}
