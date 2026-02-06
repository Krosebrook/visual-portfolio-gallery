# PHASE 1: Visual Library Transformation (intinc.com Style)

## Vision
Transform the current portfolio into a "Visual Library" for personal projects, adopting the clean, professional, and distinctive design language of `intinc.com`.

## Design Specifications (intinc.com Clone)
- **Palette**:
  - Background: `HSL(210, 20%, 98%)` (Clean Off-white)
  - Foreground: `HSL(222, 47%, 11%)` (Dark Slate)
  - Primary: `HSL(359, 78%, 33%)` (Maroon/The Dot Red)
  - Secondary: `HSL(214, 32%, 91%)` (Light Grey Borders)
  - Accent colors for project categories (Teal, Blue, Orange, Pink).
- **Typography**:
  - Headings: Bold, high-contrast Sans/Serif mix.
  - Body: Modern Sans (Geist/Inter).
- **Core Theme**: "The Dot" – Minimalist, detail-oriented, connection-focused.

## MVP v1 Scope
1.  **Rebranded Home**: 100vh Hero section with high-quality background imagery and "The Dot" motifs.
2.  **Visual Library Grid**: A structured, card-based library view replacing the full-screen gallery.
3.  **Project Intake Flow**: Updated admin panel to handle project links (GitHub, URLs) and simulation of AI-generated assets (snapshots, overviews).
4.  **Responsive Detail View**: Enhanced project modal/page with multi-media support (images, videos, milestones).

## Technical Implementation
- **Design System**: Update `src/index.css` and `tailwind.config.cjs`.
- **Components**:
  - `TheDot`: Decorative component.
  - `LibraryHero`: Clean, high-impact hero.
  - `ProjectLibrary`: Organized grid.
  - `ProjectIntake`: Simulation of project generation from URL.
