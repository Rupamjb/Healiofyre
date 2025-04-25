<<<<<<< HEAD
# Healiofy
=======
# Healiofy - Healthcare at Your Fingertips

Healiofy is a modern healthcare platform designed to bridge the gap between patients and their healthcare information. This repository contains both the frontend application and backend server.

## Features

- **Prescription Analysis**: AI-powered analysis of prescriptions 
- **Doctor Directory**: Find and connect with healthcare providers
- **Appointment Booking**: Schedule appointments with doctors
- **AI Health Assistant**: Get answers to your health questions
- **Secure Authentication**: JWT-based protection for your health data

## Project Structure

- `heal/` - Frontend React application 
- `server/` - Backend Node.js/Express server

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (optional, in-memory database is used as fallback)

### Frontend Setup

```bash
# Navigate to frontend directory
cd heal

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend should be accessible at http://localhost:8080 (or another port if 8080 is in use).

### Backend Setup

```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend server will run on http://localhost:5000.

### Environment Variables

#### Frontend (.env file in heal/ directory)
```
VITE_API_URL=http://localhost:5000/api
```

#### Backend (.env file in server/ directory)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/healiofy
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
```

## Development Notes

- The backend includes a fallback to in-memory MongoDB if a connection to a real MongoDB instance fails.
- Test user credentials: email: `testuser@example.com`, password: `test1234`
- Run both frontend and backend concurrently during development

## Testing

```bash
# Test server API endpoints  
cd server
node utils/testChatbot.js

# Run frontend tests
cd heal
npm test
```

## Deployment

The application is designed to be easily deployed:

1. Build the frontend: `cd heal && npm run build`
2. Set environment variables for production
3. Deploy the frontend static files and backend service

## Troubleshooting

- If port conflicts occur, the application will automatically try to use alternative ports
- If MongoDB connection fails, the application will use an in-memory database
- For server errors, check server logs and ensure environment variables are correctly set

## License

MIT License 
>>>>>>> 55b8051 (Initial commit)
