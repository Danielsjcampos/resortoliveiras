import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Zap, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fetchUserData = async (userId: string) => {
    try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data && !error) {
             // Map snake_case database to camelCase frontend
             return {
                 ...data,
                 roleId: (data as any).role_id || (data as any).roleId
             } as unknown as User;
        }
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

      if (authError) throw authError;

      if (authData.user) {
        const user = await fetchUserData(authData.user.id);
        if (user) {
          onLogin(user);
          onClose();
        } else {
           console.warn("Perfil público não encontrado para o usuário: " + authData.user.email);
           setErrorMsg("Usuário autenticado, mas perfil de acesso não encontrado. Contate o suporte.");
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      // Show raw error for debugging
      setErrorMsg(
        err.message === "Database error querying schema"
          ? "Erro de conexão com o Banco de Dados. O esquema público pode não estar acessível ou a API pode estar pausada."
          : (err.message || "Erro desconhecido ao tentar fazer login.")
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = () => {
    performLogin('admin@oliveiras.com', 'admin123', true);
  };

  const handleCreateAdmin = async () => {
    if(!window.confirm("Isso criará o usuário Admin padrão. Certifique-se de ter rodado o script 'clear_admin_for_retry.sql' antes se o usuário já existir. Continuar?")) return;
    
    setIsLoggingIn(true);
    try {
        console.log("Tentando criar Auth User...");
        // 1. Tentar Criar no Auth (GoTrue)
        // Isso garante que a senha seja hasheada corretamente pelo sistema do Supabase
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'admin@oliveiras.com',
            password: 'admin123',
            options: {
                data: {
                    name: 'Admin Master'
                }
            }
        });
        
        if (signUpError) {
             if(signUpError.message.includes("already registered") || signUpError.status === 400) {
                 alert("O usuário 'admin@oliveiras.com' já existe. Execute o script SQL 'clear_admin_for_retry.sql' para limpar antes de criar.");
                 throw new Error("Usuário já existe. Limpe o banco.");
             }
             throw signUpError;
        }

        let userId = signUpData.user?.id;
        if (!userId) {
            // Se auto-confirm estiver desligado, talvez não tenha user id imediato, mas em dev local costuma ter.
            // Tentar login para garantir
            const { data: loginData } = await supabase.auth.signInWithPassword({
                email: 'admin@oliveiras.com',
                password: 'admin123'
            });
            userId = loginData.user?.id;
        }

        if (!userId) throw new Error("Falha ao obter ID do usuário recém-criado.");

        // 2. Garantir Role
        const { data: existingRole } = await supabase.from('roles').select('id').eq('name', 'Administrador Master').single();
        let roleId = existingRole?.id;

        // Se não tiver role, tenta criar (pode falhar por RLS se não for service role, mas tentamos)
        if (!roleId) {
             const { data: newRole } = await supabase.from('roles').insert({
                name: 'Administrador Master',
                permissions: ["all"],
                description: 'Acesso Total'
            }).select().single();
            roleId = newRole?.id;
        }

        // 3. Criar/Vincular Public User
        if (roleId) {
             const { error: userError } = await supabase.from('users').upsert({
                id: userId,
                name: 'Admin Master',
                email: 'admin@oliveiras.com',
                role_id: roleId,
                active: true,
                avatar: 'https://ui-avatars.com/api/?name=Admin+Master'
            });
            
            if (userError) throw userError;
            
            alert("Sucesso! Usuário criado. Clique em ENTRAR.");
            setEmail('admin@oliveiras.com');
            setPassword('admin123');  
        } else {
            alert("Usuário de autenticação criado, mas não foi possível vincular o cargo (Role). Verifique o banco.");
        }

    } catch (err: any) {
        console.error(err);
        if (err.message !== "Usuário já existe. Limpe o banco.") {
             alert("Erro ao criar: " + (err.message || err));
        }
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-stone-200 overflow-hidden relative z-10 animate-fade-in-up transform transition-all">
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-stone-100/50 hover:bg-stone-100 rounded-full transition-colors text-stone-500 z-20"
        >
            <X size={20} />
        </button>

        <div className="p-10 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-olive-700 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-xl rotate-3 mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tighter">Área Restrita</h2>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Painel Administrativo</p>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                    <AlertCircle size={16} />
                    <p>{errorMsg}</p>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleFormLogin}>
                <div className="space-y-1">
                    <div className="relative group">
                        <Mail className="absolute left-5 top-3.5 text-stone-400 group-focus-within:text-olive-600 transition-colors" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                            placeholder="admin@oliveiras.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="relative group">
                        <Lock className="absolute left-5 top-3.5 text-stone-400 group-focus-within:text-olive-600 transition-colors" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-4"
                >
                    {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : <>Entrar <ArrowRight size={16} /></>}
                </button>
            </form>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-stone-300 uppercase tracking-widest">Ou</span>
                <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <button 
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoggingIn}
                className="w-full bg-white border-2 border-olive-100 text-olive-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-olive-50 transition-all flex items-center justify-center gap-2"
            >
                <Zap size={16} className="text-yellow-500 fill-current" /> 
                Login Rápido (Dev)
            </button>

            <button 
                type="button"
                onClick={handleCreateAdmin}
                className="w-full mt-2 bg-stone-100/50 text-stone-400 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
                Criar Admin (API)
            </button>
        </div>
      </div>
    </div>
  );
};
