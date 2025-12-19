
export enum LeadStatus {
  NEW = 'Novo',
  IN_PROGRESS = 'Atendimento',
  PROPOSAL = 'Proposta',
  WON = 'Ganho',
  LOST = 'Perda'
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
  source: 'Site' | 'Instagram' | 'Google' | 'WhatsApp' | 'Indicação';
  guests: number;
  date: string; 
  notes?: string;
  history?: string[]; 
  createdAt: string;
  tags: string[];
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cpf?: string;
  birthDate?: string;
  notes?: string;
  dependents?: {
    name: string;
    age: number;
    relationship?: string;
  }[];
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'Chalé' | 'Quarto' | 'Bangalô';
  capacity: number;
  price: number;
  status: RoomStatus;
  currentGuestName?: string; // For display when Occupied
  bedConfig?: {
    casal?: number;
    solteiro?: number;
  };
  description?: string;
  images?: string[];
  features?: string[];
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
  needsPreparation?: boolean;
  preparationTime?: number; // minutes
  isRoomService?: boolean;
}

export interface ConsumptionItem {
  id: string;
  productId?: string;
  description: string;
  value: number;
  quantity: number;
  category: ProductCategory;
  status: 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue';
  date: string;
}

export interface Reservation {
  id: string;
  leadId?: string;
  clientId?: string;
  guestName: string; // Keep for fallback/display
  guestContact?: string;
  guestEmail?: string;
  guestsDetails?: {
    adults: number;
    children: number;
    childrenAges?: number[];
  };
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'Pendente' | 'Confirmado' | 'Check-in' | 'Check-out' | 'Cancelado';
  totalAmount: number;
  accessCode?: string;
  consumption: ConsumptionItem[];
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  pricePerDay: number;
  description: string;
  image?: string;
  features: string[];
}

export interface EventGuest {
  id: string;
  name: string;
  category: 'VIP' | 'Convite Normal' | 'Staff' | 'Prestador de Serviço';
  status: 'Pendente' | 'Confirmado' | 'Presente (Check-in)';
}

export interface EventParticipant {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status: 'Pendente' | 'Confirmado' | 'Cancelado' | 'Presente';
  ticketPurchased: boolean;
  purchaseDate?: string;
  checkedInAt?: string;
}

export interface EventRequest {
  id: string;
  leadId?: string;
  title: string;
  type: 'Casamento' | 'Corporativo' | 'Aniversário' | 'Show' | 'Workshop' | 'Outro';
  date: string; // Keep as reference date or start date
  guests: number; // Current guests count
  budget: number;
  status: 'Solicitado' | 'Proposta Enviada' | 'Confirmado' | 'Concluído';
  venueId?: string;
  guestList?: EventGuest[]; // Legacy, potentially replace or sync with participants
  showOnSite?: boolean;
  description?: string;
  image?: string; // Legacy main image

  // Advanced Fields
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  galleryImages?: string[];
  organizerName?: string;
  category?: string; // Specific category label
  cateringOptions?: string[];
  maxCapacity?: number;
  totalCost?: number;
  depositAmount?: number;
  paymentTerms?: string;
  isPublicTicket?: boolean;
  ticketPrice?: number;
  participants?: EventParticipant[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content?: string;
  image: string;
  date: string;
  seoKeywords: string[];
  seoDescription: string;
  isAiGenerated?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  roleId?: string;
  read: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  status: 'PAID' | 'PENDING';
  referenceId?: string;
}

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_KITCHEN'
  | 'VIEW_POS'
  | 'VIEW_RESERVATIONS'
  | 'VIEW_EVENTS'
  | 'VIEW_VENUES'
  | 'VIEW_PRODUCTS'
  | 'VIEW_FINANCE'
  | 'VIEW_CRM'
  | 'VIEW_ACCOMMODATIONS'
  | 'VIEW_CONTENT'
  | 'VIEW_SETTINGS'
  | 'VIEW_TIMESHEET';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar?: string;
  faceId?: string;
}

export interface SystemSettings {
  resortName: string;
  resortCnpj: string;
  resortAddress: string;
  logoUrl: string;
  primaryColor: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  webhookUrl: string; 
  outboundWebhookUrl: string; 
  apiKey: string;
  menuStyle: 'STANDARD' | 'IOS';
  menuBackgroundColor: string;
  menuIconSize: number;
  menuFontSize: number;
  menuItemSpacing: number; // Vertical gap between items? Or general gap? usually gap-2
  menuButtonPadding: number; // p-2 or p-3 etc.
  menuBorderRadius: number; // rounded-lg etc.
  menuColumns: number; // 1, 2, 3
  workplaceLat: number;
  workplaceLng: number;
  workplaceRadius: number;
  aiKeywordsQueue: string[]; 
  isAutoPilotActive: boolean;
}

export enum TimeLogType {
  ENTRY = 'ENTRADA',
  LUNCH_START = 'SAIDA_ALMOCO',
  LUNCH_END = 'VOLTA_ALMOCO',
  EXIT = 'SAIDA'
}

export interface TimeLog {
  id: string;
  userId: string;
  type: TimeLogType;
  timestamp: string;
  deviceInfo: string;
  faceCapture?: string;
  wifiSsid?: string;
  location: {
    lat: number;
    lng: number;
    inBounds: boolean;
    accuracy: number;
  };
}
