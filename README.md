# ShareK Frontend

A modern, responsive frontend application built with TanStack Start, TypeScript, and Tailwind CSS for the ShareK platform.

## Overview

ShareK Frontend is a TanStack Start (React, file-based routing, SSR via Vite/Nitro) application that provides a user interface for the ShareK platform. The project is structured with a modular architecture, featuring authentication flows, reusable UI components, and a clean separation of concerns.

## Features

- **Modern Tech Stack**: Built with TanStack Start, TanStack Router, React 19, and TypeScript
- **Responsive Design**: Fully responsive UI built with Tailwind CSS
- **Authentication Pages**: Complete login, registration, and password recovery flows
- **Component Library**: Pre-built UI components (buttons, inputs, cards, checkboxes, labels)
- **Theme Support**: Dark mode support through the shared theme provider
- **Icons**: Icon library via `lucide-react`
- **Type Safety**: Full TypeScript support for better development experience
- **ESLint Configuration**: Code quality and consistency checks

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Vite + [TanStack Router](https://tanstack.com/router))
- **UI Library**: [React 19.2.4](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: 
  - [shadcn/ui](https://ui.shadcn.com/) components (Button, Input, Card, etc.)
  - [Radix UI](https://www.radix-ui.com/) for accessible component primitives
  - [Lucide React](https://lucide.dev/) for icons
- **Theme Management**: Shared React theme provider
- **Utilities**: clsx, class-variance-authority, tailwind-merge
- **Package Manager**: [pnpm](https://pnpm.io/)

## Project Structure

```
src/
├── routes/                # TanStack Router file-based routes
│   ├── __root.tsx         # Root document (html shell, providers, global head)
│   ├── index.tsx          # Home page ("/")
│   ├── _authLayout.tsx    # Pathless layout for auth pages (header/footer)
│   └── _authLayout/       # Auth routes sharing the layout above
│       ├── login.tsx
│       ├── register.tsx
│       └── forgot-password.tsx
├── router.tsx              # Router instance factory
├── modules/                # Feature modules
│   └── auth/                # Authentication module
│       ├── components/       # Auth-specific components
│       └── index.ts          # Module exports
├── shared/                 # Shared components & utilities
│   └── components/
│       ├── layout/           # Layout components (header, footer)
│       └── ui/                # Reusable UI components
├── config/                 # Configuration files
│   └── routes.config.ts     # Route configuration
├── lib/                    # Utility functions
├── providers/              # App providers (theme, etc.)
├── styles.css              # Global styles entry (imports styles/tokens.css)
├── styles/                 # Design tokens
└── ...
```

## Getting Started

### Prerequisites

- **Node.js**: 18.17 or later
- **pnpm**: 8.0 or later (recommended package manager)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sharek-frontend
```

2. Install dependencies:
```bash
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the application.

The app will auto-update as you edit files.

### Backend API

The standard local backend port is `4000` (see `docs/governance/decision-log.md`
DEC-019). The frontend axios client targets `VITE_API_URL`
(default `http://localhost:4000`, see `.env.example`).

```bash
pnpm dev
```

If your backend runs on a different port, point the frontend to it explicitly:

```bash
VITE_API_URL=http://localhost:<backend-port> pnpm dev
```

Contributor profile redirect requires these backend endpoints:

- `POST /auth/login`
- `GET /auth/me`
- `POST /contributors/profiles/me/ensure`
- `GET /contributors/profiles/:username`

## Available Scripts

- **`pnpm dev`** - Start the development server
- **`pnpm build`** - Build the application for production
- **`pnpm start`** - Preview the production build
- **`pnpm generate-routes`** - Regenerate `src/routeTree.gen.ts` from the files in `src/routes/`
- **`pnpm lint`** - Run ESLint to check code quality

## Pages

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery

## Component Library

The project includes a collection of pre-built UI components in `src/shared/components/ui/`:

- **Button** - Customizable button component with variants
- **Input** - Text input field with styling
- **Card** - Container component for content grouping
- **Label** - Form label component
- **Checkbox** - Accessible checkbox input

These components are built using shadcn/ui patterns and Tailwind CSS.

## Authentication Module

The authentication module (`src/modules/auth/`) includes:

- **Login Form** - User authentication
- **Register Form** - User registration
- **Forgot Password Form** - Password recovery flow
- **Social Auth Buttons** - Social authentication options
- **Auth-specific UI Components** - Text fields, password fields, dividers

## Configuration

### Routes Configuration

Route configuration is managed in `src/config/routes.config.ts` for centralized route management.

### Theme Configuration

Theme settings are configured in `src/providers/theme-provider.tsx` and mounted through `src/providers/app-providers.tsx`.

### TypeScript

TypeScript configuration is defined in `tsconfig.json` with strict type checking enabled.

## Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme colors and values
- **shadcn/ui** component patterns for consistency
- **class-variance-authority** for component variant management

Global styles are defined in `src/styles/`.

## Documentation

For detailed architecture and design decisions, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Contributing

Contributions are welcome! Please ensure:

1. Code follows the existing style and conventions
2. TypeScript types are properly defined
3. Components are reusable and well-documented
4. ESLint checks pass: `pnpm lint`

## Building for Production

Create an optimized production build:

```bash
pnpm build
```

Then start the production server:

```bash
pnpm start
```

## Deployment

TanStack Start builds to a standard Nitro server output (`pnpm build`), deployable to:

- **Node hosting** - Run the built server output directly
- **Docker** - Containerize using Dockerfile
- **Nitro-supported platforms** - Cloudflare, Netlify, Vercel, etc. via the appropriate Nitro preset

## Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## License

This project is part of the ITI Open Source Development Graduation initiative.

## Support

For issues, questions, or contributions, please use the project's issue tracker.
