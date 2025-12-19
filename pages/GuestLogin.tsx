import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, AlertCircle, Hotel } from 'lucide-react';
import { Reservation, SystemSettings } from '../types';

interface GuestLoginProps {
  reservations: Reservation[];
  settings: SystemSettings;
  onLogin: (reservation: Reservation) => void;
}

export const GuestLogin: React.FC<GuestLoginProps> = ({ reservations, settings, onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const reservation = reservations.find(r => r.accessCode === code && r.status !== 'Check-out');
    
    if (reservation) {
      onLogin(reservation);
      navigate('/guest/dashboard');
    } else {
      setError('Código inválido ou reserva já finalizada.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-olive-800 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 text-white">
                    <Hotel size={32} />
                </div>
                <h1 className="text-2xl font-serif text-white mb-2 tracking-wide">Área do Hóspede</h1>
                <p className="text-olive-100 text-sm">Acesse sua comanda e serviços</p>
            </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Código de Acesso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Digite seu código"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-600 focus:border-transparent transition-all outline-none font-medium text-stone-800 placeholder-stone-400"
                  value={code}
                  onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-olive-700 hover:bg-olive-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-olive-900/10 active:scale-[0.98]"
            >
              Acessar Comanda
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-stone-400">
              Não tem o código? Solicite na recepção.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center opacity-60">
        <img src={settings.logoUrl} alt="Logo" className="h-8 mx-auto grayscale opacity-50 mb-2" />
        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{settings.resortName}</p>
      </div>
    </div>
  );
};
