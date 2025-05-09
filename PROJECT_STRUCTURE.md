# Mystic Arcana Project Structure

## Root Directory
- `index.html` - Main entry point HTML file
- `App.tsx` - Root React component
- `vite.config.ts` - Vite configuration with dynamic port support
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript configuration for Node.js
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - Project dependencies and scripts
- `netlify.toml` - Netlify deployment configuration
- `.env.example` - Example environment variables
- `.env` - Environment variables (not tracked in git)
- `README.md` - Project documentation

## Source Code
- `/src`
  - `/components` - Reusable UI components
    - `/tarot` - Tarot card components
      - `animated-tarot-card.tsx` - Interactive tarot card
      - `daily-card-improved.tsx` - Daily tarot card feature
      - `tarot-deck.tsx` - Deck management
      - `zodiac-spread.tsx` - Zodiac-based tarot spread
    - `/ui` - Generic UI components
      - `card.tsx` - Base card component
      - `button.tsx` - Button component
      - `loading.tsx` - Loading indicators
    - `/layout` - Layout components
      - `header.tsx` - Application header
      - `footer.tsx` - Application footer
      - `sidebar.tsx` - Navigation sidebar
  - `/pages` - Page components
    - `home.tsx` - Home page
    - `daily-tarot.tsx` - Daily tarot page
    - `tarot-reading.tsx` - Tarot reading page
    - `astrology.tsx` - Astrology page
    - `profile.tsx` - User profile page
  - `/hooks` - Custom React hooks
    - `use-tarot.ts` - Tarot card functionality
    - `use-auth.ts` - Authentication hooks
    - `use-astrology.ts` - Astrology functionality
  - `/lib` - Utility functions and services
    - `supabaseClient.ts` - Supabase client configuration
    - `tarot-utils.ts` - Tarot utility functions
    - `astrology-utils.ts` - Astrology utility functions
    - `api.ts` - API client functions
  - `/styles` - CSS and styling
    - `index.css` - Main CSS file with Tailwind imports
    - `cosmic-background.css` - Cosmic background styles
    - `card-flip.css` - Card flip animations
  - `main.tsx` - React entry point

## Public Assets
- `/public`
  - `/images`
    - `/tarot` - Tarot card images
      - `/rider-waite` - Rider-Waite deck images
    - `/zodiac` - Zodiac sign images
    - `/backgrounds` - Background images
    - `stars.png` - Stars background
    - `twinkling.png` - Twinkling effect
    - `clouds.png` - Cloud overlay
  - `/fonts` - Custom fonts
  - `favicon.ico` - Site favicon
  - `debug.html` - Debug utility page
  - `check-supabase-url.html` - Supabase connection check

## Netlify Functions
- `/netlify`
  - `/functions` - Serverless functions
    - `daily-tarot.js` - Daily tarot card generation
    - `tarot-reading.js` - Tarot reading generation
    - `user-readings.js` - User reading history
    - `astrology-charts.js` - Astrology chart generation
    - `subscription.js` - Subscription management
  - `/edge-functions` - Edge functions

## Shared Code
- `/shared` - Shared code between frontend and backend
  - `/types` - TypeScript type definitions
  - `/constants` - Shared constants
  - `/utils` - Shared utility functions

## Documentation
- `/docs` - Project documentation
  - `MYSTIC_ORACLE_V2_PROJECT_OVERVIEW.md` - Comprehensive project overview
  - `DEVELOPER_HANDOFF.md` - Developer handoff document
  - `mysticarcana-architecture-analysis.md` - Architecture analysis
  - `mysticarcana-frontend-improvement-plan.md` - Frontend improvement plan
  - `mysticarcana-technical-diagram.txt` - Technical diagram
  - `mysticplan.txt` - Project plan

## Configuration
- `/.mcp` - MCP server configuration