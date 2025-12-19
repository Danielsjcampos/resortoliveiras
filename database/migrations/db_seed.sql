-- ==========================================
-- SEED DATA - RESORT OLIVEIRAS (DADOS FICTÍCIOS)
-- Copie e cole este conteúdo no SQL Editor do Supabase
-- ==========================================

-- 1. VENUES (Espaços de Eventos)
INSERT INTO public.venues (id, name, capacity, price_per_day, description, features, image) VALUES
('v-01', 'Salão Cristal', 200, 5000.00, 'Salão principal com vista panorâmica para o lago, ideal para grandes casamentos.', ARRAY['Ar Condicionado', 'Palco', 'Iluminação Cênica', 'Vista Panorâmica'], 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'),
('v-02', 'Jardim Secreto', 80, 2500.00, 'Espaço ao ar livre cercado por natureza, perfeito para cerimônias intimistas.', ARRAY['Ao Ar Livre', 'Decoração Natural', 'Iluminação de Fada'], 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800'),
('v-03', 'Deck do Lago', 120, 3500.00, 'Área coberta sobre o lago, excelente para coquetéis e sunsets.', ARRAY['Vista para Água', 'Bar Exclusivo', 'Som Ambiente'], 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'),
('v-04', 'Espaço Kids', 50, 1000.00, 'Área recreativa segura e divertida para festas infantis.', ARRAY['Brinquedos', 'Monitores', 'Segurança'], 'https://images.unsplash.com/photo-1596464716127-f9a827ce536c?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (id) DO NOTHING;

-- 2. PRODUCTS (Cardápio e Serviços)
INSERT INTO public.products (id, name, category, price, image, description, available, stock) VALUES
-- Bebidas
('p-01', 'Caipirinha Especial', 'Bar', 25.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200', 'Limão, Morango ou Maracujá com cachaça artesanal.', true, 500),
('p-02', 'Cerveja Artesanal IPA', 'Bar', 18.00, 'https://images.unsplash.com/photo-1608270586620-25fd19ed8edd?auto=format&fit=crop&q=80&w=200', 'Produção local, 500ml.', true, 200),
('p-03', 'Água de Coco', 'Bar', 12.00, 'https://images.unsplash.com/photo-1599363023812-32697b0a3aa4?auto=format&fit=crop&q=80&w=200', 'Natural, servida no coco.', true, 100),
('p-04', 'Suco Natural', 'Bar', 15.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=200', 'Laranja, Abacaxi ou Melancia.', true, 300),
-- Comida
('p-05', 'Porção de Iscas de Peixe', 'Restaurante', 55.00, 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=200', 'Acompanha molho tártaro e limão.', true, 50),
('p-06', 'Hambúrguer Gourmet', 'Restaurante', 42.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200', 'Blend de 180g, queijo cheddar, bacon e cebola caramelizada.', true, 80),
('p-07', 'Salada Caesar', 'Restaurante', 38.00, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=200', 'Alface americana, frango grelhado, croutons e parmesão.', true, 60),
('p-08', 'Filé Parmegiana', 'Restaurante', 65.00, 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=200', 'Para 1 pessoa, acompanha arroz e fritas.', true, 40),
-- Serviços
('p-09', 'Massagem Relaxante (1h)', 'Serviços', 150.00, 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=200', 'Massagem corporal completa com óleos essenciais.', true, 100),
('p-10', 'Passeio a Cavalo', 'Passeios', 80.00, 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=200', 'Duração de 40 minutos pela trilha ecológica.', true, 100)
ON CONFLICT (id) DO NOTHING;

-- 3. LEADS (Clientes em Potencial)
INSERT INTO public.leads (id, name, email, phone, interest, status, source, guests, date, notes) VALUES
('l-01', 'Roberto Carlos', 'roberto@email.com', '11999998888', 'Evento', 'Novo', 'Site', 150, NOW() + INTERVAL '3 months', 'Interesse em casamento para Maio/2026.'),
('l-02', 'Ana Maria', 'ana@email.com', '11988887777', 'Hospedagem', 'Atendimento', 'Instagram', 4, NOW() + INTERVAL '10 days', 'Quer reservar 2 bangalôs para o feriado.'),
('l-03', 'Empresa Tech X', 'contato@techx.com', '11977776666', 'Evento', 'Proposta', 'Indicação', 40, NOW() + INTERVAL '1 month', 'Workshop corporativo, precisa de projetor e coffee break.'),
('l-04', 'Juliana Paes', 'ju@email.com', '21999995555', 'Hospedagem', 'Ganho', 'WhatsApp', 2, NOW() + INTERVAL '2 days', 'Casal, lua de mel. Fechado Bangalô 01.'),
('l-05', 'Marcos Mion', 'marcos@email.com', '11955554444', 'Hospedagem', 'Perda', 'Google', 10, NOW() + INTERVAL '5 days', 'Achou o preço alto para o grupo.')
ON CONFLICT (id) DO NOTHING;

-- 4. RESERVATIONS (Reservas Reais)
INSERT INTO public.reservations (id, lead_id, guest_name, room_id, check_in, check_out, status, total_amount, access_code, consumption) VALUES
-- Passadas
('r-01', NULL, 'João Silva', 'b-05', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 'Check-out', 1200.00, NULL, '[{"description": "Frigobar", "value": 50.00, "quantity": 1, "date": "2024-12-10"}, {"description": "Jantar", "value": 150.00, "quantity": 1, "date": "2024-12-11"}]'::jsonb),
-- Atuais (Check-in realizado ou pendente para hoje)
('r-02', 'l-04', 'Juliana Paes', 'b-01', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 'Check-in', 2250.00, '392810', '[{"description": "Champagne Boas Vindas", "value": 0.00, "quantity": 1, "date": "2024-12-17"}]'::jsonb),
('r-03', NULL, 'Carlos Nobrega', 'b-10', NOW(), NOW() + INTERVAL '3 days', 'Check-in', 2250.00, '482918', '[]'::jsonb),
-- Futuras
('r-04', 'l-02', 'Ana Maria', 'b-11', NOW() + INTERVAL '5 days', NOW() + INTERVAL '8 days', 'Confirmado', 3900.00, NULL, '[]'::jsonb),
('r-05', NULL, 'Família Souza', 'b-20', NOW() + INTERVAL '10 days', NOW() + INTERVAL '15 days', 'Pendente', 3750.00, NULL, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. EVENT REQUESTS (Eventos)
INSERT INTO public.event_requests (id, lead_id, title, type, date, guests, budget, status, venue_id, show_on_site, description) VALUES
('e-01', 'l-01', 'Casamento Roberto e Carla', 'Casamento', NOW() + INTERVAL '3 months', 150, 45000.00, 'Proposta Enviada', 'v-01', false, 'Casamento clássico, cerimônia no local.'),
('e-02', 'l-03', 'Workshop Inovação', 'Corporativo', NOW() + INTERVAL '1 month', 40, 8000.00, 'Confirmado', 'v-03', true, 'Treinamento de equipe, dia todo.'),
('e-03', NULL, 'Aniversário 15 Anos', 'Aniversário', NOW() + INTERVAL '20 days', 80, 15000.00, 'Solicitado', 'v-02', false, 'Festa temática neon.')
ON CONFLICT (id) DO NOTHING;

-- 6. TRANSACTIONS (Financeiro)
INSERT INTO public.transactions (id, description, amount, type, category, date, status) VALUES
('t-01', 'Reserva r-01 (João Silva)', 1200.00, 'INCOME', 'Hospedagem', NOW() - INTERVAL '8 days', 'PAID'),
('t-02', 'Compra de Bebidas', 3500.00, 'EXPENSE', 'Estoque', NOW() - INTERVAL '15 days', 'PAID'),
('t-03', 'Manutenção Ar Condicionado', 450.00, 'EXPENSE', 'Manutenção', NOW() - INTERVAL '5 days', 'PAID'),
('t-04', 'Sinal Evento Tech X', 4000.00, 'INCOME', 'Eventos', NOW() - INTERVAL '2 days', 'PAID'),
('t-05', 'Fornecedor de Carnes', 1200.00, 'EXPENSE', 'Alimentação', NOW() - INTERVAL '1 day', 'PENDING'),
('t-06', 'Pagamento Jardineiro', 800.00, 'EXPENSE', 'Serviços', NOW() - INTERVAL '10 days', 'PAID')
ON CONFLICT (id) DO NOTHING;

-- 7. BLOG POSTS (Notícias)
INSERT INTO public.blog_posts (id, title, category, excerpt, content, image, date) VALUES
('post-01', '5 Motivos para casar no campo', 'Dicas', 'Descubra por que casamentos ao ar livre são a tendência do momento.', 'Conteúdo completo sobre casamentos...', 'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '20 days'),
('post-02', 'Novos Pratos no Menu', 'Gastronomia', 'Nosso chef preparou surpresas incríveis para essa estação.', 'Conteúdo sobre o novo menu...', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '5 days'),
('post-03', 'Feriado de Páscoa no Resort', 'Eventos', 'Confira nossa programação especial para a família.', 'Programação completa...', 'https://images.unsplash.com/photo-1589400376662-520556c42407?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- 8. TIME LOGS (Ponto - Exemplo)
-- Assumindo que temos o usuário admin
INSERT INTO public.time_logs (id, user_id, type, timestamp, device_info) 
SELECT 
  'log-' || gen_random_uuid(), 
  id, 
  'ENTRADA', 
  NOW() - INTERVAL '4 hours', 
  'Chrome Desktop'
FROM public.users WHERE email = 'admin@oliveiras.com'
LIMIT 1;
