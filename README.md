# EventPass

Full-stack event registration system built with Next.js (App Router), Prisma, Tailwind, and zod.

- Registration (name, email, phone, password) with file uploads
- Returning user sign-in via reference code + password
- Admin dashboard with search & per-attendee detail
- PDF name-tag generation

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma ORM with SQLite for local dev, PostgreSQL-ready for production
- Tailwind CSS v4
- bcryptjs for password hashing
- zod for validation
- @react-pdf/renderer for badge PDFs
- Vitest for tests

## Quick start

```bash
npm install
cp .env.example .env       # adjust as needed
npx prisma migrate dev     # creates prisma/dev.db
npm run dev
```

App runs at http://localhost:3000.

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm start` | Run the production build |
| `npm test` | Run the Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint the project |

## Environment variables

See `.env.example` for the canonical list.

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite path for local dev (`file:./dev.db`) or Postgres URL for prod |
| `ADMIN_USERNAME` | Admin login username (used by `/admin/login`) |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | HMAC key for signing session cookies (≥ 32 random chars recommended) |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Project structure

```
app/
  api/                       # Route handlers (POST /api/register, etc.)
  admin/                     # Admin pages (/admin/login, /admin/registrations)
  register/                  # Public registration flow
  lookup/                    # Returning-user sign-in
  submission/[referenceCode] # Returning-user edit screen
lib/                         # db, validation, session, uploads, badge PDF
prisma/                      # schema + migrations
public/uploads/              # files saved during dev (one folder per registration)
tests/                       # Vitest tests
```

## Routes

| Page | Purpose |
| --- | --- |
| `/` | Landing page |
| `/register` | Public registration form |
| `/register/success/[referenceCode]` | Confirmation screen |
| `/lookup` | Returning-user sign-in |
| `/submission/[referenceCode]` | View / edit own registration |
| `/admin/login` | Admin sign-in |
| `/admin/registrations` | Admin list with search |
| `/admin/registrations/[id]` | Admin detail + PDF badge |

| API | Method |
| --- | --- |
| `/api/register` | POST (multipart, includes files) |
| `/api/lookup` | POST |
| `/api/submission/[referenceCode]` | GET, PUT |
| `/api/submission/[referenceCode]/documents` | POST (multipart) |
| `/api/documents/[id]` | DELETE |
| `/api/admin/login` | POST |
| `/api/admin/logout` | POST |
| `/api/admin/registrations` | GET (supports `?q=` search) |
| `/api/admin/registrations/[id]` | GET |
| `/api/admin/registrations/[id]/badge` | GET (returns PDF) |

## Deploying to Vercel

1. Provision a Postgres database (Vercel Postgres, Neon, Supabase, etc.) and copy its connection URL.
2. Edit `prisma/schema.prisma` and change the provider:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

   then run `npx prisma migrate dev --name init_postgres` against the new database to generate fresh migrations.

3. In the Vercel project settings, set the env vars:

   - `DATABASE_URL` — the Postgres URL
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`

4. Add a build hook so the schema is migrated before each deploy. Either:

   - Set the **Build Command** to `npx prisma migrate deploy && npm run build`, **or**
   - Run `npx prisma migrate deploy` manually after each schema change.

   The `postinstall` script already regenerates the Prisma client.

5. Deploy. The Next.js routes are dynamic by default (they access the DB / cookies).

> **Note on file uploads:** uploaded files are written to `public/uploads/`. Vercel's serverless filesystem is read-only, so for production you should swap `lib/uploads.ts` to use an object store (S3, Vercel Blob, etc.). The current implementation is intended for local development.

## Notes & decisions

- **Reference codes** are `EP-XXXXXXXX` over a 32-char unambiguous alphabet (no `0/O/1/I/L`).
- **Sessions** are HMAC-signed cookies (`eventpass_admin`, `eventpass_user`) signed with `SESSION_SECRET`. They expire after 8 hours.
- **Admin credentials** are read from env at request time — they are not stored in the DB.
- **Tests** cover reference-code format & uniqueness, validation, password hashing, returning-user authentication, admin env-credentials, and PDF badge content type.
