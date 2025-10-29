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

## License

MIT