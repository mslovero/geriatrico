import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BoxesIcon,
  CalendarX,
  CircleDollarSign,
  Layers,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchStockItems,
  fetchStockItemsBajoStock,
  fetchStockItemsProximosVencer,
} from "./api";
import { StockBadge } from "./components/StockBadge";
import type { StockItem } from "./types";

interface Stats {
  totalItems: number;
  bajoStock: number;
  proximosVencer: number;
  valorTotal: number;
}

export default function StockDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    bajoStock: 0,
    proximosVencer: 0,
    valorTotal: 0,
  });
  const [itemsBajoStock, setItemsBajoStock] = useState<StockItem[]>([]);
  const [itemsProximosVencer, setItemsProximosVencer] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [items, bajo, vencer] = await Promise.all([
          fetchStockItems(),
          fetchStockItemsBajoStock(),
          fetchStockItemsProximosVencer(),
        ]);
        const valor = items.reduce(
          (sum, it) => sum + (it.precio_unitario ?? 0) * it.stock_actual,
          0
        );
        setStats({
          totalItems: items.length,
          bajoStock: bajo.length,
          proximosVencer: vencer.length,
          valorTotal: valor,
        });
        setItemsBajoStock(bajo);
        setItemsProximosVencer(vencer);
      } catch (error) {
        console.error("Error cargando stock dashboard:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <BoxesIcon className="h-3.5 w-3.5" />
            Inventario
          </Badge>
        }
        title="Gestión de stock"
        description="Control consolidado de medicamentos e insumos."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/stock/lotes">
                <Layers className="h-4 w-4" />
                Gestionar lotes
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/stock/reportes">
                <TrendingUp className="h-4 w-4" />
                Ver reportes
              </Link>
            </Button>
            <Button asChild>
              <Link to="/stock/items">
                <BoxesIcon className="h-4 w-4" />
                Items
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Items totales"
            value={stats.totalItems}
            hint="Activos en inventario"
            icon={<BoxesIcon className="h-4 w-4" />}
            tone="bg-primary/10 text-primary"
            href="/stock/items"
          />
          <KpiCard
            label="Bajo stock"
            value={stats.bajoStock}
            hint="Requieren reposición"
            icon={<AlertTriangle className="h-4 w-4" />}
            tone={
              stats.bajoStock > 0
                ? "bg-warning/15 text-warning-foreground"
                : "bg-success/10 text-success"
            }
            href="/stock/items"
          />
          <KpiCard
            label="Próximos a vencer"
            value={stats.proximosVencer}
            hint="Lotes en 30 días"
            icon={<CalendarX className="h-4 w-4" />}
            tone={
              stats.proximosVencer > 0
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }
            href="/stock/lotes"
          />
          <KpiCard
            label="Valor total"
            value={`$${stats.valorTotal.toFixed(0)}`}
            hint="Estimado a precio de referencia"
            icon={<CircleDollarSign className="h-4 w-4" />}
            tone="bg-success/10 text-success"
            href="/stock/reportes"
          />
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ListaItems
          title="Bajo stock"
          empty="No hay items con stock bajo"
          items={itemsBajoStock}
        />
        <ListaItems
          title="Próximos a vencer"
          empty="No hay lotes próximos a vencer"
          items={itemsProximosVencer}
        />
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  tone: string;
  href: string;
}

function KpiCard({ label, value, hint, icon, tone, href }: KpiCardProps) {
  return (
    <Link to={href} className="group focus-visible:outline-none">
      <Card className="h-full transition-all group-hover:border-foreground/20 group-hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              {icon}
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <p className="mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListaItems({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: StockItem[];
}) {
  return (
    <Card>
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      {items.length === 0 ? (
        <EmptyStateBlock icon={<BoxesIcon className="h-5 w-5" />} title={empty} />
      ) : (
        <ul className="divide-y divide-border">
          {items.slice(0, 8).map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-6 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.nombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mín. {item.stock_minimo} {item.unidad_medida}
                </p>
              </div>
              <StockBadge item={item} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
