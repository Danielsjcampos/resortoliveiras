import React, { useState } from 'react';
import { Client } from '../types';
import { 
  User, Mail, Phone, MapPin, Calendar, Plus, Edit, Trash2, 
  Search, Users, Save, X, MoreHorizontal 
} from 'lucide-react';

import { Reservation, Room } from '../types';

interface AdminClientsProps {
  clients: Client[];
  reservations: Reservation[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onQuickHost?: (client: Client) => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({ 
  clients, 
  reservations,
  onAddClient, 
  onUpdateClient, 
  onDeleteClient,
  onQuickHost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewHistoryClient, setViewHistoryClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
      name: '',
      email: '',
      phone: '',
      address: '',
      cpf: '',
      birthDate: '',
      dependents: []
  });

  const filteredClients = clients.filter(c => 
     c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.cpf?.includes(searchTerm)
  );

  const handleOpenModal = (client?: Client) => {
      if (client) {
          setEditingClient(client);
          setFormData(client);
      } else {
          setEditingClient(null);
          setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            cpf: '',
            birthDate: '',
            dependents: []
          });
      }
      setIsModalOpen(true);
  };

  const calculateAge = (dateString?: string) => {
      if (!dateString) return null;
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  };

  const handleAddDependent = () => {
      const newDep = { name: '', age: 0, relationship: 'Filho(a)' };
      setFormData({
          ...formData,
          dependents: [...(formData.dependents || []), newDep]
      });
  };

  const handleUpdateDependent = (index: number, field: string, value: any) => {
      const updatedDeps = [...(formData.dependents || [])];
      updatedDeps[index] = { ...updatedDeps[index], [field]: value };
      setFormData({ ...formData, dependents: updatedDeps });
  };

  const handleRemoveDependent = (index: number) => {
      const updatedDeps = [...(formData.dependents || [])];
      updatedDeps.splice(index, 1);
      setFormData({ ...formData, dependents: updatedDeps });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name) {
          if (editingClient) {
              onUpdateClient({ ...editingClient, ...formData } as Client);
          } else {
              onAddClient(formData as Omit<Client, 'id' | 'createdAt'>);
          }
          setIsModalOpen(false);
      }
  };

  const clientReservations = viewHistoryClient 
    ? reservations.filter(r => r.clientId === viewHistoryClient.id || r.guestName.toLowerCase() === viewHistoryClient.name.toLowerCase())
    : [];

  const totalSpentByClient = clientReservations.reduce((acc, r) => acc + (r.totalAmount || 0) + (r.consumption?.reduce((s, c) => s + (c.value * c.quantity), 0) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clientes & Hóspedes</h2>
          <p className="text-gray-500 text-sm">Gerencie o cadastro de clientes e seus dependentes.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-olive-600 text-white px-5 py-2.5 rounded-2xl hover:bg-olive-700 transition shadow-lg font-bold">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex gap-4">
              <div className="flex-1 bg-stone-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-stone-100 focus-within:ring-2 ring-olive-100 transition">
                  <Search size={20} className="text-stone-400"/>
                  <input 
                    type="text" 
                    placeholder="Buscar por nome, email ou CPF..." 
                    className="bg-transparent outline-none w-full text-stone-700 font-medium placeholder-stone-400"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] uppercase text-stone-400 font-black tracking-widest">
                  <tr>
                      <th className="p-6">Cliente</th>
                      <th className="p-6">Contato</th>
                      <th className="p-6">Idade / CPF</th>
                      <th className="p-6">Histórico VIP</th>
                      <th className="p-6 text-right">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                  {filteredClients.map(client => (
                      <tr key={client.id} className="hover:bg-stone-50/50 transition cursor-pointer" onClick={() => setViewHistoryClient(client)}>
                          <td className="p-6">
                              <div className="font-bold text-stone-800">{client.name}</div>
                              {client.createdAt && <div className="text-[10px] text-stone-400 mt-1">Desde {new Date(client.createdAt).getFullYear()}</div>}
                          </td>
                          <td className="p-6">
                              <div className="flex items-center gap-2 text-sm text-stone-600 mb-1"><Mail size={14}/> {client.email || '-'}</div>
                              <div className="flex items-center gap-2 text-sm text-stone-600"><Phone size={14}/> {client.phone || '-'}</div>
                          </td>
                          <td className="p-6">
                              <div className="text-sm font-bold text-stone-700">{calculateAge(client.birthDate)} anos</div>
                              <div className="text-xs text-stone-400 font-mono">{client.cpf || 'Sem CPF'}</div>
                          </td>
                          <td className="p-6">
                             {/* Mini Sparkline or Status */}
                             <span className="bg-stone-100 text-[10px] font-bold px-2 py-1 rounded text-stone-500 border border-stone-200">
                                Ver Histórico
                             </span>
                          </td>
                          <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                  {onQuickHost && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onQuickHost(client); }}
                                        className="px-3 py-1.5 bg-olive-50 text-olive-700 hover:bg-olive-100 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-olive-100"
                                        title="Hospedar Agora"
                                    >
                                        <Calendar size={14}/> Hospedar
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenModal(client); }} className="p-2 text-stone-400 hover:text-olive-600 rounded-lg transition hover:bg-olive-50"><Edit size={16}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }} className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition hover:bg-red-50"><Trash2 size={16}/></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Modal Edit */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                      <h2 className="text-xl font-bold text-stone-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Completo</label>
                              <input required className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 ring-olive-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                              <input type="email" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Telefone</label>
                              <input className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CPF</label>
                              <input className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data de Nascimento</label>
                              <input type="date" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none" value={formData.birthDate ? formData.birthDate.split('T')[0] : ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                          </div>
                          <div className="col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Endereço</label>
                              <input className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                          </div>
                      </div>

                      {/* Dependents Section */}
                      <div className="border-t pt-6">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Users size={18} className="text-olive-600"/> Dependentes / Acompanhantes</h3>
                              <button type="button" onClick={handleAddDependent} className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"><Plus size={14}/> Adicionar</button>
                          </div>
                          
                          <div className="space-y-3">
                              {formData.dependents?.map((dep, idx) => (
                                  <div key={idx} className="flex gap-2 items-center bg-stone-50 p-2 rounded-xl border border-stone-100">
                                      <input placeholder="Nome" className="flex-1 bg-transparent border-b border-transparent focus:border-olive-500 outline-none p-1 text-sm" value={dep.name} onChange={e => handleUpdateDependent(idx, 'name', e.target.value)} />
                                      <input type="number" placeholder="Idade" className="w-16 bg-transparent border-b border-transparent focus:border-olive-500 outline-none p-1 text-sm text-center" value={dep.age} onChange={e => handleUpdateDependent(idx, 'age', parseInt(e.target.value))} />
                                      <select className="bg-transparent text-sm outline-none text-gray-500" value={dep.relationship} onChange={e => handleUpdateDependent(idx, 'relationship', e.target.value)}>
                                          <option value="Filho(a)">Filho(a)</option>
                                          <option value="Cônjuge">Cônjuge</option>
                                          <option value="Outro">Outro</option>
                                      </select>
                                      <button onClick={() => handleRemoveDependent(idx)} className="p-1 text-gray-400 hover:text-red-500"><X size={16}/></button>
                                  </div>
                              ))}
                              {(!formData.dependents || formData.dependents.length === 0) && (
                                  <p className="text-sm text-gray-400 italic text-center py-2">Nenhum dependente cadastrado.</p>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-stone-50 flex justify-end gap-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Cancelar</button>
                      <button onClick={handleSubmit} className="px-8 py-3 bg-olive-600 text-white font-bold rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 flex items-center gap-2"><Save size={18}/> Salvar Cliente</button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal History */}
      {viewHistoryClient && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 bg-stone-900 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-serif font-bold">{viewHistoryClient.name}</h2>
                        <div className="flex gap-4 mt-2 text-white/60 text-sm">
                            <span className="flex items-center gap-1"><Mail size={14}/> {viewHistoryClient.email}</span>
                            <span className="flex items-center gap-1"><Phone size={14}/> {viewHistoryClient.phone}</span>
                        </div>
                    </div>
                    <button onClick={() => setViewHistoryClient(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"><X size={20}/></button>
                </div>

                <div className="p-8 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Gasto no Resort</p>
                        <p className="text-3xl font-black text-olive-600">R$ {totalSpentByClient.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    {onQuickHost && (
                         <button 
                            onClick={() => { onQuickHost(viewHistoryClient); setViewHistoryClient(null); }}
                            className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition shadow-xl flex items-center gap-2"
                         >
                            <Calendar size={18}/> Nova Hospedagem
                         </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><Calendar size={20} className="text-stone-400"/> Histórico de Estadias</h3>
                    
                    {clientReservations.length === 0 ? (
                        <div className="text-center py-10 text-stone-400 italic">Nenhuma reserva encontrada para este cliente.</div>
                    ) : (
                        <div className="space-y-4">
                            {clientReservations.map(res => (
                                <div key={res.id} className="bg-white border border-stone-200 rounded-2xl p-6 flex justify-between items-center shadow-sm hover:shadow-md transition">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${res.status === 'Check-out' ? 'bg-stone-100 text-stone-500' : 'bg-green-100 text-green-700'}`}>
                                                {res.status}
                                            </span>
                                            <span className="text-sm font-bold text-stone-800">Quarto {res.roomId}</span>
                                        </div>
                                        <p className="text-xs text-stone-500">{new Date(res.checkIn).toLocaleDateString()} a {new Date(res.checkOut).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-stone-800">Total: R$ {res.totalAmount?.toLocaleString('pt-BR')}</p>
                                        <p className="text-[10px] text-stone-400">Consumo Extra: R$ {(res.consumption?.reduce((s, c) => s + (c.value * c.quantity), 0) || 0).toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
