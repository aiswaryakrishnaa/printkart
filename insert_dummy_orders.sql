-- =====================================================
-- DUMMY ORDER DATA INSERTION SCRIPT
-- This script inserts sample orders into the database
-- Based on existing data:
--   User ID 1: John Doe (customer)
--   Product ID 1: ejrhjrjrh product (price: 1233.00)
-- =====================================================

-- Insert Order 1: Pending Order (New Order)
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `orderStatus`, `shippingMethod`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-001',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '123 Main Street',
        'addressLine2', 'Apt 4B',
        'city', 'New York',
        'state', 'NY',
        'zipCode', '10001',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '123 Main Street',
        'addressLine2', 'Apt 4B',
        'city', 'New York',
        'state', 'NY',
        'zipCode', '10001',
        'country', 'United States'
    ),
    1233.00, -- subtotal
    15.00,   -- shipping cost
    98.64,   -- tax (8% of subtotal)
    0.00,    -- discount
    1346.64, -- total
    'card',
    'pending',
    'pending',
    'Standard Shipping',
    NOW(),
    NOW()
);

-- Insert Order Item for Order 1
INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    1, -- Will be set to the inserted order ID
    1, -- Product ID
    'ejrhjrjrh',
    'images-1762314511284-921842928.jpg',
    1,
    1233.00,
    1233.00,
    NOW(),
    NOW()
);

-- Insert Order 2: Processing Order (Card Payment Processing)
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `couponCode`, `total`,
    `paymentMethod`, `paymentStatus`, `paymentId`, `orderStatus`, `statusHistory`,
    `shippingMethod`, `estimatedDelivery`, `notes`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-002',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '456 Oak Avenue',
        'city', 'Los Angeles',
        'state', 'CA',
        'zipCode', '90001',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '456 Oak Avenue',
        'city', 'Los Angeles',
        'state', 'CA',
        'zipCode', '90001',
        'country', 'United States'
    ),
    2466.00, -- subtotal (2 items)
    25.00,   -- shipping cost
    199.28,  -- tax (8% of subtotal)
    50.00,   -- discount
    'SAVE50', -- coupon code
    2640.28, -- total
    'paypal',
    'processing',
    'pay_abc123xyz',
    'processing',
    JSON_ARRAY(
        JSON_OBJECT('status', 'pending', 'changedAt', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
        JSON_OBJECT('status', 'processing', 'changedAt', DATE_SUB(NOW(), INTERVAL 1 HOUR))
    ),
    'Express Shipping',
    DATE_ADD(NOW(), INTERVAL 3 DAY),
    'Please deliver during business hours.',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    NOW()
);

-- Insert Order Items for Order 2 (2 items)
INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES
(2, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 2, 1233.00, 2466.00, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW());

-- Insert Order 3: Confirmed Order (Payment Completed)
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `paymentId`, `orderStatus`, `statusHistory`,
    `shippingMethod`, `estimatedDelivery`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-003',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '789 Pine Road',
        'addressLine2', 'Suite 200',
        'city', 'Chicago',
        'state', 'IL',
        'zipCode', '60601',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '789 Pine Road',
        'addressLine2', 'Suite 200',
        'city', 'Chicago',
        'state', 'IL',
        'zipCode', '60601',
        'country', 'United States'
    ),
    1233.00,
    10.00,
    99.44,
    0.00,
    1342.44,
    'card',
    'completed',
    'pmt_def456uvw',
    'confirmed',
    JSON_ARRAY(
        JSON_OBJECT('status', 'pending', 'changedAt', DATE_SUB(NOW(), INTERVAL 5 DAY)),
        JSON_OBJECT('status', 'processing', 'changedAt', DATE_SUB(NOW(), INTERVAL 4 DAY)),
        JSON_OBJECT('status', 'confirmed', 'changedAt', DATE_SUB(NOW(), INTERVAL 3 DAY))
    ),
    'Standard Shipping',
    DATE_ADD(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY)
);

INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    3, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 1, 1233.00, 1233.00,
    DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- Insert Order 4: Shipped Order (With Tracking)
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `paymentId`, `orderStatus`, `statusHistory`,
    `shippingMethod`, `trackingNumber`, `trackingUrl`, `estimatedDelivery`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-004',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '321 Elm Street',
        'city', 'Houston',
        'state', 'TX',
        'zipCode', '77001',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '321 Elm Street',
        'city', 'Houston',
        'state', 'TX',
        'zipCode', '77001',
        'country', 'United States'
    ),
    3699.00, -- 3 items
    30.00,
    298.32,
    100.00, -- discount
    3927.32,
    'upi',
    'completed',
    'upi_ghi789rst',
    'shipped',
    JSON_ARRAY(
        JSON_OBJECT('status', 'pending', 'changedAt', DATE_SUB(NOW(), INTERVAL 7 DAY)),
        JSON_OBJECT('status', 'processing', 'changedAt', DATE_SUB(NOW(), INTERVAL 6 DAY)),
        JSON_OBJECT('status', 'confirmed', 'changedAt', DATE_SUB(NOW(), INTERVAL 5 DAY)),
        JSON_OBJECT('status', 'shipped', 'changedAt', DATE_SUB(NOW(), INTERVAL 2 DAY))
    ),
    'Express Shipping',
    'TRK123456789',
    'https://tracking.example.com/TRK123456789',
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY)
);

INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    4, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 3, 1233.00, 3699.00,
    DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)
);

-- Insert Order 5: Out for Delivery
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `paymentId`, `orderStatus`, `statusHistory`,
    `shippingMethod`, `trackingNumber`, `trackingUrl`, `estimatedDelivery`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-005',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '555 Maple Drive',
        'city', 'Phoenix',
        'state', 'AZ',
        'zipCode', '85001',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '555 Maple Drive',
        'city', 'Phoenix',
        'state', 'AZ',
        'zipCode', '85001',
        'country', 'United States'
    ),
    1233.00,
    20.00,
    100.24,
    0.00,
    1353.24,
    'cod',
    'pending', -- COD payment is pending until delivery
    NULL,
    'out_for_delivery',
    JSON_ARRAY(
        JSON_OBJECT('status', 'pending', 'changedAt', DATE_SUB(NOW(), INTERVAL 10 DAY)),
        JSON_OBJECT('status', 'processing', 'changedAt', DATE_SUB(NOW(), INTERVAL 9 DAY)),
        JSON_OBJECT('status', 'confirmed', 'changedAt', DATE_SUB(NOW(), INTERVAL 8 DAY)),
        JSON_OBJECT('status', 'shipped', 'changedAt', DATE_SUB(NOW(), INTERVAL 4 DAY)),
        JSON_OBJECT('status', 'out_for_delivery', 'changedAt', DATE_SUB(NOW(), INTERVAL 1 DAY))
    ),
    'Standard Shipping',
    'TRK987654321',
    'https://tracking.example.com/TRK987654321',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    5, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 1, 1233.00, 1233.00,
    DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- Insert Order 6: Delivered Order
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `paymentId`, `orderStatus`, `statusHistory`,
    `shippingMethod`, `trackingNumber`, `deliveredAt`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-006',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '888 Cedar Lane',
        'city', 'Philadelphia',
        'state', 'PA',
        'zipCode', '19101',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '888 Cedar Lane',
        'city', 'Philadelphia',
        'state', 'PA',
        'zipCode', '19101',
        'country', 'United States'
    ),
    2466.00, -- 2 items
    15.00,
    198.48,
    0.00,
    2679.48,
    'card',
    'completed',
    'pmt_jkl012mno',
    'delivered',
    JSON_ARRAY(
        JSON_OBJECT('status', 'pending', 'changedAt', DATE_SUB(NOW(), INTERVAL 15 DAY)),
        JSON_OBJECT('status', 'processing', 'changedAt', DATE_SUB(NOW(), INTERVAL 14 DAY)),
        JSON_OBJECT('status', 'confirmed', 'changedAt', DATE_SUB(NOW(), INTERVAL 13 DAY)),
        JSON_OBJECT('status', 'shipped', 'changedAt', DATE_SUB(NOW(), INTERVAL 10 DAY)),
        JSON_OBJECT('status', 'out_for_delivery', 'changedAt', DATE_SUB(NOW(), INTERVAL 8 DAY)),
        JSON_OBJECT('status', 'delivered', 'changedAt', DATE_SUB(NOW(), INTERVAL 7 DAY))
    ),
    'Express Shipping',
    'TRK555888777',
    'https://tracking.example.com/TRK555888777',
    DATE_SUB(NOW(), INTERVAL 7 DAY), -- deliveredAt
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    DATE_SUB(NOW(), INTERVAL 7 DAY)
);

INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    6, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 2, 1233.00, 2466.00,
    DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)
);

-- Insert Order 7: Cancelled Order
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `orderStatus`, `statusHistory`,
    `cancelledAt`, `cancellationReason`, `notes`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-007',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '999 Birch Boulevard',
        'city', 'San Antonio',
        'state', 'TX',
        'zipCode', '78201',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '999 Birch Boulevard',
        'city', 'San Antonio',
        'state', 'TX',
        'zipCode', '78201',
        'country', 'United States'
    ),
    1233.00,
    15.00,
    99.84,
    0.00,
    1347.84,
    'card',
    'refunded',
    'cancelled',
    JSON_ARRAY(
        JSON_OBJECT('status', 'pending', 'changedAt', DATE_SUB(NOW(), INTERVAL 12 DAY)),
        JSON_OBJECT('status', 'cancelled', 'changedAt', DATE_SUB(NOW(), INTERVAL 11 DAY), 'note', 'Customer requested cancellation')
    ),
    DATE_SUB(NOW(), INTERVAL 11 DAY), -- cancelledAt
    'Customer requested to cancel the order due to change of mind.',
    'Order was cancelled by customer request. Refund processed.',
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    DATE_SUB(NOW(), INTERVAL 11 DAY)
);

INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    7, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 1, 1233.00, 1233.00,
    DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY)
);

-- Insert Order 8: Failed Payment Order
INSERT INTO `orders` (
    `orderNumber`, `userId`, `shippingAddress`, `billingAddress`,
    `subtotal`, `shippingCost`, `tax`, `discount`, `total`,
    `paymentMethod`, `paymentStatus`, `orderStatus`, `notes`,
    `createdAt`, `updatedAt`
) VALUES (
    'ORD-2025-008',
    1, -- John Doe
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '777 Spruce Street',
        'city', 'San Diego',
        'state', 'CA',
        'zipCode', '92101',
        'country', 'United States'
    ),
    JSON_OBJECT(
        'fullName', 'John Doe',
        'phone', '9876543210',
        'addressLine1', '777 Spruce Street',
        'city', 'San Diego',
        'state', 'CA',
        'zipCode', '92101',
        'country', 'United States'
    ),
    1233.00,
    20.00,
    100.24,
    0.00,
    1353.24,
    'card',
    'failed',
    'pending',
    'Payment failed due to insufficient funds. Order is pending payment retry.',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    NOW()
);

INSERT INTO `order_items` (
    `orderId`, `productId`, `name`, `image`, `quantity`, `price`, `total`,
    `createdAt`, `updatedAt`
) VALUES (
    8, 1, 'ejrhjrjrh', 'images-1762314511284-921842928.jpg', 1, 1233.00, 1233.00,
    DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()
);

-- =====================================================
-- Summary of inserted orders:
-- 1. ORD-2025-001: Pending order (new)
-- 2. ORD-2025-002: Processing order (with coupon)
-- 3. ORD-2025-003: Confirmed order
-- 4. ORD-2025-004: Shipped order (with tracking)
-- 5. ORD-2025-005: Out for delivery (COD)
-- 6. ORD-2025-006: Delivered order
-- 7. ORD-2025-007: Cancelled order (with refund)
-- 8. ORD-2025-008: Failed payment order
-- =====================================================
