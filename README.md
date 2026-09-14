# Escalation Tracking Dashboard

A full-stack Next.js application for tracking and managing escalations, master data (Customers, Transporters, KAMs), and analytics with PostgreSQL and Drizzle ORM.

---

## Features

- **Dashboard**: Real-time escalation overview with filtering by date, status, customer, and transporter.
- **Escalation Logging**: Create and edit escalations with delivery tracking, KAM assignments, and issue logs.
- **Admin Panel**: Master data management for Customers, Transporters, and KAM entries.
- **PostgreSQL & Drizzle ORM**: Type-safe relational database queries and schema management.

---

## Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
Push schema directly to PostgreSQL:
```bash
npm run db:push
```

Open Drizzle Studio (Database GUI):
```bash
npm run db:studio
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment to Render (Free Web Service + Free PostgreSQL)

This repository includes a [`render.yaml`](./render.yaml) Blueprint that automatically provisions:
1. A free managed PostgreSQL database.
2. The Next.js web application linked directly to the database.
3. Automated database schema sync via `drizzle-kit push` on every deployment.

### Steps to Deploy:
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `MVIKAS-CODE/Escalation-Tracking-Dashboard`.
4. Click **Apply**.
5. Render will automatically provision the PostgreSQL database and build & deploy the Next.js website.
