# Plano de Implementação: Módulo de Eventos 2.0 (Fluxo Completo)

## Objetivo
Transformar o atual cadastro simples de eventos em um fluxo completo de gestão, desde a proposta inicial até o fechamento financeiro pós-evento, cobrindo convidados extras e geração de documentos.

## 1. Atualização do Modelo de Dados (`types.ts`)

Precisaremos expandir a interface `EventRequest` e `EventGuest` para suportar o novo fluxo.

- **Novos Campos em `EventRequest`:**
  - `proposalUrl`: Link para a proposta gerada (opcional).
  - `proposalStatus`: `Draft` | `Sent` | `Approved` | `Rejected`.
  - `paymentStatus`: `PendingDeposit` | `DepositPaid` | `FullyPaid`.
  - `depositValue`: Valor da entrada/sinal.
  - `extraGuestsCost`: Custo por convidado extra negociado.
  - `images`: Array de strings (URLs) para múltiplas fotos.

- **Novos Campos em `EventGuest` (Participantes):**
  - `isExtra`: Booleano (indica se foi adicionado na hora/fora da lista original).
  - `checkedIn`: Booleano (se compareceu).

## 2. Interface de Criação e Edição (`AdminEvents.tsx`)

### A. Melhoria na Criação
- **Adicionar Upload/URL de Imagem:** Permitir inserir URL direta ou "Simular Upload" (salvar URL em base64 ou link simulado) para capa do evento.
- **Definição de Custos:** Campos claros para orçamento total e custo por pessoa (para cálculo de extras).

### B. Gestão da Proposta (Novo Painel)
- **Visualização da Proposta:** Um componente que renderiza os dados do evento em formato de documento "Bonito" (Logo, Dados, Valores).
- **Ações:**
  - `Imprimir/Salvar PDF`: Utilizar o estilo de impressão do navegador (`@media print`) para gerar um PDF limpo para envio.
  - `Editar Proposta`: Edição livre de texto/observações da proposta sem alterar os dados técnicos do evento (opcional).

## 3. Fluxo de Aprovação e Financeiro

- **Aprovar Proposta:**
  - Botão que muda status para `Confirmado`.
  - **Modal de Pagamento:** Solicita o valor do Sinal (Entrada).
  - **Ação Automática:** Ao confirmar, cria automaticamente uma transação de **Receita** no módulo Financeiro (`AdminFinance`) vinculada a este evento.

## 4. Gestão de Convidados e Check-in

- **Lista Prévia:** Interface para cadastrar/importar lista de nomes.
- **Dia do Evento (Mode Check-in):**
  - Uma view simplificada para recepção.
  - Busca rápida de nome.
  - Botão `Check-in` (confirma presença).
  - Botão `Adicionar Extra`: Adiciona alguém que não estava na lista e marca flag `isExtra`.

## 5. Fechamento Pós-Evento

- **Relatório Final:**
  - Compara `Convidados Previstos` vs `Presentes` vs `Extras`.
  - **Cálculo de Excedente:** `(Total Presentes - Total Contratado) * Custo Extra`.
- **Cobrança Final:**
  - Botão `Gerar Cobrança Extra`: Cria uma nova transação no Financeiro com o valor dos excedentes.
  - Geração de Recibo Final.

---

## Passos de Execução Imediata

1.  **Atualizar Tipos:** Modificar `types.ts` com as novas estruturas.
2.  **Refatorar `AdminEvents.tsx`:** Implementar as tabs de "Detalhes", "Proposta", "Financeiro" e "Convidados".
3.  **Implementar Lógica Financeira:** Conectar as ações de aprovação com a criação de transações em `App.tsx`.
