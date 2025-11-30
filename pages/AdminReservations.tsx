import React, { useState } from 'react';
import { Reservation, Lead, Room, RoomStatus, ConsumptionItem } from '../types';
import { Calendar, Search, LogIn, LogOut, Plus, User, CreditCard, Martini, Trash2, X, CheckSquare } from 'lucide-react';

interface AdminReservationsProps {
  reservations: Reservation[];
  leads: Lead[];
  rooms: Room[];
  onCreateReservation: (data: Partial<Reservation>) => void;
  onUpdateStatus: (id: string, status: Reservation['status']) => void;
  onAddConsumption?: (reservationId: string, item: Omit<ConsumptionItem, 'id'>) => void;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({
  reservations,
  leads,
  rooms,
  onCreateReservation,
  onUpdateStatus,
  onAddConsumption
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedResForConsumption, setSelectedResForConsumption] = useState<Reservation | null>(null);
  const [selectedResForCheckIn, setSelectedResForCheckIn] = useState<Reservation | null>(null);

  const [newConsumption, setNewConsumption] = useState({ description: '', value: 0, quantity: 1, category: 'Restaurante' });

  const [newRes, setNewRes] = useState({
    leadId: '',
    roomId: '',
    checkIn: '',
    checkOut: ''
  });

  const [checkInDetails, setCheckInDetails] = useState({
    roomId: '',
    guestName: '',
    documentId: '',
    notes: ''
  });

  // Calculate total days
  const getDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.leadId || !newRes.roomId) return;

    const selectedRoom = rooms.find(r => r.id === newRes.roomId);
    const selectedLead = leads.find(l => l.id === newRes.leadId);
    const days = getDays(newRes.checkIn, newRes.checkOut);
    const total = days * (selectedRoom?.price || 0);

    onCreateReservation({
      leadId: newRes.leadId,
      roomId: newRes.roomId,
      guestName: selectedLead?.name || 'Hóspede',
      checkIn: newRes.checkIn,
      checkOut: newRes.checkOut,
      status: 'Confirmado',
      totalAmount: total,
      consumption: []
    });

    setShowNewForm(false);
    setNewRes({ leadId: '', roomId: '', checkIn: '', checkOut: '' });
  };

  const handleAddConsumptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResForConsumption && onAddConsumption) {
      onAddConsumption(selectedResForConsumption.id, {
        description: newConsumption.description,
        value: Number(newConsumption.value),
        quantity: Number(newConsumption.quantity),
        category: newConsumption.category as any,
        date: new Date().toISOString()
      });
      setNewConsumption({ description: '', value: 0, quantity: 1, category: 'Restaurante' });
      // Close modal
      setSelectedResForConsumption(null);
    }
  };

  const handleOpenCheckIn = (res: Reservation) => {
    setSelectedResForCheckIn(res);
    setCheckInDetails({
      roomId: res.roomId,
      guestName: res.guestName,
      documentId: res.guestDetails?.documentId || '',
      notes: res.guestDetails?.notes || ''
    });
  };

  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResForCheckIn) return;

    // Here we would ideally update the reservation with the new details (room, guest info)
    // For this MVP, we just call the status update, but in a real app we'd pass the extra data.
    // We can simulate updating the room if it changed by calling onCreateReservation or a specific update function,
    // but the prop only supports status update. 
    // To keep it simple and working: we will just proceed with status update.
    // Ideally: onUpdateReservation(id, { ...details, status: 'Check-in' })

    onUpdateStatus(selectedResForCheckIn.id, 'Check-in');
    setSelectedResForCheckIn(null);
  };

  const calculateTotalBill = (res: Reservation) => {
    const consumptionTotal = (res.consumption || []).reduce((sum, item) => sum + (item.value * item.quantity), 0);
    return res.totalAmount + consumptionTotal;
  };

  const availableRooms = rooms.filter(r => r.status === RoomStatus.AVAILABLE || r.status === RoomStatus.CLEANING);
  const leadOptions = leads.filter(l => l.status !== 'PERDIDO');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle de Reservas</h2>
          <p className="text-gray-500 text-sm">Check-ins, Comandas e Check-outs.</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition shadow-sm"
        >
          <Plus size={18} /> Nova Reserva
        </button>
      </div>

      {/* New Reservation Form */}
      {showNewForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-olive-100 animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4 text-olive-800">Nova Reserva Manual</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Lead)</label>
              <select
                className="w-full border rounded-lg p-2"
                value={newRes.leadId}
                onChange={e => setNewRes({ ...newRes, leadId: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                {leadOptions.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.status})</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quarto</label>
              <select
                className="w-full border rounded-lg p-2"
                value={newRes.roomId}
                onChange={e => setNewRes({ ...newRes, roomId: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} - R${r.price}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
              <input type="date" className="w-full border rounded-lg p-2" required
                value={newRes.checkIn} onChange={e => setNewRes({ ...newRes, checkIn: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saída</label>
              <input type="date" className="w-full border rounded-lg p-2" required
                value={newRes.checkOut} onChange={e => setNewRes({ ...newRes, checkOut: e.target.value })} />
            </div>
            <div className="lg:col-span-5 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700">Confirmar Reserva</button>
            </div>
          </form>
        </div>
      )}

      {/* Reservations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="p-4">Hóspede</th>
              <th className="p-4">Acomodação</th>
              <th className="p-4">Período</th>
              <th className="p-4">Total (Estimado)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map(res => {
              const roomName = rooms.find(r => r.id === res.roomId)?.name || 'Quarto Desconhecido';
              const grandTotal = calculateTotalBill(res);
              const consumptionTotal = (res.consumption || []).reduce((sum, item) => sum + (item.value * item.quantity), 0);

              return (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <User size={16} className="text-gray-400" /> {res.guestName}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{roomName}</td>
                  <td className="p-4 text-sm">
                    <div className="text-gray-900">{new Date(res.checkIn).toLocaleDateString('pt-BR')}</div>
                    <div className="text-gray-400 text-xs">até {new Date(res.checkOut).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm font-bold text-gray-800">R$ {grandTotal.toLocaleString('pt-BR')}</div>
                    {consumptionTotal > 0 && (
                      <div className="text-xs text-orange-600 font-medium">+ R$ {consumptionTotal} consumo</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${res.status === 'Confirmado' ? 'bg-blue-100 text-blue-800' :
                        res.status === 'Check-in' ? 'bg-green-100 text-green-800' :
                          res.status === 'Check-out' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">

                      {/* Consumption Button - Only for Checked In */}
                      {res.status === 'Check-in' && (
                        <button
                          onClick={() => setSelectedResForConsumption(res)}
                          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                          title="Lançar Consumo (Comanda)"
                        >
                          <Martini size={16} />
                        </button>
                      )}

                      {res.status === 'Confirmado' && (
                        <button
                          onClick={() => handleOpenCheckIn(res)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                        >
                          <LogIn size={12} /> Check-in
                        </button>
                      )}

                      {res.status === 'Check-in' && (
                        <button
                          onClick={() => {
                            if (confirm(`Fechar conta de ${res.guestName}? Total: R$ ${grandTotal}`)) {
                              onUpdateStatus(res.id, 'Check-out');
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                        >
                          <LogOut size={12} /> Check-out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Check-in / Registration Modal */}
      {selectedResForCheckIn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-olive-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <CheckSquare size={20} /> Check-in & Registro
              </h3>
              <button onClick={() => setSelectedResForCheckIn(null)} className="hover:bg-olive-800 p-1 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmCheckIn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo do Hóspede</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={checkInDetails.guestName}
                  onChange={e => setCheckInDetails({ ...checkInDetails, guestName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF / Passaporte</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={checkInDetails.documentId}
                  onChange={e => setCheckInDetails({ ...checkInDetails, documentId: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alocação de Quarto</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={checkInDetails.roomId}
                  onChange={e => setCheckInDetails({ ...checkInDetails, roomId: e.target.value })}
                  required
                >
                  {/* Show current room even if occupied (by this reservation) */}
                  {rooms.map(r => (
                    <option
                      key={r.id}
                      value={r.id}
                      disabled={r.status === RoomStatus.OCCUPIED && r.id !== selectedResForCheckIn.roomId}
                    >
                      {r.name} ({r.type}) - {r.status}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Confirme o quarto que será entregue a chave.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  value={checkInDetails.notes}
                  onChange={e => setCheckInDetails({ ...checkInDetails, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedResForCheckIn(null)}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg"
                >
                  Confirmar Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consumption Modal */}
      {selectedResForConsumption && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-olive-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Martini size={20} /> Comanda Digital: {selectedResForConsumption.guestName}
              </h3>
              <button onClick={() => setSelectedResForConsumption(null)} className="hover:bg-olive-800 p-1 rounded"><X size={20} /></button>
            </div>

            <div className="p-6">
              {/* Add Item Form */}
              <form onSubmit={handleAddConsumptionSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase">Adicionar Item</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <input
                      placeholder="Descrição (ex: Jantar, Vinho)"
                      className="w-full border rounded p-2 text-sm"
                      value={newConsumption.description}
                      onChange={e => setNewConsumption({ ...newConsumption, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <select
                      className="w-full border rounded p-2 text-sm"
                      value={newConsumption.category}
                      onChange={e => setNewConsumption({ ...newConsumption, category: e.target.value })}
                    >
                      <option value="Restaurante">Restaurante</option>
                      <option value="Bar">Bar / Piscina</option>
                      <option value="Frigobar">Frigobar</option>
                      <option value="Serviços">Serviços / SPA</option>
                      <option value="Passeios">Passeios</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="Qtd" className="w-16 border rounded p-2 text-sm" min="1"
                      value={newConsumption.quantity}
                      onChange={e => setNewConsumption({ ...newConsumption, quantity: Number(e.target.value) })}
                      required
                    />
                    <input
                      type="number" placeholder="Valor (Un)" className="w-full border rounded p-2 text-sm" step="0.01"
                      value={newConsumption.value || ''}
                      onChange={e => setNewConsumption({ ...newConsumption, value: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-olive-600 text-white font-bold py-2 rounded text-sm hover:bg-olive-700">
                  Lançar na Conta
                </button>
              </form>

              {/* Current Items List */}
              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">Extrato Atual</h4>
                <div className="max-h-40 overflow-y-auto border rounded divide-y">
                  {(selectedResForConsumption.consumption || []).length === 0 ? (
                    <p className="p-4 text-center text-xs text-gray-400">Nenhum consumo lançado ainda.</p>
                  ) : (
                    selectedResForConsumption.consumption?.map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{item.description}</p>
                          <p className="text-xs text-gray-500">{item.quantity}x {item.category}</p>
                        </div>
                        <div className="font-bold text-gray-700">
                          R$ {(item.value * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-gray-600">Total Consumo:</span>
                  <span className="text-xl font-bold text-olive-800">
                    R$ {(selectedResForConsumption.consumption || []).reduce((sum, i) => sum + (i.value * i.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};