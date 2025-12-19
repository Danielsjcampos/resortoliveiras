
import React, { useState, useMemo } from 'react';
import { Transaction, Reservation, EventRequest, SystemSettings, Room } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Printer, Download, 
  Search, Filter, Calendar, CreditCard, X, Receipt,
  Eye, FileText, ChevronDown
} from 'lucide-react';

interface AdminFinanceProps {
  transactions: Transaction[];
  reservations: Reservation[];
  events: EventRequest[];
  settings: SystemSettings;
  rooms: Room[];
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({ 
  transactions, reservations, events, settings, rooms 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, categoryFilter, startDate, endDate]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:p-0">
      
      {/* Cabeçalho de Impressão Profissional (Dinâmico) */}
      <div className="hidden print:block mb-8 border-b-2 border-stone-800 pb-6">
          <div className="flex justify-between items-end">
              <div>
                  <h1 className="text-3xl font-serif font-black text-stone-900 uppercase tracking-tighter">{settings.resortName}</h1>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">Relatório de Fechamento Financeiro</p>
                  <p className="text-[10px] text-stone-400 mt-4 font-bold">
                    CNPJ: {settings.resortCnpj} | {settings.resortAddress}
                  </p>
              </div>
              <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase">Emissão do Sistema</p>
                  <p className="text-sm font-mono font-bold">{new Date().toLocaleString()}</p>
              </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-600 text-white rounded-2xl shadow-lg"><DollarSign size={28}/></div> 
            Governança Financeira
          </h2>
          <p className="text-gray-500 mt-1">Auditoria de receitas e fluxo de caixa consolidado.</p>
        </div>
        
        <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-stone-900 text-white px-6 py-2.5 rounded-2xl hover:scale-105 transition flex items-center gap-2 font-bold shadow-xl">
                <Printer size={18} /> Imprimir Relatório
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Fluxo Líquido (Período)</p>
            <h3 className={`text-3xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingUp size={12}/> Receitas</p>
            <h3 className="text-3xl font-black text-stone-900">R$ {totalIncome.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingDown size={12}/> Despesas</p>
            <h3 className="text-3xl font-black text-stone-900">R$ {totalExpense.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-olive-900 p-6 rounded-[32px] text-white shadow-xl">
            <p className="text-[10px] font-black text-olive-300 uppercase tracking-widest mb-2">Margem</p>
            <h3 className="text-3xl font-black">+ 18.4%</h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-[40px] shadow-sm border border-stone-200 print:hidden flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Buscar Transação</label>
              <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-stone-300" size={18} />
                  <input className="w-full pl-12 pr-4 py-3 bg-stone-50 border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-olive-500" placeholder="Nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
          </div>
          <div className="w-48 space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Categoria</label>
              <select className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm font-bold" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="ALL">Todas</option>
                  <option value="Reservas">Reservas</option>
                  <option value="Restaurante">Restaurante</option>
              </select>
          </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-[40px] shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-white border-b text-[10px] uppercase font-bold text-stone-400 tracking-tighter">
                <tr>
                    <th className="p-6">Data</th>
                    <th className="p-6">Descrição</th>
                    <th className="p-6 text-center">Categoria</th>
                    <th className="p-6 text-right">Valor Bruto</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 text-sm">
                {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-stone-50/50 transition">
                        <td className="p-6 font-mono text-xs text-stone-400">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-6 font-bold text-stone-800">{t.description}</td>
                        <td className="p-6 text-center"><span className="px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-black uppercase tracking-tighter">{t.category}</span></td>
                        <td className={`p-6 text-right font-black text-base ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      <style>{`
        @media print {
            body * { visibility: hidden; }
            .print\\:block, .print\\:block * { visibility: visible; }
            main { padding: 0 !important; margin: 0 !important; }
            .print\\:hidden { display: none !important; }
            .bg-white, table, tr, td, th, h1, h2, h3, h4, p, span { visibility: visible !important; position: static !important; }
            table { width: 100% !important; border-collapse: collapse !important; margin-top: 20px !important; }
            th { background-color: #f8f8f8 !important; border-bottom: 1px solid #eee !important; padding: 10px !important; }
            td { border-bottom: 1px solid #f0f0f0 !important; padding: 12px !important; }
        }
      `}</style>
    </div>
  );
};
