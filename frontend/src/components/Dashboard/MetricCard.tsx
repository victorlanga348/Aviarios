import { type ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

export function MetricCard({ title, value, icon, color }: MetricCardProps) {
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
    <div className={`relative overflow-hidden bg-card border border-border p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] flex flex-col gap-2 sm:gap-4 transition-all duration-300 ${theme.hover} group shadow-xl`}>
      {/* Decorative Gradient Background */}
      <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 bg-gradient-to-br ${theme.gradient} blur-2xl -mr-10 -mt-10 sm:-mr-12 sm:-mt-12 transition-opacity opacity-50 group-hover:opacity-100`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${theme.icon} shadow-lg shadow-black/20`}>
          <div className="scale-75 sm:scale-100">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-muted text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em]">{title}</p>
        
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
