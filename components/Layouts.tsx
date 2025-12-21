import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Home, Hotel, Newspaper, 
  Menu, X, DollarSign, ShoppingCart, Tag, Map, ChefHat, 
  Settings, LogOut, ChevronRight, Clock, ChevronLeft, Bell,
  AlertCircle, CheckCircle2, Info, Search, Terminal,
  Instagram, Facebook, Linkedin, Play, Receipt, Globe, User as UserIcon
} from 'lucide-react';
import { User, Role, SystemSettings, Permission, AppNotification, Reservation } from '../types';
import { LoginModal } from './LoginModal';
import { GuestLoginModal } from './GuestLoginModal';
import { UserProfileModal } from './UserProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  settings?: SystemSettings;
  onLogin?: (user: User) => void;
  onGuestLogin?: (reservation: Reservation) => void;
}

interface AdminLayoutProps extends LayoutProps {
  currentUser: User;
  userRole?: Role;
  allUsers: User[]; 
  onSwitchUser: (userId: string) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onUpdateUser?: (user: User) => void;
}

const getIconColor = (perm: string) => {
  switch (perm) {
    case 'VIEW_DASHBOARD': return 'bg-gradient-to-br from-blue-500 to-blue-600';
    case 'VIEW_TIMESHEET': return 'bg-gradient-to-br from-orange-400 to-orange-600';
    case 'VIEW_KITCHEN': return 'bg-gradient-to-br from-emerald-500 to-emerald-700';
    case 'VIEW_POS': return 'bg-gradient-to-br from-violet-500 to-purple-700';
    case 'VIEW_RESERVATIONS': return 'bg-gradient-to-br from-sky-400 to-blue-600';
    case 'VIEW_EVENTS': return 'bg-gradient-to-br from-pink-500 to-rose-600';
    case 'VIEW_VENUES': return 'bg-gradient-to-br from-amber-400 to-orange-600';
    case 'VIEW_PRODUCTS': return 'bg-gradient-to-br from-indigo-500 to-blue-800';
    case 'VIEW_FINANCE': return 'bg-gradient-to-br from-green-500 to-emerald-700';
    case 'VIEW_CRM': return 'bg-gradient-to-br from-cyan-400 to-blue-600';
    case 'VIEW_ACCOMMODATIONS': return 'bg-gradient-to-br from-rose-400 to-red-600';
    case 'VIEW_CONTENT': return 'bg-gradient-to-br from-lime-500 to-green-700';
    case 'VIEW_SETTINGS': return 'bg-gradient-to-br from-slate-500 to-slate-700';
    default: return 'bg-gray-500';
  }
};

export const PublicLayout: React.FC<LayoutProps> = ({ children, settings, onLogin, onGuestLogin }) => {
  const brandColor = (settings?.primaryColor && settings.primaryColor.trim() !== '') ? settings.primaryColor : '#161e39'; 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User) => {
    if (onLogin) onLogin(user);
    setIsLoginOpen(false);
    navigate('/admin'); 
  };

  const handleGuestLoginSuccess = (reservation: Reservation) => {
      if (onGuestLogin) onGuestLogin(reservation);
      setIsGuestModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white">
      <nav className="text-white shadow-lg sticky top-0 z-50 transition-all duration-300 bg-[#161e39]" style={{ backgroundColor: brandColor }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center h-16 lg:h-20">
          <Link to="/" className="text-xl md:text-2xl font-serif font-bold tracking-wider flex items-center gap-3">
            {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.resortName} className="h-10 w-auto object-contain brightness-0 invert" />
            ) : (
                <span>{settings?.resortName || 'Resort das Oliveiras'}</span>
            )}
          </Link>
          <div className="hidden lg:flex space-x-1 items-center">
            <Link to="/" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-2xl transition">Início</Link>
            <a href="#acomodacoes" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-2xl transition">Acomodações</a>
            <a href="#eventos" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-2xl transition">Eventos</a>
            <a href="#/reservas" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-2xl transition">Reserva</a>
            <Link to="/blog" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-2xl transition">Blog</Link>
            
            <button 
                onClick={() => setIsLoginOpen(true)}
                title="Área Administrativa"
                className="ml-4 flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-all text-sm font-medium text-white/80 hover:text-white"
            >
                <div className="relative group">
                    <Settings size={18} className="relative z-10 text-white group-hover:animate-[spin_4s_linear_infinite] group-hover:text-emerald-400 transition-colors" />
                </div>
                <span>ADM</span>
            </button>

            <button
                onClick={() => setIsGuestModalOpen(true)}
                className="ml-2 px-6 py-2.5 bg-olive-600 rounded-full text-sm font-bold text-white tracking-wide hover:bg-olive-500 transition-all shadow-lg hover:shadow-olive-600/50 flex items-center gap-2"
            >
                <Receipt size={16} /> Comanda
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
             <button onClick={() => setIsGuestModalOpen(true)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
                <Receipt size={20} />
             </button>
             <button 
               onClick={() => setIsMobileMenuOpen(true)} 
               className="w-10 h-10 bg-white text-olive-800 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
             >
               <Menu size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY - iOS STYLE */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-xl flex flex-col animate-fade-in">
              <div className="flex justify-between items-center p-6 text-white safe-area-top">
                  <span className="text-xl font-bold tracking-tight">Menu Principal</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20 transition-colors"
                  >
                      <X size={20} />
                  </button>
              </div>
              
              <div className="flex-grow flex items-center justify-center p-6 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-12 w-full max-w-sm">
                      {[
                          { name: 'Início', icon: <Home size={32} strokeWidth={1.5} />, color: 'bg-gradient-to-b from-blue-400 to-blue-600', text: 'Início', action: () => { navigate('/'); setIsMobileMenuOpen(false); } },
                          { name: 'Quartos', icon: <Hotel size={32} strokeWidth={1.5} />, color: 'bg-gradient-to-b from-indigo-400 to-indigo-600', text: 'Quartos', action: () => { window.location.href='#acomodacoes'; setIsMobileMenuOpen(false); } },
                          { name: 'Eventos', icon: <Calendar size={32} strokeWidth={1.5} />, color: 'bg-gradient-to-b from-purple-400 to-purple-600', text: 'Eventos', action: () => { window.location.href='#eventos'; setIsMobileMenuOpen(false); } },
                          { name: 'Reservar', icon: <CheckCircle2 size={32} strokeWidth={1.5} />, color: 'bg-gradient-to-b from-teal-400 to-teal-600', text: 'Reservar', action: () => { window.location.href='#/reservas'; setIsMobileMenuOpen(false); } },
                          { name: 'Login', icon: <Settings size={32} strokeWidth={1.5} />, color: 'bg-gradient-to-b from-slate-600 to-slate-800', text: 'ADM', action: () => { setIsMobileMenuOpen(false); setIsLoginOpen(true); } },
                          { name: 'Comanda', icon: <Receipt size={32} strokeWidth={1.5} />, color: 'bg-gradient-to-b from-emerald-400 to-emerald-600', text: 'Comanda', action: () => { setIsMobileMenuOpen(false); setIsGuestModalOpen(true); } },
                      ].map((item, idx) => (
                          <button 
                            key={idx}
                            onClick={item.action}
                            className="flex flex-col items-center gap-3 group"
                            style={{ animation: `fade-in-up 0.5s ease-out ${idx * 0.05}s backwards` }}
                          >
                              <div className={`w-20 h-20 rounded-[22px] ${item.color} flex items-center justify-center text-white shadow-xl shadow-black/10 group-active:scale-95 transition-all duration-200 border border-white/10 ring-4 ring-transparent group-active:ring-white/10`}>
                                  <div className="drop-shadow-md">{item.icon}</div>
                              </div>
                              <span className="text-white text-xs font-medium tracking-wide drop-shadow-md opacity-90">{item.text}</span>
                          </button>
                      ))}
                  </div>
              </div>

              <div className="p-8 text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  {settings?.resortName || 'Resort das Oliveiras'}
              </div>
          </div>
      )}
      <main className="flex-grow">{children}</main>
      
      {/* Login Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLoginSuccess} 
      />
      <GuestLoginModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onLogin={handleGuestLoginSuccess}
      />
    </div>
  );
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, settings, currentUser, userRole, allUsers, onSwitchUser, notifications, onMarkNotificationRead, onUpdateUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDevSwitcher, setShowDevSwitcher] = useState(false);
  const [isAdminMobileMenuOpen, setIsAdminMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const menuStyle = settings?.menuStyle || 'STANDARD';
  const menuBgColor = settings?.menuBackgroundColor || '#2d4227';
  
  const userNotifications = notifications.filter(n => !n.roleId || n.roleId === currentUser?.roleId);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const hasPermission = (perm: Permission) => {
      // MASTER ADMIN BYPASS: Ensures buttons never disappear for the owner
      if (currentUser?.email === 'admin@elance.com' || userRole?.name === 'admin' || userRole?.id === 'role-admin') {
          return true;
      }
      return userRole?.permissions.includes(perm) || false;
  };

  const handleUpdateLocalUser = (updated: User) => {
      // If parent provides a callback, use it to update global state
      if (onUpdateUser) onUpdateUser(updated);
  };

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard />, label: 'Início', perm: 'VIEW_DASHBOARD' },
    { path: '/admin/timesheet', icon: <Clock />, label: 'Ponto', perm: 'VIEW_TIMESHEET' },
    { path: '/admin/kitchen', icon: <ChefHat />, label: 'Cozinha', perm: 'VIEW_KITCHEN' },
    { path: '/admin/pos', icon: <ShoppingCart />, label: 'PDV', perm: 'VIEW_POS' },
    { path: '/admin/reservations', icon: <Calendar />, label: 'Reservas', perm: 'VIEW_RESERVATIONS' },
    { path: '/admin/events', icon: <Users />, label: 'Eventos', perm: 'VIEW_EVENTS' },
    { path: '/admin/venues', icon: <Map />, label: 'Locais', perm: 'VIEW_VENUES' },
    { path: '/admin/products', icon: <Tag />, label: 'Catálogo', perm: 'VIEW_PRODUCTS' },
    { path: '/admin/finance', icon: <DollarSign />, label: 'Financeiro', perm: 'VIEW_FINANCE' },
    { path: '/admin/leads', icon: <Search />, label: 'CRM', perm: 'VIEW_CRM' },
    { path: '/admin/clients', icon: <UserIcon />, label: 'Clientes', perm: 'VIEW_RESERVATIONS' }, 
    { path: '/admin/accommodations', icon: <Hotel />, label: 'Quartos', perm: 'VIEW_ACCOMMODATIONS' },
    { path: '/admin/integrations', icon: <Globe />, label: 'Canais', perm: 'VIEW_SETTINGS' },
    { path: '/admin/content', icon: <Newspaper />, label: 'Conteúdo', perm: 'VIEW_CONTENT' },
    { path: '/admin/settings', icon: <Settings />, label: 'Ajustes', perm: 'VIEW_SETTINGS' },
  ];

  const visibleNavItems = navItems.filter(item => hasPermission(item.perm as Permission));
  const sidebarWidth = isCollapsed ? 'w-24' : (menuStyle === 'IOS' ? 'w-[280px]' : 'w-64');

  return (
    <div className={`flex h-screen font-sans ${menuStyle === 'IOS' ? 'bg-[#F2F2F7]' : 'bg-gray-100'}`}>
      {/* Sidebar (Desktop) */}
      <aside 
        className={`${sidebarWidth} h-full hidden lg:flex flex-col transition-all duration-500 relative z-[100] shadow-2xl overflow-hidden
          ${menuStyle === 'IOS' ? 'border-r border-stone-200' : ''}`}
        style={{ 
          backgroundColor: menuStyle === 'IOS' ? `${menuBgColor}F2` : menuBgColor, 
          color: 'white',
          backdropFilter: menuStyle === 'IOS' ? 'blur(10px)' : 'none'
        }}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-7 h-7 bg-white text-stone-900 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50 border border-stone-200"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`flex flex-col ${isCollapsed ? 'items-center py-4' : 'bg-stone-900 pb-6'}`}>
           {!isCollapsed ? (
             <div className="mb-6 px-6 pt-6">
                {settings?.logoUrl ? (
                   <img src={settings.logoUrl} alt="Logo" className="max-h-12 w-auto object-contain" />
                ) : (
                   <h2 className="text-base font-bold font-serif truncate text-white drop-shadow-md">
                      {settings?.resortName || 'Gestão Oliveiras'}
                   </h2>
                )}
             </div>
           ) : (
             <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg mb-6 mt-4">
                {settings?.logoUrl ? <img src={settings.logoUrl} className="w-6 h-6 object-contain brightness-0 invert" /> : 'O'}
             </div>
           )}

           {!isCollapsed && (
             <div className="relative group px-4">
                <div 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 p-2.5 rounded-2xl transition-all bg-white/10 hover:bg-white/20 cursor-pointer border border-white/5"
                >
                    <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?u=guest'} alt="User" className="w-9 h-9 rounded-full bg-gray-300 object-cover shadow-sm ring-2 ring-white/10" />
                    <div className="overflow-hidden flex-grow">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold truncate text-white hover:text-olive-200 transition-colors">{currentUser?.name || 'Carregando...'}</p>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                                    className="relative p-1 rounded-lg hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                                    title="Notificações"
                                >
                                    <Bell size={14} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full ring-2 ring-stone-900">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <Link 
                                    to="/"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors"
                                    title="Sair para o Site"
                                >
                                    <LogOut size={14} className="rotate-180" />
                                </Link>
                            </div>
                        </div>
                        <p className="text-[8px] uppercase font-bold tracking-widest text-white/50">{userRole?.name || 'Aguardando Perfil'}</p>
                    </div>
                </div>
                {showNotifications && (
                    <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl z-[999] border border-stone-200 overflow-hidden animate-fade-in-up">
                        <div className="p-3 border-b bg-stone-50 flex justify-between items-center text-stone-900">
                            <span className="text-[10px] font-bold text-stone-600 uppercase">Notificações</span>
                            <button onClick={() => setShowNotifications(false)}><X size={12} className="text-stone-400"/></button>
                        </div>
                        <div className="max-h-60 overflow-y-auto bg-white text-stone-800">
                            {userNotifications.length === 0 ? (
                                <p className="p-6 text-center text-[10px] text-stone-400 italic">Nenhum aviso.</p>
                            ) : (
                                userNotifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => { onMarkNotificationRead(n.id); setShowNotifications(false); }}
                                        className={`p-3 border-b hover:bg-stone-50 transition-colors cursor-pointer flex gap-3 ${n.read ? 'opacity-50' : ''}`}
                                    >
                                        <div className={`mt-0.5 ${n.type === 'ALERT' ? 'text-red-500' : n.type === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'}`}>
                                            {n.type === 'ALERT' ? <AlertCircle size={14}/> : n.type === 'SUCCESS' ? <CheckCircle2 size={14}/> : <Info size={14}/>}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-800">{n.title}</p>
                                            <p className="text-[9px] text-stone-500 leading-tight mt-0.5">{n.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
             </div>
           )}
        </div>

        {/* Navegação Desktop */}
        <nav className={`flex-grow overflow-y-auto px-2 pb-4 custom-scrollbar
           ${!isCollapsed && menuStyle === 'IOS' ? `grid grid-cols-${settings?.menuColumns || 2}` : 'flex flex-col'}`}
          style={{ gap: `${settings?.menuItemSpacing ? settings.menuItemSpacing + 'px' : '6px'}` }}
        >
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const iconBg = getIconColor(item.perm);

            if (menuStyle === 'IOS' && !isCollapsed) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-2 rounded-[20px] transition-all duration-300 group
                    ${isActive ? 'bg-white shadow-xl scale-105' : 'hover:bg-white/10 hover:scale-102'}`}
                >
                  <div 
                  style={{ 
                      padding: `${settings?.menuButtonPadding ? settings.menuButtonPadding + 'px' : '12px'}`,
                      borderRadius: `${settings?.menuBorderRadius ? settings.menuBorderRadius + 'px' : '16px'}`
                  }} 
                  className={`mb-1 shadow-sm transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${iconBg}
                  ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-olive-700 shadow-olive-500/50' : ''}`}
              >
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: settings?.menuIconSize || 20, className: "text-white drop-shadow-md" })}
              </div>
                  <span className={`font-bold text-center leading-tight tracking-tight px-1 ${isActive ? 'text-stone-900' : 'text-white'}`}
                        style={{ fontSize: `${settings?.menuFontSize || 12}px` }}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-xl transition-all duration-300 relative group
                  ${isCollapsed ? 'justify-center p-2' : 'px-2 py-1.5'}
                  ${isActive 
                    ? 'bg-white/20 text-white shadow-lg border border-white/20' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <div className={`shrink-0 rounded-lg flex items-center justify-center transition-all shadow-sm ${iconBg}`}
                  style={{ width: `${(settings?.menuIconSize || 18) + 10}px`, height: `${(settings?.menuIconSize || 18) + 10}px` }}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: settings?.menuIconSize || 18, className: 'text-white' })}
                </div>
                {!isCollapsed && <span className="ml-2.5 font-bold tracking-tight truncate text-white" style={{ fontSize: `${settings?.menuFontSize || 12}px` }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV - iOS Style */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full z-[990] flex items-center justify-between px-6 p-2 ring-1 ring-black/5">
        <div className="flex items-center gap-6 w-full justify-between">
           
           {/* Profile Button */}
           <button onClick={() => setIsProfileModalOpen(true)} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform text-stone-400 hover:text-olive-600">
              <img src={currentUser?.avatar || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-stone-200 object-cover" />
           </button>

           {/* Central MENU Button */}
           <button 
              onClick={() => setIsAdminMobileMenuOpen(true)}
              className="relative -top-6"
           >
              <div className="w-16 h-16 bg-olive-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-olive-900/40 active:scale-90 transition-all border-4 border-[#F2F2F7]">
                <Menu size={26} />
              </div>
           </button>

           {/* Logout Button */}
           <Link to="/" className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform text-stone-400 hover:text-red-500">
              <div className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full">
                  <LogOut size={18} />
              </div>
           </Link>
        </div>
      </div>

      {/* ADMIN MOBILE MENU OVERLAY */}
      {isAdminMobileMenuOpen && (
          <div className="fixed inset-0 z-[999] bg-stone-900/95 backdrop-blur-xl flex flex-col animate-fade-in">
              <div 
                className="flex justify-between items-center p-6 text-white safe-area-top shrink-0 relative z-10 bg-gradient-to-b from-stone-900/50 to-transparent"
                onClick={() => { setIsAdminMobileMenuOpen(false); setIsProfileModalOpen(true); }}
              >
                  <div className="flex items-center gap-3 cursor-pointer">
                     <img src={currentUser?.avatar} className="w-12 h-12 rounded-full border-2 border-white/20 bg-stone-100 object-cover" />
                     <div>
                        <h2 className="text-xl font-bold leading-tight">{currentUser?.name}</h2>
                        <p className="text-xs opacity-60 uppercase tracking-widest">{userRole?.name}</p>
                     </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsAdminMobileMenuOpen(false); }}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20 transition-colors"
                  >
                      <X size={20} />
                  </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 pt-4 pb-32 flex flex-col items-center justify-start">
                  <div className="grid grid-cols-3 gap-x-[5vw] gap-y-[5vh] w-full max-w-sm mx-auto place-items-center">
                      {visibleNavItems.map((item, idx) => (
                          <button 
                            key={idx}
                            onClick={() => { navigate(item.path); setIsAdminMobileMenuOpen(false); }}
                            className="flex flex-col items-center gap-2 group w-full"
                            style={{ animation: `fade-in-up 0.5s ease-out ${idx * 0.05}s backwards` }}
                          >
                              <div className={`w-[22vw] h-[22vw] max-w-[80px] max-h-[80px] rounded-[22px] ${getIconColor(item.perm)} flex items-center justify-center text-white shadow-xl shadow-black/20 group-active:scale-95 transition-all duration-200 border border-white/10 ring-4 ring-transparent group-active:ring-white/10`}>
                                  <div className="drop-shadow-md">{React.cloneElement(item.icon as React.ReactElement<any>, { size: 28, strokeWidth: 1.5 })}</div>
                              </div>
                              <span className="text-white text-[11px] font-medium tracking-wide drop-shadow-md opacity-90 text-center leading-tight line-clamp-1 w-full overflow-hidden text-ellipsis px-1">{item.label}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* LOGIN RÁPIDO - Desktop Only */}
      <div className="hidden lg:block fixed bottom-6 left-6 z-[9999] group">
          <button 
            onClick={() => setShowDevSwitcher(!showDevSwitcher)}
            className="p-3 bg-stone-900 text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-110 transition-all flex items-center gap-2 active:scale-95 border border-white/20 animate-pulse hover:animate-none"
          >
            <Terminal size={22} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-xs font-black tracking-widest uppercase">Acesso Simulado</span>
          </button>
          
          {showDevSwitcher && (
            <div className="absolute bottom-16 left-0 bg-white border border-stone-200 rounded-[30px] shadow-2xl w-72 p-4 animate-fade-in-up text-stone-900 border-stone-200">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Trocar Perfil:</p>
                    <button onClick={() => setShowDevSwitcher(false)}><X size={14} className="text-stone-300"/></button>
                </div>
                <div className="space-y-2">
                    {allUsers.map(u => (
                        <button 
                            key={u.id}
                            onClick={() => { onSwitchUser(u.id); setShowDevSwitcher(false); }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all border
                                ${currentUser?.id === u.id ? 'bg-olive-600 text-white border-olive-700 shadow-lg' : 'bg-stone-50 border-stone-100 hover:bg-stone-100'}`}
                        >
                            <img src={u.avatar} className="w-9 h-9 rounded-full border-2 border-white/20 object-cover" />
                            <div className="overflow-hidden">
                                <p className={`text-xs font-black truncate ${currentUser?.id === u.id ? 'text-white' : 'text-stone-800'}`}>{u.name}</p>
                                <p className={`text-[9px] font-bold uppercase ${currentUser?.id === u.id ? 'text-white/60' : 'text-stone-400'}`}>{u.roleId}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
          )}
      </div>

      <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-10
           ${menuStyle === 'IOS' ? 'bg-[#F2F2F7]' : 'bg-gray-100'}`}>
        {children}
      </main>

      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateLocalUser}
      />
    </div>
  );
};
