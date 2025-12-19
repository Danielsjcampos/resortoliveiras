
import React, { useState, useEffect } from 'react';
import { User, Role, SystemSettings, Permission } from '../types';
import { 
  Settings, Save, User as UserIcon, Shield, Palette, 
  Database, Zap, Building, Camera, ImageIcon, 
  CheckCircle2, AlertCircle, Loader2, RefreshCw, HardDrive, Trash2,
  Plus, X, ShieldCheck, Mail, UserPlus, Lock, Check, ChevronRight, Edit2,
  Globe, Instagram, Facebook, Linkedin, MapPin, MousePointer2, Layout, Type
} from 'lucide-react';
import { supabase } from '../lib/supabase';
// Mocks removed


interface AdminSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (s: SystemSettings) => void;
  users: User[];
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  roles: Role[];
  onAddRole: (r: Role) => void;
  onUpdateRole: (r: Role) => void;
  onDeleteRole: (id: string) => void;
}

const AVAILABLE_PERMISSIONS: {id: Permission, label: string, category: string}[] = [
  { id: 'VIEW_DASHBOARD', label: 'Painel Geral', category: 'Geral' },
  { id: 'VIEW_CRM', label: 'Gestão de Leads (CRM)', category: 'Vendas' },
  { id: 'VIEW_RESERVATIONS', label: 'Mapa de Reservas', category: 'Hospedagem' },
  { id: 'VIEW_ACCOMMODATIONS', label: 'Governança (Quartos)', category: 'Hospedagem' },
  { id: 'VIEW_POS', label: 'Ponto de Venda (PDV)', category: 'Vendas' },
  { id: 'VIEW_KITCHEN', label: 'Cozinha e Pedidos', category: 'Operacional' },
  { id: 'VIEW_FINANCE', label: 'Financeiro e DRE', category: 'Administrativo' },
  { id: 'VIEW_EVENTS', label: 'Gestão de Eventos', category: 'Operacional' },
  { id: 'VIEW_VENUES', label: 'Locais e Espaços', category: 'Operacional' },
  { id: 'VIEW_PRODUCTS', label: 'Catálogo de Produtos', category: 'Administrativo' },
  { id: 'VIEW_TIMESHEET', label: 'Folha de Ponto (RH)', category: 'Administrativo' },
  { id: 'VIEW_CONTENT', label: 'Marketing (Blog/IA)', category: 'Marketing' },
  { id: 'VIEW_SETTINGS', label: 'Configurações Master', category: 'Administrativo' },
];

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings, onUpdateSettings, users, onAddUser, onUpdateUser, onDeleteUser, roles, onAddRole, onUpdateRole, onDeleteRole
}) => {
  const [activeTab, setActiveTab] = useState<'INSTITUTIONAL' | 'DATABASE' | 'USERS' | 'ROLES'>('INSTITUTIONAL');
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);

  useEffect(() => {
      if (settings) {
        setLocalSettings(prev => ({
            ...prev,
            ...settings
        }));
      }
  }, [settings]);
  const [isSaving, setIsSaving] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{table: string, status: 'idle' | 'loading' | 'success' | 'error', errorMsg?: string}[]>([]);
  
  // Modais State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  
  // Form States
  const [userForm, setUserForm] = useState<Partial<User & { password?: string }>>({ 
    name: '', 
    email: '', 
    roleId: roles.length > 0 ? roles[0].id : '',
    password: ''
  });
  const [roleForm, setRoleForm] = useState<Partial<Role>>({ name: '', description: '', permissions: [] });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers Usuário ---
  const handleOpenEditUser = (user: User) => {
    setUserForm({ ...user, password: '' });
    setIsEditingUser(true);
    setShowUserModal(true);
  };

  const handleOpenAddUser = () => {
    setUserForm({ 
      name: '', 
      email: '', 
      roleId: roles.length > 0 ? roles[0].id : '', 
      password: '' 
    });
    setIsEditingUser(false);
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email || !userForm.roleId) return;
    if (isEditingUser && userForm.id) {
        onUpdateUser(userForm as User);
    } else {
        const newUser: User = {
            id: `u-${Date.now()}`,
            name: userForm.name || '',
            email: userForm.email || '',
            roleId: userForm.roleId || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userForm.name}`
        };
        onAddUser(newUser);
    }
    setShowUserModal(false);
  };

  // --- Handlers Perfil (Roles) ---
  const handleOpenEditRole = (role: Role) => {
    setRoleForm({ ...role });
    setIsEditingRole(true);
    setShowRoleModal(true);
  };

  const handleOpenAddRole = () => {
    setRoleForm({ name: '', description: '', permissions: [] });
    setIsEditingRole(false);
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.name) return;
    if (isEditingRole && roleForm.id) {
        onUpdateRole(roleForm as Role);
    } else {
        const newRole: Role = {
          id: `role-${roleForm.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
          name: roleForm.name || '',
          description: roleForm.description || '',
          permissions: roleForm.permissions || []
        };
        onAddRole(newRole);
    }
    setShowRoleModal(false);
  };

  const togglePermission = (perm: Permission) => {
    setRoleForm(prev => {
      const current = prev.permissions || [];
      if (current.includes(perm)) {
        return { ...prev, permissions: current.filter(p => p !== perm) };
      }
      return { ...prev, permissions: [...current, perm] };
    });
  };

  const seedDatabase = async () => {
   // Seed functionality disabled.
   alert("Seed manual desativado. Use migrações SQL.");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-900 flex items-center gap-3">
            <div className="p-2 bg-olive-700 text-white rounded-2xl shadow-lg"><Settings size={28}/></div> 
            Configurações do Resort
          </h2>
          <p className="text-stone-500 mt-1 font-medium text-sm">Controle de acessos, dados e identidade.</p>
        </div>
        <button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl uppercase text-xs tracking-widest disabled:opacity-50"
        >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 bg-stone-200 p-1.5 rounded-2xl border border-stone-300 shadow-inner">
        {[
            { id: 'INSTITUTIONAL', label: 'Identidade & Estilo', icon: <Palette size={16}/> },
            { id: 'USERS', label: 'Equipe', icon: <UserIcon size={16}/> },
            { id: 'ROLES', label: 'Segurança', icon: <Shield size={16}/> },
            { id: 'DATABASE', label: 'Banco de Dados', icon: <Database size={16}/> },
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-tighter
                    ${activeTab === tab.id 
                        ? 'bg-white text-stone-900 shadow-md' 
                        : 'text-stone-500 hover:text-stone-700 hover:bg-white/40'
                    }`}
            >
                {tab.icon} {tab.label}
            </button>
        ))}
      </div>

      {/* ABA: DADOS DO RESORT (INSTITUTIONAL) */}
      {activeTab === 'INSTITUTIONAL' && (
        <div className="space-y-8 animate-fade-in">
            {/* SEÇÃO: IDENTIDADE VISUAL & MENU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-200 space-y-6">
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2 border-b pb-4">
                        <Palette size={18} className="text-olive-600" /> Identidade & Estilo
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Estilo do Menu</label>
                                <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200">
                                    <button 
                                        onClick={() => setLocalSettings({...localSettings, menuStyle: 'STANDARD'})}
                                        className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${localSettings.menuStyle === 'STANDARD' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
                                    >Padrão</button>
                                    <button 
                                        onClick={() => setLocalSettings({...localSettings, menuStyle: 'IOS'})}
                                        className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${localSettings.menuStyle === 'IOS' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
                                    >IOS Style</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Cor Primária</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" value={localSettings.primaryColor} onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})} />
                                    <input className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-xs font-bold" value={localSettings.primaryColor} onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <div>
                                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Cor Fundo Menu</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" value={localSettings.menuBackgroundColor} onChange={e => setLocalSettings({...localSettings, menuBackgroundColor: e.target.value})} />
                                    <input className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-xs font-bold" value={localSettings.menuBackgroundColor} onChange={e => setLocalSettings({...localSettings, menuBackgroundColor: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Tam. Ícone</label>
                                    <input type="number" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-xs font-bold" value={localSettings.menuIconSize} onChange={e => setLocalSettings({...localSettings, menuIconSize: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Tam. Fonte</label>
                                    <input type="number" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-xs font-bold" value={localSettings.menuFontSize} onChange={e => setLocalSettings({...localSettings, menuFontSize: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Espaçamento</label>
                                    <input type="number" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-xs font-bold" value={localSettings.menuItemSpacing ?? 6} onChange={e => setLocalSettings({...localSettings, menuItemSpacing: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Padding Botão</label>
                                    <input type="number" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-xs font-bold" value={localSettings.menuButtonPadding ?? 12} onChange={e => setLocalSettings({...localSettings, menuButtonPadding: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Arredondamento</label>
                                    <input type="number" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-xs font-bold" value={localSettings.menuBorderRadius ?? 16} onChange={e => setLocalSettings({...localSettings, menuBorderRadius: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Colunas (IOS)</label>
                                    <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                                        <button onClick={() => setLocalSettings({...localSettings, menuColumns: 2})} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${localSettings.menuColumns === 2 || !localSettings.menuColumns ? 'bg-white shadow-sm' : ''}`}>2</button>
                                        <button onClick={() => setLocalSettings({...localSettings, menuColumns: 3})} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${localSettings.menuColumns === 3 ? 'bg-white shadow-sm' : ''}`}>3</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-6 bg-stone-50 rounded-[32px] border border-stone-100 mt-4">
                        <label className="block w-full text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Logomarca do Resort</label>
                        {localSettings.logoUrl ? (
                            <img src={localSettings.logoUrl} className="h-16 w-auto object-contain drop-shadow-xl" alt="Preview Logo" />
                        ) : (
                            <div className="h-16 w-16 bg-stone-200 rounded-full flex items-center justify-center text-stone-400"><ImageIcon size={24}/></div>
                        )}
                        <div className="flex flex-col gap-2 w-full">
                            <input 
                                placeholder="URL da Imagem..."
                                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold text-stone-700"
                                value={localSettings.logoUrl}
                                onChange={e => setLocalSettings({...localSettings, logoUrl: e.target.value})}
                            />
                            <div className="relative overflow-hidden inline-block w-full">
                                <button className="w-full bg-white border border-dashed border-stone-300 rounded-xl py-3 text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition flex items-center justify-center gap-2">
                                    <Camera size={14} /> Upload Imagem (Computador)
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setLocalSettings({...localSettings, logoUrl: reader.result as string});
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                            <p className="text-[9px] text-stone-400 text-center mt-1">Recomendado: Logo PNG transparente</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-200 space-y-6">
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2 border-b pb-4">
                        <Building size={18} className="text-olive-600" /> Dados Corporativos
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-black text-stone-900 uppercase tracking-[0.2em] mb-2">Nome do Resort</label>
                            <input className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm font-black text-stone-800" value={localSettings.resortName} onChange={e => setLocalSettings({...localSettings, resortName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-stone-900 uppercase tracking-[0.2em] mb-2">CNPJ</label>
                            <input className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm font-black text-stone-800" value={localSettings.resortCnpj} onChange={e => setLocalSettings({...localSettings, resortCnpj: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-stone-900 uppercase tracking-[0.2em] mb-2">Endereço Completo</label>
                            <textarea className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm font-black text-stone-800 h-24" value={localSettings.resortAddress} onChange={e => setLocalSettings({...localSettings, resortAddress: e.target.value})} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO: CONTATO & REDES SOCIAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-200 space-y-6">
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2 border-b pb-4">
                        <Globe size={18} className="text-olive-600" /> Contatos & Canais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Email de Atendimento</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-4 top-3.5 text-stone-300" />
                                <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold" value={localSettings.contactEmail} onChange={e => setLocalSettings({...localSettings, contactEmail: e.target.value})} />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Telefone Comercial</label>
                            <div className="relative">
                                <Building size={14} className="absolute left-4 top-3.5 text-stone-300" />
                                <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold" value={localSettings.contactPhone} onChange={e => setLocalSettings({...localSettings, contactPhone: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Instagram URL</label>
                            <div className="relative">
                                <Instagram size={14} className="absolute left-4 top-3.5 text-stone-300" />
                                <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold" value={localSettings.instagramUrl} onChange={e => setLocalSettings({...localSettings, instagramUrl: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Facebook URL</label>
                            <div className="relative">
                                <Facebook size={14} className="absolute left-4 top-3.5 text-stone-300" />
                                <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold" value={localSettings.facebookUrl} onChange={e => setLocalSettings({...localSettings, facebookUrl: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Youtube URL</label>
                            <div className="relative">
                                <Globe size={14} className="absolute left-4 top-3.5 text-stone-300" />
                                <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold" value={localSettings.youtubeUrl || ''} onChange={e => setLocalSettings({...localSettings, youtubeUrl: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-200 space-y-6">
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2 border-b pb-4">
                        <MapPin size={18} className="text-olive-600" /> Geolocalização (Ponto Eletrônico)
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Latitude Central</label>
                                <input type="number" step="any" className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 text-xs font-bold" value={localSettings.workplaceLat} onChange={e => setLocalSettings({...localSettings, workplaceLat: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Longitude Central</label>
                                <input type="number" step="any" className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 text-xs font-bold" value={localSettings.workplaceLng} onChange={e => setLocalSettings({...localSettings, workplaceLng: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Raio de Tolerância (Metros)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="100" max="5000" step="100" className="flex-1 accent-olive-600" value={localSettings.workplaceRadius} onChange={e => setLocalSettings({...localSettings, workplaceRadius: Number(e.target.value)})} />
                                <span className="bg-stone-900 text-white px-4 py-1.5 rounded-full text-xs font-black">{localSettings.workplaceRadius}m</span>
                            </div>
                        </div>
                        <div className="bg-olive-50 p-4 rounded-2xl border border-olive-100 text-[10px] font-bold text-olive-800 leading-relaxed">
                            O batimento de ponto só será permitido se o colaborador estiver dentro deste raio geográfico em relação às coordenadas acima.
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ABA: EQUIPE (USERS) */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-stone-200">
                <div>
                    <h3 className="text-xl font-black text-stone-900">Membros da Equipe</h3>
                    <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">{users.length} usuários cadastrados</p>
                </div>
                <button 
                  onClick={handleOpenAddUser}
                  className="bg-olive-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-olive-800 transition shadow-lg text-xs uppercase tracking-widest"
                >
                    <UserPlus size={16} /> Adicionar Membro
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                    <div key={u.id} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <img src={u.avatar} className="w-16 h-16 rounded-2xl shadow-lg border-4 border-stone-50" />
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenEditUser(u)} className="p-2 text-olive-600 hover:bg-olive-50 rounded-xl transition"><Edit2 size={16}/></button>
                                <button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h4 className="font-black text-stone-900 text-lg tracking-tighter">{u.name}</h4>
                        <p className="text-stone-400 text-xs font-bold mb-4">{u.email}</p>
                        <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                            <Shield size={14} className="text-olive-600" />
                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">
                                {roles.find(r => r.id === u.roleId)?.name || 'Perfil não encontrado'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* ABA: SEGURANÇA (ROLES) */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center bg-stone-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight">Perfis de Acesso</h3>
                    <p className="text-stone-400 text-sm font-medium mt-1">Defina o que cada colaborador pode ver e fazer.</p>
                </div>
                <button 
                  onClick={handleOpenAddRole}
                  className="bg-white text-stone-900 px-8 py-4 rounded-3xl font-black flex items-center gap-2 hover:bg-stone-100 transition shadow-xl text-xs uppercase tracking-widest relative z-10"
                >
                    <ShieldCheck size={18} /> Criar Novo Perfil
                </button>
                <div className="absolute right-0 top-0 p-8 opacity-10"><Shield size={100} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-8 rounded-[40px] border border-stone-200 shadow-sm flex flex-col justify-between hover:border-olive-200 transition group">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-olive-700">
                                    <Shield size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEditRole(role)} className="p-3 text-stone-400 hover:text-stone-900 transition hover:bg-stone-50 rounded-2xl"><Edit2 size={18}/></button>
                                    <button onClick={() => onDeleteRole(role.id)} className="p-3 text-red-300 hover:text-red-500 transition hover:bg-red-50 rounded-2xl"><Trash2 size={18}/></button>
                                </div>
                            </div>
                            <h4 className="text-xl font-black text-stone-900 tracking-tight">{role.name}</h4>
                            <p className="text-sm text-stone-500 font-medium leading-relaxed">{role.description}</p>
                            
                            <div className="flex flex-wrap gap-2 pt-4">
                                {role.permissions.map(p => (
                                    <span key={p} className="text-[9px] font-black text-olive-700 bg-olive-50 px-3 py-1.5 rounded-full border border-olive-100 uppercase tracking-widest">
                                        {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* ABA: DATABASE */}
      {activeTab === 'DATABASE' && (
        <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-olive-50 p-8 rounded-[32px] border border-olive-100">
                <div className="p-6 bg-olive-600 text-white rounded-[32px] shadow-xl">
                    <Database size={48} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">Recuperação de Emergência</h3>
                    <p className="text-stone-500 text-sm mt-1">Carregar dados iniciais de demonstração (Seed) caso o banco esteja vazio.</p>
                </div>
                <button onClick={seedDatabase} className="bg-olive-700 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-olive-800 transition shadow-xl active:scale-95 flex items-center gap-3"><Zap size={18} className="text-yellow-400" /> Carregar Iniciais</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seedStatus.map(s => (
                    <div key={s.table} className={`flex items-center justify-between p-4 bg-stone-50 border rounded-2xl transition-all ${s.status === 'error' ? 'border-red-200 bg-red-50' : 'border-stone-100'}`}>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{s.table}</span>
                        </div>
                        <div className="shrink-0 ml-2">
                            {s.status === 'loading' && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
                            {s.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                            {s.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODAL: USUÁRIO (NOVO/EDITAR) */}
      {showUserModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="p-10 border-b flex justify-between items-center bg-stone-50">
                      <div>
                        <h3 className="text-2xl font-black text-stone-900 tracking-tight">{isEditingUser ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Acesso ao sistema do Resort</p>
                      </div>
                      <button onClick={() => setShowUserModal(false)} className="p-3 hover:bg-stone-200 rounded-2xl transition"><X size={24} /></button>
                  </div>
                  <div className="p-10 space-y-6">
                      <div className="space-y-4">
                          <div>
                              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1 mb-2 block">Nome Completo</label>
                              <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-olive-500" placeholder="Ex: Maria das Oliveiras" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1 mb-2 block">E-mail Corporativo</label>
                              <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-olive-500" placeholder="Ex: maria@oliveiras.com" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1 mb-2 block">Cargo / Perfil</label>
                              <select className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-olive-500 appearance-none" value={userForm.roleId} onChange={e => setUserForm({...userForm, roleId: e.target.value})}>
                                  <option value="">Selecione um perfil...</option>
                                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1 mb-2 block">{isEditingUser ? 'Redefinir Senha (opcional)' : 'Senha de Acesso'}</label>
                              <div className="relative">
                                  <Lock className="absolute left-6 top-4 text-stone-300" size={18} />
                                  <input 
                                      type="password"
                                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-olive-500" 
                                      placeholder="••••••••" 
                                      value={userForm.password} 
                                      onChange={e => setUserForm({...userForm, password: e.target.value})} 
                                  />
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex gap-4">
                          <button onClick={() => setShowUserModal(false)} className="flex-1 bg-stone-100 text-stone-600 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-all">Cancelar</button>
                          <button onClick={handleSaveUser} className="flex-[2] bg-olive-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-olive-800 transition-all flex items-center justify-center gap-2">
                            {isEditingUser ? 'Salvar Alterações' : 'Criar Acesso'} <ChevronRight size={16} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: PERFIL (ROLE) (NOVO/EDITAR) */}
      {showRoleModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-fade-in-up my-auto">
                  <div className="p-10 border-b flex justify-between items-center bg-stone-900 text-white">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight">{isEditingRole ? 'Editar Perfil' : 'Configurar Perfil'}</h3>
                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Controle de Permissões</p>
                      </div>
                      <button onClick={() => setShowRoleModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition"><X size={24} /></button>
                  </div>
                  <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-2 block">Nome do Perfil</label>
                            <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-olive-500" placeholder="Ex: Recepcionista" value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-2 block">Descrição Breve</label>
                            <input className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-olive-500" placeholder="Ex: Acesso total ao mapa e PDV" value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} />
                        </div>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-4 block border-b pb-2">Habilitar Módulos do Sistema</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {AVAILABLE_PERMISSIONS.map(p => (
                                  <button 
                                    key={p.id}
                                    onClick={() => togglePermission(p.id)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left
                                        ${roleForm.permissions?.includes(p.id) 
                                            ? 'bg-olive-50 border-olive-200 text-olive-900 ring-2 ring-olive-100' 
                                            : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-stone-100'}`}
                                  >
                                      <div>
                                          <p className="text-[11px] font-black uppercase tracking-tight leading-none">{p.label}</p>
                                          <p className="text-[8px] font-bold text-stone-400 mt-1 uppercase tracking-widest">{p.category}</p>
                                      </div>
                                      {roleForm.permissions?.includes(p.id) && <Check size={16} className="text-olive-600" />}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="p-10 bg-stone-50 border-t flex gap-4">
                    <button onClick={() => setShowRoleModal(false)} className="flex-1 bg-stone-200 text-stone-600 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-stone-300 transition-all">Cancelar</button>
                    <button onClick={handleSaveRole} className="flex-[2] bg-stone-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                      {isEditingRole ? 'Salvar Alterações' : 'Criar Perfil de Acesso'}
                    </button>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { 
            from { opacity: 0; transform: translateY(40px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e2e2; border-radius: 10px; }
      `}</style>
    </div>
  );
};
