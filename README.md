# School Huye — CMS Website

A full-stack school website with a public-facing site and an admin content management system.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend  | Node.js, Express                    |
| Database | PostgreSQL                          |
| ORM      | Prisma 7 (with `@prisma/adapter-pg`) |

## Features

**Public website**
- Home page with hero, mission/vision, latest news, and events
- About, News, Events, Staff, Gallery, Contact pages
- **Admissions protocol** — 6-step process, requirements, fees, and contact info
- **Online applications** — apply with payment slip upload, document upload, and status tracking with admin comments
- Custom CMS pages with navigation support

**Admin CMS** (`/admin`)
- JWT authentication
- Manage site settings (school name, contact, hero, about)
- CRUD for pages, news posts, events, staff, and gallery images

## Project Structure

```
School Huye/
├── backend/          # Express API + Prisma
│   ├── prisma/       # Schema, migrations, seed
│   └── src/          # Routes, middleware
└── frontend/         # React app
    └── src/          # Pages, components, admin UI
```

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a remote instance)

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE school_huye;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database URL and a secure `JWT_SECRET`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_huye?schema=public"
JWT_SECRET="your-long-random-secret"
PORT=5001
CLIENT_URL="http://localhost:5173"
```

Then run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

API runs at **http://localhost:5001** (port 5000 is used by macOS AirPlay on many Macs)

### 3. Frontend

```bash
cd frontend
npm run dev
```

Site runs at **http://localhost:5173**

## Default Admin Login

After seeding:

- **Email:** `admin@schoolhuye.rw`
- **Password:** `admin123`

Change this password in production.

## API Endpoints

| Method | Endpoint              | Auth   | Description        |
|--------|-----------------------|--------|--------------------|
| GET    | `/api/health`         | No     | Health check       |
| POST   | `/api/auth/login`     | No     | Admin login        |
| GET    | `/api/settings`       | No     | Site settings      |
| PUT    | `/api/settings`       | Yes    | Update settings    |
| GET    | `/api/pages`          | No     | Published pages    |
| GET    | `/api/posts`          | No     | Published posts    |
| GET    | `/api/events`         | No     | Published events   |
| GET    | `/api/staff`          | No     | Published staff    |
| GET    | `/api/gallery`        | No     | Published images   |
| GET    | `/api/admissions`     | No     | Full admission protocol |
| PUT    | `/api/admissions/protocol` | Yes | Update protocol overview |
| POST   | `/api/applications`     | No     | Submit online application |
| POST   | `/api/applications/track` | No  | Track by reference + phone |
| GET    | `/api/applications`     | Yes    | List applications (admin) |
| POST   | `/api/contact`          | No     | Submit contact form (sends confirmation email) |
| POST   | `/api/contact/:id/reply` | Yes | Email reply to sender from admin |
| GET    | `/api/contact`          | Yes    | List contact messages (admin) |
| POST   | `/api/upload`         | Yes    | Upload image file  |

Add `?admin=true` to list endpoints when authenticated to include drafts.

## Production Notes

- Set strong `JWT_SECRET` and change default admin credentials
- Configure SMTP in `backend/.env` for contact form emails (see `.env.example`)
- Use a production PostgreSQL instance
- Build frontend: `cd frontend && npm run build`
- Serve uploads securely; consider cloud storage (S3, Cloudinary) for images
- Enable HTTPS and configure `CLIENT_URL` for your domain
# ELENA-GUERRA-BUTARE
