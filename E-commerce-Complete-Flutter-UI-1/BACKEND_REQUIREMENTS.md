# Backend & API Requirements for Books & Printed Items E-Commerce App

## Overview
This document outlines the complete backend and API requirements to transform the Flutter e-commerce UI into a fully functional books and printed items marketplace.

---

## 1. Authentication & User Management

### 1.1 User Registration
- **POST** `/api/auth/register`
  - Fields: Full name, email, phone number, password, OTP verification
  - Email/Phone verification required
  - Returns: User ID, authentication token, profile data

### 1.2 User Login
- **POST** `/api/auth/login`
  - Support: Email/Phone + Password, Social login (Google, Facebook)
  - Returns: JWT token, refresh token, user profile

### 1.3 OTP Verification
- **POST** `/api/auth/send-otp` - Send OTP via SMS/Email
- **POST** `/api/auth/verify-otp` - Verify OTP code
- **POST** `/api/auth/resend-otp` - Resend OTP

### 1.4 Password Management
- **POST** `/api/auth/forgot-password` - Send password reset link/OTP
- **POST** `/api/auth/reset-password` - Reset password with token/OTP
- **POST** `/api/auth/change-password` - Change password (authenticated)

### 1.5 User Profile
- **GET** `/api/users/profile` - Get user profile
- **PUT** `/api/users/profile` - Update profile (name, email, phone, address, profile picture)
- **GET** `/api/users/addresses` - Get all saved addresses
- **POST** `/api/users/addresses` - Add new address
- **PUT** `/api/users/addresses/{id}` - Update address
- **DELETE** `/api/users/addresses/{id}` - Delete address

---

## 2. Product Management (Books & Printed Items)

### 2.1 Product Catalog
- **GET** `/api/products` - Get all products with filters
  - Query params: category, search, minPrice, maxPrice, sortBy, page, limit
  - Returns: Product list with images, prices, ratings, availability

### 2.2 Product Details
- **GET** `/api/products/{id}` - Get single product details
  - Returns: Full product info, multiple images, descriptions, specifications, reviews, related products

### 2.3 Product Categories
- **GET** `/api/categories` - Get all categories
  - For books: Fiction, Non-Fiction, Academic, Children's, etc.
  - For printed items: Business Cards, Flyers, Brochures, Posters, etc.
- **GET** `/api/categories/{id}/products` - Get products by category

### 2.4 Product Search & Filtering
- **GET** `/api/products/search?q={query}` - Search products
  - Support: ISBN, author name, title, publisher, keywords
- **GET** `/api/products/filters` - Get available filter options
  - Filters: Price range, author, publisher, language, format (hardcover/paperback), condition (new/used)

### 2.5 Product Features Specific to Books
- **ISBN** management
- **Author** information (multiple authors support)
- **Publisher** details
- **Publication date**
- **Language** (English, Spanish, etc.)
- **Format**: Hardcover, Paperback, E-book, Audiobook
- **Edition** number
- **Page count**
- **Genre/Tags**
- **Condition**: New, Used, Refurbished

### 2.6 Product Features Specific to Printed Items
- **Print type**: Digital, Offset, Letterpress
- **Paper type**: Glossy, Matte, Cardstock, etc.
- **Size dimensions**
- **Quantity options** (bulk pricing)
- **Customization options**: Colors, finishes, add-ons
- **Print specifications**: DPI, color mode (CMYK/RGB)

---

## 3. Shopping Cart & Wishlist

### 3.1 Shopping Cart
- **GET** `/api/cart` - Get user's cart items
- **POST** `/api/cart/add` - Add product to cart
  - Body: productId, quantity, variant options (if applicable)
- **PUT** `/api/cart/update/{itemId}` - Update cart item quantity
- **DELETE** `/api/cart/remove/{itemId}` - Remove item from cart
- **DELETE** `/api/cart/clear` - Clear entire cart

### 3.2 Wishlist/Favorites
- **GET** `/api/wishlist` - Get user's wishlist
- **POST** `/api/wishlist/add` - Add product to wishlist
- **DELETE** `/api/wishlist/remove/{productId}` - Remove from wishlist

---

## 4. Orders & Checkout

### 4.1 Order Processing
- **POST** `/api/orders/create` - Create new order
  - Body: Cart items, shipping address, billing address, payment method
  - Returns: Order ID, order summary, total amount

### 4.2 Order Management
- **GET** `/api/orders` - Get user's order history
  - Query params: status, page, limit
- **GET** `/api/orders/{id}` - Get order details
- **PUT** `/api/orders/{id}/cancel` - Cancel order (if allowed)
- **POST** `/api/orders/{id}/return` - Request return/refund

### 4.3 Order Status Tracking
- **GET** `/api/orders/{id}/tracking` - Get order tracking information
- Statuses: Pending, Processing, Confirmed, Shipped, Out for Delivery, Delivered, Cancelled, Returned

---

## 5. Payment Integration

### 5.1 Payment Methods
- **Credit/Debit Cards** (Visa, Mastercard, etc.)
- **Digital Wallets** (Google Pay, Apple Pay, PayPal)
- **Bank Transfer**
- **Cash on Delivery** (COD)
- **UPI** (for Indian market)

### 5.2 Payment Processing
- **POST** `/api/payments/create-intent` - Create payment intent
- **POST** `/api/payments/confirm` - Confirm payment
- **GET** `/api/payments/{id}/status` - Check payment status
- **POST** `/api/payments/refund` - Process refunds

### 5.3 Payment Security
- PCI DSS compliance
- Secure tokenization
- Payment gateway integration (Stripe, Razorpay, PayPal, etc.)

---

## 6. Shipping & Delivery

### 6.1 Shipping Address Management
- **GET** `/api/shipping/addresses` - Get saved addresses
- **POST** `/api/shipping/addresses` - Add shipping address
- **PUT** `/api/shipping/addresses/{id}` - Update address
- **DELETE** `/api/shipping/addresses/{id}` - Delete address

### 6.2 Shipping Options
- **GET** `/api/shipping/options` - Get available shipping methods
  - Standard delivery (5-7 days)
  - Express delivery (2-3 days)
  - Overnight delivery
- **POST** `/api/shipping/calculate` - Calculate shipping cost
  - Input: Address, product weights, delivery option

### 6.3 Delivery Tracking
- **GET** `/api/shipping/track/{orderId}` - Track shipment
- Integration with courier services (FedEx, DHL, local postal services)

---

## 7. Reviews & Ratings

### 7.1 Product Reviews
- **GET** `/api/products/{id}/reviews` - Get product reviews
  - Query params: page, limit, sort (newest, highest rated, most helpful)
- **POST** `/api/products/{id}/reviews` - Submit review
  - Body: Rating (1-5), comment, images (optional)
- **PUT** `/api/reviews/{id}` - Update own review
- **DELETE** `/api/reviews/{id}` - Delete own review

### 7.2 Review Features
- **Helpful votes** - Mark reviews as helpful
- **Verified purchase** badge
- **Review moderation** (admin approval)

---

## 8. Notifications

### 8.1 Push Notifications
- Order status updates
- Payment confirmations
- Shipping updates
- Price drop alerts (for wishlist items)
- New product arrivals
- Promotional offers

### 8.2 Notification Management
- **GET** `/api/notifications` - Get user notifications
- **PUT** `/api/notifications/{id}/read` - Mark as read
- **PUT** `/api/notifications/preferences` - Update notification preferences

---

## 9. Search & Recommendations

### 9.1 Advanced Search
- Full-text search on: Title, Author, ISBN, Description
- Filters: Price, Rating, Category, Availability
- Sorting: Relevance, Price, Rating, Newest

### 9.2 Recommendations
- **GET** `/api/products/recommended` - Get personalized recommendations
- Based on: Purchase history, browsing history, wishlist, similar users
- **GET** `/api/products/related/{productId}` - Get related products

---

## 10. Discounts & Promotions

### 10.1 Coupons & Promo Codes
- **POST** `/api/promotions/validate` - Validate promo code
- **GET** `/api/promotions/available` - Get available promotions

### 10.2 Special Offers
- Flash sales
- Category discounts
- Bulk purchase discounts
- Seasonal promotions

---

## 11. Inventory Management

### 11.1 Stock Management
- Real-time stock tracking
- Low stock alerts
- Out of stock notifications
- Pre-order support for upcoming books

### 11.2 Availability
- **GET** `/api/products/{id}/availability` - Check product availability
- In-stock, Out of stock, Pre-order, Limited stock

---

## 12. Admin Panel Requirements

### 12.1 Product Management
- **CRUD operations** for products
- Bulk product upload (CSV/Excel)
- Image upload and management
- Product activation/deactivation

### 12.2 Order Management
- View all orders
- Update order status
- Process refunds
- Print shipping labels

### 12.3 User Management
- View user accounts
- Manage user roles (Admin, Customer, Vendor)
- User activity monitoring

### 12.4 Analytics & Reports
- Sales reports
- Product performance
- User analytics
- Revenue tracking

---

## 13. Technical Requirements

### 13.1 API Standards
- **RESTful API** design
- **JSON** data format
- **JWT** authentication
- **HTTPS** for all endpoints
- **Rate limiting** to prevent abuse
- **API versioning** (e.g., `/api/v1/`)

### 13.2 Database Requirements
- **User data**: Profiles, authentication, preferences
- **Product catalog**: Books, printed items with detailed attributes
- **Orders**: Order history, status, items
- **Cart & Wishlist**: User-specific data
- **Reviews**: Product reviews and ratings
- **Inventory**: Stock levels, availability

### 13.3 File Storage
- **Image storage**: Product images, user avatars
- **Document storage**: PDF previews for books, print specifications
- **CDN integration** for fast image delivery

### 13.4 Security
- **Data encryption** (at rest and in transit)
- **Input validation** and sanitization
- **SQL injection** prevention
- **XSS protection**
- **CORS** configuration
- **API key management**

### 13.5 Performance
- **Caching** strategy (Redis)
- **Database indexing** for fast queries
- **Pagination** for large datasets
- **Image optimization** and lazy loading
- **CDN** for static assets

---

## 14. Third-Party Integrations

### 14.1 Payment Gateways
- Stripe, Razorpay, PayPal, Square
- Local payment methods (region-specific)

### 14.2 Shipping Services
- FedEx, DHL, UPS APIs
- Local courier integrations
- Postal service APIs

### 14.3 SMS/Email Services
- Twilio, SendGrid, AWS SES
- For OTP, notifications, order updates

### 14.4 Analytics
- Google Analytics
- Firebase Analytics
- Custom analytics dashboard

---

## 15. Mobile App Specific Requirements

### 15.1 Offline Support
- Cache product catalog
- Offline cart management
- Sync when online

### 15.2 Push Notifications
- Firebase Cloud Messaging (FCM)
- Apple Push Notification Service (APNS)

### 15.3 Image Optimization
- Multiple image sizes (thumbnail, medium, large)
- WebP format support
- Progressive image loading

---

## 16. Recommended Backend Technologies

### Option 1: Node.js + Express
- **Pros**: Fast development, JavaScript ecosystem, large community
- **Database**: MongoDB or PostgreSQL
- **Authentication**: JWT with Passport.js
- **File Storage**: AWS S3 or Cloudinary

### Option 2: Python + Django/FastAPI
- **Pros**: Robust, great for complex logic, excellent admin panel
- **Database**: PostgreSQL
- **Authentication**: Django REST Framework JWT
- **File Storage**: AWS S3

### Option 3: Firebase/Supabase (Backend-as-a-Service)
- **Pros**: Quick setup, real-time features, built-in authentication
- **Cons**: Less control, vendor lock-in
- **Best for**: MVP and rapid development

### Option 4: Flutter Backend (Serverpod)
- **Pros**: Same language, type-safe, code generation
- **Database**: PostgreSQL
- **Best for**: Teams familiar with Dart/Flutter

---

## 17. Implementation Priority

### Phase 1: Core Features (MVP)
1. User authentication (Register, Login, OTP)
2. Product catalog (CRUD)
3. Shopping cart
4. Basic checkout
5. Order management

### Phase 2: Essential Features
1. Payment integration
2. Shipping & delivery
3. Reviews & ratings
4. Search functionality
5. Wishlist

### Phase 3: Advanced Features
1. Recommendations
2. Notifications
3. Admin panel
4. Analytics
5. Advanced search & filters

---

## 18. API Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

---

## 19. Testing Requirements

### 19.1 API Testing
- Unit tests for all endpoints
- Integration tests
- Load testing
- Security testing

### 19.2 Data Validation
- Input validation on all endpoints
- Error handling and proper error messages
- Data type validation

---

## 20. Documentation Requirements

- **API Documentation**: Swagger/OpenAPI
- **Integration guides** for mobile app
- **Database schema** documentation
- **Deployment guides**

---

## Summary

This backend system will support:
- **User management** (registration, authentication, profiles)
- **Product catalog** (books and printed items with detailed attributes)
- **Shopping experience** (cart, wishlist, checkout)
- **Order fulfillment** (orders, payments, shipping, tracking)
- **User engagement** (reviews, recommendations, notifications)
- **Business operations** (admin panel, analytics, inventory)

**Estimated Development Time**: 3-6 months depending on team size and complexity.

**Recommended Approach**: Start with Phase 1 (MVP) using Firebase or a Node.js backend, then scale to more robust solutions as needed.

---

## 21. API Documentation (Reference Implementation)

This section translates the requirements above into concrete REST endpoints that can be hosted at `http://localhost:5000/api`. All responses conform to the success/error schemas defined in section 18, and authenticated routes require:

```
Authorization: Bearer <jwt-token>
```

### 21.1 Getting Started
1. Install and run the backend (`npm install` then `npm run dev`).
2. Verify health via `GET http://localhost:5000/api/health`.
3. Log in (`POST /api/auth/login`) to retrieve `data.token` and optionally `data.refreshToken`.
4. Configure your API client (Postman, Thunder Client, etc.) with:
   - `{{base_url}} = http://localhost:5000/api`
   - `Authorization` header using the token from step 3.

---

### 21.2 Authentication & Profile APIs
- `POST /api/auth/register` — Create user (full name, email, phone, password, optional OTP). Returns user object + tokens.
- `POST /api/auth/login` — Login via email/phone + password or social providers.
- `POST /api/auth/send-otp`, `/verify-otp`, `/resend-otp` — SMS/email OTP lifecycle.
- `POST /api/auth/forgot-password`, `/reset-password` — Reset via token/OTP.
- `POST /api/auth/change-password` — Requires `currentPassword` and `newPassword`.
- `GET /api/users/profile` — Authenticated user plus addresses.
- `PUT /api/users/profile` — Update name, email, phone, avatar, etc.
- Address book CRUD:
  - `GET /api/users/addresses`
  - `POST /api/users/addresses`
  - `PUT /api/users/addresses/:id`
  - `DELETE /api/users/addresses/:id`

_Sample register payload_
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

---

### 21.3 Product & Catalog APIs
- `GET /api/products` — Supports `category`, `type`, `search`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`, `page`, `limit`.
- `GET /api/products/:id` — Full detail + specs, reviews, related products.
- `GET /api/products/search?q=...` — ISBN, author, title, publisher, keyword search.
- `GET /api/products/:id/availability` — In stock, limited, preorder.
- `GET /api/products/:id/related?limit=5`
- `GET /api/products/recommended?limit=10`
- `GET /api/categories?type=book|printed_item`
- `GET /api/categories/:id` and `/api/categories/:id/products`
- `GET /api/products/filters` — Returns available filter buckets (price range, author, publisher, format, language, condition).

---

### 21.4 Cart, Wishlist & Checkout APIs
**Cart**
- `GET /api/cart`
- `POST /api/cart/add` — `{ "productId": "...", "quantity": 2, "variant": { "size": "XL" } }`
- `PUT /api/cart/update/:itemId`
- `DELETE /api/cart/remove/:itemId`
- `DELETE /api/cart/clear`

**Wishlist**
- `GET /api/wishlist`
- `POST /api/wishlist/add`
- `DELETE /api/wishlist/remove/:productId`

**Orders**
- `GET /api/orders?status=&page=&limit=`
- `GET /api/orders/:id`
- `POST /api/orders/create` — shipping/billing addresses, payment + shipping method, coupon code.
- `PUT /api/orders/:id/cancel`
- `POST /api/orders/:id/return`
- `GET /api/orders/:id/tracking`

_Sample create-order payload_
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "billingAddress": { "...same as shipping..." },
  "paymentMethod": "card",
  "shippingMethod": "standard",
  "couponCode": "DISCOUNT10"
}
```

---

### 21.5 Payments, Shipping & Promotions
- `POST /api/payments/create-intent` — Requires `orderId`, `amount`.
- `POST /api/payments/confirm` — `{ "orderId": "...", "paymentId": "...", "paymentMethod": "card" }`
- `GET /api/payments/:id/status`
- `POST /api/payments/refund`

**Shipping**
- `GET /api/shipping/options`
- `POST /api/shipping/calculate` — `{ "address": {...}, "items": [{ "productId": "...", "quantity": 2 }], "shippingMethod": "standard" }`
- `GET /api/shipping/track/:orderId`

**Promotions**
- `GET /api/promotions/available`
- `POST /api/promotions/validate`

---

### 21.6 Reviews, Notifications & Analytics
- `GET /api/reviews/product/:productId?page=&limit=&sort=`
- `POST /api/reviews/product/:productId` — rating, title, comment, optional image URLs.
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `POST /api/reviews/:id/helpful`

**Notifications**
- `GET /api/notifications?page=&limit=&unreadOnly=true|false`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/preferences` — `{ "notifications": { "email": true, "sms": false, "push": true } }`

**Admin/Analytics (secured to admin role)**
- `GET /api/admin/dashboard`
- `GET /api/admin/analytics`
- Admin CRUD suites:
  - Products: `GET/POST/PUT/DELETE /api/admin/products` (+ `/:id`)
  - Orders: `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PUT /api/admin/orders/:id/status`
  - Users: `GET /api/admin/users`, `GET /api/admin/users/:id`, `PUT /api/admin/users/:id`
  - Categories: `GET/POST/PUT/DELETE /api/admin/categories` (+ `/:id`)

---

### 21.7 Postman Workflow Tips
1. Add _Login_ request Tests tab script:
   ```javascript
   const body = pm.response.json();
   if (body.success && body.data?.token) {
     pm.environment.set("auth_token", body.data.token);
   }
   ```
2. Store `{{auth_token}}` and reuse it for all protected routes.
3. Organize folders (Auth, Products, Cart, Orders, Admin) mirroring the sections above for faster regression passes.

Refer back to this section whenever wiring the Flutter UI to actual backend calls or building automated API tests.
