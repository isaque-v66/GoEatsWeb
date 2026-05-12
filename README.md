# GoEatsWeb

# 🍽️ Go Eats
# Go Eats

Sistema web para gerenciamento e envio de pedidos de refeições corporativas.

O **Go Eats** foi desenvolvido como um **protótipo funcional** para a empresa **BR Foods**, com o objetivo de automatizar o processo de solicitação, organização e envio de pedidos de refeições (como desjejum, almoço, jantar, etc.) dentro de um ambiente corporativo.

---

<<<<<<< HEAD
##  Visão Geral
=======
## Visão Geral
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

O sistema permite que usuários:

* Selecionem itens de refeição por categoria
* Escolham subcategorias (ex: bebidas → achocolatado, café, chá)
* Definam quantidades
* Enviem pedidos automaticamente
* Disparem pedidos via integração (WhatsApp ou e-mail)
* Automatizem pedidos recorrentes com base no dia anterior

---

<<<<<<< HEAD
##  Funcionalidades Principais

###  Criação de Pedidos
=======
## Funcionalidades Principais

### Criação de Pedidos
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Interface intuitiva para seleção de refeições
* Suporte a:

  * Itens simples (sem subcategoria)
  * Itens com subcategorias
* Controle de quantidade por item ou subitem

---

<<<<<<< HEAD
###  Resumo do Pedido
=======
### Resumo do Pedido
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Visualização em tempo real dos itens selecionados
* Edição de quantidades
* Remoção de itens ou subitens
* Contagem total de itens

---

<<<<<<< HEAD
###  Persistência de Dados
=======
### Persistência de Dados
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Pedidos são salvos no banco de dados via **Prisma ORM**
* Estrutura relacional com:

  * Usuários
  * Empresas
  * Pedidos
  * Itens
  * Subcategorias

---

<<<<<<< HEAD
###  Envio de Pedidos
=======
### Envio de Pedidos
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Envio automático após criação
* Integrações disponíveis:

  * WhatsApp (via API externa)
  * E-mail (via SMTP / Gmail)

---

<<<<<<< HEAD
###  Automação com Cron
=======
### Automação com Cron
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Rotina automática diária (8h)
* Caso o usuário não faça pedido no dia:

  * Sistema replica o pedido do dia anterior
  * Envia automaticamente

---

<<<<<<< HEAD
###  Autenticação
=======
### Autenticação
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Sistema de login com sessão
* Usuário vinculado a uma empresa
* Controle de acesso básico

---

<<<<<<< HEAD
##  Tecnologias Utilizadas
=======
## Tecnologias Utilizadas
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

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
* Supabase

---

### Integrações

* WhatsApp API (Z-API)
* Nodemailer (envio de e-mails)
* node-cron (tarefas agendadas)

---

<<<<<<< HEAD
##  Estrutura de Dados (Resumo)
=======
## Estrutura de Dados (Resumo)
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

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

<<<<<<< HEAD
##  Regras de Negócio

###  1. Um pedido por refeição/dia
=======
## Regras de Negócio

### 1. Um pedido por refeição/dia
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

Cada empresa só pode ter **um pedido por tipo de refeição por dia**:

```ts
@@unique([companyId, date, mealType])
```

---

<<<<<<< HEAD
###  2. Todos os itens devem ter o mesmo tipo de refeição

Não é permitido misturar:

* Almoço + Jantar no mesmo pedido 

---

###  3. Subcategorias são opcionais
=======
### 2. Todos os itens devem ter o mesmo tipo de refeição

Não é permitido misturar:

* Almoço + Jantar no mesmo pedido

---

### 3. Subcategorias são opcionais
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Item simples → quantidade direta
* Item com subcategoria → quantidade por subitem

---

<<<<<<< HEAD
###  4. Pedido automático
=======
### 4. Pedido automático
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

Se o usuário não fizer pedido no dia:

* Sistema busca o pedido do dia anterior
* Replica automaticamente
* Envia via integração

---

<<<<<<< HEAD
###  5. Controle por empresa
=======
### 5. Controle por empresa
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Cada usuário pertence a uma empresa
* Pedidos são organizados por empresa

---

<<<<<<< HEAD
##  Fluxo do Sistema
=======
## Fluxo do Sistema
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

1. Usuário faz login
2. Seleciona itens e quantidades
3. Sistema monta o pedido
4. Pedido é salvo no banco
5. Sistema envia automaticamente
6. (Opcional) Cron replica pedidos futuros

---

<<<<<<< HEAD
##  Configuração de Ambiente
=======
## Configuração de Ambiente
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

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
---

<<<<<<< HEAD
##  Testes Automatizados

O projeto possui testes automatizados cobrindo regras de negócio, autenticação e fluxo de interface do usuário.

### Testes Unitários e de Integração — Vitest

Utilizado para validar regras de negócio, serviços e fluxos internos da aplicação.

#### Cenários testados

**Autenticação**
- Login com credenciais válidas
- E-mail inexistente
- Senha inválida

**Pedidos**
- Criação de pedidos
- Validação de itens
- Regras de negócio do pedido
- Controle de tipos de refeição

**Validações**
- Estruturas com Zod
- Tratamento de erros
- Regras de consistência

#### Executar testes

```bash
npm run test
```

Ou em modo watch:

```bash
npm run test:watch
```

---

### Testes End-to-End (E2E) — Playwright

Utilizado para simular o comportamento real do usuário dentro da aplicação.

Os testes E2E verificam desde o login até a interação completa no dashboard de pedidos.

#### Cenários E2E implementados

**Login**
- Login com sucesso
- Erro de usuário inexistente
- Erro de senha inválida

**Fluxo de Pedido**
- Botão "Fazer Pedido" inicia desabilitado
- Usuário consegue adicionar item disponível
- Botão é habilitado após interação válida

#### Particularidades dos testes

Os testes utilizam:

- **Banco de dados isolado para E2E**
- **Seed automática de usuário de teste**
- **Mock de horário do sistema**, permitindo testar disponibilidade de refeições por período do dia
- Limpeza automática dos dados antes da execução

#### Executar testes E2E

Modo headless:

```bash
npm run test:e2e
```

Modo visual:

```bash
npm run test:e2e -- --headed
```

Interface do Playwright:

```bash
npm run test:e2e -- --ui
```

---

##  Cobertura dos Testes

Atualmente o projeto possui cobertura para:

- Autenticação  
- Regras de login  
- Fluxo de criação de pedido  
- Estados da interface  
- Regras de disponibilidade por horário  
- Interações do dashboard

---

---


##  Rodando o projeto
=======
## Rodando o projeto
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

```bash
npm install
npx prisma migrate dev
npm run dev
```

---

<<<<<<< HEAD
##  Status do Projeto
=======
## Status do Projeto
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

 Este projeto é um **protótipo**, podendo conter:

* Melhorias de arquitetura
* Ajustes de segurança
* Otimizações de performance

---

<<<<<<< HEAD
## Evoluções Futuras
=======
##  Evoluções Futuras
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

* Painel administrativo
* Relatórios de consumo
* Integração oficial com WhatsApp Business API
* Notificações em tempo real

<<<<<<< HEAD
=======
---

## Autor

Desenvolvido como projeto técnico e protótipo para ambiente corporativo.
>>>>>>> 841b5d636bde81fc686417b06fea01cc8009baa6

---


