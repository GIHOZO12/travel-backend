# Travel & Tour Company Website — Backend

Express + PostgreSQL (via Prisma) API for the travel/tour website described
in the project SRS.

## Stack

- **Node.js / Express** — HTTP server and routing
- **PostgreSQL** — relational database
- **Prisma** — ORM: schema, migrations, type-safe query client
- **JWT + bcryptjs** — admin authentication (added in Phase 4)
- **express-validator** — request validation
- **helmet, cors, express-rate-limit** — baseline security

## Project structure

```
prisma/
  schema.prisma        # database schema — source of truth for all tables
src/
  app.js                # Express app: middleware + route mounting
  server.js              # entry point — starts the HTTP server
  config/
    prisma.js            # shared PrismaClient instance
  routes/
    index.js             # mounts every feature's routes under /api
    destination.routes.js
  controllers/
    destination.controller.js
  validators/
    destination.validator.js
  middleware/
    errorHandler.js       # central error formatting (incl. Prisma errors)
    notFound.js            # 404 fallback
    validate.js             # runs express-validator rule results
  utils/
    ApiError.js              # throw new ApiError(statusCode, message)
    asyncHandler.js            # wraps async route handlers
    slugify.js                  # "Rwanda Safari" -> "rwanda-safari"
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
| `npm run dev` | Start the server with nodemon (auto-restart on file changes) |
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
