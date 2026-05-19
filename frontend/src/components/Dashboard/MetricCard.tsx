import { type ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  description?: string;
}

export function MetricCard({ title, value, icon, color, description }: MetricCardProps) {
  const themes = {
    blue: {
      icon: 'text-blue-500 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20',
      gradient: 'from-blue-500/10 to-transparent dark:from-blue-500/5',
      hover: 'hover:border-blue-500/30'
    },
    green: {
      icon: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20',
      gradient: 'from-emerald-500/10 to-transparent dark:from-emerald-500/5',
      hover: 'hover:border-emerald-500/30'
    },
    yellow: {
      icon: 'text-amber-600 bg-amber-600/10 border-amber-600/20 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20',
      gradient: 'from-amber-500/10 to-transparent dark:from-amber-500/5',
      hover: 'hover:border-amber-500/30'
    },
    red: {
      icon: 'text-rose-600 bg-rose-600/10 border-rose-600/20 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-400/20',
      gradient: 'from-rose-500/10 to-transparent dark:from-rose-500/5',
      hover: 'hover:border-rose-500/30'
    },
  };

  const theme = themes[color];

  // Controle dinâmico da direção da animação
  const prevValueRef = useRef<string | number>(value);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const prev = prevValueRef.current;
    const current = value;

    const getNumeric = (val: string | number) => {
      if (typeof val === 'number') return val;
      const cleaned = val.replace(/[^\d-]/g, '');
      return parseInt(cleaned, 10) || 0;
    };

    const prevNum = getNumeric(prev);
    const currentNum = getNumeric(current);

    if (currentNum > prevNum) {
      setDirection('up');
    } else if (currentNum < prevNum) {
      setDirection('down');
    }

    prevValueRef.current = value;
  }, [value]);

  return (
    <div className={`relative bg-card border border-border p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] flex flex-col justify-between gap-1 sm:gap-2 transition-all duration-300 ${theme.hover} group shadow-xl`}>
      {/* Wrapper com overflow-hidden especificamente para o gradiente de fundo não vazar e nem cortar o tooltip */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-[2rem] pointer-events-none">
        <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 bg-gradient-to-br ${theme.gradient} blur-2xl -mr-10 -mt-10 sm:-mr-12 sm:-mt-12 transition-opacity opacity-50 group-hover:opacity-100`}></div>
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${theme.icon} shadow-lg shadow-black/20`}>
          <div className="scale-75 sm:scale-100">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 group/tooltip relative select-none">
          <p className="text-muted text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em]">
            {title}
          </p>
          {description && (
            <div className="cursor-help text-muted/40 hover:text-primary transition-colors py-0.5">
              <HelpCircle size={14} />
              
              {/* Tooltip Box fixado para baixo (top-full mt-2) com altíssimo contraste */}
              <div className="pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full left-0 mt-2 w-48 sm:w-56 p-3.5 bg-foreground border border-border text-background text-xs font-semibold leading-relaxed rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-1">
                {description}
              </div>
            </div>
          )}
        </div>
        
        {/* Container com altura fixa para evitar deslocamento de layout */}
        <div className="h-7 sm:h-8 overflow-hidden relative mt-0.5 sm:mt-1">
          <AnimatePresence mode="popLayout">
            <motion.h3 
              key={value.toString()}
              initial={{ y: direction === 'up' ? 24 : -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction === 'up' ? -24 : 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="text-lg sm:text-2xl font-black text-foreground tracking-tight truncate w-full"
            >
              {value}
            </motion.h3>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
