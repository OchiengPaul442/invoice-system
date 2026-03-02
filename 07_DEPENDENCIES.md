# 07 — Dependencies

All dependencies listed here are **free and open source**. Zero paid services, zero licensing costs, zero vendor lock-in.

---

## Runtime Dependencies

### Framework & Core

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `next` | 14.x | Full-stack React framework (App Router) | MIT |
| `react` | 18.x | UI library | MIT |
| `react-dom` | 18.x | React DOM renderer | MIT |
| `typescript` | 5.x | Type safety | Apache 2.0 |

### Database & ORM

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `prisma` | 5.x | ORM + migrations CLI | Apache 2.0 |
| `@prisma/client` | 5.x | Auto-generated DB client | Apache 2.0 |
| PostgreSQL | 15+ | Database (install separately) | PostgreSQL License (free) |

### Authentication

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `next-auth` | 5.x (beta) | Session management, JWT | ISC |
| `bcryptjs` | 2.x | Password hashing | MIT |
| `@types/bcryptjs` | 2.x | TypeScript types | MIT |

### PDF Generation

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `@react-pdf/renderer` | 3.x | PDF generation from React components | MIT |

This is the key dependency. It runs entirely server-side, generates proper PDF/A-compliant files, supports custom fonts, images, and complex layouts. No external service required.

### Forms & Validation

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `react-hook-form` | 7.x | Performant form management | MIT |
| `@hookform/resolvers` | 3.x | Zod integration for react-hook-form | MIT |
| `zod` | 3.x | Runtime schema validation | MIT |

### State Management

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `zustand` | 4.x | Lightweight global state (invoice builder) | MIT |

### UI Components & Styling

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `tailwindcss` | 3.x | Utility-first CSS framework | MIT |
| `@radix-ui/react-dialog` | latest | Accessible modal dialogs | MIT |
| `@radix-ui/react-dropdown-menu` | latest | Dropdown menus | MIT |
| `@radix-ui/react-select` | latest | Accessible select inputs | MIT |
| `@radix-ui/react-tabs` | latest | Tabbed layouts | MIT |
| `@radix-ui/react-toast` | latest | Toast notifications | MIT |
| `@radix-ui/react-popover` | latest | Popover menus | MIT |
| `@radix-ui/react-switch` | latest | Toggle switches | MIT |
| `@radix-ui/react-separator` | latest | Visual separators | MIT |
| `@radix-ui/react-avatar` | latest | User avatar component | MIT |
| `@radix-ui/react-label` | latest | Accessible form labels | MIT |
| `@radix-ui/react-slot` | latest | Polymorphic slot component | MIT |
| `class-variance-authority` | latest | Component variants (used by shadcn) | Apache 2.0 |
| `clsx` | 2.x | Conditional class names | MIT |
| `tailwind-merge` | 2.x | Merge Tailwind classes without conflicts | MIT |
| `lucide-react` | 0.x | Icon library (450+ icons, tree-shakeable) | ISC |

shadcn/ui is not a traditional npm package — it copies component source code into your project. Free, MIT-licensed.

### Date & ID Utilities

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `date-fns` | 3.x | Date formatting and manipulation | MIT |
| `nanoid` | 5.x | Secure unique ID generation | MIT |

### Drag and Drop (Optional but recommended)

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `@dnd-kit/core` | 6.x | Drag-and-drop primitives | MIT |
| `@dnd-kit/sortable` | 7.x | Sortable list extension for dnd-kit | MIT |

Used for reordering line items in the invoice builder.

---

## Dev Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `eslint` | 8.x | Code linting | MIT |
| `eslint-config-next` | 14.x | Next.js ESLint rules | MIT |
| `@types/node` | 20.x | Node.js TypeScript types | MIT |
| `@types/react` | 18.x | React TypeScript types | MIT |
| `@types/react-dom` | 18.x | React DOM types | MIT |
| `postcss` | 8.x | CSS processing (required by Tailwind) | MIT |
| `autoprefixer` | 10.x | CSS vendor prefixes | MIT |

---

## System-Level Requirements

| Requirement | Version | Notes |
|------------|---------|-------|
| Node.js | 18.17+ | Required by Next.js 14 |
| npm | 9+ | Or use pnpm/yarn |
| PostgreSQL | 15+ | Must be installed and running |

### Installing PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE devinvoice;"
sudo -u postgres psql -c "CREATE USER devuser WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE devinvoice TO devuser;"
```

### Installing PostgreSQL (macOS)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb devinvoice
```

### Installing PostgreSQL (Windows)
Download and install from https://www.postgresql.org/download/windows/ — all free.

---

## Complete `package.json`

```json
{
  "name": "devinvoice",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^7.0.2",
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.9.1",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@react-pdf/renderer": "^3.3.8",
    "@types/bcryptjs": "^2.4.6",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.323.0",
    "nanoid": "^5.0.6",
    "next": "14.1.0",
    "next-auth": "^5.0.0-beta.13",
    "prisma": "^5.9.1",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.50.1",
    "tailwind-merge": "^2.2.1",
    "zod": "^3.22.4",
    "zustand": "^4.5.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

## What's Intentionally Excluded

| Category | What's Not Used | Why |
|----------|----------------|-----|
| Email | No Nodemailer, Resend, SendGrid | Keep system fully self-contained. Can be added later. |
| Object Storage | No AWS S3, Cloudinary, Uploadthing | Local file system is sufficient for logos. |
| Payment Processing | No Stripe | Invoice tracking only, no payment collection. |
| Analytics | No PostHog, Plausible | Not needed for a solo developer tool. |
| Real-time | No Pusher, Socket.io | No real-time features needed. |
| Charts | No Recharts, Chart.js | Simple stats only, CSS-based progress indicators. |
| Rich Text | No TipTap, Quill | Plain text for notes/footer is sufficient. |
| Search | No Algolia, Meilisearch | Postgres `ILIKE` queries sufficient at this scale. |
| Testing | No Jest, Playwright | Add later if needed. |
| i18n | No next-intl | English only for initial build. |

---

## Self-Hosting Deployment (Free Options)

All free options for deploying the complete stack:

| Option | Cost | Notes |
|--------|------|-------|
| Railway | Free tier + ~$5/mo | Easy, includes PostgreSQL, persistent volumes |
| Render | Free tier | Free PostgreSQL (limited), good for start |
| Fly.io | Free tier | Good for Node apps, PostgreSQL via Supabase |
| VPS (Hetzner, DigitalOcean) | ~$4-6/mo | Most control, install PostgreSQL directly |
| Home Server | Free | Run on any Linux machine on your network |

**Recommended for production:** VPS with Docker Compose:

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://devuser:password@db:5432/devinvoice
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./public/uploads:/app/public/uploads
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: devinvoice
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
