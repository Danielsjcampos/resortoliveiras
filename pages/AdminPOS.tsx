import React, { useState } from 'react';
import { Product, ProductCategory, Reservation, ConsumptionItem } from '../types';
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, User, CheckCircle } from 'lucide-react';

interface AdminPOSProps {
  products: Product[];
  reservations: Reservation[];
  onAddConsumption: (reservationId: string, item: Omit<ConsumptionItem, 'id'>) => void;
}

interface CartItem extends Product {
  quantity: number;
}

export const AdminPOS: React.FC<AdminPOSProps> = ({ products, reservations, onAddConsumption }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  // Filter Active Reservations (Check-in status only)
  const activeReservations = reservations.filter(r => r.status === 'Check-in');

  const categories: (ProductCategory | 'ALL')[] = ['ALL', 'Restaurante', 'Bar', 'Frigobar', 'Serviços', 'Passeios'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && p.available;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleFinalizeOrder = () => {
    if (!selectedReservationId) {
      alert('Selecione uma reserva/mesa para lançar o pedido.');
      return;
    }
    
    cart.forEach(item => {
      onAddConsumption(selectedReservationId, {
        productId: item.id,
        description: item.name,
        value: item.price,
        quantity: item.quantity,
        category: item.category,
        date: new Date().toISOString()
      });
    });

    setCart([]);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* Left Column: Product Grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
           <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-olive-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
               >
                 {cat === 'ALL' ? 'Todos' : cat}
               </button>
             ))}
           </div>
           <div className="relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
               className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-olive-500 outline-none" 
               placeholder="Buscar item..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition text-left flex flex-col h-full group active:scale-95"
            >
              <div className="h-32 w-full relative bg-gray-100">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
              </div>
              <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                   <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{product.name}</h4>
                   <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="mt-2 text-olive-700 font-bold">R$ {product.price.toFixed(2)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Cart / Ticket */}
      <div className="w-96 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full overflow-hidden">
        
        {/* Reservation Selector */}
        <div className="p-4 bg-olive-900 text-white">
          <label className="text-xs font-bold uppercase opacity-80 mb-1 block">Cliente / Quarto</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <select 
              className="w-full pl-9 pr-4 py-2 rounded text-gray-900 text-sm font-bold focus:outline-none"
              value={selectedReservationId}
              onChange={e => setSelectedReservationId(e.target.value)}
            >
              <option value="">Selecione uma conta...</option>
              {activeReservations.length === 0 ? (
                 <option disabled>Sem check-ins ativos</option>
              ) : (
                activeReservations.map(res => (
                  <option key={res.id} value={res.id}>{res.guestName} (Quarto {res.roomId})</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
              <ShoppingCart size={48} />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500">R$ {item.price.toFixed(2)} un</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white border rounded hover:bg-gray-100"><Minus size={12} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white border rounded hover:bg-gray-100"><Plus size={12} /></button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-gray-600 font-medium">Total do Pedido</span>
            <span className="text-2xl font-bold text-gray-900">R$ {cartTotal.toFixed(2)}</span>
          </div>

          {successMsg ? (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle size={20} /> Pedido Lançado!
            </div>
          ) : (
            <button 
              onClick={handleFinalizeOrder}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2
                ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-olive-600 hover:bg-olive-700 hover:scale-[1.02]'}
              `}
            >
              <CreditCard size={20} /> Lançar na Conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};