import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { get } from "@/api/api";
import type { Medicacion, PacienteRef } from "./types";

interface Registro {
  id: number;
  medicacion_id: number;
  user_id?: number | null;
  fecha_hora: string;
  estado: "administrado" | "rechazado" | "suspendido" | "error";
  observaciones?: string | null;
  cantidad_administrada?: number;
  medicacion?: (Medicacion & { paciente?: PacienteRef | null }) | null;
  user?: { id: number; name: string } | null;
}

interface PaginatedResponse<T> {
  data?: T[];
}

const ESTADO_VARIANT: Record<
  Registro["estado"],
  "success" | "warning" | "muted" | "destructive"
> = {
  administrado: "success",
  rechazado: "warning",
  suspendido: "muted",
  error: "destructive",
};

const ESTADO_LABEL: Record<Registro["estado"], string> = {
  administrado: "Administrado",
  rechazado: "Rechazado",
  suspendido: "Suspendido",
  error: "Error",
};

const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function unwrap<T>(res: T[] | PaginatedResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export default function AdministracionMedicamentosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await get<Registro[] | PaginatedResponse<Registro>>(
        "/registro-medicaciones"
      );
      setRegistros(unwrap<Registro>(res));
    } catch (error) {
      console.error("Error cargando registros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const columns = useMemo<ColumnDef<Registro, unknown>[]>(
    () => [
      {
        id: "medicacion",
        header: "Medicación",
        cell: ({ row }) => {
          const r = row.original;
          if (!r.medicacion) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">{r.medicacion.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {[r.medicacion.dosis, r.medicacion.frecuencia].filter(Boolean).join(" · ") ||
                  "Sin detalles"}
              </p>
            </div>
          );
        },
      },
      {
        id: "paciente",
        header: "Paciente",
        cell: ({ row }) => {
          const p = row.original.medicacion?.paciente;
          return p ? (
            <span className="text-sm text-foreground">
              {p.nombre} {p.apellido}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "fecha_hora",
        header: "Fecha y hora",
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <span className="text-sm tabular-nums text-foreground">
              {dateTimeFmt.format(new Date(value))}
            </span>
          );
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant={ESTADO_VARIANT[row.original.estado]}>
            {ESTADO_LABEL[row.original.estado]}
          </Badge>
        ),
      },
      {
        id: "responsable",
        header: "Responsable",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.user?.name ?? "Sistema"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <ClipboardCheck className="h-3.5 w-3.5" />
            MAR
          </Badge>
        }
        title="Administración de medicamentos"
        description="Registro histórico de administraciones por paciente."
        actions={
          <Button variant="outline" onClick={() => void cargar()}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={registros}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="No hay administraciones registradas"
            description="Cuando se registren administraciones desde la página de medicamentos, aparecerán acá."
          />
        }
      />
    </div>
  );
}
