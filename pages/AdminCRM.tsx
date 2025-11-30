import React, { useState } from 'react';
import { Lead, LeadStatus, InterestType } from '../types';
import { MessageCircle, Phone, Mail, MoreHorizontal, Search, Filter, FileText, X, Send } from 'lucide-react';

interface AdminCRMProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onAddNote?: (id: string, note: string) => void; // Optional for now
}

export const AdminCRM: React.FC<AdminCRMProps> = ({ leads, onUpdateStatus, onAddNote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  
  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'bg-blue-100 text-blue-800';
      case LeadStatus.CONTACTED: return 'bg-yellow-100 text-yellow-800';
      case LeadStatus.PROPOSAL_SENT: return 'bg-purple-100 text-purple-800';
      case LeadStatus.RESERVED: return 'bg-green-100 text-green-800';
      case LeadStatus.LOST: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddNote = () => {
    if (selectedLead && newNote && onAddNote) {
      onAddNote(selectedLead.id, newNote);
      setNewNote('');
      // Optimistically update local selected lead for UI feedback
      setSelectedLead({
        ...selectedLead,
        history: [...(selectedLead.history || []), `${new Date().toISOString().split('T')[0]}: ${newNote}`]
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">CRM de Leads</h2>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-olive-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
           </div>
           <button className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition shadow-sm text-sm whitespace-nowrap">
            + Novo Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Todos
        </button>
        <button 
           onClick={() => setStatusFilter(LeadStatus.NEW)}
           className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${statusFilter === LeadStatus.NEW ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Novos
        </button>
        <button 
           onClick={() => setStatusFilter(LeadStatus.CONTACTED)}
           className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${statusFilter === LeadStatus.CONTACTED ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Em Andamento
        </button>
         <button 
           onClick={() => setStatusFilter(LeadStatus.RESERVED)}
           className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${statusFilter === LeadStatus.RESERVED ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Reservados
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                <th className="p-4">Cliente / Lead</th>
                <th className="p-4">Interesse</th>
                <th className="p-4">Data / Pessoas</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-olive-50 transition">
                  <td className="p-4 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                    <div className="font-bold text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
                      <span className="flex items-center"><Mail size={12} className="mr-1"/> {lead.email}</span>
                      <span className="flex items-center"><Phone size={12} className="mr-1"/> {lead.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium text-xs px-2 py-0.5 rounded ${lead.interest === InterestType.ACCOMMODATION ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {lead.interest}
                    </span>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {lead.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{new Date(lead.date).toLocaleDateString('pt-BR')}</div>
                    <div className="text-xs">{lead.guests} pessoas</div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-olive-500 ${getStatusColor(lead.status)}`}
                    >
                      <option value={LeadStatus.NEW}>NOVO</option>
                      <option value={LeadStatus.CONTACTED}>EM ANDAMENTO</option>
                      <option value={LeadStatus.PROPOSAL_SENT}>PROPOSTA ENVIADA</option>
                      <option value={LeadStatus.RESERVED}>RESERVADO</option>
                      <option value={LeadStatus.LOST}>PERDIDO</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        title="Ver Detalhes/Notas"
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        title="Enviar WhatsApp"
                        className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition"
                        onClick={() => alert(`Simulando abertura API WhatsApp para ${lead.phone}`)}
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Filter size={48} className="mb-4 text-gray-200" />
            <p>Nenhum lead encontrado com os filtros atuais.</p>
          </div>
        )}
      </div>

      {/* Details/Notes Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b flex justify-between items-center bg-olive-900 text-white">
              <div>
                <h3 className="text-xl font-bold">{selectedLead.name}</h3>
                <p className="text-sm opacity-80">Detalhes do Lead</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-white hover:bg-olive-800 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Block */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong className="text-gray-700">Email:</strong> {selectedLead.email}</p>
                <p><strong className="text-gray-700">Telefone:</strong> {selectedLead.phone}</p>
                <p><strong className="text-gray-700">Interesse:</strong> {selectedLead.interest}</p>
                <p><strong className="text-gray-700">Data Desejada:</strong> {new Date(selectedLead.date).toLocaleDateString('pt-BR')}</p>
                <p><strong className="text-gray-700">Pessoas:</strong> {selectedLead.guests}</p>
              </div>

              {/* History / Notes */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={18} /> Histórico de Interações
                </h4>
                <div className="space-y-3 mb-4">
                  {selectedLead.history && selectedLead.history.length > 0 ? (
                    selectedLead.history.map((note, idx) => (
                      <div key={idx} className="text-sm bg-yellow-50 p-3 rounded border border-yellow-100 text-gray-700">
                        {note}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">Nenhuma nota registrada.</p>
                  )}
                </div>
                
                {/* Add Note Input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nota..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-olive-500"
                  />
                  <button 
                    onClick={handleAddNote}
                    className="bg-olive-600 text-white p-2 rounded-lg hover:bg-olive-700"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
              ID: {selectedLead.id} • Criado em {new Date(selectedLead.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};