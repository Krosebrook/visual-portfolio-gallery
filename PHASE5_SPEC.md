# PHASE 5: Advanced Ecosystem & Scalability

## Vision
Transform the Visual Portfolio Gallery into a scalable, intelligent, and immersive platform that bridges the gap between static archives and dynamic digital experiences.

## Core Pillars

### 1. SaaS Multi-User Support ("Portfolio Hub")
- **Goal**: Transition from a single-user portfolio to a multi-tenant platform where any creative professional can host their own "Visual Library".
- **User Flow**: 
  - User signs up -> Chooses a unique username (slug).
  - Profile URL: `/u/:username` (e.g., `visualarchive.com/u/johndoe`).
  - Dashboard: Manage only personal projects, testimonials, and inquiries.
- **Technical**:
  - Update React Router with `:username` param.
  - All DB queries filtered by `user_id` mapped from `username`.

### 2. AI Style Sync
- **Goal**: Zero-effort branding that matches the user's work.
- **Functionality**:
  - AI analyzes the dominant aesthetic of uploaded project images.
  - Automatically generates a color palette (HSL) and suggests font pairings.
  - Updates CSS variables (`--primary`, `--accent`) in real-time or via user-saved theme settings.
- **Technical**:
  - `blink.ai.generateText` with vision to extract hex/hsl codes.
  - Dynamic CSS injection or Tailwind theme updates.

### 3. Immersive 3D Environments
- **Goal**: Spatial storytelling for the next generation of web viewing.
- **Experience**:
  - A "3D Mode" button on the gallery.
  - Users enter a Three.js scene (virtual gallery) where they can "walk" between project artifacts.
  - Interactive "pedestals" for 3D models and floating "canvases" for images/videos.
- **Technical**:
  - `@react-three/fiber` + `@react-three/drei`.
  - PointerLockControls or smooth camera lerping for navigation.

### 4. Figma Design-to-Artifact Sync
- **Goal**: Eliminate manual uploads for UI/UX designers.
- **Integration**:
  - Connect Figma account via OAuth.
  - Select Figma files/frames to import directly as project visuals.
  - Auto-sync: Updates in Figma can be pushed to the portfolio with one click.
- **Technical**:
  - Figma REST API integration.
  - Edge function to fetch and store Figma export URLs in `project_visuals`.

## Implementation Strategy
1. **Infrastructure**: Multi-user routing and database scoping.
2. **Intelligence**: AI palette extraction and style application.
3. **Experience**: 3D Gallery prototype.
4. **Integration**: Figma API connector.

## Next Steps
- Implement `/u/:username` routing.
- Create AI utility for image palette analysis.
- Draft the `ThreeDGallery` component.
- Set up Figma API secrets.
