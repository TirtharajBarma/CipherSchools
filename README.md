# CipherStudio - Browser-Based React IDE

A full-stack browser-based IDE for React development with live preview, file management, and project persistence.

## Features

- **File Management**: Create, delete, and organize React project files
- **Code Editor**: Rich code editing with Sandpack integration
- **Live Preview**: Real-time React component preview
- **Save & Load**: Project persistence with localStorage and optional backend
- **Theme Switcher**: Dark/Light mode support
- **Auto-save**: Toggle auto-save functionality
- **Responsive UI**: Works on desktop and tablet screens

## Tech Stack

### Frontend (Client)
- React 18 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Sandpack for code editing and preview
- React Icons

### Backend (Server)
- Node.js with Express
- MongoDB with Mongoose
- CORS enabled
- RESTful API design

## Quick Start

### Client Setup
```bash
cd client
npm install
npm run dev
```

### Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other configs
npm run dev
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store and slices
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

## API Endpoints

- `GET /api/projects` - Get all projects
- `GET /api/projects/:projectId` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project

## Environment Variables

### Server (.env)
```
PORT=5003
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cipherstudio
JWT_SECRET=your_jwt_secret_key

# Optional: Only needed for AWS S3 file storage
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=cipherstudio-files
```

### Client (.env - optional)
```
VITE_API_URL=http://localhost:5003/api
```

## Development

The application works in two modes:
1. **Standalone**: Uses localStorage for project persistence (no backend required)
2. **Full-stack**: Uses MongoDB backend for project storage and user management

Start both client and server for full functionality, or just the client for standalone mode.