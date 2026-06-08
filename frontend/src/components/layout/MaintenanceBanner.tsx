import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CalendarClock, Clock, Info, Wrench, X, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { modalVariants, motionTransition } from '../../lib/animations';

interface MaintenanceRecord {
  id: string;
  isActive: boolean;
  status?: string;
  type?: string | null;
  clientName?: string | null;
  equipment?: string | null;
  description?: string | null;
  scheduledStart?: string | null;
  estimatedTime?: string | null;
  durationHours?: number | null;
  leadTimeHours?: number | null;
}

interface MaintenanceStatus {
  inMaintenance: boolean;
  showAlert?: boolean;
  timeLeftText?: string;
  estimatedTime?: string;
  scheduledStart?: string;
  durationHours?: number | null;
  leadTimeHours?: number | null;
  maintenance?: MaintenanceRecord | null;
}

const TOP_BAR_HEIGHT = 36;
const DETAILS_PANEL_HEIGHT = 212;

function formatDateParts(value: string) {
  const date = new Date(value);
  const dateLabel = new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat('pt-MZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return { dateLabel, timeLabel };
}

function getStatusLabel(value?: string) {
  const labels: Record<string, string> = {
    PENDENTE: 'Pendente',
    AGENDADA: 'Agendada',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
  };

  return value ? labels[value] || value : 'Agendada';
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-amber-950/60">{label}</dt>
      <dd className="truncate text-sm font-semibold text-amber-950">{value}</dd>
    </div>
  );
}

function shouldDisplayBanner(
  status: MaintenanceStatus | null,
  scheduledStart: string | undefined,
  isAdmin: boolean,
  nowMs: number,
) {
  if (!status) return false;
  if (status.inMaintenance && isAdmin) return true;
  if (status.showAlert && scheduledStart) return true;
  if (!scheduledStart) return false;
  return new Date(scheduledStart).getTime() > nowMs;
}

export function MaintenanceBanner() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const prevInMaintenanceRef = useRef(false);
  const detailsButtonRef = useRef<HTMLButtonElement | null>(null);
  const detailsPanelId = useId();
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/maintenance');
        const nextStatus = response.data as MaintenanceStatus;
        const nextNowMs = Date.now();
        const nextScheduledStart = nextStatus.scheduledStart || nextStatus.maintenance?.scheduledStart || undefined;

        setNowMs(nextNowMs);
        setStatus(nextStatus);

        if (!shouldDisplayBanner(nextStatus, nextScheduledStart, isAdmin, nextNowMs)) {
          setIsDetailsOpen(false);
        }
      } catch {
        // The global API interceptor already shows a friendly network message.
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);

    const handleMaintenanceEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setNowMs(Date.now());
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
  }, [isAdmin]);

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

  const scheduledStart = status?.scheduledStart || status?.maintenance?.scheduledStart || undefined;
  const shouldShowTopBar = useMemo(
    () => shouldDisplayBanner(status, scheduledStart, isAdmin, nowMs),
    [isAdmin, nowMs, scheduledStart, status],
  );
  const visibleDetailsOpen = shouldShowTopBar && isDetailsOpen;

  useEffect(() => {
    const activeHeight = shouldShowTopBar
      ? TOP_BAR_HEIGHT + (visibleDetailsOpen ? DETAILS_PANEL_HEIGHT : 0)
      : 0;

    document.body.classList.toggle('maintenance-topbar-active', shouldShowTopBar);
    document.body.style.setProperty('--maintenance-topbar-height', `${TOP_BAR_HEIGHT}px`);
    document.body.style.setProperty('--maintenance-offset-height', `${activeHeight}px`);

    return () => {
      document.body.classList.remove('maintenance-topbar-active');
      document.body.style.removeProperty('--maintenance-topbar-height');
      document.body.style.removeProperty('--maintenance-offset-height');
    };
  }, [shouldShowTopBar, visibleDetailsOpen]);

  useEffect(() => {
    if (!isDetailsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailsOpen(false);
        detailsButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailsOpen]);

  if (!status) return null;

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

  if (!shouldShowTopBar) return null;

  const { dateLabel, timeLabel } = scheduledStart
    ? formatDateParts(scheduledStart)
    : { dateLabel: 'hoje', timeLabel: 'agora' };
  const shortMessage = `Manut. ${dateLabel} ${timeLabel}`;
  const fullMessage = `Manutenção agendada para ${dateLabel} às ${timeLabel}`;
  const maintenance = status.maintenance;
  const duration = maintenance?.durationHours ?? status.durationHours;
  const leadTime = maintenance?.leadTimeHours ?? status.leadTimeHours;
  const estimatedTime = maintenance?.estimatedTime || status.estimatedTime;

  return (
    <div className="fixed left-0 right-0 top-0 z-[70] text-amber-950">
      <div
        className="h-9 border-b border-amber-300 bg-amber-200 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-center gap-2 px-3 text-xs font-bold sm:text-sm">
          <CalendarClock size={15} className="shrink-0 text-amber-800" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-center sm:flex-none">
            <span className="sm:hidden">{shortMessage}</span>
            <span className="hidden sm:inline">{fullMessage}</span>
          </p>
          <button
            ref={detailsButtonRef}
            type="button"
            onClick={() => setIsDetailsOpen(prev => !prev)}
            aria-expanded={visibleDetailsOpen}
            aria-controls={detailsPanelId}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-amber-500/50 bg-amber-100 px-2 text-xs font-black text-amber-950 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
          >
            <Info size={14} aria-hidden="true" />
            <span>Detalhes</span>
          </button>
        </div>
      </div>

      {visibleDetailsOpen && (
        <motion.section
          id={detailsPanelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${detailsPanelId}-title`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition}
          className="border-b border-amber-300 bg-amber-100 shadow-sm"
        >
          <div className="mx-auto flex max-h-[212px] max-w-7xl flex-col gap-3 overflow-y-auto px-4 py-3 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id={`${detailsPanelId}-title`} className="truncate text-sm font-black text-amber-950">
                  Detalhes da manutenção agendada
                </h2>
                {status.timeLeftText && (
                  <p className="mt-1 truncate text-xs font-semibold text-amber-900/80">
                    {status.timeLeftText}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsOpen(false);
                  detailsButtonRef.current?.focus();
                }}
                aria-label="Fechar detalhes da manutenção"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-900 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailRow label="Início" value={`${dateLabel} às ${timeLabel}`} />
              <DetailRow label="Estado" value={getStatusLabel(maintenance?.status)} />
              <DetailRow label="Tempo estimado" value={estimatedTime || 'Tempo indeterminado'} />
              <DetailRow label="Duração" value={duration ? `${duration} hora(s)` : null} />
              <DetailRow label="Aviso prévio" value={leadTime ? `${leadTime} hora(s)` : null} />
              <DetailRow label="Tipo" value={maintenance?.type} />
              <DetailRow label="Cliente" value={maintenance?.clientName} />
              <DetailRow label="Equipamento" value={maintenance?.equipment} />
            </dl>

            {maintenance?.description && (
              <p className="line-clamp-2 text-sm font-medium leading-relaxed text-amber-950/85">
                {maintenance.description}
              </p>
            )}
          </div>
        </motion.section>
      )}
    </div>
  );
}
