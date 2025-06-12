# Memex Dashboard

A personal capture and triage tool for saving, organizing, and making sense of digital content. Save links, text, images, and files from various sources into an intelligent inbox system with projects, tags, and search.

## Features

- **Magic Link Authentication** - Secure, passwordless login via Supabase
- **Personal Dashboard** - View and manage your saved items
- **Project Organization** - Organize content into projects and folders
- **Content Intelligence** - Automatic content type detection and metadata extraction
- **Cross-Platform** - Web app with planned iOS and Chrome extensions

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel
- **Authentication:** Supabase Magic Links

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/
├── src/app/                    # Next.js App Router pages
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Main dashboard
│   └── api/                    # API endpoints
├── src/components/             # Reusable components
├── src/utils/                  # Utility functions and clients
├── project-plan.md             # Development roadmap and progress
└── CLAUDE.md                   # Development instructions
```

## Development Status

See [project-plan.md](./project-plan.md) for detailed development roadmap and current progress.

**Current Phase:** Phase 1 - MVP Foundation  
**Completed:** ✅ Checkpoint 1.1 - Project Setup & Authentication  
**Next:** Checkpoint 1.2 - Core Data Models

## API

### Authentication
- Magic link authentication via Supabase Auth

### Endpoints
- `POST /api/capture` - Save new items (authenticated)

## Deployment

The app is designed to deploy on Vercel with Supabase as the backend.

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

## Contributing

This is a personal project, but feedback and suggestions are welcome via issues.

## License

MIT
