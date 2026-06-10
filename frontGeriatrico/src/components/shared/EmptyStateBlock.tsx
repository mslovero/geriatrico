import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateBlockProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyStateBlock({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-md text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
