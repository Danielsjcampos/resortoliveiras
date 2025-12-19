# 🗺️ Mapa do Sistema - Resort das Oliveiras (MVP)

Este documento descreve a estrutura funcional, fluxos de dados e módulos do MVP do sistema de gestão do Resort das Oliveiras.

---

## 1. Visão Geral
O sistema é uma aplicação web híbrida composta por:
1.  **Front-end Público:** Landing page para captação de leads e exibição de conteúdo (Blog).
2.  **Backoffice Administrativo:** Painel de controle para gestão hoteleira, financeira, eventos e CRM.

**Stack Tecnológica Atual:**
-   **Frontend:** React 19, React Router v7.
-   **Estilização:** Tailwind CSS.
-   **Ícones:** Lucide React.
-   **Gráficos:** Recharts.
-   **Dados:** Mockados localmente (necessário migrar para API/Banco de Dados).

---

## 2. Módulos do Sistema

### 🌍 A. Área Pública (Landing Page)
Focada em conversão e branding.
*   **Hero Section:** Apresentação visual e CTA para reserva.
*   **Formulário de Leads:** Captura Nome, Email, Telefone, Data, Pessoas e Interesse (Hospedagem vs Evento). Simula envio para Webhook (n8n).
*   **Blog:** Exibição de artigos para atrair tráfego orgânico.

### 🏨 B. Gestão de Hospedagem & Recepção

#### 1. Dashboard (Visão de Águia)
*   **KPIs:** Hóspedes na casa, chegadas/saídas do dia, leads pendentes, faturamento parcial.
*   **Feed Operacional:** Lista dinâmica de Check-ins e Check-outs previstos para o dia.
*   **Alertas:** Avisos de manutenção urgente ou estoque baixo.

#### 2. Reservas (`/admin/reservations`)
O coração da operação hoteleira.
*   **Nova Reserva:** Formulário manual ligando um Lead a um Quarto disponível.
*   **Status:** Pendente -> Confirmado -> Check-in -> Check-out.
*   **Cálculo Automático:** (Diárias x Preço do Quarto) + Consumo Extra.
*   **Check-out:** Botão para encerrar a conta e liberar o quarto para limpeza.

#### 3. Acomodações (`/admin/accommodations`)
Mapa visual dos quartos.
*   **Status de Quarto:** Disponível (Verde), Ocupado (Vermelho), Limpeza (Amarelo), Manutenção (Cinza).
*   **Fluxo de Governança:** Camareira libera quarto de "Limpeza" para "Disponível". Manutenção bloqueia quarto.

### 💰 C. Financeiro & Vendas

#### 1. Ponto de Venda - PDV (`/admin/pos`) **(Novo)**
Interface visual para lançar produtos nas contas dos hóspedes.
*   **Catálogo Visual:** Grade de produtos com fotos (Restaurante, Bar, Passeios).
*   **Carrinho:** Adição/Remoção de itens.
*   **Vínculo:** Seleção do hóspede/quarto ativo (apenas status *Check-in*).
*   **Ação:** Lança o débito na comanda digital da reserva.

#### 2. Financeiro (`/admin/finance`) **(Novo)**
Controle de fluxo de caixa (DRE simplificado).
*   **Dashboard:** Receitas vs Despesas, Lucro Líquido, Gráfico de Pizza (Despesas por categoria).
*   **Transações:** Lista de Contas a Pagar e Receber.
*   **Automação:** Novas reservas geram automaticamente uma previsão de "Receita Pendente".

#### 3. Catálogo de Produtos (`/admin/products`)
Gestão do cardápio disponível no PDV.
*   Cadastro de itens com Preço, Categoria, Foto e Disponibilidade.

### 🥂 D. Eventos & Locais

#### 1. Gestão de Eventos (`/admin/events`)
*   **Visualização:** Alternância entre Lista (Kanban) e Calendário.
*   **Fluxo de Venda:** Solicitado -> Proposta Enviada -> Confirmado.
*   **Lista de Convidados:** Gestão de nomes, categorias (VIP/Staff) e Check-in de presença no dia do evento.

#### 2. Espaços / Venues (`/admin/venues`)
Cadastro dos locais físicos locáveis (ex: Salão Nobre, Jardim).
*   Definição de capacidade e preço base de locação.

### 👥 E. CRM & Marketing

#### 1. Gestão de Leads (`/admin/leads`)
Pipeline de vendas.
*   **Filtros:** Novos, Em andamento, Reservados.
*   **Histórico:** Log de interações e notas (ex: "Cliente prefere andar alto").
*   **Conversão:** Lead vira Reserva.

#### 2. Conteúdo & SEO (`/admin/content`)
Criação de posts para o Blog.
*   **Campos SEO:** Meta Keywords e Meta Description para indexação no Google.

---

## 3. Fluxos de Dados (Data Flow)

### Fluxo 1: A Jornada do Hóspede
1.  **Lead:** Visitante preenche form no site -> Cria Lead no Admin (Status: NOVO).
2.  **Venda:** Comercial entra em contato, negocia -> Muda status para RESERVADO.
3.  **Reserva:** Admin cria reserva vinculando Lead + Quarto + Datas. (Gera Transação Financeira Pendente).
4.  **Check-in:** Hóspede chega -> Status Reserva: CHECK-IN -> Status Quarto: OCUPADO.
5.  **Consumo:** Hóspede consome no bar -> Garçom lança no PDV -> Item adicionado à array `consumption` da reserva.
6.  **Check-out:** Recepção visualiza total (Diárias + Consumo) -> Confirma pagamento -> Status Reserva: CHECK-OUT -> Status Quarto: LIMPEZA -> Transação Financeira vira PAGO.

### Fluxo 2: Gestão de Eventos
1.  **Solicitação:** Lead pede orçamento de Casamento.
2.  **Agendamento:** Admin verifica disponibilidade no Calendário de Eventos por Local (Venue).
3.  **Confirmação:** Evento confirmado -> Vincula ao Local -> Bloqueia data.
4.  **Operação:** Admin sobe lista de convidados -> No dia, realiza check-in dos presentes.

---

## 4. Próximos Passos para Equipe de Dev (Back-end)

Para transformar este MVP em produto final, a equipe deve:

1.  **Banco de Dados:**
    *   Migrar as interfaces de `types.ts` para esquemas de banco (PostgreSQL ou MySQL recomendados).
    *   Relacionamentos chave: `Reservation` pertence a `Lead` e `Room`. `Consumption` pertence a `Reservation` e `Product`.

2.  **Autenticação:**
    *   Implementar login para área admin (JWT/NextAuth).

3.  **Integrações:**
    *   Conectar formulário do site a uma API real.
    *   Integrar gateway de pagamento no Checkout.

4.  **Storage:**
    *   Implementar upload real de imagens para Produtos, Blog e Locais (S3/Firebase).
