
import React from 'react';
// Added LeadStatus to imports
import { Lead, LeadStatus, Reservation, EventRequest, Transaction, TimeLog, Room, User, TimeLogType, RoomStatus } from '../types';
import { Users, BedDouble, AlertCircle, Clock, TrendingUp, TrendingDown, DollarSign, CalendarCheck, MapPin, ChefHat, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface AdminDashboardProps {
  leads: Lead[];
  reservations: Reservation[];
  events: EventRequest[];
  transactions: Transaction[];
  timeLogs: TimeLog[];
  rooms: Room[];
  users: User[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  leads, reservations, events, transactions, timeLogs, rooms, users 
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  // --- Hotel Stats ---
  const arrivalsToday = reservations.filter(r => r.checkIn === today && r.status === 'Confirmado');
  const departuresToday = reservations.filter(r => r.checkOut === today && r.status === 'Check-in');
  const inHouse = reservations.filter(r => r.status === 'Check-in').length;
  const occupancyRate = Math.round((rooms.filter(r => r.status === RoomStatus.OCCUPIED).length / rooms.length) * 100);

  // --- Financial Stats (Today) ---
  const incomeToday = transactions
    .filter(t => t.type === 'INCOME' && t.date.startsWith(today))
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expenseToday = transactions
    .filter(t => t.type === 'EXPENSE' && t.date.startsWith(today))
    .reduce((acc, t) => acc + t.amount, 0);

  // --- HR Stats (Who is working) ---
  const activeStaff = users.filter(user => {
    // Get last log for this user
    const userLogs = timeLogs.filter(l => l.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const lastLog = userLogs[0];
    // Active if ENTRY or LUNCH_END
    return lastLog && (lastLog.type === TimeLogType.ENTRY || lastLog.type === TimeLogType.LUNCH_END);
  });

  // --- Events Stats ---
  const eventsToday = events.filter(e => e.date === today && e.status === 'Confirmado');
  const eventsNext7Days = events.filter(e => {
    const eDate = new Date(e.date);
    const todayDate = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(todayDate.getDate() + 7);
    return eDate >= todayDate && eDate <= nextWeek && e.status === 'Confirmado';
  });

  // --- Leads Stats ---
  // Fixed: comparison between LeadStatus and 'NOVO' (incorrect string and missing enum reference)
  const newLeadsCount = leads.filter(l => l.status === LeadStatus.NEW).length;

  // Mock Data for Charts
  const weeklyRevenue = [
    { day: 'Seg', income: 4500, expense: 3200 },
    { day: 'Ter', income: 5200, expense: 2800 },
    { day: 'Qua', income: 8000, expense: 4100 },
    { day: 'Qui', income: 7500, expense: 3900 },
    { day: 'Sex', income: 12000, expense: 5000 },
    { day: 'Sab', income: 15000, expense: 6000 },
    { day: 'Dom', income: 9000, expense: 4500 },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-olive-900">Visão Geral do Sistema</h1>
          <p className="text-gray-500">Monitoramento em tempo real de todas as operações.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600 flex items-center gap-2">
            <Clock size={16} className="text-olive-600" /> 
            <span className="font-bold">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Finance KPI */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
                <span className="text-xs font-bold text-gray-400">HOJE</span>
            </div>
            <div>
                <p className="text-sm text-gray-500">Receita do Dia</p>
                <h3 className="text-2xl font-bold text-gray-800">R$ {incomeToday.toLocaleString('pt-BR')}</h3>
            </div>
            <div className="mt-2 text-xs flex items-center text-red-500">
                <TrendingDown size={12} className="mr-1" /> Saídas: R$ {expenseToday.toLocaleString('pt-BR')}
            </div>
        </div>

        {/* Hotel KPI */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-olive-50 text-olive-600 rounded-lg"><BedDouble size={20}/></div>
                <span className="text-xs font-bold text-olive-600">{occupancyRate}% Ocupado</span>
            </div>
            <div>
                <p className="text-sm text-gray-500">Hóspedes na Casa</p>
                <h3 className="text-2xl font-bold text-gray-800">{inHouse}</h3>
            </div>
            <div className="mt-2 text-xs flex gap-3 text-gray-500">
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> {arrivalsToday.length} Chegadas</span>
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span> {departuresToday.length} Saídas</span>
            </div>
        </div>

        {/* HR KPI */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div>
                <span className="text-xs font-bold text-blue-600">{activeStaff.length} / {users.length}</span>
            </div>
            <div>
                <p className="text-sm text-gray-500">Staff em Turno</p>
                <div className="flex -space-x-2 mt-1">
                    {activeStaff.slice(0, 5).map(u => (
                        <img key={u.id} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" title={u.name} />
                    ))}
                    {activeStaff.length === 0 && <span className="text-sm font-bold text-gray-400">Ninguém ativo</span>}
                </div>
            </div>
             <div className="mt-2 text-xs text-gray-400">
                Funcionários com ponto aberto agora.
            </div>
        </div>

        {/* CRM/Events KPI */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20}/></div>
                <span className="text-xs font-bold text-purple-600">{eventsNext7Days.length} Eventos</span>
            </div>
            <div>
                <p className="text-sm text-gray-500">Novos Leads</p>
                <h3 className="text-2xl font-bold text-gray-800">{newLeadsCount}</h3>
            </div>
             <div className="mt-2 text-xs text-gray-500">
                Aguardando primeiro contato.
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Operations (2/3) */}
          <div className="xl:col-span-2 space-y-6">
              
              {/* Hotel Operations Feed */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CalendarCheck size={18} className="text-olive-600"/> Operação Hoteleira (Hoje)
                    </h3>
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {arrivalsToday.length === 0 && departuresToday.length === 0 && (
                         <div className="p-8 text-center text-gray-400 text-sm">Nenhuma movimentação de check-in/out prevista para hoje.</div>
                    )}

                    {/* Arrivals */}
                    {arrivalsToday.map(r => (
                        <div key={r.id} className="p-4 flex items-center justify-between hover:bg-green-50/30 transition">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 text-green-700 p-2 rounded-lg text-center min-w-[3rem]">
                                    <span className="block text-[10px] font-bold uppercase">Check-in</span>
                                    <span className="block font-bold text-lg leading-none">{new Date(r.checkIn).getDate()}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{r.guestName}</p>
                                    <p className="text-xs text-gray-500">Quarto pendente</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Aguardando</span>
                        </div>
                    ))}

                    {/* Departures */}
                    {departuresToday.map(r => (
                        <div key={r.id} className="p-4 flex items-center justify-between hover:bg-red-50/30 transition">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 text-red-700 p-2 rounded-lg text-center min-w-[3rem]">
                                    <span className="block text-[10px] font-bold uppercase">Check-out</span>
                                    <span className="block font-bold text-lg leading-none">{new Date(r.checkOut).getDate()}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{r.guestName}</p>
                                    <p className="text-xs text-gray-500">Quarto {rooms.find(rm => rm.id === r.roomId)?.name}</p>
                                </div>
                            </div>
                             <span className="text-xs font-bold text-olive-600 bg-olive-50 px-2 py-1 rounded">Hóspede na casa</span>
                        </div>
                    ))}
                </div>
              </div>

              {/* Financial Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-600"/> Fluxo Financeiro (7 Dias)
                 </h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyRevenue}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                            <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="expense" name="Despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
          </div>

          {/* Right Column: Events & Staff (1/3) */}
          <div className="space-y-6">
              
              {/* Events Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-purple-600" /> Eventos & Grupos
                  </h3>
                  
                  {eventsToday.length > 0 ? (
                      <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-500 uppercase">Acontecendo Hoje</p>
                          {eventsToday.map(ev => (
                              <div key={ev.id} className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                                  <h4 className="font-bold text-purple-900 text-sm">{ev.title}</h4>
                                  <div className="flex justify-between mt-1 text-xs text-purple-700">
                                      <span>{ev.guests} convidados</span>
                                      <span>{ev.type}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-400 mb-4">
                          Sem eventos hoje.
                      </div>
                  )}

                  <div className="mt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Próximos 7 Dias</p>
                      {eventsNext7Days.length === 0 ? (
                           <p className="text-xs text-gray-400 italic">Agenda livre.</p>
                      ) : (
                          <div className="space-y-2">
                              {eventsNext7Days.map(ev => (
                                  <div key={ev.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                                      <div className="flex items-center gap-2">
                                          <div className="w-1 h-8 bg-purple-200 rounded-full"></div>
                                          <div>
                                              <p className="font-bold text-gray-700">{ev.title}</p>
                                              <p className="text-[10px] text-gray-400">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                                          </div>
                                      </div>
                                      <ArrowRight size={14} className="text-gray-300" />
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              {/* Staff Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Users size={18} className="text-blue-600" /> Staff Online
                  </h3>
                  <div className="space-y-3">
                      {activeStaff.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">Nenhum colaborador com ponto aberto.</p>
                      ) : (
                          activeStaff.map(u => (
                              <div key={u.id} className="flex items-center gap-3">
                                  <div className="relative">
                                      <img src={u.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-gray-800">{u.name}</p>
                                      <p className="text-[10px] text-gray-500 uppercase">Em trabalho</p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* Alerts Widget */}
              <div className="bg-red-50 rounded-xl border border-red-100 p-5">
                   <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} /> Atenção Necessária
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      <li>Manutenção: Chalé 102 (Água)</li>
                      {newLeadsCount > 0 && <li>CRM: {newLeadsCount} novos leads aguardando.</li>}
                      {occupancyRate > 90 && <li>Alta Ocupação: Verificar overbooking.</li>}
                  </ul>
              </div>

          </div>
      </div>
    </div>
  );
};
