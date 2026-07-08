<p align="center">
  <img src="./public/images/logos/logo.png" alt="POS App Logo" width="300" height="auto"/>
</p>

  <p align="center">
    Um sistema moderno de Ponto de Venda (PDV) de alta performance construído com<br/>
    <strong>Laravel 13</strong> · <strong>Inertia.js v3</strong> · <strong>React 19</strong> · <strong>Tailwind CSS v4</strong>
  </p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.4-777BB4?logo=php&logoColor=white" alt="PHP 8.4"/>
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white" alt="Laravel 13"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Pest-4-F28D1A?logo=php&logoColor=white" alt="Pest 4"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
</p>

<p align="center">
  <strong>Idiomas Suportados:</strong>
  <img src="https://img.shields.io/badge/Português-🇧🇷-34D399" alt="Português"/>
  <img src="https://img.shields.io/badge/English-🇺🇸-60A5FA" alt="English"/>
  <img src="https://img.shields.io/badge/Español-🇪🇸-F87171" alt="Español"/>
</p>

<p align="center">
  Traduções: <a href="README.md">English 🇺🇸</a> | <strong>Português 🇧🇷</strong> | <a href="README.es.md">Español 🇪🇸</a>
</p>

---

## 📑 Sumário

- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Tecnologias](#-tecnologias)
- [Credenciais Padrão](#-credenciais-padrão)
- [Testes e Qualidade de Código](#-testes-e-qualidade-de-código)
- [Licença](#-licença)

---

## ✨ Funcionalidades

### 🛍️ Terminal PDV (Ponto de Venda)
- **Terminal PDV Interativo** — Interface de vendas completa com grade de produtos, gerenciamento de carrinho em tempo real e finalização de compra instantânea
- **Múltiplos Métodos de Pagamento** — Suporte para Dinheiro, Cartão de Crédito, Cartão de Débito e PIX
- **Carrinho Inteligente** — Adicionar/remover itens, ajustar quantidades e ver totais em tempo real com cálculo de descontos
- **Sistema de Cupons** — Aplicar cupons baseados em porcentagem com escopo flexível (global, por categoria ou por produto)
- **Recibo Digital** — Recibo gerado automaticamente com detalhes da venda, informações de pagamento e cálculo de troco
- **Validação de Estoque** — Verificação de estoque em tempo real durante a finalização da compra com bloqueio pessimista (*pessimistic locking*) para evitar a venda de itens sem estoque disponível
- **Atalhos do Teclado** — Navegação completa por teclado: `F2` busca, setas navegam nos produtos, `Enter` adiciona ao carrinho, `F8` finaliza a compra, `Alt+N` limpa o carrinho, `F3` aplica cupom, teclas numéricas para métodos de pagamento, `Esc` cancela

### 📊 Painel Geral e Estatísticas
- **Métricas de Faturamento** — Faturamento total, quantidade de vendas e ticket médio visíveis rapidamente
- **Detalhamento de Pagamentos** — Gráfico visual de vendas por método de pagamento
- **Produtos Mais Vendidos** — Lista ranqueada dos produtos com melhor desempenho
- **Alertas de Estoque Baixo** — Visibilidade imediata de produtos que estão acabando ou sem estoque
- **Feed de Vendas Recentes** — Feed ao vivo das transações mais recentes

### 📈 Relatórios e Exportações
- **Filtros Avançados** — Filtre relatórios por intervalo de datas, método de pagamento, categoria ou produto específico
- **Resumo de Vendas** — Total de vendas, faturamento, descontos aplicados e ticket médio
- **Gráfico de Vendas Diárias** — Visualização das vendas dia a dia
- **Exportação para CSV** — Baixe os dados de vendas filtrados em formato de planilha
- **Exportação para PDF** — Gere relatórios em PDF profissionais via DomPDF

### 📦 Controle de Estoque
- **Catálogo de Produtos** — CRUD completo de produtos com nome, preço, estoque, imagem e categoria
- **Gerenciamento de Categorias** — Organize os produtos em categorias
- **Gerenciamento de Fornecedores** — Monitore e gerencie fornecedores de produtos
- **Controle de Estoque** — Dedução automática de estoque a cada venda realizada

### 👥 Controle de Usuários e Funcionários
- **Perfis de Funcionários** — Gerencie funcionários com contas de usuário vinculadas
- **Controle de Acesso Baseado em Cargos (RBAC)** — Cargos de Administrador e Funcionário com permissões granulares via Spatie Permission
- **Gerenciamento de Cargos e Permissões** — Crie, edite e atribua cargos e permissões diretamente pela interface

### 🔐 Autenticação e Segurança
- **Laravel Fortify** — Login, cadastro, redefinição de senha e verificação de e-mail
- **Autenticação de Dois Fatores (2FA)** — 2FA baseada em TOTP com códigos QR e códigos de recuperação
- **Gerenciamento de Perfil** — Atualize nome, e-mail e foto de perfil com recorte de imagem integrado
- **Gerenciamento de Senha** — Altere a senha nas configurações de segurança

### ⚙️ Configurações e Personalização
- **Configurações de Perfil** — Edite informações pessoais e avatar
- **Configurações de Segurança** — Gerencie senha e 2FA
- **Aparência** — Alternador de tema de modo claro/escuro
- **Suporte Multilíngue** — Integração completa de i18n (Português, Inglês, Espanhol) com seletor de idiomas persistente na barra de navegação

---

## 📋 Pré-requisitos

- PHP **8.4+**
- Composer **2+**
- Node.js **22+** e npm

---

## ⚡ Instalação

```bash
# 1. Clone e entre no projeto
git clone https://github.com/thiagohf23/pos-app.git
cd pos-app

# 2. Copie o template do ambiente (.env)
cp .env.example .env

# 3. Instale as dependências
composer install
npm install

# 4. Gere a chave da aplicação (APP_KEY)
php artisan key:generate

# 5. Crie o banco SQLite e execute as migrations + seeds
touch database/database.sqlite
php artisan migrate:fresh --seed

# 6. Inicie os servidores de desenvolvimento
composer run dev
```

O aplicativo rodará em [http://localhost:8000](http://localhost:8000).

> O comando `composer run dev` inicia o Laravel e o Vite juntos. Prefere terminais separados? Execute `php artisan serve` e `npm run dev`. Para gerar os assets de produção, utilize `npm run build`.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| **Backend** | Laravel 13, PHP 8.4 |
| **Frontend** | React 19, Inertia.js v3, TypeScript |
| **Estilização** | Tailwind CSS v4, shadcn/ui |
| **Banco de Dados** | SQLite |
| **Autenticação** | Laravel Fortify (2FA, Passkeys) |
| **Autorização** | Spatie Laravel-Permission |
| **Geração de PDF** | Barryvdh DomPDF |
| **Testes** | Pest PHP 4, Larastan |
| **Padronização de Código** | Laravel Pint, ESLint, Prettier |
| **Roteamento** | Laravel Wayfinder (funções de rotas tipadas) |

---

## 👥 Credenciais Padrão

Quando as seeds do banco de dados são executadas, os seguintes usuários são gerados:

| Cargo | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@example.com` | `password` |
| **Funcionário** | `employee@example.com` | `password` |

> 15 funcionários fictícios adicionais também são gerados para testes.

---

## 🧪 Testes e Qualidade de Código

```bash
php artisan test        # Executa a suite de testes Pest
composer run lint       # Formata o código com Laravel Pint
composer run ci:check   # Lint + formatação + tipos + testes
```

---

## 📄 Licença

O POS App é um software de código aberto licenciado sob a [licença MIT](LICENSE).

---

<p align="center">
  Feito com ❤️, muito ☕ e a ajuda de assistentes de IA.
</p>
