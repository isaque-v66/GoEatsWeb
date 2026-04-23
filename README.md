# GoEatsWeb

# 🍽️ Go Eats

Sistema web para gerenciamento e envio de pedidos de refeições corporativas.

O **Go Eats** foi desenvolvido como um **protótipo funcional** para a empresa **BR Foods**, com o objetivo de automatizar o processo de solicitação, organização e envio de pedidos de refeições (como desjejum, almoço, jantar, etc.) dentro de um ambiente corporativo.

---

## 🚀 Visão Geral

O sistema permite que usuários:

* Selecionem itens de refeição por categoria
* Escolham subcategorias (ex: bebidas → achocolatado, café, chá)
* Definam quantidades
* Enviem pedidos automaticamente
* Disparem pedidos via integração (WhatsApp ou e-mail)
* Automatizem pedidos recorrentes com base no dia anterior

---

## 🧠 Funcionalidades Principais

### 🛒 Criação de Pedidos

* Interface intuitiva para seleção de refeições
* Suporte a:

  * Itens simples (sem subcategoria)
  * Itens com subcategorias
* Controle de quantidade por item ou subitem

---

### 🧾 Resumo do Pedido

* Visualização em tempo real dos itens selecionados
* Edição de quantidades
* Remoção de itens ou subitens
* Contagem total de itens

---

### 📦 Persistência de Dados

* Pedidos são salvos no banco de dados via **Prisma ORM**
* Estrutura relacional com:

  * Usuários
  * Empresas
  * Pedidos
  * Itens
  * Subcategorias

---

### 📤 Envio de Pedidos

* Envio automático após criação
* Integrações disponíveis:

  * WhatsApp (via API externa)
  * E-mail (via SMTP / Gmail)

---

### ⏰ Automação com Cron

* Rotina automática diária (8h)
* Caso o usuário não faça pedido no dia:

  * Sistema replica o pedido do dia anterior
  * Envia automaticamente

---

### 🔐 Autenticação

* Sistema de login com sessão
* Usuário vinculado a uma empresa
* Controle de acesso básico

---

## 🏗️ Tecnologias Utilizadas

### Frontend

* React
* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Lucide Icons
* Zod (validação)

---

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL
* Node.js

---

### Integrações

* WhatsApp API (Z-API)
* Nodemailer (envio de e-mails)
* node-cron (tarefas agendadas)

---

## 🧩 Estrutura de Dados (Resumo)

* **User**

  * Vinculado a uma empresa
* **Company**

  * Agrupa usuários e pedidos
* **Order**

  * Pedido por data e tipo de refeição
* **OrderItem**

  * Itens do pedido
* **Item**

  * Tipos de refeição
* **Subcategory**

  * Variações de itens

---

## ⚙️ Regras de Negócio

### 📌 1. Um pedido por refeição/dia

Cada empresa só pode ter **um pedido por tipo de refeição por dia**:

```ts
@@unique([companyId, date, mealType])
```

---

### 📌 2. Todos os itens devem ter o mesmo tipo de refeição

Não é permitido misturar:

* Almoço + Jantar no mesmo pedido ❌

---

### 📌 3. Subcategorias são opcionais

* Item simples → quantidade direta
* Item com subcategoria → quantidade por subitem

---

### 📌 4. Pedido automático

Se o usuário não fizer pedido no dia:

* Sistema busca o pedido do dia anterior
* Replica automaticamente
* Envia via integração

---

### 📌 5. Controle por empresa

* Cada usuário pertence a uma empresa
* Pedidos são organizados por empresa

---

## 🔄 Fluxo do Sistema

1. Usuário faz login
2. Seleciona itens e quantidades
3. Sistema monta o pedido
4. Pedido é salvo no banco
5. Sistema envia automaticamente
6. (Opcional) Cron replica pedidos futuros

---

## 🛠️ Configuração de Ambiente

Crie um arquivo `.env` com:

```env
DATABASE_URL=
DIRECT_URL=

# WhatsApp (opcional)
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_PHONE=

# Email (opcional)
EMAIL_USER=
EMAIL_PASS=
```

---

## ▶️ Rodando o projeto

```bash
npm install
npx prisma migrate dev
npm run dev
```

---

## 📌 Status do Projeto

⚠️ Este projeto é um **protótipo**, podendo conter:

* Melhorias de arquitetura
* Ajustes de segurança
* Otimizações de performance

---

## 💡 Evoluções Futuras

* Painel administrativo
* Relatórios de consumo
* Integração oficial com WhatsApp Business API
* Multi-tenant mais robusto
* Notificações em tempo real
* Controle de horários por empresa

---

## 👨‍💻 Autor

Desenvolvido como projeto técnico e protótipo para ambiente corporativo.

---


