import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarRange, Layers, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLotes } from "./hooks/useLotes";
import { LoteEstadoBadge } from "./components/LoteEstadoBadge";
import { LoteFormDialog } from "./components/LoteFormDialog";
import type { Lote, LoteEstado, LoteFormValues } from "./types";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const ESTADOS_OPCIONES: Array<{ value: LoteEstado; label: string }> = [
  { value: "activo", label: "Activo" },
  { value: "vencido", label: "Vencido" },
  { value: "agotado", label: "Agotado" },
];

export default function LotesPage() {
  const { filtered, stockItems, loading, filters, setFilters, save } = useLotes();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lote | null>(null);

  const columns = useMemo<ColumnDef<Lote, unknown>[]>(
    () => [
      {
        id: "item",
        header: "Medicamento / Insumo",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">
                {l.stock_item?.nombre ?? `#${l.stock_item_id}`}
              </p>
              <p className="text-xs text-muted-foreground">Lote {l.numero_lote}</p>
            </div>
          );
        },
      },
      {
        id: "cantidad",
        header: "Stock",
        cell: ({ row }) => {
          const l = row.original;
          const u = l.stock_item?.unidad_medida ?? "";
          return (
            <span className="text-sm tabular-nums text-foreground">
              {l.cantidad_actual} {u}
              <span className="text-muted-foreground">
                {" "}
                / {l.cantidad_inicial}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "fecha_vencimiento",
        header: "Vencimiento",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          if (!v) return <span className="text-xs text-muted-foreground">—</span>;
          const fecha = new Date(v);
          const dias = Math.ceil((fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isProximo = dias <= 30 && dias >= 0;
          const isVencido = dias < 0;
          return (
            <span
              className={`text-sm tabular-nums ${
                isVencido
                  ? "font-semibold text-destructive"
                  : isProximo
                  ? "font-semibold text-warning-foreground"
                  : "text-foreground"
              }`}
            >
              {dateFmt.format(fecha)}
              {isProximo && !isVencido && (
                <span className="ml-1 text-xs"> · {dias}d</span>
              )}
              {isVencido && <span className="ml-1 text-xs"> · vencido</span>}
            </span>
          );
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <LoteEstadoBadge estado={row.original.estado} />,
      },
      {
        accessorKey: "precio_compra",
        header: "Precio",
        cell: ({ getValue }) => {
          const v = getValue<number | null>();
          return v ? (
            <span className="text-sm tabular-nums text-foreground">${v.toFixed(2)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar lote"
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const handleSubmit = async (values: LoteFormValues) => {
    await save(values);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <Layers className="h-3.5 w-3.5" />
            Trazabilidad
          </Badge>
        }
        title="Lotes de stock"
        description="Vencimientos, cantidades y estado de cada lote."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            disabled={stockItems.length === 0}
          >
            <Plus className="h-4 w-4" />
            Nuevo lote
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters({ search: v })}
          placeholder="Buscar por número de lote o item…"
          className="sm:max-w-sm"
        />
        <Select
          value={filters.estado}
          onValueChange={(v) => setFilters({ estado: v as LoteEstado | "todos" })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADOS_OPCIONES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.stockItemId}
          onValueChange={(v) => setFilters({ stockItemId: v })}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Medicamento / Insumo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los items</SelectItem>
            {stockItems.map((i) => (
              <SelectItem key={i.id} value={i.id.toString()}>
                {i.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<CalendarRange className="h-5 w-5" />}
            title="No hay lotes registrados"
            description="Cuando registres lotes vas a verlos acá."
          />
        }
      />

      <LoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lote={editing}
        stockItems={stockItems}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
