import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 text-sm text-foreground select-none",
          className
        )}
      >
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded outline-none"
            checked={checked}
            {...props}
          />
          {checked && (
            <Check
              className="pointer-events-none absolute h-3 w-3 text-primary"
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
        </span>
        {label && <span className="text-xs font-medium text-muted-foreground peer-checked:text-foreground">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
