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

Fine Dining is a web and mobile application offering:
- **Personalized Meal Planning**
- **Nutritional Tracking**
- **Restaurant Recommendations**
- **Grocery List Generation**
- **Cost Optimization** via Linear Programming (Google OR-Tools)

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

## Architecture Overview

Fine Dining uses a microservices-like structure:

1. **Frontend**  
   - Built with [React.js](https://reactjs.org/) (Web) and [React Native](https://reactnative.dev/) (Mobile).  
   - Consumes RESTful APIs; provides a user-friendly interface for meal planning, nutritional stats, etc.

2. **Backend**  
   - Powered by [Node.js + Express](https://expressjs.com/).  
   - Integrates [Google OR-Tools](https://developers.google.com/optimization) for optimization tasks.

3. **Database**  
   - [MongoDB](https://www.mongodb.com/) for storing user profiles, recipes, and meal plans in a flexible document format.

4. **Security**  
   - [Firebase Auth](https://firebase.google.com/docs/auth) for secure user sign-up and login.  
   - HTTPS/TLS encryption for data in transit.

---

## Tech Stack

| **Layer**            | **Technology**         | **Description**                                             |
|----------------------|------------------------|-------------------------------------------------------------|
| Frontend (Web)       | React.js               | Component-based UI                                          |
| Frontend (Mobile)    | React Native           | Cross-platform mobile framework                             |
| Backend              | Node.js + Express      | Asynchronous server-side API                                |
| Database             | MongoDB                | Flexible NoSQL data store                                   |
| Optimization Engine  | Google OR-Tools        | Linear programming capabilities                              |
| Authentication       | Firebase Auth          | Secure, scalable user identity management                   |

---

## Getting Started

### Prerequisites

- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (local or cloud, e.g., MongoDB Atlas)
- **Firebase** (for Authentication)
- **Google OR-Tools** (optional local install if you prefer running optimization locally; otherwise, use the Node.js package)

### Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/FineWare-LLC/Fine-Dining.git
   cd Fine-Dining
   
2. Install Dependencies

## Backend
cd backend
npm install

## Frontend (Web)
cd ../frontend
npm install

## Mobile
cd ../mobile
npm install

3. Set Up Environment Variables
In backend/.env, add your credentials and keys:

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fine-dining
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
Adjust paths and credentials as necessary.

4. Run the Application

## Backend
cd backend
npm run dev

## Frontend (Web)
cd ../frontend
npm start

## Mobile (React Native)
cd ../mobile
npm start
## Then run on an emulator or physical device
Usage
Once the services are running, visit the frontend (e.g., http://localhost:3000) and:

Sign Up / Log In: Use Firebase Auth for secure access.
Profile Setup: Enter dietary preferences, calorie goals, and budget constraints.
Generate Meal Plans: Get weekly suggestions based on your parameters.
Log Meals: Track daily intake and view real-time nutrition stats.
Auto Grocery Lists: Generate shopping lists for planned recipes.
Restaurant Search: Find nearby eateries that meet your dietary needs.
Folder Structure

fine-dining/
  ├── backend/
  │   ├── src/
  │   │   ├── controllers/
  │   │   ├── models/
  │   │   ├── routes/
  │   │   ├── utils/
  │   │   └── ...
  │   ├── package.json
  │   └── ...
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   ├── pages/
  │   │   ├── services/
  │   │   └── ...
  │   ├── package.json
  │   └── ...
  ├── mobile/
  │   ├── App.js
  │   ├── screens/
  │   ├── components/
  │   └── package.json
  └── README.md
Testing
Unit Tests: Use Jest or Mocha for backend logic.

cd backend
npm test
Integration / E2E Tests: Use Cypress or similar tools in the frontend.

cd frontend
npm run test:e2e
Acceptance Tests: Validate end-user scenarios (meal plan creation, grocery lists, etc.).

Refer to the testing documentation for detailed procedures.

Contact
For questions, issues, or support, please open an issue on GitHub.

Happy Cooking and Planning!
The Fine Dining Team
