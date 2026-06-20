import clsx from "clsx";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface Props {
  steps: Step[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <nav aria-label="Form progress" className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done    = i < current;
        const active  = i === current;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200",
                  done   && "bg-brand border-brand text-white",
                  active && "bg-brand/20 border-brand text-brand",
                  !done && !active && "bg-surface-raised border-surface-border text-slate-500"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={clsx(
                  "text-xs font-medium whitespace-nowrap hidden sm:block",
                  active ? "text-slate-200" : done ? "text-slate-400" : "text-slate-600"
                )}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={clsx(
                  "flex-1 h-0.5 mx-3 mb-5 transition-colors duration-200",
                  done ? "bg-brand" : "bg-surface-border"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
