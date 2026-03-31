const prisma = require('../config/prisma');

// Helper function to generate order number
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
};

// Helper function to normalize images
const normalizeImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [images];
    }
  }
  return [images];
};

// Get Orders
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) {
      where.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    // Format orders for response
    const formattedOrders = orders.map(order => ({
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
      statusHistory: order.statusHistory || [],
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      items: order.items.map(item => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0),
        total: typeof item.total === 'object' ? parseFloat(item.total.toString()) : parseFloat(item.total || 0),
        variant: item.variant,
        product: item.product ? {
          id: item.product.id.toString(),
          name: item.product.name,
          price: typeof item.product.price === 'object' ? parseFloat(item.product.price.toString()) : parseFloat(item.product.price || 0)
        } : null
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    next(error);
  }
};

// Get Single Order
exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
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
      statusHistory: order.statusHistory || [],
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      items: order.items.map(item => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0),
        total: typeof item.total === 'object' ? parseFloat(item.total.toString()) : parseFloat(item.total || 0),
        variant: item.variant,
        product: item.product ? {
          id: item.product.id.toString(),
          name: item.product.name,
          price: typeof item.product.price === 'object' ? parseFloat(item.product.price.toString()) : parseFloat(item.product.price || 0)
        } : null
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      data: { order: formattedOrder }
    });
  } catch (error) {
    console.error('Get order error:', error);
    next(error);
  }
};

// Create Order
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      couponCode
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
        const images = normalizeImages(product.images);
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
        orderStatus: paymentMethod === 'cod' ? 'pending' : 'processing',
        paymentStatus: 'pending',
        statusHistory: [{
          status: paymentMethod === 'cod' ? 'pending' : 'processing',
          note: 'Order created',
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
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

// Cancel Order
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
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

    if (!['pending', 'processing', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: 'Order cannot be cancelled at this stage'
        }
      });
    }

    // Update order status
    const statusHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
    statusHistory.push({
      status: 'cancelled',
      note: reason || 'Cancelled by user',
      timestamp: new Date().toISOString()
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        statusHistory
      }
    });

    // Restore stock
    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: product.stockQuantity + item.quantity,
            soldCount: Math.max(0, product.soldCount - item.quantity)
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    next(error);
  }
};

// Request Return
exports.requestReturn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
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

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only delivered orders can be returned'
        }
      });
    }

    const statusHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
    statusHistory.push({
      status: 'returned',
      note: reason || 'Return requested by user',
      timestamp: new Date().toISOString()
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'returned',
        statusHistory
      }
    });

    res.json({
      success: true,
      message: 'Return request submitted successfully'
    });
  } catch (error) {
    console.error('Request return error:', error);
    next(error);
  }
};

// Get Order Tracking
exports.getOrderTracking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      select: {
        orderStatus: true,
        statusHistory: true,
        trackingNumber: true,
        trackingUrl: true,
        estimatedDelivery: true
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

    res.json({
      success: true,
      data: {
        orderStatus: order.orderStatus,
        statusHistory: order.statusHistory || [],
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Get order tracking error:', error);
    next(error);
  }
};
