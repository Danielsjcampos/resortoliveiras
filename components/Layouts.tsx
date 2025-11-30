
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Home, Hotel, Newspaper, Menu, X, DollarSign, ShoppingCart, Tag, Map, LogOut, Download, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

// --- Public Layout ---
export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-olive-50">
      <nav className="bg-olive-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-serif font-bold tracking-wider">
            Resort das Oliveiras
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-olive-200 transition">Início</Link>
            <a href="#acomodacoes" className="hover:text-olive-200 transition">Acomodações</a>
            <a href="#eventos" className="hover:text-olive-200 transition">Eventos</a>
            <Link to="/blog" className="hover:text-olive-200 transition">Blog</Link>
            <Link to="/login" className="px-4 py-2 bg-olive-600 rounded-full hover:bg-olive-500 transition text-sm flex items-center gap-2">
              <UserIcon size={16} /> Área do Colaborador
            </Link>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-olive-700 px-6 py-4 space-y-4 animate-slide-in-top">
            <Link to="/" className="block text-white" onClick={() => setIsMobileMenuOpen(false)}>Início</Link>
            <a href="#acomodacoes" className="block text-white" onClick={() => setIsMobileMenuOpen(false)}>Acomodações</a>
            <a href="#eventos" className="block text-white" onClick={() => setIsMobileMenuOpen(false)}>Eventos</a>
            <Link to="/blog" className="block text-white" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            <Link to="/login" className="block text-white font-bold bg-olive-900 p-2 rounded text-center" onClick={() => setIsMobileMenuOpen(false)}>Área do Colaborador</Link>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-olive-900 text-olive-100 py-10">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-serif mb-4">Resort das Oliveiras</h3>
            <p className="text-sm opacity-80">O refúgio perfeito para você e sua família. Natureza, conforto e sofisticação.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <p className="text-sm">reserva@oliveiras.com</p>
            <p className="text-sm">+55 (11) 99999-9999</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Endereço</h4>
            <p className="text-sm">Estrada das Oliveiras, km 42</p>
            <p className="text-sm">São Paulo - SP</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Admin Layout ---
interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: User;
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert('Para instalar o App: \nNo iPhone: Toque em Compartilhar e depois em "Adicionar à Tela de Início".\nNo Android: Toque nos três pontos e em "Instalar aplicativo".');
    }
  };

  const allNavItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Visão Geral', roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { path: '/admin/pos', icon: <ShoppingCart size={20} />, label: 'PDV (Vendas)', roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.RECEPTION, UserRole.KITCHEN, UserRole.PANTRY] },
    { path: '/admin/reservations', icon: <Calendar size={20} />, label: 'Reservas', roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.RECEPTION] },
    { path: '/admin/events', icon: <Users size={20} />, label: 'Eventos', roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.RECEPTION] },
    { path: '/admin/venues', icon: <Map size={20} />, label: 'Espaços & Locais', roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { path: '/admin/products', icon: <Tag size={20} />, label: 'Catálogo', roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.KITCHEN] },
    { path: '/admin/finance', icon: <DollarSign size={20} />, label: 'Financeiro', roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { path: '/admin/leads', icon: <Users size={20} />, label: 'CRM & Leads', roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.RECEPTION] },
    { path: '/admin/accommodations', icon: <Hotel size={20} />, label: 'Acomodações', roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.RECEPTION, UserRole.CLEANING, UserRole.MAINTENANCE] },
    { path: '/admin/content', icon: <Newspaper size={20} />, label: 'Blog & SEO', roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Usuários', roles: [UserRole.ADMIN] },
  ];

  const filteredNavItems = currentUser
    ? allNavItems.filter(item => item.roles.includes(currentUser.role))
    : [];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-olive-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-serif">Oliveiras Admin</h2>
            <p className="text-xs text-olive-300 mt-1">
              {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Painel Gerencial'}
            </p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-olive-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow mt-2 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-6 py-3 hover:bg-olive-800 transition-colors ${location.pathname === item.path ? 'bg-olive-800 border-l-4 border-olive-400' : ''
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-olive-800 space-y-2">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-olive-800 hover:bg-olive-700 text-white py-2 rounded-lg text-sm transition"
          >
            <Download size={16} /> Instalar App
          </button>

          <button
            onClick={() => {
              if (onLogout) onLogout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 text-red-300 hover:text-red-100 hover:bg-red-900/20 py-2 rounded-lg text-sm transition"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-olive-900">
            <Menu size={24} />
          </button>
          <span className="font-bold text-olive-900">Painel Admin</span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
