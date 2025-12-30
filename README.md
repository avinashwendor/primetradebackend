# PrimeTrade - Task Management API  [LIVE URL](http://primetrade-five.vercel.app)

A scalable REST API with JWT authentication and role-based access control, built with Node.js, Express, TypeScript, and MongoDB.

## Features

### Backend
- **User Authentication**: Registration and login with bcrypt password hashing
- **JWT Tokens**: Access and refresh token mechanism for secure sessions
- **Role-Based Access Control**: User and Admin roles with granular permissions
- **Task Management**: Full CRUD operations with filtering, sorting, and pagination
- **API Versioning**: `/api/v1/` prefix for future compatibility
- **Input Validation**: Zod schema validation on all endpoints
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Rate Limiting**: Protection against brute force attacks
- **API Documentation**: Swagger/OpenAPI documentation

### Frontend
- **Modern UI**: Clean, responsive design with dark theme
- **Authentication Flow**: Register, login, and logout functionality
- **Protected Routes**: JWT-based route protection
- **Task Dashboard**: Create, view, edit, and delete tasks
- **Real-time Feedback**: Success/error notifications
- **Filtering & Search**: Filter tasks by status, search by title

## Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js for password hashing
- Zod for validation
- Swagger/OpenAPI for documentation
- Winston for logging

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand for state management
- Axios for HTTP requests

## Project Structure

```
primetradeai/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (env, database, swagger)
│   │   ├── controllers/    # Request handlers
│   │   ├── database/       # Seeds
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose models
│   │   ├── repositories/   # Database access layer
│   │   ├── routes/         # API routes (versioned)
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities (logger, errors)
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # React components
│   │   └── lib/            # API client and store
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+ (or Docker)
- npm or yarn

### Database Setup

**Option 1: Using Docker (Recommended)**
```bash
# Start MongoDB container
docker-compose up -d

# Wait for database to be ready
docker-compose logs -f mongodb
```

**Option 2: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Option 3: MongoDB Atlas (Cloud)**
Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) and update your `.env` with the connection string.

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cat > .env << EOF
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/primetrade_db
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

4. (Optional) Seed admin user:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, access the Swagger documentation at:
```
http://localhost:3001/api-docs
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (revoke token) |
| POST | `/api/v1/auth/logout-all` | Logout from all devices |
| GET | `/api/v1/auth/profile` | Get current user profile |

#### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | Get user's tasks (paginated) |
| POST | `/api/v1/tasks` | Create a new task |
| GET | `/api/v1/tasks/:id` | Get task by ID |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| GET | `/api/v1/tasks/stats` | Get task statistics |
| GET | `/api/v1/tasks/all` | Get all tasks (Admin only) |

### Request/Response Examples

#### Register User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

#### Create Task
```bash
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "Complete project",
    "description": "Finish the backend API",
    "priority": "high",
    "status": "in_progress"
  }'
```

## Database Schema (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String | null,
  status: "pending" | "in_progress" | "completed" | "cancelled",
  priority: "low" | "medium" | "high" | "urgent",
  dueDate: Date | null,
  userId: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Refresh Tokens Collection
```javascript
{
  _id: ObjectId,
  token: String (unique),
  userId: ObjectId (ref: Users),
  expiresAt: Date (TTL index),
  revokedAt: Date | null,
  createdAt: Date
}
```

## Security Practices

1. **Password Hashing**: Bcrypt with configurable rounds (default: 12)
2. **JWT Tokens**: Short-lived access tokens (15m) with longer refresh tokens (7d)
3. **Input Validation**: All inputs validated with Zod schemas
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **Helmet**: Security headers configured
6. **CORS**: Configured for specific origins in production
7. **NoSQL Injection Prevention**: Using Mongoose with schema validation

## Scalability Considerations

### Current Architecture
- **Stateless API**: JWT tokens allow horizontal scaling
- **Connection Pooling**: Mongoose connection pool (2-10 connections)
- **Database Indexes**: Optimized queries with proper indexing

### Future Improvements
1. **Caching**: Add Redis for session storage and frequently accessed data
2. **Load Balancing**: Deploy behind nginx or cloud load balancer
3. **Microservices**: Split auth and tasks into separate services
4. **Message Queue**: Add RabbitMQ/Redis for async operations
5. **Docker**: Containerize for consistent deployment
6. **Kubernetes**: Orchestration for auto-scaling
7. **MongoDB Replica Set**: For high availability and read scaling

### Docker Deployment (Example)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml for production
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/primetrade_db
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Testing

### Default Admin User
After running seeds:
- Email: `admin@primetrade.ai`
- Password: `Admin@123`

### Test User Registration
- Passwords must be at least 8 characters
- Must contain uppercase, lowercase, and number

## License

ISC

## Author

Built for PrimeTrade Backend Developer Assignment
