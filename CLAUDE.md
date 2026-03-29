# HYDRA-VIDEOGEN - AI Video Creation Platform

Full-stack AI-powered video creation platform. Create professional videos from text prompts with AI assistance, featuring real video content generation.

**Core Principle:** Prefer Server Components/Actions. Only create API routes when necessary (webhooks, third-party APIs, etc.).

---

## 1. Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Runtime | Node.js | 18+ | - |
| Package Manager | pnpm | Latest | - |
| Framework | Next.js | 15 | App Router + Turbopack |
| Language | TypeScript | 5+ | Strict mode |
| Styling | TailwindCSS | 4 | CSS variables |
| UI Library | shadcn/ui | Latest | Pre-installed |
| Icons | Lucide React | Latest | - |
| Database | Supabase (nubase) | Latest | PostgreSQL + Auth |
| Theme | next-themes | Latest | Dark/Light mode |

---

## 2. Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (AuthProvider + ThemeProvider)
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles + custom theme
│   ├── login/page.tsx     # Login page
│   ├── signup/page.tsx    # Signup page
│   ├── dashboard/         # User dashboard
│   ├── create/           # AI video generator
│   ├── editor/           # Video editor
│   ├── templates/        # Template gallery
│   ├── export/           # Video export
│   ├── pricing/          # Pricing page
│   ├── brand-kit/        # Brand kit management
│   ├── settings/         # User settings
│   └── admin/            # Admin portal
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── AuthProvider.tsx   # Auth context wrapper
│   └── ThemeProvider.tsx # Theme context
├── hooks/
│   ├── use-auth.tsx       # Authentication hook + provider
│   └── use-mobile.tsx    # Mobile detection
├── integrations/
│   └── supabase/
│       ├── client.ts     # Client-side (RLS enabled)
│       └── server.ts     # Server-side (RLS bypassed)
└── lib/
    └── utils.ts          # Utilities (cn function)

.zoer/                    # Zoer Agent context
```

---

## 3. Core Systems

### 3.1 Authentication
- **Provider:** Supabase Auth (nubase)
- **Status:** Fully implemented
- **Location:** `src/hooks/useAuth.tsx`
- **Features:**
  - Email/password signup and login
  - Google OAuth integration
  - Session management
  - Protected routes via auth check
- **Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth'
const { user, signIn, signUp, signOut, isLoading } = useAuth()
```

### 3.2 Admin Portal (`/admin`)
- **Status:** Fully implemented
- **Location:** `src/app/admin/page.tsx`
- **Credentials:** admin@hydra-videogen.com / admin123
- **Features:**
  - User management (view, upgrade/downgrade plans, enable/disable)
  - Project management (view, delete)
  - Analytics dashboard with daily stats
  - Maintenance tools (clear projects, test data)
  - Bypasses all paywalls and restrictions
- **Access:** Direct login via /admin route

### 3.3 AI Video Generation
- **Status:** Fully implemented
- **Location:** `src/app/create/page.tsx`
- **Features:**
  - Text prompt to video generation
  - Scene generation with actual video content (Pexels videos)
  - Image and color backgrounds
  - Text overlays auto-generated
  - Voiceover text per scene

### 3.4 UI Components
- **Library:** shadcn/ui (Radix UI + TailwindCSS)
- **Status:** Fully installed and used
- **Location:** `src/components/ui/`
- **Key Components Used:** Button, Card, Input, Dialog, Tabs, Select, Badge, etc.

### 3.5 Theme System
- **Provider:** next-themes
- **Modes:** light, dark, system
- **Custom Colors:**
  - Primary Gradient: cyan-400 to blue-500 (`from-cyan-400 to-blue-500`)
  - Background: `#0a0a14` (dark) / `#fafafa` (light)
- **Variables:** `globals.css` (`:root` and `.dark`)

### 3.6 Database (nubase)
- **Tables Created:**
  - `profiles` - User profiles linked to auth.users
  - `projects` - Video projects
  - `scenes` - Video scenes per project
  - `text_overlays` - Text overlays per scene
  - `templates` - Video templates (public)
  - `media_assets` - User uploads + stock media
  - `brand_kits` - Brand customization presets
  - `exports` - Video export jobs
  - `voiceover_presets` - Saved voiceover settings
- **RLS:** Enabled on all tables with user-specific policies

### 3.7 Routing
- **Pattern:** App Router (Next.js 15)
- **Server Components:** Default
- **Client Components:** Add `'use client'` when needed (auth, interactivity)
- **Protected Routes:** Dashboard, Editor, Create, Export, Settings, Brand Kit

---

## 4. Pages & Features

### Landing Page (`/`)
- Hero section with AI prompt input
- Feature highlights
- Template preview gallery
- Pricing preview
- Testimonials
- Footer with links
- **Branding:** HYDRA-VIDEOGEN logo + gradient text

### Authentication (`/login`, `/signup`)
- Email/password login
- Google OAuth
- Form validation
- Redirect handling

### Dashboard (`/dashboard`)
- Project grid/list view
- Create new project
- Edit, duplicate, delete actions
- Empty state

### AI Video Generator (`/create`)
- Text prompt input
- Preset templates
- Aspect ratio selection
- Duration selection
- AI generation with real video content (Pexels videos)
- Progress steps (Project, Scenes, Media, Text)

### Video Editor (`/editor`)
- 3-panel layout (Scenes | Canvas | Properties)
- Timeline with scenes
- Video, image, and color backgrounds
- Text overlay editing
- Voiceover settings
- Undo/redo history
- Save functionality

### Template Gallery (`/templates`)
- Searchable templates
- Category filters
- Aspect ratio filters
- Template preview cards

### Export (`/export`)
- Resolution selection (480p - 4K)
- Format selection (MP4, GIF)
- Progress tracking
- Download ready state

### Pricing (`/pricing`)
- 3-tier pricing (Free, Pro, Business)
- Monthly/Annual toggle
- Feature comparison table
- FAQ accordion

### Brand Kit (`/brand-kit`)
- Create/edit brand kits
- Logo upload
- Primary/secondary colors
- Font selection
- Live preview

### Settings (`/settings`)
- Profile management
- Account settings
- Billing overview

### Admin Portal (`/admin`)
- **URL:** `/admin`
- **Credentials:** admin@hydra-videogen.com / admin123
- **Features:**
  - Overview stats (users, projects, exports, subscriptions)
  - User management (CRUD, plan management)
  - Project management (view, delete)
  - Analytics (daily stats)
  - Maintenance tools
  - Bypasses all paywalls

---

## 5. Development Conventions

### Naming
- Components: `PascalCase.tsx`
- Functions/Files: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

### Component Patterns
- Function components + hooks
- Server Components by default
- Use shadcn/ui first, then custom
- NO class components

### Styling
- TailwindCSS classes
- CSS variables from globals.css
- Custom gradient buttons: `bg-gradient-to-r from-cyan-400 to-blue-500`
- Dark theme editor: `bg-[#0a0a14]`

### Suspense Boundaries
- Required for `useSearchParams()` in Next.js 15
- Wrap client components with Suspense

---

## 6. Current State

### Implemented Features
- [x] Landing page with hero and features
- [x] User authentication (email + Google OAuth)
- [x] Project dashboard
- [x] AI video generator wizard (with real video content)
- [x] Video editor with timeline
- [x] Template gallery
- [x] Video export page
- [x] Pricing page
- [x] Brand kit management
- [x] User settings
- [x] Admin portal with authentication
- [x] Database schema with RLS
- [x] Sample templates seeded
- [x] Stock media assets seeded

### Database Schema
- 9 tables with RLS policies
- Auto profile creation on signup
- User-scoped data access

### Branding
- **Name:** HYDRA-VIDEOGEN
- **Logo:** https://cdn.chat2db-ai.com/app/avatar/custom/facab45b-1210-435a-8852-f26f7ff68160_unknown.jpeg
- **Gradient:** cyan-400 to blue-500

---

## 7. Critical Notes for AI

### Top Rules
1. **shadcn/ui is pre-installed** - NEVER recreate components
2. **Server Components first** - Only add `'use client'` when needed
3. **Avoid API routes** - Use Supabase client directly
4. **RLS awareness** - Use `client.ts` for frontend queries, `server.ts` for admin
5. **Theme-safe colors** - Use CSS variables OR custom hex values
6. **TypeScript strict** - Proper typing for all data
7. **CRITICAL - DO NOT write `src/middleware.ts` for auth protection**
8. **Prohibit the use of `@supabase/ssr`**

### Common Mistakes to Avoid
- Creating new Button/Card/Dialog components (already exist)
- Using `'use client'` everywhere (Server Component is default)
- Creating API routes for simple data fetching
- Ignoring Suspense boundaries for `useSearchParams()`

---

## 8. Maintenance Log

- 2026-03-22: Initial project setup from Next.js template
- 2026-03-22: Added database schema (profiles, projects, scenes, text_overlays, templates, media_assets, brand_kits, exports, voiceover_presets)
- 2026-03-22: Implemented authentication system with useAuth hook
- 2026-03-22: Created landing page with hero, features, pricing preview
- 2026-03-22: Built login and signup pages with OAuth support
- 2026-03-22: Created dashboard with project management
- 2026-03-22: Built AI video generator wizard
- 2026-03-22: Created video editor with timeline interface
- 2026-03-22: Built template gallery with filters
- 2026-03-22: Created video export page with progress tracking
- 2026-03-22: Built pricing page with comparison table
- 2026-03-22: Created brand kit management
- 2026-03-22: Built user settings page
- 2026-03-22: Seeded database with sample templates and media
- 2026-03-28: Rebranded to HYDRA-VIDEOGEN with custom logo
- 2026-03-28: Fixed video generation to include actual video content (Pexels videos)
- 2026-03-28: Created admin portal at /admin with authentication
- 2026-03-28: Added admin analytics and user/project management
