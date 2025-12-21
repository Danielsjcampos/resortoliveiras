
import React, { useState } from 'react';
import { InterestType, Lead, SystemSettings, EventRequest } from '../types';
import { 
  MapPin, Users, Coffee, Wifi, ArrowRight, 
  Calendar, Sparkles, UtensilsCrossed, Waves, 
  ChefHat, Play, MessageSquare, Snowflake, Bath, Home as HomeIcon,
  Instagram, Facebook, Linkedin, Mail, Phone, Music, Shield, Palmtree, Ticket, X, CheckCircle
} from 'lucide-react';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';

interface PublicHomeProps {
  onAddLead: (leadData: Partial<Lead>) => void;
  onBuyTicket?: (participant: any) => void;
  settings?: SystemSettings;
  publicEvents?: EventRequest[];
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onAddLead, onBuyTicket, settings, publicEvents = [] }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', guests: 2, interest: InterestType.ACCOMMODATION
  });
  const [submitted, setSubmitted] = useState(false);
  
  // Ticket Modal State
  const [buyingEvent, setBuyingEvent] = useState<EventRequest | null>(null);
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', phone: '', quantity: 1 });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const heroImages = [
    'https://resortdasoliveiras1.com.br/assets/hero-resort-BpFhY-4W.webp',
    'https://resortdasoliveiras1.com.br/assets/744a662e-411b-4047-bd73-3f67653f60f8.png',
    'https://resortdasoliveiras1.com.br/assets/d2d2ab3e-fe12-4410-aed3-35383679b6de.png',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({ ...formData, tags: ['Site - Novo Lead'] });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); }, 4000);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onBuyTicket && buyingEvent) {
          onBuyTicket({
              eventId: buyingEvent.id,
              name: ticketForm.name,
              email: ticketForm.email,
              phone: ticketForm.phone
          });
          setTicketSuccess(true);
          setTimeout(() => {
              setTicketSuccess(false);
              setBuyingEvent(null);
              setTicketForm({ name: '', email: '', phone: '', quantity: 1 });
          }, 3000);
      }
  };

  const visibleEvents = publicEvents.filter(e => e.showOnSite);

  return (
    <div className="flex flex-col bg-white overflow-x-hidden scroll-smooth font-sans text-stone-900">
      
      {/* 1. HERO SECTION */}
      <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 z-0">
             <img src={heroImages[0]} className="w-full h-full object-cover animate-slow-zoom" alt="Resort Hero" />
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 bg-[#25D366]/20 border border-[#25D366] rounded-full px-6 py-2 mb-4 backdrop-blur-md animate-pulse">
              <MessageSquare size={18} className="text-[#25D366]" />
              <span className="text-white font-semibold text-sm tracking-wide">Atendimento 24/7 pelo WhatsApp</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight drop-shadow-lg">
             {settings?.resortName || "Resort das Oliveiras"}
           </h1>
           
           <p className="text-xl md:text-2xl font-light text-stone-100/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
             Experiência premium onde o luxo encontra a natureza em meio às oliveiras.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <a href="#/reservas" className="group inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-10 rounded-lg transition-all hover:-translate-y-1 hover:shadow-2xl shadow-lg hover:shadow-[#25D366]/40 text-lg">
                <MessageSquare size={24} /> Reservar Agora
              </a>
              <a href="#tour-virtual" className="inline-flex items-center justify-center gap-2 text-white hover:text-stone-200 transition-colors font-semibold uppercase tracking-widest text-sm">
                <span className="p-2 border border-white/30 rounded-full"><Play size={12} fill="currentColor" /></span> Ver Tour Virtual
              </a>
           </div>

           <div className="pt-8">
              <a href="#/guest" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-bold hover:bg-white/20 hover:scale-105 transition-all shadow-lg">
                <div className="p-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Já é hóspede? Consulte sua Comanda
                <ArrowRight size={16} />
              </a>
           </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
            </div>
        </div>
      </section>

      {/* 2. FEATURE ICONS STRIP */}
      <div className="bg-stone-50 border-b border-stone-200 py-6 overflow-hidden">
        <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-stone-600">
                <div className="flex items-center gap-3 group">
                   <div className="p-2 bg-olive-100 rounded-full text-olive-700 group-hover:scale-110 transition"><HomeIcon size={20} /></div>
                   <span className="font-medium text-sm uppercase tracking-wide">Acomodações Premium</span>
                </div>
                <div className="flex items-center gap-3 group">
                   <div className="p-2 bg-olive-100 rounded-full text-olive-700 group-hover:scale-110 transition"><ChefHat size={20} /></div>
                   <span className="font-medium text-sm uppercase tracking-wide">Gastronomia Chef Rai</span>
                </div>
                <div className="flex items-center gap-3 group">
                   <div className="p-2 bg-olive-100 rounded-full text-olive-700 group-hover:scale-110 transition"><Waves size={20} /></div>
                   <span className="font-medium text-sm uppercase tracking-wide">Lazer Completo</span>
                </div>
                <div className="flex items-center gap-3 group">
                   <div className="p-2 bg-olive-100 rounded-full text-olive-700 group-hover:scale-110 transition"><Music size={20} /></div>
                   <span className="font-medium text-sm uppercase tracking-wide">Eventos Exclusivos</span>
                </div>
            </div>
        </div>
      </div>

      {/* 3. DIFFERENTIALS */}
      <section className="py-24 bg-gradient-to-b from-white to-stone-50">
         <div className="container mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                 <h2 className="text-4xl font-bold text-olive-900">Nossos Diferenciais</h2>
                 <p className="text-lg text-stone-500">Descubra o que torna o Resort das Oliveiras único e especial para sua estadia.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                 {[
                     { icon: <Palmtree className="text-white" size={32} />, title: "Natureza Exuberante", desc: "Ambiente único com atividades ao ar livre em meio às oliveiras.", color: "bg-olive-600" },
                     { icon: <UtensilsCrossed className="text-white" size={32} />, title: "Gastronomia Premium", desc: "Menu especial preparado por chef renomado com ingredientes locais.", color: "bg-stone-800" },
                     { icon: <Waves className="text-white" size={32} />, title: "Piscina & Spa", desc: "Relaxe em nossa piscina climatizada e aproveite massagens exclusivas.", color: "bg-olive-600" },
                     { icon: <Shield className="text-white" size={32} />, title: "Segurança 24h", desc: "Ambiente protegido e monitorado constantemente para sua tranquilidade.", color: "bg-stone-800" },
                     { icon: <Users className="text-white" size={32} />, title: "Eventos Especiais", desc: "Programação exclusiva com palestras e workshops renomados.", color: "bg-olive-600" },
                     { icon: <MapPin className="text-white" size={32} />, title: "Localização Privilegiada", desc: "Fácil acesso e vista panorâmica da Serra da Mantiqueira.", color: "bg-stone-800" }
                 ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-stone-100 group">
                        <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-3">{item.title}</h3>
                        <p className="text-stone-500 leading-relaxed">{item.desc}</p>
                    </div>
                 ))}
             </div>
         </div>
      </section>

      {/* 3.5. VIDEO PROMO */}
      {/* 3.5. VIDEO PROMO - SCROLL EXPAND HERO */}
      <section id="tour-virtual" className="bg-stone-900 border-y border-stone-800 relative z-20">
         <ScrollExpandMedia 
            mediaType="video"
            mediaSrc="https://www.youtube.com/watch?v=VJsnq6m6Utc"
            bgImageSrc="https://resortdasoliveiras1.com.br/lovable-uploads/d2d2ab3e-fe12-4410-aed3-35383679b6de.png"
            title="Sinta a Experiência"
            date="Resort das Oliveiras"
            scrollToExpand="Role para Mergulhar"
            textBlend={true}
         >
             <div className="max-w-3xl mx-auto text-center bg-black/60 p-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <p className="text-xl md:text-2xl text-stone-100 leading-relaxed font-light mb-8">
                   "Um refúgio de paz, luxo e natureza esperando por você."
                </p>
                <a href="#/reservas" className="inline-flex items-center gap-2 bg-olive-600 hover:bg-olive-500 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-olive-600/50 hover:-translate-y-1">
                   <Calendar size={20} /> Viver essa Experiência
                </a>
             </div>
         </ScrollExpandMedia>
      </section>

      {/* 4. GALERIA DESTAQUE (BANGALÔ) */}
      <section id="acomodacoes" className="py-24 bg-stone-900 text-white relative overflow-hidden z-30">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                  <div className="lg:w-1/2 space-y-8">
                      <div className="inline-block bg-olive-500/20 text-olive-300 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider border border-olive-500/30">
                          22 Unidades Disponíveis
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight">Bangalô Flex <br/><span className="text-olive-400">Premium</span></h2>
                      <p className="text-stone-400 text-lg leading-relaxed">
                          Acomodação única e adaptável às suas necessidades. Configure o espaço de acordo com o seu perfil, seja casal, família ou amigos.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-6">
                          {['Ar Climatizado', 'Wi-Fi Dedicado', 'Frigobar', 'Varanda Privativa', 'Banho Premium', 'Serviço de Quarto'].map((feat, i) => (
                              <div key={i} className="flex items-center gap-3 text-stone-300">
                                  <CheckCircle size={18} className="text-olive-500" /> {feat}
                              </div>
                          ))}
                      </div>

                      <div className="pt-8 flex flex-wrap gap-4">
                          <a href="#/reservas" className="bg-olive-600 hover:bg-olive-500 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-olive-600/30 flex items-center gap-2">
                             <Calendar size={20} /> Reservar Bangalô
                          </a>
                      </div>
                  </div>
                  
                  <div className="lg:w-1/2">
                       <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-800 group max-w-[50%] mx-auto">
                           <img src="https://resortdasoliveiras1.com.br/lovable-uploads/e7775349-711a-42f4-9718-cf1df4b660f8.png" alt="Bangalô" className="w-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                               <p className="text-xl font-bold">Configuração Casal ou Família</p>
                           </div>
                       </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 5. GASTRONOMIA */}
      <section className="py-24 bg-olive-50">
          <div className="container mx-auto px-4">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                  <div className="md:w-1/2 relative z-10">
                       <div className="flex items-center gap-2 text-olive-600 font-bold uppercase tracking-widest text-sm mb-4">
                           <ChefHat size={20} /> Alta Gastronomia
                       </div>
                       <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mb-6">Menu Assinado pela <span className="text-olive-600">Chef Rai</span></h2>
                       <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                           Desfrute de pratos exclusivos que combinam técnicas culinárias modernas com ingredientes locais colhidos em nossa própria horta e das oliveiras centenárias.
                       </p>
                       <div className="space-y-4 mb-8 bg-stone-50 p-6 rounded-xl border border-stone-100">
                           <div className="flex justify-between border-b border-stone-200 pb-2">
                               <span className="font-bold text-stone-700">Café da Manhã</span>
                               <span className="text-olive-700 font-medium">07:00 - 10:00</span>
                           </div>
                           <div className="flex justify-between border-b border-stone-200 pb-2">
                               <span className="font-bold text-stone-700">Almoço</span>
                               <span className="text-olive-700 font-medium">12:00 - 15:00</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="font-bold text-stone-700">Jantar</span>
                               <span className="text-olive-700 font-medium">19:00 - 22:00</span>
                           </div>
                       </div>
                       <button className="text-olive-700 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                           Ver Menu Completo <ArrowRight size={20} />
                       </button>
                  </div>
                  <div className="md:w-1/2 relative">
                      <div className="relative rounded-2xl overflow-hidden shadow-lg rotate-2 hover:rotate-0 transition-all duration-500">
                           <img src="https://resortdasoliveiras1.com.br/lovable-uploads/790934d6-ff86-4ab4-8457-4976e8eb8e40.png" alt="Chef Rai" className="w-full h-auto object-cover" />
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 6. EVENTOS SLIDER (DYNAMIC) */}
      <section id="eventos" className="py-24 bg-white">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-stone-900 mb-4">Eventos Exclusivos</h2>
                  <p className="text-lg text-stone-500">Experiências transformadoras com grandes nomes.</p>
              </div>

              {visibleEvents.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 border border-dashed rounded-2xl">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50"/>
                      <p>Nenhum evento público disponível no momento.</p>
                  </div>
              ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {visibleEvents.map(ev => (
                        <div key={ev.id} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col h-full">
                            <div className="relative h-64 overflow-hidden">
                                {ev.coverImage ? (
                                    <img src={ev.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ev.title} />
                                ) : (
                                    <div className="w-full h-full bg-olive-100 flex items-center justify-center text-olive-300">
                                        <Sparkles size={48} />
                                    </div>
                                )}
                                {ev.isPublicTicket && ev.ticketPrice && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg">
                                        R$ {ev.ticketPrice.toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-stone-800 mb-2">{ev.title}</h3>
                                <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
                                    <Calendar size={16} /> {ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR') : ev.date}
                                </div>
                                <p className="text-stone-500 mb-6 flex-1 line-clamp-3">{ev.description || 'Um evento exclusivo.'}</p>
                                
                                {ev.isPublicTicket ? (
                                    <button 
                                        onClick={() => setBuyingEvent(ev)} 
                                        className="w-full py-3 rounded-lg bg-olive-600 text-white font-bold hover:bg-olive-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-olive-600/30"
                                    >
                                        <Ticket size={18} /> Comprar Ingresso
                                    </button>
                                ) : (
                                    <button className="w-full py-3 rounded-lg border-2 border-olive-500 text-olive-600 font-bold hover:bg-olive-50 transition-colors flex items-center justify-center gap-2">
                                        <MessageSquare size={18} /> Mais Detalhes
                                    </button>
                                )}
                            </div>
                        </div>
                      ))}
                  </div>
              )}
          </div>
      </section>

      {/* Ticket Purchase Modal */}
      {buyingEvent && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                  <div className="bg-olive-900 p-6 text-white flex justify-between items-center">
                      <div>
                          <h3 className="font-bold text-xl">Comprar Ingresso</h3>
                          <p className="text-olive-300 text-sm">{buyingEvent.title}</p>
                      </div>
                      <button onClick={() => setBuyingEvent(null)}><X size={24} /></button>
                  </div>
                  
                  <div className="p-8">
                      {ticketSuccess ? (
                          <div className="text-center py-10">
                              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                  <CheckCircleIcon size={32} />
                              </div>
                              <h4 className="text-2xl font-bold text-green-800 mb-2">Sucesso!</h4>
                              <p className="text-gray-500">Seu ingresso foi reservado. Enviamos os detalhes para seu email.</p>
                          </div>
                      ) : (
                          <form onSubmit={handleTicketSubmit} className="space-y-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                                  <input required className="w-full border p-3 rounded-xl bg-gray-50" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} placeholder="Seu nome" />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                  <input required type="email" className="w-full border p-3 rounded-xl bg-gray-50" value={ticketForm.email} onChange={e => setTicketForm({...ticketForm, email: e.target.value})} placeholder="seu@email.com" />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                                  <input required className="w-full border p-3 rounded-xl bg-gray-50" value={ticketForm.phone} onChange={e => setTicketForm({...ticketForm, phone: e.target.value})} placeholder="(00) 00000-0000" />
                              </div>
                              <div className="pt-4 flex justify-between items-center border-t mt-4">
                                  <div className="text-sm text-gray-500">Total a Pagar</div>
                                  <div className="text-2xl font-black text-olive-600">R$ {buyingEvent.ticketPrice?.toFixed(2)}</div>
                              </div>
                              <button type="submit" className="w-full py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2 text-lg">
                                  Confirmar Compra
                              </button>
                          </form>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* 7. FORMULÁRIO RÁPIDO FOOTER */}
      <section id="reservar" className="py-24 bg-olive-900 text-white relative">
         <div className="container mx-auto px-4 relative z-10">
             <div className="max-w-4xl mx-auto text-center">
                 <h2 className="text-4xl font-bold mb-6">Pronto para viver essa experiência?</h2>
                 <p className="text-olive-200 text-lg mb-10">Preencha seus dados e nossa equipe de concierge entrará em contato para personalizar sua estadia.</p>
                 
                 {submitted ? (
                     <div className="bg-green-500/20 p-8 rounded-2xl border border-green-500 flex flex-col items-center animate-fade-in-up">
                         <div className="p-4 bg-green-500 text-white rounded-full mb-4"><CheckCircleIcon size={32} /></div>
                         <h3 className="text-2xl font-bold mb-2">Solicitação Recebida!</h3>
                         <p>Em breve você receberá nosso contato.</p>
                     </div>
                 ) : (
                     <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-left grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-sm font-bold uppercase tracking-wide text-olive-300">Nome Completo</label>
                             <input required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-olive-400 transition" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Seu nome" />
                         </div>
                         <div className="space-y-2">
                             <label className="text-sm font-bold uppercase tracking-wide text-olive-300">WhatsApp</label>
                             <input required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-olive-400 transition" 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" />
                         </div>
                         <div className="space-y-2">
                             <label className="text-sm font-bold uppercase tracking-wide text-olive-300">Email</label>
                             <input required type="email" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-olive-400 transition" 
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="seu@email.com" />
                         </div>
                         <div className="space-y-2">
                             <label className="text-sm font-bold uppercase tracking-wide text-olive-300">Interesse</label>
                             <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-olive-400 transition [&>option]:text-stone-900"
                                     value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value as InterestType})}>
                                 <option value={InterestType.ACCOMMODATION}>Hospedagem & Lazer</option>
                                 <option value={InterestType.EVENT}>Eventos & Corporativo</option>
                             </select>
                         </div>
                         <div className="md:col-span-2 pt-4">
                             <button type="submit" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                                 Solicitar Disponibilidade
                             </button>
                         </div>
                     </form>
                 )}
             </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-950 text-stone-400 py-16 border-t border-white/5">
         <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-between gap-12">
               <div className="w-full md:w-1/3 space-y-6">
                  {settings?.logoUrl && <img src={settings.logoUrl} className="h-12 w-auto grayscale brightness-150 opacity-80" alt="Logo" />}
                  <p className="leading-relaxed text-sm">
                      O Resort das Oliveiras é o destino perfeito para quem busca reconexão, luxo e natureza.
                  </p>
                  <div className="flex gap-4">
                     <a href={settings?.instagramUrl || '#'} className="p-2 bg-white/5 rounded-full hover:bg-olive-600 hover:text-white transition"><Instagram size={18} /></a>
                     <a href={settings?.facebookUrl || '#'} className="p-2 bg-white/5 rounded-full hover:bg-olive-600 hover:text-white transition"><Facebook size={18} /></a>
                     <a href={settings?.linkedinUrl || '#'} className="p-2 bg-white/5 rounded-full hover:bg-olive-600 hover:text-white transition"><Linkedin size={18} /></a>
                     {settings?.youtubeUrl && (
                        <a href={settings.youtubeUrl} target="_blank" className="p-2 bg-white/5 rounded-full hover:bg-olive-600 hover:text-white transition"><Play size={18} /></a>
                     )}
                  </div>
               </div>
               
               <div className="w-full md:w-1/4 space-y-4">
                   <h4 className="text-white font-bold uppercase tracking-wider text-sm">Links Rápidos</h4>
                   <ul className="space-y-2 text-sm">
                       <li><a href="#home" className="hover:text-olive-400 transition">Início</a></li>
                       <li><a href="#acomodacoes" className="hover:text-olive-400 transition">Acomodações</a></li>
                       <li><a href="#eventos" className="hover:text-olive-400 transition">Eventos</a></li>
                       <li><a href="/admin" className="hover:text-olive-400 transition">Portal Administrativo</a></li>
                       <li><a href="#/guest" className="hover:text-olive-400 transition font-bold text-olive-500">Área do Hóspede</a></li>
                   </ul>
               </div>

               <div className="w-full md:w-1/3 space-y-4">
                   <h4 className="text-white font-bold uppercase tracking-wider text-sm">Contato</h4>
                   <ul className="space-y-3 text-sm">
                       <li className="flex items-center gap-3"><MapPin size={16} className="text-olive-600" /> {settings?.resortAddress}</li>
                       <li className="flex items-center gap-3"><Mail size={16} className="text-olive-600" /> {settings?.contactEmail}</li>
                       <li className="flex items-center gap-3"><Phone size={16} className="text-olive-600" /> {settings?.contactPhone}</li>
                   </ul>
               </div>
            </div>
            <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs uppercase tracking-widest opacity-50">
               &copy; 2024 {settings?.resortName}. Todos os direitos reservados.
            </div>
         </div>
      </footer>

      <style>{`
        .animate-slow-zoom { animation: slow-zoom 25s infinite alternate ease-in-out; }
        @keyframes slow-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
      `}</style>
    </div>
  );
};

// Simple Icon Component for inline use if CheckCircle is not imported or needed differently
const CheckCircleIcon = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
