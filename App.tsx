
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AdminLayout, PublicLayout } from './components/Layouts';
import { Login } from './pages/Login';
import { PublicHome } from './pages/PublicHome';
import { PublicReservations } from './pages/PublicReservations';
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
import { AdminKitchen } from './pages/AdminKitchen';
import { AdminSettings } from './pages/AdminSettings';
import { AdminTimesheet } from './pages/AdminTimesheet';
import { AdminIntegrations } from './pages/AdminIntegrations';

import { AdminClients } from './pages/AdminClients';
import { Lead, LeadStatus, Reservation, Room, RoomStatus, EventRequest, BlogPost, Transaction, Product, Venue, User, Role, SystemSettings, TimeLog, AppNotification, Client, ConsumptionItem, EventParticipant } from './types';
import { Loader2 } from 'lucide-react';

import { GuestLogin } from './pages/GuestLogin';
import { GuestDashboard } from './pages/GuestDashboard';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [guestReservation, setGuestReservation] = useState<Reservation | null>(null);
  
  // States da Aplicação
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]); // Inicializar vazio, buscar do banco
  const [events, setEvents] = useState<EventRequest[]>([]); // Inicializar vazio
  const [venues, setVenues] = useState<Venue[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({} as SystemSettings);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  // --- HANDLERS DE ESTADO E SUPABASE ---
  
  const handleAddClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = { ...clientData, id: `c-${Date.now()}` }; 
    // In real app, database sets ID or we use uuid.
    await supabase.from('clients').insert([newClient]);
    setClients(prev => [newClient as Client, ...prev]);
  };

  const handleUpdateClient = async (clientData: Client) => {
    await supabase.from('clients').update(clientData).eq('id', clientData.id);
    setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
  };
  
  const handleDeleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleAddProduct = async (productData: Partial<Product>) => {
    const newProduct = { 
      ...productData, 
      id: productData.id || `p-${Date.now()}`,
      available: productData.available ?? true 
    } as Product;
    
    const dbPayload = {
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        available: newProduct.available,
        image: newProduct.image,
        description: newProduct.description,
        is_room_service: newProduct.isRoomService,
        needs_preparation: newProduct.needsPreparation,
        preparation_time: newProduct.preparationTime
    };

    const { error } = await supabase.from('products').insert([dbPayload]);
    
    if (!error) {
        setProducts(prev => [newProduct, ...prev]);
    } else {
        console.error("Error adding product:", error);
        alert("Erro ao adicionar produto.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddUser = async (userData: User) => {
    await supabase.from('users').insert([userData]);
    setUsers(prev => [userData, ...prev]);
  };

  const handleDeleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleUpdateUser = async (userData: User) => {
    await supabase.from('users').update(userData).eq('id', userData.id);
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
  };

  const handleAddRole = async (roleData: Role) => {
    await supabase.from('roles').insert([roleData]);
    setRoles(prev => [roleData, ...prev]);
  };

  const handleDeleteRole = async (id: string) => {
    await supabase.from('roles').delete().eq('id', id);
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRole = async (roleData: Role) => {
    await supabase.from('roles').update(roleData).eq('id', roleData.id);
    setRoles(prev => prev.map(r => r.id === roleData.id ? roleData : r));
  };

  const handleAddVenue = async (venueData: Venue) => {
    const dbPayload = {
        id: venueData.id,
        name: venueData.name,
        capacity: venueData.capacity,
        price_per_day: venueData.pricePerDay,
        description: venueData.description,
        image: venueData.image,
        features: venueData.features
    };
    await supabase.from('venues').insert([dbPayload]);
    setVenues(prev => [venueData, ...prev]);
  };

  const handleDeleteVenue = async (id: string) => {
    await supabase.from('venues').delete().eq('id', id);
    setVenues(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateLeadStatus = async (id: string, status: LeadStatus) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleAddLead = async (leadData: Partial<Lead>) => {
    const newLead = { ...leadData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: LeadStatus.NEW };
    await supabase.from('leads').insert([newLead]);
    setLeads(prev => [newLead as Lead, ...prev]);
  };

  const handleAddTimeLog = async (log: TimeLog) => {
    await supabase.from('time_logs').insert([log]);
    setTimeLogs(prev => [log, ...prev]);
  };

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    // Map camelCase to snake_case for DB
    const dbPayload = {
        id: 'default',
        resort_name: newSettings.resortName,
        resort_cnpj: newSettings.resortCnpj,
        // address: newSettings.resortAddress, // DB uses 'address' based on check, verify mapping
        logo_url: newSettings.logoUrl,
        primary_color: newSettings.primaryColor,
        contact_email: newSettings.contactEmail,
        contact_phone: newSettings.contactPhone,
        instagram_url: newSettings.instagramUrl,
        facebook_url: newSettings.facebookUrl,
        linkedin_url: newSettings.linkedinUrl,
        youtube_url: newSettings.youtubeUrl,
        menu_style: newSettings.menuStyle,
        menu_background_color: newSettings.menuBackgroundColor,
        menu_icon_size: newSettings.menuIconSize,
        menu_font_size: newSettings.menuFontSize,
        menu_item_spacing: newSettings.menuItemSpacing,
        menu_button_padding: newSettings.menuButtonPadding,
        menu_border_radius: newSettings.menuBorderRadius,
        menu_columns: newSettings.menuColumns,
        webhook_url: newSettings.webhookUrl,
        outbound_webhook_url: newSettings.outboundWebhookUrl,
        api_key: newSettings.apiKey,
        workplace_lat: newSettings.workplaceLat,
        workplace_lng: newSettings.workplaceLng,
        workplace_radius: newSettings.workplaceRadius,
        ai_keywords_queue: newSettings.aiKeywordsQueue,
        is_auto_pilot_active: newSettings.isAutoPilotActive
    };
    
    const { error } = await supabase.from('settings').upsert(dbPayload);
    if (error) {
        console.error("Error updating settings:", error);
        alert("Erro ao salvar configurações.");
    } else {
        setSettings(newSettings);
    }
  };

  // --- AUTH & FETCH ---

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (userData) setAuthenticatedUser(userData as User);
        }
      } catch (e) {
        console.warn("Erro ao verificar sessão.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);



  const fetchData = useCallback(async () => {
    try {
      const [
        { data: lData }, { data: rData }, { data: rmData }, { data: evData },
        { data: vnData }, { data: pData }, { data: tData }, { data: prData },
        { data: uData }, { data: roData }, { data: sData }, { data: cData },
        { data: epData }
      ] = await Promise.all([
        supabase.from('leads').select('*').limit(50),
        supabase.from('reservations').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('event_requests').select('*'),
        supabase.from('venues').select('*'),
        supabase.from('blog_posts').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('products').select('*'),
        supabase.from('users').select('*'),
        supabase.from('roles').select('*'),
        supabase.from('settings').select('*').single(),
        supabase.from('clients').select('*'),
        supabase.from('event_participants').select('*')
      ]);

      if (lData?.length) setLeads(lData);
      
      if (rData?.length) {
          const mappedReservations = rData.map((r: any) => ({
              id: r.id,
              guestName: r.guest_name,
              roomId: r.room_id,
              checkIn: r.check_in,
              checkOut: r.check_out,
              status: r.status,
              totalAmount: r.total_amount,
              accessCode: r.access_code,
              consumption: r.consumption,
              leadId: r.lead_id,
              clientId: r.client_id,
              guestsDetails: r.guests_details,
              guestContact: r.guest_contact,
              guestEmail: r.guest_email
          }));
          setReservations(mappedReservations);
      }

      if (rmData) {
          const mappedRooms = rmData.map((r: any) => ({
              ...r,
              bedConfig: r.bed_config,
              currentGuestName: r.current_guest_name,
              features: r.features
          }));
          setRooms(mappedRooms);
      }
      if (evData?.length) {
          const mappedEvents = evData.map((e: any) => ({
              id: e.id,
              leadId: e.lead_id,
              title: e.title,
              type: e.type,
              date: e.date,
              guests: e.guests,
              budget: e.budget,
              status: e.status,
              venueId: e.venue_id,
              showOnSite: e.show_on_site,
              description: e.description,
              image: e.image,
              startDate: e.start_date,
              endDate: e.end_date,
              coverImage: e.cover_image,
              galleryImages: e.gallery_images,
              organizerName: e.organizer_name,
              category: e.category,
              cateringOptions: e.catering_options,
              maxCapacity: e.max_capacity,
              totalCost: e.total_cost,
              depositAmount: e.deposit_amount,
              paymentTerms: e.payment_terms,
              isPublicTicket: e.is_public_ticket,
              ticketPrice: e.ticket_price,
              participants: epData?.filter((p: any) => p.event_id === e.id).map((p: any) => ({
                  id: p.id,
                  eventId: p.event_id,
                  name: p.name,
                  email: p.email,
                  phone: p.phone,
                  status: p.status,
                  ticketPurchased: p.ticket_purchased,
                  purchaseDate: p.purchase_date
              })) || []
          }));
          setEvents(mappedEvents);
      }
      


      if (vnData?.length) {
          const mappedVenues = vnData.map((v: any) => ({
              id: v.id,
              name: v.name,
              capacity: v.capacity,
              pricePerDay: v.price_per_day,
              description: v.description,
              image: v.image,
              features: v.features
          }));
          setVenues(mappedVenues);
      }
      if (pData?.length) setPosts(pData);
      if (tData?.length) setTransactions(tData);
      if (prData?.length) {
          const mappedProducts = prData.map((p: any) => ({
              ...p,
              isRoomService: p.is_room_service,
              needsPreparation: p.needs_preparation,
              preparationTime: p.preparation_time
          }));
          setProducts(mappedProducts);
      }
      if (uData?.length) setUsers(uData);
      if (roData?.length) setRoles(roData);
      if (sData) {
          // Map snake_case from DB to camelCase for App
          const mappedSettings: SystemSettings = {
              ...sData,
              resortName: sData.resort_name,
              resortCnpj: sData.resort_cnpj,
              resortAddress: sData.address, // DB field is 'address'
              logoUrl: sData.logo_url,
              primaryColor: sData.primary_color,
              contactEmail: sData.contact_email,
              contactPhone: sData.contact_phone,
              instagramUrl: sData.instagram_url,
              facebookUrl: sData.facebook_url,
              linkedinUrl: sData.linkedin_url,
              youtubeUrl: sData.youtube_url,
              webhookUrl: sData.webhook_url,
              outboundWebhookUrl: sData.outbound_webhook_url,
              apiKey: sData.api_key,
              menuStyle: sData.menu_style,
              menuBackgroundColor: sData.menu_background_color,
              menuIconSize: sData.menu_icon_size,
              menuFontSize: sData.menu_font_size,
              menuItemSpacing: sData.menu_item_spacing,
              menuButtonPadding: sData.menu_button_padding,
              menuBorderRadius: sData.menu_border_radius,
              menuColumns: sData.menu_columns,
              workplaceLat: sData.workplace_lat,
              workplaceLng: sData.workplace_lng,
              workplaceRadius: sData.workplace_radius,
              aiKeywordsQueue: sData.ai_keywords_queue,
              isAutoPilotActive: sData.is_auto_pilot_active
          };
          setSettings(mappedSettings);
      }
      if (cData?.length) setClients(cData);
    } catch (error) {
      console.warn('Operando com Mocks ou erro de fetch.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userRole = roles.find(r => r.id === authenticatedUser?.roleId);

    // --- NEW HANDLERS ---

  const handleUpdateEventStatus = async (id: string, status: EventRequest['status']) => {
    await supabase.from('event_requests').update({ status }).eq('id', id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const handleAddEvent = async (eventData: Partial<EventRequest>) => {
    const newEvent = { ...eventData, id: `e-${Date.now()}` } as EventRequest;
    
    // Map to snake_case for DB
    const dbPayload = {
        id: newEvent.id,
        lead_id: newEvent.leadId,
        title: newEvent.title,
        type: newEvent.type,
        date: newEvent.date,
        guests: newEvent.guests,
        budget: newEvent.budget,
        status: newEvent.status,
        venue_id: newEvent.venueId,
        show_on_site: newEvent.showOnSite,
        description: newEvent.description,
        image: newEvent.image,
        
        start_date: newEvent.startDate,
        end_date: newEvent.endDate,
        cover_image: newEvent.coverImage,
        gallery_images: newEvent.galleryImages,
        organizer_name: newEvent.organizerName,
        category: newEvent.category,
        catering_options: newEvent.cateringOptions,
        max_capacity: newEvent.maxCapacity,
        total_cost: newEvent.totalCost,
        deposit_amount: newEvent.depositAmount,
        payment_terms: newEvent.paymentTerms,
        is_public_ticket: newEvent.isPublicTicket,
        ticket_price: newEvent.ticketPrice
    };

    await supabase.from('event_requests').insert([dbPayload]);

    // Financial Integration for Deposit
    if (newEvent.depositAmount && newEvent.depositAmount > 0) {
        const paymentMethod = (eventData as any).paymentMethod || 'Pix';
        const transaction: Transaction = {
            id: `tr-${Date.now()}`,
            date: new Date().toISOString(),
            description: `Sinal: ${newEvent.title}`,
            amount: newEvent.depositAmount,
            type: 'INCOME', // Fixed Enum
            category: 'Eventos', 
            status: 'PAID', // Fixed Enum
        };
        
        await supabase.from('transactions').insert([{
            id: transaction.id,
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            payment_method: paymentMethod, // Direct DB Insert
            status: transaction.status,
            created_by: authenticatedUser?.email || 'admin' // Direct DB Insert
        }]);
        setTransactions(prev => [transaction, ...prev]);
    }

    setEvents(prev => [newEvent, ...prev]);
  };

  const handleUpdateEvent = async (updatedEvent: EventRequest) => {
    // 1. Update basic event info
    await supabase.from('event_requests').update({
        title: updatedEvent.title,
        status: updatedEvent.status,
        participants: undefined // Don't save this nested
    }).eq('id', updatedEvent.id);

    // 2. Handle Participants Upsert (Manual / Check-in)
    if (updatedEvent.participants) {
        const participantsPayload = updatedEvent.participants.map(p => ({
            id: p.id,
            event_id: p.eventId,
            name: p.name,
            email: p.email,
            phone: p.phone,
            cpf: p.cpf,
            status: p.status,
            ticket_purchased: p.ticketPurchased,
            purchase_date: p.purchaseDate,
            checked_in_at: p.checkedInAt
        }));
        
        // Upsert all participants
        const { error: partError } = await supabase.from('event_participants').upsert(participantsPayload);
        if (partError) {
            console.error("Error saving participants:", partError);
            alert("Erro ao salvar participantes. Tente novamente.");
        }
    }

    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleUpdateRoomStatus = async (id: string, status: RoomStatus) => {
    await supabase.from('rooms').update({ status }).eq('id', id);
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAddPost = async (postData: Partial<BlogPost>) => {
    const newPost = { ...postData, id: `post-${Date.now()}`, date: new Date().toISOString() } as BlogPost;
    await supabase.from('blog_posts').insert([newPost]);
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateConsumptionStatus = async (resId: string, itemId: string, status: 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue') => {
    const targetRes = reservations.find(r => r.id === resId);
    if (!targetRes) return;

    const updatedConsumption = targetRes.consumption?.map(item => 
        item.id === itemId ? { ...item, status } : item
    ) || [];

    await supabase.from('reservations').update({ consumption: updatedConsumption }).eq('id', resId);
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, consumption: updatedConsumption } : r));
  };

  const handleAddConsumption = async (resId: string, item: any) => {
        const newItem = { ...item, id: Date.now().toString(), status: 'Pendente' };
        setReservations(prev => prev.map(res => res.id === resId ? { ...res, consumption: [...(res.consumption || []), newItem] } : res));
        
        const targetRes = reservations.find(r => r.id === resId);
        if(targetRes) {
             const updatedConsumption = [...(targetRes.consumption || []), newItem];
             await supabase.from('reservations').update({ consumption: updatedConsumption }).eq('id', resId);
        }
  };

  const handleRemoveConsumption = async (resId: string, itemId: string) => {
    const targetRes = reservations.find(r => r.id === resId);
    if (!targetRes) return;

    const updatedConsumption = targetRes.consumption?.filter(item => item.id !== itemId) || [];

    await supabase.from('reservations').update({ consumption: updatedConsumption }).eq('id', resId);
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, consumption: updatedConsumption } : r));
  };

  const handleBuyTicket = async (participant: Partial<EventParticipant>) => {
      const newParticipant = {
          ...participant,
          id: `ep-${Date.now()}`,
          status: 'Pendente',
          ticketPurchased: true,
          purchaseDate: new Date().toISOString()
      };
      
      const dbPayload = {
          id: newParticipant.id,
          event_id: newParticipant.eventId,
          name: newParticipant.name,
          email: newParticipant.email,
          phone: newParticipant.phone,
          status: newParticipant.status,
          ticket_purchased: newParticipant.ticketPurchased,
          purchase_date: newParticipant.purchaseDate
      };

      await supabase.from('event_participants').insert([dbPayload]);
      // Optimistically update state
      setEvents(prev => prev.map(e => {
          if (e.id === participant.eventId) {
              return { 
                  ...e, 
                  participants: [...(e.participants || []), newParticipant as EventParticipant] 
              };
          }
          return e;
      }));
  };

  const handleCreateReservation = async (newRes: Partial<Reservation>) => {
        const reservationId = newRes.id || `res-${Date.now()}`;
        const reservationToSave: Reservation = {
            ...newRes,
            id: reservationId,
            consumption: newRes.consumption || [],
            status: newRes.status || 'Pendente',
            guestName: newRes.guestName!,
            roomId: newRes.roomId!,
            checkIn: newRes.checkIn!,
            checkOut: newRes.checkOut!,
            totalAmount: newRes.totalAmount || 0,
            guestsDetails: newRes.guestsDetails,
            guestContact: newRes.guestContact, // Added based on instruction
            guestEmail: newRes.guestEmail // Added based on instruction
        } as Reservation;

        const dbPayload = {
            id: reservationToSave.id,
            guest_name: reservationToSave.guestName,
            room_id: reservationToSave.roomId,
            check_in: reservationToSave.checkIn,
            check_out: reservationToSave.checkOut,
            status: reservationToSave.status,
            total_amount: reservationToSave.totalAmount,
            access_code: reservationToSave.accessCode,
            consumption: reservationToSave.consumption || [],
            client_id: reservationToSave.clientId,
            guests_details: reservationToSave.guestsDetails,
            guest_contact: reservationToSave.guestContact,
            guest_email: reservationToSave.guestEmail
        };
        
        const { error } = await supabase.from('reservations').insert([dbPayload]);
        if (!error) {
            setReservations(prev => [reservationToSave, ...prev]);
        } else {
            console.error("Error creating reservation:", error);
            alert("Falha ao criar reserva. Verifique os dados.");
        }
  };

  const handleCheckout = async (reservation: Reservation, paymentMethod: string, total: number) => {
      // 1. Create Transaction Record
      const newTransaction = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Checkout - ${reservation.guestName} - Quarto ${rooms.find(r => r.id === reservation.roomId)?.name} (${paymentMethod})`,
          amount: total,
          type: 'INCOME',
          category: 'Hospedagem',
          // payment_method removed as column likely missing in DB
      };
      
      await supabase.from('transactions').insert([newTransaction]);
      setTransactions(prev => [newTransaction as any, ...prev]);

      // 2. Update Reservation Status (already done in component, but good for safety to ensure sync)
      // The component calls onUpdateStatus which handles the DB update for status. 
      // This handler is mainly for the Financial Transaction record.
  };

  const handleUpdateConsumptionItem = async (resId: string, itemId: string, updates: Partial<ConsumptionItem>) => {
    const targetRes = reservations.find(r => r.id === resId);
    if (!targetRes) return;

    const updatedConsumption = targetRes.consumption?.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
    ) || [];

    await supabase.from('reservations').update({ consumption: updatedConsumption }).eq('id', resId);
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, consumption: updatedConsumption } : r));
  };

  const handleDirectSale = async (items: any[], paymentMethod: string, customerName: string) => {
      const rawTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = parseFloat(rawTotal.toFixed(2));
      
      const newTransaction = {
          id: `tx-dir-${Date.now()}`,
          date: new Date().toISOString(),
          description: `Venda Direta - ${customerName} (${items.length} itens)`,
          amount: total,
          type: 'INCOME',
          category: 'Vendas PDV',
          paymentMethod,
          status: 'PAID'
      };

      // In a real app we might want to log the items individually in a separate table, 
      // but for now we just record the financial transaction as requested.
      
      const { error } = await supabase.from('transactions').insert([{
        id: newTransaction.id,
        date: newTransaction.date,
        description: `${newTransaction.description} [${paymentMethod}]`,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category: newTransaction.category,
        status: newTransaction.status
      }]);

      if (!error) {
          setTransactions(prev => [newTransaction as any, ...prev]);
      } else {
          console.error("Direct Sale Error:", error);
          alert(`Erro ao processar venda direta: ${error.message || 'Verifique o console'}`);
      }
  };

  const sharedLayoutProps = {
    settings,
    currentUser: authenticatedUser as User,
    userRole,
    allUsers: users,
    onSwitchUser: (id: string) => {
        const target = users.find(u => u.id === id);
        if (target) setAuthenticatedUser(target);
    },
    notifications,
    onMarkNotificationRead: (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    onUpdateUser: (updatedUser: User) => {
        handleUpdateUser(updatedUser);
        if (authenticatedUser?.id === updatedUser.id) {
            setAuthenticatedUser(updatedUser);
        }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <Loader2 size={48} className="text-olive-700 animate-spin" />
        <p className="text-stone-500 font-black uppercase tracking-widest text-[10px]">Resort das Oliveiras...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLayout settings={settings} onLogin={setAuthenticatedUser} onGuestLogin={setGuestReservation}><PublicHome onAddLead={handleAddLead} settings={settings} publicEvents={events} onBuyTicket={handleBuyTicket} /></PublicLayout>} />
        <Route path="/reservas" element={
            <PublicLayout settings={settings} onLogin={setAuthenticatedUser} onGuestLogin={setGuestReservation}>
                <PublicReservations rooms={rooms} reservations={reservations} venues={venues || []} onMakeReservation={handleCreateReservation} />
            </PublicLayout>
        } />
        
        {/* ROTAS DO HÓSPEDE */}
        <Route path="/guest" element={<GuestLogin reservations={reservations} settings={settings} onLogin={setGuestReservation} />} />
        <Route path="/guest/dashboard" element={
            guestReservation ? (
                <PublicLayout settings={settings} onLogin={setAuthenticatedUser} onGuestLogin={setGuestReservation}>
                    <GuestDashboard 
                        reservation={guestReservation} 
                        settings={settings} 
                        products={products}
                        onMakeOrder={(item) => handleAddConsumption(guestReservation.id, item)}
                        onLogout={() => setGuestReservation(null)}
                        onRefresh={fetchData} 
                    />
                </PublicLayout>
            ) : (
                <Navigate to="/guest" replace />
            )
        } />
        
        {!authenticatedUser ? (
            <Route path="/admin/*" element={<Login onLogin={setAuthenticatedUser} />} />
        ) : (
            <>
                <Route path="/admin" element={<AdminLayout {...sharedLayoutProps}><AdminDashboard leads={leads} reservations={reservations} events={events} transactions={transactions} timeLogs={timeLogs} rooms={rooms} users={users} /></AdminLayout>} />
                <Route path="/admin/timesheet" element={<AdminLayout {...sharedLayoutProps}><AdminTimesheet currentUser={authenticatedUser} userRole={userRole} timeLogs={timeLogs} onAddTimeLog={handleAddTimeLog} users={users} settings={settings} /></AdminLayout>} />
                <Route path="/admin/kitchen" element={<AdminLayout {...sharedLayoutProps}><AdminKitchen reservations={reservations} leads={leads} onUpdateStatus={handleUpdateConsumptionStatus} onCancelOrder={handleRemoveConsumption} onRefresh={fetchData} /></AdminLayout>} />
                <Route path="/admin/clients" element={<AdminLayout {...sharedLayoutProps}><AdminClients clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} /></AdminLayout>} />
                <Route path="/admin/pos" element={<AdminLayout {...sharedLayoutProps}><AdminPOS products={products} reservations={reservations} onAddConsumption={handleAddConsumption} onRemoveConsumption={handleRemoveConsumption} onUpdateConsumptionItem={handleUpdateConsumptionItem} onDirectSale={handleDirectSale} /></AdminLayout>} />
                <Route path="/admin/reservations" element={<AdminLayout {...sharedLayoutProps}><AdminReservations reservations={reservations} leads={leads} rooms={rooms} products={products} settings={settings} clients={clients} onAddClient={handleAddClient} onAddConsumption={handleAddConsumption} onCheckout={handleCheckout} 
                    onUpdateStatus={async (id, status, extraData) => {
                        const dbExtraData: any = { ...extraData };
                        if (extraData?.accessCode) {
                            dbExtraData.access_code = extraData.accessCode;
                            delete dbExtraData.accessCode;
                        }
                        
                        await supabase.from('reservations').update({ status, ...dbExtraData }).eq('id', id);
                        setReservations(prev => prev.map(r => r.id === id ? { ...r, status, ...extraData } : r));
                        
                        const res = reservations.find(r => r.id === id) || { ...reservations.find(r=>r.id===id), ...extraData };
                        
                        // Check-in Logic: Set Room to Occupied & Set Guest Name
                        if (status === 'Check-in') {
                             if (res && res.roomId) {
                                 const occupiedStatus = RoomStatus.OCCUPIED;
                                 const guestName = res.guestName;
                                 
                                 await supabase.from('rooms').update({ 
                                     status: occupiedStatus,
                                     current_guest_name: guestName
                                 }).eq('id', res.roomId);
                                 
                                 setRooms(prev => prev.map(room => room.id === res.roomId ? { ...room, status: occupiedStatus, currentGuestName: guestName } : room));
                             }
                        }
                        
                        // Check-out Logic: Set Room to Cleaning & Clear Guest Name
                        if (status === 'Check-out') {
                             if (res && res.roomId) {
                                 const cleaningStatus = RoomStatus.CLEANING;
                                 await supabase.from('rooms').update({ 
                                     status: cleaningStatus,
                                     current_guest_name: null 
                                 }).eq('id', res.roomId);
                                 
                                 setRooms(prev => prev.map(room => room.id === res.roomId ? { ...room, status: cleaningStatus, currentGuestName: undefined } : room));
                             }
                        }
                    }} 
                    onCreateReservation={handleCreateReservation}
                    onUpdateReservation={async (updatedRes) => {
                        const dbPayload = {
                            guest_name: updatedRes.guestName,
                            room_id: updatedRes.roomId,
                            check_in: updatedRes.checkIn,
                            check_out: updatedRes.checkOut,
                            status: updatedRes.status,
                            total_amount: updatedRes.totalAmount,
                            access_code: updatedRes.accessCode,
                            consumption: updatedRes.consumption,
                            client_id: updatedRes.clientId,
                            guests_details: updatedRes.guestsDetails
                        };
                        
                        const { error } = await supabase.from('reservations').update(dbPayload).eq('id', updatedRes.id);
                        if (!error) {
                            setReservations(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
                        } else {
                            console.error("Error updating reservation:", error);
                            alert("Falha ao atualizar reserva.");
                        }
                    }}
                    onDeleteReservation={async (id) => {
                        await supabase.from('reservations').delete().eq('id', id);
                        setReservations(prev => prev.filter(r => r.id !== id));
                    }}
                /></AdminLayout>} />
                <Route path="/admin/events" element={<AdminLayout {...sharedLayoutProps}><AdminEvents events={events} venues={venues} onUpdateEventStatus={handleUpdateEventStatus} onUpdateEvent={handleUpdateEvent} onAddEvent={handleAddEvent} /></AdminLayout>} />
                <Route path="/admin/venues" element={<AdminLayout {...sharedLayoutProps}><AdminVenues venues={venues} onAddVenue={handleAddVenue} onDeleteVenue={handleDeleteVenue} /></AdminLayout>} />
                <Route path="/admin/products" element={<AdminLayout {...sharedLayoutProps}><AdminProducts products={products} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onUpdateProduct={async (id, updates) => {
                    const dbPayload = {
                        name: updates.name,
                        category: updates.category,
                        price: updates.price,
                        available: updates.available,
                        image: updates.image,
                        description: updates.description,
                        is_room_service: updates.isRoomService,
                        needs_preparation: updates.needsPreparation,
                        preparation_time: updates.preparationTime
                    };
                    
                    const { error } = await supabase.from('products').update(dbPayload).eq('id', id);
                    
                    if (!error) {
                         setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
                    } else {
                         console.error("Error updating product:", error);
                         alert("Erro ao atualizar produto.");
                    }
                }} /></AdminLayout>} />
                <Route path="/admin/finance" element={<AdminLayout {...sharedLayoutProps}><AdminFinance transactions={transactions} reservations={reservations} events={events} settings={settings} rooms={rooms} /></AdminLayout>} />
                <Route path="/admin/leads" element={<AdminLayout {...sharedLayoutProps}><AdminCRM leads={leads} onUpdateStatus={handleUpdateLeadStatus} /></AdminLayout>} />
                <Route path="/admin/clients" element={<AdminLayout {...sharedLayoutProps}><AdminClients 
                    clients={clients} 
                    reservations={reservations}
                    onAddClient={handleAddClient} 
                    onUpdateClient={async (c) => {
                         const { id, createdAt, dependents, ...rest } = c; // Handle dependents separately if needed, but assuming simple update for now
                         const { error } = await supabase.from('clients').update({ ...rest, dependents }).eq('id', c.id);
                         if(!error) setClients(prev => prev.map(cl => cl.id === c.id ? c : cl));
                    }} 
                    onDeleteClient={async (id) => {
                         await supabase.from('clients').delete().eq('id', id);
                         setClients(prev => prev.filter(c => c.id !== id));
                    }}
                    onQuickHost={(client) => {
                        // Redirect to Reservations Map with client pre-selected (via query param or state)
                        // For now, simpler: user goes to map and selects client. 
                        // But user requested "Action Button". 
                        // Let's implement a simple direct navigation
                        window.location.hash = `#/admin/reservations?clientId=${client.id}`;
                    }}
                /></AdminLayout>} />
                <Route path="/admin/accommodations" element={<AdminLayout {...sharedLayoutProps}><AdminAccommodations rooms={rooms} reservations={reservations} onUpdateStatus={handleUpdateRoomStatus} onUpdateRoom={async (updatedRoom) => {
                    // Fix: Map camelCase bedConfig to snake_case bed_config for Supabase
                    const { bedConfig, ...rest } = updatedRoom;
                    const dbPayload = {
                        ...rest,
                        bed_config: bedConfig
                    };
                    await supabase.from('rooms').update(dbPayload).eq('id', updatedRoom.id);
                    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
                }} /></AdminLayout>} />
                <Route path="/admin/content" element={<AdminLayout {...sharedLayoutProps}><AdminContent posts={posts} settings={settings} onUpdateSettings={handleUpdateSettings} onAddPost={handleAddPost} onDeletePost={handleDeletePost} /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout {...sharedLayoutProps}><AdminSettings settings={settings} onUpdateSettings={handleUpdateSettings} users={users} roles={roles} onDeleteUser={handleDeleteUser} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} /></AdminLayout>} />
                <Route path="/admin/integrations" element={<AdminLayout {...sharedLayoutProps}><AdminIntegrations reservations={reservations} rooms={rooms} onImportReservation={(res) => setReservations(prev => [res, ...prev])} /></AdminLayout>} />
            </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
