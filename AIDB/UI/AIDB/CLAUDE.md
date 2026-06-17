# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

This is the React  website  built with Next.js lastest and React latest. 
React Project name will be "AIDB"
## Tech Stack
- **Framework:** React
- **UI Library:** Material-UI (MUI) (@mui/material, @emotion/react, @emotion/styled)
- **Language:** TypeScript
- **code formatting tool:** prettier
- **build tool**  use vite  to create react project

## Build & Development Commands
- `npm run dev` — Start local development server
- `npm run build` — Build for production
- `npm run lint` — Run ESLint check
- `npm run typecheck` — Run `tsc --noEmit`
- `npm run preview` — Preview production build locally
## Architecture
### Project Structure

```
src/
├── components/        # React components
├── contexts/          # User Context 
├── types/             # shared TypeScript types and interfaces, entity type
├── pages/             # Pages
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── services/          # API client and typed request/response definitions
└── styles/            # CSS styles
```
## TypeScript/React
- Functional components only. No class components.
- Use named exports, not default exports
- Custom hooks for ALL business logic (useAuth, etc.)
- API response/request types live in `src/api/types.ts`

## Code Standards
- **Styling**: Exclusively use Material UI (MUI) components and the `sx` prop for custom styling. Avoid inline styles or raw CSS files.
- **Components**: Prefer functional components with hooks. Use [MUI System](https://mui.com) for layout management.
- **Types**: Always use interfaces for props and strict typing for event handlers. Avoid `any`.
- **State**: Use React Context for global state; keep component state local.
- **Router**: Use BrowserRouter
- **Authentication**: Use form based authentication and create UserContext and it's UserProvider.
- Local state: useState
- No Redux — do not introduce Redux or Redux Toolkit
- No nextjs — do not introduce or use nextjs

## UI & Theming
Use Modernize theme for reference https://modernize-nextjs-free.vercel.app/

### Palette Specification
- **Primary:**  Standard vibrant Material Design blue (e.g., `#1976d2` main, `#004ba0` dark, `#63a4ff` light)
- **Secondary:** Crisp, contrasting whites or subtle ice-blues
- **Background:** Clean white (`#FFFFFF`) or off-white (`#f8fafc`) for standard pages
- **Text:** Dark navy/black for body (`#1E293B`) and Muted gray for secondary text (`#64748B`)
- **Side Bar** Use side bar same like from Modernize
- **Nav Bar** Use material UI App Bar for Nav Bar

### Implementation Example
Use the following `createTheme` setup in your `src/theme.ts` (or equivalent file):
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Standard vibrant Material Design blue
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff', // White text for primary buttons/bars
    },
    secondary: {
      main: '#e3f2fd', // Soft, light blue for backgrounds/accents
      light: '#ffffff',
      dark: '#b1bfca',
      contrastText: '#1976d2', // Blue text for secondary components
    },
    background: {
      default: '#ffffff', // Clean white for the main app background
      paper: '#f8fafc',   // Slightly off-white/gray for cards and paper elements
    },
    text: {
      primary: '#1E293B',   // Dark navy/black for excellent readability
      secondary: '#64748B', // Muted gray for subtext
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }, 
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});
```
### UI and Design System Rules
- **Color Usage:** Use the `sx` prop with theme tokens (e.g., `color: 'primary.main'`, `bgcolor: 'background.paper'`) instead of hardcoded hex values.
- **Elevation:** Use `MuiPaper` and `Card` components with standard elevation shadows for content boundaries.
- **Spacing:** Consistently use the theme spacing scale (e.g., `p: 2`, `mb: 3`).
- **Typography:** Ensure `Typography` components are used for semantic text hierarchy.

