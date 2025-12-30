# Flatmates

## Overview
Flatmates is a full‑stack web application that helps users find and share roommate listings. It includes features such as user authentication, property listings with image uploads (AWS S3), real‑time messaging, interactive map integration, advanced search filters, and a modern UI built with React, Redux and TypeScript.

## Features
- **Authentication**: Secure login, registration, password reset with JWT.
- **Property Listings**: Create, edit, delete listings; image uploads via AWS S3.
- **Messaging**: Real‑time chat between interested users.
- **Map Integration & Search**: Interactive map with clustering and extensive filters.
- **UI/UX Enhancements**: Glassmorphism header, dark mode, responsive design, accessibility improvements.
- **Deployment**: Dockerized setup for local development and production on AWS.

## Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker & Docker Compose
- AWS credentials for S3 (see `.env.example`)

## Getting Started
1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/Flatmates.git
   cd Flatmates
   ```
2. **Install dependencies**
   ```bash
   npm install   # or yarn install
   ```
3. **Configure environment**
   ```bash
   cp .env.example .env
   # edit .env with your values
   ```
4. **Run the development environment**
   ```bash
   npm run dev   # starts frontend and backend via Docker Compose
   ```
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## Building for Production
```bash
npm run build               # builds React frontend
docker-compose -f docker-compose.prod.yml up -d   # start production containers
```

## Testing
- Unit / integration tests:
  ```bash
  npm test
  ```
- End‑to‑end tests (Cypress):
  ```bash
  npm run e2e
  ```

## Contributing
Please follow the code style guidelines (`.eslintrc`) and run `npm run lint` before committing. Open issues or submit pull requests for improvements.

## License
MIT License.
