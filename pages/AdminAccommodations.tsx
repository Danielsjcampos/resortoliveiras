import React, { useState } from 'react';
import { Room, RoomStatus } from '../types';
import { BedDouble, Home, check, X, PaintBucket, PenTool, CheckCircle, AlertTriangle, LogIn } from 'lucide-react';

interface AdminAccommodationsProps {
  rooms: Room[];
  onUpdateStatus: (id: string, status: RoomStatus) => void;
}

export const AdminAccommodations: React.FC<AdminAccommodationsProps> = ({ rooms, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'ALL' | RoomStatus>('ALL');

  const filteredRooms = filter === 'ALL' ? rooms : rooms.filter(r => r.status === filter);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mapa de Acomodações</h2>
          <p className="text-gray-500 text-sm">Gerencie o status operacional dos quartos e chalés.</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === 'ALL' ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>Todos</button>
          <button onClick={() => setFilter(RoomStatus.AVAILABLE)} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === RoomStatus.AVAILABLE ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>Disponíveis</button>
          <button onClick={() => setFilter(RoomStatus.OCCUPIED)} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === RoomStatus.OCCUPIED ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>Ocupados</button>
          <button onClick={() => setFilter(RoomStatus.CLEANING)} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === RoomStatus.CLEANING ? 'bg-olive-600 text-white shadow' : 'hover:bg-gray-100 text-gray-600'}`}>Limpeza</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group">
            <div className={`h-2 w-full ${room.status === RoomStatus.AVAILABLE ? 'bg-green-500' : room.status === RoomStatus.OCCUPIED ? 'bg-red-500' : room.status === RoomStatus.CLEANING ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${room.type === 'Chalé' ? 'bg-olive-100 text-olive-700' : 'bg-blue-100 text-blue-700'}`}>
                    {room.type === 'Chalé' ? <Home size={20} /> : <BedDouble size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{room.name}</h3>
                    <p className="text-xs text-gray-500">{room.type} • {room.capacity} Pessoas</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 mb-6">
                <span className="text-lg font-semibold text-gray-800">R$ {room.price}</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(room.status)}`}>
                  {getStatusIcon(room.status)}
                  {room.status}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                {room.status === RoomStatus.CLEANING && (
                  <button 
                    onClick={() => onUpdateStatus(room.id, RoomStatus.AVAILABLE)}
                    className="col-span-2 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition"
                  >
                    <CheckCircle size={16} /> Liberar Quarto
                  </button>
                )}
                
                {room.status === RoomStatus.AVAILABLE && (
                   <>
                    <button 
                      onClick={() => onUpdateStatus(room.id, RoomStatus.MAINTENANCE)}
                      className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"
                    >
                      Manutenção
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(room.id, RoomStatus.CLEANING)}
                      className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-xs font-semibold hover:bg-yellow-100 transition"
                    >
                      Limpeza
                    </button>
                   </>
                )}

                {room.status === RoomStatus.MAINTENANCE && (
                  <button 
                    onClick={() => onUpdateStatus(room.id, RoomStatus.AVAILABLE)}
                    className="col-span-2 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition"
                  >
                    <CheckCircle size={16} /> Finalizar Manutenção
                  </button>
                )}

                {room.status === RoomStatus.OCCUPIED && (
                   <div className="col-span-2 text-center text-xs text-gray-400 italic py-2">
                     Gerencie check-out na aba Reservas
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};