# Portfolio

A modern, responsive portfolio website built with Next.js, featuring dynamic content management, glassmorphism design, and smooth animations.

## Features

- **Dynamic Content Management:** MongoDB integration for portfolio items and experiences
- **Modern UI/UX:** Glassmorphism design with animated background bubbles
- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Smooth Animations:** Framer Motion for interactive animations and parallax effects
- **Performance Optimized:** Next.js Image optimization and React Query for efficient data fetching

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** MongoDB Atlas
- **Data Fetching:** TanStack Query (React Query)
- **Package Manager:** pnpm
- **Icons:** Simple Icons, React Icons, Lucide React

## Prerequisites

- Node.js 18+ 
- pnpm
- MongoDB Atlas account (or local MongoDB instance)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
```

4. Run the development server:
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

Build the application for production:

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/
├── api/              # API routes
├── components/        # Reusable components
├── hooks/            # Custom React hooks
├── sections/         # Page sections
└── types/            # TypeScript type definitions
public/
└── portfolio/        # Portfolio project images
scripts/
└── seed.ts          # Database seeding script
```

## Deployment

The application is configured for deployment on Vercel. Ensure environment variables are set in your deployment platform.
