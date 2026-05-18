import { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useBatches } from '../hooks/useBatches';
import { CreateSaleModal } from '../components/Sales/CreateSaleModal';
import { DeleteConfirmModal } from '../components/Finance/DeleteConfirmModal';
import { ShoppingCart, Clock, Trash2 } from 'lucide-react';
import type { Sale } from '../@types';

export function Sales() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToRevert, setSaleToRevert] = useState<Sale | null>(null);
  const { customers, createSale, revertSale, recentSales, isLoadingSales, isReverting } = useSales();
  const { batches } = useBatches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="text-primary" /> Vendas e Pedidos
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-[var(--shadow)] active:scale-95"
        >
          <ShoppingCart size={20} /> Nova Venda (PDV)
        </button>
      </div>

      {/* Lista de Vendas Recentes */}
      <div className="bg-card border border-border rounded-2xl w-full">
        {isLoadingSales ? (
          <div className="p-8 text-center animate-pulse text-muted">Buscando vendas recentes...</div>
        ) : recentSales.length === 0 ? (
          <div className="p-8 text-center text-muted">Nenhuma venda registrada recentemente.</div>
        ) : (
          <>
            {/* Layout Mobile (Cartões) */}
            <div className="grid grid-cols-1 divide-y divide-border md:hidden">
              {recentSales.map((sale: Sale) => (
                <div key={sale.id} className="p-4 hover:bg-secondary/10 transition flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{sale.customerName || 'Cliente'}</p>
                      <p className="text-xs text-muted">{new Date(sale.date).toLocaleString()}</p>
                    </div>
                    {sale.balance > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                          <Clock size={12} /> Parcial
                        </span>
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">Dívida: {sale.balance.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        Pago
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center bg-secondary/40 p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Qtd</p>
                      <p className="text-sm font-bold text-foreground">{sale.quantity} aves</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Total</p>
                        <p className="text-sm font-black text-primary">MZN {sale.totalValue.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setSaleToRevert(sale)}
                        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Reverter Venda"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Layout Desktop (Tabela) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-secondary/20 text-muted text-xs uppercase">
                  <tr>
                    <th className="p-4 text-foreground">Data</th>
                    <th className="p-4 text-foreground">Cliente</th>
                    <th className="p-4 text-foreground">Lote</th>
                    <th className="p-4 text-foreground">Qtd</th>
                    <th className="p-4 text-foreground">Total</th>
                    <th className="p-4 text-foreground">Status</th>
                    <th className="p-4 text-foreground text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSales.map((sale: Sale) => (
                    <tr key={sale.id} className="hover:bg-secondary/10 transition">
                      <td className="p-4 text-sm text-muted">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="p-4 font-medium text-foreground">{sale.customerName || 'Cliente'}</td>
                      <td className="p-4 text-sm text-muted">{sale.batchName}</td>
                      <td className="p-4 text-foreground">{sale.quantity} aves</td>
                      <td className="p-4 font-bold text-primary">MZN {sale.totalValue.toLocaleString()}</td>
                      <td className="p-4">
                        {sale.balance > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center w-fit gap-1">
                              <Clock size={12} /> Parcial
                            </span>
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase w-fit">Dívida: {sale.balance.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center w-fit gap-1">
                            Pago
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSaleToRevert(sale)}
                          className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Reverter Venda"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <CreateSaleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        batches={batches}
        customers={customers}
        onSubmit={async (data) => {
          await createSale(data);
          setIsModalOpen(false);
        }}
      />

      <DeleteConfirmModal
        isOpen={saleToRevert !== null}
        onClose={() => setSaleToRevert(null)}
        onConfirm={async () => {
          if (saleToRevert) {
            await revertSale(saleToRevert.id);
            setSaleToRevert(null);
          }
        }}
        isLoading={isReverting}
        title="Reverter Venda?"
        description="Esta ação irá cancelar a venda, excluir os pagamentos associados e RESTAURAR a quantidade exata de aves de volta ao estoque do lote original."
        itemName={saleToRevert ? `Venda para ${saleToRevert.customerName || 'Cliente'}` : undefined}
        itemValue={saleToRevert ? `MZN ${saleToRevert.totalValue.toLocaleString()}` : undefined}
      />
    </div>
  );
}