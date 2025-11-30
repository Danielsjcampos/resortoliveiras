
export enum LeadStatus {
  NEW = 'NOVO',
  CONTACTED = 'EM_ANDAMENTO',
  PROPOSAL_SENT = 'PROPOSTA_ENVIADA',
  RESERVED = 'RESERVADO',
  LOST = 'PERDIDO'
}

export enum InterestType {
  ACCOMMODATION = 'Hospedagem',
  EVENT = 'Evento'
}

export enum RoomStatus {
  AVAILABLE = 'Disponível',
  OCCUPIED = 'Ocupado',
  CLEANING = 'Limpeza',
  MAINTENANCE = 'Manutenção'
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: InterestType;
  status: LeadStatus;
  guests: number;
  date: string; // ISO date
  notes?: string;
  history?: string[]; // Array of interaction notes
  createdAt: string;
  tags: string[];
}

export interface Room {
  id: string;
  name: string;
  type: 'Chalé' | 'Quarto';
  capacity: number;
  price: number;
  status: RoomStatus;
}

export type ProductCategory = 'Restaurante' | 'Bar' | 'Frigobar' | 'Serviços' | 'Passeios' | 'Outro';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image?: string;
  description?: string;
  available: boolean;
}

export interface ConsumptionItem {
  id: string;
  productId?: string; // Optional link to catalog
  description: string;
  value: number;
  quantity: number;
  category: ProductCategory;
  date: string;
}

export interface Reservation {
  id: string;
  leadId: string; // Link to lead
  guestName: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'Pendente' | 'Confirmado' | 'Check-in' | 'Check-out';
  totalAmount: number; // Base room price total
  consumption: ConsumptionItem[]; // Array of extra items
  guestDetails?: {
    documentId: string;
    fullAddress?: string;
    notes?: string;
  };
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  pricePerDay: number;
  description: string;
  image?: string;
  features: string[]; // e.g. "Ar Condicionado", "Palco", "Vista Panorâmica"
}

export interface Guest {
  id: string;
  name: string;
  category: 'VIP' | 'Convite Normal' | 'Staff' | 'Prestador de Serviço';
  status: 'Pendente' | 'Confirmado' | 'Presente (Check-in)';
}

export interface EventRequest {
  id: string;
  leadId: string;
  title: string; // e.g. "Casamento Silva & Souza"
  type: 'Casamento' | 'Corporativo' | 'Aniversário' | 'Outro';
  date: string;
  guests: number; // Estimated count
  budget: number;
  status: 'Solicitado' | 'Proposta Enviada' | 'Confirmado' | 'Concluído';
  venueId?: string; // Link to specific Venue
  guestList?: Guest[]; // Specific list of people
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content?: string;
  image: string;
  date: string;
  // SEO Fields
  seoKeywords: string[];
  seoDescription: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  status: 'PAID' | 'PENDING';
  referenceId?: string; // Link to reservation or event ID
}

export interface DashboardStats {
  occupancyRate: number;
  newLeads: number;
  monthlyRevenue: number;
  pendingTasks: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGEMENT = 'GESTÃO',
  RECEPTION = 'ATENDIMENTO',
  KITCHEN = 'COZINHA',
  MAINTENANCE = 'MANUTENÇÃO',
  CLEANING = 'LIMPEZA',
  PANTRY = 'COPA'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed or handled by auth provider
  role: UserRole;
  active: boolean;
  avatar?: string;
}
