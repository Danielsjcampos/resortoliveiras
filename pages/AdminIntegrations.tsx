import React, { useState } from 'react';
import { Settings, Globe, Trash2, Check, ExternalLink, RefreshCw, X, Key, Home, Calendar } from 'lucide-react';
import { Reservation, Room } from '../types';

interface AdminIntegrationsProps {
  reservations?: Reservation[];
  rooms?: Room[];
  onImportReservation?: (res: Reservation) => void;
}

interface IntegrationConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: { id: string; name: string; logo: string };
    onConnect: (apiKey: string, propertyId: string) => void;
}

const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({ isOpen, onClose, channel, onConnect }) => {
    const [apiKey, setApiKey] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API check
        setTimeout(() => {
            onConnect(apiKey, propertyId);
            setLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition"><X size={20} /></button>
                
                <div className="flex flex-col items-center mb-6">
                    <img src={channel.logo} className="w-16 h-16 object-contain mb-4" />
                    <h3 className="text-xl font-black text-stone-900">Conectar {channel.name}</h3>
                    <p className="text-sm text-stone-500 text-center mt-2">Insira suas credenciais da API para sincronizar reservas e disponibilidade.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Chave da API (API Key)</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-3 top-3.5 text-stone-400" />
                            <input 
                                type="password" 
                                required
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none transition font-mono text-sm"
                                placeholder={`sk_live_...`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">ID da Propriedade</label>
                        <div className="relative">
                            <Home size={16} className="absolute left-3 top-3.5 text-stone-400" />
                            <input 
                                type="text"
                                required 
                                value={propertyId}
                                onChange={e => setPropertyId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none transition font-mono text-sm"
                                placeholder="ex: 123456" 
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-stone-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-olive-600 transition-all shadow-lg mt-4 flex justify-center items-center gap-2"
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                        {loading ? 'Verificando...' : 'Salvar e Conectar'}
                    </button>
                    
                    <p className="text-[10px] text-center text-stone-400 mt-4 leading-normal">
                        Ao conectar, você concorda em compartilhar dados de disponibilidade com o {channel.name}.
                    </p>
                </form>
            </div>
        </div>
    );
};

export const AdminIntegrations: React.FC<AdminIntegrationsProps> = ({ reservations, rooms, onImportReservation }) => {
  const [channels, setChannels] = useState([
      { id: 'airbnb', name: 'Airbnb', logo: 'https://cdn-icons-png.flaticon.com/512/2111/2111320.png', connected: false, lastSync: null as string | null, roomsMapped: 0 },
      { id: 'booking', name: 'Booking.com', logo: 'https://cdn-icons-png.flaticon.com/512/5977/5977583.png', connected: false, lastSync: null as string | null, roomsMapped: 0 }
  ]);
  
  const [configuringChannel, setConfiguringChannel] = useState<string | null>(null);
  const [syncingChannel, setSyncingChannel] = useState<string | null>(null);

  const handleConnect = (id: string, apiKey: string, propId: string) => {
      setChannels(prev => prev.map(c => c.id === id ? { 
          ...c, 
          connected: true, 
          lastSync: new Date().toISOString(), 
          roomsMapped: rooms?.length || 5 
      } : c));
  };

  const handleDisconnect = (id: string) => {
      if (confirm("Tem certeza? As reservas futuras pararão de sincronizar.")) {
          setChannels(prev => prev.map(c => c.id === id ? { ...c, connected: false, lastSync: null, roomsMapped: 0 } : c));
      }
  };

  const triggerSync = (id: string) => {
      setSyncingChannel(id);
      
      // Simulate finding new reservations
      setTimeout(() => {
          if (onImportReservation && rooms && rooms.length > 0) {
              const channel = channels.find(c => c.id === id);
              
              // Create a mock reservation
              const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
              const checkIn = new Date();
              checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));
              const checkOut = new Date(checkIn);
              checkOut.setDate(checkOut.getDate() + 3);
              
              const newRes: Reservation = {
                  id: `res-${id}-${Date.now()}`,
                  guestName: id === 'airbnb' ? 'Hóspede Airbnb (Simulado)' : 'Hóspede Booking (Simulado)',
                  roomId: randomRoom.id,
                  checkIn: checkIn.toISOString(),
                  checkOut: checkOut.toISOString(),
                  status: 'Confirmado',
                  totalAmount: 1500,
                  consumption: [],
                  guestsDetails: { adults: 2, children: 0 }
              };
              
              onImportReservation(newRes);
              alert(`${channel?.name}: 1 nova reserva encontrada e sincronizada!`);
          }
          
          setChannels(prev => prev.map(c => c.id === id ? { ...c, lastSync: new Date().toISOString() } : c));
          setSyncingChannel(null);
      }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-900 flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-white rounded-2xl shadow-lg"><Globe size={28}/></div> 
            Canais & Integrações
          </h2>
          <p className="text-stone-500 mt-1 font-medium">Gerencie conexões com OTAs (Airbnb, Booking) e sincronize calendários.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => (
              <div key={channel.id} className="bg-white rounded-[32px] border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="p-8 flex items-center justify-between border-b border-stone-100">
                      <div className="flex items-center gap-4">
                          <img src={channel.logo} alt={channel.name} className="w-12 h-12 object-contain rounded-xl p-1 bg-stone-50 border border-stone-100" />
                          <div>
                              <h3 className="text-lg font-black text-stone-900">{channel.name}</h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                  <div className={`w-2 h-2 rounded-full ${channel.connected ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`} />
                                  <span className={`text-[10px] uppercase font-bold tracking-widest ${channel.connected ? 'text-green-600' : 'text-stone-400'}`}>
                                      {channel.connected ? 'Conectado' : 'Desconectado'}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-8 flex-grow space-y-4">
                      {channel.connected ? (
                          <>
                            <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Última Sync:</span>
                                <span className="text-xs font-mono font-black text-stone-800">
                                    {channel.lastSync ? new Date(channel.lastSync).toLocaleTimeString() : '--'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Quartos Mapeados:</span>
                                <span className="text-xs font-mono font-black text-stone-800">{channel.roomsMapped}</span>
                            </div>
                            
                            <button 
                                onClick={() => triggerSync(channel.id)}
                                disabled={!!syncingChannel}
                                className="w-full py-3 bg-olive-50 text-olive-700 border border-olive-100 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-olive-100 transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={14} className={syncingChannel === channel.id ? "animate-spin" : ""} />
                                {syncingChannel === channel.id ? 'Sincronizando...' : 'Sincronizar Agora'}
                            </button>
                          </>
                      ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 opacity-60">
                              <Globe size={40} className="text-stone-300" strokeWidth={1.5} />
                              <p className="text-sm font-bold text-stone-400">Conecte sua conta para sincronizar disponibilidade e tarifas.</p>
                          </div>
                      )}
                  </div>

                  <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
                      {channel.connected ? (
                          <>
                            <button className="flex-1 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-stone-100 hover:text-stone-900 transition flex items-center justify-center gap-2">
                                <Settings size={14} /> Configurar
                            </button>
                            <button 
                                onClick={() => handleDisconnect(channel.id)}
                                className="px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-100 transition flex items-center justify-center gap-2"
                                title="Excluir Integração"
                            >
                                <Trash2 size={16} />
                            </button>
                          </>
                      ) : (
                          <button 
                              onClick={() => setConfiguringChannel(channel.id)}
                              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-olive-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                              <ExternalLink size={16} /> Conectar Agora
                          </button>
                      )}
                  </div>
              </div>
          ))}
          
          {/* Adicionar Novo */}
          <div className="border-2 border-dashed border-stone-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center hover:border-olive-300 hover:bg-olive-50/10 transition-colors cursor-pointer group min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 group-hover:bg-olive-100 transition-colors">
                  <div className="text-stone-400 group-hover:text-olive-600 text-3xl font-light">+</div>
              </div>
              <h3 className="text-lg font-black text-stone-900 group-hover:text-olive-800">Novo Canal</h3>
              <p className="text-xs text-stone-400 font-bold max-w-[200px] mt-2">Expedia, Decolar, CVC e outros (Em Breve)</p>
          </div>
      </div>

      {/* Config Modal */}
      {configuringChannel && (
          <IntegrationConfigModal 
              isOpen={!!configuringChannel}
              onClose={() => setConfiguringChannel(null)}
              channel={channels.find(c => c.id === configuringChannel)!}
              onConnect={(apiKey, propId) => handleConnect(configuringChannel, apiKey, propId)}
          />
      )}
      
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
      `}</style>
    </div>
  );
};
