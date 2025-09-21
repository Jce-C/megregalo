# Photo Cascade Love Display

## Overview

This is a romantic photo display application that creates a cascading visual effect with love messages, heart symbols, and uploaded photos. The app features a starfield background with animated elements falling like a digital waterfall. Users can upload photos that get integrated into the animated cascade along with predefined love messages in Spanish ("I love you so much baby♡"). The application uses a full-stack architecture with React frontend and Express backend, designed for a personalized romantic experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing with single page (Home) and 404 handling
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Theme**: Custom dark theme with neon pink/orange color scheme and CSS variables for theming

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with file upload capabilities using multer middleware
- **File Handling**: Multer for multipart form data processing with memory storage and file system persistence
- **Development Setup**: Hot reloading with Vite integration for development mode
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request logging with response tracking

### Data Storage Solutions
- **Primary Storage**: Firebase Firestore for persistent cloud storage of photo metadata
- **Fallback Storage**: In-memory storage using Map data structure when Firebase is not configured
- **File Storage**: Local file system storage in `/uploads` directory for uploaded images
- **Client Fallback**: localStorage in the browser as additional fallback for offline functionality
- **Data Models**: TypeScript interfaces for Photo and InsertPhoto types with Zod validation

### File Upload System
- **Upload Endpoint**: POST `/api/photos` with multipart form data support
- **File Validation**: Image file type restriction with 10MB size limit
- **Storage Strategy**: Files saved with timestamp-prefixed filenames to prevent conflicts
- **Serving**: Static file serving for uploaded images via Express static middleware

### Animation System
- **Cascade Component**: Custom React component managing animated falling elements
- **Element Types**: Three types of falling items - love messages, photos, and heart symbols
- **Animation Logic**: CSS transforms and transitions for smooth falling effects
- **Starfield Background**: Procedurally generated animated star field using DOM manipulation

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon serverless database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **drizzle-kit**: Database migration and schema management tools

### Frontend UI Libraries
- **@radix-ui/***: Comprehensive collection of unstyled, accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight routing library for React applications
- **tailwindcss**: Utility-first CSS framework for styling

### File Processing
- **multer**: Middleware for handling multipart/form-data file uploads
- **@types/multer**: TypeScript definitions for multer

### Development Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: Vite plugin for React support
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution environment for Node.js

### Validation and Utilities
- **zod**: Schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation
- **clsx**: Utility for constructing CSS class names conditionally
- **date-fns**: Date utility library for time formatting

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Code mapping and navigation
- **@replit/vite-plugin-dev-banner**: Development environment banner