# RestoHub Frontend

RestoHub Frontend is the React dashboard for the RestoHub restaurant-ordering API. It gives restaurant teams a clean workspace to manage restaurants, staff accounts, menus, tables, orders, and kitchen tickets.

The app is role-aware. After login, the backend returns the current user, then the frontend shows only the pages and actions that make sense for that role.

## Main Roles

- Platform admin: manages restaurants, owners, staff, menus, tables, and orders across the whole system.
- Owner: manages their own restaurant staff, menu, tables, and orders.
- Waiter: creates and manages orders for their assigned restaurant.
- Chef: views kitchen orders and updates preparation status.

The frontend hides unavailable actions, but the backend is still the real source of permission checks.

## Project Overview

RestoHub is built for restaurants that need a simple internal system for daily operations. Instead of using separate tools for tables, staff, menus, and kitchen orders, the app keeps those workflows in one dashboard.

A platform admin can manage the whole system. They can create restaurant owners, create restaurants, and supervise the data across all restaurants. This role is useful for the company or SaaS owner who controls the platform.

A restaurant owner manages only their own restaurant. They can create waiter and chef accounts, manage menu items, organize tables, and follow orders. This keeps each restaurant isolated from the others while still using the same backend.

Waiters use the app during service. They can select a table, add menu items, send an order, and track whether it is pending, preparing, ready, or served.

Chefs use the kitchen screen to see active orders and update the preparation flow. The goal is to make the kitchen view focused, fast, and easy to scan during busy hours.

The frontend is mainly responsible for giving each role a clean workflow. The backend stores the data, checks permissions, handles authentication, and protects the real business rules.

## Features

- JWT login and automatic token refresh.
- Role-based routing and navigation.
- Dashboard with operational summaries.
- Staff management with create, update, delete, and password reset.
- User self-service password change from Settings.
- Restaurant management for platform admins.
- Menu and menu item management with image support.
- Table management.
- Order creation with nested order items.
- Kitchen display for active food preparation.
- Search, filters, pagination, loading states, empty states, and toast messages.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- React Hook Form
- Lucide React icons

## Run Locally

Install dependencies:

```powershell
npm install
```

Create a local environment file from the example:

```powershell
Copy-Item .env.example .env
```

Set the backend API URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

For the deployed backend, use:

```env
VITE_API_BASE_URL=https://restohubapi.duckdns.org/api
```

Start the dev server:

```powershell
npm run dev
```

If Windows has trouble because the project path contains `&`, run Vite directly:

```powershell
node node_modules/vite/bin/vite.js
```

## Backend Setup Needed

The backend must allow the frontend origin in CORS.

For local frontend development, the backend production environment needs something like:

```env
CORS_ALLOWED_ORIGINS=https://restohubapi.duckdns.org,http://localhost:5173,http://127.0.0.1:5173
```

`ALLOWED_HOSTS` is for the backend domain itself. CORS is for browser-based frontend requests.

## Important Scripts

```powershell
npm run dev
```

Starts the Vite development server.

```powershell
npm run build
```

Builds the production files into `dist/`.

```powershell
npm run preview
```

Serves the production build locally for a quick check.

```powershell
npm run lint
```

Runs Oxlint. If the path with `&` breaks the npm wrapper, run Oxlint directly from `node_modules`.

## Project Structure

```txt
src/
  components/layout/   App shell, sidebar, header, and navigation
  features/            Business pages grouped by domain
  lib/                 Axios client, auth storage, query client
  router/              Lazy routes and auth/role guards
  shared/              Reusable UI components, hooks, and utilities
  styles/              Tailwind entry point, theme, and compatibility styles
```

## API Flow

Login sends credentials to:

```http
POST /token/
```

The returned access and refresh tokens are stored locally by `authStorage`.

After login, the app loads the current user from:

```http
GET /me/
```

Most authenticated API calls go through `apiClient`, which automatically attaches:

```http
Authorization: Bearer <access_token>
```

If the access token expires, the client attempts:

```http
POST /token/refresh/
```

If refresh fails, the user is logged out.

## Password Flows

Changing your own password:

```http
PUT /change-password/
```

Used from the Settings page key icon.

Resetting another user's password:

```http
POST /users/{id}/reset-password/
```

Used from the Staff page key icon. Platform admins can reset any user. Owners can reset only waiter and chef accounts in their own restaurant.

## Production Deployment

The frontend is deployed on Vercel:

```txt
https://resturantordering-wheat.vercel.app/login
```

Vercel builds the React app into static files from the `dist/` directory. The backend remains deployed separately at:

```txt
https://restohubapi.duckdns.org/api
```

In Vercel, set this environment variable:

```env
VITE_API_BASE_URL=https://restohubapi.duckdns.org/api
```

The project uses:

```txt
Build command: npm run build
Output directory: dist
Framework preset: Vite
```

The backend must also allow the Vercel frontend URL in `CORS_ALLOWED_ORIGINS`, otherwise browser requests from Vercel will be blocked.

## Notes

- Do not commit real `.env` files.
- Do not put backend secrets in the frontend.
- Frontend environment variables are public after build, so only use them for public configuration like the API base URL.
- Backend permissions must always protect the real data. Frontend role checks are only for user experience.
