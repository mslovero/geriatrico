import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, FileBox, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { STORAGE_URL } from "@/api/api";
import { useArchivos } from "./hooks/useArchivos";
import { ArchivoUploadDialog } from "./components/ArchivoUploadDialog";
import { ARCHIVO_TIPOS, type ArchivoAdjunto, type ArchivoFormValues } from "./types";

const TIPO_LABEL = Object.fromEntries(ARCHIVO_TIPOS.map((t) => [t.value, t.label]));

export default function ArchivosPage() {
  const { canUploadArchivos: canManage, canDeleteArchivos: canDelete } =
    usePermissions();

  const { filtered, loading, search, setSearch, upload, remove } = useArchivos();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<ArchivoAdjunto | null>(null);

  const columns = useMemo<ColumnDef<ArchivoAdjunto, unknown>[]>(
    () => [
      {
        id: "paciente",
        header: "Paciente",
        cell: ({ row }) => {
          const p = row.original.paciente;
          return p ? (
            <span className="text-sm font-medium text-foreground">
              {p.nombre} {p.apellido}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Archivo general</span>
          );
        },
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return <Badge variant="muted">{TIPO_LABEL[v] ?? v}</Badge>;
        },
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ getValue }) => (
          <p className="max-w-md truncate text-sm text-muted-foreground">
            {(getValue() as string) || "—"}
          </p>
        ),
      },
      {
        id: "archivo",
        header: "Archivo",
        cell: ({ row }) => {
          const a = row.original;
          return (
            <a
              href={`${STORAGE_URL}/${a.ruta_archivo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Abrir
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          );
        },
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          if (!canDelete) return null;
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Eliminar archivo"
                onClick={() => setDeleting(row.original)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [canDelete]
  );

  const handleUpload = async (values: ArchivoFormValues) => {
    await upload(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <FileBox className="h-3.5 w-3.5" />
            Documentos
          </Badge>
        }
        title="Archivos adjuntos"
        description="Estudios, recetas, consentimientos y documentación clínica."
        actions={
          canManage && (
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" />
              Subir archivo
            </Button>
          )
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por paciente, tipo o descripción…"
        className="sm:max-w-md"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<FileBox className="h-5 w-5" />}
            title="Sin archivos cargados"
            description="Subí el primer documento del expediente clínico."
          />
        }
      />

      <ArchivoUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSubmit={handleUpload}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar archivo"
        description="¿Querés eliminar este archivo del expediente? Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
