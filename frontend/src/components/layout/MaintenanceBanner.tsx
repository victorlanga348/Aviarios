import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, Info, Wrench, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { modalVariants, motionTransition, overlayVariants } from '../../lib/animations';

type MaintenanceState = 'scheduled' | 'active' | 'completed';

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

function formatDateTime(value?: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getMaintenanceState(status: MaintenanceStatus | null, scheduledStart?: string): MaintenanceState | null {
  if (!status) return null;
  if (status.inMaintenance) return 'active';
  if (status.maintenance?.status === 'CONCLUIDA') return 'completed';
  if (status.showAlert || scheduledStart) return 'scheduled';
  return null;
}

function shouldDisplayNotice(
  status: MaintenanceStatus | null,
  scheduledStart: string | undefined,
  isAdmin: boolean,
  nowMs: number,
) {
  const state = getMaintenanceState(status, scheduledStart);
  if (!status || !state) return false;
  if (state === 'active') return isAdmin || status.inMaintenance;
  if (state === 'completed') return false;
  if (status.showAlert && scheduledStart) return true;
  if (!scheduledStart) return false;
  return new Date(scheduledStart).getTime() > nowMs;
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase text-muted">{label}</dt>
      <dd className="truncate text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function MaintenanceBanner() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const prevInMaintenanceRef = useRef(false);
  const detailsButtonRef = useRef<HTMLButtonElement | null>(null);
  const detailsPanelId = useId();
  const { user } = useAuth();
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

        if (!shouldDisplayNotice(nextStatus, nextScheduledStart, isAdmin, nextNowMs)) {
          setIsDetailsOpen(false);
          setIsDismissed(false);
        }
      } catch {
        // The global API interceptor already shows a friendly network message.
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);

    const handleMaintenanceEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      setNowMs(Date.now());
      setIsDismissed(false);
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
      toast.success('Manutencao concluida.');
    }
    if (status.inMaintenance && !isAdmin) {
      toast.dismiss();
    }
    prevInMaintenanceRef.current = status.inMaintenance;
  }, [isAdmin, status]);

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

  const scheduledStart = status?.scheduledStart || status?.maintenance?.scheduledStart || undefined;
  const state = getMaintenanceState(status, scheduledStart);
  const shouldShowNotice = useMemo(
    () => shouldDisplayNotice(status, scheduledStart, isAdmin, nowMs),
    [isAdmin, nowMs, scheduledStart, status],
  );

  if (!status || !state || !shouldShowNotice || isDismissed) return null;

  const maintenance = status.maintenance;
  const scheduledLabel = formatDateTime(scheduledStart);
  const duration = maintenance?.durationHours ?? status.durationHours;
  const estimatedTime = maintenance?.estimatedTime || status.estimatedTime;
  const impact = maintenance?.description?.trim();
  const isActive = state === 'active';
  const Icon = isActive ? AlertTriangle : CalendarClock;
  const title = isActive ? 'Manutencao em andamento' : 'Manutencao agendada';
  const compactText = isActive ? 'Manutencao ativa' : scheduledLabel ? `Manutencao ${scheduledLabel}` : 'Manutencao agendada';

  return (
    <>
      <div
        className="fixed right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[75] max-w-[calc(100vw-1.5rem)] sm:right-5 sm:top-5"
        role="status"
        aria-live="polite"
      >
        <div className={`flex max-w-[19rem] items-center gap-2 rounded-xl border px-2.5 py-2 text-xs shadow-xl backdrop-blur sm:max-w-sm sm:px-3 ${
          isActive
            ? 'border-amber-400/45 bg-amber-950/95 text-amber-50'
            : 'border-border bg-card/95 text-foreground'
        }`}>
          <Icon size={16} className={isActive ? 'shrink-0 text-amber-300' : 'shrink-0 text-primary'} aria-hidden="true" />
          <button
            ref={detailsButtonRef}
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            aria-expanded={isDetailsOpen}
            aria-controls={detailsPanelId}
            className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
          >
            <span className="block truncate font-black">{compactText}</span>
            <span className={`hidden truncate sm:block ${isActive ? 'text-amber-100/80' : 'text-muted'}`}>
              Ver detalhes
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsDismissed(true);
              setIsDetailsOpen(false);
            }}
            aria-label="Fechar aviso de manutencao"
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              isActive ? 'hover:bg-amber-900 text-amber-100' : 'hover:bg-secondary text-muted'
            }`}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={motionTransition}
            className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-3 pb-4 pt-[calc(env(safe-area-inset-top)+4.25rem)] sm:items-center sm:p-6"
            onClick={() => setIsDetailsOpen(false)}
          >
            <motion.section
              id={detailsPanelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${detailsPanelId}-title`}
              variants={modalVariants}
              transition={motionTransition}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-4 text-foreground shadow-2xl sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? 'bg-amber-500/15 text-amber-400' : 'bg-primary/15 text-primary'
                  }`}>
                    {isActive ? <Wrench size={18} /> : <Info size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h2 id={`${detailsPanelId}-title`} className="text-base font-black text-foreground">
                      {title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {isActive
                        ? 'Algumas acoes podem ficar indisponiveis durante a intervencao.'
                        : 'Pode haver indisponibilidade no periodo indicado.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    detailsButtonRef.current?.focus();
                  }}
                  aria-label="Fechar detalhes da manutencao"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="Estado" value={isActive ? 'Em andamento' : 'Agendada'} />
                <DetailRow label="Inicio" value={scheduledLabel} />
                <DetailRow label="Tempo estimado" value={estimatedTime} />
                <DetailRow label="Duracao" value={duration ? `${duration} hora(s)` : null} />
              </dl>

              {status.timeLeftText && (
                <p className="mt-4 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm font-semibold text-foreground">
                  {status.timeLeftText}
                </p>
              )}

              {impact && (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {impact}
                </p>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
