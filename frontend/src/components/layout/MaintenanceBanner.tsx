import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AlertTriangle, Wrench, Clock, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { fastTransition, feedbackVariants, modalVariants, motionTransition } from '../../lib/animations';

interface MaintenanceStatus {
  inMaintenance: boolean;
  isAlertActive?: boolean;
  estimatedTime?: string;
  scheduledStart?: string;
  durationHours?: number;
  leadTimeHours?: number;
}

export function MaintenanceBanner() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const prevInMaintenanceRef = useRef(false);
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/maintenance');
        setStatus(response.data);
      } catch {
        // ignore errors
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // every minute

    const handleMaintenanceEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setStatus(prev => ({
        ...prev,
        inMaintenance: true,
        estimatedTime: customEvent.detail?.estimatedTime || prev?.estimatedTime,
      }));
    };

    window.addEventListener('maintenance_event', handleMaintenanceEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener('maintenance_event', handleMaintenanceEvent);
    };
  }, []);

  useEffect(() => {
    if (!status) return;

    if (prevInMaintenanceRef.current && !status.inMaintenance) {
      window.location.reload();
    }
    if (status.inMaintenance && !isAdmin) {
      toast.dismiss();
    }
    prevInMaintenanceRef.current = status.inMaintenance;
  }, [isAdmin, status]);

  if (!status) return null;

  // ─── Full-screen block for normal users when maintenance is active ───
  if (status.inMaintenance && !isAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          transition={motionTransition}
          className="max-w-md w-full bg-card border border-border rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16" />
          <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 border border-amber-500/30">
            <Wrench size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">SISTEMA EM MANUTENÇÃO</h1>
            <p className="text-muted text-sm leading-relaxed">
              O sistema está atualmente em manutenção para aplicar melhorias e garantir estabilidade.
              Por favor, aguarde o término.
            </p>
          </div>
          <div className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-primary" size={20} />
              <div className="text-left">
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Tempo Estimado</p>
                <p className="font-bold text-foreground text-sm">{status.estimatedTime || 'Indeterminado'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold text-foreground transition-all flex items-center justify-center gap-2"
          >
            <XCircle size={18} />
            Sair da Conta
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Admin: small fixed bar when system IS in maintenance ───
  if (status.inMaintenance && isAdmin) {
    return (
      <motion.div 
        variants={feedbackVariants}
        initial="initial"
        animate="animate"
        transition={fastTransition}
        className="fixed top-[57px] md:top-0 left-0 md:left-72 right-0 z-40 shadow-lg"
      >
        <div className="bg-amber-500 text-black text-xs font-bold flex items-center justify-center gap-2 py-1.5 px-4">
          <Wrench size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
          <span>
            SISTEMA EM MANUTENÇÃO
            {status.estimatedTime && status.estimatedTime !== 'Tempo indeterminado' && (
              <> — Tempo estimado: {status.estimatedTime}</>
            )}
          </span>
        </div>
      </motion.div>
    );
  }

  // ─── Admin: small fixed bar when maintenance is scheduled (not yet active) ───
  if (status.scheduledStart && !status.inMaintenance && isAdmin) {
    const start = new Date(status.scheduledStart);
    const now = new Date();
    if (start.getTime() > now.getTime()) {
      return (
        <motion.div 
          variants={feedbackVariants}
          initial="initial"
          animate="animate"
          transition={fastTransition}
          className="fixed top-[57px] md:top-0 left-0 md:left-72 right-0 z-40 shadow-lg"
        >
          <div className="bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 py-1.5 px-4">
            <Clock size={14} />
            <span>Manutenção agendada para {start.toLocaleString('pt-MZ')}</span>
          </div>
        </motion.div>
      );
    }
  }

  // ─── Regular users: small fixed bar when maintenance is upcoming (within lead time) ───
  if (status.scheduledStart && !status.inMaintenance && !isAdmin) {
    const start = new Date(status.scheduledStart);
    const now = new Date();
    const leadMs = (status.leadTimeHours ?? 1) * 60 * 60 * 1000;
    const diff = start.getTime() - now.getTime();
    if (diff > 0 && diff <= leadMs) {
      return (
        <motion.div 
          variants={feedbackVariants}
          initial="initial"
          animate="animate"
          transition={fastTransition}
          className="fixed top-[57px] md:top-0 left-0 md:left-72 right-0 z-40 shadow-lg"
        >
          <div className="bg-amber-500 text-black text-xs font-bold flex items-center justify-center gap-2 py-1.5 px-4">
            <AlertTriangle size={14} />
            <span>AVISO: Manutenção programada para {start.toLocaleString('pt-MZ')}</span>
          </div>
        </motion.div>
      );
    }
  }

  return null;
}
