## CoffeeTek Monorepo

CoffeeTek is a full‑stack monorepo:
- **Backend**: NestJS 11, Prisma, PostgreSQL, Redis, RabbitMQ, Socket.IO, Resend (email), Backblaze S3‑compatible storage, VNPAY, Google OAuth.
- **Frontend**: Next.js 14 (App Router), Ant Design, TanStack Query, Zustand, Socket.IO client.

## Repository layout

- `Backend/` — NestJS API (global prefix `/api`)
- `fe-coffetek-new/` — Next.js web app
- `docker-compose.yml` — RabbitMQ service (5672, 15672)

## Requirements

- Node.js 18+ (Node 22 used in Dockerfile)
- pnpm 9+ (`corepack enable` recommended)
- PostgreSQL (DATABASE_URL)
- Redis (REDIS_URL)
- RabbitMQ (via `docker-compose up -d rabbitmq`)

## Quick start (local)

1) Install dependencies

```bash
cd Backend && pnpm install
cd ../fe-coffetek-new && pnpm install
```

2) Start RabbitMQ

```bash
cd /Users/huynhtandat/Desktop/developer/CoffeeTek
docker compose up -d rabbitmq
```

3) Configure environment files

- Backend: `Backend/.env` (example)

```bash
# Server
PORT=3001                 # Recommended for dev (frontend runs on 3000)
BODY_SIZE_LIMIT=50mb

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public

# Caches/Queues
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_RETURN_PAYMENT=http://localhost:3001/api/order/vnpay-return

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your_google_client_id

# Storage (Backblaze/S3‑compatible)
B2_REGION=auto
B2_ENDPOINT=https://YOUR_ENDPOINT # e.g. https://s3.us-west-002.backblazeb2.com
B2_KEY_ID=your_key_id
B2_APP_KEY=your_app_key
B2_DEFAULT_BUCKET=public_bucket_name
B2_PRIVATE_BUCKET=private_bucket_name

# Payments (VNPAY sandbox)
TMN_CODE=your_tmn_code
SECURE_SECRET=your_secure_secret

# Seed owner (optional)
OWNER_EMAIL=owner@example.com
OWNER_PHONE=0999999999
OWNER_PASSWORD=123456
OWNER_FISRTNAME=Owner
OWNER_LASTNAME=User
```

- Frontend: `fe-coffetek-new/.env.local` (example)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_IMAGE_BASE_URL=https://your-cdn-or-bucket-domain
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
```

Notes:
- Backend listens on `PORT` (default 3000). Set `PORT=3001` to avoid clashing with Next.js dev (3000).
- API global prefix is `/api` (e.g. `http://localhost:3001/api`).

4) Prepare database (Prisma)

```bash
cd Backend
pnpm prisma generate
pnpm prisma migrate dev
pnpm run seed
```

5) Run apps

```bash
# Backend
cd Backend
PORT=3001 pnpm run start:dev

# Frontend (in another terminal)
cd fe-coffetek-new
pnpm dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001 (WebSocket/Socket.IO, REST under `/api`)
- RabbitMQ UI: http://localhost:15672 (guest/guest)

## Scripts

### Backend (`Backend/package.json`)
- `start:dev` — Nest watch mode
- `start` — start compiled app
- `build` — build to `dist/`
- `test`, `test:e2e`, `test:cov` — Jest tests
- `seed` — run `src/prisma/seed.ts`
- `lint`, `format`

### Frontend (`fe-coffetek-new/package.json`)
- `dev` — Next.js dev server
- `build` — Next.js build
- `start` — Next.js production server
- `lint`, `type-check`

## Docker

RabbitMQ is provided via `docker-compose.yml`:

```bash
docker compose up -d rabbitmq
```

Build and run the backend container (optional):

```bash
docker build -t coffeetek-backend ./Backend
docker run --env-file ./Backend/.env -p 3001:3001 coffeetek-backend
```

The backend image will:
- run Prisma migrations (`prisma migrate deploy`)
- run seed (`prisma db seed`)
- start the app (`node dist/main.js`)

Ensure `DATABASE_URL`, `RABBITMQ_URL`, and related env vars are present in `.env`.

## Configuration reference (env)

Backend uses:
- `PORT`, `BODY_SIZE_LIMIT`
- `DATABASE_URL` (PostgreSQL)
- `REDIS_URL`
- `RABBITMQ_URL`
- `FRONTEND_URL`, `FRONTEND_URL_RETURN_PAYMENT`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `GOOGLE_WEB_CLIENT_ID`
- `B2_REGION`, `B2_ENDPOINT`, `B2_KEY_ID`, `B2_APP_KEY`, `B2_DEFAULT_BUCKET`, `B2_PRIVATE_BUCKET`
- `TMN_CODE`, `SECURE_SECRET`
- `OWNER_EMAIL`, `OWNER_PHONE`, `OWNER_PASSWORD`, `OWNER_FISRTNAME`, `OWNER_LASTNAME` (seed)

Frontend uses:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_IMAGE_BASE_URL`
- `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## Notes

- API base path is `/api` (see `Backend/src/main.ts`).
- Image domains are configured in `fe-coffetek-new/next.config.ts` (`images.domains`); adjust to your bucket/CDN domain.
- Socket.IO connects to `NEXT_PUBLIC_BACKEND_URL`.


