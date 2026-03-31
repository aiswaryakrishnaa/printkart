const prisma = require('../config/prisma');
const { Product } = require('../models'); // Keep access to Mongoose model if needed for mixed architecture, but we will use Prisma for Category.

// Get All Categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = { isActive: true };

    if (type) {
      where.type = type;
    }

    // Prisma query
    const categories = await prisma.category.findMany({
      where,
      include: {
        parentCategory: {
          select: { name: true, slug: true }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Category
exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) || 0 }, // Ensure ID is integer if using Int ID, or modify if String
      include: {
        parentCategory: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// Get Category Products
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if we should use Prisma or Mongoose for Products. 
    // Assuming Products are ALSO in SQL based on previous context (product.controller.js uses Prisma),
    // but the original code imported { Product } from models (Mongoose).
    // Start with Prisma migration for consistency if the Product model is indeed Prisma-based.
    // However, looking at the error `Category.find is not a function`, it strongly suggests `Category` was expected to be a Mongoose model but likely isn't initialized or we are in a Prisma environment.
    // Let's stick to Prisma for consistency with the rest of this file's fix.

    const products = await prisma.product.findMany({
      where: {
        categoryId: parseInt(id),
        status: 'active'
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.product.count({
      where: {
        categoryId: parseInt(id),
        status: 'active'
      }
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

