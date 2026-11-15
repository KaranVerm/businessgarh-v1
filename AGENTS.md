# AGENTS.md

# Businessgarh V1 — Development Guidelines

## 1. Project Overview

Businessgarh is a community platform designed to connect members, encourage discussions, and help users discover and participate in events.

The V1 application includes:

- User authentication and profiles
- Community member directory
- Shared community chat with channels
- Event creation and management
- Event registration (RSVP)
- Basic administrative capabilities

Keep the application simple, reliable, secure, and easy to maintain.

## 2. Technology Stack

- **Frontend:** Next.js with App Router
- **Language:** TypeScript
- **UI:** React and CSS
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Realtime:** Supabase Realtime
- **File Storage:** Supabase Storage
- **Version Control:** Git and GitHub
- **Package Manager:** npm

Use the existing project dependencies and conventions. Do not introduce new libraries without a clear reason.

## 3. Development Setup

### Requirements

- Node.js
- npm
- Git
- Supabase project credentials
- Visual Studio Code (recommended)

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root.

Use the project's existing Supabase environment variable names:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Never commit `.env.local` or expose secret keys in client-side code.

### Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
```

## 4. Project Architecture

The project follows the Next.js App Router structure.

Important directories:

- `app/` — Routes, layouts, and application pages.
- `app/auth/` — Authentication-related routes.
- `app/protected/` — Authenticated application pages.
- `components/` — Reusable UI and feature components.
- `lib/` — Shared utilities and Supabase clients.
- `public/` — Static assets.

Follow the existing folder structure when adding new functionality. Check the actual implementation before moving or renaming files.

## 5. Main Application Modules

### Authentication

- Use Supabase Auth for registration and login.
- Protect authenticated routes.
- Maintain the existing authentication flow.
- Do not expose credentials or private user information.

### Member Profiles

- Members can update their profile information.
- Profile information includes name, avatar, bio, and interests.
- Avatar images are stored in Supabase Storage.
- Users should only be able to modify their own profiles.

### Member Directory

- Display registered community members.
- Provide access to individual member profiles.
- Keep profile information consistent with the database.

### Community Chat

- Support the predefined community channels.
- Allow authenticated members to send messages.
- Use Supabase Realtime for message updates.
- Display sender information and message timestamps.
- Respect database access policies.

### Events

- Members can create events.
- Event hosts can edit or cancel their own events.
- Members can RSVP and cancel their RSVP.
- Display event information and attendee details.
- Prevent unauthorized event modifications.

### Administration

- Follow the existing role-based access approach.
- Restrict moderation actions to authorized administrators.
- Do not rely on frontend checks alone for security.

## 6. Coding Guidelines

- Use TypeScript for application code.
- Prefer reusable React components.
- Keep components focused on a single responsibility.
- Use clear and descriptive variable and function names.
- Avoid unnecessary duplication.
- Handle loading, error, and empty states.
- Validate user input.
- Keep the existing application behavior working.
- Avoid unnecessary dependencies and abstractions.

## 7. Next.js Guidelines

- Follow the existing App Router conventions.
- Use Server Components by default.
- Use `"use client"` only when client-side functionality is required.
- Keep browser-only APIs inside Client Components.
- Handle dynamic route parameters correctly.
- When using client hooks that require Suspense, preserve the existing Suspense boundaries.
- Avoid unnecessary client-side data fetching.

## 8. Supabase and Database Security

- Use the existing Supabase client utilities.
- Respect Row Level Security (RLS) policies.
- Never disable RLS to solve an application issue.
- Never expose the Supabase service role or secret key.
- Validate permissions on the database/backend side.
- Use authenticated user IDs when checking ownership.
- Keep database changes consistent with the existing schema.

## 9. UI and UX Guidelines

- Maintain a consistent visual identity across the application.
- Prefer clean, modern, professional interfaces.
- Use consistent spacing, typography, colors, and component styles.
- Make layouts responsive for desktop, tablet, and mobile.
- Provide clear feedback for successful and failed actions.
- Avoid excessive gradients, decorative effects, and unnecessary animations.
- Prioritize usability and accessibility over visual complexity.

Refer to `design.md` for the detailed design system.

## 10. Git Workflow

Before making changes:

```bash
git pull origin main
```

After making and testing changes:

```bash
git status
git add .
git commit -m "Describe your changes"
git push origin main
```

- Write meaningful commit messages.
- Do not commit environment files or credentials.
- Avoid committing generated build folders.
- Do not force-push to the shared main branch.
- Coordinate with teammates before making major changes.

## 11. Testing and Quality Checks

Before considering a change complete:

1. Run the development server.
2. Test the affected feature.
3. Check browser console errors.
4. Check terminal errors.
5. Verify authentication and database permissions where relevant.
6. Test responsive layouts.
7. Run the production build when practical.

Run:

```bash
npm run build
```

Fix errors introduced by your changes before pushing.

## 12. Important Rules for Contributors

- Understand the existing implementation before modifying it.
- Do not replace working features unnecessarily.
- Do not change database schemas without documenting the changes.
- Do not remove existing functionality without agreement.
- Do not hardcode secrets, passwords, or private credentials.
- Keep changes focused and explain significant architectural decisions.
- Update documentation when project structure or development workflows change.

## 13. V1 Scope

Focus on delivering a stable community platform.

Do not introduce major features outside the agreed V1 scope without discussing them with the team.

Potential future features should be documented separately rather than added without approval.

---

**Project:** Businessgarh V1  
**Repository:** https://github.com/KaranVerm/businessgarh-v1  
**Branch:** main