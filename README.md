# Owambe Planner

A mobile-first SaaS platform for planning culturally significant events — weddings, funerals, naming ceremonies, and more — built for the Nigerian and West African diaspora.

## Features

- **Event Creation & Management** — Create, organize, and track multiple events with detailed timelines
- **Vendor Discovery** — Browse and book vendors with profiles, reviews, and service listings
- **Budget Tracking** — Monitor expenses, set budgets, and track spending across categories
- **Guest Management** — Manage guest lists, send invitations, track RSVPs, and bulk import guests
- **Photo Gallery** — Upload and organize event photos
- **Timeline Planning** — Build detailed day-of timelines for seamless coordination
- **Messaging** — In-app communication between planners and vendors
- **RSVP Pages** — Public-facing RSVP pages for guests
- **Calendar Export** — Export event schedules to external calendars
- **PWA Support** — Installable as a progressive web app on mobile devices

## User Roles

- **Event Planners** — Create events, manage budgets, coordinate vendors, and handle guest lists
- **Vendors** — Manage profiles, services, bookings, analytics, and reviews
- **Admin** — Dashboard for overseeing bookings, events, and platform settings

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router (client-side routing)
- IndexedDB for local data persistence
- Recharts for analytics/visualizations
- PWA with offline support

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Deployment

The project is configured for automated deployment to GitHub Pages via GitHub Actions, served from the `/owambe-planner/` subdirectory.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks (auth, image upload, etc.)
├── lib/             # Utilities (auth, storage, calendar export, IndexedDB)
├── pages/
│   ├── planner/     # Event planner dashboard pages
│   ├── vendor/      # Vendor dashboard pages
│   ├── admin/       # Admin panel pages
│   └── public/      # Public-facing pages (RSVP, install)
└── types/           # TypeScript type definitions
```
