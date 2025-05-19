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
   ```
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
