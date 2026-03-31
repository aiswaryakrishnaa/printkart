# API Documentation for E-Commerce Backend

## Base URL
```
http://localhost:5000/api
```

## Postman Setup & Flutter Screen Mapping

### Environment Prep
- Create an environment such as **E-Com Local** and set:
  - `base_url = http://localhost:5000/api`
  - `email`, `phone`, `password` seed values for demo users
  - `access_token`, `refresh_token`, `product_id`, `cart_item_id`, `order_id`, `address_id` (leave blank initially; populate via Tests scripts)
- Add this **Tests** snippet to `SignIn` / `SignUp` requests to auto-save tokens:
  ```javascript
  const body = pm.response.json();
  if (body?.data?.token) pm.environment.set('access_token', body.data.token);
  if (body?.data?.refreshToken) pm.environment.set('refresh_token', body.data.refreshToken);
  ```
- Configure a collection-level header `Authorization: Bearer {{access_token}}` so authenticated folders inherit it.

### Suggested Collection Structure

| Postman Folder | Flutter Route(s) | Primary Requests |
| --- | --- | --- |
| `0. Health & Config` | `SplashScreen` | `GET {{base_url}}/health`, `GET /auth/refresh`, `GET /users/profile` |
| `1. Auth` | `SignIn`, `SignUp`, `ForgotPassword`, `OtpScreen`, `LoginSuccess` | `POST /auth/register`, `POST /auth/login`, `POST /auth/send-otp`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/logout` |
| `2. Profile` | `CompleteProfileScreen`, `ProfileScreen` | `GET /users/profile`, `PUT /users/profile`, `/users/addresses` CRUD, `POST /users/change-password`, `GET /notifications`, `PUT /notifications/:id/read` |
| `3. Home` | `InitScreen`, `HomeScreen` | `GET /products/search`, `GET /promotions/available`, `GET /products?tag=special`, `GET /products?isPopular=true`, `GET /categories`, `GET /cart`, `GET /notifications?unreadOnly=true` |
| `4. Products` | `ProductsScreen`, `DetailsScreen` | `GET /products`, `GET /products/{{product_id}}`, `/products/{{product_id}}/reviews`, `/products/{{product_id}}/availability`, `/products/related/{{product_id}}`, `GET /products/filters` |
| `5. Wishlist` | `FavoriteScreen` | `GET /wishlist`, `POST /wishlist/add`, `DELETE /wishlist/remove/{{product_id}}` |
| `6. Cart & Checkout` | `CartScreen`, `CheckoutCard` | `GET /cart`, `POST /cart/add`, `PUT /cart/update/{{cart_item_id}}`, `DELETE /cart/remove/{{cart_item_id}}`, `POST /promotions/validate`, `POST /orders/create`, `POST /payments/create-intent`, `POST /payments/confirm`, `GET /payments/:id/status` |
| `7. Orders & Shipping` | Order history/detail flows | `GET /orders`, `GET /orders/{{order_id}}`, `PUT /orders/{{order_id}}/cancel`, `POST /orders/{{order_id}}/return`, `GET /shipping/track/{{order_id}}`, `GET /shipping/options`, `POST /shipping/calculate` |
| `8. Reviews` | `DetailsScreen` review drawer | `GET /reviews/product/{{product_id}}`, `POST /reviews/product/{{product_id}}`, `PUT /reviews/{{id}}`, `DELETE /reviews/{{id}}` |
| `9. Admin` | Admin web dashboard | `/api/admin/*` endpoints grouped by Products, Orders, Users, Categories, Analytics |

### Variable-Harvesting Helpers
Add snippets in Tests tab to capture IDs for reuse:
```javascript
// Example: store first product for Details/Wishlist flows
const res = pm.response.json();
const firstProduct = res?.data?.products?.[0];
if (firstProduct?.id) pm.environment.set('product_id', firstProduct.id);
```
Repeat for cart items, orders, and addresses to keep the entire collection runnable without manual copy/paste.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Request Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "User registered successfully"
}
```

### Login
**POST** `/api/auth/login`

Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
OR
```json
{
  "phone": "+1234567890",
  "password": "password123"
}
```

### Send OTP
**POST** `/api/auth/send-otp`

Request Body:
```json
{
  "phone": "+1234567890"
}
```
OR
```json
{
  "email": "john@example.com"
}
```

### Verify OTP
**POST** `/api/auth/verify-otp`

Request Body:
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### Forgot Password
**POST** `/api/auth/forgot-password`

Request Body:
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**POST** `/api/auth/reset-password`

Request Body:
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

---

## Product Endpoints

### Get All Products
**GET** `/api/products`

Query Parameters:
- `category` - Filter by category ID
- `type` - Filter by type (book, printed_item)
- `search` - Search query
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sortBy` - Sort field (price, rating, createdAt)
- `sortOrder` - Sort order (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

Example: `/api/products?type=book&minPrice=10&maxPrice=50&page=1&limit=20`

### Get Product Details
**GET** `/api/products/:id`

### Search Products
**GET** `/api/products/search?q=query`

### Get Recommended Products
**GET** `/api/products/recommended?limit=10`

### Get Product Availability
**GET** `/api/products/:id/availability`

### Get Related Products
**GET** `/api/products/:id/related?limit=5`

---

## Category Endpoints

### Get All Categories
**GET** `/api/categories?type=book`

### Get Category Details
**GET** `/api/categories/:id`

### Get Category Products
**GET** `/api/categories/:id/products?page=1&limit=20`

---

## Cart Endpoints (Authenticated)

### Get Cart
**GET** `/api/cart`

### Add to Cart
**POST** `/api/cart/add`

Request Body:
```json
{
  "productId": "product-id",
  "quantity": 2,
  "variant": {
    "size": "large",
    "color": "red"
  }
}
```

### Update Cart Item
**PUT** `/api/cart/update/:itemId`

Request Body:
```json
{
  "quantity": 3
}
```

### Remove from Cart
**DELETE** `/api/cart/remove/:itemId`

### Clear Cart
**DELETE** `/api/cart/clear`

---

## Order Endpoints (Authenticated)

### Get Orders
**GET** `/api/orders?status=pending&page=1&limit=10`

### Get Order Details
**GET** `/api/orders/:id`

### Create Order
**POST** `/api/orders/create`

Request Body:
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
  "billingAddress": { ... },
  "paymentMethod": "card",
  "shippingMethod": "standard",
  "couponCode": "DISCOUNT10"
}
```

### Cancel Order
**PUT** `/api/orders/:id/cancel`

Request Body:
```json
{
  "reason": "Changed my mind"
}
```

### Request Return
**POST** `/api/orders/:id/return`

Request Body:
```json
{
  "reason": "Defective product"
}
```

### Track Order
**GET** `/api/orders/:id/tracking`

---

## Payment Endpoints (Authenticated)

### Create Payment Intent
**POST** `/api/payments/create-intent`

Request Body:
```json
{
  "orderId": "order-id",
  "amount": 100.00
}
```

### Confirm Payment
**POST** `/api/payments/confirm`

Request Body:
```json
{
  "orderId": "order-id",
  "paymentId": "payment-id",
  "paymentMethod": "card"
}
```

### Get Payment Status
**GET** `/api/payments/:id/status`

### Process Refund
**POST** `/api/payments/refund`

Request Body:
```json
{
  "orderId": "order-id",
  "amount": 100.00,
  "reason": "Refund reason"
}
```

---

## Review Endpoints

### Get Product Reviews
**GET** `/api/reviews/product/:productId?page=1&limit=10&sort=newest`

### Create Review (Authenticated)
**POST** `/api/reviews/product/:productId`

Request Body:
```json
{
  "rating": 5,
  "title": "Great product!",
  "comment": "Highly recommended",
  "images": ["url1", "url2"]
}
```

### Update Review (Authenticated)
**PUT** `/api/reviews/:id`

### Delete Review (Authenticated)
**DELETE** `/api/reviews/:id`

### Mark Review as Helpful (Authenticated)
**POST** `/api/reviews/:id/helpful`

---

## User Profile Endpoints (Authenticated)

### Step-by-Step Usage Guide

1. **Start the backend**
   - Run `npm install` once, then `npm run dev` (or `npm start`) in the repo root.
   - Verify the server is running via `GET http://localhost:5000/api/health`.
2. **Log in to obtain a JWT**
   - `POST /api/auth/login` with valid credentials.
   - Copy `data.token` from the response; this is used for all user endpoints.
3. **Set up Postman (or similar)**
   - Environment variables:
     - `base_url = http://localhost:5000/api`
     - `auth_token = <JWT from step 2>`
   - Add header `Authorization: Bearer {{auth_token}}` to every request.
   - (Optional) in the login request Tests tab:
     ```javascript
     const body = pm.response.json();
     if (body.success && body.data?.token) {
       pm.environment.set("auth_token", body.data.token);
     }
     ```
4. **Call the endpoints below in any order (all require authentication).** Responses match the implementation in `server/controllers/user.controller.js`.

---

### Get Profile
**GET** `/api/users/profile`

**Purpose:** retrieve the signed-in user (without password) plus their addresses.

**Headers**
```http
Authorization: Bearer {{auth_token}}
```

**Success Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 7,
      "fullName": "John Doe",
      "email": "john@example.com",
      "addresses": [
        {
          "id": 12,
          "type": "home",
          "isDefault": true
        }
      ]
    }
  }
}
```

**Failure Cases**
- `401` if the token is missing/invalid.
- `500` for unexpected errors (see Error Response Format).

---

### Update Profile
**PUT** `/api/users/profile`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "newemail@example.com",
  "phone": "+1234567890",
  "profilePicture": "url-to-image"
}
```

**Success Response**
```json
{
  "success": true,
  "data": { "user": { "...updated fields..." } },
  "message": "Profile updated successfully"
}
```

**Validation Errors (`400 VALIDATION_ERROR`)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "msg": "Invalid value",
        "path": "email",
        "...": "..."
      }
    ]
  }
}
```

---

### Get Addresses
**GET** `/api/users/addresses`

**Success Response**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": 12,
        "type": "home",
        "fullName": "John Doe",
        "city": "New York",
        "isDefault": true
      }
    ]
  }
}
```

---

### Add Address
**POST** `/api/users/addresses`

**Request Body:**
```json
{
  "type": "home",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

**Behavior**
- If `isDefault` is `true`, all other addresses for the user are automatically set to `isDefault: false` before insertion.

**Response (`201 Created`)**
```json
{
  "success": true,
  "data": { "address": { "...saved address..." } },
  "message": "Address added successfully"
}
```

---

### Update Address
**PUT** `/api/users/addresses/:id`

**Notes**
- `:id` must belong to the authenticated user, otherwise a `404 ADDRESS_NOT_FOUND` error is returned.
- Setting `isDefault = true` clears the flag on every other address automatically.

**Success Response**
```json
{
  "success": true,
  "data": { "address": { "...updated..." } },
  "message": "Address updated successfully"
}
```

---

### Delete Address
**DELETE** `/api/users/addresses/:id`

**Response**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Error**
- `404 ADDRESS_NOT_FOUND` if the address does not belong to the user.

---

### Change Password
**POST** `/api/users/change-password`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Scenarios**
- `400 INVALID_PASSWORD` when the current password is wrong.
- `400 VALIDATION_ERROR` if `newPassword` is under 6 characters.

---

### Quick Postman Checklist
1. Run the login request first and store `auth_token` via the provided test script.
2. Keep a shared `Authorization` header (or use Postman’s “Authorization” tab with the bearer token).
3. Duplicate the sample payloads above to test success and failure paths.
4. Group the requests inside a “User Module” folder for easy regression testing.

---

## Wishlist Endpoints (Authenticated)

### Get Wishlist
**GET** `/api/wishlist`

### Add to Wishlist
**POST** `/api/wishlist/add`

Request Body:
```json
{
  "productId": "product-id"
}
```

### Remove from Wishlist
**DELETE** `/api/wishlist/remove/:productId`

---

## Notification Endpoints (Authenticated)

### Get Notifications
**GET** `/api/notifications?page=1&limit=20&unreadOnly=true`

### Mark as Read
**PUT** `/api/notifications/:id/read`

### Update Preferences
**PUT** `/api/notifications/preferences`

Request Body:
```json
{
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  }
}
```

---

## Promotion Endpoints

### Get Available Promotions
**GET** `/api/promotions/available`

### Validate Promo Code (Authenticated)
**POST** `/api/promotions/validate`

Request Body:
```json
{
  "code": "DISCOUNT10",
  "amount": 100.00
}
```

---

## Shipping Endpoints

### Get Shipping Options
**GET** `/api/shipping/options`

### Calculate Shipping
**POST** `/api/shipping/calculate`

Request Body:
```json
{
  "address": { ... },
  "items": [{ "productId": "...", "quantity": 2 }],
  "shippingMethod": "standard"
}
```

### Track Shipment (Authenticated)
**GET** `/api/shipping/track/:orderId`

---

## Admin Endpoints (Admin Only)

### Dashboard Stats
**GET** `/api/admin/dashboard`

### Products Management
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `GET /api/admin/products/:id` - Get product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Orders Management
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order
- `PUT /api/admin/orders/:id/status` - Update order status

### Users Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user
- `PUT /api/admin/users/:id` - Update user

### Categories Management
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Analytics
**GET** `/api/admin/analytics`

---

## Error Response Format

All errors follow this format:

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

Common Error Codes:
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INVALID_TOKEN` - Invalid or expired token

---

## Postman Collection

Import the API endpoints into Postman for easy testing:

1. Create a new collection "E-Commerce API"
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token (updated after login)
3. Add all endpoints listed above
4. Use `{{base_url}}` and `{{token}}` in requests

---


