# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production app with Turbopack  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

VeilVision is an AI-powered image transformation webapp built with Next.js 15 App Router. The app uses Google's Gemini 2.5 Flash Vision API to transform user-uploaded photos based on natural language prompts.

### Core Architecture

**Three-Layer Service Architecture:**
- **Frontend**: React components with Tailwind CSS styling
- **API Layer**: Gemini 2.5 Flash Vision API integration (`src/lib/gemini.ts`)
- **Data Layer**: Neon PostgreSQL database (`src/lib/database.ts`)

**Authentication Flow:**
- Clerk handles user authentication and session management
- Middleware protects routes (`middleware.ts`) - currently commented out for development
- User data synced between Clerk and Neon database

### Key Services

**Gemini Integration (`src/lib/gemini.ts`):**
- Uses `gemini-2.5-flash-image-preview` model for image transformation
- Uses `gemini-2.5-flash` model for image analysis
- Converts File objects to base64 for API consumption
- Handles both generation and analysis workflows

**Database Layer (`src/lib/database.ts`):**
- Neon serverless PostgreSQL integration
- Two main entities: `User` (synced with Clerk) and `Generation` (transformation records)
- Status tracking: pending → processing → completed/failed
- CRUD operations for users and image generations

### Page Architecture

**App Router Structure:**
- All pages use `'use client'` directive (client-side rendered)
- Consistent sidebar layout (`src/components/Sidebar.tsx`)
- Main pages: Dashboard (upload/transform), Gallery (browse results), History (track generations), Settings (configuration)

**Navigation Pattern:**
- Root page (`/`) redirects to `/dashboard`
- Sidebar provides persistent navigation across all app pages
- Active route highlighting with `usePathname` hook

### Environment Configuration

Required environment variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GEMINI_API_KEY=
```

### Database Schema

Two main tables:
- `users`: Links Clerk user IDs with app user data
- `generations`: Tracks image transformation requests and results with status lifecycle

### Development Notes

**Current State:**
- Skeleton application with full UI implemented
- Clerk authentication temporarily disabled (commented out in layout and middleware)
- Mock data used in Gallery and History pages
- Gemini API integration ready but needs testing with real API keys

**Testing Without Services:**
- App can run without valid API keys for UI development
- Authentication bypassed for development testing
- Database queries will fail without valid Neon connection

**Component Patterns:**
- Lucide React icons used throughout
- Tailwind utility classes for styling
- Client-side state management with React hooks
- File upload handling with FileReader API for base64 conversion
- do not start the dev server after each update. I will do that myself. If you do start the dev server for testing always remember to kill it when your tests are complete.