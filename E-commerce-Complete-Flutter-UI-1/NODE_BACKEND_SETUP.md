# Node.js Backend Setup Guide for Books E-Commerce App

## Step-by-Step Setup Instructions

### Prerequisites
- Node.js (v18 or higher) installed
- npm or yarn package manager
- MongoDB or PostgreSQL database
- Code editor (VS Code recommended)

---

## Step 1: Create Backend Project Structure

Create a new folder for your backend (outside the Flutter app):
```
book-store-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Step 2: Initialize Node.js Project

```bash
# Create backend folder
mkdir book-store-backend
cd book-store-backend

# Initialize npm project
npm init -y

# Install core dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install express-validator multer nodemailer

# Install development dependencies
npm install --save-dev nodemon
```

---

## Step 3: Install Required Packages

### Core Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM (Object Data Modeling)
- **dotenv**: Environment variables
- **cors**: Cross-Origin Resource Sharing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **multer**: File upload handling
- **nodemailer**: Email sending (for OTP)

### Optional but Recommended
- **express-rate-limit**: Rate limiting
- **helmet**: Security headers
- **compression**: Response compression
- **morgan**: HTTP request logger

---

## Step 4: Database Setup

### Option A: MongoDB (Recommended for beginners)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `.env` file

### Option B: PostgreSQL
1. Install PostgreSQL locally or use [Supabase](https://supabase.com)
2. Install `pg` package: `npm install pg`
3. Set up connection string

---

## Step 5: Environment Variables (.env)

Create `.env` file in root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore
# OR for PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/bookstore

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

---

## Step 6: Project Structure Setup

See the `backend-setup/` folder I'll create with all necessary files.

---

## Step 7: Start Development

```bash
# Start development server with nodemon
npm run dev

# Or start normally
npm start
```

---

## Step 8: Test API

Use Postman or Thunder Client (VS Code extension) to test endpoints:
- `GET http://localhost:5000/api/health` - Health check
- `POST http://localhost:5000/api/auth/register` - Register user

---

## Next Steps

1. Set up database connection
2. Create user authentication APIs
3. Create product management APIs
4. Create cart and order APIs
5. Integrate payment gateway
6. Deploy to production (Heroku, AWS, DigitalOcean)

---

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

