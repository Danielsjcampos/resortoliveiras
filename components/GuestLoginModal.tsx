import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, AlertCircle, Hotel, X } from 'lucide-react';
import { Reservation, SystemSettings } from '../types';
import { supabase } from '../lib/supabase';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (reservation: Reservation) => void;
  placeholderSettings?: SystemSettings;
}

export const GuestLoginModal: React.FC<GuestLoginModalProps> = ({ isOpen, onClose, onLogin, placeholderSettings }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Direct supabase query to ensure we find the reservation even if not loaded in parent 'reservations' array yet
      // But usually 'reservations' prop is passed. 
      // For simplicity let's try to find it via API if possible or assume we need to use what we have.
      // However, the original GuestLogin used a prop 'reservations'. 
      // In Layouts we might not have all reservations loaded if we are just a layout.
      // Actually AdminLayout has reservations? No. PublicLayout doesn't.
      // So we must fetch it or use a callback that fetches.
      // Since we can't easily pass 'reservations' to Layout everywhere, let's fetch it here.
      
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('access_code', code)
        .neq('status', 'Check-out') // Can't login if checked out?
        .single();

      if (fetchError || !data) {
        setError('Código inválido ou reserva não encontrada active.');
      } else {
         // Map DB to Type
         const reservation: Reservation = {
             id: data.id,
             guestName: data.guest_name,
             roomId: data.room_id,
             checkIn: data.check_in,
             checkOut: data.check_out,
             status: data.status,
             totalAmount: data.total_amount,
             accessCode: data.access_code,
             consumption: data.consumption || [],
             leadId: data.lead_id,
             clientId: data.client_id,
             guestsDetails: data.guests_details,
             guestContact: data.guest_contact,
             guestEmail: data.guest_email
         };
         
         onLogin(reservation);
         onClose();
         navigate('/guest/dashboard');
      }
    } catch (err) {
      setError('Erro ao processar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Glass Card */}
      <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20"
        >
            <X size={24} />
        </button>

        <div className="p-8 text-center relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[24px] flex items-center justify-center mb-6 mx-auto text-white shadow-xl border border-white/10 ring-4 ring-white/5">
                <Hotel size={36} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2 text-shadow-sm">Bem-vindo(a)</h2>
            <p className="text-white/80 text-sm mb-8">Digite seu código de acesso para ver sua comanda.</p>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition-colors">
                        <Lock size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Código da Reserva"
                        className="w-full pl-11 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all outline-none font-medium text-white placeholder-white/40 text-center tracking-widest uppercase"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError('');
                        }}
                    />
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-white text-xs p-3 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm">
                        <AlertCircle size={14} className="shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-olive-900 font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="animate-pulse">Verificando...</span>
                    ) : (
                        <>
                            Acessar Comanda <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
