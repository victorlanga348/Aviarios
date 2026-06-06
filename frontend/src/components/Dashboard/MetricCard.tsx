import { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  description?: string;
}

export function MetricCard({ title, value, icon, color, description }: MetricCardProps) {
  const iconStyles = {
    blue: 'text-blue-600 bg-blue-600/10 border-blue-600/20 dark:text-blue-400',
    green: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20 dark:text-emerald-400',
    yellow: 'text-amber-600 bg-amber-600/10 border-amber-600/20 dark:text-amber-400',
    red: 'text-rose-600 bg-rose-600/10 border-rose-600/20 dark:text-rose-400',
  };

  return (
    <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl flex flex-col gap-3 min-w-0 h-full">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted text-[10px] font-bold uppercase tracking-wider leading-tight">
          {title}
        </p>
        <div className={`shrink-0 p-2.5 rounded-xl border ${iconStyles[color]}`}>
          {icon}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="text-lg min-[360px]:text-xl sm:text-2xl font-black text-foreground tracking-tight break-words leading-tight">
          {value}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-muted leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
