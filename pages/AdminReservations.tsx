import React, { useState, useMemo, useEffect } from 'react';
import { Reservation, Lead, Room, RoomStatus, ConsumptionItem, Product, SystemSettings, Client } from '../types';
import { 
  Calendar, Search, LogIn, LogOut, Plus, User, 
  CreditCard, Martini, Trash2, X, Printer, 
  CheckCircle, Receipt, ShoppingBag, ArrowRight,
  ChevronDown, DollarSign, Minus, RefreshCcw, Loader2, Edit, Save, Trash, UserPlus, Users
} from 'lucide-react';

interface AdminReservationsProps {
  reservations: Reservation[];
  leads: Lead[];
  rooms: Room[];
  products: Product[];
  clients?: Client[];
  onCreateReservation: (data: Partial<Reservation>) => void;
  onUpdateStatus: (id: string, status: Reservation['status'], extraData?: Partial<Reservation>) => void;
  onAddConsumption?: (reservationId: string, item: Omit<ConsumptionItem, 'id'>) => void;
  onUpdateReservation?: (data: Reservation) => void;
  onDeleteReservation?: (id: string) => void;
  onAddClient?: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onCheckout?: (reservation: Reservation, paymentMethod: string, total: number) => void;
  settings?: SystemSettings;
}

const NewReservationModal = ({ rooms, reservations, clients = [], onAddClient, onClose, onCreate }: { 
    rooms: Room[], 
    reservations: Reservation[], 
    clients?: Client[],
    onAddClient?: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void> | void,
    onClose: () => void, 
    onCreate: (data: Partial<Reservation>) => void 
}) => {
    const [step, setStep] = useState(1);
    
    // Step 1: Client
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '', cpf: '', address: '' });

    // Step 2: Details
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [childrenAges, setChildrenAges] = useState<number[]>([]);

    // Step 3: Room
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedQuickClient, setSelectedQuickClient] = useState<string | null>(null);

  // Check for URL params for Quick Action from Clients
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
        const query = hash.split('?')[1];
        const params = new URLSearchParams(query);
        const clientId = params.get('clientId');
        if (clientId && clients) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                setSearchTerm(client.name);
                setSelectedQuickClient(clientId);
                // Optionally auto-open new reservation modal if desired, but filtering map/reservations might be enough first
                // For now, let's just highlight that we are focused on this client
            }
        }
    }
  }, [clients]);

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.cpf?.includes(searchTerm)
    );

    const handleCreateClient = () => {
        if(onAddClient && newClientData.name) {
            // Optimistic Client Creation for UI flow
            const tempClient = { 
                ...newClientData, 
                id: `c-temp-${Date.now()}`, 
                createdAt: new Date().toISOString() 
            } as Client;
            
            // In a real scenario, we should await the server response to get the real ID. 
            // Here we assume onAddClient will handle persistence.
            onAddClient(newClientData); 
            setSelectedClient(tempClient);
            setIsCreatingClient(false);
            setStep(2);
        }
    };

    const handleUpdateChildAge = (index: number, age: number) => {
        const newAges = [...childrenAges];
        newAges[index] = age;
        setChildrenAges(newAges);
    };

    useEffect(() => {
        // Adjust array size when children count changes
        if(childrenAges.length !== children) {
            setChildrenAges(new Array(children).fill(0).map((_, i) => childrenAges[i] || 0));
        }
    }, [children]);

    const availableRooms = useMemo(() => {
        if (!checkIn || !checkOut) return [];
        const start = new Date(checkIn).getTime();
        const end = new Date(checkOut).getTime();
        const CLEANING_BUFFER = 60 * 60 * 1000; // 1 Hour
        const totalGuests = adults + children;
        
        return rooms.filter(room => {
             // 1. Capacity check
             if (room.capacity < totalGuests) return false;

             // 2. Date conflict check (with Cleaning Buffer)
             const hasConflict = reservations.some(res => {
                 if (res.roomId !== room.id) return false;
                 if (res.status === 'Cancelado' || res.status === 'Check-out') return false; 
                 
                 const resStart = new Date(res.checkIn).getTime();
                 const resEnd = new Date(res.checkOut).getTime();
                 
                 // Existing reservation blocks the room from [Start] to [End + Buffer]
                 // New reservation wants [Start, End]
                 // Conflict if NewStart < (ResEnd + Buffer) AND NewEnd > ResStart
                 return (start < (resEnd + CLEANING_BUFFER)) && (end > resStart);
             });

             return !hasConflict;
        });
    }, [checkIn, checkOut, rooms, reservations, adults, children]);

    const calculateTotal = (room: Room) => {
        if (!checkIn || !checkOut) return 0;
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return Math.max(1, days) * room.price;
    };

    const handleConfirm = () => {
        if (selectedRoom && selectedClient) {
            onCreate({
                id: Date.now().toString(),
                guestName: selectedClient.name, // Fallback display name
                clientId: selectedClient.id.startsWith('c-temp') ? undefined : selectedClient.id, // Only link if real ID (handled by prop update usually)
                roomId: selectedRoom.id,
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                guestsDetails: {
                    adults,
                    children,
                    childrenAges
                },
                status: 'Confirmado',
                totalAmount: calculateTotal(selectedRoom),
                consumption: [],
                accessCode: Math.floor(100000 + Math.random() * 900000).toString()
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                    <div>
                        <h2 className="text-xl font-bold text-stone-800">Nova Reserva</h2>
                        <div className="flex gap-2 text-xs font-bold uppercase tracking-wider mt-1">
                            <span className={step >= 1 ? "text-olive-600" : "text-gray-300"}>1. Cliente</span>
                            <span className="text-gray-300">/</span>
                            <span className={step >= 2 ? "text-olive-600" : "text-gray-300"}>2. Detalhes</span>
                            <span className="text-gray-300">/</span>
                            <span className={step >= 3 ? "text-olive-600" : "text-gray-300"}>3. Quarto</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 relative">
                    {/* STEP 1: CLIENTE */}
                    {step === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">Quem será o titular da reserva?</h3>
                            
                            {!isCreatingClient ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            autoFocus
                                            className="w-full pl-12 pr-4 py-4 text-lg border rounded-2xl shadow-sm focus:ring-2 ring-olive-500 outline-none"
                                            placeholder="Buscar por nome, CPF ou email..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="max-h-60 overflow-y-auto border rounded-2xl divide-y">
                                        {filteredClients.map(client => (
                                            <div 
                                                key={client.id} 
                                                onClick={() => { setSelectedClient(client); setStep(2); }}
                                                className="p-4 hover:bg-olive-50 cursor-pointer flex justify-between items-center transition"
                                            >
                                                <div>
                                                    <div className="font-bold text-gray-800">{client.name}</div>
                                                    <div className="text-xs text-gray-500">{client.email} • {client.cpf}</div>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300" />
                                            </div>
                                        ))}
                                        {filteredClients.length === 0 && searchTerm && (
                                            <div className="p-4 text-center text-gray-400 italic">Nenhum cliente encontrado.</div>
                                        )}
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <button onClick={() => setIsCreatingClient(true)} className="flex items-center gap-2 text-olive-600 font-bold hover:bg-olive-50 px-4 py-2 rounded-xl transition">
                                            <UserPlus size={20} /> Cadastrar Novo Cliente
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-2xl border space-y-4 animate-fade-in-up">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-700">Novo Cadastro</h4>
                                        <button onClick={() => setIsCreatingClient(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Voltar à busca</button>
                                    </div>
                                    <input className="w-full p-3 rounded-xl border" placeholder="Nome Completo *" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="w-full p-3 rounded-xl border" placeholder="Email" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} />
                                        <input className="w-full p-3 rounded-xl border" placeholder="Telefone" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} />
                                    </div>
                                    <input className="w-full p-3 rounded-xl border" placeholder="CPF" value={newClientData.cpf} onChange={e => setNewClientData({...newClientData, cpf: e.target.value})} />
                                    <button 
                                        onClick={handleCreateClient}
                                        disabled={!newClientData.name}
                                        className="w-full py-3 bg-olive-600 text-white font-bold rounded-xl hover:bg-olive-700 transition disabled:opacity-50"
                                    >
                                        Salvar & Continuar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: DETALHES */}
                    {step === 2 && (
                        <div className="max-w-2xl mx-auto space-y-8">
                             <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-800">Detalhes da Estadia</h3>
                                {selectedClient && <p className="text-olive-600 font-bold mt-1">{selectedClient.name}</p>}
                             </div>

                             <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Check-in (Dia e Hora)</label>
                                    <input type="datetime-local" className="w-full p-3 border rounded-xl bg-white outline-none" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Check-out (Dia e Hora)</label>
                                    <input type="datetime-local" className="w-full p-3 border rounded-xl bg-white outline-none" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                                </div>
                             </div>

                             <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <User size={24} className="text-gray-400"/>
                                        <div>
                                            <div className="font-bold text-gray-800">Adultos</div>
                                            <div className="text-xs text-gray-500">13 anos ou mais</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 hover:bg-gray-100 rounded-lg"><Minus size={16}/></button>
                                        <span className="font-bold text-xl">{adults}</span>
                                        <button onClick={() => setAdults(adults + 1)} className="p-2 hover:bg-gray-100 rounded-lg"><Plus size={16}/></button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-4 border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Users size={24} className="text-gray-400"/>
                                        <div>
                                            <div className="font-bold text-gray-800">Crianças</div>
                                            <div className="text-xs text-gray-500">Até 12 anos</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 hover:bg-gray-100 rounded-lg"><Minus size={16}/></button>
                                        <span className="font-bold text-xl">{children}</span>
                                        <button onClick={() => setChildren(children + 1)} className="p-2 hover:bg-gray-100 rounded-lg"><Plus size={16}/></button>
                                    </div>
                                </div>

                                {children > 0 && (
                                    <div className="bg-olive-50 p-4 rounded-xl border border-olive-100 animate-fade-in">
                                        <label className="text-xs font-bold text-olive-700 uppercase mb-2 block">Idade das Crianças</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {childrenAges.map((age, i) => (
                                                <div key={i} className="flex flex-col">
                                                    <span className="text-[10px] text-olive-600 mb-1">Criança {i+1}</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-16 p-2 rounded-lg border border-olive-200 text-center font-bold outline-none focus:ring-1 ring-olive-500" 
                                                        value={age} 
                                                        onChange={e => handleUpdateChildAge(i, parseInt(e.target.value))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {/* STEP 3: QUARTO */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-800">Quartos Disponíveis</h3>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {adults} Adultos, {children} Crianças • {new Date(checkIn).toLocaleString('pt-BR')} a {new Date(checkOut).toLocaleString('pt-BR')}
                                </div>
                            </div>

                            {availableRooms.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <Calendar size={48} className="mx-auto mb-4 opacity-20"/>
                                    <p className="font-medium">Nenhum quarto disponível encontrado.</p>
                                    <p className="text-sm">Tente alterar as datas ou quantidade de hóspedes.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableRooms.map(room => (
                                        <div 
                                            key={room.id} 
                                            onClick={() => setSelectedRoom(room)}
                                            className={`border rounded-2xl p-4 cursor-pointer transition flex justify-between items-center group ${selectedRoom?.id === room.id ? 'border-olive-500 bg-olive-50 ring-1 ring-olive-500' : 'border-gray-200 hover:border-olive-300 hover:shadow-md'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {room.images && room.images[0] ? (
                                                    <img src={room.images[0]} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt={room.name} />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300"><User size={24}/></div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{room.name}</h4>
                                                    <p className="text-xs text-gray-500">{room.type} • Cap: {room.capacity}</p>
                                                    {room.status === RoomStatus.CLEANING && <span className="text-[10px] text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded font-bold">Limpeza (Check)</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-400">Total Previsto</div>
                                                <div className="text-xl font-bold text-olive-700">R$ {calculateTotal(room).toLocaleString('pt-BR')}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-stone-50 flex justify-between">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Voltar</button>
                    ) : (
                        <button onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">Cancelar</button>
                    )}

                    {step === 1 && (
                         <button 
                            disabled={!selectedClient} 
                            onClick={() => setStep(2)} 
                            className="px-8 py-3 bg-olive-600 text-white font-bold rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Próximo <ArrowRight size={18}/>
                        </button>
                    )}
                    {step === 2 && (
                        <button 
                            disabled={!checkIn || !checkOut} 
                            onClick={() => setStep(3)} 
                            className="px-8 py-3 bg-olive-600 text-white font-bold rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Buscar Quartos <ArrowRight size={18}/>
                        </button>
                    )}
                    {step === 3 && (
                        <button 
                            disabled={!selectedRoom} 
                            onClick={handleConfirm} 
                            className="px-8 py-3 bg-olive-600 text-white font-bold rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle size={18}/> Confirmar Reserva
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AdminReservations: React.FC<AdminReservationsProps> = ({ 
  reservations, 
  leads, 
  rooms, 
  products,
  clients = [],
  onCreateReservation,
  onUpdateStatus,
  onAddConsumption,
  onUpdateReservation,
  onDeleteReservation,
  onAddClient,
  onCheckout,
  settings
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [selectedResForConsumption, setSelectedResForConsumption] = useState<Reservation | null>(null);
  const [selectedResForCheckout, setSelectedResForCheckout] = useState<Reservation | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'REVIEW' | 'PAYMENT' | 'PROCESSING' | 'RECEIPT'>('REVIEW');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');

  const [consumptionSearch, setConsumptionSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [consQuantity, setConsQuantity] = useState(1);
  const [showCode, setShowCode] = useState<string | null>(null);

  // Edit State
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);

  const getDays = (start: string, end: string) => {
    if(!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const calculateRoomTotal = (res: Reservation) => {
    const room = rooms.find(r => r.id === res.roomId);
    const days = getDays(res.checkIn, res.checkOut);
    return days * (room?.price || 0);
  };

  const calculateConsumptionTotal = (res: Reservation) => {
    return (res.consumption || []).reduce((sum, item) => sum + (item.value * item.quantity), 0);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(consumptionSearch.toLowerCase()) && p.available
  );

  const handleCheckIn = (res: Reservation) => {
    // Gerar código único de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    onUpdateStatus(res.id, 'Check-in', { accessCode: code });
    setShowCode(code);
    alert(`Check-in realizado! Código de Acesso do Hóspede: ${code}`);
  };

  const handleAddConsumptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedResForConsumption && selectedProduct && onAddConsumption) {
       onAddConsumption(selectedResForConsumption.id, {
           productId: selectedProduct.id,
           description: selectedProduct.name,
           value: selectedProduct.price,
           quantity: consQuantity,
           category: selectedProduct.category,
           date: new Date().toISOString()
       });
       setSelectedProduct(null);
       setConsumptionSearch('');
       setConsQuantity(1);
    }
  };

  const handleSaveEdit = () => {
    if(editingRes && onUpdateReservation) {
        onUpdateReservation(editingRes);
        setEditingRes(null);
    }
  };

  const handleDeleteClick = (id: string) => {
      if(window.confirm("Tem certeza que deseja excluir esta reserva permanentemente?") && onDeleteReservation) {
          onDeleteReservation(id);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle de Reservas</h2>
          <p className="text-gray-500 text-sm">Gestão de estadias e faturamento operacional.</p>
        </div>
        <button onClick={() => setShowNewForm(!showNewForm)} className="flex items-center gap-2 bg-olive-600 text-white px-5 py-2.5 rounded-2xl hover:bg-olive-700 transition shadow-lg font-bold">
          <Plus size={18} /> Nova Reserva
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden print:hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-[10px] uppercase text-stone-400 font-black tracking-widest">
            <tr>
              <th className="p-6">Hóspede</th>
              <th className="p-6">Acomodação</th>
              <th className="p-6">Entrada</th>
              <th className="p-6">Saída</th>
              <th className="p-6 text-center">Hósp.</th>
              <th className="p-6 text-right">Total</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {reservations.map(res => {
              const grandTotal = calculateRoomTotal(res) + calculateConsumptionTotal(res);
              const guestsCount = (res.guestsDetails?.adults || 0) + (res.guestsDetails?.children || 0) || 1;
              
              return (
                <tr key={res.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-6">
                    <div className="font-bold text-stone-800">{res.guestName}</div>
                    {res.status === 'Check-in' && res.accessCode && (
                        <div className="text-[10px] text-olive-600 flex items-center gap-1 mt-1 font-mono bg-olive-50 w-fit px-1.5 py-0.5 rounded">
                            <span className="font-bold">CODE:</span> {res.accessCode}
                        </div>
                    )}
                  </td>
                  <td className="p-6 text-stone-600 font-medium text-sm">{rooms.find(r => r.id === res.roomId)?.name}</td>
                  <td className="p-6 text-stone-500 font-bold text-xs">
                      {new Date(res.checkIn).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-6 text-stone-500 font-bold text-xs">
                      {new Date(res.checkOut).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-6 text-center text-stone-600 font-bold text-sm">
                      <div className="flex items-center justify-center gap-1">
                          <User size={14} className="text-stone-400" /> {guestsCount}
                      </div>
                  </td>
                  <td className="p-6 font-black text-stone-900 text-right">R$ {grandTotal.toLocaleString('pt-BR')}</td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${res.status === 'Check-in' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-stone-100 text-stone-400'}`}>{res.status}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {res.status === 'Confirmado' && (
                        <button onClick={() => handleCheckIn(res)} className="px-3 py-1.5 bg-olive-600 text-white text-[10px] font-bold rounded-lg hover:bg-olive-700 transition flex items-center gap-1">
                            CHECK-IN
                        </button>
                      )}

                      {res.status === 'Pendente' && (
                        <button onClick={() => {
                            if(window.confirm('Confirmar esta reserva e bloquear a data?')) {
                                onUpdateStatus(res.id, 'Confirmado');
                            }
                        }} className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-1 shadow-lg shadow-green-200">
                            <CheckCircle size={12}/> ACEITAR
                        </button>
                      )}
                      
                      {res.status === 'Check-in' && (
                        <>
                           <button onClick={() => { setSelectedResForConsumption(res); setShowConsumptionModal(true); }} className="px-3 py-1.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-lg hover:bg-stone-200 transition flex items-center gap-1">
                                <ShoppingBag size={12}/> VER COMANDA
                           </button>
                           <button onClick={() => { setSelectedResForCheckout(res); setCheckoutStep('REVIEW'); }} className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition">CHECK-OUT</button>
                        </>
                      )}
                      
                      {res.status === 'Check-out' && (
                        <button onClick={() => { setSelectedResForCheckout(res); setCheckoutStep('RECEIPT'); }} className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"><Receipt size={14} /></button>
                      )}

                       <button onClick={() => setEditingRes(res)} className="p-2 text-stone-400 hover:text-olive-600 rounded-lg transition"><Edit size={14}/></button>
                       <button onClick={() => handleDeleteClick(res.id)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL COMANDA (LEITURA) */}
      {showConsumptionModal && selectedResForConsumption && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                        <h3 className="font-bold text-gray-800">Comanda do Hóspede</h3>
                        <p className="text-xs text-gray-400">{selectedResForConsumption.guestName}</p>
                    </div>
                    <button onClick={() => setShowConsumptionModal(false)}><X size={20} className="text-gray-400"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {(selectedResForConsumption.consumption || []).length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">Nenhum consumo registrado.</div>
                    ) : (
                        <div className="space-y-3">
                            {(selectedResForConsumption.consumption || []).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                                    <div>
                                        <div className="font-bold text-gray-700">{item.description}</div>
                                        <div className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()} • {item.category}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-olive-600">R$ {(item.value * item.quantity).toFixed(2)}</div>
                                        <div className="text-xs text-gray-400">Qtd: {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between items-center text-lg font-black text-gray-800">
                                <span>Total</span>
                                <span>R$ {calculateConsumptionTotal(selectedResForConsumption).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                     <button onClick={() => setShowConsumptionModal(false)} className="w-full py-3 bg-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-300 transition">Fechar</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL CHECK-OUT (FLUXO COMPLETO) */}
      {selectedResForCheckout && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 print:p-4">
                    <div id="bill-print-area" className="space-y-6">
                        {/* Cabeçalho do Recibo */}
                        <div className="text-center border-b-2 border-stone-900 pb-6 mb-8">
                             <h2 className="text-2xl font-serif font-black uppercase">{settings?.resortName || 'Resort Oliveiras'}</h2>
                             <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mt-1">{settings?.resortAddress || 'Rua Principal, 1000'}</p>
                             <p className="text-[10px] font-black text-stone-900 mt-1">CNPJ: {settings?.resortCnpj || '00.000.000/0001-00'}</p>
                             {checkoutStep === 'RECEIPT' && <div className="mt-4 px-4 py-1 bg-stone-900 text-white rounded-full text-[10px] uppercase font-bold inline-block">Recibo Pagamento</div>}
                             {checkoutStep === 'REVIEW' && <div className="mt-4 px-4 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] uppercase font-bold inline-block">Conferência de Conta</div>}
                        </div>

                        <div className="flex justify-between text-sm">
                            <div>
                                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Hóspede</h4>
                                <p className="font-bold text-stone-800">{selectedResForCheckout.guestName}</p>
                                <p className="text-xs text-stone-500">
                                    {clients.find(c => c.id === selectedResForCheckout.clientId)?.cpf || 'CPF não informado'}
                                </p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Estadia</h4>
                                <p className="font-bold text-stone-800">{rooms.find(r => r.id === selectedResForCheckout.roomId)?.name}</p>
                                <p className="text-xs text-stone-500">{getDays(selectedResForCheckout.checkIn, selectedResForCheckout.checkOut)} diárias</p>
                            </div>
                        </div>

                        {/* Detalhamento */}
                        <div className="border rounded-2xl p-6 space-y-4 text-sm">
                            <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                                <span>Diárias ({getDays(selectedResForCheckout.checkIn, selectedResForCheckout.checkOut)})</span>
                                <span className="font-bold">R$ {calculateRoomTotal(selectedResForCheckout).toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase font-bold text-stone-400">Consumo Extra</div>
                                {(selectedResForCheckout.consumption || []).length === 0 ? (
                                    <p className="text-xs italic text-gray-300">Nenhum consumo.</p>
                                ) : (
                                    (selectedResForCheckout.consumption || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <span>{item.quantity}x {item.description}</span>
                                            <span>R$ {(item.value * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-stone-50 p-6 rounded-[32px] border border-stone-100 space-y-4">
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-sm font-black text-stone-900 uppercase">Total Geral</span>
                                <span className="text-3xl font-black text-olive-700">R$ {(calculateRoomTotal(selectedResForCheckout) + calculateConsumptionTotal(selectedResForCheckout)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            {(checkoutStep === 'PAYMENT' || checkoutStep === 'RECEIPT') && (
                                <div className="pt-4 border-t border-stone-200">
                                     <div className="text-xs font-bold text-stone-500 uppercase mb-1">Método de Pagamento</div>
                                     {checkoutStep === 'RECEIPT' ? (
                                         <div className="font-black text-stone-800">{paymentMethod}</div>
                                     ) : (
                                        <select 
                                            className="w-full p-3 rounded-xl border bg-white font-bold text-stone-800 outline-none focus:ring-2 ring-olive-500"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option>Cartão de Crédito</option>
                                            <option>Cartão de Débito</option>
                                            <option>Dinheiro / Espécie</option>
                                            <option>PIX</option>
                                            <option>Voucher / Convênio</option>
                                        </select>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 print:hidden flex-wrap">
                        {checkoutStep === 'REVIEW' && selectedResForCheckout.status !== 'Check-out' && (
                             <>
                                <button onClick={() => window.print()} className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200">
                                    <Printer size={18} /> Imprimir Conferência
                                </button>
                                <button 
                                    onClick={() => setCheckoutStep('PAYMENT')}
                                    className="flex-1 py-4 bg-olive-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-olive-700 transition shadow-lg shadow-olive-200"
                                >
                                    Ir para Pagamento <ArrowRight size={18} />
                                </button>
                             </>
                        )}
                        
                        {checkoutStep === 'PAYMENT' && (
                            <>
                                <button onClick={() => setCheckoutStep('REVIEW')} className="px-6 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold">Voltar</button>
                                <button 
                                    onClick={() => {
                                        if(window.confirm(`Confirmar pagamento de R$ ${(calculateRoomTotal(selectedResForCheckout) + calculateConsumptionTotal(selectedResForCheckout)).toFixed(2)} via ${paymentMethod}?`)) {
                                            onUpdateStatus(selectedResForCheckout.id, 'Check-out');
                                            
                                            // Call the new onCheckout prop if available to register transaction
                                            if(onCheckout) {
                                                onCheckout(
                                                    selectedResForCheckout, 
                                                    paymentMethod, 
                                                    calculateRoomTotal(selectedResForCheckout) + calculateConsumptionTotal(selectedResForCheckout)
                                                );
                                            }

                                            setSelectedResForCheckout({ ...selectedResForCheckout, status: 'Check-out' });
                                            setCheckoutStep('RECEIPT');
                                        }
                                    }}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 animate-pulse-slow"
                                >
                                    <CheckCircle size={18} /> Confirmar Pagamento & Check-out
                                </button>
                            </>
                        )}

                        {checkoutStep === 'RECEIPT' && (
                             <>
                                <button onClick={() => window.print()} className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition">
                                    <Printer size={18} /> Imprimir Recibo Fiscal
                                </button>
                             </>
                        )}

                        <button onClick={() => setSelectedResForCheckout(null)} className="px-6 py-4 bg-stone-50 text-stone-400 hover:text-stone-600 rounded-2xl font-bold transition">Fechar</button>
                    </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL EDITAR RESERVA */}
      {editingRes && (
          <div className="fixed inset-0 bg-stone-900/50 z-[120] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Edit size={20} className="text-olive-600"/> Editar Reserva</h3>
                      <button onClick={() => setEditingRes(null)}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Nome do Hóspede</label>
                          <input className="w-full border rounded-lg p-2 font-semibold" value={editingRes.guestName} onChange={e => setEditingRes({...editingRes, guestName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Check-in (Data/Hora)</label>
                              <input type="datetime-local" className="w-full border rounded-lg p-2" value={editingRes.checkIn.slice(0, 16)} onChange={e => setEditingRes({...editingRes, checkIn: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Check-out (Data/Hora)</label>
                              <input type="datetime-local" className="w-full border rounded-lg p-2" value={editingRes.checkOut.slice(0, 16)} onChange={e => setEditingRes({...editingRes, checkOut: e.target.value})} />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Telefone / Contato</label>
                              <input className="w-full border rounded-lg p-2" value={editingRes.guestContact || ''} onChange={e => setEditingRes({...editingRes, guestContact: e.target.value})} placeholder="+55..." />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                              <input className="w-full border rounded-lg p-2" value={editingRes.guestEmail || ''} onChange={e => setEditingRes({...editingRes, guestEmail: e.target.value})} placeholder="email@exemplo.com" />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Acomodação (ID)</label>
                          <select className="w-full border rounded-lg p-2" value={editingRes.roomId} onChange={e => setEditingRes({...editingRes, roomId: e.target.value})}>
                              {rooms.map(r => (
                                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                          <select className="w-full border rounded-lg p-2" value={editingRes.status} onChange={e => setEditingRes({...editingRes, status: e.target.value as any})}>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Check-in">Check-in</option>
                              <option value="Check-out">Check-out</option>
                              <option value="Cancelado">Cancelado</option>
                          </select>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                          <button onClick={() => setEditingRes(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                          <button onClick={handleSaveEdit} className="px-6 py-2 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700 shadow-md flex items-center gap-2"><Save size={18}/> Salvar</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL NOVA RESERVA */}
      {showNewForm && (
        <NewReservationModal 
           rooms={rooms} 
           reservations={reservations} 
           clients={clients}
           onAddClient={onAddClient}
           onClose={() => setShowNewForm(false)} 
           onCreate={onCreateReservation}
        />
      )}

      <style>{`
        @media print {
            body * { visibility: hidden; }
            #bill-print-area, #bill-print-area * { visibility: visible; }
            #bill-print-area { position: fixed; left: 0; top: 0; width: 100%; padding: 40px; background: white !important; }
            .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};
