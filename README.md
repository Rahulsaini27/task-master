# Task Management Application

A full-stack task management application built with Node.js, Express, MongoDB, and React.

## Project Structure

```
/
├── backend/
│   ├── config/
│   │   └── db.js                  # Database configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication controller
│   │   ├── getDashboardAnalytics.js # Dashboard analytics controller
│   │   ├── notificationController.js # Notification controller
│   │   └── taskController.js      # Task management controller
│   ├── middlewares/
│   │   └── authMiddleware.js      # Authentication middleware
│   ├── models/
│   │   ├── Notification.js        # Notification model
│   │   ├── Task.js                # Task model
│   │   └── User.js                # User model
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication routes
│   │   ├── dashboardRoutes.js     # Dashboard routes
│   │   ├── notificationRoutes.js  # Notification routes
│   │   └── taskRoutes.js          # Task routes
│   ├── utils/
│   │   ├── email.js               # Email utility functions
│   │   └── generateToken.js       # JWT token generation
│   └── server.js                  # Express application entry point
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── assets/                # Frontend assets
│   │   ├── react.svg              # React logo
│   │   ├── Comp/                  # React components
│   │   │   ├── AddTask.jsx        # Add task component
│   │   │   ├── Dashboard.jsx      # Dashboard component
│   │   │   ├── EditTask.jsx       # Edit task component
│   │   │   ├── Navbar.jsx         # Navigation bar component
│   │   │   ├── NotificationPage.jsx # Notification page component
│   │   │   ├── Sidebar.jsx        # Sidebar component
│   │   │   ├── Task.jsx           # Task component
│   │   │   ├── Unauthorized.jsx   # Unauthorized access component
│   │   │   └── User.jsx           # User component
│   │   ├── Context/               # React context
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.jsx           # Home page
│   │   │   ├── Layout.jsx         # Layout component
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── App.jsx            # Root App component
│   │   ├── App.css                # Global styles
│   │   ├── index.css              # CSS reset and base styles
│   │   ├── main.jsx               # Frontend entry point
│   │   └── vite.config.js         # Vite configuration
│   ├── .gitignore                 # Git ignore file
│   ├── eslint.config.js           # ESLint configuration
│   ├── index.html                 # HTML template
│   ├── package-lock.json          # Package lock file
│   ├── package.json               # Frontend dependencies
│   ├── README.md                  # Frontend README
│   └── vite.config.js             # Vite configuration
├── .gitignore                     # Git ignore file
├── package-lock.json              # Package lock file
├── package.json                   # Project dependencies                  
└── version.json                   # Version information
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/task-management-app.git
cd task-management-app
```

### 2. Install dependencies

#### For the entire project:

```bash
npm install
```

#### For frontend only:

```bash
cd frontend
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/task-management
# or for MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/task-management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Email Configuration (if using email functionality)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@taskmanagement.com
```

### 4. Set up the database

Ensure MongoDB is running locally or you have access to MongoDB Atlas.

The application will automatically create the necessary collections when it first connects to the database.

### 5. Run the application

#### Development mode

To run both frontend and backend concurrently:

```bash
npm run dev
```

#### Backend only:

```bash
npm run server
```

#### Frontend only:

```bash
npm run client
```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login user
- **GET /api/auth/logout** - Logout user
- **GET /api/auth/me** - Get current user profile

### Tasks

- **GET /api/tasks** - Get all tasks for current user
- **POST /api/tasks** - Create a new task
- **GET /api/tasks/:id** - Get a specific task
- **PUT /api/tasks/:id** - Update a task
- **DELETE /api/tasks/:id** - Delete a task

### Dashboard

- **GET /api/dashboard/analytics** - Get dashboard analytics

### Notifications

- **GET /api/notifications** - Get all notifications for current user
- **PUT /api/notifications/:id** - Mark notification as read
- **DELETE /api/notifications/:id** - Delete a notification

## Authentication Flow

1. User registers with email and password
2. Backend validates input, hashes password, and creates user in database
3. JWT token is generated and returned to client
4. Client stores token in localStorage/cookies for subsequent authenticated requests
5. Protected routes check for valid token using authMiddleware

## Features

- User authentication and authorization
- Task creation, reading, updating, and deletion
- Dashboard with analytics
- Notifications system
- Responsive UI for desktop and mobile

## Development Guidelines

### Backend

- Use controllers for handling request/response logic
- Implement middleware for authentication and other cross-cutting concerns
- Follow the MVC pattern with models, routes, and controllers
- Use async/await for asynchronous operations

### Frontend

- Use React functional components with hooks
- Organize code by feature/page/component
- Use context for global state management
- Implement responsive design using CSS

## Deployment

### Backend

1. Set NODE_ENV to 'production' in .env file
2. Ensure MongoDB connection string is set up for production database
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend

1. Build the frontend for production:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the build directory to a static hosting service

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in .env file
   - Ensure network connectivity to MongoDB Atlas (if using)

2. **Authentication Failures**
   - Check JWT secret in .env file
   - Verify token expiration settings
   - Clear browser cookies/localStorage and try again

3. **Frontend Build Issues**
   - Clear node_modules and reinstall dependencies
   - Check for compatibility issues between packages

## License

[MIT](LICENSE)

## Contributors

Author
Name: Rahul Saini

GitHub: @Rahulsaini27

