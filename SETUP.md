# Fine Dining - Project Setup Guide

This guide provides step-by-step instructions to set up and run the Fine Dining project in any environment.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (>=18.18.0)
- npm (or Yarn/pnpm/bun)
- MongoDB instance (local or cloud, e.g., MongoDB Atlas) with a valid connection URI
  - Alternatively, you can use Docker to run MongoDB (see Docker Setup section below)

## Docker Setup

If you prefer using Docker for MongoDB, follow these steps:

### Installing Docker

#### For macOS:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker using Homebrew
brew install --cask docker

# Start Docker Desktop
open /Applications/Docker.app
```

#### For Ubuntu/Debian:
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package index again
sudo apt-get update

# Install Docker CE
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add your user to the docker group to run Docker without sudo
sudo usermod -aG docker $USER

# Apply the new group (you may need to log out and back in)
newgrp docker
```

#### For CentOS/RHEL:
```bash
# Install required packages
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker CE
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply the new group (you may need to log out and back in)
newgrp docker
```

### Running MongoDB with Docker

Once Docker is installed, you can run MongoDB in a container:

```bash
# Create a directory for MongoDB data
mkdir -p ~/mongodb/data

# Run MongoDB container (without authentication for development)
docker run -d \
  --name fine-dining-mongo \
  -p 27017:27017 \
  -v ~/mongodb/data:/data/db \
  mongo:latest

# Verify MongoDB is running
docker ps
```

With this setup, you can use the following connection string in your `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/fine-dining
```

**Note**: This setup runs MongoDB without authentication, which is suitable for development. For production environments, you should enable authentication by adding the following environment variables to the docker run command:
```bash
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=password \
```
And use the authenticated connection string:
```
MONGODB_URI=mongodb://admin:password@localhost:27017/fine-dining?authSource=admin
```

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/FineWare-LLC/Fine-Dining.fineware.git
   cd Fine-Dining.fineware
   ```

2. Set up environment variables:
   - Create a `.env.local` file in the `frontend` directory with the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_very_strong_and_secret_key_here
     MONGO_ENCRYPTION_KEY=your_encryption_key
     MONGO_ENCRYPTION_SIGNING_KEY=your_signing_key
     GOOGLE_PLACES_API_KEY=
     OVERPASS_URL=https://overpass-api.de/api/interpreter
     ```
   - You can generate encryption keys with:
     ```bash
     openssl rand -hex 32  # encryption key
     openssl rand -hex 64  # signing key
     ```

## Spin-Up Script

Run the following commands in order to set up and start the Fine Dining project:

```bash
# Navigate to the frontend directory
cd frontend/

# Install dependencies
npm install

# Seed the database with sample data
npm run seed

# Generate GraphQL types from schema
npm run codegen

# Start the development server
npm run dev

# In a separate terminal, run tests (optional)
# cd frontend/
# npm run test:playwright
```

## What Each Command Does

1. `cd frontend/` - Navigates to the frontend directory where the application code resides.
2. `npm install` - Installs all dependencies defined in package.json.
3. `npm run seed` - Populates the database with sample data using the script at `src/lib/HiGHS/seed_database.mjs`.
4. `npm run codegen` - Generates TypeScript types from GraphQL schema defined in `codegen.yml`.
5. `npm run dev` - Starts the Next.js development server, making the application accessible at http://localhost:3000.
6. `npm run test:playwright` - Runs end-to-end tests using Playwright (optional, run in a separate terminal).

## Accessing the Application

Once the development server is running, you can access the application at:
- http://localhost:3000

## Troubleshooting

If you encounter any issues during setup:

1. Ensure MongoDB is running and accessible with the URI provided in `.env.local`.
   - If using Docker, check if the MongoDB container is running with `docker ps`.
   - If the container is not running, start it with `docker start fine-dining-mongo`.
   - To view MongoDB logs: `docker logs fine-dining-mongo`.
2. Check that all required environment variables are properly set.
3. Make sure you're using a compatible Node.js version (>=18.18.0).
4. If you encounter dependency issues, try deleting the `node_modules` folder and running `npm install` again.
5. Docker-specific issues:
   - If Docker commands require sudo, you may need to log out and log back in after adding your user to the docker group.
   - If the MongoDB container fails to start, try removing it with `docker rm fine-dining-mongo` and then run the container creation command again.
   - To reset MongoDB data, stop the container, remove the data directory (`rm -rf ~/mongodb/data`), recreate the directory, and start the container again.
6. For more detailed troubleshooting, refer to the [Troubleshooting Guide](docs/troubleshooting.md).
