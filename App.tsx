import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminLayout, PublicLayout } from './components/Layouts';
import { PublicHome } from './pages/PublicHome';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCRM } from './pages/AdminCRM';
import { AdminAccommodations } from './pages/AdminAccommodations';
import { AdminReservations } from './pages/AdminReservations';
import { AdminEvents } from './pages/AdminEvents';
import { AdminVenues } from './pages/AdminVenues';
import { AdminContent } from './pages/AdminContent';
import { AdminFinance } from './pages/AdminFinance';
import { AdminProducts } from './pages/AdminProducts';
import { AdminPOS } from './pages/AdminPOS';
import { AdminUsers } from './pages/AdminUsers';
import { MOCK_LEADS, MOCK_RESERVATIONS, MOCK_ROOMS, MOCK_EVENTS, MOCK_NEWS, MOCK_TRANSACTIONS, MOCK_PRODUCTS, MOCK_VENUES } from './constants';
import { Lead, LeadStatus, Reservation, Room, RoomStatus, EventRequest, BlogPost, Transaction, ConsumptionItem, Product, Venue, Guest, User, UserRole } from './types';

// Simple Blog Page implementation
const BlogPage: React.FC<{ posts: BlogPost[] }> = ({ posts }) => (
  <div className="container mx-auto px-6 py-12">
    <h1 className="text-4xl font-serif font-bold text-olive-900 mb-8">Blog do Resort</h1>
    <div className="grid md:grid-cols-2 gap-8">
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={post.image || 'https://picsum.photos/600/300'} alt={post.title} className="w-full h-48 object-cover" />
          <div className="p-6">
            <span className="text-xs font-bold text-olive-600 uppercase">{post.category}</span>
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {post.seoKeywords?.map((k, i) => <span key={i} className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">#{k}</span>)}
            </div>
            <button className="text-olive-600 font-bold hover:underline">Ler mais</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Require Auth Component
const RequireAuth: React.FC<{ children: React.ReactNode; currentUser: User | null }> = ({ children, currentUser }) => {
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // --- Centralized State ---
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Auth State
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Administrador', email: 'admin@resort.com', password: '123', role: UserRole.ADMIN, active: true },
    { id: '2', name: 'Gerente', email: 'gerente@resort.com', password: '123', role: UserRole.MANAGEMENT, active: true },
    { id: '3', name: 'Recepção', email: 'recepcao@resort.com', password: '123', role: UserRole.RECEPTION, active: true },
    { id: '4', name: 'Chef Rai', email: 'cozinha@resort.com', password: '123', role: UserRole.KITCHEN, active: true },
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize with Mock Data
  useEffect(() => {
    setLeads(MOCK_LEADS);
    setReservations(MOCK_RESERVATIONS);
    setRooms(MOCK_ROOMS);
    setEvents(MOCK_EVENTS);
    setVenues(MOCK_VENUES);
    setPosts(MOCK_NEWS);
    setTransactions(MOCK_TRANSACTIONS);
    setProducts(MOCK_PRODUCTS);
  }, []);

  // --- Logic & Actions ---

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.password === pass && u.active);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || 'Novo Usuário',
      email: userData.email || '',
      password: userData.password || '123',
      role: userData.role || UserRole.RECEPTION,
      active: userData.active ?? true
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddLead = (leadData: Partial<Lead>) => {
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      name: leadData.name || 'Desconhecido',
      email: leadData.email || '',
      phone: leadData.phone || '',
      interest: leadData.interest || 'Hospedagem' as any,
      status: LeadStatus.NEW,
      guests: leadData.guests || 2,
      date: leadData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      tags: ['Site'],
      history: [`${new Date().toLocaleDateString('pt-BR')}: Lead criado via site`]
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));
  };

  const handleAddLeadNote = (id: string, note: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === id) {
        const timestamp = new Date().toLocaleDateString('pt-BR');
        return {
          ...lead,
          history: [...(lead.history || []), `${timestamp}: ${note}`]
        };
      }
      return lead;
    }));
  };

  const handleUpdateRoomStatus = (id: string, status: RoomStatus) => {
    setRooms(prev => prev.map(room => room.id === id ? { ...room, status } : room));
  };

  const handleCreateReservation = (data: Partial<Reservation>) => {
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      leadId: data.leadId!,
      guestName: data.guestName!,
      roomId: data.roomId!,
      checkIn: data.checkIn!,
      checkOut: data.checkOut!,
      status: 'Confirmado',
      totalAmount: data.totalAmount || 0,
      consumption: []
    };
    setReservations(prev => [newRes, ...prev]);
    handleUpdateLeadStatus(data.leadId!, LeadStatus.RESERVED);

    // Auto-create INCOME pending transaction
    const newTrans: Transaction = {
      id: `tx-${Date.now()}`,
      description: `Reserva ${newRes.guestName}`,
      amount: newRes.totalAmount,
      type: 'INCOME',
      category: 'Reservas',
      date: new Date().toISOString(),
      status: 'PENDING',
      referenceId: newRes.id
    };
    setTransactions(prev => [newTrans, ...prev]);
  };

  const handleAddConsumption = (reservationId: string, item: Omit<ConsumptionItem, 'id'>) => {
    setReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        const newItem: ConsumptionItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
        return { ...res, consumption: [...(res.consumption || []), newItem] };
      }
      return res;
    }));
  };

  const handleUpdateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        if (status === 'Check-in') handleUpdateRoomStatus(res.roomId, RoomStatus.OCCUPIED);
        else if (status === 'Check-out') {
          handleUpdateRoomStatus(res.roomId, RoomStatus.CLEANING);
          // Logic to finalize invoice could go here
        }
        return { ...res, status };
      }
      return res;
    }));
  };

  // --- Event Logic ---
  const handleUpdateEventStatus = (id: string, status: EventRequest['status']) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status } : ev));
  };

  const handleUpdateEventGuests = (eventId: string, guests: Guest[]) => {
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, guestList: guests } : ev));
  };

  const handleAssignVenue = (eventId: string, venueId: string) => {
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, venueId } : ev));
  };

  const handleCreateEvent = (eventData: Partial<EventRequest>) => {
    const newEvent: EventRequest = {
      id: Math.random().toString(36).substr(2, 9),
      leadId: 'manual', // Or select a lead if we add that field
      title: eventData.title || 'Novo Evento',
      type: eventData.type || 'Outro',
      date: eventData.date || new Date().toISOString(),
      guests: eventData.guests || 0,
      budget: eventData.budget || 0,
      status: 'Solicitado',
      venueId: eventData.venueId,
      guestList: []
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleConfirmEvent = (eventId: string, depositAmount: number) => {
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, status: 'Confirmado' } : ev));

    // Create Deposit Transaction
    const event = events.find(e => e.id === eventId);
    if (depositAmount > 0) {
      const newTrans: Transaction = {
        id: `tx-${Date.now()}`,
        description: `Sinal/Reserva: ${event?.title}`,
        amount: depositAmount,
        type: 'INCOME',
        category: 'Eventos',
        date: new Date().toISOString(),
        status: 'PAID',
        referenceId: eventId
      };
      setTransactions(prev => [newTrans, ...prev]);
    }
  };

  // --- Venues Logic ---
  const handleAddVenue = (venue: Venue) => {
    setVenues(prev => [...prev, venue]);
  };

  const handleDeleteVenue = (id: string) => {
    setVenues(prev => prev.filter(v => v.id !== id));
  };

  const handleAddPost = (postData: Partial<BlogPost>) => {
    const newPost: BlogPost = {
      id: Math.random().toString(36).substr(2, 9),
      title: postData.title || 'Sem título',
      category: postData.category || 'Geral',
      excerpt: postData.excerpt || '',
      content: postData.content || '',
      image: postData.image || '',
      date: new Date().toISOString(),
      seoKeywords: postData.seoKeywords || [],
      seoDescription: postData.seoDescription || ''
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: productData.name || 'Novo Produto',
      category: productData.category || 'Outro',
      price: productData.price || 0,
      image: productData.image || '',
      description: productData.description || '',
      available: productData.available ?? true
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><PublicHome onAddLead={handleAddLead} reservations={reservations} /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogPage posts={posts} /></PublicLayout>} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminDashboard leads={leads} reservations={reservations} />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/users" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminUsers
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                currentUser={currentUser!}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/finance" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminFinance transactions={transactions} />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/leads" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminCRM
                leads={leads}
                onUpdateStatus={handleUpdateLeadStatus}
                onAddNote={handleAddLeadNote}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/reservations" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminReservations
                reservations={reservations}
                leads={leads}
                rooms={rooms}
                onCreateReservation={handleCreateReservation}
                onUpdateStatus={handleUpdateReservationStatus}
                onAddConsumption={handleAddConsumption}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/accommodations" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminAccommodations
                rooms={rooms}
                onUpdateStatus={handleUpdateRoomStatus}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/events" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminEvents
                events={events}
                venues={venues}
                onUpdateEventStatus={handleUpdateEventStatus}
                onUpdateEventGuests={handleUpdateEventGuests}
                onAssignVenue={handleAssignVenue}
                onCreateEvent={handleCreateEvent}
                onConfirmEvent={handleConfirmEvent}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/venues" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminVenues
                venues={venues}
                onAddVenue={handleAddVenue}
                onDeleteVenue={handleDeleteVenue}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/content" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminContent
                posts={posts}
                onAddPost={handleAddPost}
                onDeletePost={handleDeletePost}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/products" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminProducts
                products={products}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="/admin/pos" element={
          <RequireAuth currentUser={currentUser}>
            <AdminLayout currentUser={currentUser} onLogout={handleLogout}>
              <AdminPOS
                products={products}
                reservations={reservations}
                onAddConsumption={handleAddConsumption}
              />
            </AdminLayout>
          </RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
