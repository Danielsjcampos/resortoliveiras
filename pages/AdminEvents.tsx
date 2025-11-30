import React, { useState } from 'react';
import { EventRequest, Venue, Guest } from '../types';
import { Calendar, Users, DollarSign, CheckCircle, Clock, FileText, Send, MapPin, ClipboardList, UserPlus, CheckSquare, Square, X, Plus, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminEventsProps {
   events: EventRequest[];
   venues: Venue[];
   onUpdateEventStatus: (id: string, status: EventRequest['status']) => void;
   onUpdateEventGuests?: (eventId: string, guests: Guest[]) => void;
   onAssignVenue?: (eventId: string, venueId: string) => void;
   onCreateEvent?: (eventData: Partial<EventRequest>) => void;
   onConfirmEvent?: (eventId: string, depositAmount: number) => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({
   events,
   venues,
   onUpdateEventStatus,
   onUpdateEventGuests,
   onAssignVenue,
   onCreateEvent,
   onConfirmEvent
}) => {
   const [viewMode, setViewMode] = useState<'KANBAN' | 'CALENDAR'>('KANBAN');
   const [calendarView, setCalendarView] = useState<'MONTH' | 'WEEK' | 'YEAR'>('MONTH');
   const [currentDate, setCurrentDate] = useState(new Date());
   const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);

   // Modals State
   const [showNewEventForm, setShowNewEventForm] = useState(false);
   const [showConfirmModal, setShowConfirmModal] = useState<EventRequest | null>(null);
   const [depositAmount, setDepositAmount] = useState<number>(0);

   // New Event State
   const [newEvent, setNewEvent] = useState<Partial<EventRequest>>({
      title: '',
      type: 'Casamento',
      date: '',
      guests: 100,
      budget: 0,
      venueId: ''
   });

   // Guest List State
   const [newGuestName, setNewGuestName] = useState('');
   const [newGuestCategory, setNewGuestCategory] = useState<'VIP' | 'Convite Normal' | 'Staff'>('Convite Normal');

   // --- Filtering ---
   const [filter, setFilter] = useState<'ALL' | EventRequest['status']>('ALL');
   const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.status === filter);

   // --- Helpers ---
   const getStatusColor = (status: EventRequest['status']) => {
      switch (status) {
         case 'Solicitado': return 'bg-blue-100 text-blue-800 border-blue-200';
         case 'Proposta Enviada': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
         case 'Confirmado': return 'bg-green-100 text-green-800 border-green-200';
         case 'Concluído': return 'bg-gray-100 text-gray-800 border-gray-200';
         default: return 'bg-gray-100';
      }
   };

   // --- Calendar Logic ---
   const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
   const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

   const handlePrev = () => {
      const newDate = new Date(currentDate);
      if (calendarView === 'MONTH') newDate.setMonth(newDate.getMonth() - 1);
      else if (calendarView === 'WEEK') newDate.setDate(newDate.getDate() - 7);
      else if (calendarView === 'YEAR') newDate.setFullYear(newDate.getFullYear() - 1);
      setCurrentDate(newDate);
   };

   const handleNext = () => {
      const newDate = new Date(currentDate);
      if (calendarView === 'MONTH') newDate.setMonth(newDate.getMonth() + 1);
      else if (calendarView === 'WEEK') newDate.setDate(newDate.getDate() + 7);
      else if (calendarView === 'YEAR') newDate.setFullYear(newDate.getFullYear() + 1);
      setCurrentDate(newDate);
   };

   const handleToday = () => setCurrentDate(new Date());

   const renderMonthView = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      const days = [];

      // Empty slots for previous month
      for (let i = 0; i < firstDay; i++) {
         days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
      }

      // Days
      for (let day = 1; day <= daysInMonth; day++) {
         const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
         const dayEvents = events.filter(e => e.date.startsWith(dateStr));

         days.push(
            <div key={day} className="h-32 border border-gray-100 p-2 hover:bg-gray-50 transition relative group">
               <span className={`text-sm font-bold ${new Date().toDateString() === new Date(year, month, day).toDateString() ? 'bg-olive-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                  {day}
               </span>
               <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.map(ev => (
                     <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${ev.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800'}`}
                        title={ev.title}
                     >
                        {ev.title}
                     </div>
                  ))}
               </div>
            </div>
         );
      }
      return days;
   };

   const renderWeekView = () => {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
      const days = [];

      for (let i = 0; i < 7; i++) {
         const day = new Date(startOfWeek);
         day.setDate(startOfWeek.getDate() + i);
         const dateStr = day.toISOString().split('T')[0];
         const dayEvents = events.filter(e => e.date.startsWith(dateStr));

         days.push(
            <div key={i} className="flex-1 min-h-[400px] border-r border-gray-200 last:border-r-0">
               <div className={`p-2 text-center border-b font-bold ${day.toDateString() === new Date().toDateString() ? 'bg-olive-50 text-olive-700' : 'bg-gray-50 text-gray-600'}`}>
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })} <br />
                  <span className="text-lg">{day.getDate()}</span>
               </div>
               <div className="p-2 space-y-2">
                  {dayEvents.map(ev => (
                     <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`p-2 rounded border cursor-pointer shadow-sm ${ev.status === 'Confirmado' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                     >
                        <div className="font-bold text-sm text-gray-800">{ev.title}</div>
                        <div className="text-xs text-gray-500">{ev.type}</div>
                     </div>
                  ))}
               </div>
            </div>
         );
      }
      return <div className="flex border rounded-xl overflow-hidden">{days}</div>;
   };

   const renderYearView = () => {
      const year = currentDate.getFullYear();
      const months = [];

      for (let m = 0; m < 12; m++) {
         const monthName = new Date(year, m, 1).toLocaleDateString('pt-BR', { month: 'long' });
         const monthEvents = events.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === m;
         });

         months.push(
            <div key={m} className="border rounded-lg p-4 hover:shadow-md transition bg-white">
               <h4 className="font-bold text-gray-800 capitalize mb-2">{monthName}</h4>
               <div className="text-xs text-gray-500 mb-2">{monthEvents.length} eventos</div>
               <div className="space-y-1">
                  {monthEvents.slice(0, 3).map(ev => (
                     <div key={ev.id} className="text-xs truncate flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${ev.status === 'Confirmado' ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                        {ev.title}
                     </div>
                  ))}
                  {monthEvents.length > 3 && <div className="text-xs text-gray-400 italic">+ {monthEvents.length - 3} outros</div>}
               </div>
            </div>
         );
      }
      return <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">{months}</div>;
   };

   // --- Handlers ---
   const handleAddGuest = () => {
      if (!selectedEvent || !newGuestName || !onUpdateEventGuests) return;
      const newGuest: Guest = {
         id: Math.random().toString(36).substr(2, 9),
         name: newGuestName,
         category: newGuestCategory as any,
         status: 'Pendente'
      };
      const updatedList = [...(selectedEvent.guestList || []), newGuest];
      onUpdateEventGuests(selectedEvent.id, updatedList);
      setSelectedEvent({ ...selectedEvent, guestList: updatedList }); // Optimistic update
      setNewGuestName('');
   };

   const handleGuestCheckIn = (guestId: string) => {
      if (!selectedEvent || !onUpdateEventGuests) return;
      const updatedList = (selectedEvent.guestList || []).map(g =>
         g.id === guestId ? { ...g, status: g.status === 'Presente (Check-in)' ? 'Pendente' : 'Presente (Check-in)' } : g
      ) as Guest[];
      onUpdateEventGuests(selectedEvent.id, updatedList);
      setSelectedEvent({ ...selectedEvent, guestList: updatedList });
   };

   const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onCreateEvent) {
         onCreateEvent(newEvent);
         setShowNewEventForm(false);
         setNewEvent({ title: '', type: 'Casamento', date: '', guests: 100, budget: 0, venueId: '' });
      }
   };

   const handleConfirmSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onConfirmEvent && showConfirmModal) {
         onConfirmEvent(showConfirmModal.id, depositAmount);
         setShowConfirmModal(null);
         setDepositAmount(0);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Gestão de Eventos</h2>
               <p className="text-gray-500 text-sm">Controle de casamentos, lista de convidados e ocupação de locais.</p>
            </div>

            <div className="flex gap-2">
               <button
                  onClick={() => setShowNewEventForm(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-olive-600 text-white hover:bg-olive-700 flex items-center gap-2 shadow-sm"
               >
                  <Plus size={16} /> Nova Proposta
               </button>
               <button
                  onClick={() => setViewMode('KANBAN')}
                  className={`px-4 py-2 text-sm rounded-lg border ${viewMode === 'KANBAN' ? 'bg-olive-600 text-white border-olive-600' : 'bg-white text-gray-600'}`}
               >
                  Lista / Kanban
               </button>
               <button
                  onClick={() => setViewMode('CALENDAR')}
                  className={`px-4 py-2 text-sm rounded-lg border ${viewMode === 'CALENDAR' ? 'bg-olive-600 text-white border-olive-600' : 'bg-white text-gray-600'}`}
               >
                  Calendário
               </button>
            </div>
         </div>

         {/* --- CALENDAR VIEW --- */}
         {viewMode === 'CALENDAR' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in-up">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                     <h3 className="font-bold text-xl text-gray-800 capitalize">
                        {calendarView === 'YEAR'
                           ? currentDate.getFullYear()
                           : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                     </h3>
                     <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={handlePrev} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronLeft size={18} /></button>
                        <button onClick={handleToday} className="px-3 text-xs font-bold text-gray-600 hover:text-gray-900">Hoje</button>
                        <button onClick={handleNext} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronRight size={18} /></button>
                     </div>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                     <button onClick={() => setCalendarView('WEEK')} className={`px-3 py-1 text-xs font-bold rounded ${calendarView === 'WEEK' ? 'bg-white shadow text-olive-600' : 'text-gray-500'}`}>Semana</button>
                     <button onClick={() => setCalendarView('MONTH')} className={`px-3 py-1 text-xs font-bold rounded ${calendarView === 'MONTH' ? 'bg-white shadow text-olive-600' : 'text-gray-500'}`}>Mês</button>
                     <button onClick={() => setCalendarView('YEAR')} className={`px-3 py-1 text-xs font-bold rounded ${calendarView === 'YEAR' ? 'bg-white shadow text-olive-600' : 'text-gray-500'}`}>Ano</button>
                  </div>
               </div>

               {calendarView === 'MONTH' && (
                  <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                     {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
                     ))}
                     {renderMonthView().map(day => <div key={day.key} className="bg-white">{day}</div>)}
                  </div>
               )}

               {calendarView === 'WEEK' && renderWeekView()}
               {calendarView === 'YEAR' && renderYearView()}
            </div>
         )}

         {/* --- KANBAN VIEW --- */}
         {viewMode === 'KANBAN' && (
            <>
               <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
                  {['ALL', 'Solicitado', 'Proposta Enviada', 'Confirmado'].map((status) => (
                     <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition ${filter === status ? 'bg-olive-600 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                     >
                        {status === 'ALL' ? 'Todos' : status}
                     </button>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => {
                     const assignedVenue = venues.find(v => v.id === event.venueId);

                     return (
                        <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <span className="text-xs font-bold text-olive-600 uppercase tracking-wide">{event.type}</span>
                                 <h3 className="font-bold text-xl text-gray-900 mt-1 cursor-pointer hover:text-olive-700" onClick={() => setSelectedEvent(event)}>
                                    {event.title}
                                 </h3>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(event.status)}`}>
                                 {event.status}
                              </span>
                           </div>

                           <div className="space-y-3 mb-6">
                              <div className="flex items-center text-gray-600 text-sm">
                                 <Calendar size={16} className="mr-2" />
                                 {new Date(event.date).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                 <MapPin size={16} className="mr-2" />
                                 {assignedVenue ? (
                                    <span className="font-medium text-gray-800">{assignedVenue.name}</span>
                                 ) : (
                                    <span className="text-red-400 italic">Local não definido</span>
                                 )}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                 <Users size={16} className="mr-2" />
                                 {event.guests} convidados estimados
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                 <DollarSign size={16} className="mr-2" />
                                 Orçamento: R$ {event.budget.toLocaleString('pt-BR')}
                              </div>
                           </div>

                           <div className="border-t pt-4 flex gap-2">
                              {event.status === 'Confirmado' ? (
                                 <button
                                    onClick={() => setSelectedEvent(event)}
                                    className="w-full bg-olive-100 text-olive-800 py-2 rounded-lg text-sm font-bold hover:bg-olive-200 transition flex justify-center items-center gap-2"
                                 >
                                    <ClipboardList size={16} /> Gerir Lista de Convidados
                                 </button>
                              ) : (
                                 event.status === 'Solicitado' && (
                                    <button
                                       onClick={() => onUpdateEventStatus(event.id, 'Proposta Enviada')}
                                       className="flex-1 bg-olive-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-olive-700 transition flex justify-center items-center gap-2"
                                    >
                                       <Send size={16} /> Enviar Proposta
                                    </button>
                                 )
                              )}
                              {event.status === 'Proposta Enviada' && (
                                 <button
                                    onClick={() => setShowConfirmModal(event)}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex justify-center items-center gap-2"
                                 >
                                    <CheckCircle size={16} /> Aceitar / Confirmar
                                 </button>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </>
         )}

         {/* --- NEW EVENT MODAL --- */}
         {showNewEventForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                  <div className="bg-olive-900 p-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center gap-2"><Plus size={20} /> Nova Proposta de Evento</h3>
                     <button onClick={() => setShowNewEventForm(false)} className="hover:bg-olive-800 p-1 rounded"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
                        <input className="w-full border rounded-lg p-2" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Ex: Casamento Silva" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                           <select className="w-full border rounded-lg p-2" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}>
                              <option value="Casamento">Casamento</option>
                              <option value="Corporativo">Corporativo</option>
                              <option value="Aniversário">Aniversário</option>
                              <option value="Outro">Outro</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                           <input type="date" className="w-full border rounded-lg p-2" required value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Convidados (Est.)</label>
                           <input type="number" className="w-full border rounded-lg p-2" value={newEvent.guests} onChange={e => setNewEvent({ ...newEvent, guests: Number(e.target.value) })} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (Est.)</label>
                           <input type="number" className="w-full border rounded-lg p-2" value={newEvent.budget} onChange={e => setNewEvent({ ...newEvent, budget: Number(e.target.value) })} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Local Preferido (Opcional)</label>
                        <select className="w-full border rounded-lg p-2" value={newEvent.venueId} onChange={e => setNewEvent({ ...newEvent, venueId: e.target.value })}>
                           <option value="">Selecione...</option>
                           {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                     </div>
                     <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowNewEventForm(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700 shadow-lg">Criar Proposta</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- CONFIRMATION / DEPOSIT MODAL --- */}
         {showConfirmModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                  <div className="bg-green-700 p-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center gap-2"><CheckCircle size={20} /> Confirmar Evento</h3>
                     <button onClick={() => setShowConfirmModal(null)} className="hover:bg-green-800 p-1 rounded"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleConfirmSubmit} className="p-6 space-y-4">
                     <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                        <p className="text-sm text-green-800 font-bold">Evento: {showConfirmModal.title}</p>
                        <p className="text-xs text-green-600">Orçamento Total: R$ {showConfirmModal.budget.toLocaleString('pt-BR')}</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Sinal (Reserva)</label>
                        <div className="relative">
                           <span className="absolute left-3 top-2 text-gray-500">R$</span>
                           <input
                              type="number"
                              className="w-full border rounded-lg p-2 pl-8 font-bold text-lg text-gray-800"
                              required
                              value={depositAmount}
                              onChange={e => setDepositAmount(Number(e.target.value))}
                              placeholder="0.00"
                           />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Este valor será lançado automaticamente no Financeiro.</p>
                     </div>

                     <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowConfirmModal(null)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg">
                           Confirmar & Receber
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- EVENT DETAIL / GUEST LIST MODAL --- */}
         {selectedEvent && (
            <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
               <div className="w-full max-w-2xl bg-white h-full shadow-xl flex flex-col animate-slide-in-right">
                  <div className="p-6 border-b bg-olive-900 text-white flex justify-between items-center">
                     <div>
                        <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                        <p className="text-sm text-olive-200">{new Date(selectedEvent.date).toLocaleDateString('pt-BR')} • {selectedEvent.type}</p>
                     </div>
                     <button onClick={() => setSelectedEvent(null)} className="hover:bg-olive-800 p-2 rounded-full"><X size={24} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">

                     {/* Venue Selection */}
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={18} /> Local do Evento</h3>
                        <select
                           className="w-full border rounded-lg p-2"
                           value={selectedEvent.venueId || ''}
                           onChange={(e) => {
                              if (onAssignVenue) {
                                 onAssignVenue(selectedEvent.id, e.target.value);
                                 setSelectedEvent({ ...selectedEvent, venueId: e.target.value });
                              }
                           }}
                        >
                           <option value="">Selecione um local...</option>
                           {venues.map(v => (
                              <option key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</option>
                           ))}
                        </select>
                     </div>

                     {/* Guest List Manager */}
                     <div className="border rounded-xl overflow-hidden">
                        <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                           <h3 className="font-bold text-gray-800 flex items-center gap-2"><Users size={18} /> Lista de Convidados</h3>
                           <span className="text-xs bg-white px-2 py-1 rounded border">
                              {selectedEvent.guestList?.filter(g => g.status === 'Presente (Check-in)').length || 0} / {selectedEvent.guestList?.length || 0} Presentes
                           </span>
                        </div>

                        {/* Add Guest Form */}
                        <div className="p-4 border-b bg-white flex gap-2 items-end">
                           <div className="flex-grow">
                              <label className="text-xs text-gray-500 font-bold ml-1">Nome Completo</label>
                              <input
                                 className="w-full border rounded-lg p-2 text-sm"
                                 placeholder="Nome do convidado"
                                 value={newGuestName}
                                 onChange={e => setNewGuestName(e.target.value)}
                              />
                           </div>
                           <div className="w-1/3">
                              <label className="text-xs text-gray-500 font-bold ml-1">Categoria</label>
                              <select
                                 className="w-full border rounded-lg p-2 text-sm"
                                 value={newGuestCategory}
                                 onChange={e => setNewGuestCategory(e.target.value as any)}
                              >
                                 <option value="Convite Normal">Normal</option>
                                 <option value="VIP">VIP</option>
                                 <option value="Staff">Staff</option>
                              </select>
                           </div>
                           <button
                              onClick={handleAddGuest}
                              className="bg-olive-600 text-white p-2 rounded-lg hover:bg-olive-700"
                           >
                              <UserPlus size={20} />
                           </button>
                        </div>

                        {/* The List */}
                        <div className="max-h-80 overflow-y-auto bg-white divide-y">
                           {(!selectedEvent.guestList || selectedEvent.guestList.length === 0) ? (
                              <p className="p-8 text-center text-gray-400 italic">Nenhum convidado na lista.</p>
                           ) : (
                              selectedEvent.guestList.map(guest => (
                                 <div key={guest.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                       <button
                                          onClick={() => handleGuestCheckIn(guest.id)}
                                          className={`transition ${guest.status === 'Presente (Check-in)' ? 'text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                                       >
                                          {guest.status === 'Presente (Check-in)' ? <CheckSquare size={24} /> : <Square size={24} />}
                                       </button>
                                       <div>
                                          <div className="font-bold text-gray-800 text-sm">{guest.name}</div>
                                          <div className="text-xs text-gray-500">{guest.category}</div>
                                       </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${guest.status === 'Presente (Check-in)' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                       {guest.status === 'Presente (Check-in)' ? 'PRESENTE' : 'PENDENTE'}
                                    </span>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>

                  </div>
               </div>
            </div>
         )}

      </div>
   );
};
