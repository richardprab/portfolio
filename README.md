# Portfolio

A modern portfolio website built with Next.js, featuring dynamic content management via MongoDB Atlas.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** MongoDB Atlas with Mongoose
- **Package Manager:** pnpm

## Prerequisites

- Node.js 18+ 
- pnpm
- MongoDB Atlas account

## Installation

```bash
pnpm install
```

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Seeding

Populate the database with initial data:

```bash
pnpm seed
```

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/
  api/          # API routes
  components/   # React components
  sections/     # Page sections
  types/        # TypeScript types
lib/            # Utilities (MongoDB connection)
models/         # Mongoose models
scripts/        # Database seeding
```

## License

Private
