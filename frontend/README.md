# Fine Dining - Frontend

> **Elevate your mealtime experience with personalized planning, cost-efficient optimization, and real-time nutritional tracking.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Coverage](https://img.shields.io/badge/coverage-pending-yellow)](#) Fine Dining is a web application offering:
- **Personalized Meal Planning**
- **Nutritional Tracking**
- **Restaurant Recommendations**
- **Grocery List Generation**
- **Cost Optimization** (*Note: Google OR-Tools integration planned*)

> **Note**: This repository contains the frontend portion and is in active development. Features and documentation will evolve over time.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Planning & Design](#planning--design)
3. [Architecture Overview (Frontend)](#architecture-overview-frontend)
4. [Tech Stack (Frontend)](#tech-stack-frontend)
5. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running the Application](#running-the-application)
6. [Usage](#usage)
7. [Folder Structure (Frontend)](#folder-structure-frontend)
8. [Available Scripts](#available-scripts)
9. [Testing](#testing)
    - [End-to-End Testing](#end-to-end-testing)
    - [Component Testing](#component-testing)
    - [Component Testing Guide](./docs/testing/component-testing.md)
10. [Contact](#contact)

---

## Key Features

- **Personalized Meal Plans**
  Weekly meal plans based on calories, allergies, budget, and other preferences.
- **Nutritional Tracking**
  Log meals in real-time and monitor calories, macros, vitamins, and more.
- **Restaurant Recommendations**
  Find nearby restaurants that satisfy your dietary constraints (powered by external APIs - *integration pending*).
- **Automatic Grocery Lists**
  Automatically compile ingredients from planned recipes.
- **Cost Optimization**
  Use linear programming (*planned integration*) to minimize meal-plan expenses while honoring nutritional and user-defined constraints.

---

## Planning & Design

* **Planning Documents:** [Google Drive Folder](https://drive.google.com/drive/folders/1t1SxHa2YT07hpVdvWlDYXtR0oEftb9Sp?usp=drive_link)
* **Design Prototypes:**
    * [Canva Design 1](https://www.canva.com/design/DAGb9hD06yg/OBGfzJ5Tc3A1LDYlEH0Msw/view?mode=prototype)
    * [Canva Design 2](https://www.canva.com/design/DAGb9gj3T0A/gShpCjKK3pJla-BF_2VNvw/view?mode=prototype)

---

## Architecture Overview (Frontend)

This repository contains the **Frontend** of the Fine Dining application:

1.  **Web Application**
    * Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/). [cite: frontend/package.json]
    * Provides a user-friendly interface for meal planning, nutritional stats, etc.
    * Includes an integrated GraphQL API endpoint built using Apollo Server within Next.js API routes. [cite: frontend/src/pages/api/graphql.js, frontend/package.json]

2.  **Data Layer**
    * Connects directly to [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/) for storing user profiles, recipes, meal plans, etc. [cite: frontend/src/lib/dbConnect.js, frontend/package.json]

3.  **Security**
    * Uses JWT for session management via the GraphQL API. [cite: frontend/src/graphql/resolvers/mutations.js]
    * *Note: Firebase Auth mentioned in previous README versions refers to the overall project plan, but is not currently implemented in this specific `frontend` codebase.*

---

## Tech Stack (Frontend)

*(Based on the analyzed `frontend` codebase)*

| **Category** | **Technology** | **Description** | **Source File(s)** |
|--------------|----------------|-----------------|-------------------|
| Framework | Next.js (v15+) | React framework for web applications. | `frontend/package.json` |
| UI Library | React (v19+) | Core library for building user interfaces. | `frontend/package.json` |
| Component Lib | Material UI (MUI) | UI components and theming. | `frontend/package.json`, `frontend/src/pages/_app.js` |
| Styling | Emotion | CSS-in-JS library used by MUI. | `frontend/package.json`, `frontend/src/pages/_app.js` |
| Styling | Tailwind CSS | Utility-first CSS framework. | `frontend/package.json`, `frontend/tailwind.config.js`, `frontend/src/styles/globals.css` |
| API Layer | GraphQL | Query language for APIs. | `frontend/src/graphql/typeDefs.js` |
| API Server | Apollo Server (integrated) | GraphQL server running within Next.js API routes. | `frontend/package.json`, `frontend/src/pages/api/graphql.js` |
| GraphQL Client | Apollo Client | State management and client for GraphQL. | `frontend/package.json`, `frontend/src/pages/_app.js` |
| Database ODM | Mongoose | MongoDB object modeling. | `frontend/package.json`, `frontend/src/models/` |
| Database Driver | MongoDB Node.js Driver | Underlying driver used by Mongoose. | `frontend/package.json` (via Mongoose) |
| Testing | Playwright | End-to-end and component testing. | `frontend/package.json`, `frontend/playwright.config.js`, `frontend/src/tests/` |
| Linting | ESLint | Code linting. | `frontend/package.json`, `frontend/eslint.config.mjs` |
| Type Generation | GraphQL Code Generator | Generates types from GraphQL schema. | `frontend/package.json`, `frontend/codegen.yml` |
| Authentication | JWT (jsonwebtoken) | Token generation/verification (via API). | `frontend/package.json`, `frontend/src/graphql/resolvers/mutations.js` |
| Password Hashing | bcrypt | Library for hashing user passwords. | `frontend/package.json`, `frontend/src/graphql/resolvers/mutations.js` |

---

## Getting Started

### Prerequisites

- **Node.js** (>=18.18.0 - based on `package.json`). [cite: frontend/package.json]
- **npm** or **yarn** / **pnpm** / **bun**.
- **MongoDB** (local or cloud, e.g., MongoDB Atlas).

### Installation

1.  **Navigate** to the `frontend` directory of the project.
    ```bash
    cd path/to/Fine-Dining/frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Generate GraphQL Types**

    After installing dependencies, run the GraphQL code generator to create TypeScript types:

    ```bash
    npm run codegen
    ```

### Environment Variables

Create a `.env.local` file in the `frontend` directory. Add your MongoDB connection string and a secure JWT secret:

```dotenv
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_very_strong_and_secret_key_here
MONGO_ENCRYPTION_KEY=32_byte_hex_key
MONGO_ENCRYPTION_SIGNING_KEY=64_byte_hex_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
# Optional custom Overpass endpoint used when Google Places fails
# Defaults to https://overpass-api.de/api/interpreter when omitted
OVERPASS_URL=https://overpass-api.de/api/interpreter
# Optional CloudWatch settings for centralized logging
AWS_REGION=
CLOUDWATCH_LOG_GROUP=
CLOUDWATCH_LOG_STREAM=
```

`MONGO_ENCRYPTION_KEY` must be 32 bytes and `MONGO_ENCRYPTION_SIGNING_KEY` must be 64 bytes. Generate them using `openssl rand -hex 32` and `openssl rand -hex 64`.

If `GOOGLE_PLACES_API_KEY` is missing or a request fails, the service falls back to OpenStreetMap Overpass. Results may be less complete and lack ratings. If no `.env.local` file is present, the default Overpass endpoint is used automatically.

### Fetch Local Restaurants

Use the helper script to retrieve nearby restaurants from the command line:

```bash
node scripts/fetch-local-restaurants.mjs <lat> <lon> [radius] [keyword]
```

`GOOGLE_PLACES_API_KEY` and the optional `OVERPASS_URL` are read from your
`.env.local`. Results are printed as JSON.

### Menu Scraping Pipeline

The scraping pipeline under `src/lib/HiGHS` collects menu data and outputs a
CSV file:

```bash
cd src/lib/HiGHS
npm install
node src/main_pipeline.mjs
```

On completion you will find `data/processed/restaurant_meals_processed.csv` in
the same directory.

## Testing

The project uses Playwright for both end-to-end and component testing.

### End-to-End Testing

End-to-end tests are configured in `playwright.config.js` and can be run with:

```bash
npm run test:playwright
```
This command automatically installs Playwright browsers if they haven't been installed.

### Component Testing

Component tests allow you to test React components in isolation. The setup includes:

1. **Configuration**: `playwright-ct.config.js` in the project root
2. **Test Fixtures**: `playwright/index.js` for setting up the component testing environment
3. **Component Tests**: Located in `src/tests/components/`

To run component tests:

```bash
npm run test:components
```

#### Writing Component Tests

Component tests use the `@playwright/experimental-ct-react` package. Here's a basic example:

```javascript
import { test, expect } from '@playwright/experimental-ct-react';
import YourComponent from '../../components/YourComponent';

test.describe('YourComponent', () => {
  test('renders correctly', async ({ mount }) => {
    const component = await mount(<YourComponent prop="value" />);
    await expect(component).toContainText('Expected text');
  });
});
```

For more robust error handling, use the `mountWithGuard` utility:

```javascript
import { test, expect } from '@playwright/experimental-ct-react';
import { mountWithGuard } from '../utils/mountWithGuard';
import YourComponent from '../../components/YourComponent';

test('renders correctly', async ({ mount, page }) => {
  const component = await mountWithGuard(page, mount, <YourComponent prop="value" />);
  await expect(component).toContainText('Expected text');
});
```

For detailed information on component testing setup, common pitfalls, and debugging tips, see our [Component Testing Guide](./docs/testing/component-testing.md).

### Known Issues and Workarounds

#### Deprecated Packages

The project has dependencies on some packages that are marked as deprecated:

- **npmlog**: Used by cmake-js, which is an optional dependency of highs-addon
- **are-we-there-yet**: A dependency of npmlog
- **gauge**: A dependency of npmlog

These packages are marked as "no longer supported" but don't have direct replacements. Since they're dependencies of other packages in the ecosystem, we can't completely remove them. To minimize potential issues, we've added overrides in package.json to use older, more stable versions of these packages:

```
{
  "overrides": {
    "npmlog": "4.1.2",
    "are-we-there-yet": "1.1.5",
    "gauge": "2.7.4"
  }
}
```

You may still see deprecation warnings when running npm commands, but these can be safely ignored as they don't affect the functionality of the application.
