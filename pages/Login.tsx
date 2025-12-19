
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data && !error) return data as User;
    } catch (e) {
        console.error("Erro ao buscar perfil do usuário no banco.");
    }
    return null;
  };

  const performLogin = async (loginEmail: string, loginPass: string, isQuick: boolean = false) => {
    setIsLoggingIn(true);
    setErrorMsg(null);

    try {
      // 1. Autenticação no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // 2. Busca dados complementares na tabela public.users
        const user = await fetchUserData(authData.user.id);
        if (user) {
          onLogin(user);
        } else {
            console.error('Usuário autenticado, mas perfil não encontrado em public.users.');
            setErrorMsg('Perfil de usuário não encontrado.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message === "Database error querying schema" 
        ? "Erro de Banco: As tabelas ainda não foram criadas. Execute o script SQL no Supabase." 
        : err.message || "Credenciais inválidas.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = () => {
    performLogin('admin@oliveiras.com', '123456', true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-olive-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-stone-300/30 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl border border-stone-200 overflow-hidden relative z-10 p-10 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-olive-700 text-white rounded-[28px] flex items-center justify-center mx-auto shadow-xl rotate-3 hover:rotate-0 transition-transform">
                <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tighter pt-4">Resort Oliveiras</h1>
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Painel de Governança v2.0</p>
        </div>

        {errorMsg && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col gap-1 text-red-600 text-[10px] font-bold animate-shake">
                <div className="flex items-center gap-2 uppercase tracking-widest">
                    <AlertCircle size={14} /> Erro de Sistema
                </div>
                <p className="ml-6">{errorMsg}</p>
            </div>
        )}

        <form className="space-y-4" onSubmit={handleFormLogin}>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-4">E-mail Corporativo</label>
                <div className="relative">
                    <Mail className="absolute left-5 top-4 text-stone-400" size={18} />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-olive-500 outline-none transition-all shadow-inner"
                        placeholder="admin@oliveiras.com"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-4">Sua Senha</label>
                <div className="relative">
                    <Lock className="absolute left-5 top-4 text-stone-400" size={18} />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-olive-500 outline-none transition-all shadow-inner"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-stone-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
                {isLoggingIn ? <Loader2 className="animate-spin" /> : <>Entrar no Sistema <ArrowRight size={16} /></>}
            </button>
        </form>

        <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-stone-300 uppercase tracking-widest">Acesso Rápido</span>
            <div className="flex-grow border-t border-stone-200"></div>
        </div>

        <button 
            type="button"
            onClick={handleQuickLogin}
            disabled={isLoggingIn}
            className="w-full bg-olive-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-olive-800 transition-all flex items-center justify-center gap-2 group border-b-4 border-olive-900 active:translate-y-1 active:border-b-0 disabled:opacity-50"
        >
            <Zap size={18} className="text-yellow-400 animate-pulse group-hover:scale-125 transition-transform" /> 
            {isLoggingIn ? 'Autenticando...' : 'Acesso Administrador'}
        </button>

        <div className="text-center space-y-1">
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                Modo: Produção / Híbrido
            </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up { 
            from { opacity: 0; transform: translateY(40px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};
