
import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, InterestType } from '../types';
import { 
  MessageCircle, Phone, Mail, MoreHorizontal, Search, Filter, 
  FileText, X, Send, Layout, List, BarChart3, TrendingUp, 
  Target, Globe, MessageSquare, Instagram, SearchCode,
  ArrowRight, CheckCircle2, XCircle, CalendarCheck, Users,
  ChevronRight, ChevronLeft, ArrowDown
} from 'lucide-react';

interface AdminCRMProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onAddNote?: (id: string, note: string) => void;
}

export const AdminCRM: React.FC<AdminCRMProps> = ({ leads, onUpdateStatus, onAddNote }) => {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');

  // --- Estatísticas do Funil ---
  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.status === LeadStatus.WON).length;
    const lost = leads.filter(l => l.status === LeadStatus.LOST).length;
    const conversionRate = total > 0 ? (won / (won + lost || 1)) * 100 : 0;
    
    const sources = leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, won, lost, conversionRate, sources };
  }, [leads]);

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    return lead.name.toLowerCase().includes(term) || lead.email.toLowerCase().includes(term);
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Instagram': return <Instagram size={14} className="text-pink-500" />;
      case 'Google': return <Globe size={14} className="text-blue-500" />;
      case 'WhatsApp': return <MessageSquare size={14} className="text-green-500" />;
      case 'Site': return <SearchCode size={14} className="text-stone-500" />;
      default: return <Target size={14} className="text-stone-400" />;
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'border-blue-500 bg-blue-50 text-blue-700';
      case LeadStatus.IN_PROGRESS: return 'border-amber-500 bg-amber-50 text-amber-700';
      case LeadStatus.PROPOSAL: return 'border-purple-500 bg-purple-50 text-purple-700';
      case LeadStatus.WON: return 'border-green-500 bg-green-50 text-green-700';
      case LeadStatus.LOST: return 'border-red-500 bg-red-50 text-red-700';
      default: return 'border-stone-200 bg-stone-50 text-stone-500';
    }
  };

  const kanbanColumns = [
    { status: LeadStatus.NEW, label: 'Novos', color: 'bg-blue-600' },
    { status: LeadStatus.IN_PROGRESS, label: 'Atend.', color: 'bg-amber-600' },
    { status: LeadStatus.PROPOSAL, label: 'Prop.', color: 'bg-purple-600' },
    { status: LeadStatus.WON, label: 'Ganhos', color: 'bg-green-600' },
    { status: LeadStatus.LOST, label: 'Perdas', color: 'bg-red-600' },
  ];

  const moveLead = (id: string, current: LeadStatus, direction: 'NEXT' | 'PREV') => {
    const idx = kanbanColumns.findIndex(c => c.status === current);
    const nextIdx = direction === 'NEXT' ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < kanbanColumns.length) {
      onUpdateStatus(id, kanbanColumns[nextIdx].status);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-20">
      
      {/* --- DASHBOARD COMPACTO --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm">
            <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-1">Total Funil</p>
            <h3 className="text-3xl font-black text-stone-800">{stats.total}</h3>
        </div>
        <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Taxa Conv.</p>
            <h3 className="text-3xl font-black text-stone-800">{stats.conversionRate.toFixed(1)}%</h3>
        </div>
        <div className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm col-span-2 flex justify-between items-center">
            <div className="flex gap-6">
                {(Object.entries(stats.sources) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0,2).map(([src, count]) => (
                  <div key={src} className="flex flex-col">
                    <span className="text-[9px] font-black text-stone-900 uppercase tracking-widest mb-1">{src}</span>
                    <span className="text-xl font-black text-stone-700">{count}</span>
                  </div>
                ))}
            </div>
            <div className="text-right border-l pl-6 border-stone-100">
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Fechados</span>
              <h4 className="text-3xl font-black text-stone-800">{stats.won}</h4>
            </div>
        </div>
      </div>

      {/* --- CONTROLES --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-stone-200 p-1 rounded-2xl border border-stone-300 shadow-inner">
            <button onClick={() => setViewMode('KANBAN')} className={`flex items-center gap-2 px-6 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-tighter ${viewMode === 'KANBAN' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}><Layout size={14}/> Kanban</button>
            <button onClick={() => setViewMode('LIST')} className={`flex items-center gap-2 px-6 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-tighter ${viewMode === 'LIST' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}><List size={14}/> Lista</button>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative flex-grow">
            <Search className="absolute left-4 top-3 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar no funil..." 
              className="pl-11 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-olive-500 text-sm font-black text-stone-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
           </div>
           <button className="bg-olive-700 text-white px-6 py-2.5 rounded-2xl hover:bg-olive-800 transition shadow-lg text-xs font-black uppercase tracking-widest shrink-0">+ Lead</button>
        </div>
      </div>

      {/* --- KANBAN VIEW --- */}
      {viewMode === 'KANBAN' && (
        <div className="flex-grow flex flex-col md:flex-row gap-4 min-h-0">
          {kanbanColumns.map((col, cIdx) => (
            <div key={col.status} className="flex-1 flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between px-3 bg-stone-100 py-3 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                   <div className={`w-2 h-2 rounded-full shrink-0 ${col.color}`}></div>
                   <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] truncate">{col.label}</h4>
                </div>
                <span className="text-[10px] font-black text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200 shadow-sm">{filteredLeads.filter(l => l.status === col.status).length}</span>
              </div>
              
              <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pb-6 pr-1">
                 {filteredLeads.filter(l => l.status === col.status).map(lead => (
                   <div 
                      key={lead.id} 
                      className="bg-white p-4 rounded-[28px] border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative border-b-4 border-b-stone-100"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-stone-400 uppercase tracking-widest truncate">
                            {getSourceIcon(lead.source)} {lead.source}
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={14} className="text-stone-300" />
                         </div>
                      </div>
                      <h5 className="font-black text-stone-900 text-sm leading-tight mb-2 truncate tracking-tighter">{lead.name}</h5>
                      <div className="flex justify-between items-center text-[9px] text-stone-500 font-black uppercase tracking-tighter bg-stone-50 p-2 rounded-xl border border-stone-100">
                         <span>{lead.guests}p • {lead.interest.slice(0,6)}.</span>
                         <span className="text-olive-700">{new Date(lead.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                      </div>
                      
                      <div className="flex justify-between mt-3 pt-3 border-t border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            disabled={cIdx === 0}
                            onClick={(e) => { e.stopPropagation(); moveLead(lead.id, lead.status, 'PREV'); }}
                            className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-900 disabled:opacity-0"
                         >
                            <ChevronLeft size={16}/>
                         </button>
                         <button 
                            disabled={cIdx === kanbanColumns.length - 1}
                            onClick={(e) => { e.stopPropagation(); moveLead(lead.id, lead.status, 'NEXT'); }}
                            className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-900 disabled:opacity-0"
                         >
                            <ChevronRight size={16}/>
                         </button>
                      </div>
                   </div>
                 ))}
                 {filteredLeads.filter(l => l.status === col.status).length === 0 && (
                   <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-[32px] text-stone-300">
                      <p className="text-[9px] font-black uppercase tracking-widest">Sem registros</p>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-[40px] shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200 text-[10px] uppercase text-stone-900 font-black tracking-widest">
                <th className="p-6">Lead / Origem</th>
                <th className="p-6 text-center">Interesse</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-olive-50/20 transition cursor-pointer group" onClick={() => setSelectedLead(lead)}>
                  <td className="p-6">
                    <div className="font-black text-stone-900 text-base tracking-tight">{lead.name}</div>
                    <div className="text-[10px] text-stone-400 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                      {getSourceIcon(lead.source)} {lead.source} • {lead.email}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full border border-stone-200 text-stone-700 uppercase bg-stone-50 shadow-sm tracking-tighter">
                      {lead.interest}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className={`text-[10px] font-black inline-block px-4 py-1.5 rounded-full border shadow-sm tracking-widest ${getStatusColor(lead.status)}`}>
                        {lead.status.toUpperCase()}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                      <button className="p-3 bg-stone-100 text-stone-500 rounded-2xl hover:bg-stone-900 hover:text-white transition-all shadow-sm group-hover:scale-105"><FileText size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && <p className="p-32 text-center text-stone-300 font-black italic uppercase tracking-widest">Nenhum lead encontrado.</p>}
        </div>
      )}

      {/* --- DETALHES MODAL --- */}
      {selectedLead && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-stone-200">
            <div className="p-8 border-b flex justify-between items-center bg-stone-900 text-white border-b-olive-600 border-b-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center text-2xl font-serif border border-white/20">
                   {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{selectedLead.name}</h3>
                  <p className="text-[10px] text-olive-400 font-black uppercase tracking-[0.2em]">Captado via {selectedLead.source}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="hover:bg-white/10 p-2 rounded-full transition-transform active:scale-90">
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-5 rounded-[28px] border border-stone-100 shadow-inner">
                     <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-2">Status do Lead</p>
                     <select 
                        value={selectedLead.status}
                        onChange={(e) => onUpdateStatus(selectedLead.id, e.target.value as LeadStatus)}
                        className={`text-[10px] font-black w-full bg-transparent border-none focus:ring-0 cursor-pointer uppercase tracking-widest ${getStatusColor(selectedLead.status)}`}
                      >
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                  <div className="bg-stone-50 p-5 rounded-[28px] border border-stone-100 shadow-inner">
                     <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-2">Interesse</p>
                     <p className="text-xs font-black text-stone-800 uppercase tracking-tighter">{selectedLead.interest}</p>
                  </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] border-b border-stone-100 pb-2">Informações de Contato</h4>
                <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">WhatsApp</p>
                        <p className="text-sm font-black text-stone-900 flex items-center gap-2"><MessageSquare size={14} className="text-green-600"/> {selectedLead.phone}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">E-mail</p>
                        <p className="text-xs font-black text-stone-800 flex items-center gap-2"><Mail size={14} className="text-blue-500"/> {selectedLead.email}</p>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] border-b border-stone-100 pb-2 mb-4">Cronograma de Atendimento</h4>
                <div className="space-y-4">
                  {selectedLead.history?.map((note, idx) => (
                    <div key={idx} className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-olive-600 before:rounded-full">
                      <p className="text-[12px] text-stone-600 font-bold leading-relaxed">{note}</p>
                    </div>
                  ))}
                  {(!selectedLead.history || selectedLead.history.length === 0) && (
                    <p className="text-xs text-stone-300 italic font-medium">Sem interações registradas.</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100">
                  <div className="relative">
                    <textarea 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Anotar progresso da venda..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-[28px] p-6 text-sm font-medium focus:ring-2 focus:ring-olive-500 min-h-[120px] outline-none shadow-inner"
                    />
                    <button 
                        onClick={() => {
                            if(newNote && onAddNote) onAddNote(selectedLead.id, newNote);
                            setNewNote('');
                        }}
                        className="absolute bottom-4 right-4 bg-stone-900 text-white p-3 rounded-2xl hover:bg-olive-700 transition shadow-xl"
                    >
                        <Send size={18} />
                    </button>
                  </div>
              </div>
            </div>

            <div className="p-8 border-t bg-stone-50 flex gap-4">
               <button onClick={() => { onUpdateStatus(selectedLead.id, LeadStatus.WON); setSelectedLead(null); }} className="flex-1 py-5 bg-green-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                  <CheckCircle2 size={18}/> Ganho
               </button>
               <button onClick={() => { onUpdateStatus(selectedLead.id, LeadStatus.LOST); setSelectedLead(null); }} className="flex-1 py-5 bg-red-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                  <XCircle size={18}/> Perda
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};
