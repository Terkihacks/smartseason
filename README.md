# SmartSeason — Field Monitoring System

A simple web application for tracking crop progress across multiple fields during a growing
season. Admins (Coordinators) create fields and assign them to Field Agents, who update stage
and leave observations. Status is computed on read from the underlying data.

## Stack

- **Backend**: Node.js · Express · Prisma ORM · PostgreSQL
- **Frontend**: React · Vite · TailwindCSS · React Router
- **Auth**: JWT in an httpOnly cookie
- **Structure**: npm workspaces monorepo — [server/](server/) and [client/](client/)

---

## Prerequisites

- Node.js 18+
- PostgreSQL 13+ running locally (or a reachable instance)
- npm 9+

---

## Setup

### 1. Clone & install

```bash
git clone <this-repo>
cd ray
npm install          # installs both server and client via workspaces
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit [server/.env](server/.env) and set `DATABASE_URL` to point at your Postgres instance. The
default assumes `postgres:postgres@localhost:5432/smartseason`. Replace `JWT_SECRET` with a
long random string for any non-local use.

### 3. Configure the client (optional)

```bash
cp client/.env.example client/.env
```

The client defaults to `/api` via the Vite dev proxy, so this is only needed if you run the
client against a non-default backend URL.

### 4. Create the schema and seed demo data

```bash
cd server
npx prisma migrate dev --name init   # creates the DB schema
npm run db:seed                       # creates demo users + fields
```

### 5. Run

Two terminals, from the repo root:

```bash
npm run dev:server    # → http://localhost:4000
npm run dev:client    # → http://localhost:5173
```

Open <http://localhost:5173> and sign in with the demo credentials below.

---

## Demo credentials

| Role   | Email                         | Password   |
| ------ | ----------------------------- | ---------- |
| Admin  | admin@smartseason.dev         | admin123   |
| Agent  | agent@smartseason.dev         | agent123   |
| Agent  | brianna@smartseason.dev       | agent123   |

The seed script creates 5 fields covering every stage and status combination so the dashboard
is populated out of the box.

---

## Status logic

Field **status** is never stored — it is computed every time a field is read, from the stage
and planting date. This keeps the DB free of stale values and makes the rule easy to adjust.

```
COMPLETED  → stage === HARVESTED
AT_RISK    → stage in (PLANTED, GROWING) AND daysSincePlanting > 60
ACTIVE     → everything else
```

**Why 60 days?** Most staple crops (maize, beans, sorghum) should reach the READY stage within
about two months of planting. A field still `PLANTED` or `GROWING` beyond 60 days is behind
schedule and warrants attention. The threshold is a single constant in
[server/src/utils/status.js](server/src/utils/status.js) so it can be tuned per crop if needed
later.

`daysSincePlanting` is computed as `Math.floor((Date.now() - plantingDate) / 86_400_000)`.

### Stage lifecycle

```
PLANTED → GROWING → READY → HARVESTED
```

Stages can only move **forward**. Any stage change writes an entry to `FieldLog` with
`stageBefore` / `stageAfter` and an optional note, giving a full audit trail per field.

---

## Data model

```
User      { id, name, email, password (bcrypt), role: ADMIN|AGENT, createdAt }
Field     { id, name, cropType, plantingDate, stage, assignedAgentId, createdAt, updatedAt }
FieldLog  { id, fieldId, agentId, note?, stageBefore?, stageAfter?, createdAt }
```

See [server/prisma/schema.prisma](server/prisma/schema.prisma).

---

## API

All routes live under `/api`. Authentication is a JWT stored as an httpOnly cookie (set on
login/register, cleared on logout). Protected routes additionally accept an
`Authorization: Bearer <token>` header.

| Method | Route                         | Access | Purpose                                    |
| ------ | ----------------------------- | ------ | ------------------------------------------ |
| POST   | `/api/auth/register`          | Public | Create a user                              |
| POST   | `/api/auth/login`             | Public | Sign in; sets cookie + returns token       |
| POST   | `/api/auth/logout`            | Any    | Clear cookie                               |
| GET    | `/api/auth/me`                | Auth   | Current user                               |
| GET    | `/api/fields`                 | Auth   | Admin: all · Agent: only assigned          |
| POST   | `/api/fields`                 | Admin  | Create field                               |
| GET    | `/api/fields/:id`             | Auth   | Detail + full log (scope-checked)          |
| PATCH  | `/api/fields/:id/stage`       | Auth\* | Advance stage (forward only) + log         |
| POST   | `/api/fields/:id/notes`       | Auth\* | Add note to field                          |
| POST   | `/api/fields/:id/assign`      | Admin  | Assign / unassign agent                    |
| DELETE | `/api/fields/:id`             | Admin  | Delete a field (cascades logs)             |
| GET    | `/api/users?role=AGENT`       | Admin  | List agents                                |
| GET    | `/api/dashboard`              | Auth   | Role-aware summary stats                   |

\* Agents can only act on fields where `assignedAgentId === req.user.id`.

All errors use a consistent shape: `{ "error": "message" }` (with an optional `details` array
for Zod validation failures).

---

## Design decisions

- **Monorepo with npm workspaces** — one clone, one install, one README. Simpler to submit
  than two repos.
- **Prisma over hand-rolled SQL** — the spec says "clean structure" and "clear separation of
  concerns." Prisma gives that almost for free with type-safe queries and migration tooling.
- **JWT in httpOnly cookie** — avoids `localStorage` XSS exposure. A Bearer-token fallback
  exists so Postman / Insomnia flows still work.
- **Computed status, never stored** — the spec calls for a *computed* status. Storing it would
  introduce a cache-invalidation bug the moment anyone edited a field directly. A single
  `computeStatus` function in [server/src/utils/status.js](server/src/utils/status.js) is the
  only place the rule lives; the API serializes `status` into every field response.
- **Forward-only stage transitions** — stages are a lifecycle, not a state machine with loops.
  Disallowing backward moves makes the audit log meaningful without extra flags.
- **Stage changes are append-only via `FieldLog`** — every stage update writes a log entry in
  the same transaction, so there is no code path that mutates a stage without leaving a trace.
- **Zod validation at the route boundary** — keeps controllers free of ad-hoc input checks,
  and `errorHandler` converts any `ZodError` to a 400 with a structured `details` array.
- **Role-aware dashboard endpoint** — one `/api/dashboard` handler serves both admin and agent
  views by scoping the query on `req.user.role`. The client doesn't need to know the business
  rule; it just renders what the server returns.
- **Custom hooks (`useFields`, `useField`, `useDashboard`)** — isolates data fetching from
  rendering so pages stay declarative. `AuthContext` avoids prop-drilling the user object.
- **Tailwind over a component library** — fastest way to a clean, consistent UI in a short
  build, with no runtime dependency surface.

---

## Assumptions

- A field has **at most one** assigned agent at a time. Re-assigning transfers ownership.
- Admins can view and add notes to any field. Only agents *assigned* to a field can advance
  its stage — this mirrors the real-world workflow where the agent on the ground owns the
  update, though admins can always intervene via the assign/unassign flow.
- A stage change may include a note; the note is attached to the same `FieldLog` entry rather
  than a separate one, so each log row reads as a single event.
- `daysSincePlanting` uses the server's clock. For a real deployment the client should send
  updates with an explicit timestamp or the server should normalize to UTC midnight, but for
  a 4-day assessment the current approach is accurate to within a day.
- The 60-day AT_RISK threshold is a single global constant. In production this would likely
  be per-crop (`cropType → expectedDaysToReady` table), but that is out of scope here.
- Self-registration is allowed by the API for convenience during evaluation. In production
  the `/api/auth/register` route would be admin-only or behind an invite flow.

---

## Project layout

```
.
├── server/
│   ├── prisma/schema.prisma     ← data model
│   ├── prisma/seed.js           ← demo data
│   └── src/
│       ├── app.js               ← express setup
│       ├── index.js             ← entry
│       ├── config/db.js         ← prisma client
│       ├── middleware/          ← auth + errors
│       ├── routes/              ← thin route files
│       ├── controllers/         ← validation + DB ops
│       └── utils/               ← jwt, password, status, asyncHandler
└── client/
    └── src/
        ├── App.jsx              ← router
        ├── api/axios.js         ← cookie-enabled client
        ├── context/AuthContext  ← login/logout/user
        ├── hooks/               ← useFields, useField, useDashboard
        ├── components/          ← StatusBadge, StageBadge, FieldCard, …
        └── pages/               ← Login, Dashboard, Fields, FieldDetail, NewField, Users
```

---

## Scripts

```bash
# from repo root
npm run dev:server        # start Express in watch mode
npm run dev:client        # start Vite dev server

# from server/
npm run db:migrate        # prisma migrate dev --name init
npm run db:seed           # populate demo data
npm run db:reset          # drop & recreate + re-seed
```
