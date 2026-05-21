import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wrench, Clock, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface MaintenanceStatus {
  inMaintenance: boolean;
  isAlertActive?: boolean;
  estimatedTime?: string;
  scheduledStart?: string;
  durationHours?: number;
}

export function MaintenanceBanner() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [adminDismissed, setAdminDismissed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/maintenance');
        setStatus(response.data);
      } catch (error) {
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

    // Effect to handle status changes
    const prevInMaintenanceRef = { current: false } as { current: boolean };
    const statusEffect = () => {
      if (status) {
        if (prevInMaintenanceRef.current && !status.inMaintenance) {
          // maintenance finished -> reload page
          window.location.reload();
        }
        if (status.inMaintenance && !isAdmin) {
          // clear toasts for regular users
          toast.dismiss();
        }
        prevInMaintenanceRef.current = status.inMaintenance;
      }
    };
    const statusWatcher = setInterval(statusEffect, 500);

    return () => {
      clearInterval(interval);
      clearInterval(statusWatcher);
      window.removeEventListener('maintenance_event', handleMaintenanceEvent);
    };
  }, []);

  if (!status) return null;

  // Block screen for normal users when maintenance is active
  if (status.inMaintenance && !isAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16" />
          <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 border border-amber-500/30 animate-pulse">
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

  // Admin banner: show when alert is active or in maintenance
  if (status.isAlertActive || status.inMaintenance) {
    // If admin has dismissed, do not render
    if (isAdmin && adminDismissed) return null;

    return (
      <AnimatePresence>
        <div className="fixed bottom-4 left-0 right-0 z-[9000] flex justify-center pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-auto bg-amber-500 text-black px-6 py-2.5 shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-bold rounded-full border border-amber-600/50"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="animate-pulse" size={18} />
              {status.inMaintenance ? (
                <span>ATENÇÃO: O SISTEMA ESTÁ EM MANUTENÇÃO AGORA.</span>
              ) : (
                <span>AVISO DE MANUTENÇÃO PROGRAMADA:</span>
              )}
            </div>

            {/* Scheduled start info */}
            {!status.inMaintenance && status.scheduledStart && (
              <span className="font-medium">
                Início: {new Date(status.scheduledStart).toLocaleString('pt-MZ')}{' '}
                {status.durationHours && ` (Duração est.: ${status.durationHours}h)`}
              </span>
            )}

            {/* Admin indicator */}
            {status.inMaintenance && (
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">Você está acessando como Admin</span>
            )}

            {/* Dismiss button for admins */}
            {isAdmin && (
              <button
                  type="button"
                  onClick={() => setAdminDismissed(true)}
                  className="ml-2 text-black hover:text-gray-800"
                  aria-label="Dismiss maintenance banner"
                >
                  ✕
                </button>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // No banner to show
  return null;
}
