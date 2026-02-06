# Fine-Dining Project - Folder Structure Description

This document provides a comprehensive overview of what each folder in the Fine-Dining project contains and its purpose within the overall application architecture.

## Project Overview
Fine-Dining is a meal planning application with a React/Next.js frontend, Python optimization backend, and various supporting tools and utilities. The application appears to focus on optimized meal planning using mathematical optimization algorithms.

## Folder Descriptions

### `/backend`
**Purpose**: Contains the server-side optimization API
- **Main File**: `optimization_api.py` (16.7KB) - Python-based API server that likely handles meal optimization algorithms
- **Technology**: Python
- **Function**: Provides optimization services for meal planning, possibly using mathematical optimization libraries

### `/bindings`
**Purpose**: Language bindings and wrappers for external libraries
- **Structure**: Contains a `python/` subdirectory with `highs_model.py`
- **Function**: Provides Python bindings for the HiGHS optimization solver, enabling the application to use advanced mathematical optimization capabilities
- **Integration**: Works with the backend optimization API to solve complex meal planning optimization problems

### `/docs`
**Purpose**: Project documentation
- **Contents**: `getting_started.md` - User and developer documentation
- **Function**: Provides guidance on how to set up, configure, and use the Fine-Dining application

### `/frontend`
**Purpose**: Client-side React/Next.js application
- **Technology Stack**: React, Next.js, Material-UI, Apollo GraphQL, Emotion (CSS-in-JS)
- **Architecture**: 
  - Pages-based routing (Next.js)
  - Component-based UI with Dashboard, Admin, and Planner modules
  - GraphQL integration for API communication
  - Context providers for authentication and theming
- **Key Features**: 
  - Meal planning dashboard
  - User authentication system
  - Admin panel for meal management
  - Interactive meal catalog and planning interface

### `/highs-pipeline`
**Purpose**: Data pipeline and processing tools for the HiGHS optimization system
- **Contents**: 
  - Node.js packages and modules (`package.json`, `node_modules/`)
  - Database seeding and repair tools (`seed_database.mjs`, `database-repair.mjs`)
  - Data processing scripts and utilities
  - Testing utilities for database operations
- **Function**: 
  - Manages data flow between the application and optimization engine
  - Handles database setup, seeding, and maintenance
  - Provides tools for testing and validating optimization data

### `/plugins`
**Purpose**: Plugin system and extensions
- **Contents**: `registry.mjs` - Plugin registry system
- **Function**: Provides a modular architecture for extending application functionality through plugins

### `/scripts`
**Purpose**: Utility and automation scripts
- **Contents**: 
  - `generate-qa-questions.js` - Generates Q&A content for the application
  - `generate_secure_env.js` - Creates secure environment configuration files
- **Function**: Provides development and deployment utilities, automated content generation, and security configuration tools

### `/tests`
**Purpose**: Comprehensive test suite
- **Test Coverage**:
  - API completeness testing (`test-api-completeness.js`)
  - HiGHS optimization integration testing (`test_highs_integration.py`)
  - User authentication and registration testing (`test_registration_login.js`)
  - Feature-specific tests (home meals, superstore system, user interface)
  - Behavior testing (current vs improved implementations)
- **Technologies**: JavaScript (Jest/Node.js) and Python testing frameworks
- **Function**: Ensures application reliability, feature completeness, and integration between different system components

## Architecture Summary

The Fine-Dining project follows a modern full-stack architecture:

1. **Frontend**: React/Next.js application with GraphQL integration
2. **Backend**: Python-based optimization API using HiGHS solver
3. **Data Pipeline**: Node.js-based tools for data management and processing
4. **Testing**: Comprehensive test coverage across all components
5. **Documentation**: Project setup and usage guides
6. **Utilities**: Development scripts and plugin system

The application appears to be designed for optimized meal planning, leveraging mathematical optimization algorithms to help users plan meals efficiently while considering various constraints and preferences.