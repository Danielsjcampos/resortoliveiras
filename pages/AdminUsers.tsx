import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, Plus, Edit2, Trash2, Shield, CheckCircle, XCircle, Search, Mail } from 'lucide-react';

interface AdminUsersProps {
    users: User[];
    onAddUser: (user: Partial<User>) => void;
    onUpdateUser: (id: string, data: Partial<User>) => void;
    onDeleteUser: (id: string) => void;
    currentUser: User;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, currentUser }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        password: '',
        role: UserRole.RECEPTION,
        active: true
    });

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            onUpdateUser(editingUser.id, formData);
        } else {
            onAddUser(formData);
        }
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: UserRole.RECEPTION, active: true });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({ ...user, password: '' }); // Don't show password
        setShowModal(true);
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return 'bg-purple-100 text-purple-800 border-purple-200';
            case UserRole.MANAGEMENT: return 'bg-blue-100 text-blue-800 border-blue-200';
            case UserRole.KITCHEN: return 'bg-orange-100 text-orange-800 border-orange-200';
            case UserRole.MAINTENANCE: return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-olive-100 text-olive-800 border-olive-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h2>
                    <p className="text-gray-500 text-sm">Controle de acesso e colaboradores do sistema.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: '', email: '', password: '', role: UserRole.RECEPTION, active: true });
                        setShowModal(true);
                    }}
                    className="bg-olive-600 hover:bg-olive-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition transform hover:scale-105"
                >
                    <Plus size={18} /> Novo Usuário
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-olive-600 hover:bg-olive-50 rounded-full transition">
                                        <Edit2 size={16} />
                                    </button>
                                    {user.id !== currentUser.id && (
                                        <button onClick={() => onDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-gray-400" />
                                    Acesso: {user.active ? <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={12} /> Ativo</span> : <span className="text-red-500 font-bold flex items-center gap-1"><XCircle size={12} /> Inativo</span>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                            <span>ID: {user.id.substr(0, 8)}...</span>
                            {user.id === currentUser.id && <span className="font-bold text-olive-600">Você</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="bg-olive-900 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-olive-800 p-1 rounded transition"><XCircle size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-olive-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-olive-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Senha {editingUser && '(Deixe em branco para manter)'}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-olive-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingUser ? '••••••••' : ''}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Função / Cargo</label>
                                <select
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-olive-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                >
                                    {Object.values(UserRole).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 text-olive-600 focus:ring-olive-500 border-gray-300 rounded"
                                />
                                <label htmlFor="active" className="text-sm text-gray-700">Usuário Ativo</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-olive-600 text-white rounded-lg font-bold hover:bg-olive-700 shadow-lg transition">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
