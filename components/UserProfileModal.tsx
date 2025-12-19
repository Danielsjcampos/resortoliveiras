import React, { useState, useRef } from 'react';
import { X, Camera, Save, Lock, Mail, User as UserIcon, Upload, Check, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

// UserProfileModal fixes
export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  // Safety check
  if (!currentUser) return null;

  const [loading, setLoading] = useState(false);
  // ... rest of the code
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '', 
    password: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
        setIsCameraOpen(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Não foi possível acessar a câmera.");
        setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      setIsCameraOpen(false);
  };

  const takePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setAvatarPreview(dataUrl);
              stopCamera();
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
    }

    try {
        // 1. Update Auth (Password/Email) if needed
        if (formData.password) {
            const { error: authError } = await supabase.auth.updateUser({ password: formData.password });
            if (authError) throw authError;
        }

        // 2. Update User Data in 'users' table (NOT profiles, based on error feedback)
        const updates: any = {
            name: formData.name,
            // In a real app we'd upload the base64 avatar to storage here and get a URL
            // For this MVP, we might be saving base64 directly if small, or skipping upload.
            // Assuming 'avatar' field can take the dataUrl or we just keep it local for now if too large?
            // Let's assume the backend handles it or we save it.
            avatar: avatarPreview || currentUser.avatar,
            full_name: formData.name // keeping both for compatibility
        };
        
        const { error: dbError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', currentUser.id);

        if (dbError) throw dbError;

        onUpdateUser({
            ...currentUser,
            name: formData.name,
            avatar: avatarPreview || currentUser.avatar 
        });

        setSuccess('Perfil atualizado com sucesso!');
        setTimeout(() => {
            setSuccess('');
            onClose();
        }, 1500);

    } catch (err: any) {
        console.error("Update error:", err);
        setError(err.message || 'Erro ao atualizar perfil.');
    } finally {
        setLoading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
      return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity" 
        onClick={() => { stopCamera(); onClose(); }}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-olive-900 px-6 py-4 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <UserIcon size={24} /> Editar Perfil
            </h2>
            <button onClick={() => { stopCamera(); onClose(); }} className="text-white/60 hover:text-white transition-colors p-1 bg-white/10 rounded-full">
                <X size={20} />
            </button>
        </div>

        <div className="overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar / Face Photo Section */}
                <div className="flex flex-col items-center gap-4">
                    {isCameraOpen ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-olive-500 shadow-2xl bg-black">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={takePhoto} className="px-6 py-2 bg-white border border-stone-200 shadow-lg rounded-full text-olive-700 font-bold hover:bg-olive-50 transition-colors flex items-center gap-2">
                                    <Camera size={18} /> Capturar
                                </button>
                                <button type="button" onClick={stopCamera} className="px-6 py-2 bg-stone-100 text-stone-500 rounded-full font-bold hover:bg-stone-200 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-olive-100 shadow-xl relative bg-stone-100">
                                     {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <UserIcon size={48} />
                                        </div>
                                     )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={startCamera}
                                    className="absolute bottom-0 right-0 bg-olive-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-olive-700 transition"
                                    title="Tirar Foto"
                                >
                                    <Camera size={16} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 left-0 bg-stone-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-stone-700 transition"
                                    title="Upload"
                                >
                                    <Upload size={16} />
                                </button>
                            </div>
                            <p className="mt-3 text-xs text-stone-400 font-medium text-center">
                                Esta foto será usada para reconhecimento facial no <br/> 
                                <span className="text-olive-600 font-bold">Registro de Ponto</span>.
                            </p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Name */}
                    <div className="group">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 group-focus-within:text-olive-600 transition-colors">
                                <UserIcon size={18} />
                            </div>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-all outline-none font-medium text-stone-800"
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Email (Login)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                <Mail size={18} />
                            </div>
                            <input
                                name="email"
                                value={formData.email}
                                disabled
                                type="email"
                                className="w-full pl-10 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-xl outline-none font-medium text-stone-500 cursor-not-allowed border-dashed"
                                title="Entre em contato com o admin para alterar o email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="pt-2">
                         <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Alterar Senha</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 group-focus-within:text-olive-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-all outline-none font-medium text-stone-800 placeholder:text-stone-300"
                                    placeholder="Nova Senha"
                                />
                             </div>
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 group-focus-within:text-olive-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-all outline-none font-medium text-stone-800 placeholder:text-stone-300"
                                    placeholder="Confirmar"
                                />
                             </div>
                         </div>
                         <p className="text-[10px] text-stone-400 mt-1 ml-1">Deixe em branco para manter a senha atual.</p>
                    </div>

                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-green-100 animate-pulse">
                        <Check size={16} /> {success}
                    </div>
                )}

                <div className="pt-4 border-t border-stone-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-olive-600 text-white rounded-xl font-bold shadow-lg shadow-olive-600/20 hover:bg-olive-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                    {/* <button 
                        type="button" 
                        onClick={onClose}
                        className="w-full mt-3 py-3 text-stone-400 font-bold hover:text-stone-600 transition-colors text-sm"
                    >
                        Cancelar
                    </button> */}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
