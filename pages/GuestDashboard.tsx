import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Receipt, Calendar, CreditCard, Clock, Utensils, Wine, ShoppingBag, Coffee, HelpCircle, PlusCircle, X, Check } from 'lucide-react';
import { Reservation, SystemSettings, ConsumptionItem, Product } from '../types';

interface GuestDashboardProps {
  reservation: Reservation; // The logged-in reservation
  settings: SystemSettings;
  products?: Product[];
  onMakeOrder?: (item: Omit<ConsumptionItem, 'id'>) => void;
  onLogout: () => void;
  onRefresh?: () => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Restaurante': return <Utensils size={16} className="text-orange-600" />;
    case 'Bar': return <Wine size={16} className="text-purple-600" />;
    case 'Frigobar': return <Coffee size={16} className="text-blue-600" />;
    case 'Serviços': return <ShoppingBag size={16} className="text-pink-600" />;
    default: return <Receipt size={16} className="text-stone-500" />;
  }
};

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ reservation, settings, products = [], onMakeOrder, onLogout, onRefresh }) => {
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<'Restaurante' | 'Bar'>('Restaurante');

  const filteredProducts = products.filter(p => (p.category === selectedCategory) && p.available && (p.isRoomService !== false));

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const totalConsumption = reservation.consumption?.reduce((acc, item) => acc + (item.value * item.quantity), 0) || 0;
  const formattedConsumption = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-stone-100 pb-24 lg:pb-10">
      
      {/* Welcome Hero - Adapted to sit below Navbar */}
      <div className="bg-olive-800 text-white rounded-b-[40px] shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="p-6 pt-8 pb-12 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-olive-200 text-sm mb-1 font-medium">Olá, aproveite sua estadia</p>
              <h1 className="text-3xl font-serif font-bold tracking-tight">{reservation.guestName.split(' ')[0]}</h1>
              <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs mt-3 backdrop-blur-sm border border-white/5">
                <Calendar size={12} />
                Check-out: {new Date(reservation.checkOut).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
                {onRefresh && (
                    <button 
                        onClick={onRefresh}
                        className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm text-olive-100 border border-white/10"
                        title="Atualizar Pedidos"
                    >
                        <Utensils size={18} />
                    </button>
                )}
                <button 
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm text-olive-100 border border-white/10"
                title="Sair"
                >
                <LogOut size={18} />
                </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-olive-200 text-xs uppercase tracking-widest font-bold mb-1">Total da Conta</p>
                <div className="flex items-baseline gap-1">
                <span className="text-sm font-light opacity-80">R$</span>
                <span className="text-4xl font-bold tracking-tight text-white">{((reservation.totalAmount || 0) + totalConsumption).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-3 text-xs flex gap-3 text-olive-100 font-medium">
                    <span className="px-2 py-0.5 bg-black/20 rounded">Hospedagem: {formattedConsumption(reservation.totalAmount)}</span>
                    <span className="px-2 py-0.5 bg-black/20 rounded">Consumo: {formattedConsumption(totalConsumption)}</span>
                </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white">
                <Receipt size={120} />
            </div>
          </div>
        </div>
          
          <div className="px-6 -mt-8 relative z-20">
             <button 
                onClick={() => setShowOrderModal(true)}
                className="w-full bg-olive-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-olive-900/20 flex items-center justify-center gap-2 hover:bg-olive-500 transition border border-white/10"
             >
                 <PlusCircle size={22} strokeWidth={2.5} /> 
                 <span>Fazer Pedido para o Quarto</span>
             </button>
          </div>
      </div>

      {/* Consumption List */}
      <div className="px-4 mt-8">
        <h2 className="text-stone-800 font-bold mb-4 flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-olive-100/50 rounded-lg"><Receipt size={20} className="text-olive-700" /></div>
            Extrato de Consumo
        </h2>

        {(!reservation.consumption || reservation.consumption.length === 0) ? (
            <div className="bg-white rounded-2xl p-10 text-center text-stone-400 shadow-sm border border-stone-100 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                    <Coffee size={32} className="opacity-30" />
                </div>
                <div>
                    <p className="font-bold text-stone-500">Nenhum consumo registrado.</p>
                    <p className="text-xs max-w-[200px] mx-auto mt-1">Peça algo no bar ou restaurante para ver aqui.</p>
                </div>
            </div>
        ) : (
            <div className="space-y-3">
                {reservation.consumption.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center relative overflow-hidden">
                        {/* Status Bar */}
                        {item.status && item.status !== 'Entregue' && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                item.status === 'Pendente' ? 'bg-stone-300' : 
                                item.status === 'Preparando' ? 'bg-blue-500' : 
                                'bg-green-500'
                            }`} />
                        )}

                        <div className="flex items-center gap-4 pl-2">
                            <div className="w-12 h-12 rounded-[14px] bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                                <CategoryIcon category={item.category} />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-800 text-sm">{item.description}</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <p className="text-[10px] text-stone-400 flex items-center gap-1 font-medium">
                                        <Clock size={10} />
                                        {new Date(item.date).toLocaleDateString()}
                                    </p>
                                    {item.status && (
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                            item.status === 'Pendente' ? 'bg-stone-100 text-stone-500' :
                                            item.status === 'Preparando' ? 'bg-blue-100 text-blue-600' :
                                            item.status === 'Pronto' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-50 text-gray-400'
                                        }`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-stone-800 text-sm">
                                {formattedConsumption(item.value * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                                <p className="text-[10px] text-stone-400 font-medium">{item.quantity}x {formattedConsumption(item.value)}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="px-4 mt-8 mb-4">
        <div className="bg-olive-50 rounded-2xl p-5 flex items-start gap-3 border border-olive-100/50">
            <HelpCircle size={20} className="text-olive-700 shrink-0 mt-0.5" />
            <div>
                <h4 className="text-olive-900 font-bold text-sm mb-1">Dúvidas sobre a conta?</h4>
                <p className="text-olive-800/70 text-xs leading-relaxed">
                    Caso encontre alguma divergência, entre em contato com a recepção ou fale com nosso gerente de plantão.
                </p>
            </div>
        </div>
      </div>
      
      <div className="text-center mt-8 pb-4 opacity-50">
          <p className="text-[10px] text-stone-400 font-medium">Resort das Oliveiras © 2024</p>
      </div>


      {/* MODAL DE PEDIDOS - Responsive Fix */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:max-w-md h-[90dvh] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                
                {/* Header Modal */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                    <div>
                        <h3 className="font-serif font-bold text-gray-800 text-xl tracking-tight">Menu de Serviços</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Entrega no Quarto (Room Service)</p>
                    </div>
                    <button 
                        onClick={() => setShowOrderModal(false)}
                        className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500"/>
                    </button>
                </div>
                
                {/* Category Selector */}
                <div className="bg-white p-2 flex gap-2 overflow-x-auto px-6 pb-2 shrink-0 border-b border-dashed border-gray-100">
                    {['Restaurante', 'Bar'].map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat as any)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                selectedCategory === cat 
                                ? 'bg-olive-600 text-white shadow-lg shadow-olive-600/30 ring-2 ring-olive-600 ring-offset-2' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {cat === 'Restaurante' ? 'Restaurante 🍽️' : 'Bar & Bebidas 🍹'}
                        </button>
                    ))}
                </div>

                {/* Products List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 pb-10">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Utensils size={32} className="opacity-20"/>
                            </div>
                            <p className="font-medium">Nenhum item disponível.</p>
                            <p className="text-xs">Tente outra categoria ou horário.</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.id} className="flex flex-col gap-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <div className="flex p-3 gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                                        <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                    <div className="flex-1 py-1 flex flex-col justify-between">
                                        <div>
                                            <div className="font-bold text-gray-800 text-lg leading-tight">{product.name}</div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{product.description || 'Sem descrição.'}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-olive-700 font-black text-lg">R$ {product.price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if(onMakeOrder) {
                                            onMakeOrder({
                                                productId: product.id,
                                                description: product.name,
                                                value: product.price,
                                                quantity: 1,
                                                category: product.category,
                                                date: new Date().toISOString()
                                            });
                                            alert("Pedido enviado para a cozinha com sucesso!");
                                            setShowOrderModal(false);
                                        }
                                    }}
                                    className="mx-3 mb-3 py-3 bg-stone-50 text-stone-600 text-sm font-bold rounded-xl hover:bg-olive-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-98"
                                >
                                    Fazer Pedido <Check size={16} />
                                </button>
                            </div>
                        ))
                    )
                }
            </div>
            {/* Safe Area Padding */}
            <div className="h-6 bg-stone-50 shrink-0 sm:hidden"></div>
        </div>
    </div>
  )}
    </div>
  );
};
