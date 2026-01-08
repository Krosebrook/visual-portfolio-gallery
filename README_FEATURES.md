# Visual Portfolio Gallery - Feature Documentation

This document outlines the advanced features implemented in the Visual Portfolio Gallery application.

## 1. Advanced Portfolio Gallery (`src/components/PortfolioGallery.tsx`)

A high-fidelity, immersive gallery experience designed to showcase creative work.

### Features
- **Dual View Modes**:
  - **Slide View**: Full-screen immersive slideshow with cinematic transitions, background parallax effects, and keyboard navigation.
  - **Grid View**: Responsive masonry-style grid layout for browsing multiple projects at once.
- **Category Filtering**: Dynamic filtering based on project categories (e.g., Photography, Fashion).
- **Smooth Animations**: Powered by `framer-motion` for layout transitions and entrance effects.
- **Detail Modal**: Deep dive into project details without leaving the context.

### Technical Implementation
- **State Management**: Handles `viewMode`, `activeCategory`, and `currentIndex`.
- **Performance**: Uses `useMemo` for derived state (categories, filtered projects) to prevent unnecessary re-renders.
- **Animation**: `AnimatePresence` for exit animations and `layout` prop for smooth grid reordering.

## 2. Robust Admin Dashboard (`src/components/AdminPanel.tsx`)

A comprehensive Content Management System (CMS) for managing the portfolio's content.

### Features
- **Tabbed Interface**:
  - **Projects**: Create, list, and delete portfolio projects.
  - **Testimonials**: Manage client reviews and testimonials.
  - **Inquiries**: View contact form submissions.
- **Image Uploads**: Integrated with Blink Storage for seamless image hosting.
- **Secure Access**: Protected by Blink Auth (requires login).

### Technical Implementation
- **Blink SDK**:
  - `blink.db`: CRUD operations for `projects`, `testimonials`, `inquiries`.
  - `blink.storage`: File uploads for project images and client avatars.
  - `blink.auth`: Authentication state management.
- **UI Components**: Built with ShadCN UI (Tabs, Table, Dialog) and Lucide icons.

## 3. Contact System (`src/components/ContactSection.tsx`)

A professional inquiry system to convert visitors into leads.

### Features
- **High-Fidelity Form**: Beautifully designed form with floating labels and validation.
- **Email Notifications**: Automatically sends email notifications to the site owner (and confirmation to the user) using `blink.notifications`.
- **Database Logging**: Stores all inquiries in the database for record-keeping.
- **Validation**: Strict validation using `zod` and `react-hook-form`.

### Technical Implementation
- **Schema Validation**: `zod` schema ensures valid emails and required fields.
- **Blink Notifications**: Uses the `email()` method to send transactional emails.
- **Optimistic UI**: Immediate feedback with `sonner` toasts while processing in background.

## Database Schema

### `projects`
- `id`: string
- `title`: string
- `description`: string
- `imageUrl`: string
- `category`: string
- `user_id`: string
- `created_at`: datetime

### `testimonials`
- `id`: string
- `clientName`: string
- `content`: string
- `clientRole`: string
- `clientImage`: string (optional)
- `user_id`: string
- `created_at`: datetime

### `inquiries`
- `id`: string
- `name`: string
- `email`: string
- `subject`: string
- `message`: string
- `user_id`: string
- `created_at`: datetime
