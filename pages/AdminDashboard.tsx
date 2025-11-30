import React from 'react';
import { Lead, Reservation, EventRequest } from '../types';
import { Users, BedDouble, AlertCircle, Clock, ChevronRight, DollarSign, CalendarCheck, Utensils } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface AdminDashboardProps {
  leads: Lead[];
  reservations: Reservation[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ leads, reservations }) => {
  // --- High Level Stats ---
  const today = new Date().toISOString().split('T')[0];
  
  const arrivalsToday = reservations.filter(r => r.checkIn === today && r.status === 'Confirmado');
  const departuresToday = reservations.filter(r => r.checkOut === today && r.status === 'Check-in');
  const inHouse = reservations.filter(r => r.status === 'Check-in').length;
  const newLeadsCount = leads.filter(l => l.status === 'NOVO').length;

  // Mock Mini-Chart Data
  const weeklyOccupancy = [
    { day: 'Seg', val: 40 }, { day: 'Ter', val: 45 }, { day: 'Qua', val: 60 },
    { day: 'Qui', val: 75 }, { day: 'Sex', val: 90 }, { day: 'Sab', val: 95 }, { day: 'Dom', val: 60 },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-olive-900">Visão Geral do Resort</h1>
          <p className="text-gray-500">Resumo operacional e financeiro do dia.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600 flex items-center gap-2">
            <Clock size={16} /> Atualizado agora
        </div>
      </div>

      {/* Top Critical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-olive-800 to-olive-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 p-4 opacity-20"><BedDouble size={60} /></div>
           <p className="text-olive-100 text-sm font-medium mb-1">Hóspedes na Casa</p>
           <h2 className="text-4xl font-bold">{inHouse}</h2>
           <div className="mt-4 text-xs flex gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> {arrivalsToday.length} Chegadas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span> {departuresToday.length} Saídas</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group hover:border-olive-300 transition cursor-pointer">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div>
              <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Ação Necessária</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-800">{newLeadsCount}</h3>
           <p className="text-sm text-gray-500">Leads aguardando contato</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group hover:border-olive-300 transition">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
           </div>
           <h3 className="text-2xl font-bold text-gray-800">R$ 12.450</h3>
           <p className="text-sm text-gray-500">Faturamento parcial (Mês)</p>
           <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[65%]"></div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
           <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Ocupação Semanal</p>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyOccupancy}>
                        <Bar dataKey="val" fill="#568549" radius={[2,2,0,0]} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Arrivals & Departures Feed */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CalendarCheck size={18} className="text-olive-600"/> Recepção: Hoje
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {arrivalsToday.length === 0 && departuresToday.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">Nenhuma movimentação de check-in/out hoje.</div>
                    )}
                    
                    {arrivalsToday.map(r => (
                        <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-2 rounded text-green-700 text-xs font-bold text-center w-16">
                                    ENTRADA
                                    <br/><span className="text-lg">{new Date(r.checkIn).getDate()}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{r.guestName}</p>
                                    <p className="text-xs text-gray-500">Quarto pendente de atribuição</p>
                                </div>
                            </div>
                            <button className="text-sm border border-green-600 text-green-600 px-3 py-1 rounded hover:bg-green-50">Fazer Check-in</button>
                        </div>
                    ))}

                    {departuresToday.map(r => (
                        <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-2 rounded text-red-700 text-xs font-bold text-center w-16">
                                    SAÍDA
                                    <br/><span className="text-lg">{new Date(r.checkOut).getDate()}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{r.guestName}</p>
                                    <p className="text-xs text-gray-500">Reserva {r.id}</p>
                                </div>
                            </div>
                            <button className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 shadow-sm">Fechar Conta</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions / Shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition text-left group">
                    <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <Utensils size={20} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Lançar Consumo</span>
                </button>
                 <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition text-left group">
                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <CalendarCheck size={20} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Nova Reserva</span>
                </button>
                <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition text-left group">
                    <div className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <AlertCircle size={20} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Manutenção</span>
                </button>
                 <button className="p-4 bg-olive-50 border border-olive-200 rounded-xl hover:shadow-md transition text-left group">
                    <div className="bg-olive-200 text-olive-700 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <DollarSign size={20} />
                    </div>
                    <span className="font-bold text-olive-800 text-sm">Ver Financeiro</span>
                </button>
            </div>
        </div>

        {/* Side Panel: Urgent & Alerts */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-orange-500" /> Alertas
                </h3>
                <div className="space-y-3">
                    <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r text-sm">
                        <p className="font-bold text-red-800">Manutenção Urgente</p>
                        <p className="text-red-600 text-xs">Chalé 102 sem água quente.</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r text-sm">
                        <p className="font-bold text-yellow-800">Estoque Baixo</p>
                        <p className="text-yellow-600 text-xs">Cerveja Artesanal (Bar Piscina).</p>
                    </div>
                </div>
            </div>

            <div className="bg-olive-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="font-serif text-xl font-bold mb-2">Meta do Mês</h3>
                    <p className="text-olive-200 text-sm mb-4">Estamos a 80% da meta de reservas corporativas.</p>
                    <button className="w-full bg-white text-olive-900 font-bold py-2 rounded-lg hover:bg-olive-50 transition">
                        Ver Relatório CRM
                    </button>
                 </div>
                 {/* Decorative circles */}
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-olive-700 rounded-full opacity-50"></div>
                 <div className="absolute top-10 -left-10 w-20 h-20 bg-olive-800 rounded-full opacity-50"></div>
            </div>
        </div>

      </div>
    </div>
  );
};