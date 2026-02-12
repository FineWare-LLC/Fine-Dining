# Fine Dining

## Overview
**Fine Dining** leverages advanced algorithms to address the challenges of meal planning, combining cost optimization with personalized dietary requirements. The system integrates nutritional data, user-specific dietary restrictions, and budget constraints to provide tailored meal plans that are cost-effective and nutritionally balanced. It dynamically adjusts its recommendations based on each user’s individual budget, ensuring affordability without sacrificing nutritional goals. Fine Dining is designed to be accessible and easy to use for individuals and scalable for organizations like schools, hospitals, and corporations. The application also allows users to incorporate flexible dietary preferences such as allergen filtering and cheat-day tracking.

**Homepage:** [https://fine-dining.fineware.tech](https://fine-dining.fineware.tech)
**Planning Documents:** [Google Drive Folder](https://drive.google.com/drive/folders/1t1SxHa2YT07hpVdvWlDYXtR0oEftb9Sp?usp=drive_link)

## Project Background
Human diet planning is complex and costly, and current applications often lack simultaneous cost and nutrition optimization using advanced algorithms. This project applies advanced algorithms for cost and nutrient optimization to human meal planning, taking into account both dietary needs and budgetary limits. Fine Dining emphasizes ethical resource use, aiming for universally accessible, healthy, and affordable meals.

## Key Features
* Personalized meal planning based on dietary needs and budget.
* Nutritional Tracking: Log meals and monitor calories, macros, vitamins.
* Cost optimization using advanced algorithms (HiGHS solver addon).
* Integration of nutritional data.
* Dynamic adjustment of recommendations.
* Allergen filtering.
* Cheat-day tracking.
* Restaurant Recommendations (powered by external APIs).
* Automatic Grocery List Generation.
* Scalable for individual and organizational use.

## Implementation Details

### Architecture & Design
* **Presentation Layer**: Next.js (v15.3.2) & React (v19.1.0) with a modular directory structure (`pages/`, `components/`, `lib/`). Apollo Client handles GraphQL queries; Zustand manages local state. Routing follows the sitemap: Home → Login/Registration → Dashboard → Meal Plan Creation → Preferences → Reports & Analytics → Settings → Help. MUI (Material UI) and Emotion are used for UI components and styling, along with Tailwind CSS.
* **Business Logic Layer**: Next.js API routes powered by Apollo Server for GraphQL mutations/queries. A dedicated optimization module uses the HiGHS solver addon (`highs-addon`) to run cost & nutrition planning—flowing: Input → Validation → Data Fetch → Solver → Plan Generation → Output.
* **Data Layer**: MongoDB Atlas stores food items, user credentials, preferences, and generated meal plans using Mongoose as the ODM. External integrations pull in nutrition metrics and grocery pricing for accurate solver inputs. Authentication is handled using JWT (jsonwebtoken) and bcrypt for password hashing.
* **Deployment & Infrastructure**: All services hosted on AWS EC2 instances behind an Application Load Balancer for scalability. Data encrypted in transit (TLS/SSL), OAuth/JWT for secure user authentication, and MongoDB Atlas providing cloud-based, high-availability storage.
* **Dev & CI/CD**: Key npm scripts (in `frontend/package.json`): `npm run dev` (Next.js dev server), `npm run build` & `npm start` (production), `npm run seed` (populate HiGHS test data), `npm run codegen` (GraphQL types), `npm run test:playwright` (end-to-end tests), and `npm run test:components` (component tests). ESLint is used for linting and GraphQL Code Generator for type generation.
* **Security Headers**: A strict Content Security Policy is defined in `next.config.js`. `'unsafe-inline'` is only enabled during development, keeping production deployments locked down.

### Diagrams
The project includes the following diagrams for better understanding:
* **Logical Solution Design**: This mind-map shows the Logical Solution Design of Fine Dining, breaking down the Presentation Layer (UI, Dashboard), Business Logic Layer (API Endpoints, LP Module, Authentication), and Data Layer (MongoDB storage and external integrations).
* **Sitemap**: The sitemap outlines the main user flow: Home → Login/Registration → Dashboard → Meal Plan Creation → Preferences → Reports & Analytics → Settings → Help, with key sub-pages for each stage.
* **Process Flowchart**: This flowchart depicts the runtime sequence: Start → Collect Inputs → Input Validation → Data Fetching → Linear Programming Solver → Plan Generation → Output delivery.

*(Note: The actual image files for these diagrams (`Logical.png`, `Sitemap.png`, `Process.png`) should be present in the repository, typically in a `public` or `assets` folder to be rendered correctly if this README is viewed on a platform like GitHub.)*

### Prototypes
* **Web Design:** [View Fine Dining Web Prototype](https://www.canva.com/design/DAGb9hD06yg/LQo6YS0kU5UxmEU7uu1kmQ/watch?utm_content=DAGb9hD06yg)
* **Mobile Design:** [View Fine Dining Mobile Prototype](https://www.canva.com/design/DAGb9gj3T0A/aLKr0KFmlWvbGTcCdOq7QQ/watch?utm_content=DAGb9gj3T0A)

### Code Snippets
The application includes various code implementations, such as:
* Dynamic Restaurant Recommendations (React)
* Meal Catalog Search + Filter (GraphQL & JavaScript)

*(Refer to the `frontend/src/` directory for code examples, particularly within `components/` and `pages/`.)*

## Technologies Used
* **Framework**: Next.js (v15.3.2)
* **UI Library**: React (v19.1.0)
* **Component Library**: Material UI (MUI)
* **Styling**: Emotion, Tailwind CSS
* **API Layer**: GraphQL
* **API Server**: Apollo Server (integrated with Next.js API routes)
* **GraphQL Client**: Apollo Client
* **State Management (Client)**: Zustand
* **Database**: MongoDB Atlas
* **ODM**: Mongoose
* **Optimization Solver**: HiGHS solver addon (`highs-addon`)
* **GPU Acceleration**: Optional OpenCL backend for matrix operations (build with `npm run build:gpu`)
* **Testing**: Playwright (End-to-end & Component Testing)
* **Linting**: ESLint
* **Type Generation**: GraphQL Code Generator
* **Authentication**: JWT (jsonwebtoken), bcrypt
* **Deployment**: AWS (EC2, Application Load Balancer)

## Running Fine Dining (Frontend)

**Prerequisites:**
* Node.js (>=18.18.0 based on `frontend/package.json`) and npm (or Yarn/pnpm/bun).
* MongoDB instance (local or cloud, e.g., MongoDB Atlas) with a valid connection URI.
* Encryption at rest is required. Atlas clusters encrypt storage and backups automatically. For local MongoDB, start `mongod` with `--enableEncryption` or use an encrypted volume. See [docs/encryption.md](docs/encryption.md).
* Environment variables provided via a `.env.local` file in the `frontend` directory (see `frontend/.env.example` for the list of variables such as `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_PLACES_API_KEY`, `OVERPASS_URL`). The app uses Google Places when a valid key is supplied and falls back to Overpass otherwise.

**Setup & Installation (Frontend):**
1.  Clone the repository: `git clone https://github.com/FineWare-LLC/Fine-Dining.fineware.git`
2.  Navigate to the frontend project directory: `cd Fine-Dining.fineware/frontend`
3.  Install dependencies: `npm install`
4.  Seed the database: `npm run seed`
5.  Generate GraphQL types: `npm run codegen`

### Environment Variables

Start by copying `frontend/.env.example` to `frontend/.env.local` and fill in the values for your environment. `OVERPASS_URL` is optional and defaults to the public Overpass endpoint if omitted:

```dotenv
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_very_strong_and_secret_key_here
GOOGLE_PLACES_API_KEY=
# Optional custom Overpass endpoint used when Google Places fails
OVERPASS_URL=https://overpass-api.de/api/interpreter
```

### Overpass API Example

If you want to test restaurant lookups without Google Places, use the demo script
located in `frontend/scripts/overpass-demo.mjs`:

```bash
node scripts/overpass-demo.mjs <latitude> <longitude> [radius] [keyword]
```

Example (search for pizza within 1.5 km of New York City):

```bash
node scripts/overpass-demo.mjs 40.7128 -74.0060 1500 pizza
```

The script uses `OVERPASS_URL` if provided in `.env.local` but falls back to the
standard endpoint `https://overpass-api.de/api/interpreter` when no `.env`
file is present, printing the resulting restaurant list as JSON.

**Development (Frontend):**
* Run the Next.js development server: `npm run dev`
* Access at `http://localhost:3000` (or as specified by Next.js).

**Production Build (Frontend):**
* Build the application: `npm run build`
* Start the production server: `npm start`

**Testing (Frontend):**
* End-to-end & component tests: `npm run test:playwright`
* Component tests only: `npm run test:components`
* Unit tests via Node's test runner: `npm test` (see [docs/node_testing_setup.md](docs/node_testing_setup.md))
* If MongoDB is not installed locally start `npm run dev:memory` in another terminal before running Playwright tests.
* For detailed component testing guidance, refer to `frontend/docs/testing/component-testing.md`.

## Documentation
* [Branching Strategy](docs/branching_guidelines.md)
* [Getting Started](docs/getting_started.md)
* [User Guide](docs/user_guide.md)
* [Troubleshooting](docs/troubleshooting.md)
* [Encryption Guide](docs/encryption.md)

## Available Scripts (Frontend - from `package.json`)
* `npm run dev`: Starts the Next.js development server.
* `npm run dev:memory`: Starts the dev server with an in-memory MongoDB for testing.
* `npm run build`: Builds the Next.js application for production.
* `npm run build:gpu`: Builds the application with GPU support.
* `npm start`: Starts the Next.js production server.
* `npm run lint`: Lints the codebase using Next.js's ESLint configuration.
* `npm run test:playwright`: Runs Playwright end-to-end tests.
* `npm run test:components`: Runs Playwright component tests.
* `npm run seed`: Populates the database with sample data using `highs-pipeline/seed_with_polyfill.mjs`.
* `npm run codegen`: Generates GraphQL types from your schema (`codegen.yml`).
* `npm run benchmark:gpu`: Runs a matrix multiplication benchmark using the GPU module.

## License
This project is currently not licensed under an open-source license.
© 2025 FineWare LLC. All rights reserved.

## Contact
FineWare LLC

For security issues or vulnerability reports, please see [SECURITY.md](SECURITY.md) or email [cybyl.fine@fineware.tech](mailto:cybyl.fine@fineware.tech).
