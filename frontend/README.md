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
    * Connects directly to [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/) for storing user profiles, recipes, meal plans, etc. [cite: frontend/dbConnect.js, frontend/src/lib/dbConnect.js, frontend/package.json]

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

### Environment Variables

Create a `.env.local` file in the `frontend` directory. Add your MongoDB connection string and a secure JWT secret:

```dotenv
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_very_strong_and_secret_key_here