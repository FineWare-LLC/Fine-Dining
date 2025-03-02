# Fine Dining

Fine Dining is a web and mobile application that provides personalized meal planning, nutritional tracking, and restaurant recommendations. It leverages powerful optimization techniques—such as linear programming with Google OR-Tools—to deliver cost-effective, nutritionally balanced meal plans for both individuals and larger institutions (schools, hospitals, corporate wellness programs, etc.).

> **Note**: This repository is actively maintained. Features and documentation may evolve over time.

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
  Create weekly meal plans based on calories, dietary restrictions (allergies), budget, and other preferences.
- **Nutritional Tracking**  
  Log meals in real-time and track daily/weekly stats (calories, macros, vitamins, etc.).
- **Restaurant Recommendations**  
  Search for nearby restaurants that match your dietary constraints or preferences (powered by external APIs).
- **Automatic Grocery Lists**  
  Generate grocery lists from planned recipes and track ingredient availability.
- **Cost Optimization**  
  Uses linear programming to minimize meal plan expenses while respecting nutritional constraints and user preferences.

---

## Architecture Overview

Fine Dining follows a microservices-like architecture:

1. **Frontend**  
   - Developed with [React.js](https://reactjs.org/) (Web) and [React Native](https://reactnative.dev/) (Mobile).  
   - Consumes RESTful APIs and displays an intuitive UI for meal planning, nutritional stats, and user profiles.

2. **Backend**  
   - Built on [Node.js + Express](https://expressjs.com/) to handle API requests.  
   - Integrates optimization engines (e.g., [Google OR-Tools](https://developers.google.com/optimization)) for cost-effective meal planning.

3. **Database**  
   - Uses [MongoDB](https://www.mongodb.com/) for flexible, document-based storage of user profiles, recipes, and meal plans.

4. **Security**  
   - [Firebase Authentication](https://firebase.google.com/docs/auth) for secure user sign-up and login.  
   - HTTPS/TLS encryption for data in transit.

---

## Tech Stack

| **Layer**            | **Technology**          | **Description**                                              |
|----------------------|-------------------------|--------------------------------------------------------------|
| Frontend (Web)       | React.js               | Component-based UI, SEO-friendly                            |
| Frontend (Mobile)    | React Native           | Cross-platform mobile development                           |
| Backend              | Node.js + Express      | Asynchronous server-side API handling                       |
| Database             | MongoDB                | Flexible, scalable NoSQL data store                         |
| Optimization Engine  | Google OR-Tools        | Provides linear programming capabilities                    |
| Authentication       | Firebase Auth          | Secure user identity management                             |

---

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**
- **MongoDB** (local instance or cloud-based, e.g., MongoDB Atlas)
- **Firebase account** (for Authentication)
- **Google OR-Tools** (optional local setup if you plan to run optimization locally; otherwise, you can use the Node.js package)

### Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/<your-org>/fine-dining.git](https://github.com/FineWare-LLC/Fine-Dining.git
   cd fine-dining
   
2. Install Dependencies

# For the backend
cd backend
npm install

# For the frontend (web)
cd ../frontend
npm install

# For the mobile app
cd ../mobile
npm install

3. Set Up Environment Variables

Create a .env file in the backend/ directory. Include your MongoDB connection string, Firebase credentials, and any other private keys. Example:

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fine-dining
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
Adjust paths and credentials as needed for your setup.

4. Run the Application

Backend

cd backend
npm run dev
Frontend (Web)

cd frontend
npm start
Mobile (React Native)

cd mobile
npm start
# Then use iOS/Android emulator or physical device to run the app

5. Usage
Once the services are running, navigate to the frontend URL (e.g., http://localhost:3000). Create a new account, set your dietary preferences, and start exploring features:

   1. Profile Setup: Enter height, weight, allergies, calorie goals, etc.
   2. Generate Meal Plan: The system will use your preferences (and any budget constraints) to propose a weekly plan.
    3. Track Meals: Log what you’ve eaten to get real-time statistics on calories and macros.
    4. Grocery Lists: Generate a shopping list for the week’s recipes.
    5. Restaurant Search: Look up nearby eateries matching your dietary criteria.

6. Folder Structure

fine-dining/
  ├── backend/
  │   ├── src/
  │   │   ├── controllers/
  │   │   ├── models/
  │   │   ├── routes/
  │   │   ├── utils/
  │   │   └── ...
  │   └── package.json
  │   └── ...
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   ├── pages/
  │   │   ├── services/
  │   │   └── ...
  │   └── package.json
  ├── mobile/
  │   ├── App.js
  │   ├── screens/
  │   ├── components/
  │   └── package.json
  └── README.md

7. Testing
Unit Tests: Jest/Mocha for backend logic.

cd backend
npm test
Integration/End-to-End Tests: Cypress or similar for frontend flows.

cd frontend
npm run test:e2e
Acceptance Tests: High-level end-user scenarios (meal plan creation, grocery list generation, etc.).
Refer to the Unit and Integration Test Plans for detailed procedures.

8. Contact
For questions or support, please open an issue on GitHub.

Happy Cooking and Planning!
The Fine Dining Team
