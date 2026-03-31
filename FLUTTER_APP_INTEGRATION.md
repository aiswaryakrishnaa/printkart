# Flutter App - Payment & Order Integration

This document describes the Flutter app integration with the backend payment and order APIs.

## What Was Created

### 1. Payment Service (`lib/services/payment_service.dart`)
- `PaymentIntent` model for payment intents
- `PaymentService` class with methods:
  - `createPaymentIntent()` - Create payment intent for existing order
  - `confirmPayment()` - Confirm payment for existing order
  - `placeOrderWithPayment()` - Combined endpoint to place order with payment (recommended)
  - `getPaymentStatus()` - Get payment status by payment ID
  - `processRefund()` - Process refund for an order

### 2. Updated Order Service (`lib/services/order_service.dart`)
- Added `placeOrderWithPayment()` method that uses the combined payment endpoint

### 3. Checkout Screen (`lib/screens/checkout/checkout_screen.dart`)
A complete checkout screen with:
- **Shipping Address Selection**: Dropdown to select from saved addresses
- **Billing Address**: Option to use same as shipping or select different
- **Payment Method Selection**: Radio buttons for:
  - Credit/Debit Card 💳
  - PayPal 🅿️
  - Google Pay G
  - Apple Pay 🍎
  - UPI 📱
  - Cash on Delivery 💵
- **Order Summary**: Shows subtotal, tax, shipping, and total
- **Place Order Button**: Processes the order with payment

### 4. Updated Cart Screen (`lib/screens/cart/cart_screen.dart`)
- Updated checkout button to navigate to checkout screen
- Validates cart is not empty before checkout

### 5. Updated Routes (`lib/routes.dart`)
- Added checkout screen route

## How to Use

### Flow 1: Direct Checkout (Recommended)
1. User adds items to cart
2. User clicks "Check Out" in cart screen
3. User selects shipping address, billing address, and payment method
4. User clicks "Place Order"
5. Order is created and payment is processed automatically (demo mode)
6. Cart is cleared
7. User is redirected to home screen

### Flow 2: Two-Step Payment
1. Create order: `OrderService.createOrder()`
2. Create payment intent: `PaymentService.createPaymentIntent()`
3. Confirm payment: `PaymentService.confirmPayment()`

## API Endpoints Used

- `POST /api/payments/place-order` - Place order with payment (combined)
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id/status` - Get payment status
- `POST /api/payments/refund` - Process refund
- `GET /api/users/addresses` - Get user addresses

## Configuration

Make sure your `AppConfig.baseUrl` is correctly set:
- For Android emulator: `http://127.0.0.1:5000/api` (with `adb reverse tcp:5000 tcp:5000`)
- For iOS simulator: `http://localhost:5000/api`
- For web: `http://localhost:5000/api`

## Demo Mode

⚠️ **Important**: The payment system is in **DEMO MODE**:
- All payments automatically succeed
- No real payment gateway integration
- Suitable for development and testing only

## Testing Checklist

- [ ] Add items to cart
- [ ] Navigate to checkout screen
- [ ] Select shipping address
- [ ] Select payment method
- [ ] Place order
- [ ] Verify order is created
- [ ] Verify cart is cleared
- [ ] Check order in orders list

## Next Steps for Production

1. Integrate real payment gateway (Stripe, PayPal, Razorpay, etc.)
2. Add payment form UI for card details
3. Add payment verification and error handling
4. Add order confirmation screen
5. Add order tracking screen
6. Add order history screen

## Files Modified/Created

### Created:
- `lib/services/payment_service.dart`
- `lib/screens/checkout/checkout_screen.dart`
- `FLUTTER_APP_INTEGRATION.md` (this file)

### Modified:
- `lib/services/order_service.dart` - Added `placeOrderWithPayment()` method
- `lib/screens/cart/cart_screen.dart` - Updated checkout button
- `lib/routes.dart` - Added checkout route

