# Travel & Tour Company Website — Backend

Express + TypeScript + PostgreSQL (via Prisma) API for the travel/tour
website described in the project SRS.

## Stack

- **Node.js / Express** — HTTP server and routing
- **TypeScript** — compiled to `dist/` for production, run directly via
  `tsx` in dev (no separate build step needed while developing)
- **PostgreSQL** — relational database
- **Prisma** — ORM: schema, migrations, type-safe query client
- **JWT + bcryptjs** — admin authentication (added in Phase 4)
- **express-validator** — request validation
- **helmet, cors, express-rate-limit** — baseline security

## Project structure

```
prisma/
  schema.prisma        # database schema — source of truth for all tables
tsconfig.json           # TypeScript compiler config
src/
  app.ts                # Express app: middleware + route mounting
  server.ts              # entry point — starts the HTTP server
  config/
    prisma.ts            # shared PrismaClient instance
  routes/
    index.ts             # mounts every feature's routes under /api
    destination.routes.ts
  controllers/
    destination.controller.ts
    tour.controller.ts
  validators/
    destination.validator.ts
    tour.validator.ts
  middleware/
    errorHandler.ts       # central error formatting (incl. Prisma errors)
    notFound.ts            # 404 fallback
    validate.ts             # runs express-validator rule results
  utils/
    ApiError.ts              # throw new ApiError(statusCode, message)
    asyncHandler.ts            # wraps async route handlers
    slugify.ts                  # "Rwanda Safari" -> "rwanda-safari"
```

Every other entity (Tour, Inquiry, BookingRequest, FAQ, Testimonial,
BlogPost) follows the same four-file pattern as Destination:
`validator` → `controller` → `routes` → mounted in `routes/index.js`.

## First-time setup

1. **Create the PostgreSQL database** (you'll be prompted for your local
   postgres password):
   ```
   psql -U postgres -c "CREATE DATABASE travel_tour;"
   ```

2. **Copy the env file and fill in your real values:**
   ```
   cp .env.example .env
   ```
   At minimum, put your actual PostgreSQL password into `DATABASE_URL`.

3. **Install dependencies** (already done if you're reading this after the
   initial scaffold):
   ```
   npm install
   ```

4. **Run the first migration** — this reads `prisma/schema.prisma` and
   creates all the tables in your database:
   ```
   npx prisma migrate dev --name init
   ```

5. **Start the dev server:**
   ```
   npm run dev
   ```
   You should see `Server running on http://localhost:5000`.

6. **Sanity check:**
   ```
   curl http://localhost:5000/api/health
   ```

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the server with `tsx watch` (runs TS directly, auto-restarts on file changes) |
| `npm run typecheck` | Run the TypeScript compiler in check-only mode — no output files, just errors. Run this often. |
| `npm run build` | Compile `src/**/*.ts` to `dist/**/*.js` for production |
| `npm start` | Run the compiled production build (`node dist/server.js`) — requires `npm run build` first |
| `npx prisma migrate dev --name <change>` | Create + apply a new migration after editing schema.prisma |
| `npx prisma studio` | Opens a GUI in the browser to browse/edit your database rows |
| `npx prisma generate` | Regenerate the Prisma Client (usually automatic after migrate) |

## API so far

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/destinations` | List published destinations |
| GET | `/api/destinations/:slug` | Destination detail + its published tours |
| POST | `/api/destinations` | Create a destination |
| PUT | `/api/destinations/:id` | Update a destination |
| DELETE | `/api/destinations/:id` | Delete a destination |

> Write routes (POST/PUT/DELETE) are not yet protected by admin auth —
> that's Phase 4. Right now they're open so you can test the pattern.
