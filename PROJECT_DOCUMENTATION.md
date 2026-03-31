# E-Commerce Platform - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Methodology & App Creation Steps](#methodology--app-creation-steps)
3. [Architecture](#architecture)
4. [Setup & Installation](#setup--installation)
5. [Screenshots](#screenshots)
6. [Testing Methods](#testing-methods)
7. [API Documentation](#api-documentation)
8. [Deployment Guide](#deployment-guide)

---

## Project Overview

This is a comprehensive e-commerce platform for Books & Printed Items with three main components:

- **Backend API**: Node.js/Express REST API with Prisma ORM
- **Admin Panel**: React-based admin dashboard for managing products, orders, and users
- **Mobile App**: Flutter application for customers

### Tech Stack

**Backend:**
- Node.js & Express.js
- Prisma ORM
- MySQL Database
- JWT Authentication
- Cloudinary (Image Storage)
- Stripe & Razorpay (Payment Gateways)
- Redis (Caching)
- Twilio (SMS)

**Admin Panel:**
- React 18
- Material-UI (MUI)
- React Router
- Axios
- React Query
- Vite

**Mobile App:**
- Flutter
- Dart

---

## Methodology & App Creation Steps

### Phase 1: Project Planning & Setup

#### 1.1 Requirements Analysis
- **Business Requirements**: E-commerce platform for books and printed items
- **User Roles**: Customers, Admins, Vendors
- **Core Features**: Product catalog, Shopping cart, Orders, Payments, Reviews, Admin panel

#### 1.2 Technology Selection
- **Backend**: Node.js for scalability and JavaScript ecosystem
- **Database**: MySQL for relational data structure
- **ORM**: Prisma for type-safe database access
- **Frontend Admin**: React for component-based UI
- **Mobile**: Flutter for cross-platform development

#### 1.3 Project Structure Setup
```
my-node-project/
├── server/              # Backend API
│   ├── config/         # Database & app configuration
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth & validation middleware
│   ├── models/         # Prisma models
│   ├── routes/         # API routes
│   └── uploads/        # File storage
├── admin/              # React Admin Panel
│   └── src/
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── context/    # React context
│       └── services/   # API services
├── prisma/             # Database schema & migrations
└── uploads/            # Static file storage
```

### Phase 2: Database Design & Schema

#### 2.1 Database Schema Design
Using Prisma Schema Language, we defined:

**Core Models:**
- `User` - User accounts with authentication
- `Product` - Product catalog (books & printed items)
- `Category` - Product categorization
- `Order` - Order management
- `Cart` - Shopping cart
- `Wishlist` - User wishlists
- `Review` - Product reviews
- `Address` - User addresses
- `Notification` - User notifications
- `Promotion` - Discount codes
- `Customization` - Custom product requests
- `ChatRoom` & `ChatMessage` - Customer support

#### 2.2 Database Migration
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio
```

### Phase 3: Backend API Development

#### 3.1 Server Setup
1. **Initialize Express Server** (`server/index.js`)
   - Configure middleware (CORS, Helmet, Compression, Morgan)
   - Setup rate limiting
   - Configure static file serving
   - Error handling middleware

2. **Database Connection** (`server/config/database.js`)
   - Prisma Client initialization
   - Connection pooling
   - Error handling

#### 3.2 Authentication System
1. **JWT-based Authentication**
   - User registration with email/phone verification
   - Login with email/phone + password
   - OTP verification for phone
   - Password reset functionality
   - Refresh token mechanism

2. **Routes Created:**
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/verify-email` - Email verification
   - `POST /api/auth/verify-phone` - Phone OTP verification
   - `POST /api/auth/forgot-password` - Password reset request
   - `POST /api/auth/reset-password` - Reset password
   - `POST /api/auth/refresh` - Refresh access token

#### 3.3 Product Management API
**Routes:**
- `GET /api/products` - List products (with filters, pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin/Vendor)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Features:**
- Product images upload to Cloudinary
- Product variants support
- Stock management
- Search and filtering
- Sorting options

#### 3.4 Shopping Cart API
**Routes:**
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove cart item
- `DELETE /api/cart` - Clear cart

#### 3.5 Order Management API
**Routes:**
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

**Order Flow:**
1. Cart → Checkout
2. Address selection
3. Payment processing
4. Order confirmation
5. Order tracking

#### 3.6 Payment Integration
- **Stripe**: Credit card payments
- **Razorpay**: UPI, Net Banking, Wallets
- **Payment Status**: Pending → Processing → Completed/Failed

#### 3.7 Additional Features
- **Reviews & Ratings**: Product reviews with images
- **Wishlist**: Save products for later
- **Notifications**: Email, SMS, Push notifications
- **Promotions**: Discount codes and coupons
- **Customizations**: Custom product requests
- **Chat Support**: Customer support chat

### Phase 4: Admin Panel Development

#### 4.1 React Application Setup
```bash
cd admin
npm install
npm run dev
```

#### 4.2 Component Structure
- **Layout Component**: Sidebar navigation, header, main content area
- **Pages**: Dashboard, Products, Orders, Users, Categories, etc.
- **Components**: Reusable UI components (tables, forms, cards)

#### 4.3 Key Features Implemented
1. **Dashboard**
   - Sales statistics
   - Order overview
   - Revenue charts
   - Recent activities

2. **Product Management**
   - Product listing with filters
   - Create/Edit product form
   - Image upload
   - Stock management
   - Product status management

3. **Order Management**
   - Order listing
   - Order details view
   - Status updates
   - Tracking information

4. **User Management**
   - User listing
   - User details
   - Role management
   - Account status

5. **Category Management**
   - Category CRUD operations
   - Category hierarchy
   - Category images

### Phase 5: Mobile App Integration

#### 5.1 Flutter App Setup
The Flutter app connects to the backend API for:
- User authentication
- Product browsing
- Shopping cart
- Order placement
- Order tracking

#### 5.2 API Integration
- RESTful API calls using HTTP client
- JWT token management
- Image loading and caching
- Error handling

### Phase 6: Testing & Quality Assurance

See [Testing Methods](#testing-methods) section below.

### Phase 7: Deployment

See [Deployment Guide](#deployment-guide) section below.

---

## Architecture

### System Architecture

```
┌─────────────────┐
│  Flutter App    │
│  (Mobile)       │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
┌────────▼─────────────────────────┐
│      Backend API (Express)        │
│  ┌─────────────────────────────┐  │
│  │  Controllers & Middleware   │  │
│  └──────────────┬──────────────┘  │
│                 │                  │
│  ┌──────────────▼──────────────┐  │
│  │    Prisma ORM               │  │
│  └──────────────┬──────────────┘  │
└─────────────────┼─────────────────┘
                  │
         ┌────────▼────────┐
         │   MySQL Database │
         └──────────────────┘

┌─────────────────┐
│  React Admin     │
│  (Web Panel)    │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
         └───────────┐
                     │
         ┌───────────▼───────────┐
         │   Backend API         │
         └───────────────────────┘
```

### Database Schema Overview

- **Users**: Authentication, profiles, roles
- **Products**: Catalog with variants, pricing, inventory
- **Orders**: Order management with status tracking
- **Cart & Wishlist**: Shopping experience
- **Reviews**: Product feedback
- **Notifications**: User engagement
- **Chat**: Customer support

---

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Git

### Backend Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd my-node-project
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env` file in root directory:
```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRE="24h"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Payment Gateways
STRIPE_SECRET_KEY="your-stripe-secret"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="your-phone-number"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

4. **Database Setup**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

5. **Start Backend Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Admin Panel Setup

1. **Navigate to Admin Directory**
```bash
cd admin
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env` file in `admin/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Build for Production**
```bash
npm run build
```

### Mobile App Setup

1. **Navigate to Flutter App Directory**
```bash
cd E-commerce-Complete-Flutter-UI-1
```

2. **Install Dependencies**
```bash
flutter pub get
```

3. **Configure API Endpoint**
Update API base URL in app configuration

4. **Run App**
```bash
# Android
flutter run

# iOS
flutter run -d ios
```

---

## Screenshots

..........

## Testing Methods

### 1. Unit Testing

#### 1.1 Backend Unit Tests

**Framework**: Jest

**Setup**:
```bash
npm install --save-dev jest supertest @types/jest
```

**Test Structure**:
```
server/
├── __tests__/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   └── integration/
│       └── routes/
```

**Example: User Controller Test**
```javascript
// server/__tests__/unit/controllers/user.controller.test.js
const { getUserById } = require('../../../controllers/user.controller');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client');

describe('User Controller', () => {
  test('should get user by id', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User'
    };
    
    PrismaClient.prototype.user.findUnique = jest.fn().mockResolvedValue(mockUser);
    
    const result = await getUserById(1);
    expect(result).toEqual(mockUser);
  });
});
```

**Example: Authentication Middleware Test**
```javascript
// server/__tests__/unit/middleware/auth.middleware.test.js
const { authenticateToken } = require('../../../middleware/auth.middleware');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  test('should authenticate valid token', () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {};
    const next = jest.fn();
    
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});
```

**Running Unit Tests**:
```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

#### 1.2 Admin Panel Unit Tests

**Framework**: Vitest + React Testing Library

**Setup**:
```bash
cd admin
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Example: Component Test**
```javascript
// admin/src/components/__tests__/ProductCard.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  it('renders product information', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg'
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

**Example: Hook Test**
```javascript
// admin/src/hooks/__tests__/useProducts.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useProducts } from '../useProducts';

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useProducts(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

**Running Admin Tests**:
```bash
cd admin
npm test
```

#### 1.3 Flutter Unit Tests

**Framework**: Flutter Test

**Example: Model Test**
```dart
// test/models/product_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:shop_app/models/product.dart';

void main() {
  test('Product model from JSON', () {
    final json = {
      'id': 1,
      'name': 'Test Book',
      'price': 29.99,
      'description': 'Test description'
    };
    
    final product = Product.fromJson(json);
    
    expect(product.id, 1);
    expect(product.name, 'Test Book');
    expect(product.price, 29.99);
  });
});
```

**Example: Service Test**
```dart
// test/services/api_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:shop_app/services/api_service.dart';
import 'package:mockito/mockito.dart';

void main() {
  test('fetchProducts returns list of products', () async {
    final apiService = ApiService();
    final products = await apiService.fetchProducts();
    
    expect(products, isA<List<Product>>());
    expect(products.length, greaterThan(0));
  });
});
```

**Running Flutter Tests**:
```bash
cd E-commerce-Complete-Flutter-UI-1
flutter test
```

### 2. Integration Testing

#### 2.1 API Integration Tests

**Example: Authentication Flow Test**
```javascript
// server/__tests__/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../server/index');
const { PrismaClient } = require('@prisma/client');

describe('Authentication API', () => {
  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'Password123!'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
  
  test('POST /api/auth/login - should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

**Example: Product API Integration Test**
```javascript
// server/__tests__/integration/product.integration.test.js
const request = require('supertest');
const app = require('../../server/index');

describe('Product API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    authToken = loginResponse.body.data.token;
  });
  
  test('GET /api/products - should get all products', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });
  
  test('POST /api/products - should create product', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        categoryId: 1,
        stockQuantity: 100
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.product).toHaveProperty('id');
  });
});
```

**Running Integration Tests**:
```bash
npm test -- --testPathPattern=integration
```

#### 2.2 End-to-End (E2E) Testing

**Framework**: Playwright (for Admin Panel) / Flutter Integration Tests

**Admin Panel E2E Test Example**:
```javascript
// admin/e2e/admin-flow.spec.js
import { test, expect } from '@playwright/test';

test('Admin login and product creation flow', async ({ page }) => {
  // Navigate to login
  await page.goto('http://localhost:5173/login');
  
  // Login
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForURL('**/dashboard');
  
  // Navigate to products
  await page.click('text=Products');
  
  // Click add product
  await page.click('text=Add Product');
  
  // Fill product form
  await page.fill('input[name="name"]', 'E2E Test Product');
  await page.fill('textarea[name="description"]', 'Test Description');
  await page.fill('input[name="price"]', '29.99');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Verify product created
  await expect(page.locator('text=E2E Test Product')).toBeVisible();
});
```

**Flutter Integration Test Example**:
```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shop_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  testWidgets('Product browsing flow', (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();
    
    // Find and tap product
    final productFinder = find.text('Test Product');
    expect(productFinder, findsOneWidget);
    await tester.tap(productFinder);
    await tester.pumpAndSettle();
    
    // Verify product details page
    expect(find.text('Product Details'), findsOneWidget);
    
    // Add to cart
    final addToCartButton = find.text('Add to Cart');
    await tester.tap(addToCartButton);
    await tester.pumpAndSettle();
    
    // Verify cart icon shows count
    expect(find.text('1'), findsOneWidget);
  });
}
```

### 3. User Acceptance Testing (UAT)

#### 3.1 Test Scenarios

**Scenario 1: User Registration & Login**
1. Navigate to registration page
2. Fill registration form
3. Verify email/phone
4. Login with credentials
5. Verify successful login

**Scenario 2: Product Browsing**
1. Browse product catalog
2. Apply filters (category, price, rating)
3. Search for products
4. View product details
5. Add to cart/wishlist

**Scenario 3: Shopping Cart & Checkout**
1. Add products to cart
2. Update quantities
3. Remove items
4. Proceed to checkout
5. Select shipping address
6. Choose payment method
7. Complete order

**Scenario 4: Order Management**
1. View order history
2. Track order status
3. Cancel order (if applicable)
4. View order details

**Scenario 5: Admin Product Management**
1. Login as admin
2. Navigate to products
3. Create new product
4. Upload product images
5. Set pricing and inventory
6. Update product status
7. Delete product

**Scenario 6: Admin Order Management**
1. View all orders
2. Filter by status
3. Update order status
4. Add tracking information
5. Process refunds

#### 3.2 Test Checklist

**Functional Testing:**
- [ ] User registration works
- [ ] Login/logout functions correctly
- [ ] Product listing displays correctly
- [ ] Product search works
- [ ] Filters apply correctly
- [ ] Cart add/remove/update works
- [ ] Checkout process completes
- [ ] Payment processing works
- [ ] Order creation successful
- [ ] Order tracking works
- [ ] Admin panel accessible
- [ ] Product CRUD operations work
- [ ] Order management works

**Performance Testing:**
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Image loading optimized
- [ ] Database queries optimized

**Security Testing:**
- [ ] Authentication required for protected routes
- [ ] JWT tokens expire correctly
- [ ] Password hashing works
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

**Usability Testing:**
- [ ] Navigation is intuitive
- [ ] Forms are user-friendly
- [ ] Error messages are clear
- [ ] Mobile responsive design
- [ ] Accessibility features work

### 4. Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user flows covered
- **UAT**: All user stories validated

### 5. Continuous Integration Testing

**GitHub Actions Example**:
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      
  test-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd admin && npm install && npm test
```

---

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

### Authentication
Most endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <token>
```

### Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh` - Refresh access token

#### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin/Vendor)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

#### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/addresses` - Add address

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

---

## Deployment Guide

### Backend Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secrets
   - Configure payment gateway keys

2. **Database Migration**
```bash
npm run prisma:migrate:deploy
npm run prisma:generate
```

3. **Build & Start**
```bash
npm start
```

### Admin Panel Deployment

1. **Build**
```bash
cd admin
npm run build
```

2. **Deploy** (Example: Vercel/Netlify)
   - Connect repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Set environment variables

### Mobile App Deployment

1. **Android**
```bash
flutter build apk --release
flutter build appbundle --release
```

2. **iOS**
```bash
flutter build ios --release
```

---

## Conclusion

This documentation provides a comprehensive guide to the e-commerce platform, covering methodology, setup, testing, and deployment. For additional support, refer to individual component README files or contact the development team.

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Maintained By**: Development Team
