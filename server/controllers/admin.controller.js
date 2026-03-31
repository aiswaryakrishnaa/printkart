const { prisma, User } = require('../models');

// Helper function to normalize images from JSON field
const normalizeImages = (images) => {
  if (!images) return null;
  // If it's already an array, return it
  if (Array.isArray(images)) return images;
  // If it's a string, try to parse it
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // If parsing fails, treat as single image string
      return [images];
    }
  }
  // If it's a single value, wrap in array
  return [images];
};

// Get Dashboard Stats
exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    // Calculate total revenue
    const revenueResult = await prisma.order.aggregate({
      where: { paymentStatus: 'completed' },
      _sum: { total: true }
    });

    // Get recent orders for activity feed
    const recentOrders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    });

    // Get sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'completed',
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by month
    const monthlySales = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]}`;
      monthlySales[label] = 0;
    }

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const label = monthNames[date.getMonth()];
      if (monthlySales[label] !== undefined) {
        monthlySales[label] += Number(order.total || 0);
      }
    });

    const salesChartData = Object.entries(monthlySales).map(([name, total]) => ({ name, total }));

    // Get top selling products
    const productsRaw = await prisma.product.findMany({
      orderBy: { stockQuantity: 'asc' }, // Low stock products
      take: 5
    });

    const topProducts = productsRaw.map(p => ({
      id: p.id,
      title: p.name, // Map name to title for frontend compatibility
      price: Number(p.price),
      stock: p.stockQuantity, // Map stockQuantity to stock for frontend
      image: p.images && Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
    }));

    // Get newest users
    const newUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: revenueResult._sum.total ? Number(revenueResult._sum.total) : 0
        },
        recentOrders,
        salesChartData,
        topProducts,
        newUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Product Management
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Normalize images for each product
    const normalizedProducts = products.map(product => ({
      ...product,
      images: normalizeImages(product.images)
    }));

    const total = await prisma.product.count({ where });

    res.json({
      success: true,
      data: {
        products: normalizedProducts,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    // Process uploaded images
    const images = req.files && req.files.length > 0
      ? req.files.map(file => file.filename)
      : (req.body.images ? (Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images || '[]')) : []);

    // Generate slug from name if not provided
    const slug = req.body.slug || req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Prepare product data
    const productData = {
      ...req.body,
      slug,
      categoryId: parseInt(req.body.categoryId || req.body.category),
      price: parseFloat(req.body.price),
      compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : null,
      costPrice: req.body.costPrice ? parseFloat(req.body.costPrice) : null,
      stockQuantity: parseInt(req.body.stockQuantity || req.body.stock?.quantity || 0),
      images: images.length > 0 ? images : null,
      type: req.body.type || 'book',
      status: req.body.status || 'active'
    };

    // Remove category field if present (use categoryId instead)
    delete productData.category;

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true
      }
    });
    // Normalize images
    const normalizedProduct = {
      ...product,
      images: normalizeImages(product.images)
    };
    res.status(201).json({
      success: true,
      data: { product: normalizedProduct }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true
      }
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }
    // Normalize images
    const normalizedProduct = {
      ...product,
      images: normalizeImages(product.images)
    };
    res.json({ success: true, data: { product: normalizedProduct } });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    // Get existing product to merge images
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    // Process uploaded images
    let images = [];

    // If images are provided in body as JSON string (existing images that user wants to keep)
    if (req.body.images && typeof req.body.images === 'string') {
      try {
        images = JSON.parse(req.body.images);
      } catch (e) {
        // If not valid JSON, treat as empty
        images = [];
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    } else {
      // If no images in body, keep existing images
      images = existingProduct.images
        ? (Array.isArray(existingProduct.images) ? existingProduct.images : [existingProduct.images])
        : [];
    }

    // Add newly uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      images = [...images, ...newImages];
    }

    // Generate slug from name if name changed and slug not provided
    let slug = req.body.slug || existingProduct.slug;
    if (req.body.name && req.body.name !== existingProduct.name && !req.body.slug) {
      slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      slug,
      images: images.length > 0 ? images : null
    };

    // Handle category
    if (req.body.categoryId) {
      updateData.categoryId = parseInt(req.body.categoryId);
    } else if (req.body.category) {
      updateData.categoryId = parseInt(req.body.category);
    }
    delete updateData.category;

    // Handle numeric fields
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.compareAtPrice) updateData.compareAtPrice = parseFloat(req.body.compareAtPrice);
    if (req.body.costPrice) updateData.costPrice = parseFloat(req.body.costPrice);
    if (req.body.stockQuantity !== undefined) updateData.stockQuantity = parseInt(req.body.stockQuantity);
    if (req.body.stock?.quantity !== undefined) {
      updateData.stockQuantity = parseInt(req.body.stock.quantity);
      delete updateData.stock;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        category: true
      }
    });
    // Normalize images
    const normalizedProduct = {
      ...product,
      images: normalizeImages(product.images)
    };
    res.json({ success: true, data: { product: normalizedProduct } });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }
    next(error);
  }
};

// Upload Product Images
exports.uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No files uploaded' }
      });
    }

    const imageUrls = req.files.map(file => file.filename);

    res.json({
      success: true,
      data: {
        images: imageUrls,
        message: `${imageUrls.length} image(s) uploaded successfully`
      }
    });
  } catch (error) {
    next(error);
  }
};

// Order Management
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { orderStatus: status } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }
    // Normalize product images in order items for consistency
    const normalizedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          images: normalizeImages(item.product.images)
        } : null
      }))
    };
    res.json({ success: true, data: { order: normalizedOrder } });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const orderId = parseInt(req.params.id);

    // Get current order to update statusHistory
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }

    // Update status history (JSON field)
    const statusHistory = currentOrder.statusHistory
      ? (Array.isArray(currentOrder.statusHistory) ? currentOrder.statusHistory : [])
      : [];

    statusHistory.push({
      status,
      note,
      changedAt: new Date().toISOString()
    });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: status,
        statusHistory: statusHistory
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({ success: true, data: { order } });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }
    next(error);
  }
};

// User Management
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const where = role ? { role } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Remove password from update if present (should use separate password change endpoint)
    const { password, ...updateData } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }
    next(error);
  }
};

// Category Management
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    // Generate slug from name if not provided
    const slug = req.body.slug || req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const categoryData = {
      ...req.body,
      slug,
      type: req.body.type || 'book',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      sortOrder: req.body.sortOrder !== undefined ? parseInt(req.body.sortOrder) : 0
    };

    const category = await prisma.category.create({
      data: categoryData
    });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json({ success: true, data: { category } });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' }
      });
    }
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' }
      });
    }
    next(error);
  }
};

// Analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    // Get all completed orders and group by month manually
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'completed' },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Format sales data by month
    const monthlySales = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlySales[month]) {
        monthlySales[month] = {
          _id: month,
          totalSales: 0,
          orderCount: 0
        };
      }
      monthlySales[month].totalSales += Number(order.total || 0);
      monthlySales[month].orderCount += 1;
    });

    const formattedSalesData = Object.values(monthlySales).sort((a, b) => a._id.localeCompare(b._id));

    // Top products
    const topProducts = await prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        soldCount: true,
        price: true
      }
    });

    res.json({
      success: true,
      data: {
        salesData: formattedSalesData,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Customization Management
exports.getCustomizations = async (req, res, next) => {
  try {
    const customizations = await prisma.customization.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { customizations } });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomizationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const customization = await prisma.customization.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status,
        notes: note
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json({ success: true, data: { customization } });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Customization not found' }
      });
    }
    next(error);
  }
};

// Notification Management (Admin)
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message, link, data, sendToAll } = req.body;

    if (sendToAll) {
      const users = await prisma.user.findMany({
        where: { role: 'customer' },
        select: { id: true }
      });

      // Using createMany for efficiency if supported by the provider, 
      // but notification has many relations or unique constraints might be tricky.
      // For MySQL, we can use createMany.
      const notificationsData = users.map(user => ({
        userId: user.id,
        type,
        title,
        message,
        link,
        data: data || {}
      }));

      const result = await prisma.notification.createMany({
        data: notificationsData
      });

      return res.status(201).json({
        success: true,
        data: { count: result.count },
        message: `Notification sent to ${result.count} users`
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type,
        title,
        message,
        link,
        data: data || {}
      }
    });

    res.status(201).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.notification.count();

    res.json({
      success: true,
      data: {
        notifications,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await prisma.notification.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' }
      });
    }
    next(error);
  }
};

