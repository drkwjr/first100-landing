# First 100 Landing Site

A premium, static-first website for First 100 — a portfolio of paid, no-ads, toddler-friendly language apps.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing and verification

### Run tests

Tests use Node’s built-in test runner (no extra dependencies). They check:

- **`languages.json`** — Required keys, valid `status`, unique slugs, URL-safe slugs, store URLs for available languages.
- **`illustration-prompts.js`** — Exported `OBJECTS` shape, `buildPrompt`, `estimateCost`, and `getObjectById`.

```bash
npm test
```

Expected: all tests pass with no errors.

### Verify the build

After `npm install`, confirm the site builds and runs:

```bash
# 1. Install dependencies
npm install

# 2. Run data/script tests
npm test

# 3. Build the site (generates static output in dist/)
npm run build

# 4. Optional: serve the built site locally
npm run preview
```

- **Build success**: `dist/` is created and contains `index.html`, `languages/index.html`, and `l/somali/index.html` (and one `l/<slug>/index.html` per language).
- **Dev server**: `npm run dev` starts the dev server; open the URL shown (e.g. `http://localhost:4321`).

If any step fails, check Node version (>= 18 recommended) and that all files from the plan are present.

## Project Structure

```
first100-landing/
├── src/
│   ├── components/       # Reusable Astro components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   │   ├── index.astro   # Homepage
│   │   ├── languages.astro # Language directory
│   │   ├── privacy.astro # Privacy policy
│   │   └── l/[slug].astro # Language detail template
│   ├── data/
│   │   └── languages.json # Language catalog data
│   └── styles/
│       ├── global.css    # Design tokens & base styles
│       └── motion.css    # Animation system
├── public/
│   └── illustrations/    # Generated illustration assets
├── scripts/
│   ├── generate-illustrations.js  # OpenAI image generator
│   └── illustration-prompts.js    # Prompt templates
├── test/
│   └── validate-data.test.js      # Minimal data & script tests
└── astro.config.mjs
```

## Adding Languages

Edit `src/data/languages.json` to add or modify languages:

```json
{
  "slug": "spanish",
  "name": "Spanish",
  "nativeName": "Español",
  "status": "available",        // or "coming-soon"
  "appStore": "https://...",    // null if coming soon
  "playStore": "https://...",   // null if coming soon
  "wordCount": 100,
  "featured": true              // shows on homepage
}
```

Language detail pages are automatically generated from this data.

## Generating Illustrations

The site includes an AI illustration generation pipeline using OpenAI's gpt-image-1.5 model.

```bash
# Estimate cost (no API calls)
npm run generate-illustrations:dry-run

# Generate all illustrations
npm run generate-illustrations

# Generate specific illustrations
node scripts/generate-illustrations.js --only=apple,ball,cat

# Generate by category
node scripts/generate-illustrations.js --category=animals
```

Requires `OPENAI_API_KEY` in `.env` file.

**Cost estimate**: ~$1-2 for 30 illustrations at medium quality.

## Design System

### Colors

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#FFFBF7` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, elevated surfaces |
| `--color-accent` | `#4A7C59` | Primary actions, links |
| `--color-text` | `#2D2A26` | Headings, body text |
| `--color-text-muted` | `#6B6560` | Secondary text |

### Motion

- **Drift animations**: 15-22s cycles for decorative elements
- **Hover states**: Subtle lift and glow effects
- **Reduced motion**: Fully respects `prefers-reduced-motion`

## Performance Targets

- Lighthouse: 95+ on all metrics
- First Contentful Paint: < 1s
- Total JS: < 10KB (search filter only)
- All images lazy loaded

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- Vanilla CSS - No CSS framework
- Vanilla JS - Minimal client-side code
- OpenAI API - Illustration generation

## License

Proprietary. All rights reserved.
