import { CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';

interface Props {
  batchName: string;
  mortalityRate: number;
  netProfit: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BatchClosureSummary({ batchName, mortalityRate, netProfit, onConfirm, onCancel }: Props) {
  return (
    <div className="bg-card border border-border p-8 rounded-2xl max-w-lg w-full">
      <h3 className="text-xl font-bold mb-4">Encerrar Lote: {batchName}</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between p-4 bg-background rounded-lg">
          <span className="text-muted flex items-center gap-2"><AlertTriangle size={18} /> Mortalidade Final:</span>
          <span className={`font-bold ${mortalityRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
            {mortalityRate.toFixed(2)}%
          </span>
        </div>

        <div className="flex justify-between p-4 bg-background rounded-lg">
          <span className="text-muted flex items-center gap-2"><DollarSign size={18} /> Lucro Líquido Final:</span>
          <span className="font-bold text-primary text-xl">
            MZN {netProfit.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 py-3 text-muted hover:text-foreground transition">Cancelar</button>
        <button onClick={onConfirm} className="flex-1 py-3 bg-primary rounded-lg font-bold flex items-center justify-center gap-2">
          <CheckCircle size={20} /> Confirmar Fechamento
        </button>
      </div>
    </div>
  );
}