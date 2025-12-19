
import React, { useState } from 'react';
import { Room, RoomStatus, Reservation } from '../types';
import { BedDouble, Home, Check, X, PaintBucket, PenTool, CheckCircle, AlertTriangle, LogIn, Edit, Calendar, Image as ImageIcon, Save, Trash, Search, Users, Filter } from 'lucide-react';

interface AdminAccommodationsProps {
  rooms: Room[];
  reservations?: Reservation[]; // Added optional for calendar view
  onUpdateStatus: (id: string, status: RoomStatus) => void;
  onUpdateRoom?: (room: Room) => void; // Handler for editing room details
}

export const AdminAccommodations: React.FC<AdminAccommodationsProps> = ({ rooms, reservations = [], onUpdateStatus, onUpdateRoom }) => {
  const [filter, setFilter] = useState<'ALL' | RoomStatus>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Room>>({});
  
  // Search State
  const [searchGuests, setSearchGuests] = useState<number>(0);
  const [searchDate, setSearchDate] = useState<string>('');

  const filteredRooms = rooms.filter(r => {
      const matchStatus = filter === 'ALL' || r.status === filter;
      const matchGuests = searchGuests > 0 ? r.capacity >= searchGuests : true;
      
      let matchDate = true;
      if (searchDate) {
          // Check for conflicts on the specific search date
          // A conflict exists if a reservation starts before or on the search date AND ends after the search date
          const target = new Date(searchDate).getTime();
          const hasConflict = reservations.some(res => {
              if (res.roomId !== r.id) return false;
              if (res.status === 'Cancelado' || res.status === 'Check-out') return false; 
              const start = new Date(res.checkIn).getTime();
              const end = new Date(res.checkOut).getTime();
              return target >= start && target < end;
          });
          matchDate = !hasConflict;
      }

      return matchStatus && matchGuests && matchDate;
  });

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-green-100 text-green-800 border-green-200';
      case RoomStatus.OCCUPIED: return 'bg-red-100 text-red-800 border-red-200';
      case RoomStatus.CLEANING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case RoomStatus.MAINTENANCE: return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return <CheckCircle size={16} />;
      case RoomStatus.OCCUPIED: return <LogIn size={16} />;
      case RoomStatus.CLEANING: return <PaintBucket size={16} />;
      case RoomStatus.MAINTENANCE: return <PenTool size={16} />;
    }
  };

  const handleEditClick = (room: Room) => {
      setSelectedRoom(room);
      setEditForm(room);
      setIsEditing(true);
  };

  const handleSaveEdit = () => {
      if (onUpdateRoom && selectedRoom) {
          onUpdateRoom({ ...selectedRoom, ...editForm } as Room);
          setIsEditing(false);
          setSelectedRoom(null);
      }
  };

  const handleViewClick = (room: Room) => {
      setSelectedRoom(room);
      setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mapa de Acomodações</h2>
          <p className="text-gray-500 text-sm">Gerencie o status operacional e disponibilidade.</p>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 items-center">
             <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                <Calendar size={16} className="text-gray-400"/>
                <input 
                    type="date" 
                    className="text-sm outline-none bg-transparent"
                    value={searchDate}
                    onChange={e => setSearchDate(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                <Users size={16} className="text-gray-400"/>
                <input 
                    type="number" 
                    min="1" 
                    placeholder="Hóspedes" 
                    className="w-20 text-sm outline-none bg-transparent"
                    value={searchGuests || ''}
                    onChange={e => setSearchGuests(parseInt(e.target.value))}
                />
             </div>
             <div className="flex gap-2 pl-2">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 text-xs rounded-md font-bold transition ${filter === 'ALL' ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-500'}`}>Todos</button>
                <button onClick={() => setFilter(RoomStatus.AVAILABLE)} className={`px-3 py-1.5 text-xs rounded-md font-bold transition ${filter === RoomStatus.AVAILABLE ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-500'}`}>Livres</button>
                <button onClick={() => setFilter(RoomStatus.OCCUPIED)} className={`px-3 py-1.5 text-xs rounded-md font-bold transition ${filter === RoomStatus.OCCUPIED ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-500'}`}>Ocupados</button>
                <button onClick={() => setFilter(RoomStatus.CLEANING)} className={`px-3 py-1.5 text-xs rounded-md font-bold transition ${filter === RoomStatus.CLEANING ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-500'}`}>Limpeza</button>
                <button onClick={() => setFilter(RoomStatus.MAINTENANCE)} className={`px-3 py-1.5 text-xs rounded-md font-bold transition ${filter === RoomStatus.MAINTENANCE ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-500'}`}>Manutenção</button>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isAttentionNeeded = room.status === RoomStatus.CLEANING || room.status === RoomStatus.MAINTENANCE;
          return (
          <div 
             key={room.id} 
             className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full ${isAttentionNeeded ? 'ring-2 ring-offset-2 ring-yellow-400 animate-pulse' : ''}`}
          >
            <div className={`h-2 w-full ${room.status === RoomStatus.AVAILABLE ? 'bg-green-500' : room.status === RoomStatus.OCCUPIED ? 'bg-red-500' : room.status === RoomStatus.CLEANING ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
            
            {/* Image Cover if available */}
            {room.images && room.images.length > 0 ? (
                <div className="h-32 w-full bg-gray-100 relative group-hover:opacity-90 transition">
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                    <button onClick={() => handleViewClick(room)} className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition text-white font-bold text-xs uppercase tracking-widest">Ver Agenda</button>
                </div>
            ) : (
                <div className="h-24 bg-gray-50 flex items-center justify-center text-gray-300 relative">
                    <ImageIcon size={24} />
                    <button onClick={() => handleViewClick(room)} className="absolute inset-0 flex items-center justify-center hover:bg-black/5 transition text-transparent hover:text-gray-500 font-bold text-xs uppercase tracking-widest">Ver Agenda</button>
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${room.type === 'Chalé' ? 'bg-olive-100 text-olive-700' : 'bg-blue-100 text-blue-700'}`}>
                    {room.type === 'Chalé' ? <Home size={20} /> : <BedDouble size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-none cursor-pointer hover:underline" onClick={() => handleViewClick(room)}>{room.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{room.type} • {room.capacity} P. • {room.bedConfig?.casal || 0}C {room.bedConfig?.solteiro || 0}S</p>
                  </div>
                </div>
                <button onClick={() => handleEditClick(room)} className="text-gray-300 hover:text-olive-600 transition"><Edit size={16}/></button>
              </div>

              {room.description && <p className="text-[10px] text-gray-400 line-clamp-2 min-h-[2.5em] mb-4">{room.description}</p>}

              <div className="flex items-center justify-between mb-4 mt-auto">
                <span className="text-lg font-bold text-gray-800">R$ {room.price}</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(room.status)}`}>
                  {getStatusIcon(room.status)}
                  {room.status}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {room.status === RoomStatus.CLEANING && (
                  <button onClick={() => onUpdateStatus(room.id, RoomStatus.AVAILABLE)} className="col-span-2 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition"><CheckCircle size={14} /> Liberar</button>
                )}
                {room.status === RoomStatus.AVAILABLE && (
                   <>
                    <button onClick={() => onUpdateStatus(room.id, RoomStatus.MAINTENANCE)} className="bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition">Manut.</button>
                    <button onClick={() => onUpdateStatus(room.id, RoomStatus.CLEANING)} className="bg-yellow-50 text-yellow-700 py-2 rounded-lg text-xs font-bold hover:bg-yellow-100 transition">Limpeza</button>
                   </>
                )}
                {room.status === RoomStatus.MAINTENANCE && (
                  <button onClick={() => onUpdateStatus(room.id, RoomStatus.AVAILABLE)} className="col-span-2 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition"><CheckCircle size={14} /> Finalizar</button>
                )}
                {room.status === RoomStatus.OCCUPIED && (
                   <div className="col-span-2 text-center text-[10px] text-gray-400 font-bold bg-gray-50 py-2 rounded-lg">Check-out na Reservas</div>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* --- EDIT / DETAIL MODAL --- */}
      {selectedRoom && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
              <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                  {/* Header */}
                  <div className="bg-stone-900 text-white p-6 border-b border-stone-800 flex justify-between items-center">
                      <div>
                          <h2 className="text-xl font-bold flex items-center gap-2">
                              {selectedRoom.type === 'Chalé' ? <Home size={20}/> : <BedDouble size={20}/>} 
                              {isEditing ? 'Editar Acomodação' : selectedRoom.name}
                          </h2>
                          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
                              {isEditing ? 'Alterando informações cadastrais' : 'Agenda e Detalhes'}
                          </p>
                      </div>
                      <button onClick={() => setSelectedRoom(null)} className="hover:bg-white/10 p-2 rounded-full transition"><X size={24}/></button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50">
                      
                      {isEditing ? (
                          // --- EDIT FORM ---
                          <div className="space-y-6">
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome da Acomodação</label>
                                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-3 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-olive-500 outline-none" />
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preço (Diária)</label>
                                      <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} className="w-full border p-3 rounded-xl font-bold text-gray-800" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Capacidade (Pessoas)</label>
                                      <input type="number" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: parseInt(e.target.value)})} className="w-full border p-3 rounded-xl font-bold text-gray-800" />
                                  </div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição / Diferenciais</label>
                                  <textarea className="w-full border p-3 rounded-xl h-24 text-sm" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Vista para o mar, banheira, etc..." ></textarea>
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL da Imagem (Principal)</label>
                                   <div className="flex gap-2">
                                       <input type="text" value={editForm.images?.[0] || ''} onChange={e => setEditForm({...editForm, images: [e.target.value]})} className="flex-1 border p-3 rounded-xl text-sm" placeholder="https://..." />
                                       <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                           {editForm.images?.[0] && <img src={editForm.images[0]} className="w-full h-full object-cover" />}
                                       </div>
                                   </div>
                              </div>

                              <div className="flex gap-3 pt-4 border-t border-gray-200">
                                  <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">Cancelar</button>
                                  <button onClick={handleSaveEdit} className="flex-1 bg-olive-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-olive-700 transition flex items-center justify-center gap-2"><Save size={18}/> Salvar Alterações</button>
                              </div>
                          </div>
                      ) : (
                          // --- VIEW DETAILS & CALENDAR ---
                          <div className="space-y-6">
                              {/* Photo Hero (if any) */}
                              {selectedRoom.images?.[0] && (
                                  <div className="h-48 w-full rounded-2xl overflow-hidden shadow-md">
                                      <img src={selectedRoom.images[0]} className="w-full h-full object-cover" />
                                  </div>
                              )}

                              {/* Tabs / Info */}
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <h3 className="text-2xl font-black text-gray-800">R$ {selectedRoom.price} <span className="text-sm font-normal text-gray-400">/ noite</span></h3>
                                          <p className="text-sm text-gray-500 mt-2">{selectedRoom.description || "Sem descrição cadastrada."}</p>
                                      </div>
                                      <button onClick={() => { setEditForm(selectedRoom); setIsEditing(true); }} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition"><Edit size={16} className="text-gray-600"/></button>
                                  </div>
                                  <div className="flex gap-4 mt-6">
                                      <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">{selectedRoom.capacity} Pessoas</div>
                                      <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(selectedRoom.status)}`}>{selectedRoom.status}</div>
                                  </div>
                              </div>

                              {/* Calendar Section */}
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-olive-600"/> Agenda de Reservas</h4>
                                  
                                  {/* Reservations List for this Room */}
                                  <div className="space-y-3">
                                      {reservations.filter(r => r.roomId === selectedRoom.id).sort((a,b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()).map(res => (
                                          <div key={res.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition relative overflow-hidden">
                                              {/* Status Line */}
                                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${res.status === 'Confirmado' ? 'bg-green-500' : res.status === 'Check-in' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                              
                                              <div className="bg-gray-100 p-2 rounded-lg text-center min-w-[3.5rem] ml-1">
                                                  <span className="block text-[10px] font-bold text-gray-500 uppercase">{new Date(res.checkIn).toLocaleDateString('pt-BR', {month:'short'})}</span>
                                                  <span className="block text-lg font-black text-gray-800 leading-none">{new Date(res.checkIn).getDate()}</span>
                                              </div>
                                              <div className="flex-1">
                                                  <p className="font-bold text-gray-800 text-sm">{res.guestName}</p>
                                                  <p className="text-xs text-gray-500">{new Date(res.checkIn).toLocaleDateString()} - {new Date(res.checkOut).toLocaleDateString()} ({res.status})</p>
                                              </div>
                                          </div>
                                      ))}
                                      {reservations.filter(r => r.roomId === selectedRoom.id).length === 0 && (
                                          <p className="text-sm text-gray-400 italic text-center py-4">Nenhuma reserva futura encontrada para este quarto.</p>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
