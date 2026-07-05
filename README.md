# ShareK Frontend

A modern, responsive frontend application built with Next.js, TypeScript, and Tailwind CSS for the ShareK platform.

## Overview

ShareK Frontend is a Next.js application that provides a user interface for the ShareK platform. The project is structured with a modular architecture, featuring authentication flows, reusable UI components, and a clean separation of concerns.

## Features

- **Modern Tech Stack**: Built with Next.js 16, React 19, and TypeScript
- **Responsive Design**: Fully responsive UI built with Tailwind CSS
- **Authentication Pages**: Complete login, registration, and password recovery flows
- **Component Library**: Pre-built UI components (buttons, inputs, cards, checkboxes, labels)
- **Theme Support**: Dark mode support with `next-themes`
- **Icons**: Icon library via `lucide-react`
- **Type Safety**: Full TypeScript support for better development experience
- **ESLint Configuration**: Code quality and consistency checks

## Tech Stack

- **Framework**: [Next.js 16.2.10](https://nextjs.org/)
- **UI Library**: [React 19.2.4](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: 
  - [shadcn/ui](https://ui.shadcn.com/) components (Button, Input, Card, etc.)
  - [Radix UI](https://www.radix-ui.com/) for accessible component primitives
  - [Lucide React](https://lucide.dev/) for icons
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Utilities**: clsx, class-variance-authority, tailwind-merge
- **Package Manager**: [pnpm](https://pnpm.io/)

## Project Structure

```
src/
├── app/                    # Next.js app directory & routes
│   ├── (auth)/            # Authentication routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── modules/               # Feature modules
│   └── auth/              # Authentication module
│       ├── components/    # Auth-specific components
│       └── index.ts       # Module exports
├── shared/                # Shared components & utilities
│   └── components/
│       ├── layout/        # Layout components (header, footer)
│       └── ui/            # Reusable UI components
├── config/                # Configuration files
│   └── routes.config.ts   # Route configuration
├── lib/                   # Utility functions
├── providers/             # App providers (theme, etc.)
├── styles/                # Global styles
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

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app will auto-update as you edit files.

## Available Scripts

- **`pnpm dev`** - Start the development server
- **`pnpm build`** - Build the application for production
- **`pnpm start`** - Start the production server
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

Theme settings are configured using `next-themes` and can be customized in the theme provider.

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

The application can be deployed to various platforms:

- **Vercel** (Recommended) - Deploy Next.js apps directly
- **Docker** - Containerize using Dockerfile
- **Traditional Hosting** - Use `next build` and `next start`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## License

This project is part of the ITI Open Source Development Graduation initiative.

## Support

For issues, questions, or contributions, please use the project's issue tracker.
