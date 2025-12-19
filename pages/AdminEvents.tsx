import React, { useState } from 'react';
import { EventRequest, Venue, EventGuest, EventParticipant } from '../types';
import { Calendar, Users, DollarSign, CheckCircle, Clock, FileText, Send, MapPin, ClipboardList, UserPlus, CheckSquare, Square, X, Plus, Trash2, Globe, Layout, Image as ImageIcon, Coffee, Utensils, CreditCard, Ticket, ChevronRight, ChevronLeft, Edit2, Save } from 'lucide-react';

interface AdminEventsProps {
  events: EventRequest[];
  venues: Venue[];
  onUpdateEventStatus: (id: string, status: EventRequest['status']) => void;
  onUpdateEventGuests?: (eventId: string, guests: EventGuest[]) => void;
  onAssignVenue?: (eventId: string, venueId: string) => void;
  onAddEvent?: (event: Partial<EventRequest>) => void;
  onDeleteEvent?: (id: string) => void;
  onUpdateEvent?: (event: EventRequest) => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({ 
  events, venues, onUpdateEventStatus, onUpdateEventGuests, onAssignVenue, onAddEvent, onDeleteEvent, onUpdateEvent 
}) => {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'CALENDAR'>('KANBAN');
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null); // New for Editing
  const [filter, setFilter] = useState<'ALL' | EventRequest['status']>('ALL');
  
  // --- PARTICIPANT LIST VIEW STATE ---
  const [showParticipantListModal, setShowParticipantListModal] = useState<EventRequest | null>(null); // New Modal state
  const [participantSearch, setParticipantSearch] = useState(''); // New Search State
  
  // --- FORM STATE ---
  const [formStep, setFormStep] = useState(1); // 1: Info, 2: Details/Media, 3: Services, 4: Financial/Tickets
  const [eventFormData, setEventFormData] = useState<Partial<EventRequest>>({
    title: '', type: 'Show', status: 'Confirmado', showOnSite: false, 
    guests: 0, budget: 0, 
    startDate: '', endDate: '',
    cateringOptions: [],
    galleryImages: [],
    paymentMethod: 'Pix' // Default
  });

  // --- CHECK-IN STATE ---
  const [checkInSearch, setCheckInSearch] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', cpf: '', phone: '', email: '' });

  const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.status === filter);

  const handleCheckIn = async (participantId: string) => {
      // In a real app, this would call Supabase directly or via a prop handler
      // For this MVP, we'll simulate the update via onUpdateEvent if available, or just local state for demo
      if (selectedEvent && onUpdateEvent) {
          const updatedParticipants = selectedEvent.participants?.map(p => 
              p.id === participantId 
              ? { ...p, status: 'Presente' as const, checkedInAt: new Date().toISOString() } 
              : p
          );
          
          const updatedEvent = { ...selectedEvent, participants: updatedParticipants };
          onUpdateEvent(updatedEvent);
          setSelectedEvent(updatedEvent); // Update local view
      }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedEvent && onUpdateEvent) {
          const newP: EventParticipant = {
              id: `ep-${Date.now()}`,
              eventId: selectedEvent.id,
              name: newParticipant.name,
              cpf: newParticipant.cpf,
              phone: newParticipant.phone,
              email: newParticipant.email,
              status: 'Confirmado',
              ticketPurchased: true, // Manual add implies purchased/authorized
              purchaseDate: new Date().toISOString()
          };

          const updatedParticipants = [...(selectedEvent.participants || []), newP];
          const updatedEvent = { ...selectedEvent, participants: updatedParticipants };
          
          onUpdateEvent(updatedEvent);
          setSelectedEvent(updatedEvent);
          
          setShowAddParticipant(false);
          setNewParticipant({ name: '', cpf: '', phone: '', email: '' });
      }
  };

  const getStatusColor = (status: EventRequest['status']) => {
    switch (status) {
      case 'Solicitado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Proposta Enviada': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Concluído': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100';
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId && onUpdateEvent) {
         // Logic to derive single date from startDate
         const baseDate = eventFormData.startDate ? eventFormData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];

         onUpdateEvent({
             ...eventFormData,
             id: editingEventId,
             date: baseDate,
             // Ensure type safety
         } as EventRequest);
    } else if (onAddEvent) {
        const baseDate = eventFormData.startDate ? eventFormData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
        
        onAddEvent({
            ...eventFormData,
            date: baseDate
        });
    }

   setIsAddingEvent(false);
   setEditingEventId(null);
   setEventFormData({ title: '', type: 'Show', status: 'Confirmado', showOnSite: false, guests: 0, budget: 0, cateringOptions: [], galleryImages: [] });
   setFormStep(1);
  };

  const handleEditClick = (event: EventRequest) => {
      setEditingEventId(event.id);
      setEventFormData({
          ...event,
          // Ensure dates are strings for inputs
          startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      });
      setIsAddingEvent(true);
  };

  const toggleCatering = (option: string) => {
      setEventFormData(prev => {
          const current = prev.cateringOptions || [];
          if (current.includes(option)) return { ...prev, cateringOptions: current.filter(c => c !== option) };
          return { ...prev, cateringOptions: [...current, option] };
      });
  };

  const handleAddGalleryImage = () => {
      const url = prompt("URL da Imagem:");
      if (url) {
          setEventFormData(prev => ({ ...prev, galleryImages: [...(prev.galleryImages || []), url] }));
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Eventos Avançada</h2>
          <p className="text-gray-500 text-sm">Controle completo de cronograma, vendas e organização.</p>
        </div>
        
        <div className="flex gap-2">
             <button 
                onClick={() => setIsAddingEvent(true)}
                className="flex items-center gap-2 bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 shadow-sm font-bold transition"
             >
                <Plus size={18} /> Novo Evento
             </button>
             <button 
                onClick={() => setViewMode(viewMode === 'KANBAN' ? 'CALENDAR' : 'KANBAN')}
                className="flex items-center gap-2 bg-white text-gray-700 border px-4 py-2 rounded-lg hover:bg-gray-50 font-bold transition"
             >
                {viewMode === 'KANBAN' ? <Calendar size={18} /> : <Layout size={18} />}
                {viewMode === 'KANBAN' ? 'Calendário' : 'Kanban'}
             </button>
        </div>
      </div>

      {/* --- ADD EVENT MODAL (MULTI-STEP) --- */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="bg-olive-900 p-6 text-white flex justify-between items-center">
              <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    {editingEventId ? <Edit2 size={24}/> : <Plus size={24}/>} 
                    {editingEventId ? 'Editar Evento' : 'Criar Novo Evento'}
                  </h3>
                  <p className="text-olive-300 text-xs mt-1">Passo {formStep} de 4</p>
              </div>
              <button onClick={() => { setIsAddingEvent(false); setEditingEventId(null); }}><X size={24}/></button>
            </div>

            {/* Steps Indicator */}
            <div className="flex bg-gray-100 border-b">
                {['Informações Básicas', 'Detalhes & Mídia', 'Serviços', 'Financeiro & Ingressos'].map((step, idx) => (
                    <div key={idx} className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors
                        ${formStep === idx + 1 ? 'bg-white text-olive-700 border-t-2 border-olive-600' : 'text-gray-400'}`}>
                        {idx + 1}. {step}
                    </div>
                ))}
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* STEP 1: BASICS */}
              {formStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título do Evento</label>
                              <input required className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white transition" value={eventFormData.title} onChange={e => setEventFormData({...eventFormData, title: e.target.value})} placeholder="Ex: Casamento Silva & Souza" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria / Tipo</label>
                              <select className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.type} onChange={e => setEventFormData({...eventFormData, type: e.target.value as any})}>
                                  <option value="Casamento">Casamento</option>
                                  <option value="Corporativo">Corporativo</option>
                                  <option value="Show">Show / Atração</option>
                                  <option value="Workshop">Workshop</option>
                                  <option value="Aniversário">Aniversário</option>
                                  <option value="Outro">Outro</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Local (Venue)</label>
                              <select className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.venueId || ''} onChange={e => setEventFormData({...eventFormData, venueId: e.target.value})}>
                                  <option value="">Selecione um local...</option>
                                  {venues.map(v => <option key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Início (Data/Hora)</label>
                              <input type="datetime-local" className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.startDate} onChange={e => setEventFormData({...eventFormData, startDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Término (Data/Hora)</label>
                              <input type="datetime-local" className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.endDate} onChange={e => setEventFormData({...eventFormData, endDate: e.target.value})} />
                          </div>
                      </div>
                  </div>
              )}

              {/* STEP 2: DETAILS & MEDIA */}
              {formStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Responsável / Organizador</label>
                          <input className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.organizerName || ''} onChange={e => setEventFormData({...eventFormData, organizerName: e.target.value})} placeholder="Nome da empresa ou pessoa..." />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição Completa</label>
                          <textarea className="w-full border p-3 rounded-xl bg-gray-50 h-32" value={eventFormData.description || ''} onChange={e => setEventFormData({...eventFormData, description: e.target.value})} placeholder="Detalhes do evento..." />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagem de Capa (URL)</label>
                              <input className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.coverImage || ''} onChange={e => setEventFormData({...eventFormData, coverImage: e.target.value})} placeholder="https://..." />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Galeria de Fotos</label>
                              <button type="button" onClick={handleAddGalleryImage} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-olive-500 hover:text-olive-600 transition flex items-center justify-center gap-2">
                                  <ImageIcon size={18}/> Adicionar URL
                              </button>
                              <div className="flex gap-2 mt-2 overflow-x-auto">
                                  {eventFormData.galleryImages?.map((img, i) => (
                                      <img key={i} src={img} className="w-12 h-12 object-cover rounded-lg border" />
                                  ))}
                              </div>
                           </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <Globe size={20} className="text-gray-400" />
                          <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm">Visibilidade no Site</h4>
                              <p className="text-xs text-gray-500">Este evento aparecerá na listagem pública?</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" checked={eventFormData.showOnSite} onChange={e => setEventFormData({...eventFormData, showOnSite: e.target.checked})} />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                      </div>
                  </div>
              )}

              {/* STEP 3: SERVICES */}
              {formStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Utensils size={20} className="text-olive-600"/> Opções de Catering</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {['Água/Suco', 'Café / Coffee Break', 'Café da Manhã', 'Almoço', 'Jantar', 'Coquetel', 'Open Bar'].map(opt => (
                              <button 
                                  key={opt}
                                  type="button"
                                  onClick={() => toggleCatering(opt)}
                                  className={`p-4 rounded-xl border-2 transition text-left relative overflow-hidden
                                      ${eventFormData.cateringOptions?.includes(opt) 
                                          ? 'border-olive-600 bg-olive-50 text-olive-800' 
                                          : 'border-gray-100 bg-white hover:border-gray-200'}`}
                              >
                                  <span className="font-bold text-sm relative z-10">{opt}</span>
                                  {eventFormData.cateringOptions?.includes(opt) && <CheckCircle size={18} className="absolute top-2 right-2 text-olive-600" />}
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              {/* STEP 4: FINANCIALS & TICKETS */}
              {formStep === 4 && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Custo Total (R$)</label>
                              <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 font-bold" value={eventFormData.budget || ''} onChange={e => setEventFormData({...eventFormData, budget: parseFloat(e.target.value)})} placeholder="0.00" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sinal / Reserva (R$)</label>
                              <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 font-bold" value={eventFormData.depositAmount || ''} onChange={e => setEventFormData({...eventFormData, depositAmount: parseFloat(e.target.value)})} placeholder="0.00" />
                          </div>

                          {/* Payment Method for Deposit */}
                          {eventFormData.depositAmount && eventFormData.depositAmount > 0 ? (
                              <div className="col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                  <label className="block text-xs font-bold text-yellow-800 uppercase mb-2">Método Pagamento (Sinal)</label>
                                  <select className="w-full border p-3 rounded-xl bg-white" value={(eventFormData as any).paymentMethod || 'Pix'} onChange={e => setEventFormData({...eventFormData, paymentMethod: e.target.value} as any)}>
                                      <option value="Pix">Pix</option>
                                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                                      <option value="Dinheiro">Dinheiro</option>
                                      <option value="Transferência">Transferência Bancária</option>
                                  </select>
                                  <p className="text-xs text-yellow-600 mt-2">Um lançamento será criado automaticamente no Financeiro com o valor do Sinal.</p>
                              </div>
                          ) : null}
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Termos de Pagamento</label>
                              <input className="w-full border p-3 rounded-xl bg-gray-50" value={eventFormData.paymentTerms || ''} onChange={e => setEventFormData({...eventFormData, paymentTerms: e.target.value})} placeholder="Ex: 50% na reserva, 50% 7 dias antes..." />
                          </div>
                          
                          {/* Payment Method for Deposit */}
                          {(eventFormData.depositAmount || 0) > 0 && (
                              <div className="col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                  <label className="block text-xs font-bold text-yellow-800 uppercase mb-2">Método Pagamento (Sinal)</label>
                                  <select className="w-full border p-3 rounded-xl bg-white" value={(eventFormData as any).paymentMethod || 'Pix'} onChange={e => setEventFormData({...eventFormData, paymentMethod: e.target.value} as any)}>
                                      <option value="Pix">Pix</option>
                                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                                      <option value="Dinheiro">Dinheiro</option>
                                      <option value="Transferência">Transferência Bancária</option>
                                  </select>
                                  <p className="text-xs text-yellow-600 mt-2">Um lançamento será criado automaticamente no Financeiro com o valor do Sinal.</p>
                              </div>
                          )}
                      </div>

                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <div className="flex items-center justify-between mb-6">
                              <h4 className="font-bold text-blue-900 flex items-center gap-2"><Ticket size={20}/> Venda de Ingressos</h4>
                              <label className="flex items-center gap-2 text-sm font-bold text-blue-800 cursor-pointer">
                                  <input type="checkbox" checked={eventFormData.isPublicTicket} onChange={e => setEventFormData({...eventFormData, isPublicTicket: e.target.checked})} className="w-4 h-4 rounded text-blue-600" />
                                  Ativar Venda
                              </label>
                          </div>
                          
                          {eventFormData.isPublicTicket ? (
                              <div className="grid grid-cols-2 gap-6 animate-fade-in">
                                  <div>
                                      <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Preço do Ingresso (R$)</label>
                                      <input type="number" className="w-full border border-blue-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 outline-none" value={eventFormData.ticketPrice || ''} onChange={e => setEventFormData({...eventFormData, ticketPrice: parseFloat(e.target.value)})} placeholder="0.00" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Vagas / Capacidade</label>
                                      <input type="number" className="w-full border border-blue-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 outline-none" value={eventFormData.guests || ''} onChange={e => setEventFormData({...eventFormData, guests: parseInt(e.target.value)})} placeholder="Qtd. de Participantes" />
                                  </div>
                              </div>
                          ) : (
                             <p className="text-sm text-blue-600/60 italic">Marque "Ativar Venda" para configurar ingressos públicos para este evento.</p>
                          )}
                      </div>
                  </div>
              )}
            </form>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
                {formStep > 1 ? (
                    <button type="button" onClick={() => setFormStep(s => s - 1)} className="px-6 py-2 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-200 transition">Voltar</button>
                ) : <div></div>}
                
                {formStep < 4 ? (
                    <button type="button" onClick={() => setFormStep(s => s + 1)} className="px-6 py-2 rounded-xl bg-olive-600 text-white font-bold hover:bg-olive-700 transition flex items-center gap-2">
                        Próximo <ChevronRight size={16}/>
                    </button>
                ) : (
                    <button onClick={handleCreateSubmit} className="px-8 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg flex items-center gap-2">
                        {editingEventId ? <Save size={18}/> : <CheckCircle size={18}/>} 
                        {editingEventId ? 'Salvar Alterações' : 'Finalizar & Criar'}
                    </button>
                )}
            </div>
          </div>
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
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col justify-between h-full group">
                     <div>
                        {event.coverImage && (
                            <div className="h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl relative">
                                <img src={event.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className={`absolute bottom-3 left-6 px-2 py-0.5 rounded text-[10px] font-black uppercase text-white tracking-widest bg-white/20 backdrop-blur-md`}>
                                   {event.type}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              {!event.coverImage && <span className="text-xs font-bold text-olive-600 uppercase tracking-wide">{event.type}</span>}
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
                              {event.startDate ? new Date(event.startDate).toLocaleDateString('pt-BR') : new Date(event.date).toLocaleDateString('pt-BR')}
                           </div>
                           <div className="flex items-center text-gray-600 text-sm">
                              <MapPin size={16} className="mr-2" />
                              {assignedVenue ? <span className="font-medium text-gray-800">{assignedVenue.name}</span> : <span className="text-red-400 italic">Local não definido</span>}
                           </div>
                           {event.isPublicTicket && (
                               <div className="flex items-center text-blue-600 text-sm font-bold">
                                  <Ticket size={16} className="mr-2" />
                                  Ingressos à Venda (R$ {event.ticketPrice?.toFixed(2)})
                               </div>
                           )}
                        </div>
                     </div>

                     <div className="border-t pt-4 flex gap-2">
                        <button 
                           onClick={() => setSelectedEvent(event)}
                           className="flex-grow bg-olive-50 text-olive-800 py-2 rounded-lg text-sm font-bold hover:bg-olive-100 transition flex justify-center items-center gap-2"
                        >
                         <ClipboardList size={16} /> Detalhes
                        </button>
                        <button 
                           onClick={() => setShowParticipantListModal(event)}
                           className="bg-blue-50 text-blue-800 p-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                           title="Lista de Participantes"
                        >
                           <Users size={16} />
                        </button>
                        <button 
                           onClick={() => handleEditClick(event)}
                           className="bg-stone-50 text-stone-600 p-2 rounded-lg text-sm font-bold hover:bg-stone-100 transition"
                           title="Editar"
                        >
                           <Edit2 size={16} />
                        </button>
                        <button 
                           onClick={() => onDeleteEvent && onDeleteEvent(event.id)}
                           className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
                  );
               })}
            </div>
         </>
      )}

      {/* --- CALENDAR VIEW (Simple List by Venue) --- */}
      {viewMode === 'CALENDAR' && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Ocupação dos Espaços</h3>
            <div className="space-y-4">
               {venues.map(venue => {
                  const venueEvents = events.filter(e => e.venueId === venue.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  return (
                     <div key={venue.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3 border-b pb-2">
                           <MapPin size={18} className="text-olive-600" />
                           <h4 className="font-bold text-gray-800">{venue.name}</h4>
                        </div>
                        {venueEvents.length === 0 ? <div className="text-sm text-gray-400 italic py-2">Nenhum evento agendado.</div> : (
                           <div className="flex gap-4 overflow-x-auto pb-2">
                              {venueEvents.map(ev => (
                                 <div key={ev.id} className="min-w-[200px] bg-blue-50 border border-blue-100 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition" onClick={() => setSelectedEvent(ev)}>
                                    <div className="text-xs font-bold text-blue-800 mb-1">{new Date(ev.date).toLocaleDateString('pt-BR')}</div>
                                    <div className="font-bold text-sm text-gray-800 truncate">{ev.title}</div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      {/* --- DETAIL MODAL (READ ONLY / VIEW) --- */}
      {selectedEvent && (
         <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-xl flex flex-col animate-slide-in-right overflow-y-auto">
               <div className="relative h-48 bg-stone-900">
                   {selectedEvent.coverImage ? (
                       <img src={selectedEvent.coverImage} className="w-full h-full object-cover opacity-60" />
                   ) : (
                       <div className="w-full h-full bg-olive-900 opacity-80" />
                   )}
                   <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                       <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                       <p className="text-sm text-olive-200 mt-1 flex items-center gap-2">
                           <Calendar size={14}/> {new Date(selectedEvent.date).toLocaleDateString('pt-BR')} • <MapPin size={14}/> {venues.find(v => v.id === selectedEvent.venueId)?.name || 'Local N/A'}
                       </p>
                   </div>
                   <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 bg-black/30 text-white hover:bg-white/20 p-2 rounded-full backdrop-blur-md"><X size={24} /></button>
               </div>

               <div className="p-6 space-y-8">
                  {/* Info Blocks */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Organizador</span>
                          <span className="font-bold text-gray-800">{selectedEvent.organizerName || 'Não informado'}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Tipo</span>
                          <span className="font-bold text-gray-800">{selectedEvent.type}</span>
                      </div>
                  </div>

                  {/* Description */}
                  <div>
                      <h4 className="font-bold text-gray-900 mb-2">Sobre o Evento</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent.description || 'Sem descrição.'}</p>
                  </div>

                  {/* Catering */}
                  {selectedEvent.cateringOptions && selectedEvent.cateringOptions.length > 0 && (
                      <div>
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Utensils size={18} className="text-olive-600"/> Serviços de Catering</h4>
                          <div className="flex flex-wrap gap-2">
                              {selectedEvent.cateringOptions.map(opt => (
                                  <span key={opt} className="px-3 py-1 bg-olive-50 text-olive-700 text-xs font-bold rounded-full border border-olive-100">{opt}</span>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Ticketing & Participants Check-in */}
                  {selectedEvent.isPublicTicket && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-blue-900 flex items-center gap-2"><Ticket size={20}/> Check-in & Lista de Convidados</h4>
                              <div className="flex items-center gap-4">
                                  <span className="text-lg font-black text-blue-700">R$ {selectedEvent.ticketPrice?.toFixed(2)}</span>
                                  <button onClick={() => setShowAddParticipant(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 font-bold">
                                      <UserPlus size={14}/> Adicionar
                                  </button>
                              </div>
                          </div>

                          {showAddParticipant && (
                              <form onSubmit={handleAddParticipant} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 mb-4 animate-fade-in">
                                  <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Adicionar Participante Manualmente</h5>
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                      <input required placeholder="Nome Completo *" className="border p-2 rounded-lg text-sm" value={newParticipant.name} onChange={e => setNewParticipant({...newParticipant, name: e.target.value})} />
                                      <input required placeholder="Telefone *" className="border p-2 rounded-lg text-sm" value={newParticipant.phone} onChange={e => setNewParticipant({...newParticipant, phone: e.target.value})} />
                                      <input placeholder="CPF (Opcional)" className="border p-2 rounded-lg text-sm" value={newParticipant.cpf} onChange={e => setNewParticipant({...newParticipant, cpf: e.target.value})} />
                                      <input type="email" placeholder="Email (Opcional)" className="border p-2 rounded-lg text-sm" value={newParticipant.email} onChange={e => setNewParticipant({...newParticipant, email: e.target.value})} />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => setShowAddParticipant(false)} className="text-xs text-gray-500 hover:text-gray-700 font-bold px-3 py-1">Cancelar</button>
                                      <button type="submit" className="text-xs bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 font-bold">Salvar Participante</button>
                                  </div>
                              </form>
                          )}
                          
                          <div className="bg-white rounded-xl overflow-hidden border border-blue-100">
                              <div className="p-3 border-b bg-blue-50/50 flex flex-col gap-3">
                                  <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-blue-800 uppercase">Lista de Convidados ({selectedEvent.participants?.length || 0})</span>
                                  </div>
                                  <input 
                                    className="w-full text-sm border p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 outline-none" 
                                    placeholder="Buscar por nome, email, cpf ou telefone..." 
                                    value={checkInSearch}
                                    onChange={e => setCheckInSearch(e.target.value)}
                                  />
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                  {!selectedEvent.participants || selectedEvent.participants.length === 0 ? (
                                      <p className="p-8 text-center text-sm text-gray-400 italic">Nenhum participante na lista.</p>
                                  ) : (
                                      selectedEvent.participants
                                        .filter(p => {
                                            if (!checkInSearch) return true;
                                            const search = checkInSearch.toLowerCase();
                                            return p.name.toLowerCase().includes(search) || 
                                                   p.email?.toLowerCase().includes(search) || 
                                                   p.phone?.includes(search) ||
                                                   p.cpf?.includes(search);
                                        })
                                        .map(p => (
                                          <div key={p.id} className={`p-3 border-b flex justify-between items-center transition ${p.status === 'Presente' ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                                              <div className="flex items-center gap-3">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.status === 'Presente' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                      {p.status === 'Presente' ? <CheckCircle size={14}/> : p.name.charAt(0)}
                                                  </div>
                                                  <div>
                                                      <div className="font-bold text-sm text-gray-800">{p.name}</div>
                                                      <div className="text-xs text-gray-400 flex gap-2">
                                                          {p.phone && <span>{p.phone}</span>}
                                                          {p.cpf && <span>• CPF: {p.cpf}</span>}
                                                      </div>
                                                  </div>
                                              </div>
                                              <div>
                                                  {p.status === 'Presente' ? (
                                                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                                          <Clock size={10}/> Check-in {p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                                      </span>
                                                  ) : (
                                                      <button 
                                                          onClick={() => handleCheckIn(p.id)}
                                                          className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-olive-50 text-olive-700 border border-olive-200 hover:bg-olive-600 hover:text-white transition uppercase tracking-wide"
                                                      >
                                                          Realizar Check-in
                                                      </button>
                                                  )}
                                              </div>
                                          </div>
                                      ))
                                  )}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Gallery */}
                  {selectedEvent.galleryImages && selectedEvent.galleryImages.length > 0 && (
                      <div>
                          <h4 className="font-bold text-gray-900 mb-3">Galeria</h4>
                          <div className="grid grid-cols-3 gap-2">
                              {selectedEvent.galleryImages.map((img, idx) => (
                                  <img key={idx} src={img} className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition cursor-pointer" onClick={() => window.open(img, '_blank')} />
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Financials (Admin Only usually) */}
                  <div className="p-4 bg-gray-100 rounded-xl">
                      <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><CreditCard size={18}/> Financeiro Interno</h4>
                      <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Custo Total:</span>
                          <span className="font-bold">R$ {selectedEvent.budget?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Sinal Recebido:</span>
                          <span className="font-bold text-green-600">R$ {selectedEvent.depositAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      {selectedEvent.paymentTerms && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-400 block uppercase">Termos</span>
                              <p className="text-xs text-gray-600">{selectedEvent.paymentTerms}</p>
                          </div>
                      )}
                  </div>

               </div>
            </div>
         </div>
      )}
      {/* --- PARTICIPANT LIST MODAL --- */}
      {showParticipantListModal && (
          <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-blue-900 p-6 text-white flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-xl flex items-center gap-2"><Users size={24}/> Lista de Participantes</h3>
                              <p className="text-blue-300 text-sm">{showParticipantListModal.title}</p>
                          </div>
                          <button onClick={() => setShowParticipantListModal(null)}><X size={24}/></button>
                      </div>
                      <input 
                          type="text" 
                          placeholder="Buscar participante por nome, CPF ou email..." 
                          className="w-full p-2 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                          value={participantSearch}
                          onChange={(e) => setParticipantSearch(e.target.value)}
                      />
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                      {!events.find(e => e.id === showParticipantListModal.id)?.participants || events.find(e => e.id === showParticipantListModal.id)?.participants?.length === 0 ? (
                          <div className="text-center py-10 text-gray-400 italic">Nenhum participante cadastrado.</div>
                      ) : (
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                      <th className="py-3 px-4">Nome</th>
                                      <th className="py-3 px-4">Contato</th>
                                      <th className="py-3 px-4">Status</th>
                                      <th className="py-3 px-4">Chegada</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {(events.find(e => e.id === showParticipantListModal.id)?.participants || [])
                                      .filter(p => {
                                          if (!participantSearch) return true;
                                          const search = participantSearch.toLowerCase();
                                          return p.name.toLowerCase().includes(search) || 
                                                 p.email?.toLowerCase().includes(search) || 
                                                 p.phone?.includes(search) ||
                                                 p.cpf?.includes(search);
                                      })
                                      .map(p => (
                                      <tr key={p.id} className="bg-white border-b border-gray-100 hover:bg-blue-50 transition">
                                          <td className="py-3 px-4 font-bold text-gray-800">{p.name} <span className="block text-[10px] text-gray-400 font-normal">{p.cpf}</span></td>
                                          <td className="py-3 px-4 text-sm text-gray-600">
                                              <div>{p.email}</div>
                                              <div className="text-xs text-gray-400">{p.phone}</div>
                                          </td>
                                          <td className="py-3 px-4">
                                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === 'Presente' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                  {p.status}
                                              </span>
                                          </td>
                                          <td className="py-3 px-4 text-sm text-gray-600">
                                              {p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (
                                                  <button 
                                                      onClick={(e) => {
                                                          e.stopPropagation();
                                                          // Call check-in handler for the CURRENT event (found in events array)
                                                          const currentEvt = events.find(ev => ev.id === showParticipantListModal.id);
                                                          if (currentEvt) {
                                                              // We need to locally update the checked-in status similarly to handleCheckIn
                                                              // We can reuse the handleCheckIn logic if we set SelectedEvent temporarily, 
                                                              // OR refactor handleCheckIn to take an eventID.
                                                              // Let's manually trigger the update here safely:
                                                              if (onUpdateEvent) {
                                                                  const updatedParts = (currentEvt.participants || []).map(part => 
                                                                      part.id === p.id 
                                                                      ? { ...part, status: 'Presente' as const, checkedInAt: new Date().toISOString() } 
                                                                      : part
                                                                  );
                                                                  onUpdateEvent({ ...currentEvt, participants: updatedParts });
                                                              }
                                                          }
                                                      }}
                                                      className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-olive-50 text-olive-700 border border-olive-200 hover:bg-olive-600 hover:text-white transition uppercase tracking-wide flex items-center gap-1"
                                                  >
                                                      <CheckCircle size={12}/> Check-in
                                                  </button>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>

                  <div className="p-4 border-t bg-white flex justify-between items-center">
                       <button 
                           onClick={() => {
                               setSelectedEvent(events.find(e => e.id === showParticipantListModal.id) || null);
                               setShowAddParticipant(true); 
                               // Close this modal to open the detailed one? Or better:
                               // Just open the Add Form *inside* this modal or reuse/refactor existing one.
                               // For simplicity/speed: Open the detail modal to the specific section, 
                               // OR simply render the add form here. Let's redirect to Detail Modal 'Check-in' tab for now as it has full logic.
                               setShowParticipantListModal(null);
                           }} 
                           className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700"
                       >
                           <UserPlus size={18}/> Novo Convidado
                       </button>
                       <div>
                           <button onClick={() => window.print()} className="text-blue-600 font-bold text-sm uppercase mr-4 hover:underline">Imprimir Lista</button>
                           <button onClick={() => setShowParticipantListModal(null)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Fechar</button>
                       </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
