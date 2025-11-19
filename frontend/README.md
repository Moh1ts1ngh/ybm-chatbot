## Overview

Next.js App Router frontend for the YBM Chatbot platform. It provides Google SSO via NextAuth, a protected dashboard, and server-side helpers to call the Node/Express backend with the correct tenant headers.

## Prerequisites

- Node 18+ (or Bun 1.1+)
- Backend API running locally (`http://localhost:3000` by default)
- Google OAuth client credentials

## Environment

Copy `ENV.sample` to `.env.local` and fill in the values:

```
cp ENV.sample .env.local
```

Key variables:

- `NEXTAUTH_URL` – usually `http://localhost:3001` to avoid clashing with the backend.
- `NEXTAUTH_SECRET` – random string used to sign JWT sessions.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – OAuth credentials from Google Cloud Console.
- `BACKEND_API_URL` / `NEXT_PUBLIC_BACKEND_URL` – base URL for the Express API (ex: `http://localhost:3000/api/v1`).
- `AUTH_DEFAULT_TENANT_ID` – optional tenant id to scope API calls until tenant selection UI is built.

## Scripts

```bash
# Start dev server on a non-conflicting port
PORT=3001 bun run dev

# Type check & lint
bun run lint
bun run build
```

Open `http://localhost:3001` to access the marketing page, `/auth/sign-in` for the auth portal, and `/dashboard` for the protected area.

## Auth Flow

- Uses NextAuth (Auth.js) with the Google provider and JWT sessions.
- `middleware.ts` protects `/dashboard` and `/settings`.
- Custom session typing exposes `user.id`, `user.tenantId`, and `user.provider`.
- `syncTenantMembership` is the integration point for mapping Google identities to backend tenants—extend it once dedicated onboarding endpoints are available.

## Backend Integration

`fetchDocumentsForTenant` (in `src/lib/backend/documents.ts`) demonstrates how to call the Express API with tenant-scoped headers. Wrap additional backend endpoints the same way to guarantee every request includes `x-tenant-id`.
