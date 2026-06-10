import { Link } from "react-router-dom";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-7 w-7" />
        </div>
        <p className="mt-6 text-7xl font-semibold tabular-nums tracking-tight text-foreground">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La sección que buscás no existe o fue movida. Verificá la dirección o volvé al panel
          principal.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Sistema de gestión geriátrica · &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
