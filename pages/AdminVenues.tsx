
import React, { useState } from 'react';
import { Venue } from '../types';
import { Plus, Trash2, Edit2, Map, Users, DollarSign, Check } from 'lucide-react';

interface AdminVenuesProps {
  venues: Venue[];
  onAddVenue: (venue: Venue) => void;
  onDeleteVenue: (id: string) => void;
}

export const AdminVenues: React.FC<AdminVenuesProps> = ({ venues, onAddVenue, onDeleteVenue }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newVenue, setNewVenue] = useState<Partial<Venue>>({
    name: '',
    capacity: 0,
    pricePerDay: 0,
    description: '',
    image: '',
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setNewVenue(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVenue({
      id: Math.random().toString(36).substr(2, 9),
      name: newVenue.name || 'Novo Espaço',
      capacity: newVenue.capacity || 0,
      pricePerDay: newVenue.pricePerDay || 0,
      description: newVenue.description || '',
      image: newVenue.image || '',
      features: newVenue.features || []
    });
    setIsCreating(false);
    setNewVenue({ name: '', capacity: 0, pricePerDay: 0, description: '', image: '', features: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Espaços e Locais</h2>
          <p className="text-gray-500 text-sm">Gerencie os locais disponíveis para locação de eventos.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition flex items-center gap-2 shadow"
        >
          <Plus size={18} /> Novo Local
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-olive-100 animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4 text-olive-900">Cadastrar Novo Espaço</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Espaço</label>
                <input required className="w-full border rounded-lg p-2" value={newVenue.name} onChange={e => setNewVenue({...newVenue, name: e.target.value})} placeholder="Ex: Salão de Cristal" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (Pessoas)</label>
                 <input required type="number" className="w-full border rounded-lg p-2" value={newVenue.capacity || ''} onChange={e => setNewVenue({...newVenue, capacity: Number(e.target.value)})} />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Preço/Dia (Locação)</label>
                 <input required type="number" className="w-full border rounded-lg p-2" value={newVenue.pricePerDay || ''} onChange={e => setNewVenue({...newVenue, pricePerDay: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input className="w-full border rounded-lg p-2" value={newVenue.image} onChange={e => setNewVenue({...newVenue, image: e.target.value})} placeholder="https://..." />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea className="w-full border rounded-lg p-2" value={newVenue.description} onChange={e => setNewVenue({...newVenue, description: e.target.value})} placeholder="Detalhes sobre o local..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recursos (Pressione Enter)</label>
              <div className="flex gap-2 mb-2">
                 <input 
                    className="flex-grow border rounded-lg p-2" 
                    value={featureInput} 
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Ex: Ar Condicionado, Palco..."
                 />
                 <button type="button" onClick={handleAddFeature} className="bg-gray-200 px-4 rounded-lg hover:bg-gray-300">Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newVenue.features?.map((f, idx) => (
                  <span key={idx} className="bg-olive-50 text-olive-700 px-2 py-1 rounded text-xs border border-olive-100 flex items-center gap-1">
                    {f} <button type="button" onClick={() => setNewVenue(prev => ({...prev, features: prev.features?.filter((_, i) => i !== idx)}))} className="hover:text-red-500"><Trash2 size={12}/></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
               <button type="submit" className="px-6 py-2 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700">Salvar Local</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map(venue => (
          <div key={venue.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition">
            <div className="h-48 bg-gray-200 relative">
               <img src={venue.image || 'https://via.placeholder.com/400x250?text=Sem+Foto'} alt={venue.name} className="w-full h-full object-cover" />
               <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-800 shadow">
                  R$ {(venue.pricePerDay || 0).toLocaleString('pt-BR')} /dia
               </div>
            </div>
            <div className="p-5 flex-grow">
               <h3 className="font-bold text-xl text-gray-900 mb-2">{venue.name}</h3>
               <div className="flex items-center text-gray-600 text-sm mb-4">
                  <Users size={16} className="mr-2" /> Capacidade: {venue.capacity} pessoas
               </div>
               <p className="text-gray-500 text-sm mb-4">{venue.description}</p>
               
               <div className="flex flex-wrap gap-1">
                 {(venue.features || []).map((feat, i) => (
                   <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{feat}</span>
                 ))}
               </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
               <span className="text-xs text-gray-400">ID: {venue.id}</span>
               <button onClick={() => onDeleteVenue(venue.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
