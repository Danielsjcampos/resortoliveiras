
import { Lead, LeadStatus, InterestType, Room, RoomStatus, BlogPost, Reservation, EventRequest, Transaction, Product, Venue } from './types';

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Roberto Silva',
    email: 'roberto@email.com',
    phone: '(11) 99999-9999',
    interest: InterestType.ACCOMMODATION,
    status: LeadStatus.NEW,
    guests: 2,
    date: '2023-12-20',
    createdAt: '2023-11-01T10:00:00Z',
    tags: ['Casal', 'Fim de Ano'],
    history: ['2023-11-01: Lead criado via site']
  },
  {
    id: '2',
    name: 'Empresa Tech Ltda',
    email: 'contato@tech.com',
    phone: '(11) 3333-3333',
    interest: InterestType.EVENT,
    status: LeadStatus.CONTACTED,
    guests: 50,
    date: '2024-01-15',
    createdAt: '2023-11-02T14:30:00Z',
    tags: ['Corporativo', 'Orçamento Enviado'],
    history: ['2023-11-02: Solicitou orçamento para 50 pessoas', '2023-11-03: Proposta enviada por email']
  },
  {
    id: '3',
    name: 'Ana Julia',
    email: 'ana@email.com',
    phone: '(21) 98888-8888',
    interest: InterestType.ACCOMMODATION,
    status: LeadStatus.RESERVED,
    guests: 4,
    date: '2023-12-10',
    createdAt: '2023-10-25T09:15:00Z',
    tags: ['Família'],
    history: ['2023-10-25: Primeiro contato', '2023-10-27: Reserva confirmada']
  }
];

export const MOCK_ROOMS: Room[] = [
  { id: '101', name: 'Chalé Master', type: 'Chalé', capacity: 4, price: 800, status: RoomStatus.OCCUPIED },
  { id: '102', name: 'Chalé Vista', type: 'Chalé', capacity: 2, price: 600, status: RoomStatus.AVAILABLE },
  { id: '201', name: 'Suíte Luxo', type: 'Quarto', capacity: 2, price: 400, status: RoomStatus.CLEANING },
  { id: '202', name: 'Suíte Standard', type: 'Quarto', capacity: 2, price: 300, status: RoomStatus.MAINTENANCE },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    leadId: '3',
    guestName: 'Ana Julia',
    roomId: '101',
    checkIn: '2023-12-10',
    checkOut: '2023-12-15',
    status: 'Check-in',
    totalAmount: 4000,
    consumption: [
      { id: 'c1', description: 'Jantar Especial', value: 250, quantity: 1, category: 'Restaurante', date: '2023-12-11' },
      { id: 'c2', description: 'Água de Coco', value: 15, quantity: 4, category: 'Bar', date: '2023-12-12' }
    ]
  }
];

export const MOCK_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'Salão Cristal',
    capacity: 200,
    pricePerDay: 5000,
    description: 'Salão nobre com vista panorâmica e ar condicionado central.',
    image: 'https://picsum.photos/seed/hall/400/250',
    features: ['Ar Condicionado', 'Palco', 'Sistema de Som', 'Cozinha Industrial']
  },
  {
    id: 'v2',
    name: 'Jardim das Oliveiras',
    capacity: 120,
    pricePerDay: 3000,
    description: 'Área externa gramada, perfeita para cerimônias de casamento ao pôr do sol.',
    image: 'https://picsum.photos/seed/garden/400/250',
    features: ['Ao Ar Livre', 'Iluminação Cênica', 'Pergolado']
  },
  {
    id: 'v3',
    name: 'Auditório Executivo',
    capacity: 50,
    pricePerDay: 1500,
    description: 'Espaço corporativo com projetor e cadeiras ergonômicas.',
    image: 'https://picsum.photos/seed/auditorium/400/250',
    features: ['Projetor 4K', 'Wi-Fi Dedicado', 'Coffee Break Area']
  }
];

export const MOCK_EVENTS: EventRequest[] = [
  {
    id: 'ev-1',
    leadId: '2',
    title: 'Convenção Tech Anual',
    type: 'Corporativo',
    date: '2024-01-15',
    guests: 50,
    budget: 15000,
    status: 'Confirmado',
    venueId: 'v3',
    guestList: [
      { id: 'g1', name: 'Carlos CEO', category: 'VIP', status: 'Confirmado' },
      { id: 'g2', name: 'Mariana CTO', category: 'VIP', status: 'Confirmado' },
      { id: 'g3', name: 'Equipe Vendas', category: 'Convite Normal', status: 'Pendente' }
    ]
  },
  {
    id: 'ev-2',
    leadId: '99',
    title: 'Casamento Mariana & Pedro',
    type: 'Casamento',
    date: '2024-05-20',
    guests: 120,
    budget: 45000,
    status: 'Solicitado',
    venueId: 'v2'
  }
];

export const MOCK_NEWS: BlogPost[] = [
  {
    id: '1',
    title: 'Festa de Réveillon 2024',
    category: 'Eventos',
    excerpt: 'Garanta seu lugar na nossa festa exclusiva de virada de ano com queima de fogos.',
    content: 'Lorem ipsum dolor sit amet...',
    image: 'https://picsum.photos/400/250',
    date: '2023-11-01',
    seoKeywords: ['réveillon', 'festa ano novo', 'resort sp'],
    seoDescription: 'Celebre a virada do ano no Resort das Oliveiras com show de fogos e ceia completa.'
  },
  {
    id: '2',
    title: 'Nova área de lazer inaugurada',
    category: 'Novidades',
    excerpt: 'Conheça nossas novas piscinas aquecidas e o bar molhado.',
    content: 'Ut enim ad minim veniam...',
    image: 'https://picsum.photos/401/250',
    date: '2023-10-20',
    seoKeywords: ['piscina aquecida', 'lazer', 'família'],
    seoDescription: 'O Resort das Oliveiras agora conta com um complexo aquático aquecido para toda a família.'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Reserva Ana Julia (Parcial)', amount: 2000, type: 'INCOME', category: 'Reservas', date: '2023-10-27', status: 'PAID', referenceId: 'res-1' },
  { id: 't2', description: 'Compra de Bebidas - Adega', amount: 1500, type: 'EXPENSE', category: 'Estoque', date: '2023-11-05', status: 'PAID' },
  { id: 't3', description: 'Manutenção Piscina', amount: 800, type: 'EXPENSE', category: 'Manutenção', date: '2023-11-10', status: 'PENDING' },
  { id: 't4', description: 'Reserva Roberto Silva', amount: 1200, type: 'INCOME', category: 'Reservas', date: '2023-11-12', status: 'PENDING', referenceId: 'res-new' },
  { id: 't5', description: 'Energia Elétrica', amount: 3200, type: 'EXPENSE', category: 'Utilidades', date: '2023-11-15', status: 'PENDING' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Caipirinha Especial', category: 'Bar', price: 28.00, available: true, image: 'https://picsum.photos/seed/drink/200' },
  { id: 'p2', name: 'Cerveja Artesanal', category: 'Bar', price: 22.00, available: true, image: 'https://picsum.photos/seed/beer/200' },
  { id: 'p3', name: 'Filé Parmegiana', category: 'Restaurante', price: 65.00, available: true, image: 'https://picsum.photos/seed/food/200' },
  { id: 'p4', name: 'Água Mineral', category: 'Frigobar', price: 8.00, available: true, image: 'https://picsum.photos/seed/water/200' },
  { id: 'p5', name: 'Passeio a Cavalo (1h)', category: 'Passeios', price: 120.00, available: true, image: 'https://picsum.photos/seed/horse/200' },
  { id: 'p6', name: 'Massagem Relaxante', category: 'Serviços', price: 180.00, available: true, image: 'https://picsum.photos/seed/spa/200' },
];
