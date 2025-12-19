
import React, { useState, useEffect } from 'react';
import { Reservation, Lead, ConsumptionItem } from '../types';
import { ChefHat, Coffee, Sun, Moon, Users, ClipboardList, Utensils, AlertCircle, Clock, CheckCircle, ArrowRight, PlayCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AdminKitchenProps {
  reservations: Reservation[];
  leads: Lead[];
  onUpdateStatus: (resId: string, itemId: string, status: 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue') => void;
  onCancelOrder: (resId: string, itemId: string) => void;
  onRefresh?: () => void;
}

export const AdminKitchen: React.FC<AdminKitchenProps> = ({ reservations, leads, onUpdateStatus, onCancelOrder, onRefresh }) => {
  const today = new Date().toISOString().split('T')[0];
  const [viewHistory, setViewHistory] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true); // Default ON

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && onRefresh) {
        interval = setInterval(() => {
            onRefresh();
        }, 5000); // 5 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // 1. Calculate Forecast (Guests in House)
  const activeReservations = reservations.filter(r => 
    r.status === 'Check-in' || (r.status === 'Confirmado' && r.checkIn === today)
  );

  const totalGuests = activeReservations.reduce((acc, res) => {
    // If we have detailed guests count, use it
    if (res.guestsDetails) {
        return acc + (res.guestsDetails.adults || 0) + (res.guestsDetails.children || 0);
    }
    // Fallback to Lead or 1
    const lead = leads.find(l => l.id === res.leadId);
    return acc + (lead?.guests || 1); 
  }, 0);

  // Simple Meal Estimates
  const breakfastEstimate = totalGuests;
  const lunchEstimate = Math.round(totalGuests * 0.6);
  const dinnerEstimate = Math.round(totalGuests * 0.8);

  // 2. Kitchen Orders (From Consumption)
  interface KitchenOrder {
      item: ConsumptionItem;
      guestName: string; 
      roomId: string;
      resId: string;
      guestsInRoom: number;
  }

  const kitchenOrders: KitchenOrder[] = [];
  
  reservations.forEach(res => {
    if (res.status === 'Check-in') {
      // Calculate guests for this specific room
      let guestsInRoom = 1;
      if (res.guestsDetails) {
          guestsInRoom = (res.guestsDetails.adults || 0) + (res.guestsDetails.children || 0);
      } else {
          const l = leads.find(le => le.id === res.leadId);
          if (l) guestsInRoom = l.guests;
      }

      res.consumption?.forEach(c => {
        // Filter by category AND ensure it's not 'Entregue' (unless viewing history)
        if ((c.category === 'Restaurante' || c.category === 'Bar' || c.category === 'Frigobar')) {
            // Default status if missing
            if (!c.status) c.status = 'Pendente';
            
            kitchenOrders.push({ 
                item: c, 
                guestName: res.guestName, 
                roomId: res.roomId,
                resId: res.id,
                guestsInRoom
            });
        }
      });
    }
  });

  // Filter lists
  const pendingOrders = kitchenOrders.filter(o => !o.item.status || o.item.status === 'Pendente');
  const prepOrders = kitchenOrders.filter(o => o.item.status === 'Preparando');
  const readyOrders = kitchenOrders.filter(o => o.item.status === 'Pronto');
  const deliveredOrders = kitchenOrders.filter(o => o.item.status === 'Entregue');

  // Group items for "Production Summary" (Only active ones)
  const productionSummary: Record<string, number> = {};
  [...pendingOrders, ...prepOrders].forEach(({ item }) => {
    productionSummary[item.description] = (productionSummary[item.description] || 0) + item.quantity;
  });

  const productionData = Object.entries(productionSummary).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const OrderCard: React.FC<{ order: KitchenOrder }> = ({ order }) => (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col gap-3 animate-fade-in-up group relative">
          <div className="flex justify-between items-start">
             <div>
                 <h4 className="font-bold text-stone-800">{order.guestName}</h4>
                 <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-600">Quarto {order.roomId}</span>
                     <span className="text-xs font-bold bg-olive-100 px-2 py-0.5 rounded text-olive-700 flex items-center gap-1"><Users size={10}/> {order.guestsInRoom}</span>
                 </div>
             </div>
             <span className="text-xs text-stone-400 font-mono">{new Date(order.item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>

          <div className="py-2 border-t border-b border-stone-50">
              <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-olive-600">{order.item.quantity}x</span>
                  <span className="font-medium text-stone-700">{order.item.description}</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">{order.item.category}</p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
               {/* Cancel Button for active orders */}
              {(order.item.status === 'Pendente' || order.item.status === 'Preparando') && (
                  <button 
                    onClick={() => {
                        if(confirm('Tem certeza que deseja cancelar este pedido?')) {
                            onCancelOrder(order.resId, order.item.id);
                        }
                    }}
                    className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition"
                    title="Cancelar Pedido"
                  >
                      <AlertCircle size={14}/>
                  </button>
              )}

              {order.item.status === 'Pendente' && (
                  <button 
                    onClick={() => onUpdateStatus(order.resId, order.item.id, 'Preparando')}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                      <PlayCircle size={14}/> Preparar
                  </button>
              )}
              {order.item.status === 'Preparando' && (
                   <button 
                    onClick={() => onUpdateStatus(order.resId, order.item.id, 'Pronto')}
                    className="flex-1 bg-orange-50 text-orange-600 hover:bg-orange-100 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                      <CheckCircle size={14}/> Pronto
                  </button>
              )}
              {order.item.status === 'Pronto' && (
                  <button 
                    onClick={() => onUpdateStatus(order.resId, order.item.id, 'Entregue')}
                    className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                      <Utensils size={14}/> Entregar
                  </button>
              )}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-olive-900 flex items-center gap-3">
            <ChefHat size={32} /> Gestão de Cozinha
          </h1>
          <p className="text-gray-500">Monitor de pedidos e produção.</p>
        </div>
        <div className="flex items-center gap-4">
            {onRefresh && (
                  <div className="flex items-center gap-2">
                       {/* Auto-refresh indicator only */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100 text-green-700 text-xs font-bold" title="Atualizando a cada 5s">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          Ao Vivo (5s)
                      </div>
                  </div>
            )}
            <button 
                onClick={() => setViewHistory(!viewHistory)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${viewHistory ? 'bg-olive-600 text-white shadow-lg' : 'bg-white text-gray-500 border'}`}
            >
                {viewHistory ? 'Voltar para Ativos' : 'Ver Histórico Entregue'}
            </button>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-olive-800 font-bold text-sm">
             Pax Total: {totalGuests}
            </div>
        </div>
      </div>
      
      {viewHistory ? (
           <div className="bg-white rounded-xl shadow p-6 overflow-y-auto">
               <h3 className="font-bold text-lg mb-4 text-gray-700">Histórico de Entregas (Hoje)</h3>
               {deliveredOrders.length === 0 ? <p className="text-gray-400">Nenhum item entregue.</p> : (
                   <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-500">
                           <tr>
                               <th className="p-3 rounded-l-lg">Hora</th>
                               <th className="p-3">Item</th>
                               <th className="p-3">Qtd</th>
                               <th className="p-3">Hóspede / Quarto</th>
                               <th className="p-3 rounded-r-lg">Status</th>
                           </tr>
                       </thead>
                       <tbody>
                           {deliveredOrders.map((o, i) => (
                               <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                   <td className="p-3">{new Date(o.item.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                   <td className="p-3 font-medium">{o.item.description}</td>
                                   <td className="p-3">{o.item.quantity}</td>
                                   <td className="p-3">{o.guestName} (Q. {o.roomId})</td>
                                   <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Entregue</span></td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               )}
           </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
            {/* COLUMN 1: NEW / PENDING */}
            <div className="bg-stone-50 rounded-2xl p-4 flex flex-col gap-4 border border-stone-200/50 h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <h3 className="font-bold text-stone-600 flex items-center gap-2"><AlertCircle size={18} className="text-red-500"/> Pendentes</h3>
                    <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-xs font-bold">{pendingOrders.length}</span>
                </div>
                <div className="overflow-y-auto flex flex-col gap-3 custom-scrollbar flex-1 pr-1">
                    {pendingOrders.map((o, i) => <OrderCard key={i} order={o} />)}
                    {pendingOrders.length === 0 && <div className="text-center py-10 text-stone-300 text-sm">Sem novos pedidos</div>}
                </div>
            </div>

            {/* COLUMN 2: IN PREP */}
            <div className="bg-blue-50/50 rounded-2xl p-4 flex flex-col gap-4 border border-blue-100 h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center pb-2 border-b border-blue-200/50">
                    <h3 className="font-bold text-blue-800 flex items-center gap-2"><ChefHat size={18} className="text-blue-600"/> Preparando</h3>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{prepOrders.length}</span>
                </div>
                <div className="overflow-y-auto flex flex-col gap-3 custom-scrollbar flex-1 pr-1">
                    {prepOrders.map((o, i) => <OrderCard key={i} order={o} />)}
                    {prepOrders.length === 0 && <div className="text-center py-10 text-blue-200 text-sm">Cozinha livre</div>}
                </div>
            </div>

            {/* COLUMN 3: READY */}
            <div className="bg-green-50/50 rounded-2xl p-4 flex flex-col gap-4 border border-green-100 h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center pb-2 border-b border-green-200/50">
                    <h3 className="font-bold text-green-800 flex items-center gap-2"><CheckCircle size={18} className="text-green-600"/> Pronto / Entrega</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{readyOrders.length}</span>
                </div>
                <div className="overflow-y-auto flex flex-col gap-3 custom-scrollbar flex-1 pr-1">
                    {readyOrders.map((o, i) => <OrderCard key={i} order={o} />)}
                    {readyOrders.length === 0 && <div className="text-center py-10 text-green-200 text-sm">Nada para entregar</div>}
                </div>
            </div>

            {/* COLUMN 4: METRICS & FORECAST (Condensed) */}
            <div className="space-y-6 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)] pr-2">
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                    <h4 className="font-bold text-stone-700 mb-3 text-sm uppercase tracking-wide">Estimativa de Refeições</h4>
                    <div className="space-y-3">
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Café da Manhã</span>
                             <span className="font-bold">{breakfastEstimate} pax</span>
                         </div>
                         <div className="w-full bg-gray-100 h-1.5 rounded-full"><div className="bg-yellow-400 h-full rounded-full" style={{width: '100%'}}></div></div>
                         
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Almoço</span>
                             <span className="font-bold">{lunchEstimate} pax</span>
                         </div>
                         <div className="w-full bg-gray-100 h-1.5 rounded-full"><div className="bg-orange-400 h-full rounded-full" style={{width: '60%'}}></div></div>
                         
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Jantar</span>
                             <span className="font-bold">{dinnerEstimate} pax</span>
                         </div>
                         <div className="w-full bg-gray-100 h-1.5 rounded-full"><div className="bg-indigo-400 h-full rounded-full" style={{width: '80%'}}></div></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                     <h4 className="font-bold text-stone-700 mb-3 text-sm uppercase tracking-wide">Produção Atual</h4>
                     <div className="space-y-2">
                        {productionData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{item.name}</span>
                                <span className="font-bold text-olive-700">{item.value}</span>
                            </div>
                        ))}
                        {productionData.length === 0 && <p className="text-xs text-gray-400">Nenhum item em produção.</p>}
                     </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
