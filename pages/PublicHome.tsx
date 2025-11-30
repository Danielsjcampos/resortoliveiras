import React, { useState, useEffect } from 'react';
import { InterestType, Lead, Reservation } from '../types';
import {
  Calendar, CheckCircle, MapPin, Users, Coffee, Wifi,
  Plane, Dumbbell, Car, Waves, Sailboat, Gamepad2,
  Sun, Droplets, Anchor, Trophy, Bell, Star, Shield,
  Utensils, Music, Clock, Phone, Mail, Instagram, Facebook,
  ArrowRight, PlayCircle
} from 'lucide-react';

interface PublicHomeProps {
  onAddLead: (leadData: Partial<Lead>) => void;
  reservations?: Reservation[];
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onAddLead, reservations = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: 2,
    interest: InterestType.ACCOMMODATION
  });
  const [submitted, setSubmitted] = useState(false);
  const [recentBooking, setRecentBooking] = useState<string | null>(null);

  // Simulate "Live" bookings ticker
  useEffect(() => {
    const showRandomBooking = () => {
      const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Brasília', 'Campinas'];
      const types = ['um Bangalô', 'uma Suíte', 'um Chalé', 'o Espaço de Eventos'];
      const names = ['Maria', 'João', 'Ana', 'Pedro', 'Lucas', 'Julia', 'Bruno', 'Carla'];

      let text = '';
      if (reservations.length > 0 && Math.random() > 0.5) {
        const randomRes = reservations[Math.floor(Math.random() * reservations.length)];
        text = `${randomRes.guestName.split(' ')[0]} acabou de reservar!`;
      } else {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        text = `${name} de ${city} reservou ${type} agora mesmo.`;
      }

      setRecentBooking(text);
      setTimeout(() => setRecentBooking(null), 5000);
    };

    const initialTimer = setTimeout(showRandomBooking, 3000);
    const interval = setInterval(showRandomBooking, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [reservations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead(formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        guests: 2,
        interest: InterestType.ACCOMMODATION
      });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col font-sans text-gray-800">

      {/* Live Booking Notification */}
      {recentBooking && (
        <div className="fixed bottom-6 left-6 z-50 bg-white/90 backdrop-blur-md border border-olive-200 shadow-2xl rounded-lg p-4 flex items-center gap-4 animate-slide-in-left max-w-sm">
          <div className="bg-olive-100 p-2 rounded-full text-olive-600">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Nova Reserva!</p>
            <p className="text-xs text-gray-600">{recentBooking}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="https://picsum.photos/1920/1080?grayscale&blur=2"
          alt="Resort das Oliveiras - Vista noturna"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 drop-shadow-2xl leading-tight">
            Resort das <span className="text-olive-400">Oliveiras</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md font-light max-w-3xl mx-auto">
            Acomodações premium em meio à natureza. Gastronomia assinada, estrutura completa de lazer e eventos exclusivos.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="#reservar"
              className="bg-olive-600 hover:bg-olive-700 text-white font-bold py-4 px-10 rounded-full transition transform hover:scale-105 shadow-xl backdrop-blur-sm flex items-center justify-center gap-2"
            >
              Reservar Agora <ArrowRight size={20} />
            </a>
            <a
              href="#tour"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold py-4 px-10 rounded-full transition backdrop-blur-md flex items-center justify-center gap-2"
            >
              <PlayCircle size={20} /> Ver Tour Virtual 360°
            </a>
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-olive-600 font-bold tracking-widest uppercase text-sm">Nossos Diferenciais</span>
            <h2 className="text-4xl font-serif font-bold text-olive-900 mt-2">Por que escolher o Resort das Oliveiras?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: <Sun className="w-10 h-10 text-olive-600" />, title: "Contato com a Natureza", desc: "Ambiente único com atividades ao ar livre e paisagens deslumbrantes." },
              { icon: <Utensils className="w-10 h-10 text-olive-600" />, title: "Gastronomia Premium", desc: "Menu especial preparado por chef renomado com ingredientes locais." },
              { icon: <Waves className="w-10 h-10 text-olive-600" />, title: "Piscina e Hidro", desc: "Aproveite e relaxe em nossas piscinas climatizadas e hidromassagem." },
              { icon: <Shield className="w-10 h-10 text-olive-600" />, title: "Segurança 24h", desc: "Ambiente protegido e monitorado constantemente para sua tranquilidade." },
              { icon: <Star className="w-10 h-10 text-olive-600" />, title: "Eventos Especiais", desc: "Programação exclusiva com grandes nomes como Pablo Marçal." },
              { icon: <MapPin className="w-10 h-10 text-olive-600" />, title: "Localização Premium", desc: "Fácil acesso e localização privilegiada no interior de SP." },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-olive-50 transition duration-300">
                <div className="mb-4 p-3 bg-olive-100 rounded-full">{item.icon}</div>
                <h3 className="font-bold text-xl mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodations */}
      <section id="acomodacoes" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-olive-900">Nossas Acomodações</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Conforto e sofisticação integrados à natureza.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Bangalô Flex */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://picsum.photos/800/600?random=10" alt="Bangalô Flex" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-olive-600 text-white px-3 py-1 rounded-full text-sm font-bold">22 Unidades</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bangalô Flex</h3>
                <p className="text-gray-600 mb-6">Acomodação única e adaptável às suas necessidades. Decoração rústica, teto de madeira e terraço privativo.</p>
                <div className="flex flex-wrap gap-3 mb-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Wifi size={14} /> Wi-Fi</span>
                  <span className="flex items-center gap-1"><Sun size={14} /> Ar-condicionado</span>
                  <span className="flex items-center gap-1"><Coffee size={14} /> Frigobar</span>
                </div>
                <a href="#reservar" className="block w-full text-center bg-olive-100 text-olive-700 font-bold py-3 rounded-lg hover:bg-olive-200 transition">Reservar Agora</a>
              </div>
            </div>

            {/* Bangalô Premium */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://picsum.photos/800/600?random=11" alt="Bangalô Premium" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-olive-900 text-white px-3 py-1 rounded-full text-sm font-bold">Exclusivo</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bangalô Premium</h3>
                <p className="text-gray-600 mb-6">Flexibilidade total para sua estadia. Configure o espaço para Casal, Família ou Grupos. Máximo conforto em meio às oliveiras.</p>
                <div className="flex flex-wrap gap-3 mb-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users size={14} /> Até 6 pessoas</span>
                  <span className="flex items-center gap-1"><Star size={14} /> Varanda</span>
                  <span className="flex items-center gap-1"><Droplets size={14} /> Banheiro Privativo</span>
                </div>
                <a href="#reservar" className="block w-full text-center bg-olive-600 text-white font-bold py-3 rounded-lg hover:bg-olive-700 transition">Reservar Agora</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structure & Leisure */}
      <section className="py-20 bg-olive-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-olive-300 font-bold tracking-widest uppercase text-sm">Lazer e Esportes</span>
            <h2 className="text-4xl font-serif font-bold mt-2">Estrutura Completa</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Waves size={32} />, name: "Piscinas Climatizadas" },
              { icon: <Droplets size={32} />, name: "Spa Premium" },
              { icon: <Gamepad2 size={32} />, name: "Espaço Kids" },
              { icon: <MapPin size={32} />, name: "Trilhas Ecológicas" },
              { icon: <Trophy size={32} />, name: "Campo de Futebol" },
              { icon: <Dumbbell size={32} />, name: "Quadra de Tênis" },
              { icon: <Trophy size={32} />, name: "Quadra de Futsal" },
              { icon: <Sun size={32} />, name: "Vôlei / Beach Tennis" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/20 transition">
                <div className="text-olive-300 mb-3 flex justify-center">{item.icon}</div>
                <h4 className="font-bold">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gastronomy */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-olive-600 font-bold tracking-widest uppercase text-sm">Gastronomia Premium</span>
              <h2 className="text-4xl font-serif font-bold text-olive-900 mt-2 mb-6">Experiência Culinária com Chef Rai</h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Desfrute de pratos exclusivos criados pela renomada Chef Rai, que combina técnicas culinárias modernas com ingredientes locais selecionados para proporcionar uma experiência gastronômica inesquecível.
              </p>

              <div className="bg-olive-50 p-6 rounded-xl border border-olive-100 mb-8">
                <h4 className="font-bold text-olive-800 mb-4 flex items-center gap-2"><Clock size={18} /> Horários de Funcionamento</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex justify-between border-b border-olive-200 pb-2"><span>Café da Manhã</span> <span className="font-bold">07:00 - 10:00</span></li>
                  <li className="flex justify-between border-b border-olive-200 pb-2"><span>Almoço</span> <span className="font-bold">12:00 - 15:00</span></li>
                  <li className="flex justify-between"><span>Jantar</span> <span className="font-bold">19:00 - 22:00</span></li>
                </ul>
              </div>

              <button className="text-olive-600 font-bold uppercase tracking-wider hover:text-olive-800 transition flex items-center gap-2">
                Ver Cardápio Completo <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://picsum.photos/400/500?random=20" className="rounded-2xl shadow-lg w-full h-full object-cover translate-y-8" alt="Chef Rai" />
              <img src="https://picsum.photos/400/500?random=21" className="rounded-2xl shadow-lg w-full h-full object-cover" alt="Prato Gourmet" />
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-olive-400 font-bold tracking-widest uppercase text-sm">Agenda</span>
            <h2 className="text-4xl font-serif font-bold mt-2">Eventos Exclusivos</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Método IP 159", date: "30 e 31 de Outubro", desc: "Ative sua identidade e clarifique seu propósito." },
              { title: "Retiro de Liderança", date: "15-17 de Março", desc: "Desenvolvimento pessoal e liderança em ambiente exclusivo." },
              { title: "Workshop Mindset", date: "22-23 de Março", desc: "Mindset empreendedor e construção de riqueza." },
              { title: "Imersão em Vendas", date: "05-07 de Abril", desc: "Técnicas avançadas de vendas e negociação." },
            ].map((evt, idx) => (
              <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-olive-500 transition group">
                <div className="text-olive-400 font-bold text-sm mb-2">{evt.date}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-olive-400 transition">{evt.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{evt.desc}</p>
                <button className="text-sm font-bold text-white border border-white/20 px-4 py-2 rounded hover:bg-white hover:text-gray-900 transition w-full">
                  Saiba Mais
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-olive-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif font-bold text-olive-900 mb-12">Depoimentos de Hóspedes</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {['Henrique Toledo', 'Thales Agrico', 'Matheus Oliveira', 'Barbara'].map((name, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${name}`} alt={name} />
                </div>
                <h4 className="font-bold text-gray-800">{name}</h4>
                <div className="flex justify-center text-yellow-400 my-2">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
                <p className="text-xs text-gray-500">"Experiência incrível, voltarei com certeza!"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <span className="text-olive-600 font-bold tracking-widest uppercase text-sm">Localização</span>
              <h2 className="text-4xl font-serif font-bold text-olive-900 mt-2 mb-6">Fácil Acesso</h2>
              <p className="text-gray-600 mb-8">
                Localização privilegiada com paisagens deslumbrantes. Chegue durante o pôr do sol para uma experiência ainda mais especial.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-100 p-3 rounded-full text-olive-600"><Car size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-800">De Carro</h4>
                    <p className="text-sm text-gray-600">São Paulo: 2h30 (Rod. Bandeirantes)</p>
                    <p className="text-sm text-gray-600">Campinas: 1h15 (SP-340)</p>
                    <p className="text-sm text-gray-600">Ribeirão Preto: 1h45 (SP-330)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-olive-100 p-3 rounded-full text-olive-600"><Plane size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-800">Aeroportos Próximos</h4>
                    <p className="text-sm text-gray-600">Viracopos (VCP): 45 min</p>
                    <p className="text-sm text-gray-600">Congonhas (CGH): 2h15</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-olive-100 p-3 rounded-full text-olive-600"><MapPin size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-800">Endereço</h4>
                    <p className="text-sm text-gray-600">Estrada das Oliveiras, 1000 - Zona Rural</p>
                    <p className="text-sm text-gray-600">CEP: 13000-000 - Interior de SP</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-2xl h-[400px] w-full relative overflow-hidden">
              {/* Placeholder for Map */}
              <img src="https://picsum.photos/800/600?grayscale&blur=1" className="w-full h-full object-cover opacity-50" alt="Map Placeholder" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white px-6 py-3 rounded-full shadow-lg font-bold text-olive-600 flex items-center gap-2 hover:bg-gray-50 transition">
                  <MapPin size={20} /> Ver no Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="reservar" className="py-24 bg-olive-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-olive-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-olive-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Fale Conosco Agora</h2>
              <p className="text-olive-100 text-lg mb-8 leading-relaxed">
                Atendimento instantâneo 24/7 para reservas, dúvidas e eventos. Nossa equipe está pronta para atender você.
              </p>
              <ul className="space-y-4 text-olive-200">
                <li className="flex items-center gap-3"><CheckCircle className="text-olive-400" /> Resposta em menos de 1 minuto</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-olive-400" /> Atendimento personalizado</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-olive-400" /> Melhores condições direto no site</li>
              </ul>

              <div className="mt-8 flex gap-4">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg">
                  <Phone size={20} /> WhatsApp
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition border border-white/30">
                  <Mail size={20} /> E-mail
                </button>
              </div>
            </div>

            <div className="bg-white text-gray-800 rounded-3xl p-8 shadow-2xl">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Recebida!</h3>
                  <p className="text-gray-500">Agradecemos o interesse. Em breve nossa equipe entrará em contato com você.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicitar Orçamento</h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-olive-500 focus:outline-none transition" placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-olive-500 focus:outline-none transition" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-olive-500 focus:outline-none transition" placeholder="seu@email.com" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interesse</label>
                      <select name="interest" value={formData.interest} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-olive-500 focus:outline-none transition">
                        <option value={InterestType.ACCOMMODATION}>Hospedagem</option>
                        <option value={InterestType.EVENT}>Evento / Festa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pessoas</label>
                      <input required name="guests" value={formData.guests} onChange={handleInputChange} type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-olive-500 focus:outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Pretendida</label>
                    <input required name="date" value={formData.date} onChange={handleInputChange} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-olive-500 focus:outline-none transition" />
                  </div>
                  <button type="submit" className="w-full bg-olive-600 hover:bg-olive-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                    Enviar Solicitação
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Resort das Oliveiras</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sua experiência premium em meio às oliveiras, onde o luxo encontra a natureza. O resort preferido para eventos exclusivos e momentos especiais.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-olive-400">Navegação</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#acomodacoes" className="hover:text-white transition">Acomodações</a></li>
                <li><a href="#amenities" className="hover:text-white transition">Estrutura</a></li>
                <li><a href="#reservar" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-olive-400">Contato</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Phone size={14} /> (11) 99999-9999</li>
                <li className="flex items-center gap-2"><Mail size={14} /> contato@resortoliveiras.com.br</li>
                <li className="flex items-center gap-2"><MapPin size={14} /> Interior de São Paulo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-olive-400">Social</h3>
              <div className="flex gap-4">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-olive-600 transition"><Instagram size={20} /></a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-olive-600 transition"><Facebook size={20} /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© 2024 Resort das Oliveiras. CNPJ: 40.922.887/0001‑90</p>
            <p>Site Desenvolvido por <span className="text-olive-400 font-bold">Vitor Martins</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};