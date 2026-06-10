import { Sparkles } from "lucide-react";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export default function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="relative z-30 flex items-center justify-center gap-2 border-b border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 px-4 py-1.5 text-[12px] font-medium text-amber-900 backdrop-blur dark:text-amber-100">
      <Sparkles className="h-3.5 w-3.5" />
      <span>
        <strong className="font-semibold">Modo Demostración</strong>
        {" · "}
        <span className="text-amber-800/80 dark:text-amber-100/80">
          Los datos se restauran automáticamente cada 6 horas.
        </span>
      </span>
    </div>
  );
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
}
