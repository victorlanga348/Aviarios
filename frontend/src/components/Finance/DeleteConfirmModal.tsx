import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fastTransition, modalVariants, motionTransition, overlayVariants } from '../../lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  title: string;
  description: string;
  itemName?: string;
  itemValue?: string;
  confirmText?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
  itemName,
  itemValue,
  confirmText = 'Confirmar',
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={motionTransition}
          className="w-full fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fastTransition}
            className="bg-card border border-border p-6 md:p-8 rounded-3xl w-full max-w-md max-h-[calc(100dvh-2rem)] shadow-2xl my-4 sm:my-0 overflow-y-auto overflow-x-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl shadow-lg shadow-red-500/5">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">{title}</h2>
                  {itemName && <p className="text-muted text-xs font-semibold mt-0.5">{itemName}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-secondary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-muted text-sm leading-relaxed">{description}</p>

              {itemValue && (
                <div className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted font-black uppercase tracking-wider">Valor lancado:</span>
                  <span className="text-base font-black text-foreground break-words text-right">{itemValue}</span>
                </div>
              )}

              <p className="text-red-400/90 text-[11px] font-bold">
                Esta acao e definitiva e atualiza imediatamente o balanco.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3.5 bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-foreground font-black text-xs uppercase tracking-widest rounded-xl border border-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                disabled={isLoading}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xl shadow-red-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Apagando...</span>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
