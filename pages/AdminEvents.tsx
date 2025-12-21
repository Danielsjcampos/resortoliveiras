import React, { useState, useMemo } from 'react';
import { EventRequest, Venue, EventGuest, EventParticipant, SystemSettings, Transaction } from '../types';
import { Calendar, Users, DollarSign, CheckCircle, Clock, FileText, Send, MapPin, ClipboardList, UserPlus, CheckSquare, Square, X, Plus, Trash2, Globe, Layout, Image as ImageIcon, Coffee, Utensils, CreditCard, Ticket, ChevronRight, ChevronLeft, Edit2, Save, Printer, AlertTriangle, ExternalLink } from 'lucide-react';

interface AdminEventsProps {
  events: EventRequest[];
  venues: Venue[];
  settings: SystemSettings;
  onUpdateEventStatus: (id: string, status: EventRequest['status']) => void;
  onUpdateEventGuests?: (eventId: string, guests: EventGuest[]) => void;
  onAssignVenue?: (eventId: string, venueId: string) => void;
  onAddEvent?: (event: Partial<EventRequest>) => void;
  onDeleteEvent?: (id: string) => void;
  onUpdateEvent?: (event: EventRequest) => void;
  onAddTransaction?: (transaction: Transaction) => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({ 
  events, venues, settings, onUpdateEventStatus, onUpdateEventGuests, onAssignVenue, onAddEvent, onDeleteEvent, onUpdateEvent, onAddTransaction 
}) => {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'CALENDAR'>('KANBAN');
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [detailTab, setDetailTab] = useState<'DETAILS' | 'PROPOSAL' | 'GUESTS' | 'FINANCIAL'>('DETAILS');
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | EventRequest['status']>('ALL');
  
  // --- FORM STATE ---
  const [formStep, setFormStep] = useState(1);
  const [eventFormData, setEventFormData] = useState<Partial<EventRequest>>({
    title: '', type: 'Show', status: 'Solicitado', showOnSite: false, 
    guests: 0, budget: 0, 
    startDate: '', endDate: '',
    cateringOptions: [],
    galleryImages: [],
    paymentMethod: 'Pix',
    proposalStatus: 'Rascunho',
    extraGuestCost: 0
  });

  // --- CHECK-IN STATE ---
  const [checkInSearch, setCheckInSearch] = useState('');
  const [newParticipant, setNewParticipant] = useState({ name: '', cpf: '', phone: '', email: '' });
  const [isSignalingPayment, setIsSignalingPayment] = useState(false); // Modal state for deposit payment

  const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.status === filter);

  // --- HANDLERS ---

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseDate = eventFormData.startDate ? eventFormData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
    const payload = {
        ...eventFormData,
        date: baseDate
    } as EventRequest;

    if (editingEventId && onUpdateEvent) {
         onUpdateEvent({ ...payload, id: editingEventId });
    } else if (onAddEvent) {
        onAddEvent(payload);
    }

   setIsAddingEvent(false);
   setEditingEventId(null);
   setEventFormData({ title: '', type: 'Show', status: 'Solicitado', showOnSite: false, guests: 0, budget: 0, cateringOptions: [], galleryImages: [], extraGuestCost: 0 });
   setFormStep(1);
  };

  const handleEditClick = (event: EventRequest) => {
      setEditingEventId(event.id);
      setEventFormData({
          ...event,
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

  // --- CHECK-IN LOGIC ---
  const handleCheckIn = (participantId: string, event: EventRequest) => {
      if (!onUpdateEvent) return;
      const updatedParticipants = event.participants?.map(p => 
          p.id === participantId ? { ...p, status: 'Presente' as const, checkedInAt: new Date().toISOString(), checkedIn: true } : p
      );
      onUpdateEvent({ ...event, participants: updatedParticipants });
      // Update local selected event if needed
      if(selectedEvent?.id === event.id) {
          setSelectedEvent({ ...event, participants: updatedParticipants });
      }
  };

  const handleAddExtraParticipant = (event: EventRequest) => {
      if (!onUpdateEvent) return;
      const newP: EventParticipant = {
          id: `ep-${Date.now()}`,
          eventId: event.id,
          name: newParticipant.name,
          cpf: newParticipant.cpf,
          phone: newParticipant.phone,
          email: newParticipant.email,
          status: 'Presente',
          ticketPurchased: true,
          purchaseDate: new Date().toISOString(),
          checkedInAt: new Date().toISOString(),
          isExtra: true, // FLAG IMPORTANTE
          checkedIn: true
      };
      
      const updatedParticipants = [...(event.participants || []), newP];
      const updatedEvent = { ...event, participants: updatedParticipants };
      onUpdateEvent(updatedEvent);
      if(selectedEvent?.id === event.id) setSelectedEvent(updatedEvent);
      setNewParticipant({ name: '', cpf: '', phone: '', email: '' });
  };

  // --- PROPOSAL Workflow ---
  const handleApproveProposal = async () => {
      if (!selectedEvent || !onUpdateEvent) return;
      
      // 1. Update Status
      const updatedEvent = { 
          ...selectedEvent, 
          status: 'Confirmado' as const, 
          proposalStatus: 'Aprovada' as const 
      };
      
      onUpdateEvent(updatedEvent);
      setSelectedEvent(updatedEvent);
      
      // 2. Prompt for Deposit Payment
      setIsSignalingPayment(true);
  };

  const handleConfirmDeposit = () => {
      if (!selectedEvent || !onAddTransaction || !selectedEvent.depositAmount) return;
      
      const transaction: Transaction = {
          id: `tr-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Sinal: ${selectedEvent.title}`,
          amount: selectedEvent.depositAmount,
          type: 'INCOME',
          category: 'Eventos',
          status: 'PAID',
          paymentMethod: (selectedEvent as any).paymentMethod || 'Pix'
      };

      onAddTransaction(transaction);
      setIsSignalingPayment(false);
      alert('Proposta Aprovada e TransaÃ§Ã£o de Sinal registrada no Financeiro!');
      setDetailTab('FINANCIAL');
  };

  const calculateFinalBalance = (event: EventRequest) => {
      const confirmedGuests = event.guests || 0;
      const presentGuests = event.participants?.filter(p => p.checkedIn || p.status === 'Presente').length || 0;
      const extraGuests = Math.max(0, presentGuests - confirmedGuests);
      const extraCost = (event.extraGuestCost || 0) * extraGuests;
      
      const totalContract = event.budget || 0;
      const totalPaid = event.depositAmount || 0; // Assuming only deposit is paid for now
      
      const remainingBalance = totalContract - totalPaid + extraCost;
      
      return { presentGuests, extraGuests, extraCost, remainingBalance };
  };

  const handleCloseEvent = (event: EventRequest) => {
      const { extraCost, remainingBalance } = calculateFinalBalance(event);
      // Create Transaction for Remaining Balance + Extras
      if (onAddTransaction && remainingBalance > 0) {
           const transaction: Transaction = {
              id: `tr-final-${Date.now()}`,
              date: new Date().toISOString(),
              description: `Fechamento: ${event.title} (Extras: R$ ${extraCost})`,
              amount: remainingBalance,
              type: 'INCOME',
              category: 'Eventos',
              status: 'PENDING', // Pending payment
          };
          onAddTransaction(transaction);
          alert(`Evento Fechado! CobranÃ§a de R$ ${remainingBalance.toFixed(2)} gerada no Financeiro.`);
      }
      
      if (onUpdateEvent) {
          onUpdateEvent({ ...event, status: 'ConcluÃ­do' });
          if(selectedEvent?.id === event.id) setSelectedEvent({ ...event, status: 'ConcluÃ­do' });
      }
  };


  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* --- DETAIL VIEW (IN-FLOW) --- */}
      {selectedEvent ? (
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
             {/* Header */}
             <div className="border-b px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white z-10">
                 <div className="flex items-center gap-3 w-full md:w-auto">
                     <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"><ChevronLeft size={24}/></button>
                     <div className="min-w-0">
                         <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 truncate">
                             {selectedEvent.title} 
                             <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase hidden md:inline-block ${
                                selectedEvent.status === 'Confirmado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'
                             }`}>{selectedEvent.status}</span>
                         </h2>
                         <p className="text-xs text-gray-500 truncate">{new Date(selectedEvent.date).toLocaleDateString()} â€¢ {selectedEvent.organizerName}</p>
                     </div>
                 </div>
                 
                 {/* Mobile Tabs - Scrollable */}
                 <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                     {['DETAILS', 'PROPOSAL', 'GUESTS', 'FINANCIAL'].map(tab => (
                         <button 
                             key={tab} 
                             onClick={() => setDetailTab(tab as any)}
                             className={`px-3 py-2 whitespace-nowrap rounded-lg text-xs md:text-sm font-bold transition flex-shrink-0 ${detailTab === tab ? 'bg-olive-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100 bg-gray-50'}`}
                         >
                             {tab === 'DETAILS' && 'Detalhes'}
                             {tab === 'PROPOSAL' && 'Proposta'}
                             {tab === 'GUESTS' && 'Convidados'}
                             {tab === 'FINANCIAL' && 'Financeiro'}
                         </button>
                     ))}
                 </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gray-50/50 relative">
                 <div className="max-w-5xl mx-auto min-h-full">

                     {/* TAB: DETAILS */}
                     {detailTab === 'DETAILS' && (
                         <div className="space-y-6">
                             <div className="h-48 md:h-64 rounded-xl overflow-hidden relative group">
                                 <img src={selectedEvent.coverImage || 'https://via.placeholder.com/1200x400'} className="w-full h-full object-cover" />
                                 <button onClick={() => handleEditClick(selectedEvent)} className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-white text-sm transition opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                     <Edit2 size={16}/> <span className="hidden md:inline">Editar Dados</span>
                                 </button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div>
                                     <h3 className="font-bold text-gray-800 mb-4 text-lg">Sobre o Evento</h3>
                                     <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{selectedEvent.description || 'Sem descriÃ§Ã£o.'}</p>
                                     <div className="mt-6 flex flex-wrap gap-2">
                                          <span className="text-xs font-bold text-gray-500 uppercase w-full">Local</span>
                                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border text-sm font-medium text-gray-700">
                                              <MapPin size={16} className="text-olive-600"/>
                                              {venues.find(v => v.id === selectedEvent.venueId)?.name || 'Local nÃ£o definido'}
                                          </div>
                                     </div>
                                 </div>
                                 <div className="space-y-4">
                                     <h3 className="font-bold text-gray-800 text-lg">Resumo</h3>
                                     <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                         <span className="text-gray-500 font-bold text-sm">OrÃ§amento</span>
                                         <span className="text-lg md:text-xl font-black text-gray-800">R$ {selectedEvent.budget?.toFixed(2)}</span>
                                     </div>
                                     <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                         <span className="text-gray-500 font-bold text-sm">Convidados</span>
                                         <span className="text-lg md:text-xl font-black text-gray-800">{selectedEvent.guests}</span>
                                     </div>
                                     
                                     <h3 className="font-bold text-gray-800 text-lg mt-4">ServiÃ§os</h3>
                                     <div className="flex flex-wrap gap-2">
                                         {selectedEvent.cateringOptions?.map(cat => (
                                             <span key={cat} className="px-3 py-1 bg-olive-50 text-olive-700 rounded-full text-xs font-bold border border-olive-100">{cat}</span>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* TAB: PROPOSAL */}
                     {detailTab === 'PROPOSAL' && (
                         <div className="animate-fade-in flex flex-col h-full">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 no-print">
                                 <h3 className="font-bold text-xl text-gray-800 hidden md:block">Proposta Comercial</h3>
                                 <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                     <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-black font-bold text-sm">
                                         <Printer size={16}/> Imprimir
                                     </button>
                                     {selectedEvent.status === 'Solicitado' || selectedEvent.status === 'Proposta Enviada' || selectedEvent.status === 'Rascunho' ? (
                                         <button onClick={handleApproveProposal} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold text-sm whitespace-nowrap">
                                             <CheckCircle size={16}/> Aprovar
                                         </button>
                                     ) : (
                                         <span className="flex-1 md:flex-none px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm border border-green-200 text-center">
                                             Aprovada
                                         </span>
                                     )}
                                 </div>
                             </div>

                             {/* PROPOSAL DOCUMENT */}
                             <div className="border md:p-12 p-6 rounded-xl shadow-lg bg-white print:shadow-none print:border-none print:p-0 w-full mx-auto flex flex-col justify-between min-h-[600px] text-xs md:text-sm">
                                 <div>
                                     {/* Header */}
                                     <div className="flex flex-col md:flex-row justify-between items-start border-b pb-8 mb-8 gap-6">
                                         <div>
                                             <h1 className="text-2xl md:text-3xl font-serif text-olive-900 mb-2">{settings.resortName || 'Resort das Oliveiras'}</h1>
                                             <p className="text-gray-500">{settings.resortAddress}</p>
                                             <p className="text-gray-500">{settings.contactEmail} â€¢ {settings.contactPhone}</p>
                                         </div>
                                         <div className="text-left md:text-right">
                                             <h2 className="text-3xl md:text-4xl font-light text-gray-300">PROPOSTA</h2>
                                             <p className="font-bold text-gray-600 mt-2">#{selectedEvent.id.slice(-6).toUpperCase()}</p>
                                             <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                     
                                     {/* Client Info */}
                                     <div className="mb-8">
                                         <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cliente</h3>
                                         <div className="text-lg font-bold text-gray-800">{selectedEvent.organizerName}</div>
                                         <div className="text-gray-600">Evento: {selectedEvent.title}</div>
                                         <div className="text-gray-600">Data: {new Date(selectedEvent.date).toLocaleDateString()}</div>
                                     </div>

                                     {/* Items Table */}
                                     <div className="overflow-x-auto">
                                         <table className="w-full text-left mb-8 min-w-[500px]">
                                             <thead>
                                                 <tr className="border-b-2 border-gray-100">
                                                     <th className="py-2 text-xs font-bold text-gray-500 uppercase">DescriÃ§Ã£o</th>
                                                     <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase">Valor</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="text-gray-700">
                                                 <tr className="border-b border-gray-50">
                                                     <td className="py-4">
                                                         <div className="font-bold text-base">LocaÃ§Ã£o & ServiÃ§os</div>
                                                         <div className="text-sm text-gray-500 mt-1">
                                                             <span className="font-bold">Local:</span> {venues.find(v => v.id === selectedEvent.venueId)?.name} <br/>
                                                             <div className="mt-1 flex flex-wrap gap-1">
                                                                 {selectedEvent.cateringOptions?.map(c => <span className="bg-gray-100 px-2 rounded text-xs" key={c}>{c}</span>)}
                                                             </div>
                                                         </div>
                                                     </td>
                                                     <td className="py-4 text-right align-top font-bold text-base">R$ {selectedEvent.budget?.toFixed(2)}</td>
                                                 </tr>
                                             </tbody>
                                         </table>
                                     </div>
                                     
                                     {/* Terms */}
                                     <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-8">
                                         <h4 className="font-bold text-gray-700 mb-2 text-sm">Termos e CondiÃ§Ãµes</h4>
                                         <p className="text-xs text-gray-600 leading-relaxed">
                                             {selectedEvent.paymentTerms || 'Pagamento de 50% de sinal para reserva da data. O restante deve ser quitado atÃ© 7 dias antes do evento. Cancelamentos sujeitos a retenÃ§Ã£o.'}
                                         </p>
                                     </div>
                                 </div>
                                 
                                 {/* Footer */}
                                 <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t">
                                     <div className="text-center">
                                         <div className="border-b border-gray-300 w-full mb-2"></div>
                                         <p className="text-[10px] font-bold text-gray-500 uppercase">{settings.resortName}</p>
                                     </div>
                                     <div className="text-center">
                                         <div className="border-b border-gray-300 w-full mb-2"></div>
                                         <p className="text-[10px] font-bold text-gray-500 uppercase">Aceite do Cliente</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* TAB: GUESTS */}
                     {detailTab === 'GUESTS' && (
                        <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
                            <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
                                <div>
                                    <h3 className="font-bold text-xl">Controle de Acesso</h3>
                                    <p className="text-blue-100 text-sm opacity-90">Gerencie a lista e marque presenÃ§as.</p>
                                </div>
                                <div className="text-right bg-white/10 p-2 rounded-lg backdrop-blur-sm min-w-[120px]">
                                    <div className="text-3xl font-black">
                                        {selectedEvent.participants?.filter(p => p.checkedIn).length || 0} <span className="text-base font-normal opacity-70">/ {selectedEvent.participants?.length || 0}</span>
                                    </div>
                                    <div className="text-[10px] uppercase font-bold opacity-80">Presentes / Lista</div>
                                </div>
                            </div>
                            
                            <div className="sticky top-0 bg-gray-50/50 backdrop-blur pt-2 pb-4 z-10">
                                <div className="bg-white border p-3 rounded-xl flex items-center shadow-sm">
                                    <input 
                                        className="w-full text-sm outline-none bg-transparent"
                                        placeholder="Buscar convidado por nome..."
                                        value={checkInSearch}
                                        onChange={e => setCheckInSearch(e.target.value)}
                                    />
                                    <div className="text-gray-400"><Users size={18}/></div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8">
                                {/* Guest List */}
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
                                    <div className="bg-gray-100 p-3 border-b text-xs font-bold text-gray-500 uppercase">Lista Oficial</div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {(selectedEvent.participants || [])
                                            .filter(p => !checkInSearch || p.name.toLowerCase().includes(checkInSearch.toLowerCase()))
                                            .map(p => (
                                            <div key={p.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50 transition">
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800">{p.name} {p.isExtra && <span className="bg-orange-100 text-orange-700 text-[10px] px-1 rounded ml-1">EXTRA</span>}</div>
                                                    <div className="text-xs text-gray-400">{p.cpf || 'Sem CPF'}</div>
                                                </div>
                                                {p.checkedIn ? (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                                        <CheckCircle size={10}/> {new Date(p.checkedInAt!).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    </span>
                                                ) : (
                                                    <button onClick={() => handleCheckIn(p.id, selectedEvent)} className="bg-olive-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-olive-700 shadow-sm transition">
                                                        Check-in
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {(!selectedEvent.participants || selectedEvent.participants.length === 0) && <p className="text-center text-gray-400 p-8 text-sm">Nenhum convidado na lista.</p>}
                                    </div>
                                </div>

                                {/* Add Extra / Quick Add */}
                                <div className="bg-white border rounded-xl p-6 h-fit shadow-lg shadow-gray-100 transform md:translate-y-0 translate-y-2">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg"><UserPlus size={20} className="text-orange-500"/> Adicionar Extra</h4>
                                    <div className="space-y-3">
                                        <input className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 transition" placeholder="Nome Completo *" value={newParticipant.name} onChange={e => setNewParticipant({...newParticipant, name: e.target.value})} />
                                        <input className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 transition" placeholder="CPF" value={newParticipant.cpf} onChange={e => setNewParticipant({...newParticipant, cpf: e.target.value})} />
                                        <input className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 transition" placeholder="Email" value={newParticipant.email} onChange={e => setNewParticipant({...newParticipant, email: e.target.value})} />
                                        <button 
                                            onClick={() => handleAddExtraParticipant(selectedEvent)}
                                            disabled={!newParticipant.name}
                                            className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50 shadow-lg shadow-orange-200 mt-2"
                                        >
                                            Confirmar Entrada
                                        </button>
                                        <p className="text-xs text-gray-400 mt-3 text-center leading-tight">
                                            Adicionar aqui conta como <strong>excedente</strong> se a lista oficial jÃ¡ estiver cheia.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                     )}

                     {/* TAB: FINANCIAL */}
                     {detailTab === 'FINANCIAL' && (
                         <div className="space-y-8 animate-fade-in pb-12">
                             {(() => {
                                 const stats = calculateFinalBalance(selectedEvent);
                                 return (
                                     <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OrÃ§amento Total</span>
                                                <div className="text-2xl font-black text-gray-800 mt-1">R$ {selectedEvent.budget?.toFixed(2)}</div>
                                            </div>
                                            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Sinal Pago</span>
                                                <div className="text-2xl font-black text-green-700 mt-1">R$ {selectedEvent.depositAmount?.toFixed(2)}</div>
                                            </div>
                                            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Extras ({stats.extraGuests})</span>
                                                <div className="text-2xl font-black text-orange-700 mt-1">R$ {stats.extraCost.toFixed(2)}</div>
                                            </div>
                                            <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-200">
                                                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Saldo Final</span>
                                                <div className="text-2xl font-black mt-1">R$ {stats.remainingBalance.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="border bg-white rounded-xl overflow-hidden shadow-sm">
                                            <div className="p-4 border-b bg-gray-50 flex items-center gap-2 font-bold text-gray-700">
                                                <FileText size={18}/> Extrato de Fechamento
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50/50 text-left text-xs font-bold text-gray-500 uppercase">
                                                            <th className="p-4">DescriÃ§Ã£o</th>
                                                            <th className="p-4 text-right">Qtd</th>
                                                            <th className="p-4 text-right">UnitÃ¡rio</th>
                                                            <th className="p-4 text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        <tr>
                                                            <td className="p-4 font-medium text-gray-700">Contrato Base (OrÃ§amento)</td>
                                                            <td className="p-4 text-right text-gray-500">{selectedEvent.guests}</td>
                                                            <td className="p-4 text-right text-gray-500">-</td>
                                                            <td className="p-4 text-right font-bold text-gray-800">Incluso</td>
                                                        </tr>
                                                        {stats.extraGuests > 0 && (
                                                            <tr className="bg-orange-50/30">
                                                                <td className="p-4 font-bold text-orange-700 flex items-center gap-2">
                                                                    <Users size={14}/> Convidados Excedentes
                                                                </td>
                                                                <td className="p-4 text-right font-bold text-orange-700">{stats.extraGuests}</td>
                                                                <td className="p-4 text-right text-orange-700">R$ {(selectedEvent.extraGuestCost || 0).toFixed(2)}</td>
                                                                <td className="p-4 text-right font-black text-orange-700">R$ {stats.extraCost.toFixed(2)}</td>
                                                            </tr>
                                                        )}
                                                        <tr className="bg-green-50/30">
                                                            <td className="p-4 font-medium text-green-700">Abatimento (Sinal)</td>
                                                            <td className="p-4 text-right">-</td>
                                                            <td className="p-4 text-right">-</td>
                                                            <td className="p-4 text-right font-bold text-green-700">- R$ {selectedEvent.depositAmount?.toFixed(2)}</td>
                                                        </tr>
                                                    </tbody>
                                                    <tfoot className="bg-gray-50">
                                                        <tr>
                                                            <td colSpan={3} className="p-4 text-right font-bold text-gray-600 uppercase text-xs">Total a Pagar</td>
                                                            <td className="p-4 text-right font-black text-xl text-blue-900">R$ {stats.remainingBalance.toFixed(2)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
                                            {selectedEvent.status !== 'ConcluÃ­do' ? (
                                                <button onClick={() => handleCloseEvent(selectedEvent)} className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center justify-center gap-2">
                                                    <CheckCircle size={20} className="text-green-400"/> Encerrar Evento & Cobrar
                                                </button>
                                            ) : (
                                                <div className="w-full md:w-auto bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-gray-200">
                                                    <CheckCircle size={18}/> Fechamento ConcluÃ­do
                                                </div>
                                            )}
                                        </div>
                                     </>
                                 );
                             })()}
                         </div>
                     )}
                 </div>
             </div>
          </div>
      ) : (
      // --- LIST VIEW (DEFAULT) ---
      <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">GestÃ£o de Eventos 2.0</h2>
          <p className="text-gray-500 text-sm">CRM de Eventos: Propostas, Convidados e Financeiro.</p>
        </div>
        
        <div className="flex gap-2">
             <button onClick={() => setIsAddingEvent(true)} className="flex items-center gap-2 bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 shadow-sm font-bold transition">
                <Plus size={18} /> Novo Evento
             </button>
             <button onClick={() => setViewMode(viewMode === 'KANBAN' ? 'CALENDAR' : 'KANBAN')} className="flex items-center gap-2 bg-white text-gray-700 border px-4 py-2 rounded-lg hover:bg-gray-50 font-bold transition">
                {viewMode === 'KANBAN' ? <Calendar size={18} /> : <Layout size={18} />}
                {viewMode === 'KANBAN' ? 'CalendÃ¡rio' : 'Kanban'}
             </button>
        </div>
      </div>

      {viewMode === 'KANBAN' ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredEvents.map((event) => (
                <div key={event.id} onClick={() => { setSelectedEvent(event); setDetailTab('DETAILS'); }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-[320px]">
                     <div className="h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl relative">
                        {event.coverImage ? (
                             <img src={event.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        ) : (
                             <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                 <ImageIcon size={32} />
                             </div>
                        )}
                        <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {event.type.slice(0,3)}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                             <div className={`text-[10px] font-bold text-white uppercase tracking-wider inline-block px-2 py-0.5 rounded border border-white/30 ${
                                 event.status === 'Confirmado' ? 'bg-green-500/80' : 
                                 event.status === 'ConcluÃ­do' ? 'bg-gray-500/80' : 'bg-yellow-500/80'
                             }`}>
                                 {event.status}
                             </div>
                        </div>
                     </div>
                     
                     <div className="flex-1 flex flex-col justify-between">
                         <div>
                             <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 line-clamp-2 group-hover:text-olive-700 transition">{event.title}</h3>
                             <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                                <Calendar size={12}/> {new Date(event.date).toLocaleDateString()}
                             </p>
                             <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
                         </div>
                         
                         <div className="border-t pt-3 mt-3 flex items-center justify-between text-xs text-gray-400">
                              <span>{event.guests} Convidados</span>
                              <span className="flex items-center gap-1"><DollarSign size={12}/> {event.budget?.toFixed(0)}</span>
                         </div>
                     </div>
                </div>
            ))}
            {filteredEvents.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Calendar size={32}/></div>
                    <p>Nenhum evento encontrado.</p>
                </div>
            )}
         </div>
      ) : (
          <div className="bg-white rounded-2xl border shadow-sm p-8 min-h-[500px]">
               <div className="flex items-center justify-center h-full flex-col text-gray-400">
                   <Calendar size={48} className="mb-4 text-gray-300" />
                   <p className="font-bold">Visualização de Calendário</p>
                   <p className="text-sm">Em breve...</p>
               </div>
          </div>
      )}
      </>
      )}
      {/* --- CONFIRMATION MODAL FOR DEPOSIT --- */}
      {isSignalingPayment && selectedEvent && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Pagamento do Sinal</h3>
                  <p className="text-gray-600 mb-6">Deseja confirmar o recebimento do sinal para ativar este evento e gerar o lançamento financeiro?</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center">
                      <span className="font-bold text-gray-500">Valor Sinal:</span>
                      <span className="font-black text-xl text-green-600">R$ {selectedEvent.depositAmount?.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setIsSignalingPayment(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
                      <button onClick={handleConfirmDeposit} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg">Confirmar & Gerar</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
