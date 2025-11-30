import React from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AdminFinanceProps {
  transactions: Transaction[];
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({ transactions }) => {
  // --- Calculations ---
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  
  const pendingReceivables = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayables = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0);

  // --- Chart Data Prep ---
  // Simple grouping by date (mock logic would need real date grouping)
  const chartData = [
    { name: 'Out', income: 15000, expense: 8000 },
    { name: 'Nov', income: 22000, expense: 12000 },
    { name: 'Dez (Proj)', income: 35000, expense: 15000 },
  ];

  // Expenses by Category
  const expensesByCategory: Record<string, number> = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });
  
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle Financeiro</h2>
          <p className="text-gray-500 text-sm">Fluxo de caixa, contas a pagar e receber.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm shadow">
                <ArrowUpRight size={16} /> Nova Receita
            </button>
             <button className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center gap-2 text-sm shadow">
                <ArrowDownRight size={16} /> Nova Despesa
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <DollarSign size={48} className="text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Saldo Líquido (Atual)</p>
            <h3 className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                R$ {netProfit.toLocaleString('pt-BR')}
            </h3>
            <span className="text-xs text-gray-400">Total acumulado</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full"><TrendingUp size={16} /></div>
                <p className="text-gray-500 text-sm font-medium">Total Receitas</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">R$ {totalIncome.toLocaleString('pt-BR')}</h3>
            <p className="text-xs text-orange-500 mt-1">A receber: R$ {pendingReceivables.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-rose-100 text-rose-600 rounded-full"><TrendingDown size={16} /></div>
                <p className="text-gray-500 text-sm font-medium">Total Despesas</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">R$ {totalExpense.toLocaleString('pt-BR')}</h3>
            <p className="text-xs text-red-500 mt-1">A pagar: R$ {pendingPayables.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full"><AlertCircle size={16} /></div>
                <p className="text-gray-500 text-sm font-medium">Projeção Dezembro</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">R$ 20.000</h3>
            <span className="text-xs text-emerald-600 font-bold">+15% vs Nov</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Comparativo: Receitas x Despesas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="expense" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-6">Despesas por Categoria</h3>
           <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
           </div>
           <div className="space-y-2 mt-4">
              {pieData.map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                      <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: PIE_COLORS[index % PIE_COLORS.length]}}></div>
                          <span className="text-gray-600">{entry.name}</span>
                      </div>
                      <span className="font-bold text-gray-800">R$ {entry.value}</span>
                  </div>
              ))}
           </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Últimas Movimentações</h3>
            <button className="text-olive-600 text-sm font-semibold hover:underline">Ver Extrato Completo</button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Valor</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4 font-medium text-gray-800">{t.description}</td>
                        <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">{t.category}</span>
                        </td>
                        <td className="p-4">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {t.status === 'PAID' ? 'Pago/Recebido' : 'Pendente'}
                            </span>
                        </td>
                        <td className={`p-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};