
import React, { useState } from 'react';
import { Product, ProductCategory, Reservation, ConsumptionItem } from '../types';
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, User, CheckCircle, Hash, History, Edit2, X, Save } from 'lucide-react';

interface AdminPOSProps {
  products: Product[];
  reservations: Reservation[];
  onAddConsumption: (reservationId: string, item: Omit<ConsumptionItem, 'id'>) => void;
  onRemoveConsumption: (reservationId: string, itemId: string) => void;
  onUpdateConsumptionItem: (reservationId: string, itemId: string, updates: Partial<ConsumptionItem>) => void;
  onDirectSale?: (items: CartItem[], paymentMethod: string, customerName: string) => void;
}

interface CartItem extends Product {
  quantity: number;
}

export const AdminPOS: React.FC<AdminPOSProps> = ({ products, reservations, onAddConsumption, onRemoveConsumption, onUpdateConsumptionItem, onDirectSale }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  // --- DIRECT SALE STATE ---
  const [posMode, setPosMode] = useState<'ROOM' | 'DIRECT'>('ROOM');
  const [directCustomerName, setDirectCustomerName] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');

  // Filter Active Reservations (Check-in status only)
  const activeReservations = reservations.filter(r => r.status === 'Check-in');

  const selectedReservation = reservations.find(r => r.id === selectedReservationId);

  const categories: (ProductCategory | 'ALL')[] = ['ALL', 'Restaurante', 'Bar', 'Frigobar', 'Serviços', 'Passeios'];

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    
    // Busca Inteligente: Por Nome, Categoria ou CÓDIGO (ID)
    const matchesSearch = 
        p.name.toLowerCase().includes(term) || 
        p.id.toLowerCase() === term || 
        p.category.toLowerCase().includes(term);

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
    if (posMode === 'DIRECT') {
        if (cart.length === 0) return;
        setShowPaymentModal(true);
        return;
    }

    if (!selectedReservationId) {
      alert('Selecione um hóspede/quarto para lançar o pedido.');
      return;
    }
    
    cart.forEach(item => {
      onAddConsumption(selectedReservationId, {
        productId: item.id,
        description: item.name,
        value: item.price,
        quantity: item.quantity,
        category: item.category,
        status: 'Pendente',
        date: new Date().toISOString()
      });
    });

    setCart([]);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const startEditing = (item: ConsumptionItem) => {
      setEditingItemId(item.id);
      setEditQty(item.quantity);
  };

  const saveEdit = (item: ConsumptionItem) => {
      if (editQty <= 0) {
          onRemoveConsumption(selectedReservationId, item.id);
      } else {
          onUpdateConsumptionItem(selectedReservationId, item.id, { quantity: editQty });
      }
      setEditingItemId(null);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 animate-fade-in">
      
      {/* Left Column: Product Grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header Filters */}
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-stone-200 flex flex-col gap-4">
           <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all
                    ${selectedCategory === cat 
                        ? 'bg-olive-600 text-white shadow-lg' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
               >
                 {cat === 'ALL' ? 'Todos os Itens' : cat}
               </button>
             ))}
           </div>
           <div className="relative">
             <Search className="absolute left-4 top-3.5 text-stone-400" size={18} />
             <input 
               className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-olive-500 outline-none text-stone-800 font-medium placeholder:text-stone-300" 
               placeholder="Busque por nome, categoria ou código (ex: p1, p10)..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
             <Hash className="absolute right-4 top-3.5 text-stone-200" size={18} />
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 custom-scrollbar content-start">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col group active:scale-95 aspect-square relative"
            >
              <div className="absolute inset-0 bg-stone-100">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>
              
              <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase border border-white/20">
                  {product.category}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                 <h4 className="font-bold text-white text-sm leading-tight mb-1 shadow-black drop-shadow-md">{product.name}</h4>
                 <div className="flex justify-between items-end">
                    <span className="text-olive-300 font-black text-lg bg-black/40 px-2 rounded backdrop-blur-sm">R$ {product.price.toFixed(2)}</span>
                    <div className="w-8 h-8 rounded-full bg-white text-olive-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Plus size={18} />
                    </div>
                 </div>
              </div>
            </button>
          ))}
          
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-20 text-center text-stone-300">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold italic">Nenhum item encontrado.</p>
             </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart / Ticket */}
      <div className="w-96 bg-white rounded-[40px] shadow-2xl border border-stone-200 flex flex-col h-full overflow-hidden relative">
        
        {/* Reservation Selector */}
        <div className="p-6 bg-olive-900 text-white shadow-xl relative z-20">
          {/* POS MODE TOGGLE */}
          <div className="flex bg-olive-800 p-1 rounded-xl mb-4">
              <button 
                  onClick={() => setPosMode('ROOM')}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${posMode === 'ROOM' ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-300 hover:text-white'}`}
              >
                  Hóspede / Quarto
              </button>
              <button 
                  onClick={() => setPosMode('DIRECT')}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${posMode === 'DIRECT' ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-300 hover:text-white'}`}
              >
                  Venda Direta
              </button>
          </div>

          {posMode === 'ROOM' ? (
              <>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3 block">Lançar para:</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-stone-400" size={18} />
                    <select 
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-stone-800 text-sm font-bold focus:outline-none border-none appearance-none shadow-inner"
                      value={selectedReservationId}
                      onChange={e => setSelectedReservationId(e.target.value)}
                    >
                      <option value="">Selecione um Hóspede Ativo...</option>
                      {activeReservations.length === 0 ? (
                         <option disabled>Nenhum hóspede no hotel agora.</option>
                      ) : (
                        activeReservations.map(res => (
                          <option key={res.id} value={res.id}>{res.guestName} - Q. {res.roomId}</option>
                        ))
                      )}
                    </select>
                  </div>
              </>
          ) : (
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-center">
                  <span className="text-xs font-bold text-olive-100 uppercase tracking-wide block mb-1">Modo Venda Direta</span>
                  <p className="text-[10px] text-olive-300">Itens serão cobrados imediatamente. Não vinculados a reservas.</p>
              </div>
          )}
        </div>

        {/* Tabs */}
        {selectedReservationId && (
            <div className="flex border-b border-stone-100 bg-stone-50">
                <button 
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition ${activeTab === 'cart' ? 'bg-white text-olive-700 border-t-2 border-olive-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <ShoppingCart size={14} /> Novo Pedido ({cart.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition ${activeTab === 'history' ? 'bg-white text-olive-700 border-t-2 border-olive-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <History size={14} /> Histórico ({selectedReservation?.consumption?.length || 0})
                </button>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50 custom-scrollbar relative">
          
          {activeTab === 'cart' ? (
              // CART VIEW
              cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4 opacity-50">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="font-bold text-sm">Carrinho de Compras Vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-stone-100 shadow-sm animate-fade-in-up">
                    <div className="flex-1 pr-2">
                      <div className="text-[11px] font-black text-stone-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-olive-600 font-bold">R$ {item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-stone-100 rounded-lg hover:bg-stone-200 transition"><Minus size={12} /></button>
                      <span className="text-xs font-black w-5 text-center text-stone-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-stone-100 rounded-lg hover:bg-stone-200 transition"><Plus size={12} /></button>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg ml-1 transition"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )
          ) : (
              // HISTORY VIEW
              (!selectedReservation?.consumption || selectedReservation.consumption.length === 0) ? (
                 <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4 opacity-50">
                    <History size={48} strokeWidth={1} />
                    <p className="font-bold text-sm">Nenhum consumo registrado.</p>
                 </div>
              ) : (
                 selectedReservation.consumption.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm animate-fade-in-up group relative">
                        {editingItemId === item.id ? (
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
                                    <button onClick={() => setEditQty(q => Math.max(0, q-1))} className="p-1 text-stone-500 hover:bg-stone-200 rounded"><Minus size={14}/></button>
                                    <span className="font-bold text-sm w-6 text-center">{editQty}</span>
                                    <button onClick={() => setEditQty(q => q+1)} className="p-1 text-stone-500 hover:bg-stone-200 rounded"><Plus size={14}/></button>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditingItemId(null)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg"><X size={16}/></button>
                                    <button onClick={() => saveEdit(item)} className="p-2 bg-olive-600 text-white rounded-lg shadow-lg hover:bg-olive-700"><Save size={16}/></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-black text-stone-800">{item.description}</div>
                                    <div className="text-[10px] text-stone-500">{new Date(item.date).toLocaleDateString()} • {item.category}</div>
                                    <div className="mt-1 text-xs font-bold text-olive-700">
                                        {item.quantity}x R$ {item.value.toFixed(2)} = R$ {(item.quantity * item.value).toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(item)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><Edit2 size={14}/></button>
                                    <button onClick={() => {
                                        if(confirm('Excluir este item do consumo?')) onRemoveConsumption(selectedReservationId, item.id);
                                    }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                 ))
              )
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === 'cart' && (
            <div className="p-8 border-t border-stone-100 bg-white space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Total Geral</span>
                <span className="text-3xl font-black text-stone-900 tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
              </div>

              {successMsg ? (
                <div className="bg-green-500 text-white p-4 rounded-[24px] text-center font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 animate-bounce">
                  <CheckCircle size={20} /> Pedido Lançado com Sucesso!
                </div>
              ) : (
                <button 
                  onClick={handleFinalizeOrder}
                  disabled={cart.length === 0}
                  className={`w-full py-5 rounded-[24px] font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3
                    ${cart.length === 0 
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none' 
                        : 'bg-olive-600 text-white hover:bg-olive-700 hover:scale-[1.03] active:scale-95 shadow-olive-200'}
                  `}
                >
                  <CreditCard size={22} /> Confirmar Pedido
                </button>
              )}
              <p className="text-center text-[9px] text-stone-300 uppercase font-black tracking-[0.2em]">Resort das Oliveiras • PDV v1.0</p>
            </div>
        )}
      </div>
      {/* PAYMENT MODAL (DIRECT SALE) */}
      {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                  <div className="bg-olive-900 p-6 text-white text-center">
                      <h3 className="font-bold text-lg mb-1">Finalizar Venda Direta</h3>
                      <div className="text-3xl font-black">R$ {cartTotal.toFixed(2)}</div>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Nome do Cliente (Opcional)</label>
                          <input 
                              className="w-full border p-3 rounded-xl bg-stone-50 font-bold" 
                              placeholder="Visitante..." 
                              value={directCustomerName} 
                              onChange={e => setDirectCustomerName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Método de Pagamento</label>
                          <div className="grid grid-cols-2 gap-2">
                              {['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito'].map(m => (
                                  <button 
                                      key={m}
                                      onClick={() => setPaymentMethod(m)}
                                      className={`p-3 rounded-xl text-xs font-bold border-2 transition ${paymentMethod === m ? 'border-olive-600 bg-olive-50 text-olive-800' : 'border-stone-100 text-stone-600 hover:border-stone-200'}`}
                                  >
                                      {m}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-50 rounded-xl transition">Cancelar</button>
                          <button 
                              onClick={() => {
                                  if (onDirectSale) {
                                      onDirectSale(cart, paymentMethod, directCustomerName || 'Visitante Anônimo');
                                      setCart([]);
                                      setDirectCustomerName('');
                                      setShowPaymentModal(false);
                                      setSuccessMsg(true);
                                      setTimeout(() => setSuccessMsg(false), 3000);
                                  }
                              }} 
                              className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition"
                          >
                              Confirmar Venda
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
