import React, { useState, useMemo } from 'react';
import { Reservation, Room, Venue } from '../types';
import { Calendar, Users, Home, ArrowRight, Check, X, Clock } from 'lucide-react';

interface PublicReservationsProps {
  rooms: Room[];
  reservations: Reservation[];
  venues: Venue[];
  onMakeReservation: (reservationData: Partial<Reservation>) => Promise<void>;
}

export const PublicReservations: React.FC<PublicReservationsProps> = ({ rooms, reservations, venues, onMakeReservation }) => {
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [step, setStep] = useState(1); // 1: Search, 2: Select, 3: Form, 4: Success

  const availableRooms = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return [];

    const checkInDate = new Date(dates.checkIn);
    const checkOutDate = new Date(dates.checkOut);

    return rooms.filter(room => {
       // Filter by capacity
       if (room.capacity < guests) return false;

       // Check overlap
       const isOccupied = reservations.some(res => {
           if (res.roomId !== room.id) return false;
           if (res.status === 'Cancelado' || res.status === 'Check-out') return false;

           const resStart = new Date(res.checkIn);
           const resEnd = new Date(res.checkOut);
           
           // Buffer: Add 1 hour to legacy resEnd for cleaning (matching Admin logic)
           // Simplified overlap logic:
           return (checkInDate < resEnd && checkOutDate > resStart);
       });

       return !isOccupied;
    });
  }, [rooms, reservations, dates, guests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    // Calculate total days
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const newReservation: Partial<Reservation> = {
        guestName: customerInfo.name,
        roomId: selectedRoom.id,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        guestsDetails: { adults: guests, children: 0 },
        guestContact: customerInfo.phone,
        guestEmail: customerInfo.email,
        status: 'Pendente',
        totalAmount: days * selectedRoom.price,
        // In a real app we would link to Client or create one. 
        // For public simple request, we might just store guestName or create a Lead first?
        // User asked to link to reservations table.
    };
    
    await onMakeReservation(newReservation);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-olive-900 mb-4">Reserve seu Momento</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">Garanta seu bangalô ou quarto com exclusividade e conforto. Verifique a disponibilidade em tempo real.</p>
        </div>

        {step === 4 ? (
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-2xl mx-auto animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Solicitação Enviada!</h2>
                <p className="text-gray-600 mb-8">Recebemos seu pedido de reserva. Nossa equipe entrará em contato via WhatsApp/Email em instantes para confirmar o pagamento e garantir sua estadia.</p>
                <button onClick={() => window.location.reload()} className="bg-olive-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-olive-700 transition">
                    Voltar ao Início
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Search Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="font-bold text-lg mb-4 text-stone-800 flex items-center gap-2"><Calendar size={20} className="text-olive-600"/> Datas e Hóspedes</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Check-in</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full border rounded-lg p-3 bg-stone-50"
                                    value={dates.checkIn}
                                    onChange={e => setDates({...dates, checkIn: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Check-out</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full border rounded-lg p-3 bg-stone-50"
                                    value={dates.checkOut}
                                    onChange={e => setDates({...dates, checkOut: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Hóspedes</label>
                                <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-lg border">
                                    <Users size={20} className="text-stone-400"/>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="10"
                                        className="bg-transparent w-full outline-none font-medium"
                                        value={guests}
                                        onChange={e => setGuests(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {selectedRoom && (
                        <div className="bg-olive-900 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-2">Resumo</h3>
                            <div className="text-olive-200 text-sm space-y-2 mb-4">
                                <p>Quarto: <strong className="text-white">{selectedRoom.name}</strong></p>
                                <p>Valor Diária: <strong className="text-white">R$ {selectedRoom.price.toFixed(2)}</strong></p>
                            </div>
                            <div className="pt-4 border-t border-olive-700">
                                <p className="text-xs text-olive-300">Total Estimado</p>
                                <p className="text-3xl font-bold">R$ {(selectedRoom.price * (Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime())/(1000*60*60*24)) || 1)).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results/Form Area */}
                <div className="lg:col-span-8">
                     {!dates.checkIn || !dates.checkOut ? (
                         <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200 h-full flex flex-col items-center justify-center text-stone-400">
                             <Calendar size={48} className="mb-4 opacity-50" />
                             <p className="text-xl font-medium">Selecione as datas para ver a disponibilidade.</p>
                         </div>
                     ) : step === 1 || step === 2 ? (
                         <div className="space-y-6">
                             <h2 className="text-2xl font-bold text-stone-800 mb-4">Acomodações Disponíveis</h2>
                             {availableRooms.length === 0 ? (
                                 <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center">
                                     <X size={40} className="mx-auto mb-2" />
                                     <p className="font-bold">Indisponível para estas datas.</p>
                                     <p className="text-sm">Tente datas diferentes ou entre em contato conosco.</p>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {availableRooms.map(room => (
                                         <div key={room.id} className={`bg-white rounded-2xl overflow-hidden border transition cursor-pointer hover:shadow-lg ${selectedRoom?.id === room.id ? 'ring-2 ring-olive-600 border-olive-600 shadow-lg' : 'border-stone-200'}`} onClick={() => { setSelectedRoom(room); setStep(2); }}>
                                             <div className="h-48 bg-stone-200">
                                                 <img src={room.images?.[0] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800'} alt={room.name} className="w-full h-full object-cover" />
                                             </div>
                                             <div className="p-6">
                                                 <div className="flex justify-between items-start mb-2">
                                                     <span className="text-xs font-bold text-olive-600 uppercase tracking-wider bg-olive-50 px-2 py-1 rounded">{room.type}</span>
                                                     <span className="flex items-center gap-1 text-xs text-stone-500"><Users size={12}/> {room.capacity}</span>
                                                 </div>
                                                 <h3 className="font-bold text-xl text-stone-800 mb-2">{room.name}</h3>
                                                 <p className="text-sm text-stone-500 line-clamp-2 mb-4">{room.description || "Conforto e elegância para sua estadia."}</p>
                                                 
                                                 {/* Included Items */}
                                                 <div className="mb-4 flex flex-wrap gap-2">
                                                     {(room.features && room.features.length > 0 ? room.features : ['Café da Manhã', 'Wi-Fi', 'Estacionamento']).slice(0, 4).map((feat, i) => (
                                                         <span key={i} className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-full flex items-center gap-1">
                                                             <Check size={10} className="text-olive-600"/> {feat}
                                                         </span>
                                                     ))}
                                                 </div>

                                                 <div className="flex justify-between items-center">
                                                     <span className="text-lg font-bold text-stone-900">R$ {room.price.toFixed(2)} <span className="text-xs font-normal text-stone-400">/dia</span></span>
                                                     <button className={`w-8 h-8 rounded-full flex items-center justify-center transition ${selectedRoom?.id === room.id ? 'bg-olive-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                                         <Check size={16} />
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                             
                             {selectedRoom && (
                                 <div className="sticky bottom-4 flex justify-end">
                                     <button onClick={() => setStep(3)} className="bg-olive-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-olive-700 transition flex items-center gap-2 animate-bounce-short">
                                         Continuar para Dados <ArrowRight size={20} />
                                     </button>
                                 </div>
                             )}
                         </div>
                     ) : (
                         <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 animate-fade-in-up">
                             <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                                 <button onClick={() => setStep(2)} className="text-stone-400 hover:text-stone-600">Voltar</button>
                                 <h2 className="text-2xl font-bold text-stone-800">Seus Dados</h2>
                             </div>
                             
                             <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                                 <div>
                                     <label className="block text-sm font-bold text-stone-700 mb-2">Nome Completo</label>
                                     <input required className="w-full border rounded-xl p-3 focus:ring-2 ring-olive-200 outline-none" placeholder="Seu nome" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                                 </div>
                                 <div className="grid grid-cols-2 gap-6">
                                     <div>
                                         <label className="block text-sm font-bold text-stone-700 mb-2">Email</label>
                                         <input required type="email" className="w-full border rounded-xl p-3 focus:ring-2 ring-olive-200 outline-none" placeholder="seu@email.com" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className="block text-sm font-bold text-stone-700 mb-2">Telefone / WhatsApp</label>
                                         <input required className="w-full border rounded-xl p-3 focus:ring-2 ring-olive-200 outline-none" placeholder="(00) 00000-0000" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                                     </div>
                                 </div>
                                 
                                 <div className="pt-6">
                                     <button type="submit" className="w-full bg-olive-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-olive-800 transition shadow-lg">
                                         Confirmar Solicitação de Reserva
                                     </button>
                                     <p className="text-center text-xs text-stone-400 mt-4">Ao confirmar, você concorda com nossos termos de uso.</p>
                                 </div>
                             </form>
                         </div>
                     )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
