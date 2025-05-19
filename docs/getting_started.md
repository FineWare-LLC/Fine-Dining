# Getting Started

This tutorial walks you through setting up **Fine Dining** for local development.

## Requirements
- Node.js 18 or newer
- npm or another Node package manager
- A MongoDB instance (local or Atlas)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/FineWare-LLC/Fine-Dining.fineware.git
   cd Fine-Dining
   ```
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Configure environment variables by creating a `.env.local` file in `frontend/`:
   ```dotenv
   MONGODB_URI=your_mongodb_connection
   JWT_SECRET=your_secret
   GOOGLE_PLACES_API_KEY=
   # Optional custom Overpass endpoint (defaults to the public API if omitted)
   OVERPASS_URL=https://overpass-api.de/api/interpreter
   # Disable GPU acceleration even when USE_GPU is set
   DISABLE_GPU=1
   ```
   Set `USE_GPU=1` to enable OpenCL acceleration if supported. In production you
   can set `DISABLE_GPU=1` to force CPU mode.
4. Seed the database and generate GraphQL types:
   ```bash
   npm run seed
   npm run codegen
   ```

## Running the App
- Development server:
  ```bash
  npm run dev
  ```
  Visit `http://localhost:3000` in your browser.
- Production build:
  ```bash
  npm run build
  npm start
  ```

To verify the solver works you can run a quick optimization test:
```bash
node scripts/test-optimization.mjs
```

See the [User Guide](./user_guide.md) for more details on command-line usage and examples.

## Fetch Local Restaurants

You can quickly query nearby restaurants from the command line using
`fetch-local-restaurants.mjs`:

```bash
node scripts/fetch-local-restaurants.mjs <lat> <lon> [radius] [keyword]
```

The script reads `GOOGLE_PLACES_API_KEY` and the optional `OVERPASS_URL`
from `.env.local`. If the Google key is missing or invalid it falls back to
the Overpass API. Results are printed as JSON.

## Menu Scraping Pipeline

To collect menu data from major chains and produce a processed CSV, run the
pipeline located under `frontend/src/lib/HiGHS`:

```bash
cd frontend/src/lib/HiGHS
npm install
node src/main_pipeline.mjs
```

The pipeline fetches menu items, normalizes them, and writes
`data/processed/restaurant_meals_processed.csv`. Progress messages are printed
to the console. No additional environment variables are required beyond those
defined earlier.
