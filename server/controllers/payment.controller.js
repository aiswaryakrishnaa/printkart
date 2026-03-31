const prisma = require('../config/prisma');

// Create Payment Intent (Demo - No real gateway integration)
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    // Demo payment intent - no real gateway integration
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientSecret: `mock_client_secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: typeof order.total === 'object' ? parseFloat(order.total.toString()) : parseFloat(order.total || 0),
      currency: 'USD',
      status: 'requires_payment_method',
      orderId: order.id.toString()
    };

    res.json({
      success: true,
      data: { paymentIntent }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    next(error);
  }
};

// Confirm Payment (Demo - Simulates successful payment)
exports.confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, paymentMethod } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    // Demo payment confirmation - simulate successful payment
    const statusHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
    statusHistory.push({
      status: 'confirmed',
      note: 'Payment confirmed (Demo)',
      timestamp: new Date().toISOString()
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'completed',
        paymentId: paymentId || `pay_${Date.now()}`,
        paymentMethod: paymentMethod || order.paymentMethod,
        orderStatus: 'confirmed',
        statusHistory
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Format order for response
    const formattedOrder = {
      id: updatedOrder.id.toString(),
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId.toString(),
      shippingAddress: updatedOrder.shippingAddress,
      billingAddress: updatedOrder.billingAddress,
      subtotal: typeof updatedOrder.subtotal === 'object' ? parseFloat(updatedOrder.subtotal.toString()) : parseFloat(updatedOrder.subtotal || 0),
      shippingCost: typeof updatedOrder.shippingCost === 'object' ? parseFloat(updatedOrder.shippingCost.toString()) : parseFloat(updatedOrder.shippingCost || 0),
      tax: typeof updatedOrder.tax === 'object' ? parseFloat(updatedOrder.tax.toString()) : parseFloat(updatedOrder.tax || 0),
      discount: typeof updatedOrder.discount === 'object' ? parseFloat(updatedOrder.discount.toString()) : parseFloat(updatedOrder.discount || 0),
      total: typeof updatedOrder.total === 'object' ? parseFloat(updatedOrder.total.toString()) : parseFloat(updatedOrder.total || 0),
      paymentMethod: updatedOrder.paymentMethod,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
      paymentId: updatedOrder.paymentId,
      statusHistory: updatedOrder.statusHistory || [],
      items: updatedOrder.items.map(item => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0),
        total: typeof item.total === 'object' ? parseFloat(item.total.toString()) : parseFloat(item.total || 0),
        variant: item.variant
      })),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt
    };

    res.json({
      success: true,
      data: { order: formattedOrder },
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    next(error);
  }
};

// Place Order with Payment (Combined endpoint for demo)
exports.placeOrderWithPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod = 'card',
      shippingMethod,
      couponCode,
      paymentId
    } = req.body;

    // Get cart if items not provided
    let orderItems = items;
    if (!orderItems || orderItems.length === 0) {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMPTY_CART',
            message: 'Cart is empty'
          }
        });
      }

      // Format cart items as order items
      orderItems = await Promise.all(cart.items.map(async (item) => {
        const product = item.product;
        const images = product.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]')) : [];
        const firstImage = images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url || images[0].path || '') : '';
        const itemPrice = typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0);
        const itemQuantity = item.quantity;

        return {
          productId: product.id,
          name: product.name,
          image: firstImage,
          quantity: itemQuantity,
          price: itemPrice,
          total: itemPrice * itemQuantity,
          variant: item.variant || null
        };
      }));
    }

    // Calculate totals
    let subtotal = orderItems.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
      return sum + (price * item.quantity);
    }, 0);
    let shippingCost = 0; // TODO: Calculate based on shipping method
    let tax = subtotal * 0.1; // 10% tax (adjust as needed)
    let discount = 0; // TODO: Calculate from coupon
    let total = subtotal + shippingCost + tax - discount;

    // Generate order number
    const generateOrderNumber = () => {
      return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    };

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        paymentMethod,
        shippingMethod,
        couponCode,
        paymentId: paymentId || `pay_${Date.now()}`,
        orderStatus: paymentMethod === 'cod' ? 'pending' : 'confirmed',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        statusHistory: [{
          status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
          note: paymentMethod === 'cod' ? 'Order created - Cash on Delivery' : 'Order created and payment completed (Demo)',
          timestamp: new Date().toISOString()
        }],
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            name: item.name,
            image: item.image || '',
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            variant: item.variant || null
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update product stock and sold count
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
            soldCount: product.soldCount + item.quantity
          }
        });
      }
    }

    // Clear cart items
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    // Format order for response
    const formattedOrder = {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      subtotal: typeof order.subtotal === 'object' ? parseFloat(order.subtotal.toString()) : parseFloat(order.subtotal || 0),
      shippingCost: typeof order.shippingCost === 'object' ? parseFloat(order.shippingCost.toString()) : parseFloat(order.shippingCost || 0),
      tax: typeof order.tax === 'object' ? parseFloat(order.tax.toString()) : parseFloat(order.tax || 0),
      discount: typeof order.discount === 'object' ? parseFloat(order.discount.toString()) : parseFloat(order.discount || 0),
      total: typeof order.total === 'object' ? parseFloat(order.total.toString()) : parseFloat(order.total || 0),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentId: order.paymentId,
      statusHistory: order.statusHistory || [],
      items: order.items.map(item => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0),
        total: typeof item.total === 'object' ? parseFloat(item.total.toString()) : parseFloat(item.total || 0),
        variant: item.variant
      })),
      createdAt: order.createdAt
    };

    res.status(201).json({
      success: true,
      data: { order: formattedOrder },
      message: 'Order placed and payment completed successfully'
    });
  } catch (error) {
    console.error('Place order with payment error:', error);
    next(error);
  }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        paymentId: id,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderId: order.id.toString(),
        amount: typeof order.total === 'object' ? parseFloat(order.total.toString()) : parseFloat(order.total || 0)
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    next(error);
  }
};

// Process Refund
exports.processRefund = async (req, res, next) => {
  try {
    const { orderId, amount, reason } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    // Demo refund processing
    const statusHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
    statusHistory.push({
      status: 'refunded',
      note: reason || 'Refund processed (Demo)',
      timestamp: new Date().toISOString()
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'refunded',
        statusHistory
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Format order for response
    const formattedOrder = {
      id: updatedOrder.id.toString(),
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
      statusHistory: updatedOrder.statusHistory || []
    };

    res.json({
      success: true,
      data: { order: formattedOrder },
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    next(error);
  }
};
