planning docs:
https://drive.google.com/drive/folders/1t1SxHa2YT07hpVdvWlDYXtR0oEftb9Sp?usp=drive_link

designs:
 https://www.canva.com/design/DAGb9hD06yg/OBGfzJ5Tc3A1LDYlEH0Msw/view?mode=prototype
 https://www.canva.com/design/DAGb9gj3T0A/gShpCjKK3pJla-BF_2VNvw/view?mode=prototype

# Fine Dining

> **Elevate your mealtime experience with personalized planning, cost-efficient optimization, and real-time nutritional tracking.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Coverage](https://img.shields.io/badge/coverage-90%25-yellowgreen)](#)

Fine Dining is a web application offering:
- **Personalized Meal Planning**
- **Nutritional Tracking**
- **Restaurant Recommendations**
- **Grocery List Generation**
- **Cost Optimization** (*Note: Google OR-Tools integration planned*)

> **Note**: This repository is in active development. Features and documentation will evolve over time.

---

## Table of Contents
1. [Key Features](#key-features)  
2. [Architecture Overview](#architecture-overview)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
    - [Prerequisites](#prerequisites)  
    - [Installation](#installation)  
5. [Usage](#usage)  
6. [Folder Structure](#folder-structure)  
7. [Testing](#testing)  
8. [Contact](#contact)  

---

## Key Features

- **Personalized Meal Plans**  
  Weekly meal plans based on calories, allergies, budget, and other preferences.
- **Nutritional Tracking**  
  Log meals in real-time and monitor calories, macros, vitamins, and more.
- **Restaurant Recommendations**  
  Find nearby restaurants that satisfy your dietary constraints (powered by external APIs).
- **Automatic Grocery Lists**  
  Automatically compile ingredients from planned recipes.
- **Cost Optimization**  
  Use linear programming to minimize meal-plan expenses while honoring nutritional and user-defined constraints.

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
    * *Note: Firebase Auth mentioned in the Tech Stack below refers to the overall project plan, but is not currently implemented in this specific `frontend` codebase.*

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


The main application lives in the **frontend** directory.

1. Change into the folder:
   ```bash
   cd frontend
   ```
2. See [frontend/README.md](frontend/README.md) for detailed setup and usage instructions.

