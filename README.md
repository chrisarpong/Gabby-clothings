# Gabby Newluk — Haute Couture & Bespoke Tailoring E-Commerce Platform

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-1.39-EE342F.svg?style=flat&logo=convex)](https://convex.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg?style=flat&logo=clerk)](https://clerk.com/)
[![Paystack](https://img.shields.io/badge/Payments-Paystack-0BA4DB.svg?style=flat)](https://paystack.com/)

**Gabby Newluk** is an enterprise-grade African luxury fashion, bespoke tailoring, and multi-channel e-commerce platform. Built with React 19, Tailwind CSS v4, and Convex cloud-native backend, the platform bridges digital retail with traditional bespoke craftsmanship.

---

## 🌟 Key Platform Features

### 🛍️ Client Experience & E-Commerce
* **Haute Couture Storefront**: Curated catalog of ready-to-wear collections (Agbadas, Kaftans, Suiting, and Accessories) with fluid Framer Motion micro-interactions.
* **Bespoke "Custom Fit" Engine**: Intelligent measurement profiles stored directly on user accounts with support for custom body dimensions (chest, waist, sleeve, inseam, agbada span).
* **Interactive 3D Measurement Masterclass**: WebGL/Three.js 3D mannequin model viewer (`@google/model-viewer`) allowing clients to rotate, inspect, and follow step-by-step measurement tutorials.
* **Multi-Currency Dynamic Pricing**: Live exchange rate engine supporting **GHS (GH₵)**, **USD ($)**, **EUR (€)**, and **GBP (£)** with automated 6-hour cron rate refreshes and admin manual rate overrides.
* **Cart & Inventory Reservation**: Zustand-persisted cart synchronized with real-time Convex database state and automated soft-inventory reservation to prevent overselling.
* **Paystack Payment Gateway**: Native card, mobile money (MTN, Telecel, AT), and bank transfer checkout in Ghanaian Cedis.
* **Bespoke Fitting Booking**: Automated appointment scheduling with Google Calendar synchronization and automated Hangouts Meet virtual consultation links.
* **Client Archive & Wishlist**: Save favorite luxury pieces to a private archive.
* **Verified Client Reviews**: Transparent rating and review system with admin approval moderation.

### 🛡️ Enterprise Staff Architecture & Portals

The platform implements an independent **Dual-Authentication Architecture**:
1. **Public Clients**: Authenticate seamlessly via Clerk (Google, Apple, Email OTP).
2. **Internal Staff**: Authenticate through an isolated, zero-trust cryptographic system completely separated from Clerk:
   - Salted PBKDF2 with SHA-256 password hashing.
   - Time-based One-Time Password (TOTP) RFC 6238 Two-Factor Authentication (compatible with Google Authenticator).
   - Cryptographically hashed session tokens stored in `sessionStorage` (preventing cross-tab persistence).
   - Role-Based Access Control (RBAC): **CEO**, **Admin**, **Designer**, **Sales**.
   - Cross-tab synchronized idle session termination via `BroadcastChannel` with role-tiered timeouts (Sales: 5 min, Admin/Designer: 15 min, CEO: 30 min).

#### Specialized Staff Portals:
* **Admin Headquarters (`/admin`)**:
  - Live revenue analytics and sales distribution charts (Recharts).
  - Complete order lifecycle management (fabric sourcing, cutting phase, fittings, dispatch).
  - Product catalog and inventory management with multi-image storage.
  - Client relationship directory with measurement history.
  - Headless CMS for page content, hero slides, announcements, and FAQs.
  - Promotional discount engine and newsletter broadcast manager.
  - Audit logging tracking staff IPs, browser devices, and timestamps.
* **Designer Studio (`/designer`)**:
  - Dedicated workspace for master tailors and fashion designers.
  - Active garment production queue, client measurement lookup, and appointment tracking.
* **Sales Point-of-Sale (`/sales`)**:
  - In-store retail POS terminal with offline-resilient local cart.
  - Cash, mobile money, and manual payment reconciliation.
  - Instant receipt generation and daily sales metrics.

---

## 🏗️ Technical Architecture & Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│   React 19  │  Vite  │  Tailwind CSS v4  │  Framer Motion   │
│   Zustand   │  Clerk Auth (Public)  │  Three.js / 3D Viewer │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     Convex WebSocket (RPC)             HTTPS / Webhooks
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                   Convex Cloud Backend                      │
│   Schema & Real-Time DB  │  Cron Scheduler  │  HTTP Router  │
│   Staff Crypto (PBKDF2)  │  Storage Engine  │  Rate Limits  │
└──────────────┬──────────────┬───────────────┬───────────────┘
               │              │               │
       Resend (Email)   Arkesel (SMS)   Paystack (Payments)
```

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19.0, TypeScript 5.8 |
| **Bundler & Tooling** | Vite 6.2, `@tailwindcss/vite` |
| **Styling** | Tailwind CSS v4, `@tailwindcss/typography` |
| **Animations** | Framer Motion 12.4 |
| **3D Rendering** | `@google/model-viewer` 4.3, Three.js |
| **Data & Backend** | Convex 1.39 (Real-time reactive database & serverless functions) |
| **Customer Auth** | `@clerk/clerk-react` 5.61 |
| **Staff Auth & 2FA** | Node `crypto` (PBKDF2/SHA-256), `otplib` 12.0, `qrcode.react` |
| **Payment Gateway** | Paystack (`react-paystack` 6.0 + HMAC-SHA512 Webhook Router) |
| **Transactional Email** | Resend SDK 6.12 |
| **SMS Delivery** | Arkesel v2 API |
| **Calendar Sync** | Google Calendar API v3 (`googleapis` 172.0) |
| **State Management** | Zustand 5.0 with persistent local storage |

---

## 📁 Project Directory Structure

```
gabby/
├── convex/                       # Backend Cloud Functions & Database
│   ├── schema.ts                 # Full database schema & indexes
│   ├── auth.config.ts            # Clerk JWT validation config
│   ├── staffAuth.ts              # Staff session, RBAC, and query resolvers
│   ├── staffAuthNode.ts          # Node-runtime actions (PBKDF2 hashing, TOTP setup)
│   ├── staffPermissions.ts       # Granular role-to-permission mapping
│   ├── products.ts               # Product catalog & stock mutations
│   ├── orders.ts                 # Order checkout, POS, and status pipelines
│   ├── appointments.ts           # Fitting bookings, slots & calendar dispatch
│   ├── payments.ts               # Payment verification & manual cashier logging
│   ├── crons.ts                  # Background jobs (currency, stock, reminders)
│   ├── http.ts                   # HTTP router (storage files, Paystack webhook)
│   ├── email.ts                  # Resend transactional emails & broadcast actions
│   ├── sms.ts                    # Arkesel SMS notifications
│   ├── analytics.ts              # Financial and executive KPI aggregations
│   └── lib/
│       └── staffCrypto.ts        # Cryptographic primitives (constant-time compare)
├── public/                       # Static public assets
│   ├── assets/                   # Product and collection photography
│   └── images/                   # Measurement guide illustrations
├── src/                          # Frontend Application Source
│   ├── components/
│   │   ├── admin/                # 19 Admin dashboard tabs, modals & drawers
│   │   ├── designer/             # Designer studio task & appointment components
│   │   ├── sales/                # Retail POS interface & sales metrics
│   │   ├── auth/                 # StaffRoute guards & IdleLogout monitors
│   │   ├── Header.tsx            # Navigation header & drawer menu
│   │   └── Footer.tsx            # Footer & brand editorial links
│   ├── pages/                    # 28 Application route pages
│   ├── hooks/                    # Custom React hooks (useStaffAuth, useConvex)
│   ├── store/                    # Zustand stores (cartStore, currencyStore)
│   ├── utils/                    # Formatting (currency conversion, device info)
│   ├── layouts/PublicLayout.tsx  # Header/Footer wrapper with announcement banner
│   ├── App.tsx                   # Central router & synchronization hooks
│   └── main.tsx                  # React DOM root & Clerk/Convex providers
├── .env.example                  # Environment variable reference
├── package.json                  # Dependencies and execution scripts
├── vite.config.ts                # Vite build and alias configuration
└── vercel.json                   # SPA rewrite rules & Content Security Policies
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory for the frontend and configure backend secrets in Convex.

### 1. Frontend Environment Variables (`.env.local`)
```ini
# Clerk Authentication (Public Customer Storefront)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Paystack Payment Gateway (Public Key)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...

# Convex Cloud Deployment
CONVEX_DEPLOYMENT=dev:...
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
VITE_CONVEX_SITE_URL=https://<your-deployment>.convex.site
```

### 2. Convex Backend Environment Variables
Set these using the Convex CLI (`npx convex env set <KEY> <VALUE>`):

```bash
# Paystack Secret Key (Required for payment verification & webhook HMAC verification)
npx convex env set PAYSTACK_SECRET_KEY sk_test_...

# Resend API (Required for transactional order confirmations & newsletters)
npx convex env set RESEND_API_KEY re_...
npx convex env set RESEND_FROM_EMAIL "Gabby Newluk <orders@gabbynewluk.com>"

# Arkesel SMS (Required for client SMS notifications in Ghana)
npx convex env set ARKESEL_API_KEY ...

# Google Calendar Integration (Optional - for automated consultation invites)
npx convex env set GOOGLE_CALENDAR_CREDENTIALS '{"client_email": "...", "private_key": "..."}'
npx convex env set GOOGLE_CALENDAR_ID "primary"
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/christiansarpong/gabby.git
cd gabby

# Install dependencies
npm install

# Start the Convex development backend
npx convex dev

# In a separate terminal, launch the Vite dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts the local Vite development server |
| `npm run build` | `vite build` | Compiles the production bundle into `/dist` |
| `npm run preview` | `vite preview` | Previews the production build locally |
| `npm run lint` | `tsc --noEmit` | Runs full TypeScript static type checking |
| `npm run clean` | `rm -rf dist server.js` | Cleans build output directories |

---

## 🔐 Staff Portal Access & Credentials

Staff access is segregated from public customer sign-ins:
* **Login URL**: `/staff/login`
* **Portals**:
  - `/admin/*` — CEO and Admin roles
  - `/designer/*` — Designers, CEO, and Admin
  - `/sales/*` — Sales Personnel, CEO, and Admin

> **First-time Staff Setup**: Initial staff accounts can be created by a CEO or Admin from **Admin > Team & Roles**, which generates an OTP password and guides the user through mandatory password rotation and TOTP 2FA enrollment (`/staff/setup-2fa`).

---

## 📄 License & Intellectual Property

Copyright © 2026 Gabby Newluk Clothing Atelier. All rights reserved.  
Unauthorized copying, modification, or distribution of this software and brand imagery is strictly prohibited.
