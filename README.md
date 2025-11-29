# Flatmates Website

A platform that connects people looking for flatmates or properties to rent. The website allows users to sign up or log in using their Google, Facebook, or Instagram accounts and caters to four distinct user types with specific functionalities.

## User Types

1. **Users searching for a room in a preoccupied flat**
2. **Users looking for roommates to find a flat together**
3. **Users willing to rent out a preoccupied flat**
4. **Users willing to rent out the whole property**

## Features

- Social login (Google, Facebook, Instagram)
- User profiles based on user type
- Property listings and requirements posting
- Real-time messaging system between users
- Message notifications
- Conversation management
- Property sharing through messages
- Search and filter functionality
- Responsive design for all devices

## Tech Stack

### Frontend

- React.js
- Redux for state management
- Material-UI for components
- Axios for API requests

### Backend

- Node.js with Express
- MongoDB for database
- Passport.js for authentication
- Socket.io for real-time messaging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Set up environment variables (see .env.example files)
5. Start the development servers:
   - Backend: `npm run dev` in the backend directory
   - Frontend: `npm start` in the frontend directory

## Project Structure

```
flatmates/
├── backend/              # Backend server code
│   ├── config/           # Configuration files
│   ├── controllers/      # Request controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── frontend/             # Frontend React application
│   ├── public/           # Static files
│   └── src/              # Source files
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── redux/        # Redux store and slices
│       ├── services/     # API services
│       ├── utils/        # Utility functions
│       └── App.js        # Main component
└── README.md             # Project documentation
```

## Testing with TestSprite

This project is configured for automated testing with TestSprite, an AI-powered autonomous testing tool.

### Quick Start

1. **Start the application** (both frontend and backend must be running):

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. **Create test accounts** in your database (see `TESTSprite_SETUP.md` for details)

3. **Run TestSprite**:

   - **Web Portal**: Go to TestSprite Dashboard and create a new test
   - **IDE Integration**: In Cursor, ask: "Can you test this project with TestSprite?"

4. **Configure TestSprite**:
   - Frontend URL: `http://localhost:3000`
   - Backend URL: `http://localhost:5000/api`
   - Upload `TEST_REQUIREMENTS.md` as your PRD
   - Use `testsprite.config.json` for configuration

### TestSprite Files

- `testsprite.config.json` - TestSprite configuration file
- `TEST_REQUIREMENTS.md` - Comprehensive test requirements and scenarios
- `TESTSprite_SETUP.md` - Detailed setup and troubleshooting guide

### Test Coverage

TestSprite will test:

- ✅ Authentication & User Management
- ✅ Property Management (CRUD operations)
- ✅ Real-time Messaging System
- ✅ Navigation & Routing
- ✅ UI/UX & Responsive Design
- ✅ API Endpoints
- ✅ Security & Error Handling

For detailed setup instructions, see [TESTSprite_SETUP.md](./TESTSprite_SETUP.md)

## License

MIT
