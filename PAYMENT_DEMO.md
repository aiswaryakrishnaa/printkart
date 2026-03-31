# Payment & Order Demo API

This document describes the demo payment and order placement endpoints.

## Endpoints

### 1. Place Order with Payment (Combined - Recommended for Demo)
**POST** `/api/payments/place-order`

Creates an order and processes payment in one request. Perfect for demo/testing.

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "name": "Product Name",
      "image": "product-image.jpg",
      "quantity": 2,
      "price": 29.99,
      "total": 59.98,
      "variant": null
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "1234567890",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "phone": "1234567890",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "card",
  "shippingMethod": "standard",
  "couponCode": null,
  "paymentId": "pay_demo_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "1",
      "orderNumber": "ORD-1234567890-0001",
      "paymentStatus": "completed",
      "orderStatus": "confirmed",
      "total": 65.98,
      "items": [...]
    }
  },
  "message": "Order placed and payment completed successfully"
}
```

**Note:** If `items` is empty or not provided, it will use items from the user's cart.

---

### 2. Create Payment Intent (For Existing Order)
**POST** `/api/payments/create-intent`

Creates a payment intent for an existing order.

**Request Body:**
```json
{
  "orderId": 1,
  "amount": 65.98
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "pi_1234567890_abc123",
      "clientSecret": "mock_client_secret_1234567890_abc123",
      "amount": 65.98,
      "currency": "USD",
      "status": "requires_payment_method",
      "orderId": "1"
    }
  }
}
```

---

### 3. Confirm Payment (For Existing Order)
**POST** `/api/payments/confirm`

Confirms payment for an existing order.

**Request Body:**
```json
{
  "orderId": 1,
  "paymentId": "pay_1234567890",
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "1",
      "orderNumber": "ORD-1234567890-0001",
      "paymentStatus": "completed",
      "orderStatus": "confirmed",
      ...
    }
  },
  "message": "Payment confirmed successfully"
}
```

---

### 4. Get Payment Status
**GET** `/api/payments/:id/status`

Get payment status by payment ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentStatus": "completed",
    "orderId": "1",
    "amount": 65.98
  }
}
```

---

### 5. Process Refund
**POST** `/api/payments/refund`

Process a refund for an order.

**Request Body:**
```json
{
  "orderId": 1,
  "amount": 65.98,
  "reason": "Customer requested refund"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "1",
      "orderNumber": "ORD-1234567890-0001",
      "paymentStatus": "refunded",
      ...
    }
  },
  "message": "Refund processed successfully"
}
```

---

## Demo Flow Examples

### Flow 1: Place Order Directly (Simplest)
1. User adds items to cart
2. Call `POST /api/payments/place-order` with shipping address
3. Order is created and payment is automatically processed (demo mode)

### Flow 2: Two-Step Payment (More Realistic)
1. Create order: `POST /api/orders/create`
2. Create payment intent: `POST /api/payments/create-intent`
3. Confirm payment: `POST /api/payments/confirm`

---

## Payment Methods Supported

- `card` - Credit/Debit Card (demo)
- `paypal` - PayPal (demo)
- `google_pay` - Google Pay (demo)
- `apple_pay` - Apple Pay (demo)
- `upi` - UPI (demo)
- `cod` - Cash on Delivery
- `bank_transfer` - Bank Transfer (demo)

---

## Important Notes

⚠️ **This is a DEMO implementation** - No real payment gateway is integrated. All payments are simulated and automatically succeed.

- Payment intents are mock objects
- Payment confirmations are automatically successful
- No actual money is processed
- Suitable for development and testing only

For production, integrate with a real payment gateway like:
- Stripe
- PayPal
- Razorpay
- Square
- etc.

